/**
 * Utility functions for fetching historical figure images
 * Uses Wikipedia API to get images of historical figures
 */

/**
 * Normalize figure name for Wikipedia API
 * Converts "Leonardo da Vinci" to "Leonardo_da_Vinci"
 */
function normalizeFigureNameForWikipedia(name: string): string {
  return name.trim().replace(/\s+/g, "_");
}

/**
 * Fetch image URL for a historical figure from Wikipedia API
 * @param figureName - Name of the historical figure
 * @returns Promise<string> - Image URL if found, empty string otherwise
 */
export async function getFigureImageUrl(figureName: string): Promise<string> {
  if (!figureName || figureName.trim().length === 0) {
    return "";
  }

  try {
    const normalizedName = normalizeFigureNameForWikipedia(figureName);
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normalizedName)}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      // If page not found or other error, return empty string
      return "";
    }

    const data = await response.json();
    
    // Try to get original image first (higher quality)
    if (data.originalimage && data.originalimage.source) {
      return data.originalimage.source;
    }
    
    // Fallback to thumbnail if original not available
    if (data.thumbnail && data.thumbnail.source) {
      // Wikipedia thumbnails are usually small, try to get larger version
      // Wikipedia thumbnail URLs look like: 
      // https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Einstein_1921.jpg/220px-Einstein_1921.jpg
      // We want the original: https://upload.wikimedia.org/wikipedia/commons/a/a4/Einstein_1921.jpg
      let imageUrl = data.thumbnail.source;
      
      // Remove /thumb/ and the size suffix (e.g., /220px-)
      if (imageUrl.includes('/thumb/')) {
        // Replace /thumb/ with / and remove the size suffix
        imageUrl = imageUrl.replace('/thumb/', '/');
        // Remove the size prefix like "220px-"
        imageUrl = imageUrl.replace(/\/\d+px-/, '/');
      }
      
      return imageUrl;
    }

    // No image found
    return "";
  } catch (error) {
    console.error(`[ImageUtils] Error fetching image for ${figureName}:`, error);
    return "";
  }
}

/**
 * Alternative: Try to get image from Wikipedia page directly
 * This is a fallback method if the summary API doesn't work
 */
export async function getFigureImageUrlAlternative(figureName: string): Promise<string> {
  if (!figureName || figureName.trim().length === 0) {
    return "";
  }

  try {
    const normalizedName = normalizeFigureNameForWikipedia(figureName);
    // Use the page images API as alternative
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/media/${encodeURIComponent(normalizedName)}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    
    // Look for the first image that seems like a portrait
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        if (item.original && item.original.source) {
          return item.original.source;
        }
      }
    }

    return "";
  } catch (error) {
    console.error(`[ImageUtils] Error fetching alternative image for ${figureName}:`, error);
    return "";
  }
}

