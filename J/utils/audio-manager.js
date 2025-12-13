// J/utils/audio-manager.js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Internal helper to play an oscillator sound.
 */
function playTone(freq, duration, vol, type = 'sine', ramp = true) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    if(ramp) {
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    } else {
        g.gain.setValueAtTime(vol, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    }
    setTimeout(()=> o.stop(), duration * 1000 + 50);
  } catch(e) {
    console.error("Audio context error: ", e);
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
        const now = audioCtx.currentTime;
        const volume = 0.15; // Vol 0.05 -> 0.15
        
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { // Added C6
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
        if(upperLevel === "HIGH") {
            playTone(880, 0.25, 0.25, 'square');
        }
        else if(upperLevel === "MEDIUM") {
             playTone(660, 0.25, 0.2, 'sawtooth');
        }
        else {
             playTone(440, 0.2, 0.15, 'sine');
        }
    }
}