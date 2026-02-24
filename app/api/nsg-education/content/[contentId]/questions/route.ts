import { NextResponse } from 'next/server';
import { CONFIG } from '@/lib/config';

/**
 * POST /api/nsg-education/content/[contentId]/questions
 * Proxy para el webhook de n8n que genera preguntas de análisis.
 * Evita exponer la URL de n8n directamente en el cliente.
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ contentId: string; }>; }
) {
    try {
        const { contentId } = await params;
        const body = await req.json();
        const authHeader = req.headers.get('Authorization');

        const BACKEND_URL = `${CONFIG.API_URL}/education/content/${contentId}/questions`;

        console.log(`[Education Questions] Delegating setup to backend for content: ${contentId}`);

        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
            body: JSON.stringify({
                action: body.action || 'start_questions',
                telegramId: body.telegramId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Education Questions] Error:', error);
        return NextResponse.json(
            { error: 'Failed to trigger questions protocol', message: error.message },
            { status: 502 }
        );
    }
}
