/**
 * SECRET DEVELOPER PANEL
 * Access panel for testing easter eggs
 * 
 * ACTIVATION METHOD:
 * Console: window.__devPanel.show()
 */

(function() {
  'use strict';

  class DevPanel {
    constructor() {
      this.panel = null;
      this.isVisible = false;
    }

    create() {
      if (this.panel) return;

      // Create panel overlay
      const overlay = document.createElement('div');
      overlay.id = 'secret-dev-panel';
      overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #0f3460;
        border-radius: 15px;
        padding: 30px;
        z-index: 9999999;
        box-shadow: 0 0 100px rgba(15, 52, 96, 0.8), inset 0 0 50px rgba(0, 150, 255, 0.1);
        font-family: 'Courier New', monospace;
        min-width: 500px;
        opacity: 0;
        animation: devPanelAppear 0.5s ease-out forwards;
        backdrop-filter: blur(10px);
      `;

      overlay.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 24px; color: #00d9ff; font-weight: bold; margin-bottom: 10px; text-shadow: 0 0 10px #00d9ff;">
            🔧 DEVELOPER PANEL 🔧
          </div>
          <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">
            Easter Egg Testing Suite
          </div>
          <div style="font-size: 10px; color: #555; font-style: italic;">
            Access Level: O5-ADMIN
          </div>
        </div>

        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <div style="color: #aaa; font-size: 13px; margin-bottom: 15px; text-align: center;">
            ⚡ Force-Activate Easter Eggs ⚡
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button class="dev-btn" data-egg="konami">
              <span style="font-size: 18px;">🎮</span><br>
              <span>KONAMI CODE</span><br>
              <span style="font-size: 9px; opacity: 0.7;">Total Chaos</span>
            </button>
            
            <button class="dev-btn" data-egg="flickering">
              <span style="font-size: 18px;">👁️</span><br>
              <span>FLICKERING</span><br>
              <span style="font-size: 9px; opacity: 0.7;">13 Clicks</span>
            </button>
            
            <button class="dev-btn" data-egg="clipboard">
              <span style="font-size: 18px;">📋</span><br>
              <span>CLIPBOARD</span><br>
              <span style="font-size: 9px; opacity: 0.7;">5 Copies</span>
            </button>
            
            <button class="dev-btn" data-egg="silence">
              <span style="font-size: 18px;">🔇</span><br>
              <span>SILENCE</span><br>
              <span style="font-size: 9px; opacity: 0.7;">Shift+Ctrl+P</span>
            </button>
            
            <button class="dev-btn" data-egg="clock">
              <span style="font-size: 18px;">🕐</span><br>
              <span>CLOCK</span><br>
              <span style="font-size: 9px; opacity: 0.7;">00:00 / 03:33</span>
            </button>
            
            <button class="dev-btn" data-egg="pattern">
              <span style="font-size: 18px;">🔓</span><br>
              <span>PATTERN</span><br>
              <span style="font-size: 9px; opacity: 0.7;">H→L→M→H→L</span>
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="dev-close-btn" style="
            padding: 10px 20px;
            background: rgba(231, 76, 60, 0.8);
            border: 2px solid #c0392b;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            transition: all 0.3s;
          " onmouseover="this.style.background='rgba(231, 76, 60, 1)'" 
             onmouseout="this.style.background='rgba(231, 76, 60, 0.8)'">
            CLOSE PANEL
          </button>
        </div>

        <div style="margin-top: 15px; text-align: center; font-size: 9px; color: #555; border-top: 1px solid #333; padding-top: 10px;">
          Panel will auto-hide in 60 seconds
        </div>
      `;

      document.body.appendChild(overlay);
      this.panel = overlay;

      // Add styles for buttons
      this.addStyles();

      // Add event listeners
      this.attachListeners();

      // Auto-hide after 60 seconds
      setTimeout(() => this.hide(), 60000);
    }

    addStyles() {
      if (document.getElementById('dev-panel-styles')) return;

      const style = document.createElement('style');
      style.id = 'dev-panel-styles';
      style.textContent = `
        @keyframes devPanelAppear {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes devPanelDisappear {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }

        .dev-btn {
          padding: 15px;
          background: linear-gradient(135deg, rgba(52, 152, 219, 0.3) 0%, rgba(41, 128, 185, 0.3) 100%);
          border: 2px solid #3498db;
          color: #ecf0f1;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: bold;
          transition: all 0.3s;
          text-align: center;
          line-height: 1.4;
        }

        .dev-btn:hover {
          background: linear-gradient(135deg, rgba(52, 152, 219, 0.6) 0%, rgba(41, 128, 185, 0.6) 100%);
          border-color: #5dade2;
          box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
          transform: translateY(-2px);
        }

        .dev-btn:active {
          transform: translateY(0);
          box-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
        }
      `;
      document.head.appendChild(style);
    }

    attachListeners() {
      // Close button
      const closeBtn = document.getElementById('dev-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }

      // Easter egg buttons
      const eggButtons = this.panel.querySelectorAll('.dev-btn');
      eggButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const egg = btn.dataset.egg;
          this.triggerEasterEgg(egg);
        });
      });

      // Click outside to close
      this.panel.addEventListener('click', (e) => {
        if (e.target === this.panel) {
          this.hide();
        }
      });

      // ESC to close
      this.escHandler = (e) => {
        if (e.key === 'Escape') {
          this.hide();
        }
      };
      document.addEventListener('keydown', this.escHandler);
    }

    triggerEasterEgg(egg) {

      switch(egg) {
        case 'konami':
          this.triggerKonami();
          break;
        case 'flickering':
          this.triggerFlickering();
          break;
        case 'clipboard':
          this.triggerClipboard();
          break;
        case 'silence':
          this.triggerSilence();
          break;
        case 'clock':
          this.triggerClock();
          break;
        case 'pattern':
          this.triggerPattern();
          break;
      }

      // Hide panel after triggering
      setTimeout(() => this.hide(), 500);
    }

    triggerKonami() {
      // Dispatch Konami code completion event
      const event = new CustomEvent('devPanelKonamiTrigger');
      window.dispatchEvent(event);
    }

    triggerFlickering() {
      const event = new CustomEvent('devPanelFlickeringTrigger');
      window.dispatchEvent(event);
    }

    triggerClipboard() {
      const event = new CustomEvent('devPanelClipboardTrigger');
      window.dispatchEvent(event);
    }

    triggerSilence() {
      const event = new CustomEvent('devPanelSilenceTrigger');
      window.dispatchEvent(event);
    }

    triggerClock() {
      const event = new CustomEvent('devPanelClockTrigger');
      window.dispatchEvent(event);
    }

    triggerPattern() {
      const event = new CustomEvent('devPanelPatternTrigger');
      window.dispatchEvent(event);
    }

    show() {
      // Open in new window
      const width = 550;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      const newWindow = window.open('', 'DevPanel', 
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);
      
      if (!newWindow) {
        alert('Please allow popups for this site to use the dev panel');
        return;
      }

      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>🔧 Dev Panel</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: #ecf0f1;
              padding: 20px;
              overflow-y: auto;
            }
            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 2px solid #0f3460;
            }
            .title {
              font-size: 24px;
              color: #00d9ff;
              font-weight: bold;
              margin-bottom: 10px;
              text-shadow: 0 0 10px #00d9ff;
            }
            .subtitle {
              font-size: 12px;
              color: #7f8c8d;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .btn {
              padding: 20px;
              background: linear-gradient(135deg, rgba(52, 152, 219, 0.3) 0%, rgba(41, 128, 185, 0.3) 100%);
              border: 2px solid #3498db;
              border-radius: 8px;
              cursor: pointer;
              font-family: 'Courier New', monospace;
              font-size: 11px;
              font-weight: bold;
              color: #ecf0f1;
              text-align: center;
              transition: all 0.3s;
            }
            .btn:hover {
              background: linear-gradient(135deg, rgba(52, 152, 219, 0.6) 0%, rgba(41, 128, 185, 0.6) 100%);
              border-color: #5dade2;
              box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
              transform: translateY(-2px);
            }
            .btn:active {
              transform: translateY(0);
            }
            .btn.success {
              background: linear-gradient(135deg, rgba(46, 204, 113, 0.6) 0%, rgba(39, 174, 96, 0.6) 100%);
              border-color: #2ecc71;
            }
            .icon { font-size: 24px; margin-bottom: 8px; }
            .label { font-size: 12px; font-weight: bold; margin-bottom: 4px; }
            .desc { font-size: 9px; opacity: 0.7; }
            .info {
              background: rgba(0, 0, 0, 0.3);
              padding: 15px;
              border-radius: 8px;
              font-size: 10px;
              color: #aaa;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🔧 SITE-64 DEV PANEL 🔧</div>
            <div class="subtitle">Easter Egg Testing Suite - O5-ADMIN Access</div>
            <div style="font-size: 10px; color: #555; margin-top: 5px;">Northern Canada | SECURE. CONTAIN. PROTECT.</div>
          </div>
          
          <div class="grid">
            <button class="btn" onclick="triggerEgg('konami')">
              <div class="icon">🎮</div>
              <div class="label">KONAMI CODE</div>
              <div class="desc">Total Chaos (15s)</div>
            </button>
            
            <button class="btn" onclick="triggerEgg('flickering')">
              <div class="icon">👁️</div>
              <div class="label">FLICKERING</div>
              <div class="desc">13 Clicks (10s)</div>
            </button>
            
            <button class="btn" onclick="triggerEgg('clipboard')">
              <div class="icon">📋</div>
              <div class="label">CLIPBOARD</div>
              <div class="desc">5 Copies (5s)</div>
            </button>
            
            <button class="btn" onclick="triggerEgg('silence')">
              <div class="icon">🔇</div>
              <div class="label">SILENCE</div>
              <div class="desc">Shift/Ctrl+SCP (8s)</div>
            </button>
            
            <button class="btn" onclick="triggerEgg('clock')">
              <div class="icon">🕐</div>
              <div class="label">CLOCK</div>
              <div class="desc">00:00 / 03:33 (10s)</div>
            </button>
            
            <button class="btn" onclick="triggerEgg('pattern')">
              <div class="icon">🔓</div>
              <div class="label">PATTERN</div>
              <div class="desc">H→L→M→H→L (15s)</div>
            </button>
          </div>
          
          <hr style="border: 1px solid #0f3460; margin: 20px 0;">
          
          <div style="text-align: center; margin-bottom: 15px; color: #00d9ff; font-size: 13px; font-weight: bold;">
            🛠️ UTILITY CONTROLS
          </div>
          
          <div class="grid">
            <button class="btn" onclick="clearPage()">
              <div class="icon">🧹</div>
              <div class="label">CLEAR ALL</div>
              <div class="desc">Reset page</div>
            </button>
            
            <button class="btn" onclick="fillSample()">
              <div class="icon">📝</div>
              <div class="label">SAMPLE TEXT</div>
              <div class="desc">Fill with example</div>
            </button>
            
            <button class="btn" onclick="toggleParticles()">
              <div class="icon">✨</div>
              <div class="label">PARTICLES</div>
              <div class="desc">Toggle effects</div>
            </button>
            
            <button class="btn" onclick="testAudio()">
              <div class="icon">🔊</div>
              <div class="label">TEST AUDIO</div>
              <div class="desc">Sound check</div>
            </button>
            
            <button class="btn" onclick="toggleAnimations()">
              <div class="icon">🎭</div>
              <div class="label">ANIMATIONS</div>
              <div class="desc">Toggle all CSS</div>
            </button>
            
            <button class="btn" onclick="generateRandom()">
              <div class="icon">🎲</div>
              <div class="label">RANDOM TEXT</div>
              <div class="desc">Generate broadcast</div>
            </button>
          </div>
          
          <div class="info">
            SITE-64 Dev Panel | Controls main window | Close when done
          </div>
          
          <script>
            function triggerEgg(egg) {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'triggerEasterEgg', egg: egg }, '*');
              }
            }
            
            function clearPage() {
              if (window.opener && !window.opener.closed) {
                try {
                  const clearBtn = window.opener.document.getElementById('clearBtn');
                  if (clearBtn) {
                    clearBtn.click();
                    showSuccess(event.target);
                  } else {
                    alert('Clear button not found');
                  }
                } catch(e) {
                  alert('Clear failed: ' + e.message);
                }
              }
            }
            
            function showSuccess(button) {
              const btn = button.closest('.btn');
              if (btn) {
                btn.classList.add('success');
                setTimeout(() => {
                  btn.classList.remove('success');
                }, 500);
              }
            }
            
            function fillSample() {
              if (window.opener && !window.opener.closed) {
                try {
                  const output = window.opener.document.getElementById('output');
                  if (output) {
                    output.value = '⚠ SITE-64 CONTAINMENT BREACH ⚠\\n\\n' +
                      'Location: Northern Canada\\n' +
                      'Threat Level: HIGH\\n' +
                      'Status: CHAOS INSURGENCY DETECTED\\n\\n' +
                      'All personnel report to designated stations.\\n' +
                      'Class-D personnel to testing chambers.\\n' +
                      'Combat units mobilize immediately.\\n\\n' +
                      'SECURE. CONTAIN. PROTECT.';
                    
                    // Trigger input event to update character counter
                    output.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    if (window.opener.updateCharCounter) {
                      window.opener.updateCharCounter();
                    }
                    
                    showSuccess(event.target);
                  } else {
                    alert('Output element not found');
                  }
                } catch(e) {
                  alert('Fill sample failed: ' + e.message);
                }
              }
            }
            
            function toggleParticles() {
              if (window.opener && !window.opener.closed) {
                try {
                  // Toggle particle system visibility
                  if (window.opener.scpParticleSystem) {
                    const canvas = window.opener.scpParticleSystem.canvas;
                    if (canvas) {
                      if (canvas.style.opacity === '0' || canvas.style.display === 'none') {
                        canvas.style.opacity = '1';
                        canvas.style.display = 'block';
                        window.opener.scpParticleSystem.isRunning = true;
                      } else {
                        canvas.style.opacity = '0';
                        canvas.style.display = 'none';
                        window.opener.scpParticleSystem.isRunning = false;
                      }
                      showSuccess(event.target);
                    }
                  } else {
                    alert('Particle system not found');
                  }
                } catch(e) {
                  alert('Toggle particles failed: ' + e.message);
                }
              }
            }
            
            function testAudio() {
              if (window.opener && !window.opener.closed) {
                try {
                  // Create test audio directly
                  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                  
                  // Play success arpeggio
                  const volume = 0.25;
                  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    setTimeout(() => {
                      const osc = audioCtx.createOscillator();
                      const gain = audioCtx.createGain();
                      
                      osc.type = 'sine';
                      osc.frequency.value = freq;
                      gain.gain.value = volume;
                      
                      osc.connect(gain);
                      gain.connect(audioCtx.destination);
                      
                      osc.start();
                      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
                      setTimeout(() => osc.stop(), 120);
                    }, i * 70);
                  });
                } catch(e) {
                  alert('Audio test failed: ' + e.message);
                }
              }
            }
            
            function toggleAnimations() {
              if (window.opener && !window.opener.closed) {
                try {
                  const doc = window.opener.document;
                  const body = doc.body;
                  
                  // Toggle animation disable class
                  if (body.classList.contains('no-animations')) {
                    body.classList.remove('no-animations');
                    // Re-enable animations
                    const style = doc.getElementById('dev-disable-animations');
                    if (style) style.remove();
                  } else {
                    body.classList.add('no-animations');
                    // Disable all animations
                    const style = doc.createElement('style');
                    style.id = 'dev-disable-animations';
                    style.textContent = '* { animation: none !important; transition: none !important; }';
                    doc.head.appendChild(style);
                  }
                  
                  showSuccess(event.target);
                } catch(e) {
                  alert('Toggle animations failed: ' + e.message);
                }
              }
            }
            
            function generateRandom() {
              if (window.opener && !window.opener.closed) {
                try {
                  const output = window.opener.document.getElementById('output');
                  if (output) {
                    const templates = [
                      {
                        title: '⚠ SITE-64 ANOMALY DETECTED ⚠',
                        content: 'Location: Northern Canada Sector-7\\nSCP Entity: [CLASSIFIED]\\nThreat Level: EXTREME\\n\\nAll MTF units mobilize immediately.\\nClass-D personnel evacuate to shelter-B.\\nAntimemetic protocols active.\\n\\nSECURE. CONTAIN. PROTECT.'
                      },
                      {
                        title: '🔴 CHAOS INSURGENCY ALERT',
                        content: 'SITE-64 perimeter breach detected.\\nHostile forces: 12+ operatives\\nSector: Northern Wing\\n\\nAll combat personnel report to armory.\\nLockdown Protocol: ACTIVE\\nEstimated time to breach: 15 minutes\\n\\nDefend the Foundation.'
                      },
                      {
                        title: '⚡ EMERGENCY EVACUATION',
                        content: 'Multiple containment failures - SITE-64\\nLocation: Northern Canada\\nEvacuation Order: ALL PERSONNEL\\n\\nShelters: Alpha, Bravo, Charlie\\nEstimated safe zone radius: 10km\\nClass-A amnestetics will be administered.\\n\\nThis is not a drill.'
                      },
                      {
                        title: '🧪 TESTING PROTOCOL ACTIVE',
                        content: 'Class-D personnel report to Test Chamber 7.\\nSCP Subject: [REDACTED]\\nSupervising Researcher: Dr. ██████\\n\\nSafety protocols: MAXIMUM\\nObservation required.\\nMedical team on standby.\\n\\nProceed with caution.'
                      },
                      {
                        title: '🌨️ SITE-64 WEATHER ALERT',
                        content: 'Extreme weather conditions detected.\\nLocation: Northern Canada\\nTemperature: -40°C\\nVisibility: Near zero\\n\\nAll exterior operations suspended.\\nPersonnel remain inside facility.\\nEmergency supplies deployed.\\n\\nStay safe.'
                      }
                    ];
                    
                    const random = templates[Math.floor(Math.random() * templates.length)];
                    output.value = random.title + '\\n\\n' + random.content;
                    
                    // Trigger input event
                    output.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    if (window.opener.updateCharCounter) {
                      window.opener.updateCharCounter();
                    }
                    
                    showSuccess(event.target);
                  }
                } catch(e) {
                  alert('Generate random failed: ' + e.message);
                }
              }
            }
          </script>
        </body>
        </html>
      `);
      
      newWindow.document.close();
      this.isVisible = true;
    }

    hide() {
      if (!this.panel) return;
      
      this.panel.style.animation = 'devPanelDisappear 0.5s ease-out forwards';
      setTimeout(() => {
        if (this.panel) {
          this.panel.style.display = 'none';
        }
        this.isVisible = false;
      }, 500);

      // Remove ESC listener
      if (this.escHandler) {
        document.removeEventListener('keydown', this.escHandler);
      }
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  // Create panel instance
  const devPanel = new DevPanel();

  // Expose panel for console access (only method)
  window.__devPanel = devPanel;

})();
