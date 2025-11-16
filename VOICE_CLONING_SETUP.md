# Voice Cloning Integration Setup

This guide will help you integrate the custom voice cloning server with your Voices of History application.

## Prerequisites

1. Python 3.8 or higher installed on your system
2. A GPU is recommended for faster audio generation (CUDA-compatible)
3. The voice cloning server code (`voice_clone_server.py`)

## Server Setup

### 1. Install Python Dependencies

First, install the required Python packages for the voice cloning server:

```bash
pip install fastapi uvicorn TTS bark soundfile torch
```

### 2. Prepare Voice Reference Files

Create a `voices` directory in the same location as your `voice_clone_server.py`:

```bash
mkdir voices
```

Add WAV files for each historical figure. The server expects these files:

- `voices/lincoln.wav` - Abraham Lincoln
- `voices/einstein.wav` - Albert Einstein
- `voices/curie.wav` - Marie Curie
- `voices/davinci.wav` - Leonardo da Vinci
- `voices/cleopatra.wav` - Cleopatra
- `voices/shakespeare.wav` - William Shakespeare
- `voices/caesar.wav` - Julius Caesar
- `voices/joanofarc.wav` - Joan of Arc
- `voices/galileo.wav` - Galileo Galilei
- `voices/elizabeth.wav` - Queen Elizabeth I
- `kenny.wav` - Default fallback voice (in the root directory)

**Note:** You'll need to source or create these voice reference files. They should be clear, high-quality WAV files of someone speaking in a similar style to how you'd imagine the historical figure would sound.

### 3. Start the Voice Cloning Server

Run the server on localhost:

```bash
cd path/to/voice_clone_server_directory
python voice_clone_server.py
```

Or using uvicorn directly:

```bash
uvicorn voice_clone_server:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

You should see output like:
```
============================================================
🚀 Starting Voice Clone Server...
============================================================

⏳ Loading Bark models...
✅ Bark models loaded successfully!

🎨 Reusing cached Bark style reference.

🖥️  GPU Detection:
   - GPU Available: True
   - GPU Name: NVIDIA GeForce RTX 3080

⏳ Initializing Coqui-XTTS (GPU = True)...
✅ Coqui-XTTS loaded successfully!

🎤 Checking voice reference files:
   ✅ Abraham Lincoln: ./voices/lincoln.wav
   ...

============================================================
✅ Voice Clone Server is ready!
============================================================
```

## Frontend Setup

The frontend integration is already complete! Here's what was added:

### Files Created/Modified:

1. **`app/api/voice/generate/route.ts`** - API route that proxies requests to your local voice server
2. **`lib/voiceCloning.ts`** - Utility functions for voice generation
3. **`components/MessageBubble.tsx`** - Updated to support voice cloning
4. **`app/chat/[figure]/page.tsx`** - Updated with voice cloning integration
5. **`.env.local`** - Added `VOICE_SERVER_URL` configuration

### Environment Variables

Make sure your `.env.local` file contains:

```env
VOICE_SERVER_URL=http://localhost:8000
```

## Usage

### 1. Start the Voice Server

```bash
python voice_clone_server.py
```

### 2. Start Your Next.js Application

```bash
npm run dev
```

### 3. Use the Application

1. Navigate to your app (usually `http://localhost:3000`)
2. Select a historical figure to chat with
3. In the chat interface, you'll see a toggle button at the top:
   - **🎤 Voice Clone** - Uses the custom voice cloning server
   - **🔊 Browser TTS** - Uses the browser's built-in text-to-speech

4. Click the **"🔊 Read aloud"** button on any message to hear it with the selected voice

### Features

- **Auto-play**: Messages automatically play with voice cloning when received
- **Manual playback**: Click "Read aloud" on any message
- **Toggle**: Switch between voice cloning and browser TTS
- **Fallback**: If the voice server is unavailable, it automatically falls back to browser TTS
- **Visual feedback**: Shows "Generating..." while creating audio

## Troubleshooting

### Voice Server Not Connecting

If you see errors like "Voice server unavailable":

1. Make sure the voice server is running (`python voice_clone_server.py`)
2. Check that it's running on port 8000
3. Verify the `VOICE_SERVER_URL` in `.env.local` is correct
4. Restart your Next.js dev server after changing `.env.local`

### Missing Voice Files

If certain voices don't work:

1. Check the server console - it will show which files are missing
2. Add the missing WAV files to the `voices` directory
3. The server will use the default voice (`kenny.wav`) for missing voices

### GPU Issues

If you don't have a CUDA-compatible GPU:

- The server will automatically use CPU (slower but still functional)
- Consider using shorter text responses for faster generation

### Audio Not Playing

1. Check browser console for errors
2. Ensure your browser allows audio playback
3. Try toggling to browser TTS to verify audio works
4. Check that the voice server is responding (visit `http://localhost:8000` in your browser)

## API Endpoints

The voice server provides these endpoints:

- `GET /` - Server status and available voices
- `GET /health` - Health check
- `GET /voices` - List all voice references and their status
- `POST /generate` - Generate voice-cloned audio
  - Parameters: `text` (string), `speaker` (string)
  - Returns: WAV audio file

## Performance Tips

1. **GPU Acceleration**: Use a CUDA-compatible GPU for 10-20x faster generation
2. **Text Length**: Keep messages under 500 characters for faster generation
3. **Caching**: The server caches Bark models after first load
4. **Cleanup**: The server includes a cleanup endpoint to remove old audio files

## Advanced Configuration

### Changing the Server Port

If port 8000 is in use, change it in both places:

1. In `voice_clone_server.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
```

2. In `.env.local`:
```env
VOICE_SERVER_URL=http://localhost:8001
```

### Adding New Historical Figures

1. Add the voice reference WAV file to the `voices` directory
2. Update the `VOICE_REFERENCES` dictionary in `voice_clone_server.py`:
```python
VOICE_REFERENCES = {
    # ... existing voices ...
    "New Figure Name": "./voices/newfigure.wav",
}
```

3. Restart the voice server

## Architecture

```
User clicks "Read aloud"
         ↓
MessageBubble component
         ↓
lib/voiceCloning.ts (generateVoiceAudio)
         ↓
/api/voice/generate (Next.js API route)
         ↓
http://localhost:8000/generate (Python server)
         ↓
Coqui XTTS + Bark (AI models)
         ↓
WAV audio file
         ↓
Plays in browser
```

## License & Credits

- **Coqui XTTS**: Voice cloning model
- **Bark**: Natural speech synthesis
- **FastAPI**: Python web framework
- **Next.js**: React framework
