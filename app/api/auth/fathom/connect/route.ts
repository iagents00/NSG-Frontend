import { NextResponse } from 'next/server';
import { Fathom } from 'fathom-typescript';

export async function GET() {
  const clientId = process.env.FATHOM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/fathom/callback`;
  const clientSecret = process.env.FATHOM_CLIENT_SECRET; // SDK might need this even for Auth URL generation wrapper

  if (!clientId) {
    return NextResponse.json({ error: 'FATHOM_CLIENT_ID is not configured' }, { status: 500 });
  }

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
