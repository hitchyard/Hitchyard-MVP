// SHIPPER DASHBOARD - LOAD MANAGEMENT CENTER
// Professional Command Center for Enterprise Shippers

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ShipperDashboardClient from "./ShipperDashboardClient";

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
  assigned_carrier_id?: string;
  created_at: string;
}

interface Bid {
  id: string;
  load_id: string;
  carrier_id: string;
  bid_amount: number;
  status: string;
  created_at: string;
}

export default async function ShipperDashboard() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-charcoal-black p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-serif font-semibold text-white mb-4">
            CONFIGURATION ERROR
          </h1>
          <p className="text-white/70 font-sans">
            Supabase is not configured. Please contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    // Fetch shipper's loads
    const { data: loadsData, error: loadsError } = await supabase
      .from("loads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (loadsError) {
      console.error("Loads fetch error:", loadsError);
    }

    const loads = (loadsData as Load[]) || [];

    // Fetch bids for all shipper's loads
    const loadIds = loads.map((load) => load.id);
    let bids: Bid[] = [];

    if (loadIds.length > 0) {
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .in("load_id", loadIds)
        .order("created_at", { ascending: false });

      if (bidsError) {
        console.error("Bids fetch error:", bidsError);
      } else {
        bids = (bidsData as Bid[]) || [];
      }
    }

    return <ShipperDashboardClient loads={loads} bids={bids} userId={user.id} />;
  } catch (error) {
    console.error("Dashboard error:", error);
    redirect("/login");
  }
}
