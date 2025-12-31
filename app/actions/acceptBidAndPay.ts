// QUICKBOOKS + MELIO SETTLEMENT SERVER ACTION
// Creates QuickBooks Invoice (Shipper, Net 7) and Bill (Carrier, Net 0 via ACH)

"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getValidTokens } from "@/app/api/quickbooks/utils/tokens";

interface AcceptBidAndPayInput {
  loadId: string;
  bidId: string;
  winningBidAmount: number;
}

interface AcceptBidAndPayResult {
  success: boolean;
  message?: string;
  error?: string;
  transactionId?: string;
}

export async function acceptBidAndPay({
  loadId,
  bidId,
  winningBidAmount,
}: AcceptBidAndPayInput): Promise<AcceptBidAndPayResult> {
  try {
    const cookieStore = cookies();

    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Cookie setting can fail in Server Components
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Cookie removal can fail in Server Components
            }
          },
        },
      }
    );

    // STEP 1: Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in and try again.",
      };
    }

    // STEP 2: Verify user is a shipper
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      return {
        success: false,
        error: "Unable to verify user profile.",
      };
    }

    if (profileData.role !== "shipper") {
      return {
        success: false,
        error: "Only shippers can accept bids. Access denied.",
      };
    }

    // STEP 3: Verify load ownership
    const { data: loadData, error: loadError } = await supabase
      .from("loads")
      .select("id, user_id, status")
      .eq("id", loadId)
      .single();

    if (loadError || !loadData) {
      return {
        success: false,
        error: "Load not found.",
      };
    }

    if (loadData.user_id !== user.id) {
      return {
        success: false,
        error: "You do not have permission to modify this load.",
      };
    }

    // STEP 4: Verify bid exists
    const { data: bidData, error: bidError } = await supabase
      .from("bids")
      .select("id, load_id, carrier_id, bid_amount, status")
      .eq("id", bidId)
      .single();

    if (bidError || !bidData) {
      return {
        success: false,
        error: "Bid not found.",
      };
    }

    if (bidData.load_id !== loadId) {
      return {
        success: false,
        error: "Bid does not belong to this load.",
      };
    }

    // STEP 5: QuickBooks API - Create Invoice (Shipper) + Bill (Carrier)
    const realmId = process.env.QB_REALM_ID;
    if (!realmId) {
      return { success: false, error: "QuickBooks realm ID not configured." };
    }

    const accessToken = await getValidTokens(realmId);
    const isProduction = process.env.QB_ENVIRONMENT === "production";
    const qbBaseUrl = isProduction
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

    // Resolve Customer (Shipper) and Vendor (Carrier) references
    const defaultCustomerRef = process.env.QB_DEFAULT_CUSTOMER_ID; // fallback ID
    const defaultVendorRef = process.env.QB_DEFAULT_VENDOR_ID; // fallback ID
    if (!defaultCustomerRef || !defaultVendorRef) {
      console.warn("QB_DEFAULT_CUSTOMER_ID or QB_DEFAULT_VENDOR_ID missing. Using defaults may fail.");
    }

    // Compute Net 7 DueDate
    const today = new Date();
    const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Build Invoice for Shipper (Net 7)
    const invoiceBody = {
      Invoice: {
        DocNumber: loadId,
        PrivateNote: `Freight Charges for Load ${loadId}`,
        CustomerRef: { value: defaultCustomerRef },
        Line: [
          {
            DetailType: "SalesItemLineDetail",
            Amount: winningBidAmount,
            Description: "Freight Charges",
            SalesItemLineDetail: {
              ItemRef: { value: process.env.QB_FREIGHT_ITEM_ID || "1" },
              TaxCodeRef: { value: "NON" }, // Non-taxable
            },
          },
        ],
        TxnDate: new Date().toISOString().split("T")[0],
        DueDate: dueDate, // Net 7
        SalesTermRef: { value: process.env.QB_NET7_TERM_ID || "3" },
        TotalAmt: winningBidAmount,
      },
    };

    // Build Bill for Carrier (Net 0 / due today)
    const billBody = {
      Bill: {
        PrivateNote: `Carrier Settlement for Load ${loadId}`,
        VendorRef: { value: defaultVendorRef },
        Line: [
          {
            DetailType: "AccountBasedExpenseLineDetail",
            Amount: winningBidAmount,
            Description: "Carrier Settlement - Freight",
            AccountBasedExpenseLineDetail: {
              AccountRef: { value: process.env.QB_CARRIER_EXPENSE_ACCOUNT_ID || "7" },
              TaxCodeRef: { value: "NON" },
            },
          },
        ],
        TxnDate: new Date().toISOString().split("T")[0],
        DueDate: new Date().toISOString().split("T")[0], // Net 0
        DocNumber: loadId,
      },
    };

    // POST Invoice
    const invRes = await fetch(
      `${qbBaseUrl}/v3/company/${realmId}/invoice?minorversion=70`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceBody),
      }
    );

    if (!invRes.ok) {
      const text = await invRes.text();
      console.error("QuickBooks Invoice error:", text);
      return { success: false, error: `Invoice creation failed: ${text}` };
    }

    const invData = await invRes.json();
    const qbInvoiceId = invData?.Invoice?.Id;

    // POST Bill
    const billRes = await fetch(
      `${qbBaseUrl}/v3/company/${realmId}/bill?minorversion=70`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billBody),
      }
    );

    if (!billRes.ok) {
      const text = await billRes.text();
      console.error("QuickBooks Bill error:", text);
      return { success: false, error: `Bill creation failed: ${text}` };
    }

    const billData = await billRes.json();
    const qbBillId = billData?.Bill?.Id;

    // STEP 6: Update Load Status in Database
    const { error: updateLoadError } = await supabase
      .from("loads")
      .update({
        status: "AUTHORIZED",
        assigned_carrier_id: bidData.carrier_id,
        qb_invoice_id: qbInvoiceId,
        qb_bill_id: qbBillId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loadId);

    if (updateLoadError) {
      console.error("Database update error:", updateLoadError);
      return {
        success: false,
        error: "Payment authorized but database update failed. Please contact support.",
      };
    }

    // STEP 8: Update Bid Status
    const { error: updateBidError } = await supabase
      .from("bids")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bidId);

    if (updateBidError) {
      console.error("Bid update error:", updateBidError);
    }

    // STEP 9: Reject Other Bids
    const { error: rejectOthersError } = await supabase
      .from("bids")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("load_id", loadId)
      .neq("id", bidId);

    if (rejectOthersError) {
      console.error("Other bids rejection error:", rejectOthersError);
    }

    // STEP 7: Return Success
    return {
      success: true,
      message: "Invoice + Bill created. Load Assigned.",
      transactionId: qbInvoiceId,
    };

  } catch (error) {
    console.error("Accept Bid and Pay Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}
