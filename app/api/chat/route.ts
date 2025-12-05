import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const n8nUrl = process.env.N8N_WEBHOOK;

    console.log('\n--- 🚀 POSTING TO N8N WEBHOOK ---');
    console.log('Target URL:', n8nUrl);
    console.log('Payload:', JSON.stringify(body, null, 2)); 

    if (!n8nUrl) {
      console.error('❌ Error: N8N_WEBHOOK is missing in .env');
      return NextResponse.json({ error: 'Configuration error: N8N_WEBHOOK missing' }, { status: 500 });
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.error(`❌ N8N Error: ${response.status} ${response.statusText}`);
        return NextResponse.json({ error: `N8N Error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ N8N Response Received');
    // console.log('Response Data:', data); 

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
