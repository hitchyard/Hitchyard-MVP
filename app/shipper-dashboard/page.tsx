// SHIPPER DASHBOARD - LOAD MANAGEMENT CENTER
// Professional Command Center for Enterprise Shippers

export const dynamic = 'force-dynamic';

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
  const supabaseMissing = !supabaseUrl || !supabaseKey;

  const mockLoads: Load[] = [
    {
      id: "demo-load-shipper-1",
      user_id: "demo-user",
      origin_zip: "10001",
      origin_city: "New York",
      origin_state: "NY",
      destination_zip: "94103",
      destination_city: "San Francisco",
      destination_state: "CA",
      load_weight: 41000,
      commodity_type: "ELECTRONICS",
      pickup_date: new Date().toISOString(),
      delivery_date: undefined,
      rate: 5200,
      status: "open",
      assigned_carrier_id: undefined,
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-load-shipper-2",
      user_id: "demo-user",
      origin_zip: "33101",
      origin_city: "Miami",
      origin_state: "FL",
      destination_zip: "77001",
      destination_city: "Houston",
      destination_state: "TX",
      load_weight: 36000,
      commodity_type: "PHARMACEUTICALS",
      pickup_date: new Date().toISOString(),
      delivery_date: undefined,
      rate: 2900,
      status: "authorized",
      assigned_carrier_id: "demo-carrier",
      created_at: new Date().toISOString(),
    },
  ];

  const mockBids: Bid[] = [
    {
      id: "demo-bid-1",
      load_id: "demo-load-shipper-1",
      carrier_id: "demo-carrier-1",
      bid_amount: 5100,
      status: "pending",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-bid-2",
      load_id: "demo-load-shipper-2",
      carrier_id: "demo-carrier-2",
      bid_amount: 2950,
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ];

  const renderMockDashboard = () => (
    <ShipperDashboardClient loads={mockLoads} bids={mockBids} userId="demo-user" />
  );

  if (supabaseMissing) {
    return renderMockDashboard();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check authentication outside try/catch (redirect() throws special Next.js error)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return renderMockDashboard();
  }

  try {

    // Fetch shipper's loads
    const { data: loadsData, error: loadsError } = await supabase
      .from("loads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (loadsError) {
      console.warn("Loads fetch warning, falling back to mock data:", loadsError.message);
      return renderMockDashboard();
    }

    const loads = (loadsData as Load[]) || mockLoads;

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
        console.warn("Bids fetch warning, falling back to mock data:", bidsError.message);
        bids = mockBids;
      } else {
        bids = (bidsData as Bid[]) || mockBids;
      }
    } else {
      bids = mockBids;
    }

    return <ShipperDashboardClient loads={loads} bids={bids} userId={user.id} />;
  } catch (error) {
    console.error("Dashboard error, falling back to mock data:", error);
    return renderMockDashboard();
  }
}
