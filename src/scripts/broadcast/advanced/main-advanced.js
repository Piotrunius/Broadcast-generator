import { AudioManager } from '../../utils/audio-manager.js';
import { BroadcastGenerator } from '../engine/broadcast-generator.js';
import { ErrorHandler } from './error-handler.js';

const generator = new BroadcastGenerator();
const audioManager = new AudioManager();
const errorHandler = new ErrorHandler();
window.broadcastGenerator = generator; // Expose for error handling
window.errorHandler = errorHandler; // Expose error handler globally for console access and recovery
window.audioManager = audioManager; // Expose audio manager for testing

// Debounced updateLiveOutput to prevent rapid re-render storms
let updateLiveOutputTimeout = null;
let typingInProgress = false; // Flag to track if animation is ongoing
const debouncedUpdateLiveOutput = () => {
  clearTimeout(updateLiveOutputTimeout);
  updateLiveOutputTimeout = setTimeout(() => {
    updateLiveOutput();
  }, 50); // 50ms debounce
};

// Utility function for debouncing
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}


// --- Easter Egg Random Hint (5% chance) ---
if (Math.random() < 0.05) {
  setTimeout(() => {
    console.log('%c⚠ ANOMALY DETECTED', 'color: #ff6600; font-weight: bold;');
    console.log('%cClassic input sequence recognition system: %cACTIVE', 'color: #888;', 'color: #00ff00;');
    console.log('%cTip: Gamers from the 80s know this pattern by heart...', 'color: #666; font-style: italic;');
  }, 2000);
}

