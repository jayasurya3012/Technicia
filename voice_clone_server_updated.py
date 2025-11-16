# voice_clone_server.py
# Fast, GPU-aware Voice-Cloning API (Coqui XTTS + Bark) with Synthetic Voice Generation
# -------------------------------------------------------------------
from fastapi import FastAPI, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from TTS.api import TTS
from bark import SAMPLE_RATE, generate_audio, preload_models
import torch
import soundfile as sf
import numpy as np
import os
import time
import hashlib
from pathlib import Path
from scipy import signal

app = FastAPI(title="Voice Clone API", version="2.1")

# Allow React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# 1️⃣  Configuration
# -------------------------------------------------------------------
tts = None
STYLE_REF_PATH = "bark_reference.wav"
OUTPUT_DIR = Path("./audio_outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# Base voice reference (John F. Kennedy)
JFK_VOICE = "./kenny.wav"  # Your JFK voice sample

# Dictionary mapping figure names to their reference audio files or pitch shift parameters
# If a voice file doesn't exist, we'll use JFK's voice with pitch shifting
VOICE_REFERENCES = {
    "John F. Kennedy": {"file": JFK_VOICE, "pitch_shift": 0},  # Original JFK voice
    "Abraham Lincoln": {"file": "./voices/lincoln.wav", "pitch_shift": -2},  # Deeper voice
    "Albert Einstein": {"file": "./voices/einstein.wav", "pitch_shift": 1},  # Slightly higher
    "Marie Curie": {"file": "./voices/curie.wav", "pitch_shift": 4},  # Higher (female)
    "Leonardo da Vinci": {"file": "./voices/davinci.wav", "pitch_shift": 0},  # Normal
    "Cleopatra": {"file": "./voices/cleopatra.wav", "pitch_shift": 5},  # Higher (female)
    "William Shakespeare": {"file": "./voices/shakespeare.wav", "pitch_shift": -1},  # Slightly deeper
    "Julius Caesar": {"file": "./voices/caesar.wav", "pitch_shift": -2},  # Deeper
    "Joan of Arc": {"file": "./voices/joanofarc.wav", "pitch_shift": 3},  # Higher (female)
    "Galileo Galilei": {"file": "./voices/galileo.wav", "pitch_shift": 1},  # Slightly higher
    "Queen Elizabeth I": {"file": "./voices/elizabeth.wav", "pitch_shift": 4},  # Higher (female)
    "default": {"file": JFK_VOICE, "pitch_shift": 0}  # fallback voice
}

def pitch_shift_audio(audio_path: str, semitones: float) -> str:
    """
    Pitch shift an audio file by a number of semitones.
    Returns the path to the pitch-shifted file.
    """
    if semitones == 0:
        return audio_path  # No shift needed

    # Read the audio file
    audio_data, sample_rate = sf.read(audio_path)

    # Convert stereo to mono if necessary
    if len(audio_data.shape) > 1:
        audio_data = np.mean(audio_data, axis=1)

    # Ensure we're working with float32
    audio_data = audio_data.astype(np.float32)

    # Calculate the shift factor
    shift_factor = 2 ** (semitones / 12.0)

    # Resample to shift pitch
    # Number of samples in shifted audio
    new_length = int(len(audio_data) / shift_factor)

    # Resample
    shifted_audio = signal.resample(audio_data, new_length)

    # Resample back to original length to maintain duration
    final_audio = signal.resample(shifted_audio, len(audio_data))

    # Normalize to prevent clipping
    max_val = np.max(np.abs(final_audio))
    if max_val > 0:
        final_audio = final_audio / max_val * 0.95  # Leave some headroom

    # Ensure the output is float32 and in the range [-1, 1]
    final_audio = np.clip(final_audio, -1.0, 1.0).astype(np.float32)

    # Save to temporary file with same sample rate as original
    temp_path = audio_path.replace(".wav", f"_shifted_{int(semitones)}.wav")
    sf.write(temp_path, final_audio, sample_rate, subtype='PCM_16')

    return temp_path

# -------------------------------------------------------------------
# 2️⃣  Startup: preload Bark + Coqui XTTS and make style reference
# -------------------------------------------------------------------
@app.on_event("startup")
def preload_all():
    global tts

    print("=" * 60)
    print("🚀 Starting Voice Clone Server...")
    print("=" * 60)

    print("\n⏳ Loading Bark models...")
    preload_models()
    print("✅ Bark models loaded successfully!")

    # Create Bark style reference once
    if not os.path.exists(STYLE_REF_PATH):
        print("\n🎨 Generating Bark style reference...")
        style_audio = generate_audio("This is a reference tone to define the speaking style.")
        sf.write(STYLE_REF_PATH, style_audio, SAMPLE_RATE)
        print("✅ Bark style reference created!")
    else:
        print("\n🎨 Reusing cached Bark style reference.")

    # Force CPU mode to avoid CUDA errors with pitch-shifted audio
    use_gpu = False  # Disabled due to CUDA compatibility issues with pitch shifting
    print(f"\n🖥️  GPU Mode:")
    print(f"   - Using: CPU (forced - GPU disabled due to pitch shift compatibility)")
    print(f"   - Note: GPU mode causes 'CUDA device-side assert' errors with pitch-shifted audio")

    print(f"\n⏳ Initializing Coqui-XTTS (CPU mode)...")
    tts = TTS(
        model_name="tts_models/multilingual/multi-dataset/xtts_v2",
        progress_bar=False,
        gpu=False  # Force CPU mode
    )

    # Pre-set style configuration
    tts.synthesizer.tts_model.config.style_wav = STYLE_REF_PATH
    tts.synthesizer.tts_model.config.style_mix = 0.8

    print("✅ Coqui-XTTS loaded successfully!")

    # Verify JFK voice reference file
    print("\n🎤 Checking base voice reference:")
    if os.path.exists(JFK_VOICE):
        print(f"   ✅ John F. Kennedy (base): {JFK_VOICE}")
    else:
        print(f"   ❌ ERROR: JFK voice not found at {JFK_VOICE}")
        print(f"   Please place your JFK voice sample at {JFK_VOICE}")

    # Verify voice reference files
    print("\n🎤 Checking character voice references:")
    missing_voices = []
    synthetic_voices = []

    for figure, config in VOICE_REFERENCES.items():
        if figure == "default":
            continue

        voice_file = config["file"]
        pitch_shift = config["pitch_shift"]

        if os.path.exists(voice_file):
            print(f"   ✅ {figure}: {voice_file}")
        else:
            print(f"   🔧 {figure}: MISSING - will use JFK voice with {pitch_shift:+d} semitone shift")
            if figure != "default":
                missing_voices.append(figure)
                synthetic_voices.append(f"{figure} ({pitch_shift:+d} semitones)")

    if synthetic_voices:
        print(f"\n🔧 Synthetic voices (JFK-based with pitch shift):")
        for voice in synthetic_voices:
            print(f"   - {voice}")

    print("\n" + "=" * 60)
    print("✅ Voice Clone Server is ready!")
    print("=" * 60 + "\n")

# -------------------------------------------------------------------
# 3️⃣  Root endpoint
# -------------------------------------------------------------------
@app.get("/")
def root():
    gpu_available = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if gpu_available else "None"

    return {
        "message": "✅ Voice Clone API is live!",
        "version": "2.1",
        "gpu_available": gpu_available,
        "gpu_name": gpu_name,
        "available_voices": list(VOICE_REFERENCES.keys()),
        "total_voices": len(VOICE_REFERENCES),
        "base_voice": "John F. Kennedy",
        "synthetic_voice_support": True
    }

# -------------------------------------------------------------------
# 4️⃣  Health check endpoint
# -------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "tts_loaded": tts is not None,
        "gpu_available": torch.cuda.is_available(),
        "jfk_voice_available": os.path.exists(JFK_VOICE)
    }

