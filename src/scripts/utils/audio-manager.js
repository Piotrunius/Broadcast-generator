// src/scripts/utils/audio-manager.js
let audioCtx;

// Lazily create and resume AudioContext on first user gesture to satisfy autoplay policies
const ensureAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const unlockAudio = () => {
  ensureAudioContext();
  document.removeEventListener('pointerdown', unlockAudio);
  document.removeEventListener('keydown', unlockAudio);
};

document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

/**
 * Internal helper to play an oscillator sound.
 */
function playTone(freq, duration, vol, type = 'sine', ramp = true) {
  const ctx = ensureAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    if (ramp) {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    } else {
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + duration);
    }
    setTimeout(() => o.stop(), duration * 1000 + 50);
  } catch (e) {
    console.error('Audio context error: ', e);
  }
}

/**
 * Manages UI sound effects using synthesized sounds.
 * Updated with louder volumes and more variety.
 */
export class AudioManager {
  /**
   * Standard UI Click (Buttons, Selects)
   * Louder and punchier.
   */
  playClick() {
    playTone(1200, 0.08, 0.15, 'sine'); // Vol 0.05 -> 0.15
  }

  /**
   * Menu Toggle / Switch
   */
  playToggle() {
    playTone(880, 0.06, 0.15, 'triangle'); // Vol 0.05 -> 0.15
  }

  /**
   * Hover Effect
   * Louder but still short.
   */
  playHover() {
    playTone(2000, 0.02, 0.04, 'sine'); // Vol 0.01 -> 0.04
  }

  /**
   * Typing Sound (Mechanical Keypress simulation)
   * Added pitch variation for realism.
   */
  playType() {
    // Randomize pitch slightly (between 550Hz and 650Hz)
    const randomFreq = 550 + Math.random() * 100;
    playTone(randomFreq, 0.04, 0.1, 'square'); // Vol 0.03 -> 0.1
  }

  /**
   * Panel Open Sound (New)
   * A rising "whoosh" effect simulation
   */
  playOpen() {
    playTone(300, 0.15, 0.1, 'sine');
    setTimeout(() => playTone(600, 0.1, 0.08, 'sine'), 50);
  }

  /**
   * Success / Operation Complete
   */
  playSuccess() {
    const ctx = ensureAudioContext();
    const volume = 0.15; // Vol 0.05 -> 0.15

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      // Added C6
      setTimeout(() => {
        playTone(freq, 0.12, volume, 'sine');
      }, i * 70);
    });
  }

  /**
   * Error / Access Denied
   */
  playError() {
    playTone(150, 0.4, 0.25, 'sawtooth'); // Vol 0.1 -> 0.25
    setTimeout(() => playTone(140, 0.4, 0.25, 'sawtooth'), 150); // Double buzz
  }

  /**
   * Alert Levels
   */
  playAlert(level) {
    const upperLevel = level?.toUpperCase();
    if (upperLevel === 'HIGH') {
      playTone(880, 0.25, 0.25, 'square');
    } else if (upperLevel === 'MEDIUM') {
      playTone(660, 0.25, 0.2, 'sawtooth');
    } else {
      playTone(440, 0.2, 0.15, 'sine');
    }
  }
}
