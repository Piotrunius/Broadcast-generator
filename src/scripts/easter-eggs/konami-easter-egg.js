/**
 * ADVANCED KONAMI CODE EASTER EGG
 * Ultra sophisticated visual effects system
 * Code: ↑↑↓↓←→←→BA
 */

(function() {
  'use strict';

  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let konamiPosition = 0;
  let isActive = false;
  let effectsController = null;

  class EasterEggEffects {
    constructor() {
      this.intervals = [];
      this.timeouts = [];
      this.elements = [];
      this.originalOutput = '';
      this.outputEl = document.getElementById('output');
      this.matrixRain = null;
      this.glitchOverlay = null;
      this.audioContext = null;
      this.oscillators = [];
      this.gainNodes = [];
      this.activeSounds = [];
    }

    start() {
      if (isActive) return;
      isActive = true;

      this.originalOutput = this.outputEl.value;
      
      // Initial breach sound sequence
      this.playBreachSequence();
      
      // Phase 1: Initial glitch (visible longer - 3 seconds)
      this.phaseOneGlitch();
      
      // Phase 2: Matrix rain (starts after 3s instead of 1s)
      this.timeouts.push(setTimeout(() => this.phaseTwoMatrix(), 3000));
      
      // Phase 3: Reality distortion (starts after 5s instead of 3s)
      this.timeouts.push(setTimeout(() => this.phaseThreeDistortion(), 5000));
      
      // Phase 4: Chaos mode (starts after 7s instead of 5s)
      this.timeouts.push(setTimeout(() => this.phaseFourChaos(), 7000));
      
      // End after 15 seconds (extended from 12s)
      this.timeouts.push(setTimeout(() => this.end(), 15000));
    }

    phaseOneGlitch() {
      // Display SCP-079 breach message
      this.outputEl.value = "⚠ CONTAINMENT BREACH DETECTED ⚠\n\n" +
        "SCP-079 HAS ACCESSED TERMINAL\n" +
        "LOCATION: SITE-64 | NORTHERN CANADA\n" +
        "SECURITY LEVEL: COMPROMISED\n" +
        "CHAOS INSURGENCY INVOLVEMENT: CONFIRMED\n\n" +
        "[REDACTED]\n[DATA EXPUNGED]\n" +
        "MEMETIC HAZARD ACTIVE\n\n" +
        "SECURE. CONTAIN. PROTECT.";

      // Add glitch class
      document.body.classList.add('konami-glitch');

      // Create scanline overlay
      this.createScanlineOverlay();

      // Glitch sounds during text corruption - częściej i głośniej
      this.intervals.push(setInterval(() => {
        this.playGlitchSound();
      }, 200));

      // Random text corruption
      this.intervals.push(setInterval(() => {
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        let text = this.outputEl.value;
        const pos = Math.floor(Math.random() * text.length);
        text = text.substring(0, pos) + chars[Math.floor(Math.random() * chars.length)] + text.substring(pos + 1);
        this.outputEl.value = text;
      }, 100));
    }

    phaseTwoMatrix() {
      // Matrix activation sound
      this.playMatrixSound();
      
      // Create matrix rain effect (lower z-index so other effects appear above)
      this.matrixRain = document.createElement('canvas');
      this.matrixRain.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 100;
        pointer-events: none;
        opacity: 0.7;
      `;
      document.body.appendChild(this.matrixRain);
      this.elements.push(this.matrixRain);

      const ctx = this.matrixRain.getContext('2d');
      this.matrixRain.width = window.innerWidth;
      this.matrixRain.height = window.innerHeight;

      const columns = Math.floor(this.matrixRain.width / 20);
      const drops = Array(columns).fill(1);

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, this.matrixRain.width, this.matrixRain.height);

        ctx.fillStyle = '#0f0';
        ctx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = String.fromCharCode(0x30A0 + Math.random() * 96);
          ctx.fillText(text, i * 20, drops[i] * 20);

          if (drops[i] * 20 > this.matrixRain.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      this.intervals.push(setInterval(drawMatrix, 50));

      // Add chromatic aberration
      document.body.style.animation = 'chromatic 0.3s infinite alternate';
    }

    phaseThreeDistortion() {
      // Reality distortion sound
      this.playDistortionSound();
      
      // Create glitch overlay with animated SVG (above matrix)
      this.glitchOverlay = document.createElement('div');
      this.glitchOverlay.innerHTML = `
        <svg style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; pointer-events: none;">
          <filter id="turbulence" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="5" seed="2">
              <animate attributeName="baseFrequency" dur="2s" values="0.01 0.03;0.03 0.06;0.01 0.03" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="30"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#turbulence)" opacity="0.5"/>
        </svg>
      `;
      document.body.appendChild(this.glitchOverlay);
      this.elements.push(this.glitchOverlay);

      // 3D transforms on main content
      const wrap = document.querySelector('.wrap');
      if (wrap) {
        this.intervals.push(setInterval(() => {
          const rx = (Math.random() - 0.5) * 15;
          const ry = (Math.random() - 0.5) * 15;
          wrap.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        }, 200));
      }

      // Spawn floating glitch blocks
      this.intervals.push(setInterval(() => {
        this.spawnGlitchBlock();
      }, 300));

      // Color inversion waves
      let hue = 0;
      this.intervals.push(setInterval(() => {
        hue += 10;
        document.body.style.filter = `hue-rotate(${hue}deg) saturate(2)`;
      }, 50));
    }

    phaseFourChaos() {
      // Chaos mode activation - siren-like sound
      this.playChaosSound();
      
      // Ultra particles speed
      if (window.scpParticleSystem) {
        window.scpParticleSystem.particles.forEach(particle => {
          particle.speedX *= 20;
          particle.speedY *= 20;
          particle.size *= 2;
        });
      }

      // Spawn SCP entities
      this.spawnSCPEntities();

      // Screen tear effect
      this.createScreenTear();

      // Kaleidoscope effect
      this.intervals.push(setInterval(() => {
        const angle = Math.random() * 360;
        document.body.style.transform = `rotate(${Math.sin(Date.now() / 500) * 5}deg) scale(${1 + Math.sin(Date.now() / 300) * 0.05})`;
      }, 100));

      // Reality breach messages
      this.intervals.push(setInterval(() => {
        this.spawnBreachMessage();
      }, 500));

      // Continuous ambient chaos sound
      this.createAmbientChaos();

      // RGB split extreme
      this.intervals.push(setInterval(() => {
        const offset = Math.random() * 10;
        document.body.style.textShadow = `
          ${offset}px 0 red,
          ${-offset}px 0 cyan,
          0 ${offset}px lime,
          0 ${-offset}px magenta
        `;
      }, 100));

      // NOWE EFEKTY - EXTREME MODE
      
      // Pixel explosion - REMOVED (too distracting)

      // TV static bursts
      this.intervals.push(setInterval(() => {
        this.createTVStatic();
      }, 300));

      // Rotating vortex - REMOVED

      // Laser beams
      this.intervals.push(setInterval(() => {
        this.createLaserBeam();
      }, 400));

      // Consciousness warnings
      this.intervals.push(setInterval(() => {
        this.spawnConsciousnessWarning();
      }, 600));

      // Image duplication/echo
      this.createImageEcho();

      // Spiral distortion
      this.intervals.push(setInterval(() => {
        const spiral = (Date.now() / 50) % 360;
        document.body.style.transform += ` rotate(${Math.sin(spiral * Math.PI / 180) * 2}deg)`;
      }, 50));

      // Opacity flash chaos
      this.intervals.push(setInterval(() => {
        document.body.style.opacity = 0.5 + Math.random() * 0.5;
      }, 80));

      // Random element displacement
      this.intervals.push(setInterval(() => {
        document.querySelectorAll('.menu-btn, .checkbox-btn, button').forEach(el => {
          if (Math.random() > 0.7) {
            el.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) rotate(${Math.random() * 10 - 5}deg)`;
          }
        });
      }, 150));

      // Borders going crazy
      this.intervals.push(setInterval(() => {
        document.querySelectorAll('.wrap, .menu-list, .sidebar').forEach(el => {
          el.style.borderColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
          el.style.borderWidth = `${1 + Math.random() * 5}px`;
        });
      }, 200));
    }

    createPixelExplosion() {
      // REMOVED - konfetti wypierdolone
    }

    createTVStatic() {
      const staticCanvas = document.createElement('canvas');
      staticCanvas.width = window.innerWidth;
      staticCanvas.height = window.innerHeight;
      staticCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 400;
        pointer-events: none;
        mix-blend-mode: overlay;
        opacity: 0.7;
      `;
      
      const ctx = staticCanvas.getContext('2d');
      const imageData = ctx.createImageData(staticCanvas.width, staticCanvas.height);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = Math.random() * 255;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = Math.random() * 255;
      }
      
      ctx.putImageData(imageData, 0, 0);
      document.body.appendChild(staticCanvas);
      this.elements.push(staticCanvas);
      
      setTimeout(() => staticCanvas.remove(), 150);
    }

    createVortex() {
      // Removed - was blocking center of screen
    }

    createLaserBeam() {
      const laser = document.createElement('div');
      const isHorizontal = Math.random() > 0.5;
      
      laser.style.cssText = isHorizontal ? `
        position: fixed;
        top: ${Math.random() * 100}%;
        left: 0;
        width: 100%;
        height: ${2 + Math.random() * 3}px;
        background: linear-gradient(90deg, transparent, #ff0000, transparent);
        z-index: 9991;
        pointer-events: none;
        box-shadow: 0 0 20px #ff0000;
        animation: laserMove 0.5s ease-out forwards;
      ` : `
        position: fixed;
        top: 0;
        left: ${Math.random() * 100}%;
        width: ${2 + Math.random() * 3}px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #00ff00, transparent);
        z-index: 9991;
        pointer-events: none;
        box-shadow: 0 0 20px #00ff00;
        animation: laserMove 0.5s ease-out forwards;
      `;
      
      document.body.appendChild(laser);
      this.elements.push(laser);
      setTimeout(() => laser.remove(), 500);
    }

    spawnConsciousnessWarning() {
      const warnings = [
        'YOUR CONSCIOUSNESS IS BEING MONITORED',
        'REALITY ANCHOR FAILURE',
        'DO NOT LOOK AWAY',
        'MEMETIC HAZARD IN EFFECT',
        'YOU ARE NOW PART OF THE EXPERIMENT',
        'ANTIMEMES DETECTED',
        'COGNITION CORRUPTION: 87%',
        'HUME LEVELS CRITICAL'
      ];
      
      const warn = document.createElement('div');
      warn.textContent = warnings[Math.floor(Math.random() * warnings.length)];
      warn.style.cssText = `
        position: fixed;
        top: ${Math.random() * 80 + 10}%;
        left: 50%;
        transform: translateX(-50%) scale(0);
        font-size: ${15 + Math.random() * 20}px;
        color: #ffffff;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px 20px;
        border: 2px solid #ff0000;
        font-weight: bold;
        z-index: 800;
        pointer-events: none;
        text-shadow: 0 0 10px #ff0000;
        animation: consciousnessWarn 2s ease-out forwards;
        font-family: 'Courier New', monospace;
        letter-spacing: 3px;
      `;
      document.body.appendChild(warn);
      this.elements.push(warn);
      
      setTimeout(() => warn.remove(), 2000);
    }

    createImageEcho() {
      const wrap = document.querySelector('.wrap');
      if (!wrap) return;

      this.intervals.push(setInterval(() => {
        const clone = wrap.cloneNode(true);
        clone.style.cssText = `
          position: fixed;
          top: ${Math.random() * 20 - 10}px;
          left: ${Math.random() * 20 - 10}px;
          opacity: ${0.1 + Math.random() * 0.3};
          z-index: 1;
          pointer-events: none;
          filter: hue-rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(clone);
        this.elements.push(clone);
        
        setTimeout(() => clone.remove(), 300);
      }, 250));
    }

    createScanlineOverlay() {
      const scanlines = document.createElement('div');
      scanlines.className = 'scanlines-overlay';
      scanlines.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
        background: repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.15),
          rgba(0, 0, 0, 0.15) 1px,
          transparent 1px,
          transparent 2px
        );
        animation: scanlineMove 8s linear infinite;
      `;
      document.body.appendChild(scanlines);
      this.elements.push(scanlines);
    }

    spawnGlitchBlock() {
      const block = document.createElement('div');
      const size = 50 + Math.random() * 100;
      block.style.cssText = `
        position: fixed;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        background: rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5);
        border: 2px solid rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255});
        z-index: 500;
        pointer-events: none;
        animation: glitchBlockAnim 0.5s ease-out forwards;
        mix-blend-mode: ${['multiply', 'screen', 'overlay', 'difference'][Math.floor(Math.random() * 4)]};
      `;
      document.body.appendChild(block);
      this.elements.push(block);
      
      setTimeout(() => block.remove(), 500);
    }

    spawnSCPEntities() {
      const entities = ['SCP-079', 'SCP-███', '[REDACTED]', '⚠', '💀', '◼', '◆', '●'];
      this.intervals.push(setInterval(() => {
        const entity = document.createElement('div');
        entity.textContent = entities[Math.floor(Math.random() * entities.length)];
        entity.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          font-size: ${30 + Math.random() * 50}px;
          color: ${['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 5)]};
          font-weight: bold;
          z-index: 600;
          pointer-events: none;
          text-shadow: 0 0 20px currentColor;
          animation: entityFloat 2s ease-out forwards;
        `;
        document.body.appendChild(entity);
        this.elements.push(entity);
        
        setTimeout(() => entity.remove(), 2000);
      }, 200));
    }

    createScreenTear() {
      const tear = document.createElement('div');
      tear.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 300;
        pointer-events: none;
      `;

      const slices = 20;
      for (let i = 0; i < slices; i++) {
        const slice = document.createElement('div');
        slice.style.cssText = `
          position: absolute;
          top: ${i * (100 / slices)}%;
          left: 0;
          width: 100%;
          height: ${100 / slices}%;
          background: linear-gradient(90deg, transparent, rgba(255,0,0,0.1), transparent);
          animation: tearSlice 0.3s infinite;
          animation-delay: ${i * 0.05}s;
        `;
        tear.appendChild(slice);
      }

      document.body.appendChild(tear);
      this.elements.push(tear);
    }

    spawnBreachMessage() {
      const messages = [
        'SITE-64 BREACH',
        'REALITY FAILURE',
        'MEMETIC HAZARD',
        'COGNITOHAZARD DETECTED',
        '[DATA EXPUNGED]',
        'SITE LOCKDOWN',
        'CHAOS INSURGENCY',
        'EVACUATE SITE-64'
      ];

      const msg = document.createElement('div');
      msg.textContent = messages[Math.floor(Math.random() * messages.length)];
      msg.style.cssText = `
        position: fixed;
        top: ${Math.random() * 80 + 10}%;
        left: ${Math.random() * 80 + 10}%;
        font-size: ${20 + Math.random() * 30}px;
        color: #ff0000;
        font-weight: bold;
        z-index: 9993;
        pointer-events: none;
        text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
        animation: breachMsgAnim 1s ease-out forwards;
        font-family: 'Courier New', monospace;
        letter-spacing: 2px;
        transform: rotate(${Math.random() * 20 - 10}deg);
      `;
      document.body.appendChild(msg);
      this.elements.push(msg);
      
      setTimeout(() => msg.remove(), 1000);
    }

    playBreachSequence() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Głęboki, groźny alarm containment breach
        [400, 300, 400, 300, 500, 250, 500].forEach((freq, i) => {
          setTimeout(() => {
            this.playTone(freq, 0.3, 0.35, 'square');
            this.playTone(freq * 0.5, 0.3, 0.25, 'sawtooth');
          }, i * 200);
        });
      } catch (e) {
      }
    }

    playGlitchSound() {
      // Ciężkie, niskie glitche zamiast wysokich
      const freq = 60 + Math.random() * 200;
      this.playTone(freq, 0.1, 0.28, 'square');
      setTimeout(() => {
        this.playTone(freq * 0.7, 0.08, 0.22, 'sawtooth');
      }, 25);
    }

    playMatrixSound() {
      // Ciężki, industrialny digital cascade - jak mainframe się włącza
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          // Niskie, groźne tony zamiast wysokich cymbałków
          this.playTone(180 - i * 15, 0.2, 0.25, 'square');
          this.playTone(90 - i * 8, 0.25, 0.2, 'sawtooth');
        }, i * 100);
      }
      // Finalny ciężki drop
      setTimeout(() => {
        this.playTone(50, 0.5, 0.3, 'square');
      }, 900);
    }

    playDistortionSound() {
      // Reality distortion - głęboki drone z modulacją
      this.playTone(55, 1.5, 0.3, 'sawtooth');
      setTimeout(() => this.playTone(70, 1.2, 0.28, 'square'), 200);
      setTimeout(() => this.playTone(85, 1.0, 0.25, 'sawtooth'), 400);
      setTimeout(() => this.playTone(40, 1.0, 0.32, 'square'), 600);
    }

    playChaosSound() {
      // Apokaliptyczny alarm - niższe, bardziej agresywne
      [800, 400, 800, 400, 900, 350, 900, 350].forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.28, 0.35, 'square');
          this.playTone(freq * 0.5, 0.28, 0.3, 'sawtooth');
        }, i * 140);
      });
    }

    createAmbientChaos() {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Create multiple GŁOŚNIEJSZE oscillators for ambient chaos
        for (let i = 0; i < 4; i++) {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          oscillator.frequency.value = 50 * (i + 1);
          oscillator.type = ['sawtooth', 'square', 'triangle', 'sine'][i];
          gainNode.gain.value = 0.12; // było 0.05, teraz 0.12

          oscillator.start();
          
          this.oscillators.push(oscillator);
          this.gainNodes.push(gainNode);
        }

        // Niepokojąca modulacja - niskie częstotliwości
        const interval = setInterval(() => {
          this.oscillators.forEach((osc, i) => {
            // Trzymaj nisko - 25Hz do 150Hz max
            osc.frequency.value = (25 + Math.random() * 125) * (i + 1);
          });
        }, 150);
        this.intervals.push(interval);
        
        // Ciężkie industrialne uderzenia
        const beatInterval = setInterval(() => {
          this.playTone(80, 0.06, 0.28, 'square');
          setTimeout(() => this.playTone(65, 0.05, 0.24, 'square'), 100);
        }, 700);
        this.intervals.push(beatInterval);
      } catch (e) {
      }
    }

    playTone(freq, duration, vol, type = 'sine') {
      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') this.audioContext.resume();
      
      try {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
        
        setTimeout(() => {
          try { osc.stop(); osc.disconnect(); } catch(e) {}
        }, duration * 1000 + 50);
        
        this.activeSounds.push({osc, gain});
      } catch (e) {
      }
    }

    stopAudio() {
      try {
        // Stop all active sounds
        this.activeSounds.forEach(({osc, gain}) => {
          try {
            osc.stop();
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        });
        this.activeSounds = [];
        
        // Stop oscillators
        this.oscillators.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        });
        this.gainNodes.forEach(gain => {
          try {
            gain.disconnect();
          } catch (e) {}
        });
        // DON'T close AudioContext - it might be shared with AudioManager!
        // Just stop and disconnect everything
        this.oscillators = [];
        this.gainNodes = [];
        this.audioContext = null;
      } catch (e) {
      }
    }

    end() {
      isActive = false;

      // STOP AUDIO FIRST!
      this.stopAudio();

      // Clear all intervals
      this.intervals.forEach(interval => clearInterval(interval));
      this.intervals = [];

      // Clear all timeouts
      this.timeouts.forEach(timeout => clearTimeout(timeout));
      this.timeouts = [];

      // Remove all created elements
      this.elements.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      this.elements = [];

      // Reset particles
      if (window.scpParticleSystem) {
        window.scpParticleSystem.particles.forEach(particle => {
          particle.speedX /= 20;
          particle.speedY /= 20;
          particle.size /= 2;
        });
      }

      // Reset styles
      document.body.classList.remove('konami-glitch');
      document.body.style.animation = '';
      document.body.style.filter = '';
      document.body.style.transform = '';
      document.body.style.textShadow = '';
      document.body.style.opacity = '1';

      const wrap = document.querySelector('.wrap');
      if (wrap) {
        wrap.style.transform = '';
      }

      // Reset all buttons and elements
      document.querySelectorAll('.menu-btn, .checkbox-btn, button').forEach(el => {
        el.style.transform = '';
      });

      document.querySelectorAll('.wrap, .menu-list, .sidebar').forEach(el => {
        el.style.borderColor = '';
        el.style.borderWidth = '';
      });

      // Remove any lingering overlays by class
      document.querySelectorAll('.scanlines-overlay').forEach(el => el.remove());
      
      // Force reset pointer events on body and all main elements
      document.body.style.pointerEvents = '';
      document.querySelectorAll('button, input, textarea, select').forEach(el => {
        el.style.pointerEvents = '';
      });

      // Restore original output
      this.outputEl.value = this.originalOutput;
      if (window.updateCharCounter) {
        window.updateCharCounter();
      }
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes chromatic {
      0% { filter: none; }
      50% { filter: hue-rotate(180deg) saturate(2); }
      100% { filter: none; }
    }

    @keyframes scanlineMove {
      0% { transform: translateY(0); }
      100% { transform: translateY(20px); }
    }

    @keyframes glitchBlockAnim {
      0% { opacity: 1; transform: scale(1) rotate(0deg); }
      100% { opacity: 0; transform: scale(2) rotate(360deg); }
    }

    @keyframes entityFloat {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-100px) scale(2); }
    }

    @keyframes tearSlice {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(${Math.random() * 20 - 10}px); }
    }

    @keyframes breachMsgAnim {
      0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.2) rotate(${Math.random() * 10 - 5}deg); }
      100% { opacity: 0; transform: scale(0.8) rotate(${Math.random() * 20 - 10}deg); }
    }

    .konami-glitch {
      animation: bodyGlitch 0.1s infinite !important;
    }

    @keyframes bodyGlitch {
      0% { transform: translate(0, 0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0, 0); }
    }

    @keyframes pixelExplode {
      0% { 
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% { 
        transform: translate(var(--endX), var(--endY)) scale(0) rotate(720deg);
        opacity: 0;
      }
    }

    @keyframes vortexSpin {
      0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
      50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.5); }
      100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
    }

    @keyframes laserMove {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }

    @keyframes consciousnessWarn {
      0% { 
        transform: translateX(-50%) scale(0) rotate(-10deg);
        opacity: 0;
      }
      20% {
        transform: translateX(-50%) scale(1.2) rotate(5deg);
        opacity: 1;
      }
      80% {
        transform: translateX(-50%) scale(1) rotate(-2deg);
        opacity: 1;
      }
      100% { 
        transform: translateX(-50%) scale(0.5) rotate(10deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Konami code listener - capture on window to prevent textarea issues
  window.addEventListener('keydown', (e) => {
    if (isActive) return;

    if (e.code === KONAMI_CODE[konamiPosition]) {
      konamiPosition++;

      if (konamiPosition === KONAMI_CODE.length) {
        konamiPosition = 0;
        effectsController = new EasterEggEffects();
        effectsController.start();
      }
    } else {
      konamiPosition = 0;
      
      // Check if this key could be start of sequence
      if (e.code === KONAMI_CODE[0]) {
        konamiPosition = 1;
      }
    }
  }, true); // Use capture phase

})();
