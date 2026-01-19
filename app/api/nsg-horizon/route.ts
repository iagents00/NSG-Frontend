import { NextResponse } from 'next/server';


/**
 * Proxy for NSG Horizon Webhook
 * Path: /api/nsg-horizon
 */
const BASE_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK || "https://personal-n8n.suwsiw.easypanel.host/webhook";

export async function POST(req: Request) {
  try {
    if (!BASE_URL) {
      return NextResponse.json({ error: "Server Configuration Error: Missing Webhook URL" }, { status: 500 });
    }

    const body = await req.json();
    // We expect { userId: string } in body, but pass whatever comes to n8n
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };

    // Use BASE_URL directly
    const targetUrl = `${BASE_URL}/nsg-horizon`;

    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({
        error: "N8N Workflow Error",
        status: response.status,
        details: text
      }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
