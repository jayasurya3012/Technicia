# Audio File Requirements for Voice Cloning

## 🎯 Your Current Issue

The "index out of range" error means your `kenny.wav` file is **too short** or has format issues.

## ✅ Required Audio Specifications

### Duration
- **Minimum:** 6 seconds (will cause errors if shorter)
- **Recommended:** 10-15 seconds
- **Ideal:** 15-30 seconds

### Format
- **File type:** WAV
- **Sample rate:** Any (will be auto-converted), but 22050 Hz or 44100 Hz is best
- **Channels:** Mono preferred (stereo works but will be converted)
- **Bit depth:** 16-bit or 32-bit float

### Content
- Clear speech
- Minimal background noise
- Natural speaking pace
- Good audio quality

## 🔍 Check Your Current File

After restarting the server, look for this in the output:

```
📊 Audio file info:
   - Duration: X.XX seconds    ← MUST be at least 6 seconds!
   - Sample rate: XXXXX Hz
   - Channels: Mono/Stereo
```

If you see:
```
⚠️  WARNING: Audio is only 3.45 seconds!
   XTTS works best with 10-15+ seconds of audio
```

Then your file is **TOO SHORT** and needs to be longer!

## 🛠️ How to Fix

### Option 1: Get a Longer Audio Sample

1. **Record yourself speaking for 15+ seconds**
   - Use any voice recorder app
   - Speak naturally about anything
   - Save as WAV format

2. **Or use AI voice generation**
   - Use tools like ElevenLabs, Play.ht, etc.
   - Generate 15-20 seconds of speech
   - Download as WAV

3. **Or extract from video/audio**
   - Find a clip of someone speaking
   - Extract 15-20 seconds
   - Convert to WAV

### Option 2: Loop Your Existing Audio

If you want to keep using your current kenny.wav, you can loop it to make it longer.

**Python script to loop audio:**

```python
import soundfile as sf
import numpy as np

# Read the short audio
audio, sr = sf.read('kenny.wav')

# Calculate how many times to loop
target_duration = 15  # seconds
current_duration = len(audio) / sr
times_to_loop = int(np.ceil(target_duration / current_duration))

# Loop the audio
looped_audio = np.tile(audio, times_to_loop)

# Trim to exact target duration
target_samples = int(target_duration * sr)
looped_audio = looped_audio[:target_samples]

# Save
sf.write('kenny_long.wav', looped_audio, sr)
print(f"Created kenny_long.wav - {len(looped_audio)/sr:.2f} seconds")
```

Then update your server to use `kenny_long.wav` instead of `kenny.wav`.

## 📝 Quick Test

After fixing your audio file:

1. **Restart the server:**
   ```bash
   uvicorn voice_clone_server:app --host 0.0.0.0 --port 8000
   ```

2. **Look for the duration:**
   ```
   📊 Audio file info:
      - Duration: 15.23 seconds    ← Should be 10+ seconds
   ```

3. **Try generating audio** - Should work without "index out of range" error

## 🚀 Performance Tips

### Current Performance (CPU Mode):
- Generation time: 30-60 seconds per message
- This is NORMAL for CPU mode
- GPU would be 2-5 seconds but causes CUDA errors with pitch shifting

### To Speed Up (Future):
1. **Use GPU without pitch shifting** - If you have individual voice files for each character
2. **Shorten text** - Shorter messages generate faster
3. **Use caching** - Same text = instant playback (not yet implemented)

## ⚡ What to Expect After Fix

**With proper audio file (10+ seconds):**
- ✅ No more "index out of range" errors
- ✅ Reliable audio generation
- ✅ Better voice quality
- ⏱️ Generation time: 30-60s per message (CPU mode)

**Still slow? That's normal!**
- CPU mode is 10-20x slower than GPU
- But it's reliable and works correctly
- Each message takes 30-60 seconds to generate
- This is a known limitation of CPU-based TTS

## 🎯 Action Items

1. **Check current audio duration** (restart server to see)
2. **If < 10 seconds:** Replace with longer audio
3. **Restart server**
4. **Test again**

Your voice cloning should work reliably after fixing the audio duration!
