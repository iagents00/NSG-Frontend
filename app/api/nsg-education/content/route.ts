import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, type, userId } = body;

    // TODO: Connect to n8n webhook
    // const WEBHOOK_URL = process.env.N8N_WEBHOOK_CONTENT;

    // Mock Response
    return NextResponse.json({
        success: true,
        data: {
             id: Math.random().toString(36).substring(7),
             status: 'processing',
             message: "Contenido enviado a procesamiento."
        }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
    // Mock getting library items
    return NextResponse.json({
        success: true,
        data: [
            { id: '1', title: 'Cómo escalar tu agencia en 2024', type: 'video', status: 'ready', createdAt: new Date().toISOString() },
            { id: '2', title: 'Protocolo de Sueño Huberman', type: 'pdf', status: 'processing', createdAt: new Date().toISOString() }
        ]
    })
}
