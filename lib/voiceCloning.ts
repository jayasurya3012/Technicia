/**
 * Voice Cloning API Utility
 * Handles communication with the custom voice cloning server
 */

export interface VoiceGenerationOptions {
  text: string;
  speaker: string;
}

export interface VoiceGenerationResult {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  error?: string;
  generationTime?: string;
  textLength?: string;
}

/**
 * Generates audio using the custom voice cloning server
 * @param options - The text and speaker to generate audio for
 * @returns A promise with the result containing the audio blob or error
 */
export async function generateVoiceAudio(
  options: VoiceGenerationOptions
): Promise<VoiceGenerationResult> {
  try {
    const { text, speaker } = options;

    console.log("[Voice Cloning] Generating audio for:", speaker);
    console.log("[Voice Cloning] Text length:", text.length);
    console.log("[Voice Cloning] Text preview:", text.substring(0, 50));

    // Call our Next.js API route which proxies to the voice server
    const response = await fetch("/api/voice/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, speaker }),
    });

    console.log("[Voice Cloning] Response status:", response.status);
    console.log("[Voice Cloning] Response content-type:", response.headers.get("content-type"));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error occurred",
      }));

      console.error("[Voice Cloning] Server returned error:", errorData);

      return {
        success: false,
        error: errorData.message || errorData.error || "Failed to generate audio",
      };
    }

    // Get the audio blob
    const audioBlob = await response.blob();
    console.log("[Voice Cloning] Received audio blob:", audioBlob.size, "bytes", audioBlob.type);

    // Check if blob is actually audio
    if (audioBlob.size === 0) {
      console.error("[Voice Cloning] Received empty audio blob!");
      return {
        success: false,
        error: "Received empty audio file from server",
      };
    }

    // Get metadata from headers
    const generationTime = response.headers.get("X-Generation-Time");
    const textLength = response.headers.get("X-Text-Length");

    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log("[Voice Cloning] Audio generated successfully");
    console.log("[Voice Cloning] Generation time:", generationTime);

    return {
      success: true,
      audioUrl,
      audioBlob,
      generationTime: generationTime || undefined,
      textLength: textLength || undefined,
    };
  } catch (error: any) {
    console.error("[Voice Cloning] Error generating audio:", error);
    console.error("[Voice Cloning] Error details:", error.message, error.stack);
    return {
      success: false,
      error: error?.message || "An error occurred while generating audio",
    };
  }
}

/**
 * Plays audio from a blob or URL
 * @param audioSource - Either a Blob or URL string
 * @returns A promise that resolves when the audio finishes playing
 */
export function playAudio(audioSource: Blob | string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio();

      // Set the audio source
      if (typeof audioSource === "string") {
        audio.src = audioSource;
      } else {
        audio.src = URL.createObjectURL(audioSource);
      }

      // Event listeners
      audio.onended = () => {
        // Clean up object URL if we created one
        if (audioSource instanceof Blob) {
          URL.revokeObjectURL(audio.src);
        }
        resolve();
      };

      audio.onerror = (error) => {
        console.error("[Voice Cloning] Audio playback error:", error);
        // Clean up object URL if we created one
        if (audioSource instanceof Blob) {
          URL.revokeObjectURL(audio.src);
        }
        reject(new Error("Failed to play audio"));
      };

      // Start playing
      audio.play().catch((error) => {
        console.error("[Voice Cloning] Failed to start audio playback:", error);
        // Clean up object URL if we created one
        if (audioSource instanceof Blob) {
          URL.revokeObjectURL(audio.src);
        }
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates and plays audio in one go
 * @param options - The text and speaker to generate audio for
 * @returns A promise that resolves when the audio finishes playing or rejects on error
 */
export async function generateAndPlayVoice(
  options: VoiceGenerationOptions
): Promise<void> {
  const result = await generateVoiceAudio(options);

  if (!result.success || !result.audioBlob) {
    throw new Error(result.error || "Failed to generate audio");
  }

  await playAudio(result.audioBlob);
}

/**
 * Cleans text for TTS by removing markdown and special characters
 * @param text - The raw text to clean
 * @returns Cleaned text suitable for TTS
 */
export function cleanTextForTTS(text: string): string {
  let cleaned = text;

  // Remove markdown bold markers
  cleaned = cleaned.replace(/\*\*/g, "");
  cleaned = cleaned.replace(/\*/g, "");

  // Remove bracketed sounds like [laughter], [sighs] for TTS (they're visual indicators)
  cleaned = cleaned.replace(/\[[^\]]+\]/g, "");

  // Handle song symbol (♪) - remove it
  cleaned = cleaned.replace(/♪/g, "");

  return cleaned.trim();
}
