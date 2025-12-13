import { BroadcastGenerator } from './engine/broadcast-generator.js';
import { AudioManager } from './utils/audio-manager.js';

const generator = new BroadcastGenerator();
const audioManager = new AudioManager();

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
document.addEventListener('DOMContentLoaded', () => {
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

          updateLiveOutput();
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
          updateLiveOutput();
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
            if (checkedCount >= 4) led.classList.add('black', 'blink'); // >= 4 breaches = purple
            else if (checkedCount === 3) led.classList.add('high', 'blink');
            else if (checkedCount === 2) led.classList.add('medium');
            else if (checkedCount === 1) led.classList.add('allowed');
            // No limit on selection, just visual feedback up to 4+
            if (textSpan) textSpan.textContent = checkedCount > 0 ? `Breached SCPs (${checkedCount})` : mainBtn.dataset.originalText;

          } else if (panelId === 'requirementsContent') {
            if (checkedCount > 0) led.classList.add('allowed'); 
            if (textSpan) textSpan.textContent = checkedCount > 0 ? `Requirements (${checkedCount})` : mainBtn.dataset.originalText;
          }
          updateLiveOutput();
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
  if (clearBtn) {
      clearBtn.addEventListener('click', clearAll);
      clearBtn.addEventListener('mouseenter', () => audioManager.playHover());
  }



  // Copy Button
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
      copyBtn.addEventListener('click', ()=>{
        const outputEl = document.getElementById('output');
        if(!outputEl.value.trim()) {
            audioManager.playError();
            return;
        }

        const generatedOutput = generator.generate(getBroadcastOptions()); // Regenerate to get the final message and overflow status
        // Use the message length from the generator's *final* output for decision
        if(generatedOutput.overflow) { 
            outputEl.classList.add('error'); // Add error class for visual shake
            outputEl.style.animation = 'none';
            outputEl.offsetHeight; // Trigger reflow to restart animation
            outputEl.style.animation = 'shake 0.5s'; 
            
            let errorEl = document.getElementById('char-limit-error');
            const container = document.querySelector('.output-container');
            if (container) container.style.position = 'relative';
            
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.id = 'char-limit-error';
                errorEl.textContent = 'Too much info! Cannot fit all details below 200 chars.'; // Specific overflow error
                errorEl.style.color = 'var(--red)';
                errorEl.style.textAlign = 'center';
                errorEl.style.fontSize = '14px';
                errorEl.style.fontWeight = 'bold';
                errorEl.style.marginTop = '5px'; 
                container.appendChild(errorEl);
            } else {
                errorEl.textContent = 'Too much info! Cannot fit all details below 200 chars.'; // Update text if already exists
                errorEl.style.display = 'block';
            }

            setTimeout(() => { errorEl.style.display = 'none'; }, 3000);
            
            audioManager.playError();
            return; // Block copying
        }

        navigator.clipboard.writeText(generatedOutput.message).then(() => { // Copy the generator's final message
            copyBtn.textContent = 'COPIED!';
            setTimeout(()=> copyBtn.textContent = 'COPY',1000);
            audioManager.playSuccess(); // Success sound!
        });
      });
      copyBtn.addEventListener('mouseenter', () => audioManager.playHover());
  }
});

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
             led.classList.add('black', 'blink');
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

// Variable to keep track of ongoing typing animation and pending updates
let typingAnimationInProgress = false;
let pendingUpdate = null;

