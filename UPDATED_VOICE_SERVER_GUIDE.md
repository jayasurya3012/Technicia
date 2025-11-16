# Updated Voice Server Guide - JFK Base with Pitch Shifting

## 🎯 What Changed

### Key Updates:
1. **Toggle button removed** - Voice cloning is now always enabled
2. **JFK as base voice** - All characters use your JFK voice sample
3. **Pitch shifting** - Different characters get different pitch shifts to create unique voices
4. **No browser TTS fallback** - Only uses your voice server

---

## 📁 File Setup

### Required Files:
Place these in the same directory as `voice_clone_server_updated.py`:

```
voice_clone_server_updated.py
jfk.wav                    ← YOUR JFK VOICE SAMPLE (REQUIRED!)
voices/                    ← Optional: individual character voices
  ├── lincoln.wav          (if available)
  ├── einstein.wav         (if available)
  └── ... (other characters)
```

### IMPORTANT:
- **`jfk.wav` is REQUIRED** - This is your base voice sample
- **voices/ folder is OPTIONAL** - If a character's voice file exists, it will be used
- **Missing voices** - Will automatically use JFK voice with pitch shifting

---

## 🎵 Pitch Shifting Configuration

The server uses different pitch shifts for different characters:

| Character | Pitch Shift | Voice Type |
|-----------|-------------|------------|
| **John F. Kennedy** | 0 semitones | Original |
| Abraham Lincoln | -2 semitones | Deeper (male) |
| Julius Caesar | -2 semitones | Deeper (male) |
| William Shakespeare | -1 semitone | Slightly deeper (male) |
| Leonardo da Vinci | 0 semitones | Normal (male) |
| Albert Einstein | +1 semitone | Slightly higher (male) |
| Galileo Galilei | +1 semitone | Slightly higher (male) |
| Joan of Arc | +3 semitones | Higher (female) |
| Marie Curie | +4 semitones | Higher (female) |
| Queen Elizabeth I | +4 semitones | Higher (female) |
| Cleopatra | +5 semitones | Higher (female) |

### How Pitch Shifting Works:
- **Negative values** = Deeper voice (male characters)
- **Positive values** = Higher voice (female characters)
- **0** = Original JFK voice

---

## 🚀 Setup Instructions

### Step 1: Install Additional Dependency

```bash
pip install scipy
```

(scipy is needed for pitch shifting)

### Step 2: Place Your JFK Voice Sample

```bash
# In the same directory as voice_clone_server_updated.py:
jfk.wav    ← Your JFK audio sample
```

**JFK Voice Requirements:**
- Format: WAV file
- Duration: 10-15 seconds minimum (15+ seconds recommended)
- Quality: Clear speech, minimal background noise
- Content: Natural speech sample

### Step 3: Replace Old Server

Replace your old `voice_clone_server.py` with the new one:

```bash
# Option 1: Rename the updated file
mv voice_clone_server_updated.py voice_clone_server.py

# Option 2: Copy the content
# Just copy the content from voice_clone_server_updated.py
# to your voice_clone_server.py
```

### Step 4: Start the Server

```bash
python voice_clone_server.py
```

**Expected Output:**
```
============================================================
🚀 Starting Voice Clone Server...
============================================================

...

🎤 Checking base voice reference:
   ✅ John F. Kennedy (base): ./jfk.wav

🎤 Checking character voice references:
   🔧 Abraham Lincoln: MISSING - will use JFK voice with -2 semitone shift
   🔧 Albert Einstein: MISSING - will use JFK voice with +1 semitone shift
   🔧 Marie Curie: MISSING - will use JFK voice with +4 semitone shift
   ...

🔧 Synthetic voices (JFK-based with pitch shift):
   - Abraham Lincoln (-2 semitones)
   - Albert Einstein (+1 semitones)
   - Marie Curie (+4 semitones)
   ...

============================================================
✅ Voice Clone Server is ready!
============================================================
```

---

## 🎮 Usage

### Testing the Server

1. **Check Status:**
   ```
   http://localhost:8000
   ```

   Should return:
   ```json
   {
     "message": "✅ Voice Clone API is live!",
     "version": "2.1",
     "base_voice": "John F. Kennedy",
     "synthetic_voice_support": true,
     ...
   }
   ```

2. **List Voices:**
   ```
   http://localhost:8000/voices
   ```

   Shows which voices are original vs synthetic

