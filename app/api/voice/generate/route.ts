import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface VoiceGenerateRequest {
  text: string;
  speaker: string;
}

export async function POST(req: NextRequest) {
  try {
    const { text, speaker }: VoiceGenerateRequest = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get the voice server URL from environment variable, default to localhost:8000
    const voiceServerUrl = process.env.VOICE_SERVER_URL || "http://localhost:8000";

    console.log(`[Voice API] Generating audio for speaker: ${speaker}`);
    console.log(`[Voice API] Text length: ${text.length} characters`);
    console.log(`[Voice API] Voice server URL: ${voiceServerUrl}`);

    // Create FormData to send to the voice server
    const formData = new FormData();
    formData.append("text", text);
    formData.append("speaker", speaker || "default");

    // Forward the request to the voice cloning server
    const response = await fetch(`${voiceServerUrl}/generate`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("[Voice API] Error from voice server:", errorData);
      return NextResponse.json(
        {
          error: "Failed to generate audio",
          message: errorData.error || errorData.message || "Voice generation failed"
        },
        { status: response.status }
      );
    }

    // Get the audio blob from the response
    const audioBlob = await response.blob();

    // Get custom headers from the voice server
    const generationTime = response.headers.get("X-Generation-Time");
    const textLength = response.headers.get("X-Text-Length");
    const speakerName = response.headers.get("X-Speaker");

    console.log(`[Voice API] Audio generated successfully`);
    console.log(`[Voice API] Generation time: ${generationTime}s`);
    console.log(`[Voice API] Audio size: ${(audioBlob.size / 1024).toFixed(2)} KB`);

    // Return the audio file with appropriate headers
    return new NextResponse(audioBlob, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `inline; filename="${speaker.replace(/\s+/g, "_")}_voice.wav"`,
        "X-Generation-Time": generationTime || "unknown",
        "X-Text-Length": textLength || "unknown",
        "X-Speaker": speakerName || speaker || "unknown",
      },
    });
  } catch (error: any) {
    console.error("[Voice API] Error:", error);

    // Check if it's a connection error
    if (error.code === "ECONNREFUSED" || error.message?.includes("fetch failed")) {
      return NextResponse.json(
        {
          error: "Voice server unavailable",
          message: "Could not connect to the voice cloning server. Make sure it's running on localhost:8000"
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Audio generation failed",
        message: error?.message || "An error occurred while generating audio"
      },
      { status: 500 }
    );
  }
}
