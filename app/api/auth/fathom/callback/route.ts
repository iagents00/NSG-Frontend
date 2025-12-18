import { NextResponse } from 'next/server';
import { Fathom } from 'fathom-typescript';
import { cookies } from 'next/headers';

const FATHOM_CLIENT_ID = "NrRk5m9NohU_t6nODvkSZD-sufh9cRp4Nh_gsRe9--U";
const FATHOM_CLIENT_SECRET = "c7U-cAJU1auZLWMJDZkxmDLQOlz7k5GCmvfzF3rB7OQ"; // Necesitas obtener este valor de Fathom
const BASE_URL = "https://nsg-backend.onrender.com";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const clientId = FATHOM_CLIENT_ID;
  const clientSecret = FATHOM_CLIENT_SECRET;

  const redirectUri = `${BASE_URL}/api/auth/fathom/callback`;

  // Custom TokenStore to capture the access token
  let capturedToken: any = null;

  const tokenStore = {
      get: async () => undefined,
      set: async (val: any) => { 
          console.log("Captured Fathom Token"); 
          capturedToken = val; 
      }
  };

  try {
      // Initialize Fathom with Authorization code flow
      const fathom = new Fathom({
          security: Fathom.withAuthorization({
              clientId,
              clientSecret,
              code,
              redirectUri,
              tokenStore
          })
      });

      // Force token exchange by making a request
      // We try to call a method that definitely exists in the SDK based on the docs provided
      // Docs said: const result = await fathom.listMeetings({});
      try {
          // @ts-ignore
          await fathom.listMeetings({ limit: 1 });
      } catch (e) {
          console.log("Initial request failed, but token might have been exchanged", e);
      }

      if (capturedToken) {
          const cookieStore = await cookies();
          
          // capturedToken is likely an object { token, refresh_token, expires }
          const tokenValue = typeof capturedToken === 'object' ? capturedToken.token : capturedToken;
          
          if (tokenValue && typeof tokenValue === 'string') {
              cookieStore.set('fathom_access_token', tokenValue, { 
                secure: false, 
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 1 week
              });
    
              // Set a visible cookie for the UI to know we are connected
              cookieStore.set('fathom_connected', 'true', { 
                secure: false, 
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 7
              });
          }
      }

      // Redirect back to the dashboard/Horizon view
      const dashboardUrl = new URL('/dashboard', req.url); // Adjust if needed
      // We might want to pass a 'success' param
      dashboardUrl.searchParams.set('fathom_connected', 'true');
      
      return NextResponse.redirect(dashboardUrl);

  } catch (error: any) {
      console.error('Fathom Callback Error:', error);
      return NextResponse.json({ error: error.message || 'OAuth Callback Failed' }, { status: 500 });
  }
}
