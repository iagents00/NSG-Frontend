import { NextResponse } from 'next/server';

/**
 * Unified N8N Proxy Configuration
 * Centralizes connection logic for both Chat and Document services.
 */
const BASE_URL = "https://personal-n8n.suwsiw.easypanel.host/webhook";

export async function POST(req: Request) {
  try {
    // 1. Determine Request Type & Target Path
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // 2. Parse Body & Determine Target Path
    let bodyData: any;
    let fetchOptions: RequestInit = { method: 'POST' };

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
              } catch (e) {
                  // ignore parse error, use default
              }
          }
      }
      
      // FormData body is set directly
      fetchOptions.body = formData; 
    } else {
      // JSON: Parse to extract mode, then forward
      bodyData = await req.json();
      
      if (bodyData.mode) {
          intelligenceMode = bodyData.mode;
      } else if (bodyData.context?.mode) {
          intelligenceMode = bodyData.context.mode;
      }
      
      fetchOptions.body = JSON.stringify(bodyData);
      fetchOptions.headers = { 'Content-Type': 'application/json' };
    }
    
    // Map mode to path (secure fallback)
    const validModes = ['pulse', 'compare', 'fusion', 'deep'];
    // User requested 'ai/pulse', 'ai/compare', 'ai/fusion'. Assuming 'deep' maps to ai/deep or fallback.
    // Let's sanitize to be safe.
    const cleanMode = validModes.includes(intelligenceMode) ? intelligenceMode : 'pulse';
    
    const endpointPath = `ai/${cleanMode}`;
    
    // 3. Execution
    // User manages the mode (test vs prod) via the env variable
    // We expect BASE_URL to be the common path, e.g. "https://domain.com/webhook"
    const targetUrl = `${BASE_URL}/${endpointPath}`;

    const response = await fetch(targetUrl, fetchOptions);

    // 4. Handle Final Response
    if (!response.ok) {
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
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
