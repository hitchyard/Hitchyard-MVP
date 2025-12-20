// CARRIER DASHBOARD - RULER ARCHETYPE
// Load Matching Platform for Verified Carriers

export const dynamic = 'force-dynamic';

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
  const supabaseMissing = !supabaseUrl || !supabaseKey;

  const mockLoads: Load[] = [
    {
      id: "demo-load-1",
      user_id: "demo-user",
      origin_zip: "30301",
      origin_city: "Atlanta",
      origin_state: "GA",
      destination_zip: "60601",
      destination_city: "Chicago",
      destination_state: "IL",
      load_weight: 42000,
      commodity_type: "STEEL COILS",
      pickup_date: new Date().toISOString(),
      delivery_date: undefined,
      rate: 3200,
      status: "open",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-load-2",
      user_id: "demo-user",
      origin_zip: "75201",
      origin_city: "Dallas",
      origin_state: "TX",
      destination_zip: "85001",
      destination_city: "Phoenix",
      destination_state: "AZ",
      load_weight: 38000,
      commodity_type: "REFRIGERATED PRODUCE",
      pickup_date: new Date().toISOString(),
      delivery_date: undefined,
      rate: 4100,
      status: "open",
      created_at: new Date().toISOString(),
    },
  ];

  const renderMockDashboard = () => (
    <CarrierDashboardClient
      loads={mockLoads}
      insuranceVerified={true}
      mcNumberVerified={true}
      vettingStatus="ACTIVE"
      trustScore={98}
    />
  );

  if (supabaseMissing) {
    return renderMockDashboard();
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if user is logged in (outside try/catch - redirect() throws special Next.js error)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return renderMockDashboard();
  }

  try {

    // Fetch carrier performance status for vetting alerts
    const { data: performanceData } = await supabase
      .from("carrier_performance")
      .select("insurance_verified, mc_number_verified")
      .eq("user_id", user.id)
      .single();

    // Fetch open loads available for bidding
    const { data: loadsData, error: loadsError } = await supabase
      .from("loads")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (loadsError) {
      console.warn("Loads fetch warning, falling back to mock data:", loadsError.message);
      return renderMockDashboard();
    }

    // Fetch vetting status and trust score for current user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('vetting_status, trust_score')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      // Show a minimal status if profile missing
      console.warn('Profile fetch warning:', profileError.message);
    }

    const loads = (loadsData as Load[]) || mockLoads;
    const insuranceVerified = performanceData?.insurance_verified ?? true;
    const mcNumberVerified = performanceData?.mc_number_verified ?? true;
    const vettingStatus = (profile?.vetting_status as string) || 'ACTIVE';
    const trustScore = (profile?.trust_score as number) ?? 98;

    return (
      <CarrierDashboardClient 
        loads={loads} 
        insuranceVerified={insuranceVerified}
        mcNumberVerified={mcNumberVerified}
        vettingStatus={vettingStatus}
        trustScore={trustScore}
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return renderMockDashboard();
  }
}
