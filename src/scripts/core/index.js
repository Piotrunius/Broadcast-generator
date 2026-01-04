// Core bootstrapper
// - Honors system reduced motion by default
// - Initializes Performance Mode toggle
// - Ensures particles obey preferences

import performanceMode from './performance-mode.js';
import { initPerformanceToggle } from './performance-toggle.js';

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
  console.log('🚀 Core bootstrap init called');
  console.log('📊 performanceMode object:', performanceMode);
  console.log('📊 performanceMode.isEnabled():', performanceMode.isEnabled());

  maybeAutoEnablePerformanceMode();
  initPerformanceToggle();

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

console.log('📦 Core index.js loaded, readyState:', document.readyState);

// Use Promise.then() to ensure init runs as soon as possible
// This avoids the race condition with DOMContentLoaded
Promise.resolve().then(() => {
  console.log('📦 Promise resolved, calling init');

  if (document.readyState === 'loading') {
    console.log('⏳ Still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('✓ DOM is ready or complete, calling init now');
    init();
  }
});
