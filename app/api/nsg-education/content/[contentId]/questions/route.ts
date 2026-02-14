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

        const WEBHOOK_URL = `${CONFIG.N8N_URL}/questions`;

        console.log(`[Education Questions] Triggering webhook for content: ${contentId}`);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: body.action || 'start_questions',
                contentId,
                telegramId: body.telegramId,
            }),
        });

        if (!response.ok) {
            throw new Error(`n8n responded with status ${response.status}`);
        }

        const responseText = await response.text();
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : { success: true, message: 'Questions workflow started' };
        } catch {
            console.warn("[Education Questions] Response was not valid JSON:", responseText);
            data = { success: true, raw: responseText };
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Education Questions] Error:', error);
        return NextResponse.json(
            { error: 'Failed to trigger question generation', message: error.message },
            { status: 502 }
        );
    }
}
