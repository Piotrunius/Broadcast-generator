import { AudioManager } from '../../utils/audio-manager.js';
import {
  isTyping,
  setAudioManager as setTypewriterAudio,
  stopAnimation,
  typeText as typeTextAnimation,
} from '../animations/typewriter.js';
import { BroadcastGenerator } from '../engine/broadcast-generator.js';
import { trackEvent, trackNavigation } from '../../utils/umami-tracker.js'; // Umami tracking

const generator = new BroadcastGenerator();
// Use global AudioManager if available (created by core/index.js), otherwise create new instance
const audioManager = window.audioManager || new AudioManager();
// Ensure global reference
window.audioManager = audioManager;

// Initialize typewriter animation with audio
setTypewriterAudio(audioManager);

// Debug mode: uncomment below to expose objects for debugging
// window.broadcastGenerator = generator;
// window.audioManager = audioManager;

// Debounced updateLiveOutput - PRODUCTION GRADE
// Guarantees animation always shows correctly
let updateLiveOutputTimeout = null;
let lastUpdateRequestTime = 0;

const debouncedUpdateLiveOutput = () => {
  clearTimeout(updateLiveOutputTimeout);
  lastUpdateRequestTime = Date.now();

  // If currently typing, stop and update immediately
  if (isTyping()) {
    stopAnimation();
    // Give old animation 5ms to clean up (reduced from 15ms)
    updateLiveOutputTimeout = setTimeout(async () => {
      await updateLiveOutput();
    }, 5);
  } else {
    // Otherwise debounce to prevent storms (reduced from 50ms to 20ms)
    updateLiveOutputTimeout = setTimeout(async () => {
      await updateLiveOutput();
    }, 20);
  }
};

