// --- Audio ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(freq = 880, duration = 0.08, vol = 0.06){
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    setTimeout(()=> o.stop(), duration * 1000 + 20);
  } catch(e) { console.error("Audio context error: ", e); }
}

function playAlert(level){
  const upperLevel = level?.toUpperCase();
  if(upperLevel === "HIGH") beep(440, 0.3, 0.08);
  else if(upperLevel === "MEDIUM") beep(660, 0.15, 0.06);
  else if(upperLevel === "LOW") beep(880, 0.08, 0.04);
}

// --- Main Setup ---
document.addEventListener('DOMContentLoaded', () => {
  const allMenuBtns = document.querySelectorAll('.menu-btn');
  const allContent = document.querySelectorAll('.menu-list, .collapsible-content');

  // --- Unified Menu Toggling & Interaction Setup ---
  // Iterate over each menu individually to create a clean scope for event listeners.
  document.querySelectorAll('.menu').forEach(menu => {
    const mainBtn = menu.querySelector('.menu-btn');
    const contentPanel = menu.querySelector('.menu-list, .collapsible-content');

    if (!mainBtn || !contentPanel) return;
    
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
    });

    // Prevent propagation inside panels to prevent accidental closing or triggering other events
    contentPanel.addEventListener('click', e => e.stopPropagation());

    // --- Add specific interaction logic based on panel type ---
    if (contentPanel.classList.contains('single-select')) {
      contentPanel.querySelectorAll('button').forEach(optionBtn => {
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
          beep(880, 0.06, 0.04);
        });
      });
    }

    if (contentPanel.classList.contains('multi-select')) {
      contentPanel.querySelectorAll('button').forEach(optionBtn => {
        optionBtn.addEventListener('click', () => {
          optionBtn.classList.toggle('selected');
          const selectedCount = contentPanel.querySelectorAll('.selected').length;
          const led = mainBtn.querySelector('.led');
          led.style.opacity = '1';
          led.classList.toggle('prohibited', selectedCount > 0);
          led.classList.toggle('blink', selectedCount > 0);
          textSpan.textContent = selectedCount > 0 ? `Events (${selectedCount})` : mainBtn.dataset.originalText;
          updateLiveOutput();
          beep(880, 0.06, 0.04);
        });
      });
    }

    if (contentPanel.classList.contains('collapsible-content')) {
      contentPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const led = mainBtn?.querySelector('.led');
          const checkedCount = contentPanel.querySelectorAll('input:checked').length;
          
          checkbox.closest('.checkbox-btn').classList.toggle('selected', checkbox.checked);

          if (led) {
            led.style.opacity = '1';
            led.className = 'led';
          }

          if (panelId === 'breachedScpsContent') {
            if (checkedCount >= 4) led.classList.add('black', 'blink');
            else if (checkedCount === 3) led.classList.add('high', 'blink');
            else if (checkedCount === 2) led.classList.add('medium');
            else if (checkedCount === 1) led.classList.add('allowed');
            if (textSpan) textSpan.textContent = checkedCount > 0 ? `Breached SCPs (${checkedCount})` : mainBtn.dataset.originalText;

            // --- EASTER EGG LOGIC FOR ALL BREACHED SCPS ---
            const allCheckboxes = contentPanel.querySelectorAll('input[type="checkbox"]').length;
            if (checkedCount > 0 && checkedCount === allCheckboxes) { // Check if all are checked
                // Breach Easter Egg removed
            }
          }
          updateLiveOutput();
          // No updateLiveOutput() here to avoid overwriting the easter egg message
          beep(880, 0.06, 0.04);
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
  document.getElementById('clearBtn')?.addEventListener('click', clearAll);
    // ... rest of existing DOMContentLoaded code ...

});


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

function getBroadcastString() {
  const getSelected = (target) => document.querySelector(`.menu-btn[data-target="${target}"]`)?.dataset.selected;
  
  const alarm = getSelected("alarmContent") || "N/A";
  const status = getSelected("statusContent") || "N/A";
  const testing = getSelected("testingContent") || "N/A";

  const statusMessages = {
    "Scp Breach": "All personnel must initiate containment protocols immediately.",
    "Site Lockdown": "SITE LOCKDOWN! Multiple breaches detected.",
    "Class-D Escape": "Class-D personnel have escaped containment.",
    "Chaos Insurgency": "Chaos Insurgency activity detected.",
    "Nuclear Protocol": "All personnel must evacuate to shelters immediately.",
    "Clear": "All personnel resume normal duties.",
    "Maintenance": "Maintenance personnel report to generator room immediately.",
    "O5 Meeting": `O5 meeting scheduled.`
  };
  
  const eventMessages = { "610 Event": "SCP-610 anomaly active.", "076 Event": "SCP-076 containment breach.", "Class-D Riot": "Class-D personnel are rioting.", "323 Breach": "SCP-323 containment breach." };

  let messageParts = [];
  if (statusMessages[status]) messageParts.push(statusMessages[status]);

  const selectedEvents = Array.from(document.querySelectorAll('#eventsContent button.selected')).map(btn => eventMessages[btn.dataset.option]);
  if (selectedEvents.length > 0) messageParts.push(selectedEvents.join(" | "));

  const breachedSCPs = Array.from(document.querySelectorAll('#breachedScpsContent input:checked')).map(cb => cb.closest('label').textContent.trim());
  if (breachedSCPs.length > 0) messageParts.push(`Breached: ${breachedSCPs.join(", ")}`);

  const requirements = Array.from(document.querySelectorAll('#requirementsContent input:checked')).map(cb => cb.closest('label').textContent.trim());
  if (requirements.length > 0) messageParts.push(`Reqs: ${requirements.join(", ")}`);
  
  const customTextInput = document.getElementById('customTextInput').value.trim();
  if (customTextInput) messageParts.push(customTextInput);
  
  const finalMessage = messageParts.filter(part => part && part.trim()).join(" | ");

  return `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${finalMessage}`;
}

