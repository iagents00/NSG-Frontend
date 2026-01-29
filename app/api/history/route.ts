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

export async function GET(req: Request) {
  try {
    // 1. Extract Authorization Header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify Token
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

    // 3. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('Cluster0');

    // 4. Query Chats
    const chats = await db.collection('conversation_threads')
      .find(
        { userId: userId }, 
        { projection: { title: 1, sessionId: 1, lastUpdate: 1, _id: 0 } }
      )
      .sort({ lastUpdate: -1 })
      .limit(50)
      .toArray();

    // 5. Map to User Spec Format
    // Spec: [ { "chatId": "...", "title": "...", "date": "..." } ]
    const mappedChats = chats.map(chat => ({
        chatId: chat.sessionId,
        title: chat.title,
        date: chat.lastUpdate
    }));

    return NextResponse.json(mappedChats);

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
