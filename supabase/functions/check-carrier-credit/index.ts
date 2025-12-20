// Supabase Edge Function: check-carrier-credit
// Trigger: Called when carrier registers
// Purpose: Fetch Ansonia Credit API and update vetting status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const ANSONIA_API_URL = Deno.env.get('ANSONIA_API_URL') || 'https://api.ansoniadata.com/v1'
const ANSONIA_API_KEY = Deno.env.get('ANSONIA_API_KEY')
const ANSONIA_ACCOUNT_ID = Deno.env.get('ANSONIA_ACCOUNT_ID')
const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY')
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID')
const AIRTABLE_TABLE_NAME = Deno.env.get('AIRTABLE_TABLE_NAME') || 'Manual Review Queue'

interface AnsoniaCreditResponse {
  success: boolean
  global_credit_score: number // 0-100
  days_to_pay: number // DTP average
  company_name?: string
  mc_number?: string
  dot_number?: string
  error?: string
}

interface VettingDecision {
  vetting_status: 'ACTIVE' | 'PENDING' | 'REJECTED'
  trust_score: number
  requires_manual_review: boolean
  rejection_reason: string | null
}

/**
 * Determine vetting status based on Global Credit Score
 * 
 * @param score - Ansonia Global Credit Score (0-100)
 * @returns Vetting decision with status, trust_score, and review flag
 */
function determineVettingStatus(score: number): VettingDecision {
  if (score >= 85 && score <= 100) {
    return {
      vetting_status: 'ACTIVE',
      trust_score: score,
      requires_manual_review: false,
      rejection_reason: null,
    }
  } else if (score >= 70 && score < 85) {
    return {
      vetting_status: 'PENDING',
      trust_score: score,
      requires_manual_review: true,
      rejection_reason: null,
    }
  } else {
    return {
      vetting_status: 'REJECTED',
      trust_score: score,
      requires_manual_review: false,
      rejection_reason: `IMPERIAL STANDARD NOT MET. Credit score ${score} is below acceptable threshold.`,
    }
  }
}

/**
 * Send manual review notification to Airtable
 * 
 * @param userId - Supabase user ID
 * @param creditScore - Ansonia credit score
 * @param dtpDays - Days to Pay
 * @param mcNumber - MC number
 * @param dotNumber - DOT number
 */
async function notifyAirtableManualReview(
  userId: string,
  creditScore: number,
  dtpDays: number,
  mcNumber: string | null,
  dotNumber: string | null,
  companyName: string | null
) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn('[AIRTABLE] API credentials missing, skipping manual review notification')
    return
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'User ID': userId,
            'Company Name': companyName || 'Unknown',
            'MC Number': mcNumber || 'N/A',
            'DOT Number': dotNumber || 'N/A',
            'Credit Score': creditScore,
            'Days to Pay': dtpDays,
            'Status': 'Pending Review',
            'Review Reason': `Borderline credit score (${creditScore}). Grit Club manual review required.`,
            'Created At': new Date().toISOString(),
          },
        }),
      }
    )

    if (!response.ok) {
      console.error('[AIRTABLE] Failed to create manual review record:', response.status)
    } else {
      console.log('[AIRTABLE] ✓ Manual review record created for user', userId)
    }
  } catch (error) {
    console.error('[AIRTABLE] Error creating manual review record:', error)
  }
}

serve(async (req) => {
  try {
    // Parse request body
    const { user_id, mc_number, dot_number, company_name } = await req.json()

    if (!user_id || (!mc_number && !dot_number)) {
      return new Response(
        JSON.stringify({ error: 'user_id and either mc_number or dot_number are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[ANSONIA] Initiating credit check for user ${user_id} (MC: ${mc_number}, DOT: ${dot_number})`)

    // --- STEP 1: Fetch from Ansonia API ---
    let ansoniaData: AnsoniaCreditResponse

    if (!ANSONIA_API_KEY || !ANSONIA_ACCOUNT_ID) {
      console.warn('[ANSONIA] API credentials missing, using default fallback score')
      ansoniaData = {
        success: false,
        global_credit_score: 50, // Conservative default
        days_to_pay: 45,
        error: 'Ansonia credentials not configured',
      }
    } else {
      try {
        const params = new URLSearchParams()
        if (mc_number) params.append('mc_number', mc_number)
        if (dot_number) params.append('dot_number', dot_number)

        const response = await fetch(`${ANSONIA_API_URL}/company/credit-check?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ANSONIA_API_KEY}`,
            'X-Account-ID': ANSONIA_ACCOUNT_ID,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Ansonia API returned ${response.status}`)
        }

        const data = await response.json()
        ansoniaData = {
          success: true,
          global_credit_score: data.global_credit_score || data.credit_score || 50,
          days_to_pay: data.days_to_pay || data.dtp_days || 45,
          company_name: data.company_name,
          mc_number: data.mc_number,
          dot_number: data.dot_number,
        }
      } catch (error) {
        console.error('[ANSONIA] API fetch error:', error)
        ansoniaData = {
          success: false,
          global_credit_score: 50,
          days_to_pay: 45,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    const creditScore = ansoniaData.global_credit_score
    const dtpDays = ansoniaData.days_to_pay

    // --- STEP 2: Determine vetting status ---
    const decision = determineVettingStatus(creditScore)

    // --- STEP 3: Update Supabase user_profiles ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ansonia_credit_score: creditScore,
        ansonia_dtp_days: dtpDays,
        ansonia_last_checked: new Date().toISOString(),
        trust_score: decision.trust_score,
        vetting_status: decision.vetting_status,
        vetting_review_flag: decision.requires_manual_review ? 'GRIT_CLUB_MANUAL_REVIEW' : null,
        vetting_review_reason: decision.rejection_reason,
      })
      .eq('user_id', user_id)

    if (updateError) {
      console.error(`[ANSONIA] Update failed for ${user_id}:`, updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update vetting status', details: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(
      `[ANSONIA] ✓ Credit check complete for ${user_id}: score=${creditScore}, status=${decision.vetting_status}`
    )

    // --- STEP 4: Send to Airtable if manual review required ---
    if (decision.requires_manual_review) {
      await notifyAirtableManualReview(
        user_id,
        creditScore,
        dtpDays,
        mc_number,
        dot_number,
        company_name
      )
    }

    // --- STEP 5: Return response ---
    return new Response(
      JSON.stringify({
        success: true,
        vetting_status: decision.vetting_status,
        trust_score: decision.trust_score,
        credit_score: creditScore,
        dtp_days: dtpDays,
        requires_manual_review: decision.requires_manual_review,
        rejection_reason: decision.rejection_reason,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[ANSONIA] Unhandled error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
