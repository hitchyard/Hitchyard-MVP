import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Load Supabase Admin credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const parsedBody = await req.json();
    const {
      email,
      password,
      userType,
      complianceDate,
      companyName,
      zipCode,
      cargoPolicyNumber,
      autoLiabilityPolicyNumber,
    } = parsedBody;

    // --- STEP 1: Supabase Authentication (Server-Side Sign-Up) ---
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for server-side registration
    });

    if (authError || !userData?.user) {
      console.error('CRITICAL AUTH SIGNUP FAILURE:', authError?.message || 'User data missing.');
      return NextResponse.json(
        {
          message: 'Registration failed due to server error.',
          details: authError?.message || 'Unknown authentication error',
        },
        { status: 500 }
      );
    }

    const userId = userData.user.id;

    // --- STEP 2a: Core profile flag update (user_profiles) ---
    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        is_vetting_pending: true,
        user_role: 'carrier',
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Profile Update Error:', profileUpdateError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Profile update failed.' }, { status: 500 });
    }

    // --- STEP 2b: Supabase Profile Data Insert ---
    // Insert profile data into the 'profiles' table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          user_id: userId,
          email: email,
          user_type: userType,
          compliance_date: complianceDate,
          zip_code: zipCode,
          cargo_policy: cargoPolicyNumber,
          auto_policy: autoLiabilityPolicyNumber,
          salt_lake_area_check: zipCode?.startsWith('84') || false, // mock prefix check for Utah
          grit_club_verified: false, // kept false until manual dispatcher review
        },
      ]);

    if (profileError) {
      console.error('Profile Insert Error:', profileError);
      // Clean up the auth user if profile insertion fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Profile data creation failed. Transaction rolled back.' },
        { status: 500 }
      );
    }

    // --- STEP 2c: Vetting request logging (fire-and-forget) ---
    const { error: vettingInsertError } = await supabaseAdmin
      .from('vetting_requests')
      .insert([
        {
          user_id: userId,
          company_name: companyName,
          zip_code: zipCode,
          cargo_policy: cargoPolicyNumber,
          auto_policy: autoLiabilityPolicyNumber,
          dot_number: 'N/A',
          legal_entity_type: 'CORP',
          is_reviewed: false,
          salt_lake_area_check: zipCode?.startsWith('84') || false,
        },
      ]);

    if (vettingInsertError) {
      console.error('Vetting Request Insert Error (non-blocking):', vettingInsertError);
    }

    // --- STEP 3: Sync to Airtable (Fire and Forget) ---
    // Don't block registration if Airtable sync fails
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sync-airtable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        email: email,
        company_name: companyName,
        zip_code: zipCode,
        cargo_policy: cargoPolicyNumber,
        auto_policy: autoLiabilityPolicyNumber,
      }),
    }).catch((err) => console.error('Airtable sync failed (non-blocking):', err));

    // --- STEP 4: Success Response ---
    return NextResponse.json(
      { message: 'User successfully registered.', userId, userType },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
