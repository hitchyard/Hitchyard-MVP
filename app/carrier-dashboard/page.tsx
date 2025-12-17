// CARRIER DASHBOARD - RULER ARCHETYPE
// Load Matching Platform for Verified Carriers

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CarrierDashboardClient from "./CarrierDashboardClient";

interface Load {
  id: string;
  user_id: string;
  origin_city?: string;
  origin_state?: string;
  origin_zip: string;
  destination_city?: string;
  destination_state?: string;
  destination_zip: string;
  load_weight: number;
  commodity_type: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: number;
  status: string;
  created_at: string;
}

export default async function CarrierDashboard() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-serif font-semibold text-white mb-4">
            CONFIGURATION ERROR
          </h1>
          <p className="text-gray-300 font-sans">
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
      redirect("/signup?role=carrier");
    }

    // Fetch open loads available for bidding
    const { data: loadsData, error: loadsError } = await supabase
      .from("loads")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (loadsError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-2xl font-serif font-semibold text-white mb-4">
              ERROR LOADING LOADS
            </h1>
            <p className="text-gray-300 font-sans">{loadsError.message}</p>
          </div>
        </main>
      );
    }

    const loads = (loadsData as Load[]) || [];

    return <CarrierDashboardClient loads={loads} />;
  } catch (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-serif font-semibold text-white mb-4">
            SYSTEM ERROR
          </h1>
          <p className="text-gray-300 font-sans">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </div>
      </main>
    );
  }
}
