"use server";

import { createClient } from "@supabase/supabase-js";

interface AcceptBidInput {
  load_id: string;
  bid_id: string;
}

export async function acceptBidAction({ load_id, bid_id }: AcceptBidInput) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        error: "Supabase configuration is missing",
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: "User not authenticated",
      };
    }

    // Verify load ownership (shipper must own the load)
    const { data: loadRecord, error: loadError } = await supabase
      .from("loads")
      .select("id, user_id")
      .eq("id", load_id)
      .single();

    if (loadError || !loadRecord) {
      return {
        error: loadError?.message ?? "Load not found",
      };
    }

    if (loadRecord.user_id !== user.id) {
      return {
        error: "You do not have permission to modify this load",
      };
    }

    // Retrieve the winning bid
    const { data: winningBid, error: bidError } = await supabase
      .from("bids")
      .select("id, load_id, carrier_id, bid_amount")
      .eq("id", bid_id)
      .single();

    if (bidError || !winningBid) {
      return {
        error: bidError?.message ?? "Bid not found",
      };
    }

    if (winningBid.load_id !== load_id) {
      return {
        error: "Bid does not belong to this load",
      };
    }

    // Update load status to assigned
    const { error: updateLoadError } = await supabase
      .from("loads")
      .update({
        status: "assigned",
        assigned_carrier_id: winningBid.carrier_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", load_id);

    if (updateLoadError) {
      return {
        error: updateLoadError.message,
      };
    }

    // Mark winning bid as accepted
    const { error: acceptBidError } = await supabase
      .from("bids")
      .update({ 
        status: "accepted",
        updated_at: new Date().toISOString() 
      })
      .eq("id", bid_id);

    if (acceptBidError) {
      return {
        error: acceptBidError.message,
      };
    }

    // Reject all other bids for this load
    const { error: rejectOthersError } = await supabase
      .from("bids")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("load_id", load_id)
      .neq("id", bid_id);

    if (rejectOthersError) {
      return {
        error: rejectOthersError.message,
      };
    }

    return {
      success: true,
      message: "Bid accepted and load assigned successfully",
      bidAmount: winningBid.bid_amount,
    };
  } catch (err) {
    return {
      error: (err as Error)?.message ?? String(err),
    };
  }
}
