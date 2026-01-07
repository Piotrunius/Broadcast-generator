/**
 * Audio Mute Toggle UI Component
 * Adds a toggle button to pages for audio mute/unmute
 */

import { AudioManager } from '../utils/audio-manager.js';
import { Logger } from './logger.js';

const log = Logger.create('AUDIO');

// Get or create global AudioManager instance
function getAudioManager() {
  // Wait for globally available instance from broadcast pages (main-advanced.js, main-simple.js)
  if (window.audioManager) {
    return window.audioManager;
  }

  // Otherwise create our own instance
  if (!window._audioManagerInstance) {
    window._audioManagerInstance = new AudioManager();
  }
  return window._audioManagerInstance;
}

export function createAudioToggle() {
  log.log('Creating audio toggle...');
  const toggle = document.createElement('div');
  toggle.className = 'audio-toggle';
  log.log('Toggle div created');

  const audioManager = getAudioManager();
  const isMuted = audioManager.isMuted;
  log.log('Audio is muted:', isMuted);

  const speakerOnSvg = () => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15 9a3 3 0 0 1 0 6"/><path d="M19 7a7 7 0 0 1 0 10"/></svg>`;
  const speakerMuteSvg = () => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="16" y1="8" x2="22" y2="16"/><line x1="22" y1="8" x2="16" y2="16"/></svg>`;

  toggle.innerHTML = `
    <button class="audio-toggle-btn" title="Toggle Audio Mute (Mute/Unmute sounds)">
      <span class="audio-icon">${isMuted ? speakerMuteSvg() : speakerOnSvg()}</span>
      <span class="audio-label">Audio</span>
      <span class="audio-status">${isMuted ? 'OFF' : 'ON'}</span>
    </button>
  `;

  const button = toggle.querySelector('.audio-toggle-btn');
  const iconSpan = toggle.querySelector('.audio-icon');
  const statusSpan = toggle.querySelector('.audio-status');

  log.log('Button found:', !!button);
  log.log('Status span found:', !!statusSpan);

  // Update UI based on mute state
  const updateUI = (isMuted) => {
    iconSpan.innerHTML = isMuted ? speakerMuteSvg() : speakerOnSvg();
    statusSpan.textContent = isMuted ? 'OFF' : 'ON';
    button.classList.toggle('active', isMuted);
  };

  // Toggle on click
  button.addEventListener('click', (e) => {
    log.log('Audio toggle clicked');
    e.preventDefault();
    e.stopPropagation();
    const audioMgr = getAudioManager();
    const wasMuted = audioMgr.isMuted;
    audioMgr.toggleMute();
    const nowMuted = audioMgr.isMuted;
    log.log(`Audio mute: ${wasMuted} -> ${nowMuted}`);
    updateUI(nowMuted);
  });

  // Initial state
  updateUI(audioManager.isMuted);

  // Add styles
  injectToggleStyles();

  return toggle;
}

function injectToggleStyles() {
  if (document.getElementById('audio-toggle-styles')) return;

  const style = document.createElement('style');
  style.id = 'audio-toggle-styles';
  style.textContent = `
    .audio-toggle {
      position: fixed;
      bottom: 20px;
      left: 210px;
      z-index: 10000;
      pointer-events: auto;
    }

    .audio-toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 0, 0, 0.12);
      border-radius: 8px;
      padding: 10px 16px;
      min-height: 40px;
      color: #a8a8a8;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
    }

    .audio-toggle-btn:hover {
      border-color: rgba(255, 0, 0, 0.2);
      background: rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
    }

    .audio-toggle-btn.active {
      border-color: rgba(255, 0, 0, 0.3);
      background: rgba(255, 0, 0, 0.05);
      color: #ff4444;
    }

    .audio-toggle-btn.active:hover {
      border-color: rgba(255, 0, 0, 0.5);
      box-shadow: 0 8px 25px rgba(255, 0, 0, 0.2);
    }

    .audio-icon {
      display: inline-flex;
      width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
    }
    .audio-icon svg { display: block; width: 16px; height: 16px; }

    .audio-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .audio-status {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }

    .audio-toggle-btn.active .audio-status {
      background: rgba(255, 0, 0, 0.2);
      color: #ff4444;
    }

    /* Performance mode: disable toggle button transitions */
    body.performance-mode .audio-toggle-btn {
      transition: none !important;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .audio-toggle {
        bottom: 10px;
        right: 10px;
      }

      .audio-toggle-btn {
        padding: 8px 12px;
        font-size: 10px;
      }

      .audio-label {
        display: none;
      }

      .audio-icon { width: 14px; height: 14px; }
      .audio-icon svg { width: 14px; height: 14px; }
    }
  `;
  document.head.appendChild(style);
}

// Auto-add toggle to page on load
export function initAudioToggle() {
  log.log('Initializing Audio Toggle...');

  const addToggle = () => {
    if (!document.body) {
      log.warn('document.body not available, retrying...');
      setTimeout(addToggle, 100);
      return;
    }
    log.log('Creating and adding toggle to body');
    const toggle = createAudioToggle();
    document.body.appendChild(toggle);
    log.log('Audio toggle added to body');
  };

  if (document.readyState === 'loading') {
    log.log('DOM loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', addToggle);
  } else {
    log.log('DOM already loaded, adding toggle');
    addToggle();
  }
}
