// PAYCARGO PAYMENT AUTHORIZATION SERVER ACTION
// Secure server-side payment processing for bid acceptance

"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

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

    // STEP 5: PayCargo API - Initiate Transaction
    const paycargoApiKey = process.env.PAYCARGO_API_KEY;
    const paycargoBaseUrl = process.env.PAYCARGO_BASE_URL || "https://api.paycargo.com/v1";

    if (!paycargoApiKey) {
      return {
        success: false,
        error: "Payment service configuration error. Please contact support.",
      };
    }

    let paycargoTransactionId: string;

    try {
      const paycargoResponse = await fetch(`${paycargoBaseUrl}/transactions/initiate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${paycargoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: winningBidAmount,
          currency: "USD",
          loadId: loadId,
          bidderId: bidData.carrier_id,
          shipperId: user.id,
          description: `Payment authorization for Load ${loadId}`,
          metadata: {
            platform: "hitchyard",
            loadId: loadId,
            bidId: bidId,
          },
        }),
      });

      // STEP 6: Handle PayCargo Response
      if (!paycargoResponse.ok) {
        const errorData = await paycargoResponse.json().catch(() => ({}));
        console.error("PayCargo API Error:", errorData);
        
        return {
          success: false,
          error: `Payment authorization failed: ${errorData.message || "PayCargo service unavailable"}`,
        };
      }

      const paycargoData = await paycargoResponse.json();
      paycargoTransactionId = paycargoData.transactionId || paycargoData.id || `PC-${Date.now()}`;

      // Verify transaction was authorized
      if (paycargoData.status !== "AUTHORIZED" && paycargoData.status !== "SUCCESS") {
        return {
          success: false,
          error: `Payment authorization incomplete. Status: ${paycargoData.status}`,
        };
      }

    } catch (paycargoError) {
      console.error("PayCargo Network Error:", paycargoError);
      return {
        success: false,
        error: "Payment service connection failed. Please try again.",
      };
    }

    // STEP 7: Update Load Status in Database
    const { error: updateLoadError } = await supabase
      .from("loads")
      .update({
        status: "AUTHORIZED",
        assigned_carrier_id: bidData.carrier_id,
        paycargo_transaction_id: paycargoTransactionId,
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

    // STEP 10: Return Success
    return {
      success: true,
      message: "Payment Authorized. Load Assigned.",
      transactionId: paycargoTransactionId,
    };

  } catch (error) {
    console.error("Accept Bid and Pay Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}