// --- Main Setup ---
function initializeApp() {
  const allMenuBtns = document.querySelectorAll('.menu-btn');
  const allContent = document.querySelectorAll('.menu-list, .collapsible-content');

  // --- Unified Menu Toggling & Interaction Setup ---
  document.querySelectorAll('.menu').forEach((menu) => {
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
        
        // Umami tracking: Track menu open in advanced mode
        trackEvent('Menu_Opened_Advanced', { menu: panelId });
      }
      audioManager.playToggle();
    });

    // Prevent propagation inside panels
    contentPanel.addEventListener('click', (e) => e.stopPropagation());

    // --- Add specific interaction logic based on panel type ---
    if (contentPanel.classList.contains('single-select')) {
      contentPanel.querySelectorAll('button').forEach((optionBtn) => {
        // Add hover sound
        optionBtn.addEventListener('mouseenter', () => audioManager.playHover());

        optionBtn.addEventListener('click', () => {
          const selectedValue = optionBtn.dataset.option;
          textSpan.textContent = selectedValue;
          mainBtn.dataset.selected = selectedValue;

          contentPanel
            .querySelectorAll('button')
            .forEach((btn) => btn.classList.remove('selected'));
          optionBtn.classList.add('selected');

          if (panelId === 'alarmContent') updateLED(panelId, selectedValue);
          if (panelId === 'statusContent') updateStatusLED(selectedValue);
          if (panelId === 'testingContent') updateLED(panelId, selectedValue);

          debouncedUpdateLiveOutput();
          audioManager.playClick();
          
          // Umami tracking: Track menu option selection in advanced mode
          trackEvent('Menu_Option_Selected_Advanced', { 
            menu: panelId, 
            option: selectedValue 
          });
        });
      });
    }

    if (contentPanel.classList.contains('collapsible-content')) {
      contentPanel.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
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
            if (checkedCount >= 4)
              led.classList.add('black', 'blink-fast'); // >= 4 breaches = purple
            else if (checkedCount === 3) led.classList.add('high', 'blink');
            else if (checkedCount === 2) led.classList.add('medium');
            else if (checkedCount === 1) led.classList.add('allowed');
            // No limit on selection, just visual feedback up to 4+
            if (textSpan)
              textSpan.textContent =
                checkedCount > 0 ? `Breached SCPs (${checkedCount})` : mainBtn.dataset.originalText;
          } else if (panelId === 'requirementsContent') {
            if (checkedCount > 0) led.classList.add('allowed');
            if (textSpan)
              textSpan.textContent =
                checkedCount > 0 ? `Requirements (${checkedCount})` : mainBtn.dataset.originalText;
          } else if (panelId === 'eventsContent') {
            // Get all currently selected events keys from label text
            const selectedEventKeys = Array.from(contentPanel.querySelectorAll('input:checked')).map(
              (cb) => cb.closest('label').textContent.trim()
            );
            updateEventsLEDColor(led, selectedEventKeys); // Update LED based on selection
            if (textSpan)
              textSpan.textContent =
                checkedCount > 0 ? `Events (${checkedCount})` : mainBtn.dataset.originalText;
          }
          debouncedUpdateLiveOutput();
          audioManager.playClick();
          
          // Umami tracking: Track checkbox toggle in advanced mode
          const checkboxLabel = checkbox.closest('label')?.textContent.trim() || checkbox.id;
          trackEvent('Checkbox_Toggled_Advanced', { 
            menu: panelId,
            checkbox: checkboxLabel,
            checked: checkbox.checked 
          });
        });
      });
    }
  });

  const closeAllMenus = () => {
    allContent.forEach((content) => content.classList.remove('show'));
    allMenuBtns.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
  };
  document.addEventListener('click', closeAllMenus);

  // --- Button Actions ---
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAll);
    clearBtn.addEventListener('mouseenter', () => audioManager.playHover());
  }

  // Copy Button
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const outputEl = document.getElementById('output');

      // Guard: no broadcast to copy
      if (!outputEl || !outputEl.value.trim()) {
        audioManager.playError();
        return;
      }

      // Generate final message (ignores any animation in progress)
      const generatedOutput = generator.generate(getBroadcastOptions());

      // Check if message is empty
      if (!generatedOutput.message || !generatedOutput.message.trim()) {
        audioManager.playError();
        return;
      }

      // Check for overflow
      if (generatedOutput.overflow) {
        // Easter egg: sprawdź czy wszystkie opcje są zaznaczone
        const allSelected = areAllOptionsSelected();

        // Easter egg: zmień tło na niebieskie, normalnie czerwone
        if (allSelected) {
          outputEl.classList.add('copy-easter-egg');
        } else {
          outputEl.classList.add('copy-error');
        }
        outputEl.style.animation = 'none';
        outputEl.offsetHeight; // Trigger reflow to restart animation
        outputEl.style.animation = 'shake 0.5s';

        let errorEl = document.getElementById('char-limit-error');
        const container = document.getElementById('error-message-slot');

        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.id = 'char-limit-error';
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
        }

        // Easter egg message gdy wszystkie opcje są zaznaczone
        if (allSelected) {
          errorEl.textContent = 'You absolute madman... Just press ESC + L + ENTER at this point.';
          errorEl.style.color = '#4da6ff';
          errorEl.style.background = 'rgba(77, 166, 255, 0.15)';
          errorEl.style.border = '1px solid rgba(77, 166, 255, 0.5)';
        } else {
          errorEl.textContent = 'MESSAGE TOO LONG! Exceeds 200 character limit.';
          errorEl.style.color = 'var(--red)';
          errorEl.style.background = 'rgba(255, 0, 0, 0.15)';
          errorEl.style.border = '1px solid rgba(255, 0, 0, 0.4)';
        }
        errorEl.style.display = 'block';

        setTimeout(() => {
          errorEl.style.display = 'none';
          outputEl.classList.remove('copy-error', 'copy-easter-egg');
        }, 3000);

        audioManager.playError();
        return; // Block copying
      }

      // Copy the COMPLETE generated message (animation status doesn't matter)
      navigator.clipboard
        .writeText(generatedOutput.message)
        .then(() => {
          copyBtn.textContent = 'COPIED!';
          setTimeout(() => (copyBtn.textContent = 'COPY'), 1000);
          audioManager.playSuccess();
          
          // Umami tracking: Track copy in advanced mode
          trackEvent('Copy_Button_Clicked_Advanced', { 
            characterCount: generatedOutput.message.length 
          });
        })
        .catch((err) => {
          audioManager.playError();
        });
    });
    copyBtn.addEventListener('mouseenter', () => audioManager.playHover());
  }

  // Initialize character counter
  updateCharCounter();

  // Initialize keyboard shortcuts
  setupKeyboardShortcuts();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded (when module is loaded late)
  initializeApp();
}