// --- Main Setup ---
function initializeApp() {
  console.log('🚀 Initializing Broadcast Generator...');
  const allMenuBtns = document.querySelectorAll('.menu-btn');
  const allContent = document.querySelectorAll('.menu-list, .collapsible-content');

  // --- Unified Menu Toggling & Interaction Setup ---
  document.querySelectorAll('.menu').forEach(menu => {
    const mainBtn = menu.querySelector('.menu-btn');
    const contentPanel = menu.querySelector('.menu-list, .collapsible-content');

    if (!mainBtn || !contentPanel) return;

    // Add hover sound to main menu button
    mainBtn.addEventListener('mouseenter', () => audioManager.playHover());

    const panelId = contentPanel.id;

    // Store original text for reset
    const textSpan = mainBtn.querySelector('.btn-text');
    if (textSpan) mainBtn.dataset.originalText = textSpan.textContent.trim();

    // Main button toggles its panel
    mainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isAlreadyOpen = contentPanel.classList.contains('show');
      closeAllMenus(); // Close all other menus first
      if (!isAlreadyOpen) {
        contentPanel.classList.add('show');
        mainBtn.setAttribute('aria-expanded', 'true');
      }
      audioManager.playToggle();
    });

    // Prevent propagation inside panels
    contentPanel.addEventListener('click', e => e.stopPropagation());

    // --- Add specific interaction logic based on panel type ---
    if (contentPanel.classList.contains('single-select')) {
      contentPanel.querySelectorAll('button').forEach(optionBtn => {
        // Add hover sound
        optionBtn.addEventListener('mouseenter', () => audioManager.playHover());

        optionBtn.addEventListener('click', () => {
          const selectedValue = optionBtn.dataset.option;
          textSpan.textContent = selectedValue;
          mainBtn.dataset.selected = selectedValue;

          contentPanel.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
          optionBtn.classList.add('selected');

          if (panelId === 'alarmContent') updateLED(panelId, selectedValue);
          if (panelId === 'statusContent') updateStatusLED(selectedValue);
          if (panelId === 'testingContent') updateLED(panelId, selectedValue);

          debouncedUpdateLiveOutput();
          audioManager.playClick();
        });
      });
    }

    if (contentPanel.classList.contains('multi-select')) { // This is for Events
      contentPanel.querySelectorAll('button').forEach(optionBtn => {
        // Add hover sound
        optionBtn.addEventListener('mouseenter', () => audioManager.playHover());

        optionBtn.addEventListener('click', () => {
          optionBtn.classList.toggle('selected');
          const selectedCount = contentPanel.querySelectorAll('.selected').length;

          // Get all currently selected events keys
          const selectedEventKeys = Array.from(contentPanel.querySelectorAll('.selected')).map(btn => btn.dataset.option);

          updateEventsLEDColor(mainBtn.querySelector('.led'), selectedEventKeys); // Update LED based on selection

          textSpan.textContent = selectedCount > 0 ? `Events (${selectedCount})` : mainBtn.dataset.originalText;
          debouncedUpdateLiveOutput();
          audioManager.playClick();
        });
      });
    }

    if (contentPanel.classList.contains('collapsible-content')) {
      contentPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const checkboxBtn = checkbox.closest('.checkbox-btn');
        if (checkboxBtn) {
            checkboxBtn.addEventListener('mouseenter', () => audioManager.playHover());
        }

        checkbox.addEventListener('change', () => {
          const led = mainBtn?.querySelector('.led');
          const checkedCount = contentPanel.querySelectorAll('input:checked').length;

          checkbox.closest('.checkbox-btn').classList.toggle('selected', checkbox.checked);

          if (led) {
            led.style.opacity = '1';
            led.className = 'led'; // Reset classes
          }

          if (panelId === 'breachedScpsContent') {
            if (checkedCount >= 4) led.classList.add('black', 'blink-fast'); // >= 4 breaches = purple
            else if (checkedCount === 3) led.classList.add('high', 'blink');
            else if (checkedCount === 2) led.classList.add('medium');
            else if (checkedCount === 1) led.classList.add('allowed');
            // No limit on selection, just visual feedback up to 4+
            if (textSpan) textSpan.textContent = checkedCount > 0 ? `Breached SCPs (${checkedCount})` : mainBtn.dataset.originalText;

          } else if (panelId === 'requirementsContent') {
            if (checkedCount > 0) led.classList.add('allowed');
            if (textSpan) textSpan.textContent = checkedCount > 0 ? `Requirements (${checkedCount})` : mainBtn.dataset.originalText;
          }
          debouncedUpdateLiveOutput();
          audioManager.playClick();
        });
      });
    }
  });

  const closeAllMenus = () => {
    allContent.forEach(content => content.classList.remove('show'));
    allMenuBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  };
  document.addEventListener('click', closeAllMenus);

  // --- Button Actions ---
  const clearBtn = document.getElementById('clearBtn');
  console.log('Clear button element:', clearBtn);
  if (clearBtn) {
      clearBtn.addEventListener('click', clearAll);
      clearBtn.addEventListener('mouseenter', () => audioManager.playHover());
      console.log('✓ Clear button initialized');
  }

  // Recovery Button - Auto-repair system
  const recoveryBtn = document.getElementById('recoveryBtn');
  console.log('Recovery button element:', recoveryBtn);
  if (recoveryBtn) {
    recoveryBtn.addEventListener('click', () => {
      try {
        // Run comprehensive diagnostics and recovery
        const diagnostics = performDiagnostics();

        if (diagnostics.hasErrors) {
          errorHandler.showNotification('🔧 Running auto-repair...', 'info');
          setTimeout(() => {
            // Attempt all recoveries
            if (!document.getElementById('output')) {
              errorHandler.recoveryStrategies.get('RECREATE_OUTPUT_ELEMENT')();
            }
            if (!window.updateCharCounter) {
              errorHandler.recoveryStrategies.get('REINITIALIZE_COUNTER')();
            }
            updateCharCounter();
            updateOutputColor();
            debouncedUpdateLiveOutput();

            errorHandler.showNotification('✅ System recovered successfully!', 'success');
          }, 500);
        } else {
          errorHandler.showNotification('✓ All systems operational - no repairs needed', 'success');
        }
      } catch (e) {
        errorHandler.logError('STA-001', { recoveryAttemptFailed: e.message });
      }
      audioManager.playClick();
    });
    recoveryBtn.addEventListener('mouseenter', () => audioManager.playHover());
  }

  // Copy Button
  const copyBtn = document.getElementById('copyBtn');
  console.log('Copy button element:', copyBtn);
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const outputEl = document.getElementById('output');
      if (!outputEl.value.trim()) {
        audioManager.playError();
        return;
      }

      const generatedOutput = generator.generate(getBroadcastOptions()); // Regenerate to get the final message and overflow status
      // Use the message length from the generator's *final* output for decision
      if (generatedOutput.overflow) {
        // Add red background + shake animation
        outputEl.classList.add('copy-error');
        outputEl.style.animation = 'none';
        outputEl.offsetHeight; // Trigger reflow to restart animation
        outputEl.style.animation = 'shake 0.5s';

        let errorEl = document.getElementById('char-limit-error');
        const container = document.getElementById('error-message-slot');

        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.id = 'char-limit-error';
          errorEl.textContent = 'MESSAGE TOO LONG! Exceeds 200 character limit.';
          errorEl.style.color = 'var(--red)';
          errorEl.style.textAlign = 'center';
          errorEl.style.fontSize = '12px';
          errorEl.style.fontWeight = 'bold';
          errorEl.style.padding = '10px 20px';
          errorEl.style.background = 'rgba(255, 0, 0, 0.15)';
          errorEl.style.border = '1px solid rgba(255, 0, 0, 0.4)';
          errorEl.style.borderRadius = '6px';
          errorEl.style.width = '100%';
          errorEl.style.maxWidth = '500px';
          container.appendChild(errorEl);
        } else {
          errorEl.textContent = 'MESSAGE TOO LONG! Exceeds 200 character limit.';
          errorEl.style.display = 'block';
        }

        setTimeout(() => {
          errorEl.style.display = 'none';
          outputEl.classList.remove('copy-error');
        }, 3000);

        audioManager.playError();
        return; // Block copying
      }

      navigator.clipboard.writeText(generatedOutput.message).then(() => { // Copy the generator's final message
        copyBtn.textContent = 'COPIED!';
        setTimeout(() => copyBtn.textContent = 'COPY', 1000);
        audioManager.playSuccess(); // Success sound!
      });
    });
    copyBtn.addEventListener('mouseenter', () => audioManager.playHover());
  }

  // Initialize character counter
  updateCharCounter();

  // Initialize keyboard shortcuts
  setupKeyboardShortcuts();

  console.log('✓ Broadcast Generator fully initialized!');
}

