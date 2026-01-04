/**
 * THE PATTERN EASTER EGG
 * Select Threat Levels in specific pattern: High → Low → Medium → High → Low
 */

(function () {
  'use strict';

  const PATTERN = ['High', 'Low', 'Medium', 'High', 'Low'];
  let currentSequence = [];
  let isActive = false;

  class PatternEffect {
    constructor() {
      this.intervals = [];
      this.timeouts = [];
      this.elements = [];
    }

    start() {
      isActive = true;

      // Show unlock notification
      this.showUnlockNotification();

      // Reveal hidden protocol
      this.revealHiddenProtocol();

      // Play unlock sound
      this.playUnlockSound();

      // Spawn pattern symbols
      this.spawnPatternSymbols();

      // End after 15 seconds
      this.timeouts.push(setTimeout(() => this.end(), 15000));
    }

    showUnlockNotification() {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: rgba(0, 100, 0, 0.95);
        border: 3px solid #00ff00;
        padding: 25px 40px;
        z-index: 999999;
        font-family: 'Courier New', monospace;
        text-align: center;
        box-shadow: 0 0 40px #00ff00;
        animation: unlockSlide 0.5s ease-out forwards;
      `;

      notification.innerHTML = `
        <div style="font-size: 24px; color: #00ff00; font-weight: bold; margin-bottom: 10px;">
          🔓 PATTERN RECOGNIZED 🔓
        </div>
        <div style="font-size: 14px; color: #aaffaa; line-height: 1.6;">
          SITE-64 Omega Protocol Access Granted<br>
          <span style="color: #ffff00;">Clearance Level: O5-SITE-64</span>
        </div>
        <div style="font-size: 12px; color: #88ff88; margin-top: 10px; font-style: italic;">
          "SECURE. CONTAIN. PROTECT."
        </div>
      `;

      document.body.appendChild(notification);
      this.elements.push(notification);
    }

    revealHiddenProtocol() {
      // Show Omega Protocol message directly without button
      const output = document.getElementById('output');
      if (output) {
        output.value =
          '⚠ OMEGA PROTOCOL ACTIVATED ⚠\n\n' +
          '=== SITE-64 EMERGENCY BROADCAST ===\n' +
          'Location: Northern Canada\n' +
          'Status: CRITICAL CONTAINMENT FAILURE\n\n' +
          'SITE-WIDE EVACUATION INITIATED\n' +
          'ALL PERSONNEL TO DESIGNATED SHELTERS\n' +
          'CHAOS INSURGENCY BREACH DETECTED\n' +
          'MULTIPLE SCP ENTITIES COMPROMISED\n\n' +
          'XK-CLASS END-OF-WORLD SCENARIO IMMINENT\n\n' +
          'THIS IS NOT A DRILL\n' +
          '[O5 AUTHORIZATION CONFIRMED]\n' +
          '[SITE-64 COMMAND]\n\n' +
          'SECURE. CONTAIN. PROTECT.\n\n' +
          'May God have mercy on our souls.';
      }
      this.playOmegaSound();
    }

    playUnlockSound() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Ascending unlock sequence
        [261.63, 329.63, 392.0, 523.25, 659.25].forEach((freq, i) => {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0.2;

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            setTimeout(() => osc.stop(), 300);
          }, i * 100);
        });

        // Success chord
        setTimeout(() => {
          [523.25, 659.25, 783.99].forEach((freq) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0.15;

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            setTimeout(() => osc.stop(), 500);
          });
        }, 600);
      } catch (e) {}
    }

    playOmegaSound() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Ominous deep tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 50;
        gain.gain.value = 0.3;

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
        setTimeout(() => osc.stop(), 2000);

        // Alarm overlay
        [1000, 800, 1000, 800].forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();

            osc2.type = 'square';
            osc2.frequency.value = freq;
            gain2.gain.value = 0.2;

            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.start();
            gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            setTimeout(() => osc2.stop(), 200);
          }, i * 250);
        });
      } catch (e) {}
    }

    spawnPatternSymbols() {
      const symbols = ['🔓', '✓', '●', '◆', '▲'];

      const interval = setInterval(() => {
        const symbol = document.createElement('div');
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          font-size: ${30 + Math.random() * 30}px;
          color: #00ff00;
          z-index: 99998;
          pointer-events: none;
          text-shadow: 0 0 20px #00ff00;
          animation: patternFloat 3s ease-out forwards;
        `;
        document.body.appendChild(symbol);
        this.elements.push(symbol);

        setTimeout(() => symbol.remove(), 3000);
      }, 300);
      this.intervals.push(interval);

      // Stop after 10 seconds
      this.timeouts.push(setTimeout(() => clearInterval(interval), 10000));
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

      // Reset sequence
      currentSequence = [];
    }
  }

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes unlockSlide {
      0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
      100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    @keyframes protocolPulse {
      0%, 100% { box-shadow: 0 0 10px #00ff00; }
      50% { box-shadow: 0 0 30px #00ff00; }
    }

    @keyframes protocolGlow {
      0%, 100% { text-shadow: 0 0 10px #00ff00; }
      50% { text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00; }
    }

    @keyframes protocolFadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; transform: scale(0.8); }
    }

    @keyframes patternFloat {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-150px) scale(1.5) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Listen for threat level selections
  document.addEventListener('DOMContentLoaded', () => {
    const alarmContent = document.getElementById('alarmContent');
    if (!alarmContent) return;

    alarmContent.addEventListener('click', (e) => {
      if (isActive) return;

      const button = e.target.closest('button[data-option]');
      if (!button) return;

      const option = button.dataset.option;

      // Check if it's a threat level option
      if (['High', 'Medium', 'Low'].includes(option)) {
        currentSequence.push(option);

        // Keep only last 5
        if (currentSequence.length > 5) {
          currentSequence.shift();
        }

        // Check if pattern matches
        if (currentSequence.length === 5) {
          const matches = currentSequence.every((val, idx) => val === PATTERN[idx]);

          if (matches) {
            currentSequence = [];
            const effect = new PatternEffect();
            effect.start();
          }
        }
      }
    });
  });
})();
