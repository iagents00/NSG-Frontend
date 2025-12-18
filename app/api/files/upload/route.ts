import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const fileManager = new GoogleAIFileManager("AIzaSyCpMQ2YeGCANu0tXZAUcRhOs697ep8z7CM");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to temp directory
    const tempPath = join(tmpdir(), `nsg-${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    // Upload to Gemini
    const uploadResponse = await fileManager.uploadFile(tempPath, {
      mimeType: file.type,
      displayName: file.name,
    });

    // Clean up temp file
    await unlink(tempPath);

    return Response.json({ 
      status: "success", 
      fileUri: uploadResponse.file.uri,
      name: uploadResponse.file.name 
    });

  } catch (error: any) {
    console.error("Upload failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
