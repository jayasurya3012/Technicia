"use client";

import { useState, useEffect, useRef } from "react";
import { generateVoiceAudio, playAudio, cleanTextForTTS } from "@/lib/voiceCloning";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  figureName?: string;
  isStreaming?: boolean;
}

/**
 * Format text with markdown bold, natural speech elements, and other formatting
 * Handles incomplete markers gracefully for streaming text
 */
function formatText(text: string, isStreaming: boolean = false): string {
  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  };

  let escaped = escapeHtml(text);

  // For streaming text, don't render incomplete bold markers
  // Count the number of ** markers
  const boldMarkers = (escaped.match(/\*\*/g) || []).length;
  const hasIncompleteBold = boldMarkers % 2 !== 0;

  if (isStreaming && hasIncompleteBold) {
    // Remove the last incomplete ** marker for streaming
    const lastBoldIndex = escaped.lastIndexOf("**");
    if (lastBoldIndex !== -1) {
      escaped = escaped.substring(0, lastBoldIndex) + escaped.substring(lastBoldIndex + 2);
    }
  }

  // Replace **text** with <strong>text</strong>
  // Use non-greedy matching to handle multiple bold sections
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Style bracketed sounds [laughter], [sighs], etc. with italic and muted color
  escaped = escaped.replace(/\[([^\]]+)\]/g, '<span class="italic text-foreground/60 text-sm">[$1]</span>');

  // Ensure em dashes render correctly (— is U+2014)
  // Already escaped, but ensure proper display
  escaped = escaped.replace(/—/g, '&mdash;');
  
  // Ensure ellipses render correctly
  // Already escaped, but ensure proper display
  escaped = escaped.replace(/\.\.\./g, '&hellip;');

  // Song symbol (♪) - ensure it displays properly (U+266A)
  // The symbol should already be in the text, just ensure it's not escaped
  // No special handling needed as it's a valid Unicode character

  return escaped;
}

export default function MessageBubble({ message, figureName, isStreaming = false }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleReadAloud = async () => {
    if (isPlaying) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (!figureName) {
      console.error("[MessageBubble] No figure name provided");
      return;
    }

    try {
      setIsGenerating(true);

      // Always use custom voice cloning server
      console.log(`[MessageBubble] Generating voice-cloned audio for ${figureName}`);

      const cleanedText = cleanTextForTTS(message.content);

      const result = await generateVoiceAudio({
        text: cleanedText,
        speaker: figureName,
      });

      if (!result.success || !result.audioBlob) {
        throw new Error(result.error || "Failed to generate audio");
      }

      console.log(`[MessageBubble] Audio generated successfully. Generation time: ${result.generationTime}s`);

      // Play the generated audio
      setIsPlaying(true);
      setIsGenerating(false);

      await playAudio(result.audioBlob);
      setIsPlaying(false);

    } catch (error) {
      console.error("[MessageBubble] Error playing audio:", error);
      setIsPlaying(false);
      setIsGenerating(false);

      // Show error to user
      alert("Failed to play audio. Make sure the voice server is running on localhost:8000");
    }
  };

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  const isAssistant = message.role === "assistant";

  return (
    <div 
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
      style={{
        transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isAssistant
            ? "bg-secondary/20 border border-secondary/30"
            : "bg-accent/20 border border-accent/30"
        }`}
        style={{
          transition: "height 600ms cubic-bezier(0.4, 0, 0.2, 1), width 600ms cubic-bezier(0.4, 0, 0.2, 1), padding 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms ease-in-out",
          willChange: isStreaming ? "height, width, contents" : "auto",
          minHeight: "min-content",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {isAssistant && figureName && (
          <div className="font-semibold text-primary mb-2">{figureName}</div>
        )}
        <div 
          className="text-foreground whitespace-pre-wrap break-words"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            transition: "opacity 300ms ease-in-out, transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isStreaming ? 1 : 1,
            transform: "translateZ(0)",
            willChange: isStreaming ? "contents" : "auto",
          }}
          dangerouslySetInnerHTML={{
            __html: formatText(message.content, isStreaming) + (isStreaming ? '<span class="animate-pulse">▋</span>' : ''),
          }}
        />
        {isAssistant && !isStreaming && (
          <button
            onClick={handleReadAloud}
            disabled={isGenerating}
            className="mt-3 text-sm text-primary/70 hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "⏳ Generating..." : isPlaying ? "⏸️ Stop" : "🔊 Read aloud"}
          </button>
        )}
      </div>
    </div>
  );
}

