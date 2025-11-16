# Starting the Voice Server - Quick Guide

## First Time Setup

### 1. Install Python Dependencies

Open a terminal/command prompt and run:

```bash
pip install fastapi uvicorn TTS bark soundfile torch
```

If you have a CUDA-compatible GPU (NVIDIA), also install:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 2. Create Voice Files Directory

In the same directory as `voice_clone_server.py`, create a `voices` folder:

```bash
cd C:\Users\jayas\Downloads
mkdir voices
```

### 3. Add Voice Reference Files

You need WAV files for each historical figure. Place them in the `voices` directory:

- `voices/lincoln.wav`
- `voices/einstein.wav`
- `voices/curie.wav`
- `voices/davinci.wav`
- `voices/cleopatra.wav`
- `voices/shakespeare.wav`
- `voices/caesar.wav`
- `voices/joanofarc.wav`
- `voices/galileo.wav`
- `voices/elizabeth.wav`
- `kenny.wav` (default fallback - in root directory)

**Where to get voice files:**
- Record your own voice samples (5-10 seconds of clear speech)
- Use AI voice generation tools
- Use voice samples from audiobooks or speeches (check licensing)
- Each file should be WAV format, clear audio, at least 15 seconds

---

## Every Time You Use the App

### Step 1: Start the Voice Server

Open a terminal/command prompt:

```bash
cd C:\Users\jayas\Downloads
python voice_clone_server.py
```

**Wait for this message:**
```
============================================================
✅ Voice Clone Server is ready!
============================================================
```

**Leave this terminal open!** The server needs to keep running.

### Step 2: Start Your Next.js App

Open a **new** terminal/command prompt:

```bash
cd C:\Users\jayas\Desktop\Technicia
npm run dev
```

### Step 3: Open Your Browser

Navigate to: `http://localhost:3000`

---

## Verify It's Working

### Check Voice Server Status

Open your browser and go to:
```
http://localhost:8000
```

You should see:
```json
{
  "message": "✅ Voice Clone API is live!",
  "version": "2.0",
  "gpu_available": true,
  "gpu_name": "...",
  "available_voices": [...],
  "total_voices": 11
}
```

### Check Available Voices

Go to:
```
http://localhost:8000/voices
```

This shows which voice files exist and which are missing.

---

## Troubleshooting

### Server Won't Start

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
pip install fastapi uvicorn
```

**Error: `ModuleNotFoundError: No module named 'TTS'`**
```bash
pip install TTS
```

**Error: `Port 8000 is already in use`**
- Close any programs using port 8000
- Or change the port in `voice_clone_server.py` (line 296):
  ```python
  uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
  ```
  Then update `.env.local` in your Next.js project:
  ```
  VOICE_SERVER_URL=http://localhost:8001
  ```

### Slow Generation

**First generation is very slow (30+ seconds):**
- This is normal! The models are loading for the first time
- Subsequent generations will be much faster (2-10 seconds)

**All generations are slow:**
- You might not have a GPU
- Check the server console - it will show if GPU is available
- Consider using shorter text messages

### Missing Voice Files

**Server shows warnings about missing voices:**
- This is okay! The server will use the default voice
- Add the missing WAV files to the `voices` directory when you can
- Make sure at least `kenny.wav` exists as the default

---

## Quick Commands Reference

### Start Voice Server
```bash
cd C:\Users\jayas\Downloads
python voice_clone_server.py
```

### Start Next.js App
```bash
cd C:\Users\jayas\Desktop\Technicia
npm run dev
```

### Check Server Status
```bash
# In browser:
http://localhost:8000
```

### Stop Servers
- Press `Ctrl + C` in each terminal window

---

## Optional: Windows Batch Script

Create a file named `start_voice_server.bat` in `C:\Users\jayas\Downloads`:

```batch
@echo off
echo Starting Voice Cloning Server...
echo.
python voice_clone_server.py
pause
```

Then just double-click this file to start the server!

---

## Expected Console Output

When you start the voice server, you should see:

```
============================================================
🚀 Starting Voice Clone Server...
============================================================

⏳ Loading Bark models...
✅ Bark models loaded successfully!

🎨 Reusing cached Bark style reference.

🖥️  GPU Detection:
   - GPU Available: True/False
   - GPU Name: Your GPU name or None

⏳ Initializing Coqui-XTTS (GPU = True/False)...
✅ Coqui-XTTS loaded successfully!

🎤 Checking voice reference files:
   ✅ Abraham Lincoln: ./voices/lincoln.wav
   ⚠️  Albert Einstein: ./voices/einstein.wav (MISSING)
   ... (more voices)

============================================================
✅ Voice Clone Server is ready!
============================================================

INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

When someone requests audio generation, you'll see:

```
============================================================
🎙️  New Generation Request
============================================================
Speaker: Abraham Lincoln
Text Length: 145 characters
Text Preview: Greetings, my friend. I am Abraham Lincoln, the 16th President...
🎤 Using voice reference: ./voices/lincoln.wav
⏳ Generating audio...
✅ Audio generated successfully!
   - Generation Time: 3.45s
   - File Size: 234.56 KB
   - Output Path: audio_outputs/voice_Abraham_Lincoln_a3b5c2d1.wav
============================================================
```

---

## Need Help?

1. **Check the server console** - errors will be shown there
2. **Check browser console** - F12 in your browser
3. **Verify files exist** - Check the `voices` directory
4. **Test the API** - Visit `http://localhost:8000` in browser
5. **Read the full guide** - See `VOICE_CLONING_SETUP.md`
