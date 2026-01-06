// Core bootstrapper
// - Honors system reduced motion by default
// - Initializes Performance Mode toggle
// - Ensures particles obey preferences

import { AudioManager } from '../utils/audio-manager.js';
import { initAudioToggle } from './audio-toggle.js';
import { Logger } from './logger.js';
import performanceMode from './performance-mode.js';
import { initPerformanceToggle } from './performance-toggle.js';

const log = Logger.create('CORE');

function maybeAutoEnablePerformanceMode() {
  const key = 'broadcast-generator-performance-mode';
  const saved = localStorage.getItem(key);
  if (saved === null) {
    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      performanceMode.enable();
    }
  }
}

function init() {
  log.log('Core bootstrap init called');
  log.log('performanceMode object:', performanceMode);
  log.log('performanceMode.isEnabled():', performanceMode.isEnabled());

  // Initialize global AudioManager if not already present (from broadcast pages)
  if (!window.audioManager) {
    window.audioManager = new AudioManager();
    log.log('Global AudioManager created');
  }

  maybeAutoEnablePerformanceMode();
  initPerformanceToggle();
  initAudioToggle();

  // Ensure particles reflect current mode
  const syncParticles = () => {
    if (performanceMode.isEnabled()) {
      if (window.stopParticles) window.stopParticles();
    } else {
      if (window.startParticles) window.startParticles();
    }
  };
  syncParticles();
  performanceMode.addObserver(() => syncParticles());
}

log.log('Core index.js loaded, readyState:', document.readyState);

// Use Promise.then() to ensure init runs as soon as possible
// This avoids the race condition with DOMContentLoaded
Promise.resolve().then(() => {
  log.log('Promise resolved, calling init');

  if (document.readyState === 'loading') {
    log.log('Still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    log.log('DOM is ready or complete, calling init now');
    init();
  }
});
