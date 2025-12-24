import { NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";

// QuickBooks OAuth client
const oauthClient = new OAuthClient({
  clientId: process.env.QB_CLIENT_ID!,
  clientSecret: process.env.QB_CLIENT_SECRET!,
  environment: process.env.QB_ENVIRONMENT as "sandbox" | "production",
  redirectUri: process.env.QB_REDIRECT_URI!,
});

export async function GET() {
  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    state: "hitchyard-init",
  });

  return NextResponse.redirect(authUri);
}
