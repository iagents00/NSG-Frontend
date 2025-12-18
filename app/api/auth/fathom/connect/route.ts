import { NextResponse } from 'next/server';
import { Fathom } from 'fathom-typescript';

const FATHOM_CLIENT_ID = "TU_FATHOM_CLIENT_ID";
const BASE_URL = "http://localhost:3001";

export async function GET() {
  const clientId = FATHOM_CLIENT_ID;
  const redirectUri = `${BASE_URL}/api/auth/fathom/callback`;

  try {
    const url = Fathom.getAuthorizationUrl({
      clientId,
      // clientSecret is technically not needed for just the URL in standard OAuth, but the SDK signature might ask for it
      // Based on docs snippet: clientId, clientSecret, redirectUri, scope, state
      redirectUri,
      scope: 'public_api',
      state: 'nsg-horizon-auth', // In production, use a random string
    });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Error generating Fathom Auth URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
