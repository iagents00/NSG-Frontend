import { NextResponse } from 'next/server';

/**
 * Unified N8N Proxy Configuration
 * Centralizes connection logic for both Chat and Document services.
 */
const BASE_URL = "https://personal-n8n.suwsiw.easypanel.host/webhook";

export async function POST(req: Request) {
  try {
    if (!BASE_URL) {
      console.error("❌ CRITICAL: BASE_URL is not defined.");
      return NextResponse.json({ error: "Server Configuration Error: Missing Webhook URL" }, { status: 500 });
    }

    // 1. Determine Request Type & Target Path
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    // Logic: Files -> nsg-documents, everything else -> nsg-chat
    const endpointPath = isMultipart ? 'nsg-documents' : 'nsg-chat';
    
    // 2. Prepare Fetch Options
    const fetchOptions: RequestInit = { method: 'POST' };
    
    if (isMultipart) {
        // FormData: Boundary is automatically set by fetch
        fetchOptions.body = await req.formData();
    } else {
        // JSON: Manual content-type
        fetchOptions.body = JSON.stringify(await req.json());
        fetchOptions.headers = { 'Content-Type': 'application/json' };
    }

    // 3. Execution
    // User manages the mode (test vs prod) via the env variable
    // We expect BASE_URL to be the common path, e.g. "https://domain.com/webhook"
    const targetUrl = `${BASE_URL}/${endpointPath}`;
    console.log(`[Proxy] POST ${targetUrl}`);

    const response = await fetch(targetUrl, fetchOptions);

    // 4. Handle Final Response
    if (!response.ok) {
        console.error(`[Proxy] N8N Error: ${response.status}`);
        const text = await response.text();
        
        return NextResponse.json({ 
            error: "N8N Workflow Error",
            status: response.status,
            details: text || "Check N8N execution logs."
        }, { status: 502 });
    }

    // Return Data (Try JSON, fall back to text)
    const responseText = await response.text();
    try {
        return NextResponse.json(JSON.parse(responseText));
    } catch {
        return NextResponse.json({ message: responseText });
    }

  } catch (error: any) {
    console.error('[Proxy] Server Error:', error);
    return NextResponse.json(
        { error: error.message || "Internal Server Error" }, 
        { status: 500 }
    );
  }
}
