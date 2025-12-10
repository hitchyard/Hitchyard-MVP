"use server";

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

interface ActionResult {
  url?: string;
  error?: string;
}

interface SetupIntentResult {
  clientSecret?: string;
  customerId?: string;
  error?: string;
}

interface SavePaymentMethodResult {
  success?: boolean;
  error?: string;
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function createConnectAccountLink(): Promise<ActionResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: "Supabase configuration is missing" };
    }

    if (!stripeSecretKey) {
      return { error: "Stripe secret key is missing" };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "User not authenticated" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return { error: profileError.message };
    }

    let stripeAccountId = (profile as { stripe_account_id?: string } | null)?.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: user.email || undefined,
      });

      stripeAccountId = account.id;

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("user_id", user.id);

      if (updateError) {
        return { error: updateError.message };
      }
    }

    const baseUrl = getSiteUrl();
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard`,
      return_url: `${baseUrl}/dashboard`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (err) {
    return { error: (err as Error)?.message ?? String(err) };
  }
}

export async function setupShipperPayment(): Promise<SetupIntentResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: "Supabase configuration is missing" };
    }

    if (!stripeSecretKey) {
      return { error: "Stripe secret key is missing" };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" });

    // Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "User not authenticated" };
    }

    // Check if user has a stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return { error: profileError.message };
    }

    let stripeCustomerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id;

    // Create Stripe Customer if it doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save the customer ID to user_profiles
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", user.id);

      if (updateError) {
        return { error: updateError.message };
      }
    }

    // Create Setup Intent for collecting payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: {
        user_id: user.id,
      },
    });

    return {
      clientSecret: setupIntent.client_secret || undefined,
      customerId: stripeCustomerId,
    };
  } catch (err) {
    return { error: (err as Error)?.message ?? String(err) };
  }
}

export async function savePaymentMethod(setupIntentId: string): Promise<SavePaymentMethodResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: "Supabase configuration is missing" };
    }

    if (!stripeSecretKey) {
      return { error: "Stripe secret key is missing" };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" });

    // Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "User not authenticated" };
    }

    // Retrieve the Setup Intent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== "succeeded") {
      return { error: "Setup Intent has not been completed successfully" };
    }

    const paymentMethodId = setupIntent.payment_method as string;

    if (!paymentMethodId) {
      return { error: "No payment method found in Setup Intent" };
    }

    // Save the payment method ID to user_profiles
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ stripe_payment_method_id: paymentMethodId })
      .eq("user_id", user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    return { error: (err as Error)?.message ?? String(err) };
  }
}
