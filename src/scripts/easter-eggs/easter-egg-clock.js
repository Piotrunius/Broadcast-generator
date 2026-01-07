/**
 * CLOCK ANOMALY EASTER EGG
 * Activates when page is loaded/used at specific times:
 * - 00:00 (midnight)
 * - 03:33 (witching hour)
 */

(function () {
  'use strict';

  let hasTriggered = false;
  const CHECK_INTERVAL = 10000; // Check every 10 seconds

  class ClockAnomalyEffect {
    constructor() {
      this.intervals = [];
      this.timeouts = [];
      this.elements = [];
    }

    start() {
      hasTriggered = true;

      // Show time anomaly warning
      this.showTimeWarning();

      // Create time glitch effect
      this.createTimeGlitch();

      // Display broken clocks
      this.spawnBrokenClocks();

      // Play unsettling time sound
      this.playTimeSound();

      // End after 10 seconds
      this.timeouts.push(setTimeout(() => this.end(), 10000));
    }

    showTimeWarning() {
      const warning = document.createElement('div');
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour12: false });

      warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: rgba(20, 0, 20, 0.98);
        border: 3px solid #ff00ff;
        padding: 40px 50px;
        z-index: 999999;
        font-family: 'Courier New', monospace;
        text-align: center;
        box-shadow: 0 0 60px #ff00ff;
        animation: timePopup 0.5s ease-out forwards;
      `;

      warning.innerHTML = `
        <div style="font-size: 32px; color: #ff00ff; font-weight: bold; margin-bottom: 20px; text-shadow: 0 0 10px #ff00ff;">
          ⏰ TIME ANOMALY DETECTED ⏰
        </div>
        <div style="font-size: 48px; color: #fff; font-family: 'Courier New', monospace; margin: 20px 0; animation: timeGlitch 0.3s infinite;">
          ${time}
        </div>
        <div style="font-size: 18px; color: #ffaaff; margin: 15px 0; line-height: 1.6;">
          Temporal displacement detected<br>
          Location: SITE-64, Northern Canada<br>
          Causality violation: <span style="color: #ff0000;">CRITICAL</span>
        </div>
        <div style="font-size: 14px; color: #aaa; margin-top: 20px;">
          "Time is not what it seems at this hour..."
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 15px;">
          — SCP Foundation SITE-64 Temporal Anomalies Dept. —
        </div>
      `;

      document.body.appendChild(warning);
      this.elements.push(warning);
    }

    createTimeGlitch() {
      // Screen distortion
      const body = document.body;
      let glitchCount = 0;

      const interval = setInterval(() => {
        const distortion = Math.random() * 20 - 10;
        body.style.transform = `skewX(${distortion * 0.5}deg) scale(${1 + Math.random() * 0.05})`;
        body.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(${0.7 + Math.random() * 0.6})`;

        glitchCount++;
        if (glitchCount > 40) {
          body.style.transform = '';
          body.style.filter = '';
          clearInterval(interval);
        }
      }, 150);
      this.intervals.push(interval);

      // Time numbers raining
      const rainInterval = setInterval(() => {
        this.spawnTimeNumber();
      }, 100);
      this.intervals.push(rainInterval);
    }

    spawnTimeNumber() {
      const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', '?', '∞'];
      const number = document.createElement('div');
      number.textContent = numbers[Math.floor(Math.random() * numbers.length)];
      number.style.cssText = `
        position: fixed;
        top: -50px;
        left: ${Math.random() * 100}%;
        font-size: ${30 + Math.random() * 40}px;
        color: ${Math.random() > 0.5 ? '#ff00ff' : '#00ffff'};
        font-family: 'Courier New', monospace;
        font-weight: bold;
        z-index: 99998;
        pointer-events: none;
        opacity: 0.8;
        text-shadow: 0 0 10px currentColor;
        animation: timeRain ${2 + Math.random() * 2}s linear forwards;
      `;
      document.body.appendChild(number);
      this.elements.push(number);

      setTimeout(() => number.remove(), 4000);
    }

    spawnBrokenClocks() {
      const times = [
        '??:??:??',
        '13:13:13',
        '00:00:00',
        '∞∞:∞∞:∞∞',
        '25:99:77',
        '03:33:33',
        '--:--:--',
      ];

      const interval = setInterval(() => {
        const clock = document.createElement('div');
        clock.textContent = times[Math.floor(Math.random() * times.length)];
        clock.style.cssText = `
          position: fixed;
          top: ${Math.random() * 80 + 10}%;
          left: ${Math.random() * 80 + 10}%;
          font-size: ${40 + Math.random() * 30}px;
          color: #ff00ff;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          z-index: 99997;
          pointer-events: none;
          text-shadow: 0 0 20px #ff00ff;
          animation: clockPulse 0.5s ease-in-out infinite;
          opacity: 0.7;
        `;
        document.body.appendChild(clock);
        this.elements.push(clock);

        setTimeout(() => clock.remove(), 2000);
      }, 500);
      this.intervals.push(interval);
    }

    playTimeSound() {
      // Check if audio is muted
      if (window.audioManager && window.audioManager.isMuted) return;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Deep mechanical clock ticks - more serious
        const tickInterval = setInterval(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'square';
          osc.frequency.value = 200 + Math.random() * 100; // Lower, more mechanical
          gain.gain.value = 0.25;

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
          setTimeout(() => osc.stop(), 80);
        }, 300);

        setTimeout(() => clearInterval(tickInterval), 5000);

        // Deep temporal distortion instead of high reverse
        setTimeout(() => {
          // Low drone with modulation
          const drone = audioCtx.createOscillator();
          const droneGain = audioCtx.createGain();

          drone.type = 'sawtooth';
          drone.frequency.value = 60;
          droneGain.gain.value = 0.2;

          drone.connect(droneGain);
          droneGain.connect(audioCtx.destination);
          drone.start();

          // Modulate frequency for warping effect
          const modulateInterval = setInterval(() => {
            drone.frequency.value = 60 + Math.random() * 40;
          }, 100);

          setTimeout(() => {
            clearInterval(modulateInterval);
            droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
            setTimeout(() => drone.stop(), 1000);
          }, 2000);
        }, 3000);
      } catch (e) { }
    }

    end() {
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

      // Allow triggering again after 1 hour
      setTimeout(() => {
        hasTriggered = false;
      }, 3600000);
    }
  }

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes timePopup {
      0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
      60% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
      100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    }

    @keyframes timeGlitch {
      0%, 100% { opacity: 1; }
      25% { opacity: 0.3; transform: translateX(-2px); }
      75% { opacity: 0.8; transform: translateX(2px); }
    }

    @keyframes timeRain {
      0% { transform: translateY(-50px); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.5; }
      100% { transform: translateY(100vh); opacity: 0; }
    }

    @keyframes clockPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);

  // Check time periodically
  function checkTime() {
    if (hasTriggered) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check for 00:00 or 03:33
    if ((hours === 0 && minutes === 0) || (hours === 3 && minutes === 33)) {
      const effect = new ClockAnomalyEffect();
      effect.start();
      
      // Umami tracking: Track clock anomaly Easter egg activation
      if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
        window.umami.track('Easter_Egg_Activated', { 
          type: 'clock_anomaly',
          time: `${hours}:${minutes}`,
          page: window.location.pathname
        });
      }
    }
  }

  // Check on page load
  setTimeout(checkTime, 1000);

  // Check periodically
  setInterval(checkTime, CHECK_INTERVAL);

  // Hook for dev panel force trigger
  window.addEventListener('forceClockAnomaly', () => {
    hasTriggered = false; // Reset flag
    const effect = new ClockAnomalyEffect();
    effect.start();
  });
})();
