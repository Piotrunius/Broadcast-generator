/**
 * DEV PANEL HOOKS
 * Connects dev panel buttons to easter egg triggers
 */

(function() {
  'use strict';

  // Listen for messages from dev panel window
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'triggerEasterEgg') {
      const egg = event.data.egg;
      const eventName = `devPanel${egg.charAt(0).toUpperCase() + egg.slice(1)}Trigger`;
      const customEvent = new CustomEvent(eventName);
      window.dispatchEvent(customEvent);
    }
  });

  // Wait for all easter eggs to load
  window.addEventListener('load', () => {

    // Hook 1: Konami Code
    window.addEventListener('devPanelKonamiTrigger', () => {

      // Simulate Konami code completion
      const event = new KeyboardEvent('keydown', {
        code: 'KeyA',
        key: 'a'
      });

      // Hack: directly trigger if we can find the effect class
      try {
        // Force trigger by simulating last key of sequence
        // We'll send all keys rapidly
        const keys = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        keys.forEach((code, i) => {
          setTimeout(() => {
            const evt = new KeyboardEvent('keydown', {
              code: code,
              key: code.replace('Arrow', '').replace('Key', '').toLowerCase(),
              bubbles: true
            });
            window.dispatchEvent(evt);
          }, i * 50);
        });
      } catch(e) {
      }
    });

    // Hook 2: The Flickering
    window.addEventListener('devPanelFlickeringTrigger', () => {

      const title = document.querySelector('h1');
      if (title) {
        // Simulate 13 rapid clicks
        for (let i = 0; i < 13; i++) {
          setTimeout(() => {
            title.click();
          }, i * 50);
        }
      }
    });

    // Hook 3: Clipboard Anomaly
    window.addEventListener('devPanelClipboardTrigger', () => {

      const copyBtn = document.getElementById('copyBtn');
      const output = document.getElementById('output');

      if (copyBtn && output) {
        // Set some text first
        if (!output.value) {
          output.value = 'Test broadcast for clipboard anomaly';
        }

        // Click 5 times
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            copyBtn.click();
          }, i * 100);
        }
      }
    });

    // Hook 4: The Silence
    window.addEventListener('devPanelSilenceTrigger', () => {

      // Simulate Shift+Ctrl+P
      const evt = new KeyboardEvent('keydown', {
        key: 'p',
        code: 'KeyP',
        shiftKey: true,
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(evt);
    });

    // Hook 5: Clock Anomaly
    window.addEventListener('devPanelClockTrigger', () => {

      // We need to directly trigger the effect
      // Look for the checkTime function or manually create effect

      // Dispatch a custom event that clock easter egg listens to
      const evt = new CustomEvent('forceClockAnomaly');
      window.dispatchEvent(evt);
    });

    // Hook 6: The Pattern
    window.addEventListener('devPanelPatternTrigger', () => {

      const alarmContent = document.getElementById('alarmContent');
      if (!alarmContent) return;

      // Find buttons and click them in sequence
      const buttons = alarmContent.querySelectorAll('button[data-option]');
      const sequence = ['High', 'Low', 'Medium', 'High', 'Low'];

      sequence.forEach((option, i) => {
        setTimeout(() => {
          const btn = Array.from(buttons).find(b => b.dataset.option === option);
          if (btn) {
            btn.click();
          }
        }, i * 200);
      });
    });

    // ERROR TESTING HOOKS (for dev panel)
    window.addEventListener('devPanelErrorTrigger', (event) => {
      const errorCode = event.detail?.code || 'GEN-001';
      if (window.errorHandler) {
        window.errorHandler.triggerErrorForTesting(errorCode);
      }
    });

  });

  // Global error testing command (accessible from console: triggerTestError('GEN-001'))
  window.triggerTestError = function(code) {
    if (!window.errorHandler) {
      console.error('Error handler not initialized');
      return;
    }
    console.log(`🚨 Triggering test error: ${code}`);
    window.errorHandler.triggerErrorForTesting(code);
  };

  // Show all available error codes in console
  window.listErrorCodes = function() {
    if (!window.errorHandler) {
      console.error('Error handler not initialized');
      return;
    }
    const codes = window.errorHandler.getAllErrorCodes();
    console.group('📋 Available Error Codes:');
    codes.forEach(code => {
      const error = window.errorHandler.errors.get(code);
      console.log(`${code}: ${error.name} [${error.severity}]`);
    });
    console.groupEnd();
    console.log(`\n💡 Trigger with: triggerTestError('CODE')`);
    console.log(`📊 View error history: window.errorHandler.getErrorHistory()`);
  };

  // Shortcut to display error history
  window.getErrorHistory = function() {
    if (!window.errorHandler) {
      console.error('Error handler not initialized');
      return;
    }
    return window.errorHandler.getErrorHistory();
  };

})();
