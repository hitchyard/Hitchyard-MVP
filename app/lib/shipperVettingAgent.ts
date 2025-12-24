/**
 * SHIPPER VETTING AGENT - TypeScript Implementation
 * Ruler Archetype: Gatekeeper of Imperial Authority
 * 
 * Protects the Hitchyard Imperial Network from bad debt through
 * absolute constraints and commanding vetting protocols.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ShipperProfile {
  shipper_id: string;
  company_name: string;
  mc_number?: string;
  dot_number?: string;
  ein?: string;
  registered_at: string;
}

interface CreditMetrics {
  credit_score: number; // 0-100
  dtp_days: number; // Days to Pay
  on_time_payment_rate: number; // 0-1
  payment_disputes_count: number;
  loads_completed: number;
}

interface VettingDecision {
  decision_id: string;
  shipper_id: string;
  shipper_name: string;
  vetting_status: 'GRANTED' | 'DENIED' | 'CONDITIONAL';
  access_tier: 'TIER_0_PROVISIONAL' | 'TIER_1_ELITE' | 'TIER_2_STANDARD';
  metrics: CreditMetrics;
  decision_rules_applied: string[];
  trust_score: number;
  protocol_statement: string;
  permissions: {
    can_post_loads: boolean;
    can_use_rate_lock: boolean;
    payment_terms_days: number;
    load_posting_limit_daily: number | null;
  };
  monitoring: {
    review_schedule: 'quarterly' | 'monthly' | 'weekly';
    alert_triggers: string[];
    escalation_contact: string;
  };
  valid_until: string;
}

// ============================================================================
// SHIPPER VETTING AGENT CLASS
// ============================================================================

export class ShipperVettingAgent {
  private supabase;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, serviceRoleKey);
  }

  /**
   * PHASE 1: Identify Shipper
   * Query shipper identity and operational records
   */
  private async identifyShipper(
    shipper_id: string
  ): Promise<ShipperProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select(`
        id as shipper_id,
        full_name,
        mc_number,
        dot_number,
        created_at as registered_at
      `)
      .eq('id', shipper_id)
      .single();

    if (error) {
      throw new Error(`[SHIPPER_IDENTIFICATION] Failed to fetch shipper: ${error.message}`);
    }

    return {
      shipper_id: data.shipper_id,
      company_name: data.full_name,
      mc_number: data.mc_number,
      dot_number: data.dot_number,
      registered_at: data.registered_at,
    };
  }

  /**
   * PHASE 2: Fetch Metrics
   * Extract credit score, DTP, payment history
   */
  private async fetchMetrics(shipper_id: string): Promise<CreditMetrics> {
    // Fetch from user_profiles (Ansonia integration)
    const { data: profileData, error: profileError } = await this.supabase
      .from('user_profiles')
      .select(`
        ansonia_credit_score,
        ansonia_dtp_days
      `)
      .eq('id', shipper_id)
      .single();

    if (profileError) {
      throw new Error(`[METRICS_EXTRACTION] Failed to fetch credit data: ${profileError.message}`);
    }

    // Fetch payment history
    const { data: paymentData, error: paymentError } = await this.supabase
      .from('payment_records')
      .select('*')
      .eq('shipper_id', shipper_id);

    if (paymentError) {
      throw new Error(`[METRICS_EXTRACTION] Failed to fetch payment history: ${paymentError.message}`);
    }

    // Calculate metrics
    const loadsCompleted = paymentData?.length || 0;
    const onTimePayments = paymentData?.filter(
      (p: any) => p.days_to_payment <= 30
    ).length || 0;
    const onTimePaymentRate = loadsCompleted > 0 ? onTimePayments / loadsCompleted : 0;
    const disputes = paymentData?.filter(
      (p: any) => p.dispute_status === 'DISPUTED'
    ).length || 0;

    return {
      credit_score: profileData?.ansonia_credit_score || 0,
      dtp_days: profileData?.ansonia_dtp_days || 0,
      on_time_payment_rate: onTimePaymentRate,
      payment_disputes_count: disputes,
      loads_completed: loadsCompleted,
    };
  }

  /**
   * PHASE 3: Apply Absolute Constraints
   * Execute the four immutable laws of vetting
   */
  private evaluateConstraints(
    metrics: CreditMetrics,
    shipper: ShipperProfile
  ): {
    status: 'GRANTED' | 'DENIED' | 'CONDITIONAL';
    tier: 'TIER_0_PROVISIONAL' | 'TIER_1_ELITE' | 'TIER_2_STANDARD';
    rules_triggered: string[];
    trust_score: number;
    protocol_voice: string;
  } {
    const { credit_score, dtp_days, loads_completed } = metrics;
    const registered_days = Math.floor(
      (Date.now() - new Date(shipper.registered_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // RULE 1: AUTOMATIC DENIAL
    if (credit_score < 80 || dtp_days > 40) {
      return {
        status: 'DENIED',
        tier: 'TIER_0_PROVISIONAL',
        rules_triggered: ['rule_1_denial'],
        trust_score: credit_score,
        protocol_voice: `PROTOCOL INITIATED. SHIPPER CREDIT SCORE: ${credit_score}. DTP: ${dtp_days} DAYS. ACCESS DENIED. NETWORK INTEGRITY PRESERVED.`,
      };
    }

    // RULE 4: THIN FILE (No operational history)
    if (loads_completed < 1 || registered_days < 30) {
      return {
        status: 'CONDITIONAL',
        tier: 'TIER_0_PROVISIONAL',
        rules_triggered: ['rule_4_thin_file'],
        trust_score: credit_score,
        protocol_voice: `PROTOCOL INITIATED. SHIPPER FILE INCOMPLETE. INSUFFICIENT OPERATIONAL HISTORY. PREPAYMENT PROTOCOL ACTIVATED.`,
      };
    }

    // RULE 2: GRANT ELITE STATUS
    if (credit_score >= 87 && dtp_days <= 30) {
      return {
        status: 'GRANTED',
        tier: 'TIER_1_ELITE',
        rules_triggered: ['rule_2_elite'],
        trust_score: credit_score,
        protocol_voice: `PROTOCOL INITIATED. SHIPPER CREDIT SCORE: ${credit_score}. DTP: ${dtp_days} DAYS. ELITE STATUS GRANTED. IMMEDIATE ACCESS AUTHORIZED.`,
      };
    }

    // RULE 3: GRANT STANDARD ACCESS (fallback)
    if (credit_score >= 80 && dtp_days <= 40) {
      return {
        status: 'GRANTED',
        tier: 'TIER_2_STANDARD',
        rules_triggered: ['rule_3_standard'],
        trust_score: credit_score,
        protocol_voice: `PROTOCOL INITIATED. SHIPPER CREDIT SCORE: ${credit_score}. DTP: ${dtp_days} DAYS. STANDARD ACCESS GRANTED. TERMS ENFORCED.`,
      };
    }

    // Fallback (should not reach here)
    throw new Error('[CONSTRAINTS] Evaluation logic error: no rule matched');
  }

  /**
   * PHASE 4: Generate Vetting Decision
   * Output structured decision with commanding voice
   */
  private generateVettingDecision(
    shipper: ShipperProfile,
    metrics: CreditMetrics,
    evaluation: {
      status: 'GRANTED' | 'DENIED' | 'CONDITIONAL';
      tier: 'TIER_0_PROVISIONAL' | 'TIER_1_ELITE' | 'TIER_2_STANDARD';
      rules_triggered: string[];
      trust_score: number;
      protocol_voice: string;
    }
  ): VettingDecision {
    const decision_id = `vetting-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(7)}`;

    // Determine permissions based on tier
    const permissionsMap = {
      TIER_0_PROVISIONAL: {
        can_post_loads: false,
        can_use_rate_lock: false,
        payment_terms_days: 0, // 100% prepayment
        load_posting_limit_daily: null,
      },
      TIER_1_ELITE: {
        can_post_loads: true,
        can_use_rate_lock: true,
        payment_terms_days: 45,
        load_posting_limit_daily: null,
      },
      TIER_2_STANDARD: {
        can_post_loads: true,
        can_use_rate_lock: true,
        payment_terms_days: 30,
        load_posting_limit_daily: null,
      },
    };

    // Determine review schedule based on tier
    const reviewScheduleMap = {
      TIER_0_PROVISIONAL: 'weekly' as const,
      TIER_1_ELITE: 'quarterly' as const,
      TIER_2_STANDARD: 'quarterly' as const,
    };

    const valid_until = new Date();
    valid_until.setFullYear(valid_until.getFullYear() + 1);

    return {
      decision_id,
      shipper_id: shipper.shipper_id,
      shipper_name: shipper.company_name,
      vetting_status: evaluation.status,
      access_tier: evaluation.tier,
      metrics,
      decision_rules_applied: evaluation.rules_triggered,
      trust_score: evaluation.trust_score,
      protocol_statement: evaluation.protocol_voice,
      permissions: permissionsMap[evaluation.tier],
      monitoring: {
        review_schedule: reviewScheduleMap[evaluation.tier],
        alert_triggers: ['credit_drop_5_points', 'payment_missed', 'dispute_filed'],
        escalation_contact: 'vetting@hitchyard.io',
      },
      valid_until: valid_until.toISOString(),
    };
  }

  /**
   * MAIN EXECUTION: Run the complete vetting protocol
   * Returns commanding decision output
   */
  async runVettingProtocol(shipper_id: string): Promise<VettingDecision> {
    console.log(`\n[VETTING_AGENT] ========================================`);
    console.log(`[VETTING_AGENT] PROTOCOL INITIATED`);
    console.log(`[VETTING_AGENT] Shipper ID: ${shipper_id}`);
    console.log(`[VETTING_AGENT] ========================================\n`);

    try {
      // PHASE 1: Identify Shipper
      console.log('[VETTING_AGENT] PHASE 1: IDENTIFYING SHIPPER...');
      const shipper = await this.identifyShipper(shipper_id);
      console.log(`[VETTING_AGENT] ✓ Shipper identified: ${shipper.company_name}`);

      // PHASE 2: Fetch Metrics
      console.log('[VETTING_AGENT] PHASE 2: FETCHING METRICS...');
      const metrics = await this.fetchMetrics(shipper_id);
      console.log(`[VETTING_AGENT] ✓ Metrics extracted:`);
      console.log(`  - Credit Score: ${metrics.credit_score}`);
      console.log(`  - Days to Pay: ${metrics.dtp_days}`);
      console.log(`  - On-Time Rate: ${(metrics.on_time_payment_rate * 100).toFixed(1)}%`);
      console.log(`  - Loads Completed: ${metrics.loads_completed}`);

      // PHASE 3: Apply Constraints
      console.log('[VETTING_AGENT] PHASE 3: APPLYING ABSOLUTE CONSTRAINTS...');
      const evaluation = this.evaluateConstraints(metrics, shipper);
      console.log(`[VETTING_AGENT] ✓ Evaluation complete: ${evaluation.status}`);
      console.log(`[VETTING_AGENT] Rules triggered: ${evaluation.rules_triggered.join(', ')}`);

      // PHASE 4: Generate Decision
      console.log('[VETTING_AGENT] PHASE 4: GENERATING VETTING DECISION...');
      const decision = this.generateVettingDecision(shipper, metrics, evaluation);
      console.log(`[VETTING_AGENT] ✓ Decision generated: ${decision.decision_id}`);

      // PHASE 5: Persist Decision
      console.log('[VETTING_AGENT] PHASE 5: PERSISTING DECISION...');
      const { error: persistError } = await this.supabase
        .from('vetting_decisions')
        .insert({
          decision_id: decision.decision_id,
          shipper_id: decision.shipper_id,
          vetting_status: decision.vetting_status,
          access_tier: decision.access_tier,
          trust_score: decision.trust_score,
          credit_score: metrics.credit_score,
          dtp_days: metrics.dtp_days,
          decision_rules: decision.decision_rules_applied,
          protocol_statement: decision.protocol_statement,
          created_at: new Date().toISOString(),
        });

      if (persistError) {
        console.error(`[VETTING_AGENT] ⚠ Warning: Decision not persisted: ${persistError.message}`);
      } else {
        console.log(`[VETTING_AGENT] ✓ Decision persisted to database`);
      }

      // Update user profile with vetting status
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({
          vetting_status: decision.vetting_status,
          access_tier: decision.access_tier,
          trust_score: decision.trust_score,
        })
        .eq('id', shipper_id);

      if (updateError) {
        console.error(`[VETTING_AGENT] ⚠ Warning: Profile not updated: ${updateError.message}`);
      } else {
        console.log(`[VETTING_AGENT] ✓ User profile updated`);
      }

      console.log(`\n[VETTING_AGENT] PROTOCOL STATEMENT:`);
      console.log(`[VETTING_AGENT] "${decision.protocol_statement}"\n`);
      console.log(`[VETTING_AGENT] ========================================`);
      console.log(`[VETTING_AGENT] PROTOCOL COMPLETE\n`);

      return decision;
    } catch (error) {
      console.error(`[VETTING_AGENT] ✗ PROTOCOL FAILED:`, error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SHIPPER_VETTING_AGENT] Warning: Supabase credentials not found');
}

export const shipperVettingAgent = new ShipperVettingAgent(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
