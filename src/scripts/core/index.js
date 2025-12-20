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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
