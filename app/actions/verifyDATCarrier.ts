"use server";

// DAT verification helper with sandbox-friendly fallback.

import { getDATAccessToken } from "@/lib/datAuth";

type DATVerificationStatus = "SUCCESS" | "WARNING" | "PENDING_MANUAL" | "ERROR";

type DATSource = "DAT_API" | "DAT_FREE_APP" | "ERROR";

interface DATVerificationResult {
  verified: DATVerificationStatus;
  note?: string;
  daysToPay?: number;
  trustRating?: number;
  source: DATSource;
}

export async function verifyDATCarrier(mcNumber: string): Promise<DATVerificationResult> {
  try {
    const envToken = process.env.DAT_API_TOKEN;
    const ephemeralToken = await getDATAccessToken();
    const token = envToken || ephemeralToken;

    if (!token) {
      console.log(`[DAT MANUAL CHECK]: Open DAT One app and search MC# ${mcNumber}`);
      return {
        verified: "PENDING_MANUAL",
        note: "API token missing. Please verify credit/reviews manually in DAT One app.",
        source: "DAT_FREE_APP",
      };
    }

    const res = await fetch(`https://api.dat.com/carrier-profile/v1/${encodeURIComponent(mcNumber)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`DAT API ${res.status}`);
    const datData = await res.json();

    const creditScore = typeof datData?.creditScore === "number" ? datData.creditScore : Number(datData?.creditScore ?? 0);
    const daysToPay = typeof datData?.daysToPay === "number" ? datData.daysToPay : undefined;
    const trustRating = typeof datData?.brokerReviewRating === "number" ? datData.brokerReviewRating : undefined;

    return {
      verified: creditScore > 80 ? "SUCCESS" : "WARNING",
      daysToPay,
      trustRating,
      source: "DAT_API",
    };
  } catch (error) {
    console.error("DAT verification failed", error);
    return { verified: "ERROR", note: "DAT verification failed.", source: "ERROR" };
  }
}
