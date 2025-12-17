// =================================================================
// TYPESCRIPT INTERFACE: RATE-LOCKING AGENT OUTPUT
// =================================================================
// Purpose: Type-safe data structure for Rate-Locking Agent output
// Used by: Backend API endpoints receiving Dify workflow results

/**
 * Contract Terms Metadata
 * Standard terms applied to all rate-locked contracts
 */
export interface ContractTerms {
  payment_terms: "Net 30";
  currency: "USD";
  fuel_surcharge_included: boolean;
  rate_valid_hours: number; // Default: 24
}

/**
 * Trust Classification Bands
 * Derived from trust score ranges
 */
export type TrustClassification = "ELITE" | "VERIFIED" | "ACCEPTABLE" | "REJECTED";

/**
 * Adjustment Factor Values
 * Trust-based pricing adjustments applied to base rate
 */
export type AdjustmentFactor = 0.02 | 0.00 | -0.02 | null;

/**
 * Rate-Locking Agent Output
 * Complete pricing decision data from Dify LLM Agent
 * 
 * @property locked_rate - Final contract price in USD (null if rejected)
 * @property base_rate - Original market rate before adjustments
 * @property adjustment_factor - Trust-based adjustment (+2%, 0%, -2%)
 * @property adjustment_amount - Dollar difference (locked - base)
 * @property trust_score - Carrier trust score from Vetting Agent (80-100)
 * @property trust_classification - Trust band (ELITE/VERIFIED/ACCEPTABLE/REJECTED)
 * @property justification - Authoritative explanation of pricing decision
 * @property rate_lock_timestamp - ISO 8601 timestamp when rate was locked
 * @property rate_lock_expiration - ISO 8601 timestamp when rate expires (24h)
 * @property contract_terms - Standard contract metadata
 * 
 * @example Success Case (Elite Carrier)
 * ```typescript
 * {
 *   locked_rate: 765.00,
 *   base_rate: 750.00,
 *   adjustment_factor: 0.02,
 *   adjustment_amount: 15.00,
 *   trust_score: 97,
 *   trust_classification: "ELITE",
 *   justification: "Elite carrier (Trust Score 97) receives +2% premium...",
 *   rate_lock_timestamp: "2025-12-16T10:00:00Z",
 *   rate_lock_expiration: "2025-12-17T10:00:00Z",
 *   contract_terms: {
 *     payment_terms: "Net 30",
 *     currency: "USD",
 *     fuel_surcharge_included: true,
 *     rate_valid_hours: 24
 *   }
 * }
 * ```
 * 
 * @example Rejection Case (Low Trust)
 * ```typescript
 * {
 *   locked_rate: null,
 *   base_rate: 750.00,
 *   adjustment_factor: null,
 *   adjustment_amount: null,
 *   trust_score: 75,
 *   trust_classification: "REJECTED",
 *   justification: "Carrier does not meet minimum trust threshold...",
 *   rate_lock_timestamp: null,
 *   rate_lock_expiration: null,
 *   contract_terms: null
 * }
 * ```
 */
export interface RateLockingOutput {
  locked_rate: number | null;
  base_rate: number;
  adjustment_factor: AdjustmentFactor;
  adjustment_amount: number | null;
  trust_score: number;
  trust_classification: TrustClassification;
  justification: string;
  rate_lock_timestamp: string | null; // ISO 8601 format
  rate_lock_expiration: string | null; // ISO 8601 format
  contract_terms: ContractTerms | null;
}

/**
 * Input Data for Rate-Locking Agent
 * Data sent to Dify workflow from Hitchyard backend
 */
export interface RateLockingInput {
  load_id: string;
  base_rate: number;
  trust_score: number;
  carrier_id: string;
  shipper_id: string;
  route: {
    origin: string;
    destination: string;
    distance_miles: number;
  };
  load_details: {
    commodity_type: string;
    weight_lbs: number;
    equipment_type: string;
  };
}

/**
 * Rate Lock Database Record
 * Structure for storing rate locks in Supabase
 */
