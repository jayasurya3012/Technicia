/**
 * Curated list of well-known historical figures
 * Includes various spellings and common variations
 */
const KNOWN_HISTORICAL_FIGURES = new Set([
  // Pre-configured figures
  "Einstein",
  "Albert Einstein",
  "Socrates",
  "Leonardo da Vinci",
  "Leonardo",
  "Joan of Arc",
  "Jeanne d'Arc",
  "Isaac Newton",
  "Sir Isaac Newton",
  "Ada Lovelace",
  "Cleopatra",
  "Cleopatra VII",
  
  // Ancient World
  "Julius Caesar",
  "Caesar",
  "Alexander the Great",
  "Alexander",
  "Plato",
  "Aristotle",
  "Confucius",
  "Buddha",
  "Siddhartha Gautama",
  "Homer",
  "Virgil",
  "Cicero",
  "Mark Antony",
  "Antony",
  "Augustus",
  "Nero",
  "Marcus Aurelius",
  "Hannibal",
  "Spartacus",
  "Pythagoras",
  "Archimedes",
  "Hippocrates",
  "Herodotus",
  "Thucydides",
  
  // Medieval Period
  "Charlemagne",
  "William the Conqueror",
  "Richard the Lionheart",
  "Saladin",
  "Genghis Khan",
  "Kublai Khan",
  "Marco Polo",
  "Dante Alighieri",
  "Dante",
  "Geoffrey Chaucer",
  "Chaucer",
  "Thomas Aquinas",
  "Gutenberg",
  "Johannes Gutenberg",
  
  // Renaissance
  "Michelangelo",
  "Raphael",
  "Donatello",
  "Botticelli",
  "Machiavelli",
  "Niccolò Machiavelli",
  "Galileo",
  "Galileo Galilei",
  "Copernicus",
  "Nicolaus Copernicus",
  "Shakespeare",
  "William Shakespeare",
  "Elizabeth I",
  "Queen Elizabeth",
  "Henry VIII",
  "King Henry",
  
  // 17th-18th Century
  "Voltaire",
  "Rousseau",
  "Jean-Jacques Rousseau",
  "Montesquieu",
  "John Locke",
  "Locke",
  "Thomas Hobbes",
  "Hobbes",
  "Benjamin Franklin",
  "Franklin",
  "George Washington",
  "Washington",
  "Thomas Jefferson",
  "Jefferson",
  "Napoleon",
  "Napoleon Bonaparte",
  "Bach",
  "Johann Sebastian Bach",
  "Mozart",
  "Wolfgang Amadeus Mozart",
  "Beethoven",
  "Ludwig van Beethoven",
  
  // 19th Century
  "Charles Darwin",
  "Darwin",
  "Karl Marx",
  "Marx",
  "Friedrich Nietzsche",
  "Nietzsche",
  "Victor Hugo",
  "Hugo",
  "Jane Austen",
  "Austen",
  "Charles Dickens",
  "Dickens",
  "Mark Twain",
  "Twain",
  "Edgar Allan Poe",
  "Poe",
  "Oscar Wilde",
  "Wilde",
  "Florence Nightingale",
  "Nightingale",
  "Marie Curie",
  "Curie",
  "Nikola Tesla",
  "Tesla",
  "Thomas Edison",
  "Edison",
  
  // 20th Century
  "Winston Churchill",
  "Churchill",
  "Franklin D. Roosevelt",
  "Roosevelt",
  "FDR",
  "Gandhi",
  "Mahatma Gandhi",
  "Martin Luther King Jr.",
  "Martin Luther King",
  "Nelson Mandela",
  "Mandela",
  "Pablo Picasso",
  "Picasso",
  "Vincent van Gogh",
  "Van Gogh",
  "Frida Kahlo",
  "Kahlo",
  "Amelia Earhart",
  "Earhart",
  "Rosa Parks",
  "Parks",
  
  // Scientists & Mathematicians
  "Marie Curie",
  "Curie",
  "Rosalind Franklin",
  "Stephen Hawking",
  "Hawking",
  "Alan Turing",
  "Turing",
  "Charles Babbage",
  "Babbage",
  
  // Artists & Writers
  "Leonardo da Vinci",
  "Michelangelo",
  "Vincent van Gogh",
  "Pablo Picasso",
  "Shakespeare",
  "Dante",
  "Homer",
  
  // Philosophers
  "Plato",
  "Aristotle",
  "Socrates",
  "Confucius",
  "Kant",
  "Immanuel Kant",
  "Hegel",
  "Descartes",
  "René Descartes",
  
  // Leaders & Rulers
  "Julius Caesar",
  "Alexander the Great",
  "Napoleon",
  "Cleopatra",
  "Queen Elizabeth I",
  "Catherine the Great",
  "Genghis Khan",
]);

/**
 * Normalize a name for comparison (lowercase, trim, remove extra spaces)
 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Check if a name is in the curated list of historical figures
 */
export function isKnownHistoricalFigure(name: string): boolean {
  const normalized = normalizeName(name);
  
  // Check exact match
  for (const figure of KNOWN_HISTORICAL_FIGURES) {
    if (normalizeName(figure) === normalized) {
      return true;
    }
  }
  
  // Check if name contains or is contained by any known figure
  for (const figure of KNOWN_HISTORICAL_FIGURES) {
    const normalizedFigure = normalizeName(figure);
    if (normalizedFigure.includes(normalized) || normalized.includes(normalizedFigure)) {
      // Additional check: ensure it's not too generic (like just "the" or "great")
      if (normalized.length >= 3 && normalizedFigure.length >= 3) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Validate if a name is a real historical figure using AI
 * This is a fallback for names not in the curated list
 */
export async function validateHistoricalFigure(name: string): Promise<boolean> {
  // First check curated list (fast)
  if (isKnownHistoricalFigure(name)) {
    return true;
  }
  
  // If not in list, use AI to validate
  try {
    const response = await fetch("/api/validate-figure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      // If validation API fails, default to allowing (to not block users)
      // Or return false to be strict
      return false;
    }
    
    const data = await response.json();
    return data.isValid === true;
  } catch (error) {
    console.error("Validation error:", error);
    // On error, be strict and return false
    return false;
  }
}

/**
 * Quick validation (synchronous, uses only curated list)
 * Use this for immediate feedback without API call
 */
export function quickValidate(name: string): boolean {
  if (!name || name.trim().length < 2) {
    return false;
  }
  
  return isKnownHistoricalFigure(name);
}

