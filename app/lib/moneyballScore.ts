// Hitchyard Moneyball Score Calculation
// Inputs: All metrics are scored 1-10 (higher is better)
// R: Driver Reliability, E: Load Completion Efficiency, Y: Relationship Yield, S: AI Match Success

export function calculateMoneyballScore({
  reliability, // R: 1-10
  efficiency,  // E: 1-10
  yieldRate,   // Y: 1-10
  aiMatch      // S: 1-10
}: {
  reliability: number,
  efficiency: number,
  yieldRate: number,
  aiMatch: number
}): number {
  // Weighted sum
  return (
    reliability * 0.4 +
    efficiency * 0.3 +
    yieldRate * 0.2 +
    aiMatch * 0.1
  );
}
