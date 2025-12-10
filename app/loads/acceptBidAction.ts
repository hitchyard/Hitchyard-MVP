"use server";

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

interface AcceptBidInput {
  load_id: string;
  bid_id: string;
}

interface UserProfile {
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
}

export async function acceptBidAction({ load_id, bid_id }: AcceptBidInput) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        error: "Supabase configuration is missing",
      };
    }

    if (!stripeSecretKey) {
      return {
        error: "Stripe secret key is missing",
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: "User not authenticated",
      };
    }

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

    // Retrieve Shipper's payment information
    const { data: shipperProfile, error: shipperError } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id, stripe_payment_method_id")
      .eq("user_id", user.id)
      .single();

    if (shipperError || !shipperProfile) {
      return {
        error: "Unable to retrieve shipper payment information",
      };
    }

    const shipperData = shipperProfile as UserProfile;

    if (!shipperData.stripe_customer_id || !shipperData.stripe_payment_method_id) {
      return {
        error: "Shipper payment method not set up. Please add a payment method to your account.",
      };
    }

    // Retrieve Carrier's Stripe account ID
    const { data: carrierProfile, error: carrierError } = await supabase
      .from("user_profiles")
      .select("stripe_account_id")
      .eq("user_id", winningBid.carrier_id)
      .single();

    if (carrierError || !carrierProfile) {
      return {
        error: "Unable to retrieve carrier payment information",
      };
    }

    const carrierData = carrierProfile as UserProfile;

    if (!carrierData.stripe_account_id) {
      return {
        error: "Carrier has not set up their payout account. Cannot process payment.",
      };
    }

    // Calculate payment amounts
    const bidAmount = winningBid.bid_amount;
    const amountInCents = Math.round(bidAmount * 100); // Convert to cents
    const applicationFeePercent = 0.15; // 15% commission for Hitchyard
    const applicationFee = Math.round(amountInCents * applicationFeePercent);

    // Create Payment Intent with destination charge
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: shipperData.stripe_customer_id,
        payment_method: shipperData.stripe_payment_method_id,
        confirm: true,
        off_session: true,
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: carrierData.stripe_account_id,
        },
        metadata: {
          load_id: load_id,
          bid_id: bid_id,
          carrier_id: winningBid.carrier_id,
          shipper_id: user.id,
        },
        description: `Payment for Load ${load_id}`,
      });
    } catch (stripeError: any) {
      return {
        error: `Payment processing failed: ${stripeError?.message ?? "Unknown error"}`,
      };
    }

    // Check if payment requires further action
    if (paymentIntent.status === "requires_action" || paymentIntent.status === "requires_confirmation") {
      return {
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: "Payment requires additional authentication",
      };
    }

    if (paymentIntent.status !== "succeeded") {
      return {
        error: `Payment failed with status: ${paymentIntent.status}`,
      };
    }

    const { error: updateLoadError } = await supabase
      .from("loads")
      .update({
        status: "assigned",
        assigned_carrier_id: winningBid.carrier_id,
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", load_id);

    if (updateLoadError) {
      return {
        error: updateLoadError.message,
      };
    }

    const { error: acceptBidError } = await supabase
      .from("bids")
      .update({ 
        status: "accepted",
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString() 
      })
      .eq("id", bid_id);

    if (acceptBidError) {
      return {
        error: acceptBidError.message,
      };
    }

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
      message: "Bid accepted, load assigned, and payment processed successfully",
      paymentIntentId: paymentIntent.id,
      amountCharged: bidAmount,
      applicationFee: applicationFee / 100, // Convert back to dollars
    };
  } catch (err) {
    return {
      error: (err as Error)?.message ?? String(err),
    };
  }
}