# -------------------------------------------------------------------
# 5️⃣  List available voices endpoint
# -------------------------------------------------------------------
@app.get("/voices")
def list_voices():
    voices_info = {}
    for figure, config in VOICE_REFERENCES.items():
        voice_file = config["file"]
        pitch_shift = config.get("pitch_shift", 0)

        voices_info[figure] = {
            "reference_file": voice_file,
            "exists": os.path.exists(voice_file),
            "pitch_shift": pitch_shift,
            "is_synthetic": not os.path.exists(voice_file) and voice_file != JFK_VOICE,
            "base_voice": "JFK" if not os.path.exists(voice_file) else "original"
        }
    return voices_info

# -------------------------------------------------------------------
# 6️⃣  Text → cloned audio endpoint
# -------------------------------------------------------------------
@app.post("/generate")
def generate_audio_endpoint(
    text: str = Form(...),
    speaker: str = Form(default="default")
):
    try:
        start_time = time.time()

        # Clean the text (remove markdown, special characters that might cause issues)
        cleaned_text = text.replace("**", "").replace("*", "")

        # Truncate if text is too long (XTTS has limits)
        max_length = 500  # Adjust based on your needs
        if len(cleaned_text) > max_length:
            print(f"⚠️  Text truncated from {len(cleaned_text)} to {max_length} characters")
            cleaned_text = cleaned_text[:max_length] + "..."

        print(f"\n{'='*60}")
        print(f"🎙️  New Generation Request")
        print(f"{'='*60}")
        print(f"Speaker: {speaker}")
        print(f"Text Length: {len(cleaned_text)} characters")
        print(f"Text Preview: {cleaned_text[:100]}...")

        # Get the voice configuration for this speaker
        voice_config = VOICE_REFERENCES.get(speaker, VOICE_REFERENCES["default"])
        reference_audio = voice_config["file"]
        pitch_shift = voice_config.get("pitch_shift", 0)

        # Check if reference file exists
        if not os.path.exists(reference_audio):
            # Use JFK voice with pitch shifting
            if not os.path.exists(JFK_VOICE):
                raise FileNotFoundError(
                    f"Base JFK voice not found at {JFK_VOICE}. "
                    "Please ensure the JFK voice reference exists."
                )

            print(f"🔧 Voice file for '{speaker}' not found")
            print(f"   Using JFK voice with {pitch_shift:+d} semitone shift")
            reference_audio = JFK_VOICE

            # Apply pitch shift if needed
            if pitch_shift != 0:
                print(f"⏳ Applying pitch shift ({pitch_shift:+d} semitones)...")
                reference_audio = pitch_shift_audio(JFK_VOICE, pitch_shift)
                print(f"✅ Pitch shift applied: {reference_audio}")
        else:
            print(f"🎤 Using voice reference: {reference_audio}")

        # Validate audio file
        try:
            audio_data, sr = sf.read(reference_audio)
            duration = len(audio_data) / sr
            print(f"📊 Audio file info:")
            print(f"   - Duration: {duration:.2f} seconds")
            print(f"   - Sample rate: {sr} Hz")
            print(f"   - Channels: {'Stereo' if len(audio_data.shape) > 1 else 'Mono'}")

            if duration < 6:
                print(f"⚠️  WARNING: Audio is only {duration:.2f} seconds!")
                print(f"   XTTS works best with 10-15+ seconds of audio")
                print(f"   Short audio may cause 'index out of range' errors")
        except Exception as e:
            print(f"⚠️  Could not validate audio file: {e}")

        # Create a unique filename based on text hash and speaker
        text_hash = hashlib.md5(f"{speaker}:{cleaned_text}".encode()).hexdigest()[:8]
        output_path = OUTPUT_DIR / f"voice_{speaker.replace(' ', '_')}_{text_hash}.wav"

        print(f"⏳ Generating audio...")

        # Generate the audio
        tts.tts_to_file(
            text=cleaned_text,
            speaker_wav=reference_audio,
            language="en",
            file_path=str(output_path)
        )

        generation_time = round(time.time() - start_time, 2)

        # Get file size
        file_size = os.path.getsize(output_path) / 1024  # KB

        print(f"✅ Audio generated successfully!")
        print(f"   - Generation Time: {generation_time}s")
        print(f"   - File Size: {file_size:.2f} KB")
        print(f"   - Output Path: {output_path}")
        if pitch_shift != 0:
            print(f"   - Pitch Shift: {pitch_shift:+d} semitones")
        print(f"{'='*60}\n")

        # Clean up temporary pitch-shifted file if it was created
        if pitch_shift != 0 and os.path.exists(reference_audio) and "_shifted_" in reference_audio:
            try:
                os.remove(reference_audio)
            except:
                pass

        return FileResponse(
            str(output_path),
            media_type="audio/wav",
            filename=f"{speaker.replace(' ', '_')}_voice.wav",
            headers={
                "X-Generation-Time": str(generation_time),
                "X-Text-Length": str(len(cleaned_text)),
                "X-Speaker": speaker,
                "X-Pitch-Shift": str(pitch_shift) if pitch_shift != 0 else "0",
                "X-Voice-Type": "synthetic" if not os.path.exists(voice_config["file"]) else "original"
            }
        )

    except FileNotFoundError as e:
        print(f"❌ File Error: {str(e)}")
        return JSONResponse(
            status_code=404,
            content={
                "error": "Voice reference file not found",
                "message": str(e),
                "speaker": speaker
            }
        )

    except Exception as e:
        print(f"❌ Generation Error: {str(e)}")
        import traceback
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "error": "Audio generation failed",
                "message": str(e),
                "speaker": speaker,
                "text_length": len(text) if text else 0
            }
        )

# -------------------------------------------------------------------
# 7️⃣  Cleanup old audio files endpoint (optional)
# -------------------------------------------------------------------
@app.post("/cleanup")
def cleanup_old_files(max_age_hours: int = 24):
    """Remove generated audio files older than specified hours"""
    try:
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        deleted_count = 0

        for file_path in OUTPUT_DIR.glob("voice_*.wav"):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                os.remove(file_path)
                deleted_count += 1

        # Also clean up temporary pitch-shifted files
        for file_path in Path(".").glob("*_shifted_*.wav"):
            os.remove(file_path)
            deleted_count += 1

        return {
            "message": f"Cleanup completed",
            "deleted_files": deleted_count,
            "max_age_hours": max_age_hours
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

# -------------------------------------------------------------------
# 8️⃣  Run manually:  uvicorn voice_clone_server:app --host 0.0.0.0 --port 8000 --reload
# -------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
