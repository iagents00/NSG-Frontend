import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { jwtVerify } from 'jose';

// Helper to get secret key for verification
const getJwtSecretKey = () => {
    const secret = process.env.TOKEN_SECRET;
    if (!secret || secret.length === 0) {
        throw new Error('The environment variable TOKEN_SECRET is not set.');
    }
    return new TextEncoder().encode(secret);
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    let userId: string | null = null;
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        userId = (payload.userId || payload.sub || payload.id || payload.uid) as string;
    } catch {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 }); 
    }

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized: Invalid token format' }, { status: 401 }); 
    }

    const client = await clientPromise;
    const db = client.db('Cluster0');

    const chat = await db.collection('conversation_threads').findOne({
        sessionId: chatId,
        userId: userId 
    });

    if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Spec: { "chatId": "...", "messages": [ ... ] }
    return NextResponse.json({
        chatId: chat.sessionId,
        messages: chat.history || chat.messages || [] 
    });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