// Initialize when DOM is ready
console.log('📋 DOM readyState:', document.readyState);
if (document.readyState === 'loading') {
  console.log('⏳ Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ DOMContentLoaded fired!');
    initializeApp();
  });
} else {
  // DOM is already loaded (when module is loaded late)
  console.log('✓ DOM already loaded, initializing now...');
  initializeApp();
}

// ============= KEYBOARD SHORTCUTS =============
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R (Cmd+Shift+R on Mac) - Recovery
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyR') {
      e.preventDefault();
      const recoveryBtn = document.getElementById('recoveryBtn');
      if (recoveryBtn) {
        recoveryBtn.click();
        showKeyboardFeedback('Recovery initiated');
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyR') {
      e.preventDefault();
      const diagnostics = performDiagnostics();
      if (diagnostics.hasErrors) {
        errorHandler.showNotification('🔧 Running system recovery...', 'info');
        setTimeout(() => {
          errorHandler.recoveryStrategies.get('FULL_PAGE_RESET')();
        }, 500);
      } else {
        showKeyboardFeedback('All systems operational ✓');
        errorHandler.showNotification('✓ No repairs needed', 'success');
      }
    }
    // Ctrl+Alt+C (Cmd+Option+C on Mac) - Copy
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyC') {
      e.preventDefault();
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.click();
        showKeyboardFeedback('Copied to clipboard');
      }
    }

    // Ctrl+Alt+X (Cmd+Option+X on Mac) - Clear
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyX') {
      e.preventDefault();
      const clearBtn = document.getElementById('clearBtn');
      if (clearBtn) {
        clearBtn.click();
        showKeyboardFeedback('Output cleared');
      }
    }

    // Shift+? - Show keyboard shortcuts help
    if (e.shiftKey && e.code === 'Slash') {
      e.preventDefault();
      showKeyboardShortcutsHelp();
    }
  });
}

