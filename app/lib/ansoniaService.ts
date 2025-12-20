/**
 * Ansonia (Equifax) Credit API Integration Service
 * 
 * This module handles communication with the Ansonia Credit Risk API to fetch:
 * - Company Credit Risk Score (0-100)
 * - Days-to-Pay (DTP) average
 * 
 * API Documentation: https://www.ansoniadata.com/api/docs
 */

const ANSONIA_API_URL = process.env.ANSONIA_API_URL || 'https://api.ansoniadata.com/v1';
const ANSONIA_API_KEY = process.env.ANSONIA_API_KEY;
const ANSONIA_ACCOUNT_ID = process.env.ANSONIA_ACCOUNT_ID;

interface AnsoniaCreditResponse {
  success: boolean;
  company_id?: string;
  credit_score: number; // 0-100
  dtp_days: number; // Days to Pay
  last_updated: string;
  error?: string;
}

/**
 * Fetch company credit data from Ansonia API
 * @param ein - Employer Identification Number
 * @param dotNumber - DOT number (alternative identifier)
 * @returns Credit score and DTP data
 */
export async function fetchAnsoniaCreditData(
  ein?: string,
  dotNumber?: string
): Promise<AnsoniaCreditResponse> {
  if (!ANSONIA_API_KEY || !ANSONIA_ACCOUNT_ID) {
    console.error('Missing Ansonia API credentials in environment');
    return {
      success: false,
      credit_score: 50, // Default conservative score
      dtp_days: 45,
      last_updated: new Date().toISOString(),
      error: 'Ansonia credentials not configured',
    };
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (ein) params.append('ein', ein);
    if (dotNumber) params.append('dot_number', dotNumber);

    const response = await fetch(`${ANSONIA_API_URL}/company/credit-check?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANSONIA_API_KEY}`,
        'X-Account-ID': ANSONIA_ACCOUNT_ID,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Ansonia API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        credit_score: 50,
        dtp_days: 45,
        last_updated: new Date().toISOString(),
        error: `API returned ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      company_id: data.company_id,
      credit_score: data.credit_score || 50,
      dtp_days: data.dtp_days || 45,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Ansonia API fetch error:', error instanceof Error ? error.message : error);
    return {
      success: false,
      credit_score: 50,
      dtp_days: 45,
      last_updated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Determine vetting status and review flag based on credit score
 * 
 * UPDATED THRESHOLDS:
 * - 85-100: ACTIVE (auto-approved)
 * - 70-84: PENDING (manual review required)
 * - <70: REJECTED (Imperial Standard Not Met)
 * 
 * @param creditScore - Ansonia credit score (0-100)
 * @returns Object with vetting_status and optional review_flag/reason
 */
export function determineVettingStatus(creditScore: number): {
  vetting_status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  review_flag: string | null;
  review_reason: string | null;
} {
  if (creditScore >= 85 && creditScore <= 100) {
    return {
      vetting_status: 'ACTIVE',
      review_flag: null,
      review_reason: null,
    };
  } else if (creditScore >= 70 && creditScore < 85) {
    return {
      vetting_status: 'PENDING',
      review_flag: 'GRIT_CLUB_MANUAL_REVIEW',
      review_reason: `Credit score ${creditScore} requires Grit Club manual review (70-84 range).`,
    };
  } else {
    return {
      vetting_status: 'REJECTED',
      review_flag: 'REJECTED_LOW_CREDIT',
      review_reason: `IMPERIAL STANDARD NOT MET. Credit score ${creditScore} is below acceptable threshold (70).`,
    };
  }
}
