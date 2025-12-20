import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchAnsoniaCreditData, determineVettingStatus } from '@/app/lib/ansoniaService';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * POST /api/vetting/ansonia-credit-check
 * 
 * Triggers Ansonia credit check for a newly registered carrier.
 * Called after registration completes.
 * 
 * Request body:
 * {
 *   user_id: string,
 *   ein: string,
 *   dot_number: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   vetting_status: 'ACTIVE' | 'PENDING',
 *   trust_score: number,
 *   credit_score: number,
 *   dtp_days: number,
 *   review_flag: string | null,
 *   review_reason: string | null
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { user_id, ein, dot_number } = await req.json();

    if (!user_id || (!ein && !dot_number)) {
      return NextResponse.json(
        { error: 'user_id and either ein or dot_number are required' },
        { status: 400 }
      );
    }

    console.log(`[ANSONIA] Initiating credit check for user ${user_id} (EIN: ${ein}, DOT: ${dot_number})`);

    // --- STEP 1: Fetch from Ansonia API ---
    const ansoniaData = await fetchAnsoniaCreditData(ein, dot_number);

    if (!ansoniaData.success) {
      console.warn(`[ANSONIA] Credit check failed for ${user_id}: ${ansoniaData.error}`);
    }

    const creditScore = ansoniaData.credit_score;
    const dtpDays = ansoniaData.dtp_days;

    // --- STEP 2: Determine vetting status based on credit score ---
    const { vetting_status, review_flag, review_reason } = determineVettingStatus(creditScore);

    // Convert credit score to trust_score (can be same, or you can add additional weighting)
    const trust_score = creditScore;

    // --- STEP 3: Update user_profiles with results ---
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ansonia_credit_score: creditScore,
        ansonia_dtp_days: dtpDays,
        ansonia_last_checked: new Date().toISOString(),
        trust_score,
        vetting_status,
        vetting_review_flag: review_flag,
        vetting_review_reason: review_reason,
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error(`[ANSONIA] Update failed for ${user_id}:`, updateError);
      return NextResponse.json(
        { error: 'Failed to update vetting status', details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`[ANSONIA] ✓ Credit check complete for ${user_id}: score=${creditScore}, status=${vetting_status}, review_flag=${review_flag}`);

    return NextResponse.json(
      {
        success: true,
        vetting_status,
        trust_score,
        credit_score: creditScore,
        dtp_days: dtpDays,
        review_flag,
        review_reason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ANSONIA] Unhandled error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
