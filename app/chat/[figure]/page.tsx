"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import MessageBubble from "@/components/MessageBubble";
import VoiceInput from "@/components/VoiceInput";
import FigureImage from "@/components/FigureImage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const figureName = decodeURIComponent(params.figure as string);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordBufferRef = useRef<string>("");
  const displayedTextRef = useRef<string>("");
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Word-by-word streaming with natural speech timing
  const streamWordsWithTiming = (
    textBuffer: string,
    onUpdate: (text: string) => void
  ) => {
    // Process new text from buffer
    const newText = textBuffer.slice(displayedTextRef.current.length);
    if (newText.length === 0) return; // No new text to process
    
    wordBufferRef.current += newText;

    // Extract complete words (ending with space or punctuation)
    // Pattern matches: word + space/punctuation, or just punctuation
    const wordPattern = /(\S+[\s.,!?;:]|[\s.,!?;:])/g;
    let match;
    const wordsToAdd: string[] = [];
    let lastIndex = 0;

    while ((match = wordPattern.exec(wordBufferRef.current)) !== null) {
      wordsToAdd.push(match[0]);
      lastIndex = match.index + match[0].length;
    }

    // Remove processed words from buffer
    if (wordsToAdd.length > 0) {
      wordBufferRef.current = wordBufferRef.current.slice(lastIndex);
    }

    // Display words one by one with natural timing
    if (wordsToAdd.length > 0 && !streamingTimeoutRef.current) {
      let currentIndex = 0;
      const displayNextWord = () => {
        if (currentIndex < wordsToAdd.length) {
          const word = wordsToAdd[currentIndex];
          displayedTextRef.current += word;
          onUpdate(displayedTextRef.current);

          // Determine delay based on punctuation
          let delay = 70; // Base delay for normal words (ms)
          const trimmedWord = word.trim();
          const lastChar = trimmedWord.slice(-1);

          if (lastChar === "." || lastChar === "!" || lastChar === "?") {
            delay = 350; // Longer pause for sentence endings
          } else if (lastChar === "," || lastChar === ";") {
            delay = 180; // Medium pause for commas/semicolons
          } else if (lastChar === ":") {
            delay = 130; // Slight pause for colons
          } else if (trimmedWord.length > 10) {
            delay = 90; // Slightly longer for longer words
          }

          currentIndex++;
          streamingTimeoutRef.current = setTimeout(() => {
            streamingTimeoutRef.current = null;
            displayNextWord();
          }, delay);
        } else {
          streamingTimeoutRef.current = null;
          // Check if there's more text to process
          if (wordBufferRef.current.length > 0) {
            // Try to process remaining buffer
            streamWordsWithTiming(textBuffer, onUpdate);
          }
        }
      };
      displayNextWord();
    } else if (wordBufferRef.current.length > 0 && textBuffer.length === displayedTextRef.current.length + wordBufferRef.current.length) {
      // If we're at the end and have remaining buffer, display it immediately
      displayedTextRef.current += wordBufferRef.current;
      wordBufferRef.current = "";
      onUpdate(displayedTextRef.current);
    }
  };

  // Reset streaming state
  const resetStreaming = () => {
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
      streamingTimeoutRef.current = null;
    }
    wordBufferRef.current = "";
    displayedTextRef.current = "";
  };

  // Cleanup conversation - stops TTS, streaming, and resets state
  const cleanupConversation = () => {
    // Cancel TTS
    if (currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
    // Ensure all speech is stopped
    window.speechSynthesis.cancel();
    
    // Clear streaming
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
      streamingTimeoutRef.current = null;
    }
    
    // Reset state
    setIsTTSPlaying(false);
    wordBufferRef.current = "";
    displayedTextRef.current = "";
    setStreamingMessage("");
  };

  // TTS Helper Function
  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Cancel any current speech
      if (currentUtteranceRef.current) {
        window.speechSynthesis.cancel();
      }

      let textForSpeech = text;
      
      // Remove markdown bold markers
      textForSpeech = textForSpeech.replace(/\*\*/g, "");
      
      // Remove bracketed sounds like [laughter], [sighs] for TTS (they're visual indicators)
      textForSpeech = textForSpeech.replace(/\[[^\]]+\]/g, "");
      
      // Handle hesitations: replace em dashes and ellipses with pauses
      // Em dash (—) - add a longer pause by inserting a comma and space
      textForSpeech = textForSpeech.replace(/—/g, ", ");
      // Ellipses (...) - add a pause
      textForSpeech = textForSpeech.replace(/\.\.\./g, "... ");
      
      // Handle song symbol (♪) - remove it
      textForSpeech = textForSpeech.replace(/♪/g, "");
      
      // Capitalization emphasis is kept - TTS will naturally emphasize capitalized words
      
      const utterance = new SpeechSynthesisUtterance(textForSpeech);
      currentUtteranceRef.current = utterance;
      setIsTTSPlaying(true);
      
      utterance.onend = () => {
        setIsTTSPlaying(false);
        currentUtteranceRef.current = null;
        resolve();
      };
      
      utterance.onerror = () => {
        setIsTTSPlaying(false);
        currentUtteranceRef.current = null;
        resolve();
      };
      
      window.speechSynthesis.speak(utterance);
    });
  };

  // Auto-scroll to bottom when messages change (only if transcript is visible)
  const scrollToBottom = () => {
    if (showTranscript && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, showTranscript]);

  // Cleanup streaming timeout and TTS on unmount
  useEffect(() => {
    return () => {
      cleanupConversation();
    };
  }, []);

  // Handle browser navigation (back/forward, tab close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupConversation();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Initialize with greeting
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      sendInitialGreeting();
    }
  }, [isInitialized]);

  const sendInitialGreeting = async () => {
    setIsLoading(true);
    resetStreaming(); // Reset streaming state for new message
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figure: figureName,
          messages: [],
          userMessage: "Hello! Please give me a brief introduction (2-3 sentences maximum) - just a Hi and general life.",
        }),
      });

      if (!response.ok) {
        // Try to read the error message from the response
        let errorMessage = "Failed to get response";
        try {
          const errorData = await response.json();
          // Handle nested error structure: {error: {message: "...", type: "...", code: "..."}}
          if (errorData.error) {
            if (typeof errorData.error === "string") {
              errorMessage = errorData.error;
            } else if (errorData.error.message) {
              errorMessage = errorData.error.message;
            } else {
              errorMessage = JSON.stringify(errorData.error);
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          console.error("[Frontend] API Error:", errorData);
        } catch (e) {
          console.error("[Frontend] Failed to parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          // Use word-by-word streaming instead of direct display
          streamWordsWithTiming(fullResponse, (text) => {
            setStreamingMessage(text);
          });
        }

        // Wait for any remaining words to be displayed
        await new Promise((resolve) => {
          const checkComplete = () => {
            if (!streamingTimeoutRef.current) {
              resolve(undefined);
            } else {
              setTimeout(checkComplete, 100);
            }
          };
          checkComplete();
        });

        setMessages([{ role: "assistant", content: fullResponse }]);
        setStreamingMessage("");
        resetStreaming();
        
        // Auto-play TTS after full response is received
        await speakText(fullResponse);
      }
    } catch (error) {
      console.error("Error getting initial greeting:", error);
      resetStreaming();
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      const errorMsg = `I apologize, but I'm having trouble responding right now. Error: ${errorMessage}`;
      setMessages([{ 
        role: "assistant", 
        content: errorMsg
      }]);
      // Also speak error message
      await speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    resetStreaming(); // Reset streaming state for new message

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figure: figureName,
          messages: messages,
          userMessage: messageText,
        }),
      });

      if (!response.ok) {
        // Try to read the error message from the response
        let errorMessage = "Failed to get response";
        try {
          const errorData = await response.json();
          // Handle nested error structure: {error: {message: "...", type: "...", code: "..."}}
          if (errorData.error) {
            if (typeof errorData.error === "string") {
              errorMessage = errorData.error;
            } else if (errorData.error.message) {
              errorMessage = errorData.error.message;
            } else {
              errorMessage = JSON.stringify(errorData.error);
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          console.error("[Frontend] API Error:", errorData);
        } catch (e) {
          console.error("[Frontend] Failed to parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          // Use word-by-word streaming instead of direct display
          streamWordsWithTiming(fullResponse, (text) => {
            setStreamingMessage(text);
          });
        }

        // Wait for any remaining words to be displayed
        await new Promise((resolve) => {
          const checkComplete = () => {
            if (!streamingTimeoutRef.current) {
              resolve(undefined);
            } else {
              setTimeout(checkComplete, 100);
            }
          };
          checkComplete();
        });

        setMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
        setStreamingMessage("");
        resetStreaming();
        
        // Auto-play TTS after full response is received
        await speakText(fullResponse);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      resetStreaming();
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      const errorMsg = `I apologize, but I'm having trouble responding right now. Error: ${errorMessage}`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
      // Also speak error message
      await speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    cleanupConversation();
    setMessages([]);
    setIsInitialized(false);
  };

  const handleBack = () => {
    cleanupConversation();
    router.push("/");
  };

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <header className="bg-card rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="text-foreground hover:text-primary transition-colors mr-4 text-2xl"
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{figureName}</h1>
            <p className="text-sm text-foreground/60">Historical Figure</p>
          </div>
        </div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/30 text-foreground hover:bg-secondary/30 transition-colors flex items-center gap-2"
          aria-label="Toggle transcript"
        >
          <span>📝</span>
          <span>{showTranscript ? "Hide" : "Show"} Transcript</span>
          {isTTSPlaying && (
            <span className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse" aria-label="Speaking"></span>
          )}
        </button>
      </header>

      {/* Figure Image */}
      <FigureImage figureName={figureName} />

      {/* Messages Area - Only shown when transcript is toggled */}
      {showTranscript && (
        <div 
          className="flex-1 bg-card rounded-2xl shadow-lg p-6 mb-4 overflow-y-auto scroll-smooth" 
          style={{ 
            scrollBehavior: "smooth",
            transform: "translateZ(0)",
            willChange: "scroll-position",
          }}
        >
          <div 
            className="space-y-4"
            style={{
              transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
              transform: "translateZ(0)",
            }}
          >
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} figureName={figureName} />
            ))}
            {streamingMessage && (
              <MessageBubble
                message={{ role: "assistant", content: streamingMessage }}
                figureName={figureName}
                isStreaming={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-card rounded-2xl shadow-lg p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            placeholder={`Ask ${figureName} about their life and era...`}
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:border-primary"
            disabled={isLoading}
          />
          <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-secondary to-accent text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Send
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-background transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

