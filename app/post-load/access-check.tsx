import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Props = {
  children: React.ReactNode;
};

export default async function PostLoadAccessCheck({ children }: Props) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-semibold font-spartan text-white mb-4">Configuration Error</h1>
          <p className="text-gray-300">Supabase is not configured. Please contact the administrator.</p>
        </div>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-2xl font-semibold font-spartan text-white mb-4">Access Restricted</h1>
            <p className="text-gray-300 mb-6">You must be signed in to access this page.</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-deep-green text-white rounded-none hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black"
            >
              Sign Up / Sign In
            </Link>
          </div>
        </main>
      );
    }

    // Lookup user's role
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      // If profile lookup errors, deny access with message
      return (
        <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-2xl font-semibold font-spartan text-white mb-4">Access Error</h1>
            <p className="text-gray-300">Unable to verify account role. Please contact support.</p>
          </div>
        </main>
      );
    }

    const role = (profileData as any)?.user_role ?? null;

    if (role === "shipper" || role === "admin") {
      return <>{children}</>;
    }

    // Access denied for other roles
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center bg-white bg-opacity-5 rounded-none p-8">
          <h1 className="text-2xl font-semibold font-spartan text-white mb-4">Access Denied: Account Vetting Required to Post Loads.</h1>
          <p className="text-gray-300 mb-6">
            Your account does not currently have permission to post loads. Complete the vetting process to enable posting privileges.
          </p>
          <Link
            href="/vetting"
            className="inline-flex items-center justify-center px-6 py-3 bg-deep-green text-white rounded-none hover:bg-[#0e2b26] focus:ring-2 focus:ring-charcoal-black"
          >
            Start Vetting
          </Link>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-semibold font-spartan text-white mb-4">Unexpected Error</h1>
          <p className="text-gray-300">{(err as Error)?.message ?? String(err)}</p>
        </div>
      </main>
    );
  }
}
