"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { quickValidate, validateHistoricalFigure } from "@/lib/validation";

export default function Home() {
  const [figureName, setFigureName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const showInvalidNameAlert = (name: string) => {
    alert(
      `Please enter a valid historical figure name.\n\nThe name "${name}" does not appear to be a recognized historical figure.\n\nPlease try entering a real historical figure's name.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = figureName.trim();
    if (!trimmedName) return;

    setIsLoading(true);

    // Quick validation first (curated list)
    if (!quickValidate(trimmedName)) {
      // If not in curated list, try AI validation
      try {
        const isValid = await validateHistoricalFigure(trimmedName);
        if (!isValid) {
          setIsLoading(false);
          showInvalidNameAlert(trimmedName);
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        // On validation error, be strict and show alert
        setIsLoading(false);
        showInvalidNameAlert(trimmedName);
        return;
      }
    }

    // Validation passed, navigate to chat
    router.push(`/chat/${encodeURIComponent(trimmedName)}`);
  };

  const handleFigureClick = async (name: string) => {
    setIsLoading(true);

    // Quick validation (suggested figures should all be valid, but check anyway)
    if (!quickValidate(name)) {
      // Try AI validation as fallback
      try {
        const isValid = await validateHistoricalFigure(name);
        if (!isValid) {
          setIsLoading(false);
          showInvalidNameAlert(name);
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        setIsLoading(false);
        showInvalidNameAlert(name);
        return;
      }
    }

    // Validation passed, navigate to chat
    router.push(`/chat/${encodeURIComponent(name)}`);
  };

  const suggestedFigures = [
    "Socrates",
    "Leonardo da Vinci",
    "Joan of Arc",
    "Isaac Newton",
    "Ada Lovelace",
    "Cleopatra",
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            Voices of History
          </h1>
          <p className="text-lg text-foreground/80">
            Where History Talks Back. Chat with the minds that shaped our world.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-card to-card/95 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-8 md:p-12 mb-8 border border-border/50 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Who would you like to talk to?
          </h2>
          <p className="text-foreground/70 mb-8 text-base leading-relaxed">
            Enter the name of any historical figure, and they'll share their knowledge with you about their era.
          </p>

          <form onSubmit={handleSubmit} className="mb-8">
            <input
              type="text"
              value={figureName}
              onChange={(e) => setFigureName(e.target.value)}
              placeholder="Einstein"
              className="w-full px-6 py-4 rounded-xl border-2 border-border/60 bg-background/50 text-foreground placeholder-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all duration-300 mb-4 shadow-sm"
            />
            <button
              type="submit"
              disabled={!figureName.trim() || isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary via-accent to-primary text-white font-semibold text-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-md"
            >
              {isLoading ? "Loading..." : "Start Conversation"}
            </button>
          </form>

          <hr className="border-border/60 mb-8" />

          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Try these historical figures:</h3>
            <div className="grid grid-cols-2 gap-4">
              {suggestedFigures.map((figure, index) => (
                <button
                  key={index}
                  onClick={() => handleFigureClick(figure)}
                  disabled={isLoading}
                  className="text-left text-accent hover:text-primary hover:underline transition-all duration-300 disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-primary/5"
                >
                  {figure}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-foreground/60 text-sm mt-8">
          <p>Experience history through conversation with historical figures</p>
        </footer>
      </div>
    </div>
  );
}
