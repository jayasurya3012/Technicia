# Troubleshooting Voice Cloning Issues

## Error: "Audio generation failed"

This error means the voice server is either not running or not responding correctly.

### Step-by-Step Fix:

### 1. Check if Voice Server is Running

Open a terminal and check if the server is running:

```bash
# Try to access the server
curl http://localhost:8000
# OR in browser: http://localhost:8000
```

**Expected response:**
```json
{
  "message": "✅ Voice Clone API is live!",
  "version": "2.1",
  ...
}
```

**If you get an error:**
- The server is NOT running
- Start it with: `python voice_clone_server.py`

---

### 2. Check Voice Server Console

When you start the server, you should see:

```
============================================================
🚀 Starting Voice Clone Server...
============================================================

⏳ Loading Bark models...
✅ Bark models loaded successfully!

...

🎤 Checking base voice reference:
   ✅ John F. Kennedy (base): ./kenny.wav    ← MUST SEE THIS!

...

============================================================
✅ Voice Clone Server is ready!
============================================================
```

**If you see errors:**
- Check that `kenny.wav` exists in the same directory as the server
- Check that scipy is installed: `pip install scipy`

---

### 3. Test the Server Directly

Open `test_voice_server.html` in your browser:

1. Open the file: `C:\Users\jayas\Desktop\Technicia\test_voice_server.html`
2. Click "Check if server is running"
3. If it fails, the server isn't running

---

### 4. Check Next.js Console

Look for detailed error logs in the browser console (F12):

```
[Voice Cloning] Generating audio for: John F. Kennedy
[Voice Cloning] Response status: 500   ← If you see 500 or 503, server has issues
```

---

### 5. Common Issues & Fixes

#### Issue: Server won't start - "ModuleNotFoundError: No module named 'scipy'"
**Fix:**
```bash
pip install scipy
```

#### Issue: Server starts but shows "❌ ERROR: JFK voice not found"
**Fix:**
- Ensure `kenny.wav` is in the same directory as `voice_clone_server.py`
- Check the file name is exactly `kenny.wav` (case-sensitive on some systems)

#### Issue: Server returns 500 error when generating
**Fix:**
- Check the server console for Python errors
- Ensure the audio file is valid WAV format
- Try with a shorter text first: "Hello"

#### Issue: "ECONNREFUSED" or "fetch failed"
**Fix:**
- Server isn't running on port 8000
- Start the server: `python voice_clone_server.py`
- Check nothing else is using port 8000

#### Issue: Server runs but audio doesn't generate
**Fix:**
1. Check server logs for errors
2. Verify `kenny.wav` is a valid WAV file
3. Try with very short text: "Test"
4. Check GPU/CPU has enough memory

---

### 6. Verify File Structure

Your setup should look like:

```
C:\Users\jayas\Downloads\
├── voice_clone_server.py       ← Updated server code
├── kenny.wav                    ← YOUR VOICE SAMPLE (REQUIRED!)
├── bark_reference.wav          ← Auto-generated
├── audio_outputs/              ← Auto-generated
└── voices/                     ← Optional
    ├── lincoln.wav (optional)
    └── ... (other voices)
```

---

### 7. Test with Diagnostic Tool

1. Make sure voice server is running
2. Open `test_voice_server.html` in browser
3. Run all 5 tests in order:
   - Test 1: Server Status
   - Test 2: Health Check
   - Test 3: List Voices
   - Test 4: Generate Direct
   - Test 5: Generate via API

If Test 4 works but Test 5 fails, the problem is with Next.js API routing.

---

### 8. Manual Testing Steps

#### Test 1: Check Server
```bash
# In browser or curl:
http://localhost:8000
```

#### Test 2: List Voices
```bash
# In browser or curl:
http://localhost:8000/voices
```

Should show JFK voice is available.

#### Test 3: Generate Test Audio
```bash
# Using curl (if you have it):
curl -X POST http://localhost:8000/generate \
  -F "text=Hello, this is a test" \
  -F "speaker=John F. Kennedy" \
  --output test.wav

# Then open test.wav to listen
```

---

### 9. Check Environment Variables

Verify `.env.local`:

```bash
# C:\Users\jayas\Desktop\Technicia\.env.local
GROQ_API_KEY=your_key_here
VOICE_SERVER_URL=http://localhost:8000
```

After changing `.env.local`, restart Next.js:
```bash
# Stop with Ctrl+C, then:
npm run dev
```

---

### 10. Check Logs in Order

**1. Voice Server Console**
- Look for errors when generating
- Check if request is received

**2. Next.js API Console**
```
[Voice API] Generating audio for speaker: John F. Kennedy
[Voice API] Voice server URL: http://localhost:8000
```

**3. Browser Console (F12)**
```
[Voice Cloning] Generating audio for: John F. Kennedy
[Voice Cloning] Response status: 200  ← Should be 200
```

---

## Quick Checklist

Before asking for help, verify:

- [ ] Voice server is running (`python voice_clone_server.py`)
- [ ] Server shows "✅ Voice Clone Server is ready!"
- [ ] `kenny.wav` exists and is shown in server startup
- [ ] scipy is installed (`pip install scipy`)
- [ ] Next.js is running (`npm run dev`)
- [ ] Browser console shows detailed error logs
- [ ] `test_voice_server.html` tests pass
- [ ] Can access `http://localhost:8000` in browser
- [ ] `.env.local` has VOICE_SERVER_URL set

---

## Still Not Working?

### Get Detailed Logs:

1. **Server logs**: Copy the full output when server starts
2. **Browser console**: F12 → Console → Copy all [Voice Cloning] logs
3. **Network tab**: F12 → Network → Look for `/api/voice/generate` request → Copy response

### Common Error Patterns:

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "fetch failed" | Server not running | Start server |
| "ECONNREFUSED" | Port 8000 blocked | Check firewall, restart server |
| "500 Internal Server Error" | Python error in server | Check server console |
| "JFK voice not found" | Missing kenny.wav | Add file to server directory |
| "No module named scipy" | Missing dependency | `pip install scipy` |
| "Empty audio blob" | Generation failed silently | Check server logs |

---

## Emergency Fallback

If nothing works, you can temporarily use browser TTS by editing:

`app/chat/[figure]/page.tsx` - Add browser TTS back as fallback

But the proper fix is to get the voice server running!

---

## Need More Help?

Run this command and share the output:

```bash
# Check server status
curl http://localhost:8000

# Check if port is in use
netstat -ano | findstr :8000

# Check Python packages
pip list | findstr -i "scipy torch TTS"
```