function typeText(element, targetText, callback) {
  // If an animation is in progress, queue this update for later
  if (typingAnimationInProgress) {
    pendingUpdate = {element, targetText, callback};
    return;
  }

  typingAnimationInProgress = true;
  const originalText = element.value;
  const deletionSpeed = 20; 
  const typingSpeed = 25; 

  const similarity = calculateSimilarity(originalText, targetText);

  if (similarity < 0.4 && originalText.length > 0) {
    let currentText = originalText;

    function deleteAll() {
      if (!typingAnimationInProgress) return;

      if (currentText.length > 0) {
        currentText = currentText.substring(0, currentText.length - 1);
        element.value = currentText; 
        audioManager.playType(); // Play sound on deletion (optional, but adds effect)
        setTimeout(deleteAll, deletionSpeed);
      } else {
        typeNewText(0);
      }
    }

    function typeNewText(index) {
      if (!typingAnimationInProgress) return;

      if (index < targetText.length) {
        currentText += targetText.charAt(index);
        element.value = currentText; 
        audioManager.playType(); // Play sound on typing
        setTimeout(() => typeNewText(index + 1), typingSpeed);
      } else {
        element.value = targetText; 
        typingAnimationInProgress = false;
        if (pendingUpdate) {
          const {element, targetText, callback} = pendingUpdate;
          pendingUpdate = null;
          typeText(element, targetText, callback);
        } else if (callback) {
          callback();
        }
      }
    }

    deleteAll();
  } else {
    if (!originalText) {
      let currentText = '';
      let i = 0;

      function typeWriter() {
        if (!typingAnimationInProgress) return;

        if (i < targetText.length) {
          currentText += targetText.charAt(i);
          element.value = currentText;
          audioManager.playType(); // Play sound on typing
          i++;
          setTimeout(typeWriter, typingSpeed);
        } else {
          element.value = targetText; 
          typingAnimationInProgress = false;
          if (pendingUpdate) {
            const {element, targetText, callback} = pendingUpdate;
            pendingUpdate = null;
            typeText(element, targetText, callback);
          } else if (callback) {
            callback();
          }
        }
      }

      typeWriter();
      return;
    }

    let prefixLen = 0;
    while (prefixLen < originalText.length &&
           prefixLen < targetText.length &&
           originalText[prefixLen] === targetText[prefixLen]) {
      prefixLen++;
    }

    let suffixLen = 0;
    while (suffixLen < (originalText.length - prefixLen) &&
           suffixLen < (targetText.length - prefixLen) &&
           originalText[originalText.length - 1 - suffixLen] === targetText[targetText.length - 1 - suffixLen]) {
      suffixLen++;
    }

    const prefix = originalText.substring(0, prefixLen);
    const originalMiddle = originalText.substring(prefixLen, originalText.length - suffixLen);
    const targetMiddle = targetText.substring(prefixLen, targetText.length - suffixLen);
    const suffix = targetText.substring(targetText.length - suffixLen);

    let currentText = originalText; 

    function startAnimation() {
      element.value = originalText;
      currentText = originalText; 
      deleteMiddle();
    }

    function deleteMiddle() {
      if (!typingAnimationInProgress) return;

      if (currentText.length > prefix.length + suffix.length) {
        currentText = currentText.substring(0, currentText.length - 1);
        element.value = currentText;
        audioManager.playType(); // Play sound on deletion
        setTimeout(deleteMiddle, deletionSpeed);
      } else {
        addNewMiddle(0);
      }
    }

    function addNewMiddle(index) {
      if (!typingAnimationInProgress) return;

      if (index < targetMiddle.length) {
        currentText = prefix + targetMiddle.substring(0, index + 1) + suffix;
        element.value = currentText;
        audioManager.playType(); // Play sound on typing
        setTimeout(() => addNewMiddle(index + 1), typingSpeed);
      } else {
        element.value = targetText; 
        typingAnimationInProgress = false;
        if (pendingUpdate) {
          const {element, targetText, callback} = pendingUpdate;
          pendingUpdate = null;
          typeText(element, targetText, callback);
        } else if (callback) {
          callback();
        }
      }
    }

    startAnimation();
  }
}

function calculateSimilarity(text1, text2) {
  if (!text1 && !text2) return 1;
  if (!text1 || !text2) return 0;
  if (text1 === text2) return 1;

  const broadcastPrefix = "/broadcast Site Status: ";
  if (text1.startsWith(broadcastPrefix) && text2.startsWith(broadcastPrefix)) {
    const afterPrefix1 = text1.substring(broadcastPrefix.length);
    const afterPrefix2 = text2.substring(broadcastPrefix.length);

    const pipeIndex1 = afterPrefix1.indexOf(' | ');
    const pipeIndex2 = afterPrefix2.indexOf(' | ');

    if (pipeIndex1 !== -1 && pipeIndex2 !== -1) {
      const status1 = afterPrefix1.substring(0, pipeIndex1);
      const status2 = afterPrefix2.substring(0, pipeIndex2);

      if (status1 === status2) {
        return 0.8;
      }
    }
    return 0.6;
  }

  const commonPrefixLen = getCommonPrefixLength(text1, text2);
  const commonSuffixLen = getCommonSuffixLen(text1, text2, commonPrefixLen);
  const commonLength = commonPrefixLen + commonSuffixLen;
  const totalLength = text1.length + text2.length;
  return (2 * commonLength) / totalLength;
}

function getCommonPrefixLength(str1, str2) {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return i;
}

function getCommonSuffixLength(str1, str2, prefixLen) {
  let i = 0;
  const maxSuffixLen = Math.min(str1.length, str2.length) - prefixLen;
  while (i < maxSuffixLen &&
         str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
    i++;
  }
  return i;
}

function updateLiveOutput() {
  const outputElement = document.getElementById('output');
  const options = getBroadcastOptions();
  const generatedOutput = generator.generate(options); // Get object { message, overflow }

  // Apply typing animation with the new text
  typeText(outputElement, generatedOutput.message, () => {
    updateCharCounter(); // Callback after typing animation is done
    // Set visual overflow indicator if needed
    if (generatedOutput.overflow) {
        outputElement.classList.add('overflow-warning');
        audioManager.playError(); // Play error sound to alert user of overflow
    } else {
        outputElement.classList.remove('overflow-warning');
    }
  });
}

function clearAll() {
    typingAnimationInProgress = false;

    document.getElementById('customTextInput').value = '';

    document.querySelectorAll('.menu-btn').forEach(btn => {
      const textSpan = btn.querySelector('.btn-text');
      if(textSpan && btn.dataset.originalText) textSpan.textContent = btn.dataset.originalText;
      delete btn.dataset.selected;
    });

    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
      cb.closest('.checkbox-btn')?.classList.remove('selected');
    });

    document.querySelectorAll('.led').forEach(led => {
      led.className = 'led';
      led.style.opacity = '1';
    });

    const outputEl = document.getElementById('output');
    outputEl.value = ''; 
    outputEl.classList.remove('overflow-warning'); // Remove overflow indicator on clear
    updateCharCounter();
    audioManager.playSuccess(); // Clear success sound
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
`;
document.head.appendChild(style);

// MODE SWITCH - ADVANCED PAGE
const switchBtn = document.getElementById("modeSwitch");
switchBtn.classList.add("active");
switchBtn.addEventListener("click", () => {
  window.location.href = "broadcast-generator.html";
});
if(switchBtn) switchBtn.addEventListener('mouseenter', () => audioManager.playHover());