function updateLiveOutput() {
  if (isEasterEggMessageActive) return; // Block updates if easter egg message is active
  document.getElementById('output').value = getBroadcastString();
  updateCharCounter();
}

function clearAll() {
    if (isEasterEggMessageActive) return; // Block clearing if easter egg message is active
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
    
    updateLiveOutput();
    beep(660, 0.1, 0.04);
}

// --- Char Counter & Copy ---
const MAX_CHARS = 200;
function updateCharCounter() {
  const outputEl = document.getElementById('output');
  const charCountEl = document.getElementById('charCount');
  if(!outputEl || !charCountEl) return;
  const count = outputEl.value.length;
  charCountEl.textContent = count;
  outputEl.classList.remove('warning', 'error');
  if (count > MAX_CHARS) outputEl.classList.add('error');
  else if (count > MAX_CHARS * 0.9) outputEl.classList.add('warning');
}
updateCharCounter(); // Initial call

document.getElementById('copyBtn')?.addEventListener('click', ()=>{
  const outputEl = document.getElementById('output');
  if(!outputEl.value.trim()) return;
  if(outputEl.value.length > MAX_CHARS) { alert(`Character limit exceeded!`); return; }
  navigator.clipboard.writeText(outputEl.value).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'COPIED!';
    setTimeout(()=> btn.textContent = 'COPY',1000);

    // --- Copycat Easter Egg Logic ---
    if (!isEasterEggMessageActive) { // Only trigger if no other easter egg is active
      copyButtonClickCount++;
      clearTimeout(copyButtonTimer);
      copyButtonTimer = setTimeout(() => {
        copyButtonClickCount = 0; // Reset count if clicks are not rapid enough
      }, 1000); // 1 second window for rapid clicks

      if (copyButtonClickCount >= 5) { // 5 rapid clicks to trigger
        activateCopycatEasterEgg();
        copyButtonClickCount = 0; // Reset for next potential trigger
      }
    }
  });
});

// Global Easter Egg State Management
let isEasterEggMessageActive = false; // Flag to prevent multiple easter eggs from conflicting



// Konami Code Easter Egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiCodePosition = 0;
let konamiEasterEggTimeoutId = null; // To store the timeout ID for Konami

// Copycat Easter Egg
let copyButtonClickCount = 0;
let copyButtonTimer = null; // Timer to track rapid clicks
let copycatEasterEggTimeoutId = null; // Timeout ID for Copycat Easter Egg message


document.addEventListener('keydown', (e) => {
    // If an easter egg message is currently displayed, don't process new key presses for the code
    if (konamiEasterEggTimeoutId !== null) return;

    if (e.code === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;

        if (konamiCodePosition === konamiCode.length) {
            activateEasterEgg();
            konamiCodePosition = 0; // Reset for future activations
        }
    } else {
        konamiCodePosition = 0; // Reset if incorrect key is pressed
    }
});

function activateEasterEgg() {
    console.log("Broadcast Generator: Easter egg found! There are 2 existing ones."); // Console log for Konami easter egg discovery
    isEasterEggMessageActive = true; // Set flag
    const outputEl = document.getElementById('output');
    const originalOutput = getBroadcastString(); // Store current generated output
    const headerH1 = document.querySelector('.header h1'); // Get header h1

    outputEl.value = "Warning: Unauthorized code anomalies detected. Please remain calm and contact administration, or simply ignore.";
    updateCharCounter(); // Update counter for the easter egg message

    document.body.classList.add('glitch-active'); // Add glitch class to body

    // Clear any previous easter egg timeout if it exists (shouldn't happen with the above check, but for safety)
    if (konamiEasterEggTimeoutId) clearTimeout(konamiEasterEggTimeoutId);

    konamiEasterEggTimeoutId = setTimeout(() => {
        isEasterEggMessageActive = false; // Clear flag
        outputEl.value = originalOutput; // Revert to original output
        updateCharCounter(); // Update counter for original message
        document.body.classList.remove('glitch-active'); // Remove glitch class from body
        konamiEasterEggTimeoutId = null; // Clear timeout ID
            updateLiveOutput(); // Ensure output is correctly updated after egg
        }, 5000); // Message disappears after 5 seconds
        }
        
        function activateCopycatEasterEgg() {
          console.log("Broadcast Generator: Easter egg found! There are 2 existing ones."); // Console log for Copycat easter egg discovery
          isEasterEggMessageActive = true;
          const outputEl = document.getElementById('output');
          const originalOutput = getBroadcastString(); // Store current generated output
        
          outputEl.value = ">>> Copying... Unauthorized duplication detected. Initiating self-replication protocol... <<<";
          updateCharCounter();
        
          // Play a distinct sound
          beep(440, 0.1, 0.08); // A slightly lower pitch beep
        
          if (copycatEasterEggTimeoutId) clearTimeout(copycatEasterEggTimeoutId);
        
          copycatEasterEggTimeoutId = setTimeout(() => {
            isEasterEggMessageActive = false;
            outputEl.value = originalOutput;
            updateCharCounter();
            copycatEasterEggTimeoutId = null;
            updateLiveOutput();
          }, 4000); // Message disappears after 4 seconds
        }
// MODE SWITCH - ADVANCED PAGE
const switchBtn = document.getElementById("modeSwitch");

// Advanced page → slider starts ON:
switchBtn.classList.add("active");

switchBtn.addEventListener("click", () => {
  window.location.href = "broadcast-generator.html";
});
