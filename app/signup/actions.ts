"use server";

import { createClient } from "@supabase/supabase-js";
import { checkDistance } from "@/utils/geo";

interface SignUpInput {
  email: string;
  password: string;
  zip_code: string;
}

export async function signUpAction(input: SignUpInput) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        error: "Supabase configuration is missing",
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign up the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          zip_code: input.zip_code,
        },
      },
    });

    if (signUpError || !authData.user) {
      return {
        error: signUpError?.message ?? "Sign up failed",
      };
    }

    const userId = authData.user.id;

    // Check if user is within 250 miles of Salt Lake City
    const isWithinGritClub = await checkDistance(input.zip_code);

    // Set user role based on distance check
    const userRole = isWithinGritClub ? "shipper" : "unverified";

    // Insert user profile with appropriate role
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        user_role: userRole,
        zip_code: input.zip_code,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      return {
        error: profileError.message,
      };
    }

    return {
      success: true,
      message: isWithinGritClub
        ? "Sign up successful! You are approved as a shipper."
        : "Sign up successful! Your account is pending verification.",
    };
  } catch (err) {
    return {
      error: (err as Error)?.message ?? String(err),
    };
  }
}