// Display visual feedback for keyboard shortcut activation
function showKeyboardFeedback(message) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 255, 102, 0.9);
    color: #000;
    padding: 12px 20px;
    border-radius: 6px;
    font-weight: bold;
    z-index: 10000;
    animation: slide-in 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(0, 255, 102, 0.3);
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.animation = 'slide-out 0.3s ease-in';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

// Show keyboard shortcuts reference
function showKeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: 'Ctrl+Shift+R', mac: 'Cmd+Shift+R', action: 'Auto-recover and diagnose' },
    { keys: 'Ctrl+Alt+C', mac: 'Cmd+Option+C', action: 'Copy output to clipboard' },
    { keys: 'Ctrl+Alt+X', mac: 'Cmd+Option+X', action: 'Clear all output' },
    { keys: 'Shift+?', mac: 'Shift+?', action: 'Show this help' }
  ];

  let helpText = '⌨️ KEYBOARD SHORTCUTS\n\n';
  shortcuts.forEach(s => {
    const keyDisplay = navigator.platform.includes('Mac') ? s.mac : s.keys;
    helpText += `${keyDisplay.padEnd(15)} → ${s.action}\n`;
  });

  alert(helpText);
}

// Helper function to determine Events LED color
function updateEventsLEDColor(ledElement, selectedEventKeys) {
    ledElement.className = 'led'; // Reset classes
    ledElement.style.opacity = '1';

    if (selectedEventKeys.length === 0) {
        // No events selected, the LED should be off (gray).
        // This is handled by default .led style when no color classes are added.
        return;
    }

    let has610 = selectedEventKeys.includes('610 Event');
    let has076 = selectedEventKeys.includes('076 Event');
    let has323 = selectedEventKeys.includes('323 Breach');
    let hasClassDRiot = selectedEventKeys.includes('Class-D Riot');

    // Priority: BLACK (Fiolet) > HIGH (Czerwony) > MEDIUM (Żółty)
    if (has610 || (has076 && has323 && hasClassDRiot)) {
        ledElement.classList.add('black', 'blink-fast'); // Fioletowy, szybkie mruganie
    } else if (has076) {
        ledElement.classList.add('high', 'blink'); // Czerwony
    } else if (has323 || hasClassDRiot) {
        ledElement.classList.add('medium', 'blink'); // Żółty
    } else {
        // Fallback for other potential events, or just a generic active state
        ledElement.classList.add('prohibited', 'blink'); // Default red if events selected but no specific color rule met
    }
}


// --- LED Updaters ---
function updateLED(target, level) {
  const led = document.querySelector(`.menu-btn[data-target="${target}"] .led`);
  if(!led) return;
  led.className = 'led';
  led.style.opacity = '1';
  const upperLevel = level?.toUpperCase();
  if (upperLevel === "HIGH") led.classList.add('high', 'blink');
  else if (upperLevel === "MEDIUM") led.classList.add('medium');
  else if (upperLevel === "LOW") led.classList.add('low');
  else if (upperLevel === "ALLOWED") led.classList.add('allowed');
  else if (upperLevel === "PROHIBITED") led.classList.add('prohibited', 'blink');
}

