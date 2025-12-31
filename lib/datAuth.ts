export async function getDATAccessToken(): Promise<string | null> {
  const clientId = process.env.DAT_CLIENT_ID;
  const clientSecret = process.env.DAT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch('https://identity-test.dat.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.access_token || null;
  } catch (e) {
    return null;
  }
}
