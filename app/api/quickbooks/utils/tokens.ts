import OAuthClient from "intuit-oauth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const qbClientId = process.env.QB_CLIENT_ID;
const qbClientSecret = process.env.QB_CLIENT_SECRET;
const qbEnvironment = process.env.QB_ENVIRONMENT as "sandbox" | "production" | undefined;
const qbRedirectUri = process.env.QB_REDIRECT_URI;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase configuration is missing for QuickBooks token utility.");
}
if (!qbClientId || !qbClientSecret || !qbEnvironment || !qbRedirectUri) {
  throw new Error("QuickBooks OAuth configuration is missing.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const oauthClient = new OAuthClient({
  clientId: qbClientId,
  clientSecret: qbClientSecret,
  environment: qbEnvironment,
  redirectUri: qbRedirectUri,
});

export async function getValidTokens(realmId: string) {
  const { data: tokenData, error } = await supabase
    .from("qb_tokens")
    .select("*")
    .eq("realm_id", realmId)
    .single();

  if (error || !tokenData) throw new Error("No tokens found. Please connect QuickBooks.");

  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  // Refresh if expired or expiring in <5 minutes
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log("Token expired/expiring. Refreshing...");

    oauthClient.setToken(tokenData);

    try {
      const authResponse = await oauthClient.refresh();
      const newToken = authResponse.getJson();

      const { error: updateError } = await supabase
        .from("qb_tokens")
        .update({
          access_token: newToken.access_token,
          refresh_token: newToken.refresh_token,
          expires_at: new Date(Date.now() + newToken.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("realm_id", realmId);

      if (updateError) throw updateError;
      return newToken.access_token;
    } catch (e) {
      console.error("Refresh failed:", e);
      throw new Error("Re-authentication required.");
    }
  }

  return tokenData.access_token;
}