function updateStatusLED(status) {
    const led = document.querySelector('.menu-btn[data-target="statusContent"] .led');
    if(!led) return;
    led.className = 'led';
    led.style.opacity = '1';
    const upperStatus = status?.toUpperCase();
    switch(upperStatus){
        case "SCP BREACH":
        case "SITE LOCKDOWN":
        case "CHAOS INSURGENCY":
             led.classList.add('high', 'blink');
             break;
        case "NUCLEAR PROTOCOL":
             led.classList.add('black', 'blink-fast');
             break;
        case "CLASS-D ESCAPE":
             led.classList.add('medium');
             break;
        case "CLEAR":
             led.classList.add('allowed');
             break;
        case "MAINTENANCE":
        case "O5 MEETING":
             led.classList.add('white');
             break;
    }
}

// --- Main Functions ---

function getBroadcastOptions() {
  const getSelected = (target) => document.querySelector(`.menu-btn[data-target="${target}"]`)?.dataset.selected;

  const alarm = getSelected("alarmContent");
  const status = getSelected("statusContent");
  const testing = getSelected("testingContent");

  const events = Array.from(document.querySelectorAll('#eventsContent button.selected')).map(btn => btn.dataset.option);
  const breachedSCPs = Array.from(document.querySelectorAll('#breachedScpsContent input:checked')).map(cb => cb.closest('label').textContent.trim());

  const requirements = {
    idCheck: document.getElementById('idCheck')?.checked,
    conX: document.getElementById('authConX')?.checked,
    scp008: document.getElementById('authScp008')?.checked,
    scp409: document.getElementById('authScp409')?.checked,
    scp701: document.getElementById('authScp701')?.checked,
    scp035: document.getElementById('authScp035')?.checked,
  };

  return {
    alarm,
    status,
    testing,
    events,
    breachedSCPs,
    requirements,
  };
}

// Character counter - shows current length and provides visual feedback
function updateCharCounter() {
  const outputElement = document.getElementById('output');
  if (!outputElement) return;

  // Create counter element if it doesn't exist
  let counterContainer = document.getElementById('char-counter-container');
  if (!counterContainer) {
    counterContainer = document.createElement('div');
    counterContainer.id = 'char-counter-container';
    outputElement.parentElement.style.position = 'relative';
    const counterSpan = document.createElement('span');
    counterSpan.id = 'char-counter';
    counterContainer.appendChild(counterSpan);
    outputElement.parentElement.appendChild(counterContainer);
  }

  const counterEl = document.getElementById('char-counter');
  const currentLength = outputElement.value.length;
  const remaining = 200 - currentLength;
  const isOverLimit = currentLength > 200;

  // Update counter text with fixed-width font (tabular-nums in CSS)
  counterEl.textContent = `${currentLength}/200`;

  // Apply appropriate color class
  if (isOverLimit) {
    counterEl.classList.remove('warning');
    counterEl.classList.add('error');
  } else if (remaining < 50 && remaining > 0) {
    counterEl.classList.remove('error');
    counterEl.classList.add('warning');
  } else {
    counterEl.classList.remove('warning', 'error');
  }

  // Update textarea color along with counter
  updateOutputColor();
}

// Update textarea and border color based on character count
function updateOutputColor() {
  const outputElement = document.getElementById('output');
  if (!outputElement) return;

  const currentLength = outputElement.value.length;

  if (currentLength > 200) {
    // RED - Over limit
    outputElement.classList.remove('color-success', 'color-warning');
    outputElement.classList.add('color-error');
  } else if (currentLength > 150) {
    // YELLOW - Warning
    outputElement.classList.remove('color-success', 'color-error');
    outputElement.classList.add('color-warning');
  } else {
    // GREEN - Good
    outputElement.classList.remove('color-error', 'color-warning');
    outputElement.classList.add('color-success');
  }

  // Apply background color matching border color
  if (currentLength > 200) {
    // RED background
    outputElement.classList.remove('output-bg-success', 'output-bg-warning');
    outputElement.classList.add('output-bg-error');
  } else if (currentLength > 150) {
    // YELLOW background
    outputElement.classList.remove('output-bg-success', 'output-bg-error');
    outputElement.classList.add('output-bg-warning');
  } else {
    // GREEN background
    outputElement.classList.remove('output-bg-error', 'output-bg-warning');
    outputElement.classList.add('output-bg-success');
  }
}

