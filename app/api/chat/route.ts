import { NextResponse } from 'next/server';

/**
 * Unified N8N Proxy Configuration
 * Centralizes connection logic for both Chat and Document services.
 */
const BASE_URL = (process.env.N8N_WEBHOOK || "https://personal-n8n.suwsiw.easypanel.host/webhook").trim();

export async function POST(req: Request) {
  try {
    if (!BASE_URL || BASE_URL === "") {
      return NextResponse.json({ 
        error: "Server Configuration Error: Missing Webhook URL",
        status: 500
      }, { status: 500 });
    }
    // 1. Determine Request Type & Target Path
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // 2. Parse Body & Determine Target Path
    let bodyData: any;
    const fetchOptions: RequestInit = { method: 'POST' };

    let intelligenceMode = 'pulse'; // Default

    if (isMultipart) {
      // FormData: Parse to extract mode, then forward
      const formData = await req.formData();
      bodyData = formData; // Keep as FormData for forwarding
      
      // 1. Try Root Mode (New structure)
      const rootMode = formData.get('mode') as string;
      if (rootMode) {
          intelligenceMode = rootMode;
      } else {
          // 2. Legacy: Check Context Mode
          const contextStr = formData.get('context') as string;
          if (contextStr) {
              try {
                  const context = JSON.parse(contextStr);
                  if (context.mode) intelligenceMode = context.mode;
              } catch {
                  // ignore parse error, use default
              }
          }
      }
      
      // FormData body is set directly
      fetchOptions.body = formData; 
    } else {
      // JSON: Parse to extract mode, then forward
      const jsonData = await req.json();
      bodyData = jsonData;
      
      if (jsonData.mode) {
          intelligenceMode = jsonData.mode;
      } else if (jsonData.context?.mode) {
          intelligenceMode = jsonData.context.mode;
      }
      
      fetchOptions.body = JSON.stringify(jsonData);
      fetchOptions.headers = { 'Content-Type': 'application/json' };
    }
    
    // 3. Forward Authorization Header (Security)
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
        // If headers is undefined (FormData case), init it
        if (!fetchOptions.headers) {
             fetchOptions.headers = {};
        }
        // If it's a Headers object (unlikely here as we init with object), handle strictly
        // We initialized fetchOptions above. strict typing might need casting if we assume HeadersInit
        (fetchOptions.headers as Record<string, string>)['Authorization'] = authHeader;
    }
    
    // Unified endpoint as requested: 'ai/dynamic'
    const endpointPath = "ai/dynamic";
    
    // 3. Execution
    const targetUrl = `${BASE_URL}/${endpointPath}`;
    console.log(`[N8N Proxy] Forwarding to: ${targetUrl} (Mode: ${intelligenceMode})`);

    const response = await fetch(targetUrl, fetchOptions);

    // 4. Handle Final Response
    if (!response.ok) {
      const text = await response.text();
      console.warn(`[N8N Proxy] received ${response.status} from ${targetUrl}:`, text.substring(0, 100));

      return NextResponse.json({
        error: "N8N Workflow Error",
        status: response.status,
        details: text || "Check N8N execution logs.",
        targetUrl: targetUrl
      }, { status: response.status });
    }

    // 5. Smart Parsing (Following best practices)
    try {
      let data = await response.json();

      // Normalization: Handle n8n array wrapper [ { ... } ]
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }

      // Normalization: Handle n8n 'json' key nesting
      if (data && typeof data === 'object' && data.json) {
        data = data.json;
      }

      return NextResponse.json(data);
    } catch (e) {
      // Fallback if response is not JSON
      const responseText = await response.text();
      console.log("[N8N Proxy] Non-JSON response received:", responseText.substring(0, 50));
      return NextResponse.json({ message: responseText });
    }

  } catch (error) {
    console.error(`[N8N Proxy Error] Failed to fetch from ${BASE_URL}:`, error);
    return NextResponse.json(
      { 
        error: (error as Error).message || "Internal Server Error",
        details: "Please verify that the N8N webhook URL is correct and the service is active.",
        targetHost: BASE_URL.split('/')[2] // Useful for debugging DNS/host issues
      },
      { status: 500 }
    );
  }
}
