import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, userId, step } = body;

    // TODO: Connect to n8n webhook
    // const WEBHOOK_URL = process.env.N8N_WEBHOOK_ONBOARDING;
    // const response = await fetch(WEBHOOK_URL, { ... });

    // Mock Response for "Apple Pro" Demo
    return NextResponse.json({
        success: true,
        data: {
            answer: "Entendido. Procesando tu respuesta...",
            nextStep: step + 1,
            contextUpdate: {
                // Mock context update that n8n would return
                detectedGoal: "Escalar Negocio",
            }
        }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
