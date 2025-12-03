import { getOrCreateCache } from "@/lib/gemini/cacheManager";
import { SYSTEM_INSTRUCTIONS } from "@/lib/gemini/systemInstructions";

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    
    if (!role || !SYSTEM_INSTRUCTIONS[role as keyof typeof SYSTEM_INSTRUCTIONS]) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const cacheName = await getOrCreateCache(role as keyof typeof SYSTEM_INSTRUCTIONS);
    
    return Response.json({ cacheName });
  } catch (error: any) {
    console.error("Context creation failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
