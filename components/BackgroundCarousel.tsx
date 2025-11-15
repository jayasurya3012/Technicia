"use client";

import { useState, useEffect } from "react";

// Greek alphabet letters (both uppercase and lowercase)
const greekLetters = [
  { letter: "Α", name: "Alpha" },
  { letter: "Β", name: "Beta" },
  { letter: "Γ", name: "Gamma" },
  { letter: "Δ", name: "Delta" },
  { letter: "Ε", name: "Epsilon" },
  { letter: "Ζ", name: "Zeta" },
  { letter: "Η", name: "Eta" },
  { letter: "Θ", name: "Theta" },
  { letter: "Ι", name: "Iota" },
  { letter: "Κ", name: "Kappa" },
  { letter: "Λ", name: "Lambda" },
  { letter: "Μ", name: "Mu" },
  { letter: "Ν", name: "Nu" },
  { letter: "Ξ", name: "Xi" },
  { letter: "Ο", name: "Omicron" },
  { letter: "Π", name: "Pi" },
  { letter: "Ρ", name: "Rho" },
  { letter: "Σ", name: "Sigma" },
  { letter: "Τ", name: "Tau" },
  { letter: "Υ", name: "Upsilon" },
  { letter: "Φ", name: "Phi" },
  { letter: "Χ", name: "Chi" },
  { letter: "Ψ", name: "Psi" },
  { letter: "Ω", name: "Omega" },
];

export default function BackgroundCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % greekLetters.length);
    }, 3000); // Change letter every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentLetter = greekLetters[currentIndex];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-background">
      {/* Plain colored background */}
      <div className="absolute inset-0 bg-background" />

      {/* Greek Letter Carousel - Centered and large */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Current letter - large and prominent */}
          <div
            key={currentIndex}
            className="text-[400px] md:text-[600px] font-bold text-primary/10 select-none transition-opacity duration-1000 ease-in-out"
            style={{
              fontFamily: "serif",
              lineHeight: 1,
            }}
          >
            {currentLetter.letter}
          </div>
          
          {/* Letter name - subtle text below */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4 text-primary/20 text-2xl md:text-3xl font-light tracking-wider">
            {currentLetter.name}
          </div>
        </div>
      </div>

      {/* Subtle pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 30px,
            rgba(0,0,0,0.02) 30px,
            rgba(0,0,0,0.02) 60px
          )`,
        }}
      />
    </div>
  );
}

