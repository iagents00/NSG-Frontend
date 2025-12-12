import { NextResponse } from 'next/server';

/**
 * Proxy for NSG Horizon Webhook
 * Path: /api/nsg-horizon
 */
const BASE_URL = 'https://personal-n8n.suwsiw.easypanel.host';

const getN8NUrl = (isTest: boolean) => 
    `${BASE_URL}/${isTest ? 'webhook-test' : 'webhook'}/nsg-horizon`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We expect { userId: string } in body, but pass whatever comes to n8n
    const fetchOptions: RequestInit = { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };

    // Try Production URL first
    const prodUrl = getN8NUrl(false);
    console.log(`[NSG-Horizon Proxy] POST ${prodUrl}`);

    let response = await fetch(prodUrl, fetchOptions);

    // If 404, try Test URL
    if (response.status === 404) {
        const testUrl = getN8NUrl(true);
        console.warn(`[NSG-Horizon Proxy] Production 404. Retrying with Test Webhook: ${testUrl}`);
        response = await fetch(testUrl, fetchOptions);
    }

    if (!response.ok) {
        console.error(`[NSG-Horizon Proxy] N8N Error: ${response.status}`);
        const text = await response.text();
        return NextResponse.json({ 
            error: "N8N Workflow Error",
            status: response.status,
            details: text
        }, { status: 502 });
    }

    const data = await response.json();
    console.log("--- N8N RESPONSE DATA ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("-------------------------");
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[NSG-Horizon Proxy] Server Error:', error);
    return NextResponse.json(
        { error: error.message || "Internal Server Error" }, 
        { status: 500 }
    );
  }
}
