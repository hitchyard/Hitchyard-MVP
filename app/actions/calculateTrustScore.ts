// Hitchyard Trust Score calculation based on Equifax-derived signals
// Keeps inputs flexible (any shape) to avoid runtime crashes on missing fields.

export async function calculateHitchyardScore(equifaxData: any) {
  let score = 100;

  // 1. Secretary of State (SOS) status
  if (equifaxData?.sosStatus === "INACTIVE") score -= 50;

  // 2. Liens (PublicRecordsSummary)
  if (typeof equifaxData?.totalLienAmount === "number" && equifaxData.totalLienAmount > 1000) {
    score -= 30;
  }

  // 3. Payment Index (core metric)
  if (typeof equifaxData?.paymentIndex === "number" && equifaxData.paymentIndex < 70) {
    score -= (70 - equifaxData.paymentIndex);
  }

  return Math.max(0, score);
}