// ============= KEYBOARD SHORTCUTS =============
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R (Cmd+Shift+R on Mac) - Recovery

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
    { keys: 'Ctrl+Alt+C', mac: 'Cmd+Option+C', action: 'Copy output to clipboard' },
    { keys: 'Ctrl+Alt+X', mac: 'Cmd+Option+X', action: 'Clear all output' },
    { keys: 'Shift+?', mac: 'Shift+?', action: 'Show this help' },
  ];

  let helpText = '⌨️ KEYBOARD SHORTCUTS\n\n';
  shortcuts.forEach((s) => {
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
  if (!led) return;
  led.className = 'led';
  led.style.opacity = '1';
  const upperLevel = level?.toUpperCase();
  if (upperLevel === 'HIGH') led.classList.add('high', 'blink');
  else if (upperLevel === 'MEDIUM') led.classList.add('medium');
  else if (upperLevel === 'LOW') led.classList.add('low');
  else if (upperLevel === 'ALLOWED') led.classList.add('allowed');
  else if (upperLevel === 'PROHIBITED') led.classList.add('prohibited', 'blink');
}

function updateStatusLED(status) {
  const led = document.querySelector('.menu-btn[data-target="statusContent"] .led');
  if (!led) return;
  led.className = 'led';
  led.style.opacity = '1';
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case 'SCP BREACH':
    case 'SITE LOCKDOWN':
    case 'CHAOS INSURGENCY':
      led.classList.add('high', 'blink');
      break;
    case 'NUCLEAR PROTOCOL':
      led.classList.add('black', 'blink-fast');
      break;
    case 'CLASS-D ESCAPE':
      led.classList.add('medium');
      break;
    case 'CLEAR':
      led.classList.add('allowed');
      break;
    case 'MAINTENANCE':
    case 'O5 MEETING':
      led.classList.add('white');
      break;
  }
}

// --- Main Functions ---

