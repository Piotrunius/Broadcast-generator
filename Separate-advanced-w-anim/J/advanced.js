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
          } else if (panelId === 'requirementsContent') {
            // Update requirements LED based on checked items
            if (checkedCount > 0) led.classList.add('allowed'); // Green LED for any checked requirement
            if (textSpan) textSpan.textContent = checkedCount > 0 ? `Requirements (${checkedCount})` : mainBtn.dataset.originalText;
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

  // Add event listener for custom text input to update the broadcast in real-time
  document.getElementById('customTextInput')?.addEventListener('input', function() {
    updateLiveOutput();
  });

  // Add event listener for custom text input to update the character counter
  document.getElementById('customTextInput')?.addEventListener('input', updateCharCounter);
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

  // Shorter versions of status messages for when character limit is approaching
  const shortStatusMessages = {
    "Scp Breach": "Containment protocols required.",
    "Site Lockdown": "SITE LOCKDOWN! Multiple breaches detected.",
    "Class-D Escape": "Class-D personnel escaped.",
    "Chaos Insurgency": "Chaos Insurgency activity detected.",
    "Nuclear Protocol": "Evacuate to shelters immediately.",
    "Clear": "Normal duties resumed.",
    "Maintenance": "Maintenance to generator room.",
    "O5 Meeting": "O5 meeting scheduled."
  };

  // Even shorter or empty status messages for when character limit is critically approached
  const minimalStatusMessages = {
    "Scp Breach": "", // No extra message for SCP Breach
    "Site Lockdown": "", // No extra message for Site Lockdown
    "Class-D Escape": "", // No extra message for Class-D Escape
    "Chaos Insurgency": "", // No extra message for Chaos Insurgency
    "Nuclear Protocol": "", // No extra message for Nuclear Protocol
    "Clear": "", // No extra message for Clear
    "Maintenance": "", // No extra message for Maintenance
    "O5 Meeting": "" // No extra message for O5 Meeting
  };

  const eventMessages = { "610 Event": "SCP-610 anomaly active.", "076 Event": "SCP-076 containment breach.", "Class-D Riot": "Class-D personnel are rioting.", "323 Breach": "SCP-323 containment breach." };

  // Check if we should use short messages based on potential character count
  const mockParts = [];

  const selectedEvents = Array.from(document.querySelectorAll('#eventsContent button.selected')).map(btn => eventMessages[btn.dataset.option]);
  if (selectedEvents.length > 0) mockParts.push(selectedEvents.join(" | "));

  const breachedSCPs = Array.from(document.querySelectorAll('#breachedScpsContent input:checked')).map(cb => cb.closest('label').textContent.trim());
  if (breachedSCPs.length > 0) mockParts.push(`Breached: ${breachedSCPs.join(", ")}`);

  // Get requirements and format them according to specifications
  const requirements = [];
  const idCheck = document.getElementById('idCheck');
  const conXCheck = document.getElementById('authConX');
  const scp008Check = document.getElementById('authScp008');
  const scp409Check = document.getElementById('authScp409');
  const scp701Check = document.getElementById('authScp701');
  const scp035Check = document.getElementById('authScp035');

  if (idCheck && idCheck.checked) {
    requirements.push("Present ID at checkpoints");
  }

  // Format CON-X and SCP-specific auth requirements
  const scpAuthRequirements = [];
  if (conXCheck && conXCheck.checked) {
    scpAuthRequirements.push("CON-X");
  }
  if (scp008Check && scp008Check.checked) {
    scpAuthRequirements.push("008");
  }
  if (scp409Check && scp409Check.checked) {
    scpAuthRequirements.push("409");
  }
  if (scp701Check && scp701Check.checked) {
    scpAuthRequirements.push("701");
  }
  if (scp035Check && scp035Check.checked) {
    scpAuthRequirements.push("035");
  }

  if (scpAuthRequirements.length > 0) {
    requirements.push(`SID+ Auth required for ${scpAuthRequirements.join(", ")} tests`);
  }

  // Add each requirement as a separate part for independent processing
  requirements.forEach(req => mockParts.push(req));

  const customTextInput = document.getElementById('customTextInput').value.trim();
  if (customTextInput) mockParts.push(customTextInput);

  // Estimate length with long, short, and minimal (empty) status messages to make the best decision
  const prefixLength = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | `.length;
  const contentLength = mockParts.filter(part => part && part.trim()).join(" | ").length;
  const longStatusLength = statusMessages[status] ? statusMessages[status].length : 0;
  const shortStatusLength = shortStatusMessages[status] ? shortStatusMessages[status].length : 0;
  const minimalStatusLength = minimalStatusMessages[status] ? minimalStatusMessages[status].length : 0; // Usually 0 for empty

  // Determine which level of status message to use based on content length
  const totalWithLong = prefixLength + contentLength + longStatusLength;
  const totalWithShort = prefixLength + contentLength + shortStatusLength;
  const totalWithMinimal = prefixLength + contentLength + minimalStatusLength;

  let statusLevel = "long"; // default to long
  if (totalWithLong > 195) { // If long would be too much
    if (totalWithShort <= 195) { // If short fits
      statusLevel = "short";
    } else if (totalWithMinimal <= 195) { // If minimal fits
      statusLevel = "minimal";
    } else {
      // Even minimal won't fit, but try minimal anyway to maximize content space
      statusLevel = "minimal";
    }
  }

  let messageParts = [];
  // Decide which level of status message to use
  if (statusMessages[status]) {
    let statusMessage = statusMessages[status]; // default to long
    if (statusLevel === "short") {
      statusMessage = shortStatusMessages[status] || statusMessages[status];
    } else if (statusLevel === "minimal") {
      statusMessage = minimalStatusMessages[status] || "";
    }

    if (statusMessage) {
      messageParts.push(statusMessage);
    }
  }

  if (selectedEvents.length > 0) messageParts.push(selectedEvents.join(" | "));

  if (breachedSCPs.length > 0) messageParts.push(`Breached: ${breachedSCPs.join(", ")}`);

  // Add each requirement as a separate part in the main message array as well
  requirements.forEach(req => messageParts.push(req));

  if (customTextInput) messageParts.push(customTextInput); // Custom message goes at the end

  let finalMessage = messageParts.filter(part => part && part.trim()).join(" | ");

  // If the total message is still too long, apply more aggressive shortening
  const fullBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${finalMessage}`;

  if (fullBroadcast.length > 200) {
    // Determine which level of status message was used
    let usedStatusMessage = "";
    if (statusLevel === "long" && statusMessages[status]) {
      usedStatusMessage = statusMessages[status];
    } else if (statusLevel === "short" && shortStatusMessages[status]) {
      usedStatusMessage = shortStatusMessages[status];
    } else if (statusLevel === "minimal" && minimalStatusMessages[status]) {
      usedStatusMessage = minimalStatusMessages[status];
    }

    // First try reducing the status message level further
    if (statusLevel === "long" && shortStatusMessages[status]) {
      // Try short instead of long
      const messagePartsWithShortStatus = messageParts.map(part => part === usedStatusMessage ? shortStatusMessages[status] : part).filter(part => part !== "");
      const shortMessage = messagePartsWithShortStatus.filter(part => part && part.trim()).join(" | ");
      const shortBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${shortMessage}`;

      if (shortBroadcast.length <= 200) {
        finalMessage = shortMessage;
      } else {
        // Try minimal (no status message)
        const messagePartsWithoutStatus = messageParts.filter(part => part !== usedStatusMessage);
        const noStatusMessage = messagePartsWithoutStatus.filter(part => part && part.trim()).join(" | ");
        const noStatusBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${noStatusMessage}`;

        if (noStatusBroadcast.length <= 200) {
          finalMessage = noStatusMessage;
        } else {
          // Apply other optimizations if still too long
          // Try to abbreviate requirements
          let optimizedMessageParts = [...messageParts];

          // Try to abbreviate requirements if they're present
          for (let i = 0; i < optimizedMessageParts.length; i++) {
            if (optimizedMessageParts[i]?.includes("SID+ Auth required for")) {
              // Create abbreviated version: "SID+ Auth req: ..."
              const reqMatch = optimizedMessageParts[i]?.match(/SID\+ Auth required for (.+) tests/);
              if (reqMatch) {
                optimizedMessageParts[i] = `SID+ Auth req: ${reqMatch[1]}`;
              }
            } else if (optimizedMessageParts[i]?.includes("Present ID at")) {
              // Abbreviate the ID message if needed
              optimizedMessageParts[i] = "Auth req at CP";
            }
          }

          const optimizedMessage = optimizedMessageParts.filter(part => part && part.trim()).join(" | ");
          const optimizedBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${optimizedMessage}`;

          if (optimizedBroadcast.length <= 200) {
            finalMessage = optimizedMessage;
          } else {
            // If still too long, truncate the breached SCPs list
            if (breachedSCPs.length > 0) {
              // Try with fewer SCPs in the list
              for (let count = breachedSCPs.length - 1; count > 0; count--) {
                const reducedBreached = `Breached: ${breachedSCPs.slice(0, count).join(", ")}`;
                const testParts = [...messageParts];
                const breachIndex = testParts.findIndex(part => part?.startsWith("Breached: "));
                if (breachIndex !== -1) {
                  testParts[breachIndex] = reducedBreached;
                }

                const testMessage = testParts.filter(part => part && part.trim()).join(" | ");
                const testBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${testMessage}`;

                if (testBroadcast.length <= 200) {
                  finalMessage = testMessage;
                  break;
                }
              }
            }
          }
        }
      }
    } else if (statusLevel === "short" && minimalStatusMessages[status]) {
      // Try minimal instead of short
      const messagePartsWithMinimalStatus = messageParts.map(part => part === usedStatusMessage ? minimalStatusMessages[status] : part).filter(part => part !== "");
      const minimalMessage = messagePartsWithMinimalStatus.filter(part => part && part.trim()).join(" | ");
      const minimalBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${minimalMessage}`;

      if (minimalBroadcast.length <= 200) {
        finalMessage = minimalMessage;
      } else {
        // Apply other optimizations
        let optimizedMessageParts = [...messageParts];

        // Try to abbreviate requirements if they're present - only for the SID+ messages
        for (let i = 0; i < optimizedMessageParts.length; i++) {
          if (optimizedMessageParts[i]?.includes("SID+ Auth required for")) {
            // Create abbreviated version: "SID+ Auth req: ..."
            const reqMatch = optimizedMessageParts[i]?.match(/SID\+ Auth required for (.+) tests/);
            if (reqMatch) {
              optimizedMessageParts[i] = `SID+ Auth req: ${reqMatch[1]}`;
            }
          } else if (optimizedMessageParts[i]?.includes("Present ID at")) {
            // Abbreviate the ID message if needed
            optimizedMessageParts[i] = "Auth req at CP";
          }
        }

        const optimizedMessage = optimizedMessageParts.filter(part => part && part.trim()).join(" | ");
        const optimizedBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${optimizedMessage}`;

        if (optimizedBroadcast.length <= 200) {
          finalMessage = optimizedMessage;
        } else {
          // If still too long, truncate the breached SCPs list
          if (breachedSCPs.length > 0) {
            // Try with fewer SCPs in the list
            for (let count = breachedSCPs.length - 1; count > 0; count--) {
              const reducedBreached = `Breached: ${breachedSCPs.slice(0, count).join(", ")}`;
              const testParts = [...messageParts];
              const breachIndex = testParts.findIndex(part => part?.startsWith("Breached: "));
              if (breachIndex !== -1) {
                testParts[breachIndex] = reducedBreached;
              }

              const testMessage = testParts.filter(part => part && part.trim()).join(" | ");
              const testBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${testMessage}`;

              if (testBroadcast.length <= 200) {
                finalMessage = testMessage;
                break;
              }
            }
          }
        }
      }
    } else if (statusLevel === "minimal") {
      // Status message is already minimal (likely empty), try other optimizations
      let optimizedMessageParts = [...messageParts];

      // Try to abbreviate requirements if they're present
      for (let i = 0; i < optimizedMessageParts.length; i++) {
        if (optimizedMessageParts[i]?.includes("SID+ Auth required for")) {
          // Create abbreviated version: "SID+ Auth req: ..."
          const reqMatch = optimizedMessageParts[i]?.match(/SID\+ Auth required for (.+) tests/);
          if (reqMatch) {
            optimizedMessageParts[i] = `SID+ Auth req: ${reqMatch[1]}`;
          }
        } else if (optimizedMessageParts[i]?.includes("Present ID at")) {
          // Abbreviate the ID message if needed
          optimizedMessageParts[i] = "Auth req at CP";
        }
      }

      const optimizedMessage = optimizedMessageParts.filter(part => part && part.trim()).join(" | ");
      const optimizedBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${optimizedMessage}`;

      if (optimizedBroadcast.length <= 200) {
        finalMessage = optimizedMessage;
      } else {
        // If still too long, truncate the breached SCPs list
        if (breachedSCPs.length > 0) {
          // Try with fewer SCPs in the list
          for (let count = breachedSCPs.length - 1; count > 0; count--) {
            const reducedBreached = `Breached: ${breachedSCPs.slice(0, count).join(", ")}`;
            const testParts = [...messageParts];
            const breachIndex = testParts.findIndex(part => part?.startsWith("Breached: "));
            if (breachIndex !== -1) {
              testParts[breachIndex] = reducedBreached;
            }

            const testMessage = testParts.filter(part => part && part.trim()).join(" | ");
            const testBroadcast = `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${testMessage}`;

            if (testBroadcast.length <= 200) {
              finalMessage = testMessage;
              break;
            }
          }
        }
      }
    }
  }

  return `/broadcast Site Status: ${status} | Threat: ${alarm} | Testing: ${testing} | ${finalMessage}`;
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
  const deletionSpeed = 20; // faster deletions
  const typingSpeed = 25; // slightly faster typing

  // Calculate the similarity percentage between original and target text
  const similarity = calculateSimilarity(originalText, targetText);

  // If similarity is low (less than 40%), use full clear and type for better UX
  // This threshold may need adjustment based on testing
  if (similarity < 0.4 && originalText.length > 0) {
    // Do a full clear and retype for very different texts
    let currentText = originalText;

    function deleteAll() {
      if (!typingAnimationInProgress) return;

      if (currentText.length > 0) {
        currentText = currentText.substring(0, currentText.length - 1);
        element.value = currentText; // Update the element immediately
        setTimeout(deleteAll, deletionSpeed);
      } else {
        typeNewText(0);
      }
    }

    function typeNewText(index) {
      if (!typingAnimationInProgress) return;

      if (index < targetText.length) {
        currentText += targetText.charAt(index);
        element.value = currentText; // Update the element immediately
        setTimeout(() => typeNewText(index + 1), typingSpeed);
      } else {
        element.value = targetText; // Ensure the final text is correct
        typingAnimationInProgress = false;
        // Process any pending update
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
    // Use the optimized approach for similar texts
    // If original text is empty, just do a regular typing animation
    if (!originalText) {
      let currentText = '';
      let i = 0;

      function typeWriter() {
        if (!typingAnimationInProgress) return;

        if (i < targetText.length) {
          currentText += targetText.charAt(i);
          element.value = currentText;
          i++;
          setTimeout(typeWriter, typingSpeed);
        } else {
          element.value = targetText; // Ensure final text is correct
          typingAnimationInProgress = false;
          // Process any pending update
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

    // Find the common prefix and suffix to optimize the change
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

    // Extract the parts
    const prefix = originalText.substring(0, prefixLen);
    const originalMiddle = originalText.substring(prefixLen, originalText.length - suffixLen);
    const targetMiddle = targetText.substring(prefixLen, targetText.length - suffixLen);
    const suffix = targetText.substring(targetText.length - suffixLen);

    // Animation sequence: keep prefix -> delete middle -> add new middle -> keep suffix
    let currentText = originalText; // Declare currentText in the right scope

    function startAnimation() {
      // Start with the original text up to the changing part
      element.value = originalText;
      currentText = originalText; // Initialize currentText
      deleteMiddle();
    }

    function deleteMiddle() {
      if (!typingAnimationInProgress) return;

      if (currentText.length > prefix.length + suffix.length) {
        // Remove one character at a time from the middle part only
        currentText = currentText.substring(0, currentText.length - 1);
        element.value = currentText;
        setTimeout(deleteMiddle, deletionSpeed);
      } else {
        // Now add the new middle part
        addNewMiddle(0);
      }
    }

    function addNewMiddle(index) {
      if (!typingAnimationInProgress) return;

      if (index < targetMiddle.length) {
        currentText = prefix + targetMiddle.substring(0, index + 1) + suffix;
        element.value = currentText;
        setTimeout(() => addNewMiddle(index + 1), typingSpeed);
      } else {
        // Final check to ensure text is correct
        element.value = targetText;
        typingAnimationInProgress = false;
        // Process any pending update
        if (pendingUpdate) {
          const {element, targetText, callback} = pendingUpdate;
          pendingUpdate = null;
          typeText(element, targetText, callback);
        } else if (callback) {
          callback();
        }
      }
    }

    // Start the animation sequence
    startAnimation();
  }
}

// Function to calculate similarity between two texts
function calculateSimilarity(text1, text2) {
  if (!text1 && !text2) return 1;
  if (!text1 || !text2) return 0;
  if (text1 === text2) return 1;

  // Check for common broadcast structure
  const broadcastPrefix = "/broadcast Site Status: ";
  if (text1.startsWith(broadcastPrefix) && text2.startsWith(broadcastPrefix)) {
    // Extract the parts after the common prefix
    const afterPrefix1 = text1.substring(broadcastPrefix.length);
    const afterPrefix2 = text2.substring(broadcastPrefix.length);

    // Find common parts in structured broadcast
    const pipeIndex1 = afterPrefix1.indexOf(' | ');
    const pipeIndex2 = afterPrefix2.indexOf(' | ');

    if (pipeIndex1 !== -1 && pipeIndex2 !== -1) {
      // Compare the first segments (status) which are likely to be the same
      const status1 = afterPrefix1.substring(0, pipeIndex1);
      const status2 = afterPrefix2.substring(0, pipeIndex2);

      if (status1 === status2) {
        // If status is the same, likely a small change - return high similarity
        return 0.8;
      }
    }

    // If both have the same broadcast prefix, assume reasonably similar
    return 0.6;
  }

  // Use the standard approach for other texts
  const commonPrefixLen = getCommonPrefixLength(text1, text2);
  const commonSuffixLen = getCommonSuffixLength(text1, text2, commonPrefixLen);

  const commonLength = commonPrefixLen + commonSuffixLen;
  const totalLength = text1.length + text2.length;

  return (2 * commonLength) / totalLength;
}

// Helper to get common prefix length
function getCommonPrefixLength(str1, str2) {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return i;
}

// Helper to get common suffix length
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
  if (isEasterEggMessageActive) return; // Block updates if easter egg message is active
  const outputElement = document.getElementById('output');
  const newText = getBroadcastString();

  // Apply typing animation with the new text
  typeText(outputElement, newText, updateCharCounter);
}

function clearAll() {
    if (isEasterEggMessageActive) return; // Block clearing if easter egg message is active

    // Stop any ongoing typing animation
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

    // Clear the output area and show empty content
    const outputEl = document.getElementById('output');
    outputEl.value = ''; // Clear immediately without animation
    updateCharCounter();
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
  if (count > MAX_CHARS) {
    outputEl.classList.add('error');
  } else if (count > MAX_CHARS * 0.9) { // 90% of max (180 chars)
    outputEl.classList.add('warning');
  }
}
updateCharCounter(); // Initial call

document.getElementById('copyBtn')?.addEventListener('click', ()=>{
  const outputEl = document.getElementById('output');
  if(!outputEl.value.trim()) return;

  // Show error if character limit exceeded
  if(outputEl.value.length > MAX_CHARS) {
    // Add error animation to output area
    outputEl.classList.add('error');
    outputEl.style.animation = 'none';
    outputEl.offsetHeight; // Trigger reflow
    outputEl.style.animation = 'shake 0.5s'; // Apply shake animation

    // Create error message element if it doesn't exist
    let errorEl = document.getElementById('char-limit-error');
    // Ensure the container has relative positioning for absolute positioning of error message
    const container = document.querySelector('.output-container');
    if (container) {
      container.style.position = 'relative';
    }
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = 'char-limit-error';
      errorEl.textContent = 'Character limit exceeded!';
      errorEl.style.color = 'var(--red)';
      errorEl.style.textAlign = 'center';
      errorEl.style.fontSize = '14px';
      errorEl.style.fontWeight = 'bold';
      errorEl.style.marginTop = '5px'; // This margin is now just for positioning within its absolute context
      container.appendChild(errorEl);
    } else {
      errorEl.style.display = 'block';
    }

    // Remove error message after delay
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 3000);

    return;
  }

  navigator.clipboard.writeText(outputEl.value).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'COPIED!';
    setTimeout(()=> btn.textContent = 'COPY',1000);
  });
});

// Add CSS for the shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Global Easter Egg State Management
let isEasterEggMessageActive = false; // Flag to prevent multiple easter eggs from conflicting



// Konami Code Easter Egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiCodePosition = 0;
let konamiEasterEggTimeoutId = null; // To store the timeout ID for Konami



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
    isEasterEggMessageActive = true; // Set flag
    const outputEl = document.getElementById('output');
    const originalOutput = getBroadcastString(); // Store current generated output
    const headerH1 = document.querySelector('.header h1'); // Get header h1

    // Clear and type easter egg message
    typeText(outputEl, "Warning: Unauthorized code anomalies detected. Please remain calm and contact administration, or simply ignore.", updateCharCounter);

    document.body.classList.add('glitch-active'); // Add glitch class to body

    // Clear any previous easter egg timeout if it exists (shouldn't happen with the above check, but for safety)
    if (konamiEasterEggTimeoutId) clearTimeout(konamiEasterEggTimeoutId);

    konamiEasterEggTimeoutId = setTimeout(() => {
        isEasterEggMessageActive = false; // Clear flag
        // Type the original output after easter egg ends
        typeText(outputEl, originalOutput, updateCharCounter);
        document.body.classList.remove('glitch-active'); // Remove glitch class from body
        konamiEasterEggTimeoutId = null; // Clear timeout ID
            updateLiveOutput(); // Ensure output is correctly updated after egg
        }, 5000); // Message disappears after 5 seconds
        }
// MODE SWITCH - ADVANCED PAGE
const switchBtn = document.getElementById("modeSwitch");

// Advanced page → slider starts ON:
switchBtn.classList.add("active");

switchBtn.addEventListener("click", () => {
  window.location.href = "broadcast-generator.html";
});
