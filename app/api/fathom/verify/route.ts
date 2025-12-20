
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Debug log (masked)
    const maskedToken = token.length > 8 
        ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` 
        : '***';
    console.log(`Verifying Fathom token: ${maskedToken} (Length: ${token.length})`);

    // Call Fathom API to verify token
    // We use /recordings with limit 1 as a lightweight check
    const response = await fetch('https://api.fathom.video/v1/recordings?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fathom API Error (${response.status}):`, errorText);
      
      let errorMessage = 'Invalid token';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // use default or raw text if short
        if (errorText.length < 100) errorMessage = errorText;
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ valid: true, data }, { status: 200 });

  } catch (error) {
    console.error('Fathom token verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
