"use client";

import { useState, useEffect } from "react";
import { getFigureImageUrl } from "@/lib/imageUtils";

interface FigureImageProps {
  figureName: string;
}

export default function FigureImage({ figureName }: FigureImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!figureName) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const url = await getFigureImageUrl(figureName);
        
        if (isMounted) {
          if (url) {
            setImageUrl(url);
            setHasError(false);
          } else {
            setImageUrl("");
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[FigureImage] Error loading image:", error);
        if (isMounted) {
          setImageUrl("");
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [figureName]);

  // Generic icon fallback (SVG)
  const GenericIcon = () => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="100" cy="100" r="100" fill="#D4A574" fillOpacity="0.3" />
      <circle cx="100" cy="80" r="35" fill="#8B6F47" />
      <path
        d="M 50 180 Q 50 140 100 140 Q 150 140 150 180"
        stroke="#8B6F47"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  return (
    <div className="flex justify-center my-6">
      <div
        className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-lg border-4 border-secondary/20 bg-secondary/10 flex items-center justify-center"
        style={{
          transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hasError || !imageUrl ? (
          <GenericIcon />
        ) : (
          <img
            src={imageUrl}
            alt={figureName}
            className="w-full h-full object-cover"
            onError={() => {
              setHasError(true);
              setImageUrl("");
            }}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

