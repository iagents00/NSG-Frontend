import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  props: { params: Promise<{ contentId: string }> }
) {
  const params = await props.params;
  try {
    const { contentId } = params;
    const body = await req.json();
    const { message, history, preferences } = body;

    // Direct connection to n8n Webhook
    // Replace with your actual N8N Webhook URL for Chat
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_CHAT || "https://nsg-k8s.onrender.com/webhook/nsg-education-chat";

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: "session-" + Math.random().toString(36).substring(7), // or get from auth
        action: "chat",
        contentId,
        message,
        history,
        preferences
      }),
    });

    if (!n8nResponse.ok) {
        throw new Error(`n8n responded with ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();

    // Expecting n8n to return { output: "AI response text" } or similar
    // We map it to our Message format
    const aiMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: data.output || data.message || "Respuesta procesada por n8n.",
        type: 'text',
        timestamp: new Date()
    };

    return NextResponse.json({
        success: true,
        message: aiMessage
    });

  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to AI engine" },
      { status: 502 }
    );
  }
}
