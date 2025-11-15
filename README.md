# Voices of History

A Next.js application that allows you to chat with historical figures using AI. Experience conversations with the minds that shaped our world.

## Features

- Chat with any historical figure using AI-powered conversations
- Voice-first interface with text-to-speech
- Speech-to-text input support
- Historical figure validation
- Wikipedia image integration
- Multi-language support
- Natural speech elements (hesitations, sounds, emphasis)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Groq API key (free at [console.groq.com](https://console.groq.com))

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/amaan-1234/Technicia.git
   cd Technicia/chronos-guru
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chronos-guru/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat interface pages
│   └── page.tsx           # Landing page
├── components/             # React components
├── lib/                    # Utility functions
└── public/                 # Static assets
```

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Groq API (Llama 3.3 70B)
- **Deployment:** Vercel-ready

## Getting a Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

## Usage

1. Enter a historical figure's name on the landing page
2. Wait for the character's greeting (voice will play automatically)
3. Ask questions or use voice input to chat
4. Click "Show Transcript" to view the conversation history
5. The character will respond in the same language as your input

## Deployment

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add `GROQ_API_KEY` as an environment variable
4. Deploy

## License

Private project - All rights reserved

