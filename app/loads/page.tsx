import React from "react";
import Link from "next/link";
import LoadsClient from "./LoadsClient";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

interface Load {
  id: string;
  user_id: string;
  origin_zip: string;
  destination_zip: string;
  load_weight: number;
  commodity_type: string;
  status: string;
  created_at: string;
}

export default async function LoadsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-semibold font-spartan text-white mb-4">
            Configuration Error
          </h1>
          <p className="text-gray-300">
            Supabase is not configured. Please contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check if user is logged in
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // User not logged in, redirect to signup
      redirect("/signup");
    }

    // Fetch all posted loads
    const { data: loadsData, error: loadsError } = await supabase
      .from("loads")
      .select(
        "id, user_id, origin_zip, destination_zip, load_weight, commodity_type, status, created_at"
      )
      .eq("status", "posted")
      .order("created_at", { ascending: false });

    if (loadsError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-2xl font-semibold font-spartan text-white mb-4">
              Error Loading Loads
            </h1>
            <p className="text-gray-300">{loadsError.message}</p>
          </div>
        </main>
      );
    }

    const loads = (loadsData as Load[]) || [];

    return (
      <main className="min-h-screen p-8 bg-charcoal-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold font-spartan text-white mb-2">
              Available Loads
            </h1>
            <p className="text-gray-400">
              Browse and bid on available shipments in the marketplace.
            </p>
          </div>

          {/* Loads Section */}
          <section>
            {/* LoadsClient handles interactive table and bid modal on the client side */}
            {/* Server passes loads to a client component for interactivity */}
            <div id="loads-client-root">
              {/* @ts-ignore - passing server data to client component */}
              <LoadsClient loads={loads} />
            </div>
          </section>

          {/* Back to Dashboard Link */}
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-semibold font-spartan text-white mb-4">
            Unexpected Error
          </h1>
          <p className="text-gray-300">{(err as Error)?.message ?? String(err)}</p>
        </div>
      </main>
    );
  }
}
