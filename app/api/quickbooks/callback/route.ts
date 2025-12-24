import { NextRequest, NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with Service Role for database writes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase configuration is missing for QuickBooks callback.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// QuickBooks OAuth client
const oauthClient = new OAuthClient({
  clientId: process.env.QB_CLIENT_ID!,
  clientSecret: process.env.QB_CLIENT_SECRET!,
  environment: process.env.QB_ENVIRONMENT as "sandbox" | "production",
  redirectUri: process.env.QB_REDIRECT_URI!,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");

  if (!code || !realmId) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Exchange authorization code for tokens
    const authResponse = await oauthClient.createToken(request.url);
    const token = authResponse.getJson();

    // Upsert tokens keyed by realm_id
    const { error } = await supabase
      .from("qb_tokens")
      .upsert(
        {
          realm_id: realmId,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
        },
        { onConflict: "realm_id" }
      );

    if (error) throw error;

    // Redirect back to dashboard with success status
    return NextResponse.redirect(new URL("/dashboard?status=connected", request.url));
  } catch (e) {
    console.error("QuickBooks Auth Error:", e);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
