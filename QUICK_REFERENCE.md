# Voice Cloning - Quick Reference Card

## 🚀 Quick Start (2 Minutes)

### Terminal 1 - Voice Server
```bash
cd C:\Users\jayas\Downloads
python voice_clone_server.py
```
**Wait for:** `✅ Voice Clone Server is ready!`

### Terminal 2 - Next.js App
```bash
cd C:\Users\jayas\Desktop\Technicia
npm run dev
```

### Browser
```
http://localhost:3000
```

---

## 🎯 One-Time Setup

### Install Python Packages
```bash
pip install fastapi uvicorn TTS bark soundfile torch
```

### Create Voice Files
- Location: Same directory as `voice_clone_server.py`
- Create `voices/` folder
- Add WAV files for each figure
- Add `kenny.wav` as default fallback

---

## 🔧 Configuration

### Environment Variable
In `.env.local`:
```env
VOICE_SERVER_URL=http://localhost:8000
```

### Server Port
Default: `8000`

Change in `voice_clone_server.py` if needed:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

## 🎮 Usage

### Toggle Voice Mode
Click button in chat header:
- **🎤 Voice Clone** → Uses server
- **🔊 Browser TTS** → Uses browser

### Play Audio
- **Auto-play:** Enabled by default with voice cloning
- **Manual:** Click "🔊 Read aloud" on any message

### Button States
- **"⏳ Generating..."** → Creating audio
- **"⏸️ Stop"** → Playing audio
- **"🔊 Read aloud"** → Ready

---

## 📁 Required Voice Files

### Directory Structure
```
voice_clone_server.py
kenny.wav              ← Default voice
voices/
  ├── lincoln.wav
  ├── einstein.wav
  ├── curie.wav
  ├── davinci.wav
  ├── cleopatra.wav
  ├── shakespeare.wav
  ├── caesar.wav
  ├── joanofarc.wav
  ├── galileo.wav
  └── elizabeth.wav
```

### Voice File Requirements
- Format: WAV
- Duration: 5-10 seconds minimum
- Quality: Clear speech, minimal background noise
- Content: Natural speech samples

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Server won't start | `pip install fastapi uvicorn TTS bark soundfile torch` |
| Port 8000 in use | Change port in server + `.env.local` |
| "Voice unavailable" | Start Python server |
| "Failed to generate" | Check voice files exist |
| Slow generation | Normal first time (model loading) |
| No audio | Check browser permissions |

---

## ⚡ Quick Commands

### Check Server Status
```bash
# Browser:
http://localhost:8000
```

### List Available Voices
```bash
# Browser:
http://localhost:8000/voices
```

### Stop Servers
```bash
# In each terminal:
Ctrl + C
```

---

## 📊 Performance

### First Launch
- Model loading: 10-30s
- First audio: 5-10s

### Normal Use
- Audio generation: 2-5s (GPU) or 10-30s (CPU)
- Cached models: Instant

### Optimization
- ✅ Use GPU for 10-20x speedup
- ✅ Keep messages under 500 characters
- ✅ Models cache after first use

---

## 📚 Documentation

| File | When to Use |
|------|-------------|
| `INTEGRATION_COMPLETE.md` | Start here - overview |
| `START_VOICE_SERVER.md` | First-time setup |
| `VOICE_CLONING_SETUP.md` | Detailed instructions |
| `INTEGRATION_CHECKLIST.md` | Testing & verification |

---

## ✅ Verification

Quick test checklist:
1. [ ] Server starts → Shows "ready" message
2. [ ] App starts → No errors
3. [ ] Toggle appears → Top right of chat
4. [ ] Voice cloning works → Click "Read aloud"
5. [ ] Fallback works → Stop server, try again

---

## 🎯 Files Modified

**New Files:** (4)
- `app/api/voice/generate/route.ts`
- `lib/voiceCloning.ts`
- `.env.example`
- Documentation (7 files)

**Modified Files:** (3)
- `components/MessageBubble.tsx`
- `app/chat/[figure]/page.tsx`
- `.env.local`
- `README.md`

---

## 💡 Tips

1. **Leave terminals open** - Both need to run simultaneously
2. **First generation is slow** - Models are loading, be patient
3. **Voice samples matter** - Better samples = better results
4. **GPU recommended** - Much faster generation
5. **Fallback works** - If server is down, browser TTS takes over

---

## 🆘 Emergency Fallback

If voice cloning doesn't work:
1. Toggle to **🔊 Browser TTS** mode
2. Everything still works with browser voices
3. Fix voice server issues later

---

## 📞 Support Flow

1. Check this quick reference
2. Check `START_VOICE_SERVER.md`
3. Check `VOICE_CLONING_SETUP.md`
4. Check browser console (F12)
5. Check server terminal output

---

## 🎉 That's It!

Two terminals running + voice files in place = Voice cloning ready!

**Happy chatting with history!** 🎭🗣️
