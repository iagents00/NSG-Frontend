import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const webhookUrl = "TU_N8N_WEBHOOK_URL";

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N_WEBHOOK environment variable is not defined' },
        { status: 500 }
      );
    }

    // Log the configuration and payload for debugging
    console.log('--- N8N Proxy Request ---');
    console.log('Target URL:', webhookUrl.replace(/([a-zA-Z0-9]{5})[a-zA-Z0-9]+([a-zA-Z0-9]{5})/, '$1***$2')); // Mask middle of URL
    console.log('Payload:', JSON.stringify(body, null, 2));

    // Forward the request to N8N
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if N8N response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      // Try to parse if it's a stringified JSON
      try {
         data = JSON.parse(data);
      } catch (e) {
         // keep as text
      }
    }
    
    if (!response.ok) {
        return NextResponse.json(
            { error: `N8N responded with ${response.status}`, details: data },
            { status: response.status }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