3. **Use the App:**
   - Start Next.js: `npm run dev`
   - Chat with any historical figure
   - Audio will be automatically generated using JFK voice with appropriate pitch

---

## 🔧 Customizing Pitch Shifts

Want to adjust the pitch for a character? Edit `VOICE_REFERENCES` in the server file:

```python
VOICE_REFERENCES = {
    "John F. Kennedy": {"file": JFK_VOICE, "pitch_shift": 0},
    "Abraham Lincoln": {"file": "./voices/lincoln.wav", "pitch_shift": -3},  # Changed to -3
    # ... more characters
}
```

### Pitch Shift Guidelines:
- **-4 to -2**: Very deep male voice
- **-1 to 0**: Normal to slightly deep male voice
- **+1 to +2**: Younger male voice
- **+3 to +5**: Female voice range
- **+6 and above**: High female voice (may sound unnatural)

---

## 🎯 How It Works

### Generation Flow:

```
User requests audio for "Abraham Lincoln"
         ↓
Server checks if voices/lincoln.wav exists
         ↓
    No? → Use JFK voice
         ↓
Apply -2 semitone pitch shift to JFK
         ↓
Generate audio with XTTS
         ↓
Return pitch-shifted JFK voice as Lincoln
```

### If You Add Individual Voice Files Later:

```
User requests audio for "Abraham Lincoln"
         ↓
Server checks if voices/lincoln.wav exists
         ↓
   Yes? → Use actual Lincoln voice
         ↓
Generate audio with XTTS
         ↓
Return original Lincoln voice
```

---

## 📊 What to Expect

### Audio Generation Times:
- **First request**: 5-15 seconds (model loading + generation)
- **With pitch shifting**: +1-2 seconds (pitch processing)
- **Subsequent requests**: 3-10 seconds
- **With GPU**: 2-5 seconds average

### Audio Quality:
- **Original JFK voice**: Excellent
- **Pitch shifted**: Good (slight quality loss is normal)
- **Female voices** (+3 to +5 shift): May sound slightly robotic but usable

---

## ✅ Verification Checklist

Before using:
- [ ] `jfk.wav` exists in the server directory
- [ ] scipy is installed (`pip install scipy`)
- [ ] Server starts without errors
- [ ] Server shows "✅ John F. Kennedy (base): ./jfk.wav"
- [ ] Server shows synthetic voices list
- [ ] Next.js app connects successfully
- [ ] Audio generates and plays

---

## 🐛 Troubleshooting

### "JFK voice not found"
**Fix:** Ensure `jfk.wav` is in the same directory as the server file

### "No module named 'scipy'"
**Fix:** `pip install scipy`

### Pitch-shifted voice sounds weird
**Fix:**
- Try a different pitch shift value
- Use a longer JFK sample (15+ seconds)
- Ensure JFK sample is high quality

### Audio generation fails
**Fix:**
- Check server console for errors
- Ensure JFK file is valid WAV format
- Try shorter text (< 500 characters)

---

## 💡 Pro Tips

1. **Better JFK sample = Better results**
   - Use 15+ seconds of clear speech
   - Multiple sentences with varied intonation
   - Minimal background noise

2. **Test pitch shifts**
   - Start the server and test different characters
   - Adjust pitch values if voices don't sound right
   - Female voices usually need +3 to +5

3. **Add real voices when available**
   - Just place them in the `voices/` folder
   - Server will automatically use them instead of synthetic
   - No code changes needed!

4. **Cache is your friend**
   - Models load once and stay in memory
   - Pitch-shifted files are temporary and auto-deleted
   - Restart server to clear cache if needed

---

## 📝 Summary

**What you need:**
- Updated `voice_clone_server.py` (the updated version)
- `jfk.wav` file (YOUR voice sample)
- scipy library installed

**What happens:**
- JFK voice is used for all characters
- Each character gets a unique pitch shift
- If you add real voice files later, they'll be used instead
- No toggle button - always uses voice server

**Result:**
- All historical figures have unique voices
- Based on your JFK sample
- Works immediately with just one voice file
- Easy to add more voices later

---

## 🎉 You're Ready!

1. Copy the updated server code
2. Place your `jfk.wav` file
3. Install scipy
4. Start the server
5. Enjoy voice-cloned conversations!
