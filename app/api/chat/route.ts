import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, DEFAULT_MODEL } from "@/lib/groq";
import { getPromptForFigure } from "@/lib/prompts";

// Use Node.js runtime instead of Edge for better compatibility with Groq SDK and environment variables
export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  figure: string;
  messages: Message[];
  userMessage: string;
}

export async function POST(req: NextRequest) {
  try {
    // Log environment variable presence (not the actual key for security)
    const apiKeyPresent = !!process.env.GROQ_API_KEY;
    console.log("[API] GROQ_API_KEY present:", apiKeyPresent);
    
    if (!apiKeyPresent) {
      console.error("[API] ERROR: GROQ_API_KEY environment variable is missing!");
      return NextResponse.json(
        { error: "Server configuration error: API key not found" },
        { status: 500 }
      );
    }

    const { figure, messages, userMessage }: ChatRequest = await req.json();
    console.log("[API] Request received - Figure:", figure, "Message length:", userMessage?.length);

    if (!figure || !userMessage) {
      console.error("[API] Missing required fields - Figure:", !!figure, "Message:", !!userMessage);
      return NextResponse.json(
        { error: "Figure name and message are required" },
        { status: 400 }
      );
    }

    // Get the system prompt for this historical figure
    const systemPrompt = getPromptForFigure(figure);
    console.log("[API] System prompt generated for:", figure);

    // Build the messages array for the API
    const apiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages,
      { role: "user", content: userMessage },
    ];
    console.log("[API] Total messages in conversation:", apiMessages.length);

    // Create a streaming response
    console.log("[API] Initializing Groq client...");
    const groq = getGroqClient();
    
    console.log("[API] Calling Groq API with model:", DEFAULT_MODEL);
    const stream = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });
    
    console.log("[API] Stream created successfully");

    // Create a ReadableStream to send the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("[API] ERROR - Full error object:", error);
    console.error("[API] ERROR - Error message:", error?.message);
    console.error("[API] ERROR - Error stack:", error?.stack);
    console.error("[API] ERROR - Error name:", error?.name);
    
    // If it's a Groq API error, log additional details
    if (error?.error) {
      console.error("[API] ERROR - Groq API error details:", error.error);
    }
    
    const errorMessage = error?.message || error?.error?.message || "An error occurred while processing your request";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined 
      },
      { status: 500 }
    );
  }
}

