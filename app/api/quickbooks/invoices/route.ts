import { NextRequest, NextResponse } from "next/server";
import { getValidTokens } from "@/app/api/quickbooks/utils/tokens";

export async function GET(req: NextRequest) {
  const realmId = req.nextUrl.searchParams.get("realmId");
  if (!realmId) {
    return NextResponse.json({ error: "realmId required" }, { status: 400 });
  }

  try {
    const accessToken = await getValidTokens(realmId);

    const isProduction = process.env.QB_ENVIRONMENT === "production";
    const baseUrl = isProduction
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

    // Fetch paid invoices (balance zero) updated after 2024-01-01
    const query =
      "SELECT * FROM Invoice WHERE Balance = '0' AND Metadata.LastUpdatedTime > '2024-01-01'";

    const response = await fetch(
      `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}&minorversion=70`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `QuickBooks query failed: ${text}` }, { status: 502 });
    }

    const data = await response.json();
    const paidInvoices = data.QueryResponse?.Invoice || [];

    const readyForPayout = paidInvoices.map((inv: any) => ({
      loadNumber: inv.DocNumber,
      amount: inv.TotalAmt,
      customer: inv.CustomerRef?.name,
    }));

    return NextResponse.json({ message: "Scan complete", readyForPayout });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Unexpected error" }, { status: 500 });
  }
}
