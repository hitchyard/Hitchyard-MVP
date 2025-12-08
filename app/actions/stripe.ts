"use server";

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

interface ActionResult {
  url?: string;
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
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

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
