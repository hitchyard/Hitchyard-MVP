/**
 * POST /api/vetting/shipper-credit-check
 * 
 * HITCHYARD SHIPPER VETTING PROTOCOL ENDPOINT
 * Ruler Archetype: Gatekeeper of Imperial Authority
 * 
 * Triggers vetting protocol for shipper access control.
 * Protects the Imperial Network from bad debt.
 * 
 * Request body:
 * {
 *   shipper_id: string,
 *   force_recheck?: boolean
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   decision_id: string,
 *   vetting_status: 'GRANTED' | 'DENIED' | 'CONDITIONAL',
 *   access_tier: string,
 *   trust_score: number,
 *   protocol_statement: string,
 *   permissions: object,
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { shipperVettingAgent } from '@/app/lib/shipperVettingAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shipper_id, force_recheck = false } = body;

    // Validate input
    if (!shipper_id) {
      return NextResponse.json(
        { error: 'shipper_id is required' },
        { status: 400 }
      );
    }

    console.log(`[VETTING_API] POST /api/vetting/shipper-credit-check`);
    console.log(`[VETTING_API] Shipper ID: ${shipper_id}`);
    console.log(`[VETTING_API] Force Recheck: ${force_recheck}`);

    // Execute vetting protocol
    const decision = await shipperVettingAgent.runVettingProtocol(shipper_id);

    // Return decision response
    return NextResponse.json(
      {
        success: true,
        decision_id: decision.decision_id,
        vetting_status: decision.vetting_status,
        access_tier: decision.access_tier,
        trust_score: decision.trust_score,
        metrics: {
          credit_score: decision.metrics.credit_score,
          dtp_days: decision.metrics.dtp_days,
          on_time_payment_rate: decision.metrics.on_time_payment_rate,
          payment_disputes: decision.metrics.payment_disputes_count,
        },
        protocol_statement: decision.protocol_statement,
        permissions: decision.permissions,
        monitoring: decision.monitoring,
        valid_until: decision.valid_until,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[VETTING_API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Vetting protocol failed',
      },
      { status: 500 }
    );
  }
}
