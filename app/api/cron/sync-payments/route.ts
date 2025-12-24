import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getValidTokens } from "@/app/api/quickbooks/utils/tokens";

console.log("Cron Route Triggered");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase configuration is missing for sync-payments cron.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV !== "development"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: companies, error: dbError } = await supabase
      .from("qb_tokens")
      .select("realm_id");

    if (dbError || !companies) throw new Error("Could not fetch companies from DB");

    const results: Array<{ realmId: string; pending_payouts: any[] }> = [];

    for (const company of companies) {
      const realmId = company.realm_id;
      if (!realmId) continue;

      const accessToken = await getValidTokens(realmId);

      const isProduction = process.env.QB_ENVIRONMENT === "production";
      const baseUrl = isProduction
        ? "https://quickbooks.api.intuit.com"
        : "https://sandbox-quickbooks.api.intuit.com";

      const invQuery =
        "SELECT * FROM Invoice WHERE Balance = '0' AND Metadata.LastUpdatedTime > '2024-01-01'";
      const invRes = await fetch(
        `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(invQuery)}&minorversion=70`,
        {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        }
      );

      if (!invRes.ok) {
        const text = await invRes.text();
        throw new Error(`Invoice query failed for realm ${realmId}: ${text}`);
      }

      const invData = await invRes.json();
      const paidInvoices = invData.QueryResponse?.Invoice || [];

      const billQuery = "SELECT * FROM Bill WHERE Balance > '0'";
      const billRes = await fetch(
        `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(billQuery)}&minorversion=70`,
        {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        }
      );

      if (!billRes.ok) {
        const text = await billRes.text();
        throw new Error(`Bill query failed for realm ${realmId}: ${text}`);
      }

      const billData = await billRes.json();
      const openBills = billData.QueryResponse?.Bill || [];

      const matches = paidInvoices
        .map((inv: any) => {
          const matchingBill = openBills.find((bill: any) => bill.DocNumber === inv.DocNumber);
          if (matchingBill) {
            return {
              loadNumber: inv.DocNumber,
              shipperPaid: inv.TotalAmt,
              carrierOwed: matchingBill.TotalAmt,
              carrierName: matchingBill.VendorRef?.name,
              billId: matchingBill.Id,
            };
          }
          return null;
        })
        .filter(Boolean) as any[];

      results.push({ realmId, pending_payouts: matches });
    }

    return NextResponse.json({ status: "success", data: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 });
  }
}
