/**
 * THE FLICKERING EASTER EGG
 * Click the "Broadcast Terminal" title 13 times
 */

(function () {
  'use strict';

  let clickCount = 0;
  let isActive = false;
  let clickTimeout = null;
  const REQUIRED_CLICKS = 13;
  const RESET_TIMEOUT = 3000; // Reset counter after 3 seconds of no clicks

  class FlickeringEffect {
    constructor() {
      this.intervals = [];
      this.timeouts = [];
      this.elements = [];
      this.originalBgColor = document.body.style.backgroundColor;
      this.flickerCount = 0;
    }

    start() {
      isActive = true;

      // Phase 1: Rapid flickering
      this.createFlickerEffect();

      // Phase 2: Subliminal messages
      this.timeouts.push(setTimeout(() => this.showSubliminalMessages(), 1000));

      // Phase 3: Static noise
      this.timeouts.push(setTimeout(() => this.createStaticNoise(), 2000));

      // Phase 4: Ghost elements
      this.timeouts.push(setTimeout(() => this.spawnGhostElements(), 3000));

      // End after 10 seconds
      this.timeouts.push(setTimeout(() => this.end(), 10000));
    }

    createFlickerEffect() {
      const body = document.body;
      const interval = setInterval(() => {
        if (Math.random() > 0.5) {
          body.style.filter = 'brightness(0.3) contrast(1.5)';
          body.style.animation = 'flicker 0.05s infinite';
        } else {
          body.style.filter = 'brightness(1.5) contrast(0.8)';
        }

        this.flickerCount++;
        if (this.flickerCount > 50) {
          body.style.filter = '';
          clearInterval(interval);
        }
      }, 100);
      this.intervals.push(interval);
    }

    showSubliminalMessages() {
      const messages = [
        'DO NOT LOOK AWAY',
        'YOU ARE BEING WATCHED',
        'THERE IS NO ESCAPE',
        'SCP-███ HAS BREACHED',
        '[REDACTED]',
        'THEY KNOW YOU SAW THIS',
        'BLINK AND YOU DIE',
        'CLASS-A AMNESTETICS REQUIRED',
      ];

      const interval = setInterval(() => {
        const msg = document.createElement('div');
        msg.textContent = messages[Math.floor(Math.random() * messages.length)];
        msg.style.cssText = `
          position: fixed;
          top: ${Math.random() * 80 + 10}%;
          left: ${Math.random() * 80 + 10}%;
          font-size: ${40 + Math.random() * 40}px;
          color: #ff0000;
          font-weight: bold;
          z-index: 99999;
          pointer-events: none;
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 20px #ff0000;
          opacity: 0;
          animation: subliminalFlash 0.15s ease-in-out;
        `;
        document.body.appendChild(msg);
        this.elements.push(msg);

        setTimeout(() => msg.remove(), 150);
      }, 300);
      this.intervals.push(interval);

      // Stop subliminal after 4 seconds
      this.timeouts.push(setTimeout(() => clearInterval(interval), 4000));
    }

    createStaticNoise() {
      const staticCanvas = document.createElement('canvas');
      staticCanvas.width = window.innerWidth;
      staticCanvas.height = window.innerHeight;
      staticCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99998;
        pointer-events: none;
        opacity: 0.4;
        mix-blend-mode: overlay;
      `;

      document.body.appendChild(staticCanvas);
      this.elements.push(staticCanvas);

      const ctx = staticCanvas.getContext('2d');
      const interval = setInterval(() => {
        const imageData = ctx.createImageData(staticCanvas.width, staticCanvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const value = Math.random() * 255;
          imageData.data[i] = value;
          imageData.data[i + 1] = value;
          imageData.data[i + 2] = value;
          imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      }, 50);
      this.intervals.push(interval);

      // Play static sound
      this.playStaticSound();
    }

    spawnGhostElements() {
      // Create ghost checkbox that appears and disappears
      const ghostOptions = [
        '⚠ SCP-████ BREACH',
        '☠ MTF MOBILIZED',
        '⬛ [DATA EXPUNGED]',
        '👁 YOU ARE BEING MONITORED',
        '💀 SITE-64 COMPROMISED',
        '⚠ CHAOS INSURGENCY DETECTED',
      ];

      const interval = setInterval(() => {
        const ghost = document.createElement('div');
        ghost.className = 'checkbox-btn';
        ghost.innerHTML = `
          <input type="checkbox" checked disabled>
          <label>${ghostOptions[Math.floor(Math.random() * ghostOptions.length)]}</label>
        `;
        ghost.style.cssText = `
          position: fixed;
          top: ${Math.random() * 70 + 10}%;
          left: ${Math.random() * 70 + 10}%;
          z-index: 99997;
          opacity: 0.7;
          background: rgba(255, 0, 0, 0.2);
          border: 2px solid #ff0000;
          padding: 10px;
          animation: ghostFade 1s ease-in-out;
          pointer-events: none;
        `;
        document.body.appendChild(ghost);
        this.elements.push(ghost);

        setTimeout(() => ghost.remove(), 1000);
      }, 500);
      this.intervals.push(interval);
    }

    playStaticSound() {
      // Check if audio is muted
      if (window.audioManager && window.audioManager.isMuted) return;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.1;

        whiteNoise.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        whiteNoise.start();

        setTimeout(() => {
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          setTimeout(() => whiteNoise.stop(), 500);
        }, 3000);
      } catch (e) { }
    }

    end() {
      isActive = false;

      // Clear all intervals
      this.intervals.forEach((interval) => clearInterval(interval));
      this.intervals = [];

      // Clear all timeouts
      this.timeouts.forEach((timeout) => clearTimeout(timeout));
      this.timeouts = [];

      // Remove all elements
      this.elements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      this.elements = [];

      // Reset body styles
      document.body.style.filter = '';
      document.body.style.animation = '';
      document.body.style.backgroundColor = this.originalBgColor;

      // Reset click counter
      clickCount = 0;
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @keyframes subliminalFlash {
      0% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.2); }
    }

    @keyframes ghostFade {
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 0.8; transform: scale(1.05); }
      100% { opacity: 0; transform: scale(0.9); }
    }
  `;
  document.head.appendChild(style);

  // Listen for title clicks
  document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('h1');
    if (!title) return;

    title.style.cursor = 'pointer';
    title.style.userSelect = 'none';

    title.addEventListener('click', (e) => {
      if (isActive) return;

      clickCount++;

      // Visual feedback
      title.style.color = '#ff0000';
      setTimeout(() => {
        title.style.color = '';
      }, 100);

      // Reset timeout
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        clickCount = 0;
      }, RESET_TIMEOUT);

      // Activate if reached required clicks
      if (clickCount >= REQUIRED_CLICKS) {
        clickCount = 0;
        clearTimeout(clickTimeout);
        const effect = new FlickeringEffect();
        effect.start();
        
        // Umami tracking: Track flickering Easter egg activation
        if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
          window.umami.track('Easter_Egg_Activated', { 
            type: 'flickering',
            clicks: REQUIRED_CLICKS,
            page: window.location.pathname
          });
        }
      }
    });
  });
})();