function getBroadcastOptions() {
  const getSelected = (target) =>
    document.querySelector(`.menu-btn[data-target="${target}"]`)?.dataset.selected;

  const alarm = getSelected('alarmContent');
  const status = getSelected('statusContent');
  const testing = getSelected('testingContent');

  // Events now use checkboxes instead of buttons
  const events = Array.from(document.querySelectorAll('#eventsContent input:checked')).map(
    (cb) => cb.closest('label').textContent.trim()
  );
  const breachedSCPs = Array.from(
    document.querySelectorAll('#breachedScpsContent input:checked')
  ).map((cb) => cb.closest('label').textContent.trim());

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

// Easter egg checker - sprawdza czy wszystkie opcje są zaznaczone
function areAllOptionsSelected() {
  // Sprawdź czy wszystkie 11 checkboxów Breached SCPs jest zaznaczonych
  const allBreachedScps = document.querySelectorAll('#breachedScpsContent input[type="checkbox"]');
  const checkedBreachedScps = document.querySelectorAll('#breachedScpsContent input:checked');

  // Sprawdź czy wszystkie 6 checkboxów Requirements jest zaznaczonych
  const allRequirements = document.querySelectorAll('#requirementsContent input[type="checkbox"]');
  const checkedRequirements = document.querySelectorAll('#requirementsContent input:checked');

  // Sprawdź czy wszystkie 4 eventy są wybrane (teraz też checkboxy)
  const allEvents = document.querySelectorAll('#eventsContent input[type="checkbox"]');
  const selectedEvents = document.querySelectorAll('#eventsContent input:checked');

  return (
    allBreachedScps.length > 0 &&
    checkedBreachedScps.length === allBreachedScps.length &&
    allRequirements.length > 0 &&
    checkedRequirements.length === allRequirements.length &&
    allEvents.length > 0 &&
    selectedEvents.length === allEvents.length
  );
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
// NOTE: This animation system has been moved to a separate module!
// See: src/scripts/broadcast/animations/typewriter.js for the updated implementation
// The new system provides:
// - Backspace + type effect (characters are backspaced then retyped)
// - Character-by-character typing with audio feedback
// - Human-like variable delays (35ms typing + random 20ms pauses)
// - Better code organization and reusability
// Functions are imported at the top of this file as:
// - typeTextAnimation (imported as typeText from animations/typewriter.js)
// - setTypewriterAudio (initialize audio manager)

async function updateLiveOutput() {
  const outputElement = document.getElementById('output');
  if (!outputElement) return;

  try {
    const options = getBroadcastOptions();
    const generatedOutput = generator.generate(options);

    // Guarantee: Always wait for animation to complete before returning
    const animationCompleted = await typeTextAnimation(
      outputElement,
      generatedOutput.message,
      updateCharCounter,
      updateOutputColor,
      () => {
        updateCharCounter();
        if (generatedOutput.overflow) {
          outputElement.classList.add('overflow-warning');
          try {
            audioManager.playError();
          } catch (e) {
            // Silent
          }
        } else {
          outputElement.classList.remove('overflow-warning');
        }
      }
    );

    // If animation didn't complete (was interrupted), ensure text is correct
    if (!animationCompleted) {
      outputElement.value = generatedOutput.message;
      updateCharCounter();
      updateOutputColor();
    }
  } catch (err) {
    const outputElement = document.getElementById('output');
    if (outputElement) {
      outputElement.value = 'Error generating broadcast. Please retry.';
      updateCharCounter();
      outputElement.classList.add('overflow-warning');
    }
  }
}

function clearAll() {
  const outputEl = document.getElementById('output');

  // Guard: no broadcast to clear
  if (!outputEl || !outputEl.value.trim()) {
    audioManager.playError();
    return;
  }
  // IMMEDIATELY stop any animation before clearing
  stopAnimation();

  // Play clear sound first
  try {
    audioManager.playSuccess();
  } catch (e) {
    // Silent
  }

  // Reset custom text input
  const customInput = document.getElementById('customTextInput');
  if (customInput) customInput.value = '';

  // Reset ALL menu buttons to original state
  document.querySelectorAll('.menu-btn').forEach((btn) => {
    const textSpan = btn.querySelector('.btn-text');
    if (textSpan && btn.dataset.originalText) {
      textSpan.textContent = btn.dataset.originalText;
    }
    delete btn.dataset.selected;
    btn.classList.remove('selected');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Close all menus
  document.querySelectorAll('.menu-list').forEach((menu) => {
    menu.classList.remove('show');
  });

  // Deselect all selected elements
  document.querySelectorAll('.selected').forEach((el) => {
    el.classList.remove('selected');
  });

  // Uncheck all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
    const checkboxBtn = cb.closest('.checkbox-btn');
    if (checkboxBtn) checkboxBtn.classList.remove('selected');
  });

  // Reset all LEDs to default state (no color)
  document.querySelectorAll('.led').forEach((led) => {
    led.className = 'led';
    led.style.opacity = '1';
    led.style.backgroundColor = '';
    led.style.boxShadow = '';
  });

  // Clear output textarea completely
  if (outputEl) {
    outputEl.value = '';
    updateCharCounter();
    updateOutputColor();
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
  
  // Umami tracking: Track clear action in advanced mode
  trackEvent('Clear_Button_Clicked_Advanced', { page: 'broadcast_advanced' });
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
const switchBtn = document.getElementById('modeSwitch');
if (switchBtn) {
  switchBtn.classList.add('active');
  switchBtn.addEventListener('click', () => {
    // Umami tracking: Track mode switch from advanced to simple
    trackNavigation('broadcast_simple', 'broadcast_advanced');
    trackEvent('Mode_Switch_Clicked', { from: 'advanced', to: 'simple' });
    
    // Delay navigation to ensure tracking completes before page unload
    // This is standard practice for analytics - allows tracking beacon to be sent
    setTimeout(() => {
      window.location.href = '../simple/index.html';
    }, 100);
  });
  switchBtn.addEventListener('mouseenter', () => audioManager.playHover());
}

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