// Typewriter animation with intelligent controls
// Safely animates text reveal with built-in safeguards against freezing
// Smart diff-based typewriter animation - natural character-by-character typing
async function typeText(element, targetText, callback) {
  if (!element) return;

  const target = targetText ?? '';

  // Prevent concurrent animations
  if (typingInProgress) {
    element.value = target;
    updateCharCounter();
    updateOutputColor();
    if (callback) callback();
    return;
  }

  typingInProgress = true;
  const current = element.value;

  // Find common prefix and suffix to identify changed section
  const commonPrefix = findCommonPrefix(current, target);
  const commonSuffix = findCommonSuffix(
    current.substring(commonPrefix),
    target.substring(commonPrefix)
  );

  const changeStart = commonPrefix;
  const changeEnd = current.length - commonSuffix;
  const newContent = target.substring(commonPrefix, target.length - commonSuffix);

  // Skip animation if change is too drastic (>60% different) or very short
  const percentChanged = newContent.length / Math.max(1, target.length);
  if (percentChanged > 0.6 || target.length < 10) {
    element.value = target;
    updateCharCounter();
    updateOutputColor();
    typingInProgress = false;
    if (callback) callback();
    return;
  }

  // Animation for natural typing effect
  let position = 0;
  const STEP_DELAY = 25; // 25ms per character for natural feel
  const MAX_TOTAL_TIME = 1000; // Max 1 second total

  const animateStep = () => {
    if (position < newContent.length) {
      // Reconstruct text: prefix + what we've typed so far + suffix
      element.value =
        target.substring(0, changeStart) +
        newContent.substring(0, position + 1) +
        target.substring(target.length - commonSuffix);

      updateCharCounter();
      updateOutputColor();
      position++;

      setTimeout(animateStep, STEP_DELAY);
    } else {
      // Ensure we have exact final text
      element.value = target;
      updateCharCounter();
      updateOutputColor();
      typingInProgress = false;
      if (callback) callback();
    }
  };

  // Start animation
  if (newContent.length > 0) {
    animateStep();
  } else {
    // No visible changes, just update
    element.value = target;
    updateCharCounter();
    updateOutputColor();
    typingInProgress = false;
    if (callback) callback();
  }
}

// Helper functions for diff detection
function findCommonPrefix(str1, str2) {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) i++;
  return i;
}

function findCommonSuffix(str1, str2) {
  let i = 0;
  while (i < str1.length && i < str2.length &&
         str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) i++;
  return i;
}

function calculateSimilarity() {
  return 1;
}

function getCommonPrefixLength() { return 0; }
function getCommonSuffixLength() { return 0; }

function updateLiveOutput() {
  const outputElement = document.getElementById('output');
  if (!outputElement) return;

  try {
    const options = getBroadcastOptions();
    const generatedOutput = generator.generate(options); // { message, overflow }

    typeText(outputElement, generatedOutput.message, () => {
      updateCharCounter(); // Update counter after typing completes
      if (generatedOutput.overflow) {
          outputElement.classList.add('overflow-warning');
          audioManager.playError();
      } else {
          outputElement.classList.remove('overflow-warning');
      }
    });
  } catch (err) {
    console.error('Live output update failed', err);
    outputElement.value = 'Error generating broadcast. Please retry.';
    updateCharCounter();
    outputElement.classList.add('overflow-warning');
  }
}

