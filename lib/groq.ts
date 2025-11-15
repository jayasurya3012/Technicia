import Groq from "groq-sdk";

// Get Groq client instance (lazy initialization)
export function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
  });
}

// Default model to use for chat completions
// Updated from llama-3.1-70b-versatile (decommissioned) to llama-3.3-70b-versatile
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Maximum tokens for responses
export const MAX_TOKENS = 1024;

