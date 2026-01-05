/**
 * CLIPBOARD ANOMALY EASTER EGG
 * Copy the same text 5 times without changing it
 */

(function () {
  'use strict';

  let copyCount = 0;
  let lastCopiedText = '';
  let isActive = false;

  class ClipboardAnomalyEffect {
    constructor() {
      this.intervals = [];
      this.timeouts = [];
      this.elements = [];
    }

    start() {
      isActive = true;

      // Show warning
      this.showWarning();

      // Glitch effect
      this.createGlitchEffect();

      // Sound effect
      this.playAnomalySound();

      // Try to modify clipboard (may not work due to browser security)
      this.modifyClipboard();

      // End after 5 seconds
      this.timeouts.push(setTimeout(() => this.end(), 5000));
    }

    showWarning() {
      const warning = document.createElement('div');
      warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: rgba(0, 0, 0, 0.95);
        border: 3px solid #ff0000;
        padding: 30px 40px;
        z-index: 999999;
        font-family: 'Courier New', monospace;
        text-align: center;
        box-shadow: 0 0 50px #ff0000;
        animation: warningPopup 0.3s ease-out forwards;
      `;

      warning.innerHTML = `
        <div style="font-size: 24px; color: #ff0000; font-weight: bold; margin-bottom: 15px;">
          ⚠ CLIPBOARD COMPROMISED ⚠
        </div>
        <div style="font-size: 16px; color: #ffaa00; margin-bottom: 10px;">
          MEMETIC AGENT DETECTED
        </div>
        <div style="font-size: 14px; color: #fff; line-height: 1.6;">
          Your clipboard has been flagged for anomalous activity.<br>
          <span style="color: #ff0000;">[WARNING: DO NOT PASTE]</span><br>
          Class-A Amnestetics recommended.<br>
          Report to SITE-64 Medical immediately.
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 15px;">
          - SCP Foundation SITE-64 Antimemetics Division -
        </div>
      `;

      document.body.appendChild(warning);
      this.elements.push(warning);
    }

    createGlitchEffect() {
      // Screen shake
      const body = document.body;
      let shakeCount = 0;
      const interval = setInterval(() => {
        body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        shakeCount++;
        if (shakeCount > 20) {
          body.style.transform = '';
          clearInterval(interval);
        }
      }, 50);
      this.intervals.push(interval);

      // Color inversion flashes
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        body.style.filter = flashCount % 2 === 0 ? 'invert(1)' : 'invert(0)';
        flashCount++;
        if (flashCount > 8) {
          body.style.filter = '';
          clearInterval(flashInterval);
        }
      }, 200);
      this.intervals.push(flashInterval);

      // Spawn red warning symbols
      const symbolInterval = setInterval(() => {
        this.spawnWarningSymbol();
      }, 150);
      this.intervals.push(symbolInterval);
      this.timeouts.push(setTimeout(() => clearInterval(symbolInterval), 3000));
    }

    spawnWarningSymbol() {
      const symbols = ['⚠', '☢', '☣', '⚡', '💀', '⬛', '◼'];
      const symbol = document.createElement('div');
      symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      symbol.style.cssText = `
        position: fixed;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        font-size: ${30 + Math.random() * 40}px;
        color: #ff0000;
        z-index: 999998;
        pointer-events: none;
        animation: symbolFloat 1.5s ease-out forwards;
        text-shadow: 0 0 20px #ff0000;
      `;
      document.body.appendChild(symbol);
      this.elements.push(symbol);

      setTimeout(() => symbol.remove(), 1500);
    }

    playAnomalySound() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Alert sequence
        [800, 600, 800, 600, 1000, 800, 1000].forEach((freq, i) => {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.value = 0.2;

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            setTimeout(() => osc.stop(), 150);
          }, i * 100);
        });
      } catch (e) {}
    }

    modifyClipboard() {
      const anomalousText = `
⚠ MEMETIC HAZARD DETECTED ⚠

This text has been compromised by anomalous properties.
SCP Foundation Protocol [REDACTED] has been activated.

DO NOT READ FURTHER

[The rest of this message has been expunged by O5 Command]

- You have been administered Class-A amnestetics -
You will not remember reading this.
      `.trim();

      // Try to write to clipboard (requires user interaction in modern browsers)
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(anomalousText)
            .then(() => {})
            .catch((err) => {});
        }
      } catch (e) {}
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

      // Reset styles
      document.body.style.transform = '';
      document.body.style.filter = '';

      // Reset counter
      copyCount = 0;
      lastCopiedText = '';
    }
  }

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes warningPopup {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      50% { transform: translate(-50%, -50%) scale(1.1); }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }

    @keyframes symbolFloat {
      0% { opacity: 1; transform: translateY(0) rotate(0deg); }
      100% { opacity: 0; transform: translateY(-100px) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Listen for copy events
  document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyBtn');
    const outputEl = document.getElementById('output');

    if (!copyBtn || !outputEl) return;

    copyBtn.addEventListener('click', () => {
      if (isActive) return;

      const currentText = outputEl.value;

      if (currentText === lastCopiedText && currentText.length > 0) {
        copyCount++;

        if (copyCount >= 5) {
          copyCount = 0;
          const effect = new ClipboardAnomalyEffect();
          effect.start();
        }
      } else {
        copyCount = 1;
        lastCopiedText = currentText;
      }
    });

    // Reset if output changes
    outputEl.addEventListener('input', () => {
      if (outputEl.value !== lastCopiedText) {
        copyCount = 0;
      }
    });
  });
})();