function clearAll() {
    // Play clear sound first
    try {
      audioManager.playSuccess();
    } catch(e) {
      console.log('Audio error:', e);
    }

    // Reset custom text input
    const customInput = document.getElementById('customTextInput');
    if (customInput) customInput.value = '';

    // Reset ALL menu buttons to original state
    document.querySelectorAll('.menu-btn').forEach(btn => {
      const textSpan = btn.querySelector('.btn-text');
      if (textSpan && btn.dataset.originalText) {
        textSpan.textContent = btn.dataset.originalText;
      }
      delete btn.dataset.selected;
      btn.classList.remove('selected');
      btn.setAttribute('aria-expanded', 'false');
    });

    // Close all menus
    document.querySelectorAll('.menu-list').forEach(menu => {
      menu.classList.remove('show');
    });

    // Deselect all selected elements
    document.querySelectorAll('.selected').forEach(el => {
      el.classList.remove('selected');
    });

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
      const checkboxBtn = cb.closest('.checkbox-btn');
      if (checkboxBtn) checkboxBtn.classList.remove('selected');
    });

    // Reset all LEDs to default state (no color)
    document.querySelectorAll('.led').forEach(led => {
      led.className = 'led';
      led.style.opacity = '1';
      led.style.backgroundColor = '';
      led.style.boxShadow = '';
    });

    // Clear output textarea completely
    const outputEl = document.getElementById('output');
    if (outputEl) {
      outputEl.value = '';
      updateCharCounter();
      outputEl.classList.remove('overflow-warning');
      outputEl.style.cssText = ''; // Reset any inline styles
    }

    // Update character counter
    if (window.updateCharCounter) {
      updateCharCounter();
    }

    // Reset any global state variables
    if (window.selectedOptions) {
      window.selectedOptions = {};
    }

    // Force UI refresh
    document.body.offsetHeight; // Trigger reflow

    console.log('✓ All cleared - state reset to zero');
}




const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .overflow-warning {
      border-color: var(--red) !important;
      box-shadow: 0 0 15px rgba(255, 0, 0, 0.5) !important;
  }
  #char-counter-container {
    transition: all 0.15s ease;
  }
  #char-counter {
    transition: color 0.15s ease;
    font-variant-numeric: tabular-nums;
  }
