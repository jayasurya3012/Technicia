# Voices of History

A Next.js application that allows you to chat with historical figures using AI. Experience conversations with the minds that shaped our world.

## Features

- Chat with any historical figure using AI-powered conversations
- **Custom Voice Cloning** - Realistic, character-specific voices using XTTS + Bark
- Voice-first interface with text-to-speech
- Speech-to-text input support
- Historical figure validation
- Wikipedia image integration
- Multi-language support
- Natural speech elements (hesitations, sounds, emphasis)
- Toggle between voice cloning and browser TTS

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- **(Optional)** Python 3.8+ for voice cloning server
- **(Optional)** CUDA-compatible GPU for faster voice generation

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayasurya3012/Technicia.git
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
   VOICE_SERVER_URL=http://localhost:8000
   ```

4. **(Optional) Set up Voice Cloning Server**

   See [VOICE_CLONING_SETUP.md](VOICE_CLONING_SETUP.md) for detailed instructions.

   Quick setup:
   ```bash
   # Install Python dependencies
   pip install fastapi uvicorn TTS bark soundfile torch

   # Start the voice server
   python voice_clone_server.py
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chronos-guru/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat endpoint
│   │   ├── voice/         # Voice cloning proxy
│   │   └── validate-figure/ # Figure validation
│   ├── chat/              # Chat interface pages
│   └── page.tsx           # Landing page
├── components/             # React components
├── lib/                    # Utility functions
│   ├── voiceCloning.ts    # Voice cloning utilities
│   ├── prompts.ts         # AI prompts
│   └── groq.ts            # Groq API client
└── public/                 # Static assets
```

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Chat:** Groq API (Llama 3.3 70B)
- **Voice Cloning:** Coqui XTTS v2 + Bark
- **Backend:** FastAPI (Python) for voice server
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
3. Use the **🎤/🔊 toggle** to switch between voice cloning and browser TTS
4. Ask questions or use voice input to chat
5. Click **"🔊 Read aloud"** on any message to hear it again
6. Click **"Show Transcript"** to view the conversation history
7. The character will respond in the same language as your input

## Voice Cloning

This project includes a custom voice cloning integration that allows each historical figure to have their own unique voice.

### Features:
- **Character-specific voices** using voice reference files
- **Toggle between modes** - Voice cloning or browser TTS
- **Automatic fallback** - Uses browser TTS if server is unavailable
- **GPU acceleration** - Faster generation with CUDA-compatible GPUs

### Setup:
See [VOICE_CLONING_SETUP.md](VOICE_CLONING_SETUP.md) for complete instructions.

### Quick Start:
1. Start the voice server: `python voice_clone_server.py`
2. Start the Next.js app: `npm run dev`
3. Enable voice cloning with the 🎤 button in the chat interface

## Deployment

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add `GROQ_API_KEY` as an environment variable
4. Deploy

# Screenshots

![Landing](https://github.com/user-attachments/assets/80b827b9-b2c7-44ff-9bdf-2e281285d52f)

![JFK](https://github.com/user-attachments/assets/e9061d9f-7138-4b5c-8b01-ff2391a264f4)

![JFK_Chat](https://github.com/user-attachments/assets/00fc9404-a9f3-4962-871d-423432cdc541)


## License

Private project - All rights reserved

