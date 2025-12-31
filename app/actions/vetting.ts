'use server';

/**
 * Hitchyard Vetting Agent Integration
 * Triggered when a carrier applies for access.
 */
export async function getVettingStatus(carrierId: string) {
  const DIFY_API_KEY = 'app-lnWwjRi28y7O442TMlzwnIZB';
  const DIFY_URL = 'http://129.212.181.151/v1/completion-messages';

  try {
    const response = await fetch(DIFY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { carrier_id: carrierId },
        response_mode: 'blocking',
        user: `user-${carrierId}`
      }),
    });

    if (!response.ok) throw new Error('Authority system offline.');

    const data = await response.json();
    // Extracting logic from Dify Agent Response
    // Dify returns text in 'answer'. We expect JSON-like output.
    const result = JSON.parse(data.answer);

    return {
      isVetted: result.is_vetted ?? false,
      trustScore: result.trust_score ?? 0,
      reason: result.reason ?? "PENDING REVIEW"
    };
  } catch (error) {
    console.error("Vetting Error:", error);
    return { isVetted: false, trustScore: 0, reason: "SYSTEM ERROR" };
  }
}

/**
 * Hitchyard Matchmaking Agent Integration
 * Triggered after vetting is complete.
 */
export async function getMatchmakingStatus(carrierId: string) {
  const DIFY_API_KEY = 'app-lnWwjRi28y7O442TMlzwnIZB';
  const DIFY_URL = 'http://129.212.181.151/v1/completion-messages';

  try {
    const response = await fetch(DIFY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { carrier_id: carrierId, protocol: 'matchmaking' },
        response_mode: 'blocking',
        user: `user-${carrierId}`
      }),
    });

    if (!response.ok) throw new Error('Matchmaking system offline.');

    const data = await response.json();
    // Dify returns text in 'answer'. We expect JSON-like output.
    const result = JSON.parse(data.answer);

    return {
      allocationStatus: result.allocation_status ?? 'PENDING',
      recommendedLanes: result.recommended_lanes ?? [],
      reason: result.reason ?? 'Awaiting protocol optimization.'
    };
  } catch (error) {
    console.error('Matchmaking Error:', error);
    return { allocationStatus: 'ERROR', recommendedLanes: [], reason: 'SYSTEM ERROR' };
  }
}