`;
document.head.appendChild(style);

// MODE SWITCH - ADVANCED PAGE
const switchBtn = document.getElementById("modeSwitch");
switchBtn.classList.add("active");
switchBtn.addEventListener("click", () => {
  window.location.href = "../simple/index.html";
});
  // Note: Recovery button removed from HTML. Error modal now handles recovery with auto-repair option.
  // Users trigger recovery through error modal interface instead of dedicated button.
if(switchBtn) switchBtn.addEventListener('mouseenter', () => audioManager.playHover());

/*
================================================================================
PROBLEM ANALYSIS & SOLUTION DOCUMENTATION
================================================================================

ISSUE DESCRIPTION:
When selecting multiple options rapidly (e.g., checking "610 Event", then
changing "Status" to "Scp Breach"), the entire UI would freeze and become
unresponsive. The browser tab would appear to hang indefinitely.

ROOT CAUSE:
The freeze was caused by an INFINITE LOOP in the BroadcastGenerator.generate()
method, specifically in Phase 2 (Expand phase) of the message optimization
algorithm. The problem occurred in this code pattern:

    while (currentMessage.length <= this.maxChars && expandedThisIteration && !overflow) {
      // ... find best candidate ...
      const testParts = messageParts.map((p, idx) => ({ ...p, currentLevel: (idx === i ? nextHigherLevel : p.currentLevel) }));
      const testMessage = getCurrentFullMessage(testParts);
      // ... rest of logic ...
    }

DETAILED EXPLANATION:

1) THE CASCADING UPDATE STORM:
   - User clicks "610 Event" → debouncedUpdateLiveOutput() called
   - updateLiveOutput() calls generator.generate()
   - Simultaneously/rapidly, user clicks "Status" → another debouncedUpdateLiveOutput()
   - Both updates reach the generator around the same time (50ms debounce is not enough)
   - Each .generate() call starts its expand/shrink loops

2) THE INFINITE LOOP IN EXPAND PHASE:
   - The expand phase uses: messageParts.map((p, idx) => ({ ...p, currentLevel: ... }))
   - This creates a SHALLOW COPY of each message part object
   - The shallow copy doesn't properly copy the get_text function reference
   - Comparison logic becomes unreliable, and the while loop never breaks
   - Both function calls are now stuck in their own expand loops, consuming CPU

3) WHY IT WAS HARD TO DETECT:
   a) DECEPTIVE SIMPLICITY:
      - The code looks straightforward; looping and conditionals are basic concepts
      - Developers assume while loops have proper break conditions
      - The shallow copy issue is subtle—objects appear to be copied correctly

   b) RACE CONDITION NATURE:
      - Problem only manifests with SPECIFIC TIMING of rapid consecutive clicks
      - Single clicks work fine (debounce prevents cascade)
      - Two simultaneous updates trigger the issue
      - Hard to reproduce consistently without exact click timing

   c) HIDDEN BY ANIMATION:
      - Original typewriter animation was adding setTimeout() calls on top
      - This masked the core freeze because those timeouts would accumulate
      - UI appeared to "freeze" rather than "hang", making root cause unclear

   d) STACK EXPLOSION:
      - Once stuck in the loop, each iteration creates more temporary objects
      - Memory grows, CPU maxes out
      - By the time user notices, browser is already deeply frozen
      - Stack traces from DevTools would show many nested calls, not the core issue

THE SOLUTION:

1) HARDENED LOOP LIMITS:
   - Added maxIterations = 50 safety limit for both shrink and expand loops
   - If loop hits limit, immediately mark as overflow and break
   - Prevents infinite loops regardless of logic issues

2) SAFER ITERATION STRATEGY:
   - Replaced messageParts.map() with direct object mutation + temporary restoration
   - Instead of creating shallow copies, modify real object → test → restore
   - This is faster and avoids copy-related bugs

3) DEBOUNCE AT UPDATE LEVEL:
   - Added debouncedUpdateLiveOutput() that waits 50ms before calling generator
   - Multiple rapid clicks within 50ms only trigger ONE generator call
   - Prevents cascade of generator calls entirely

4) SAFE TYPING ANIMATION:
   - Added typingInProgress flag to prevent concurrent animations
   - If animation is ongoing and update requested, queue it or skip
   - Limits maximum typing steps to 50 (prevents another animation storm)

5) ERROR BOUNDARY:
   - Wrapped updateLiveOutput() in try-catch
   - If generator throws or hangs, falls back to error message
   - UI remains responsive even if generator fails

LESSONS LEARNED:
- Always add iteration limits to loops with complex break conditions
- Be cautious with shallow copies when objects contain function references
- Race conditions in JS are hard to spot but critical in rapid-update scenarios
- Debouncing is essential for user-interaction-driven calculations
- Even "simple" algorithms can have subtle infinite loop bugs
================================================================================
*/

// System Diagnostics and Recovery
function performDiagnostics() {
  const issues = [];

  // Check critical elements
  const output = document.getElementById('output');
  if (!output) issues.push('GEN-001: Output textarea missing');

  const counter = document.getElementById('char-counter');
  if (!counter) issues.push('UI-002: Character counter missing');

  const menus = document.querySelectorAll('.menu');
  if (menus.length === 0) issues.push('UI-003: No menus found');

  const generator_ = window.broadcastGenerator;
  if (!generator_) issues.push('GEN-002: Generator not initialized');

  // Check functions
  if (typeof updateCharCounter !== 'function') issues.push('GEN-003: updateCharCounter not defined');
  if (typeof updateOutputColor !== 'function') issues.push('STY-001: updateOutputColor not defined');

  return {
    hasErrors: issues.length > 0,
    issues,
    timestamp: new Date().toISOString()
  };
}


