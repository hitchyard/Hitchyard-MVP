import { createClient } from '@supabase/supabase-js';

/**
 * Mock test for Trust Score update in Supabase after Ansonia vetting
 */
async function testTrustScoreUpdate() {
  // Setup: Use test credentials and test user_id
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create a test user (or use a known test user_id)
  const testUserId = 'test-user-123';

  // Simulate Ansonia vetting result
  const testTrustScore = 82;
  const vettingStatus = 'PENDING';

  // Update user_profiles as the edge function would
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      trust_score: testTrustScore,
      vetting_status: vettingStatus,
      ansonia_credit_score: testTrustScore,
      ansonia_last_checked: new Date().toISOString(),
    })
    .eq('user_id', testUserId);

  if (updateError) {
    throw new Error('Failed to update trust score: ' + updateError.message);
  }

  // Fetch and assert
  const { data, error } = await supabase
    .from('user_profiles')
    .select('trust_score, vetting_status')
    .eq('user_id', testUserId)
    .single();

  if (error) throw new Error('Failed to fetch user: ' + error.message);

  if (data.trust_score !== testTrustScore || data.vetting_status !== vettingStatus) {
    throw new Error('Trust Score or vetting status did not update correctly');
  }

  console.log('✅ Trust Score update test passed.');
}

// Run the test
if (require.main === module) {
  testTrustScoreUpdate().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}
