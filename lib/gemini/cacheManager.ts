import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAICacheManager } from "@google/generative-ai/server";
import { SYSTEM_INSTRUCTIONS } from "./systemInstructions";

const apiKey = "TU_GOOGLE_AI_API_KEY";
const cacheManager = new GoogleAICacheManager(apiKey);

// Map to store active cache names in memory
const activeCaches = new Map<string, string>();

export async function getOrCreateCache(role: keyof typeof SYSTEM_INSTRUCTIONS) {
  if (activeCaches.has(role)) {
    return activeCaches.get(role);
  }

  const systemInstruction = SYSTEM_INSTRUCTIONS[role];
  const model = "models/gemini-1.5-flash-001";

  try {
    // List existing caches to find if one already exists for this role (optional optimization)
    // For now, we create a new one with a TTL.
    
    const cache = await cacheManager.create({
      model,
      displayName: `nsg-cache-${role}`,
      systemInstruction,
      contents: [],
      ttlSeconds: 3600, // 1 hour
    });

    console.log(`Created cache for ${role}: ${cache.name}`);
    if (cache.name) {
      activeCaches.set(role, cache.name);
      return cache.name;
    }
    return null;
  } catch (error) {
    console.error("Failed to create cache:", error);
    return null;
  }
}
