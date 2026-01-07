/**
 * THE SILENCE EASTER EGG
 * Press Shift + Ctrl + P to activate
 */

(function () {
  'use strict';

  let isActive = false;
  const DURATION = 8000; // 8 seconds

  class SilenceEffect {
    constructor() {
      this.intervals = [];
      this.timeouts = [];
      this.elements = [];
      this.originalFilter = document.body.style.filter;
    }

    start() {
      isActive = true;

      // Mute all audio contexts
      this.muteAudio();

      // Grayscale effect
      this.applyGrayscale();

      // Show silence notification
      this.showNotification();

      // Spawn silence symbols
      this.createSilenceSymbols();

      // Eerie sound (ironically)
      this.playEerieSilence();

      // End after duration
      this.timeouts.push(setTimeout(() => this.end(), DURATION));
    }

    muteAudio() {
      // Try to mute Web Audio API contexts
      try {
        if (window.AudioContext || window.webkitAudioContext) {
          // Create a script that intercepts audio
        }
      } catch (e) { }
    }

    applyGrayscale() {
      const body = document.body;

      // Gradual transition to grayscale
      let saturation = 100;
      const interval = setInterval(() => {
        saturation -= 5;
        if (saturation <= 0) {
          saturation = 0;
          clearInterval(interval);
        }
        body.style.filter = `saturate(${saturation}%) brightness(0.7)`;
      }, 50);
      this.intervals.push(interval);

      // Add vignette effect
      const vignette = document.createElement('div');
      vignette.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99996;
        pointer-events: none;
        background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%);
        opacity: 0;
        transition: opacity 1s;
      `;
      document.body.appendChild(vignette);
      this.elements.push(vignette);

      setTimeout(() => {
        vignette.style.opacity = '1';
      }, 100);
    }

    showNotification() {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #666;
        padding: 40px 60px;
        z-index: 99999;
        font-family: 'Courier New', monospace;
        text-align: center;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
        opacity: 0;
        animation: silenceFadeIn 1s forwards;
      `;

      notification.innerHTML = `
        <div style="font-size: 28px; color: #888; font-weight: bold; margin-bottom: 20px; letter-spacing: 3px;">
          🔇 THE SILENCE 🔇
        </div>
        <div style="font-size: 16px; color: #aaa; line-height: 1.8; margin-bottom: 15px;">
          SOUND CANCELLED<br>
          ANTIMEMETIC DIVISION PROTOCOL ACTIVE<br>
          SITE-64 | NORTHERN CANADA
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 20px; font-style: italic;">
          "In the absence of sound, truth reveals itself"
        </div>
        <div style="font-size: 10px; color: #444; margin-top: 15px;">
          — SCP Foundation SITE-64 Antimemetics Division —
        </div>
      `;

      document.body.appendChild(notification);
      this.elements.push(notification);

      // Fade out after 5 seconds
      this.timeouts.push(
        setTimeout(() => {
          notification.style.animation = 'silenceFadeOut 1s forwards';
          setTimeout(() => notification.remove(), 1000);
        }, 5000)
      );
    }

    createSilenceSymbols() {
      // Floating mute symbols
      const symbols = ['🔇', '⬛', '◼', '●', '▪'];

      const interval = setInterval(() => {
        const symbol = document.createElement('div');
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          font-size: ${20 + Math.random() * 30}px;
          color: #333;
          z-index: 99997;
          pointer-events: none;
          opacity: 0.6;
          animation: silenceFloat 4s ease-out forwards;
        `;
        document.body.appendChild(symbol);
        this.elements.push(symbol);

        setTimeout(() => symbol.remove(), 4000);
      }, 400);
      this.intervals.push(interval);
    }

    playEerieSilence() {
      // Check if audio is muted
      if (window.audioManager && window.audioManager.isMuted) return;

      // Deep, unsettling drone
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create multiple layers for richer sound
        const oscillators = [];
        const gains = [];

        // Layer 1: Deep bass
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 40;
        gain1.gain.value = 0.2;
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        oscillators.push(osc1);
        gains.push(gain1);

        // Layer 2: Mid drone
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = 60;
        gain2.gain.value = 0.15;
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        oscillators.push(osc2);
        gains.push(gain2);

        // Layer 3: Harmonic
        const osc3 = audioCtx.createOscillator();
        const gain3 = audioCtx.createGain();
        osc3.type = 'sawtooth';
        osc3.frequency.value = 80;
        gain3.gain.value = 0.1;
        osc3.connect(gain3);
        gain3.connect(audioCtx.destination);
        oscillators.push(osc3);
        gains.push(gain3);

        // Start all
        oscillators.forEach((osc) => osc.start());

        // Smooth fade out over 3 seconds
        setTimeout(() => {
          gains.forEach((gain) => {
            gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
          });
          setTimeout(() => {
            oscillators.forEach((osc) => {
              try {
                osc.stop();
                osc.disconnect();
              } catch (e) { }
            });
          }, 3000);
        }, DURATION - 3000);
      } catch (e) { }
    }

    end() {
      isActive = false;

      // Clear intervals
      this.intervals.forEach((interval) => clearInterval(interval));
      this.intervals = [];

      // Clear timeouts
      this.timeouts.forEach((timeout) => clearTimeout(timeout));
      this.timeouts = [];

      // Remove elements
      this.elements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      this.elements = [];

      // Restore color gradually
      const body = document.body;
      let saturation = 0;
      const restoreInterval = setInterval(() => {
        saturation += 5;
        if (saturation >= 100) {
          saturation = 100;
          body.style.filter = this.originalFilter;
          clearInterval(restoreInterval);
        } else {
          body.style.filter = `saturate(${saturation}%) brightness(${0.7 + saturation * 0.003})`;
        }
      }, 50);
    }
  }

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes silenceFadeIn {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    @keyframes silenceFadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }

    @keyframes silenceFloat {
      0% {
        opacity: 0.6;
        transform: translateY(0) rotate(0deg);
      }
      50% {
        opacity: 0.3;
      }
      100% {
        opacity: 0;
        transform: translateY(-200px) rotate(180deg);
      }
    }
  `;
  document.head.appendChild(style);

  // Listen for Shift or Ctrl + "scp"
  let keySequence = '';
  let keyTimeout = null;

  document.addEventListener('keydown', (e) => {
    if (isActive) return;

    // Check if Shift OR Ctrl is held
    if (e.shiftKey || e.ctrlKey) {
      if (e.key.length === 1) {
        keySequence += e.key.toLowerCase();

        clearTimeout(keyTimeout);
        keyTimeout = setTimeout(() => {
          keySequence = '';
        }, 1000);

        if (keySequence === 'scp') {
          keySequence = '';
          const effect = new SilenceEffect();
          effect.start();
          
          // Umami tracking: Track silence Easter egg activation
          if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
            window.umami.track('Easter_Egg_Activated', { 
              type: 'silence',
              trigger: '(Shift|Ctrl)+SCP',
              page: window.location.pathname
            });
          }
        }
      }
    } else {
      // Reset if modifiers released
      keySequence = '';
    }
  });
})();
