/**
 * Salesforce Sync Endpoint
 * Replaces app/api/sync-airtable/route.ts
 * 
 * Creates Carrier__c records in Salesforce for new carrier registrations.
 * Called asynchronously after registration completes.
 */

import { NextResponse } from 'next/server';
import {
  createCarrier,
  logAgentWorkflow,
} from '@/lib/salesforceClient';

export async function POST(req: Request) {
  try {
    const {
      user_id,
      email,
      company_name,
      zip_code,
      cargo_policy,
      auto_policy,
      ein,
      dot_number,
    } = await req.json();

    if (!email || !user_id || !company_name) {
      return NextResponse.json(
        { error: 'Missing required profile data (user_id, email, company_name).' },
        { status: 400 }
      );
    }

    // 1. Create Carrier__c record in Salesforce
    const carrierRecord = await createCarrier({
      name: company_name,
      supabaseId: user_id,
      dotNumber: dot_number,
      ein: ein,
      safetyStatus: 'Pending', // Initial status; will be updated by Screening Agent
    });

    console.log(`[Salesforce Sync] Created Carrier record: ${carrierRecord.id}`);

    // 2. Log workflow execution for audit trail
    await logAgentWorkflow({
      workflowType: 'Onboarding',
      relatedCarrierId: carrierRecord.id,
      executionStatus: 'Completed',
      actionTaken: `New carrier registered: ${company_name} (DOT: ${dot_number}, EIN: ${ein})`,
    }).catch((err) => {
      // Don't fail the sync if workflow logging fails
      console.warn('[Salesforce Sync] Workflow logging failed (non-blocking):', err);
    });

    // 3. Return success response
    return NextResponse.json(
      {
        message: 'Salesforce sync successful.',
        carrier_id: carrierRecord.id,
        status: 'pending_screening',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Salesforce Sync] Error:', error);

    // IMPORTANT: Do NOT let a failed sync break the user's registration flow.
    // Return 202 (Accepted) to indicate the sync was queued but may have failed.
    return NextResponse.json(
      {
        message: 'Profile saved, but Salesforce sync failed. Manual review may be required.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 202 }
    );
  }
}
