import { NextResponse } from 'next/server';
import { CONFIG } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const authHeader = req.headers.get('authorization');

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {} as Record<string, string>
    };

    if (authHeader) {
      (fetchOptions.headers as Record<string, string>)['Authorization'] = authHeader;
    }

    let body = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      fetchOptions.body = formData;
    } else {
      const text = await req.text();
      try {
        body = text ? JSON.parse(text) : {};
        fetchOptions.body = JSON.stringify(body);
        (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
      } catch {
        console.warn("[Education Ingest] Failed to parse request body as JSON:", text);
        fetchOptions.body = text;
      }
    }

    const WEBHOOK_URL = `${CONFIG.N8N_URL}/education`;
    console.log(`[Education Ingest] Forwarding to: ${WEBHOOK_URL}`);

    const response = await fetch(WEBHOOK_URL, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Education API] N8N Error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `N8N responded with ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : { success: true, message: 'Workflow started' };
    } catch (parseError) {
      console.warn("[Education Ingest] Webhook response was not valid JSON:", responseText, parseError);
      data = { success: true, raw: responseText };
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("[Education Ingest API Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
