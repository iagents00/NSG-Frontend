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

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      // Forward as FormData
      fetchOptions.body = formData;
      // Note: Fetch naturally sets the correct boundary when body is FormData
    } else {
      const body = await req.json();
      fetchOptions.body = JSON.stringify(body);
      (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
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

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("[Education Ingest API Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
    // Mock getting library items (Eventually from n8n or database)
    return NextResponse.json({
        success: true,
        data: [
            { id: '1', title: 'Cómo escalar tu agencia en 2024', type: 'video', status: 'ready', createdAt: '2024-01-20T10:00:00Z' },
            { id: '2', title: 'Protocolo de Sueño Huberman', type: 'pdf', status: 'processing', createdAt: '2024-01-21T12:00:00Z' }
        ]
    })
}
