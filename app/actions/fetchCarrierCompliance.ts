// Carrier Compliance: FMCSA allowedToOperate check
// Uses FMCSA QC API via docket (MC) number

"use server";

interface ComplianceResult {
  success: boolean;
  data?: {
    mcNumber: string;
    allowedToOperate: "Y" | "N" | "UNKNOWN";
    carrierName?: string;
    raw?: any;
  };
  error?: string;
}

export async function fetchCarrierCompliance(mcNumber: string): Promise<ComplianceResult> {
  try {
    const webKey = process.env.FMCSA_WEB_KEY;
    if (!webKey) {
      return { success: false, error: "FMCSA_WEB_KEY not configured" };
    }

    const url = `https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number/${encodeURIComponent(
      mcNumber
    )}?webKey=${webKey}`;

    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `FMCSA lookup failed: ${text}` };
    }

    const json = await res.json();

    // The FMCSA response may contain carrier arrays under different keys; try common shapes
    const carrier =
      (json?.content && json.content?.carrier) ||
      (json?.carriers && Array.isArray(json.carriers) && json.carriers[0]) ||
      (Array.isArray(json?.content) && json.content[0]) ||
      json?.carrier ||
      null;

    const allowed = (carrier?.allowedToOperate || carrier?.allowed_to_operate || "UNKNOWN") as
      | "Y"
      | "N"
      | "UNKNOWN";

    const legalName = carrier?.legalName || carrier?.legal_name || carrier?.dbaName || carrier?.dba_name;

    return {
      success: true,
      data: {
        mcNumber,
        allowedToOperate: allowed,
        carrierName: legalName,
        raw: json,
      },
    };
  } catch (error: any) {
    return { success: false, error: error?.message || "Unexpected FMCSA error" };
  }
}
