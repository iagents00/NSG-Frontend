import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers, userId } = body;

    // TODO: Connect to n8n webhook
    // const WEBHOOK_URL = process.env.N8N_WEBHOOK_DIAGNOSTIC;

    // Mock Response: The 3-Column Plan
    return NextResponse.json({
        success: true,
        data: {
             processes: [
                 { title: "Cuello de Botella", desc: "Revisión manual de leads", severity: "high" }
             ],
             automations: [
                 { title: "Lead Scoring", tool: "n8n + OpenAI", timeSaved: "5h/week" }
             ],
             roadmap: [
                 { day: "30", task: "Implementar CRM" }
             ]
        }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
