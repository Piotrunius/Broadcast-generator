/**
 * Performance Mode Controller
 * Site-wide persistent toggle for disabling animations and effects
 */

import { Logger } from './logger.js';

const log = Logger.create('PERFORMANCE');

class PerformanceMode {
  constructor() {
    this.storageKey = 'broadcast-generator-performance-mode';
    this.enabled = this.loadState();
    this.observers = [];
  }

  /**
   * Load state from localStorage
   */
  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'true';
  }

  /**
   * Save state to localStorage
   */
  saveState(enabled) {
    localStorage.setItem(this.storageKey, enabled.toString());
  }

  /**
   * Check if performance mode is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Enable performance mode
   */
  enable() {
    log.log('Enabling performance mode');
    this.enabled = true;
    this.saveState(true);
    log.log('Saved to localStorage, calling applyMode()');
    this.applyMode();
    log.log('applyMode() complete, notifying observers');
    this.notifyObservers();
    log.log('Observers notified');
  }

  /**
   * Disable performance mode
   */
  disable() {
    log.log('Disabling performance mode');
    this.enabled = false;
    this.saveState(false);
    log.log('Saved to localStorage, calling applyMode()');
    this.applyMode();
    log.log('applyMode() complete, notifying observers');
    this.notifyObservers();
    log.log('Observers notified');
  }

  /**
   * Toggle performance mode
   */
  toggle() {
    log.log('Toggling performance mode from:', this.enabled);
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    log.log('Toggled to:', this.enabled);
    return this.enabled;
  }

  /**
   * Apply performance mode settings to the page
   */
  applyMode() {
    const body = document.body;
    log.log('Applying mode, enabled:', this.enabled);

    if (this.enabled) {
      log.log('Enabling performance mode - stopping particles');
      // Add performance mode class
      body.classList.add('performance-mode');

      // Disable animations globally
      body.style.setProperty('--animation-duration', '0s');
      body.style.setProperty('--transition-duration', '0s');

      // Stop particles if present
      if (window.stopParticles) {
        log.log('Calling window.stopParticles()');
        window.stopParticles();
      } else {
        log.warn('window.stopParticles not found');
      }
    } else {
      log.log('Disabling performance mode - starting particles');
      // Remove performance mode class
      body.classList.remove('performance-mode');

      // Restore animations
      body.style.removeProperty('--animation-duration');
      body.style.removeProperty('--transition-duration');

      // Restart particles if present
      if (window.startParticles) {
        log.log('Calling window.startParticles()');
        window.startParticles();
      } else {
        log.warn('window.startParticles not found');
      }
    }
  }

  /**
   * Add observer for mode changes
   */
  addObserver(callback) {
    this.observers.push(callback);
  }

  /**
   * Notify all observers
   */
  notifyObservers() {
    this.observers.forEach((callback) => {
      try {
        callback(this.enabled);
      } catch (e) {
        log.error('Performance mode observer error:', e);
      }
    });
  }

  /**
   * Initialize performance mode on page load
   */
  init() {
    log.log('PerformanceMode.init() called');
    // Expose to window for easy access FIRST
    window.performanceMode = this;

    // Add global CSS for performance mode
    this.injectGlobalStyles();

    // Apply initial state IMMEDIATELY (including particles)
    // Force synchronous application
    if (this.enabled) {
      log.log('Performance mode enabled at init - stopping particles');
      document.body.classList.add('performance-mode');
      document.body.style.setProperty('--animation-duration', '0s');
      document.body.style.setProperty('--transition-duration', '0s');

      // Stop particles immediately if they exist
      const stopParticlesNow = () => {
        if (window.stopParticles) {
          log.log('Calling window.stopParticles() from init');
          window.stopParticles();
        } else if (window.scpParticleSystem) {
          log.log('Calling window.scpParticleSystem.stop() from init');
          window.scpParticleSystem.stop();
        }
      };

      // Try immediately
      stopParticlesNow();

      // Also try after a short delay in case particles load later
      setTimeout(stopParticlesNow, 100);
      setTimeout(stopParticlesNow, 500);
    }

    this.applyMode();

    log.log(`Performance Mode: ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Inject global CSS rules for performance mode
   */
  injectGlobalStyles() {
    const style = document.createElement('style');
    style.id = 'performance-mode-styles';
    style.textContent = `
            /* Performance Mode Global Overrides */
            body.performance-mode * {
                animation: none !important;
                transition: none !important;
            }

            body.performance-mode .animate-page-enter,
            body.performance-mode .animate-slide-left,
            body.performance-mode .animate-slide-right,
            body.performance-mode .animate-fade-in-up,
            body.performance-mode .stagger-1,
            body.performance-mode .stagger-2,
            body.performance-mode .stagger-3,
            body.performance-mode .stagger-4 {
                animation: none !important;
                opacity: 1 !important;
                transform: none !important;
            }

            /* Ensure home layout stays visible (their base state is opacity: 0) */
            body.performance-mode .home-layout,
            body.performance-mode .menu-wrap,
            body.performance-mode .updates-panel,
            body.performance-mode .credits-panel,
            body.performance-mode .menu-box {
                opacity: 1 !important;
                transform: none !important;
                animation: none !important;
            }

            body.performance-mode .led.blink,
            body.performance-mode .led.blink-fast {
                animation: none !important;
            }

            /* Hide particle canvas in performance mode */
            body.performance-mode #particles-canvas {
                display: none !important;
            }

            /* Instant hover states */
            body.performance-mode button,
            body.performance-mode .menu-btn,
            body.performance-mode .primary {
                transition: none !important;
            }
        `;
    document.head.appendChild(style);
  }
}

// Create and export singleton instance
const performanceModeInstance = new PerformanceMode();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => performanceModeInstance.init());
} else {
  performanceModeInstance.init();
}

export default performanceModeInstance;