export interface RateLockRecord {
  id: string; // UUID
  load_id: string;
  carrier_id: string;
  shipper_id: string;
  locked_rate: number;
  base_rate: number;
  adjustment_factor: number;
  adjustment_amount: number;
  trust_score: number;
  trust_classification: TrustClassification;
  justification: string;
  rate_lock_timestamp: string;
  rate_lock_expiration: string;
  contract_terms: ContractTerms;
  status: "ACTIVE" | "EXPIRED" | "EXECUTED" | "CANCELLED";
  created_at: string;
  updated_at: string;
}

/**
 * Type Guard: Check if rate lock is valid (not null)
 */
export function isValidRateLock(output: RateLockingOutput): output is RateLockingOutput & {
  locked_rate: number;
  adjustment_factor: Exclude<AdjustmentFactor, null>;
  adjustment_amount: number;
  rate_lock_timestamp: string;
  rate_lock_expiration: string;
  contract_terms: ContractTerms;
} {
  return (
    output.locked_rate !== null &&
    output.adjustment_factor !== null &&
    output.rate_lock_timestamp !== null &&
    output.rate_lock_expiration !== null &&
    output.contract_terms !== null &&
    output.trust_classification !== "REJECTED"
  );
}

/**
 * Type Guard: Check if rate lock is rejected
 */
export function isRejectedRateLock(output: RateLockingOutput): boolean {
  return (
    output.trust_classification === "REJECTED" ||
    output.locked_rate === null
  );
}

/**
 * Calculate adjustment factor from trust score
 * Pure function for testing and validation
 */
export function calculateAdjustmentFactor(trustScore: number): AdjustmentFactor {
  if (trustScore < 80) return null; // Rejected
  if (trustScore >= 95) return 0.02; // +2% Elite
  if (trustScore >= 85) return 0.00; // 0% Verified
  return -0.02; // -2% Acceptable
}

/**
 * Calculate locked rate from base rate and trust score
 * Pure function for testing and validation
 */
export function calculateLockedRate(baseRate: number, trustScore: number): number | null {
  const adjustmentFactor = calculateAdjustmentFactor(trustScore);
  if (adjustmentFactor === null) return null;
  
  const lockedRate = baseRate * (1 + adjustmentFactor);
  return Math.round(lockedRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get trust classification from trust score
 * Pure function for testing and validation
 */
export function getTrustClassification(trustScore: number): TrustClassification {
  if (trustScore < 80) return "REJECTED";
  if (trustScore >= 95) return "ELITE";
  if (trustScore >= 85) return "VERIFIED";
  return "ACCEPTABLE";
}

/**
 * Validate RateLockingOutput structure
 * Returns validation errors or null if valid
 */
export function validateRateLockingOutput(
  output: any
): string[] | null {
  const errors: string[] = [];

  // Required fields
  if (typeof output.base_rate !== "number" || output.base_rate < 0) {
    errors.push("base_rate must be a non-negative number");
  }
  if (typeof output.trust_score !== "number" || output.trust_score < 0 || output.trust_score > 100) {
    errors.push("trust_score must be between 0 and 100");
  }
  if (!["ELITE", "VERIFIED", "ACCEPTABLE", "REJECTED"].includes(output.trust_classification)) {
    errors.push("trust_classification must be ELITE, VERIFIED, ACCEPTABLE, or REJECTED");
  }
  if (typeof output.justification !== "string" || output.justification.length === 0) {
    errors.push("justification must be a non-empty string");
  }

  // Conditional validation for non-rejected cases
  if (output.trust_classification !== "REJECTED") {
    if (typeof output.locked_rate !== "number" || output.locked_rate < 0) {
      errors.push("locked_rate must be a non-negative number for non-rejected cases");
    }
    if (![0.02, 0.00, -0.02].includes(output.adjustment_factor)) {
      errors.push("adjustment_factor must be 0.02, 0.00, or -0.02 for non-rejected cases");
    }
    if (typeof output.rate_lock_timestamp !== "string") {
      errors.push("rate_lock_timestamp must be a string for non-rejected cases");
    }
    if (typeof output.rate_lock_expiration !== "string") {
      errors.push("rate_lock_expiration must be a string for non-rejected cases");
    }
  }

  return errors.length > 0 ? errors : null;
}
