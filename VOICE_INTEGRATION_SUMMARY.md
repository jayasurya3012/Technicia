# Voice Cloning Integration - Summary of Changes

## Quick Start

### 1. Start the Voice Server
```bash
cd path/to/voice_clone_server_directory
python voice_clone_server.py
```

### 2. Start Your App
```bash
npm run dev
```

### 3. Use Voice Cloning
- The voice cloning feature is **enabled by default**
- Toggle between voice cloning and browser TTS using the 🎤/🔊 button in the chat header
- Click "Read aloud" on any message to hear it

---

## Files Created

### 1. `/app/api/voice/generate/route.ts`
**Purpose**: Next.js API route that proxies requests to your local voice cloning server

**Key Features**:
- Accepts text and speaker name
- Forwards request to Python server at `http://localhost:8000`
- Returns audio WAV file
- Handles errors and connection issues gracefully
- Provides helpful error messages if server is down

### 2. `/lib/voiceCloning.ts`
**Purpose**: Utility functions for voice cloning operations

**Key Functions**:
- `generateVoiceAudio()` - Generates audio from text
- `playAudio()` - Plays audio blob or URL
- `generateAndPlayVoice()` - Combined generate + play
- `cleanTextForTTS()` - Removes markdown and special characters

### 3. `VOICE_CLONING_SETUP.md`
**Purpose**: Complete setup guide for the voice cloning integration

---

## Files Modified

### 1. `/components/MessageBubble.tsx`

**Changes**:
- Added `useVoiceCloning` prop (boolean)
- Added `isGenerating` state for loading indicator
- Updated `handleReadAloud()` to support voice cloning
- Added fallback to browser TTS if voice cloning fails
- Updated button text to show generation status

**New Imports**:
```typescript
import { generateVoiceAudio, playAudio, cleanTextForTTS } from "@/lib/voiceCloning";
```

**New Props**:
```typescript
useVoiceCloning?: boolean  // Enable/disable voice cloning
```

### 2. `/app/chat/[figure]/page.tsx`

**Changes**:
- Added `useVoiceCloning` state (default: `true`)
- Added toggle button in header to switch between voice cloning and browser TTS
- Updated `speakText()` function to use voice cloning when enabled
- Created `speakTextBrowser()` as fallback function
- Added `currentAudioRef` for managing audio playback
- Updated `cleanupConversation()` to stop voice-cloned audio
- Passes `useVoiceCloning` prop to `MessageBubble` components

**New Imports**:
```typescript
import { generateVoiceAudio, playAudio, cleanTextForTTS } from "@/lib/voiceCloning";
```

**New State**:
```typescript
const [useVoiceCloning, setUseVoiceCloning] = useState(true);
const currentAudioRef = useRef<HTMLAudioElement | null>(null);
```

**New UI Element**:
- Toggle button showing "🎤 Voice Clone" or "🔊 Browser TTS"
- Located in the header next to the transcript button

### 3. `/.env.local`

**Added**:
```env
# Voice Cloning Server URL (default: http://localhost:8000)
VOICE_SERVER_URL=http://localhost:8000
```

---

## How It Works

### Flow Diagram

```
User Message Received
         ↓
Auto-play enabled? → Yes → speakText(message)
         ↓
useVoiceCloning = true?
         ↓
    Yes ↓         ↓ No
         ↓         ↓
Voice Cloning   Browser TTS
    Server      (fallback)
         ↓         ↓
    Audio plays ←
```

### Voice Cloning Process

1. **User triggers audio** (auto-play or manual "Read aloud")
2. **Clean text** - Remove markdown, special characters
3. **Call API** - `/api/voice/generate` with text and speaker name
4. **Proxy request** - Next.js forwards to Python server
5. **Generate audio** - Python server uses XTTS + Bark models
6. **Return WAV** - Audio file sent back to frontend
7. **Play audio** - Browser plays the voice-cloned audio

### Fallback Strategy

The integration has multiple fallback layers:

1. **Primary**: Voice cloning server
2. **Fallback 1**: If voice cloning fails → Browser TTS
3. **Fallback 2**: If toggle is off → Browser TTS
4. **Fallback 3**: If server unavailable → Browser TTS + error message

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VOICE_SERVER_URL` | `http://localhost:8000` | URL of the voice cloning server |

### Voice Server Settings

In `voice_clone_server.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| Port | 8000 | Server port |
| Max text length | 500 chars | Maximum text length for TTS |
| GPU | Auto-detect | Use GPU if available |

---

## Testing Checklist

- [ ] Voice server starts without errors
- [ ] Voice reference files are in place
- [ ] Next.js app connects to voice server
- [ ] Toggle button switches between modes
- [ ] Auto-play works on new messages
- [ ] Manual "Read aloud" works
- [ ] Fallback to browser TTS when server is off
- [ ] Error messages are clear and helpful
- [ ] Audio stops when navigating away
- [ ] Multiple messages can be played sequentially

---

## Common Issues & Solutions

### Issue: "Voice server unavailable"
**Solution**:
1. Start the Python server: `python voice_clone_server.py`
2. Check it's running on port 8000
3. Restart Next.js dev server

### Issue: "Failed to generate audio"
**Solution**:
1. Check voice reference files exist
2. Check server console for errors
3. Verify GPU/CPU has enough memory
4. Try shorter text (< 500 characters)

### Issue: Toggle button doesn't work
**Solution**:
1. Check browser console for errors
2. Try refreshing the page
3. Clear browser cache

### Issue: Audio doesn't play
**Solution**:
1. Check browser allows audio playback
2. Try clicking the page first (browser security)
3. Test with browser TTS mode
4. Check audio permissions

---

## Performance Metrics

### Voice Cloning Server
- **First load**: 10-30 seconds (model loading)
- **Subsequent loads**: Instant (cached)
- **Generation time**: 2-10 seconds (depends on text length and GPU)
- **Audio quality**: High (22kHz WAV)

### Browser TTS
- **Load time**: Instant
- **Generation time**: Instant
- **Audio quality**: Medium (browser-dependent)

---

## Future Enhancements

Possible improvements:
1. Add audio caching to avoid regenerating same text
2. Support for different languages
3. Voice emotion/tone controls
4. Streaming audio generation
5. Download audio files
6. Voice sample upload for custom voices
7. Real-time voice modulation during playback

---

## API Reference

### POST `/api/voice/generate`

**Request Body**:
```json
{
  "text": "Hello, I am Abraham Lincoln.",
  "speaker": "Abraham Lincoln"
}
```

**Response**: WAV audio file

**Headers**:
- `Content-Type`: `audio/wav`
- `X-Generation-Time`: Time taken to generate (seconds)
- `X-Text-Length`: Length of input text
- `X-Speaker`: Speaker name used

**Error Responses**:
- `400` - Missing text parameter
- `503` - Voice server unavailable
- `500` - Generation failed

---

## Support

For issues or questions:
1. Check the logs in browser console
2. Check the Python server console
3. Review `VOICE_CLONING_SETUP.md` for detailed setup
4. Verify all dependencies are installed
