import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Load Supabase Admin credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, password, userType, complianceDate } = await req.json();

    // --- STEP 1: Supabase Authentication (Server-Side Sign-Up) ---
    // Creates the user in auth.users table
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email for testing
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Authentication sign-up failed.' }, { status: 500 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not created.' }, { status: 500 });
    }

    // --- STEP 2: Supabase Profile Data Insert ---
    // Insert profile data into the 'profiles' table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          user_id: userId,
          email: email,
          user_type: userType,
          compliance_date: complianceDate,
          grit_club_verified: true, // Initial verification for Grit Club carriers
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

    // --- STEP 3: Success Response ---
    return NextResponse.json(
      { message: 'User successfully registered.', userId, userType },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
