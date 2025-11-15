import { NextRequest, NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";
import { isKnownHistoricalFigure } from "@/lib/validation";

export const runtime = "nodejs";

interface ValidationRequest {
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name }: ValidationRequest = await req.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ isValid: false, reason: "Name too short" });
    }

    // First check curated list (fast, no API call needed)
    if (isKnownHistoricalFigure(name)) {
      return NextResponse.json({ isValid: true });
    }

    // If not in curated list, use AI to validate
    const groq = getGroqClient();
    
    const validationPrompt = `Is "${name}" a real historical figure who lived in the past? 

Respond with ONLY "YES" or "NO" - nothing else.
- YES if it's a real historical person (not fictional, not a modern person, not a generic term)
- NO if it's fictional, a modern person, a place, an object, or not a real historical figure

Examples:
- "Einstein" -> YES
- "Socrates" -> YES  
- "Harry Potter" -> NO (fictional)
- "Barack Obama" -> NO (modern, not historical)
- "London" -> NO (place, not a person)
- "Gandhi" -> YES`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a historical fact checker. Answer only YES or NO.",
        },
        {
          role: "user",
          content: validationPrompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent yes/no answers
      max_tokens: 10,
    });

    const answer = response.choices[0]?.message?.content?.trim().toUpperCase() || "";
    const isValid = answer === "YES" || answer.startsWith("YES");

    return NextResponse.json({ isValid });
  } catch (error: any) {
    console.error("[Validation API] Error:", error);
    // On error, default to false (strict validation)
    return NextResponse.json(
      { isValid: false, error: error?.message || "Validation failed" },
      { status: 500 }
    );
  }
}

