import { AudioManager } from '../../utils/audio-manager.js';
import { trackEvent, trackNavigation } from '../../utils/umami-tracker.js'; // Umami tracking

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Use global AudioManager if available (created by core/index.js), otherwise create new instance
const audioManager = window.audioManager || new AudioManager();
// Ensure global reference
window.audioManager = audioManager;

function beep(freq = 880, duration = 0.08, vol = 0.06) {
  // Check if audio is muted
  if (audioManager.isMuted) return;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  setTimeout(() => o.stop(), duration * 1000 + 20);
}

function playAlert(level) {
  // Check if audio is muted
  if (audioManager.isMuted) return;

  if (level === "HIGH") beep(440, 0.3, 0.08);
  else if (level === "MEDIUM") beep(660, 0.15, 0.06);
  else if (level === "LOW") beep(880, 0.08, 0.04);
  else beep(880, 0.08, 0.04);
}

// Helpers
const menuButtons = document.querySelectorAll('.menu-btn');
const allLists = document.querySelectorAll('.menu-list');
const outputEl = document.getElementById('output');
const wrapEl = document.querySelector('.wrap');
const originalButtonHTML = {};
menuButtons.forEach(btn => {
  const menuId = btn.getAttribute('data-menu');
  originalButtonHTML[menuId] = btn.innerHTML;
});

function updateCharCounter() {
  const counter = document.getElementById('charCounter');
  if (!counter) return;
  const len = outputEl.value.length;
  counter.textContent = `${len}/200`;
  counter.style.color = len > 200 ? '#ffaa00' : '#a8a8a8';
}

outputEl.addEventListener('input', () => {
  const lengthWarningEl = document.getElementById('lengthWarning');
  if (outputEl.value.length > 200) {
    if (lengthWarningEl) {
      lengthWarningEl.style.display = "block";
      lengthWarningEl.textContent = `⚠ WARNING: EXCEEDS 200 CHARACTERS (${outputEl.value.length}/200)`;
    }
    outputEl.style.borderColor = "#ffaa00";
  } else {
    if (lengthWarningEl) lengthWarningEl.style.display = "none";
    outputEl.style.borderColor = "";
  }
  updateCharCounter();
});

// Toggle menu
menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const menuId = btn.getAttribute('data-menu');
    const list = document.querySelector(`.menu-list#${menuId}`);
    allLists.forEach(l => {
      if (l !== list) {
        l.classList.remove('show');
        const b = document.querySelector(`.menu-btn[data-menu="${l.dataset.menu}"]`);
        if (b) b.setAttribute('aria-expanded', 'false');
        l.setAttribute('aria-hidden', 'true');
        if (l.id === 'alarm') wrapEl.classList.remove('threat-open');
      }
    });
    const isShown = list.classList.contains('show');
    if (isShown) {
      list.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
      list.setAttribute('aria-hidden', 'true');
      if (menuId === 'alarm') wrapEl.classList.remove('threat-open');
    } else {
      list.classList.add('show');
      btn.setAttribute('aria-expanded', 'true');
      list.setAttribute('aria-hidden', 'false');
      if (menuId === 'alarm') wrapEl.classList.add('threat-open');
      
      // Umami tracking: Track menu open action
      trackEvent('Menu_Opened', { menu: menuId });
    }
  });
});

// Click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu')) {
    allLists.forEach(l => {
      l.classList.remove('show');
      l.setAttribute('aria-hidden', 'true');
      const b = document.querySelector(`.menu-btn[data-menu="${l.dataset.menu}"]`);
      if (b) b.setAttribute('aria-expanded', 'false');
      if (l.id === 'alarm') wrapEl.classList.remove('threat-open');
    });
  }
});

// Estado de parpadeo sincronizado
let blinkVisible = true;
let blinkInterval = setInterval(() => {
  document.querySelectorAll('.led.blink').forEach(led => {
    led.style.opacity = blinkVisible ? 1 : 0;
  });

  blinkVisible = !blinkVisible;
}, 200);

// Actualizar LEDs al seleccionar opción
document.querySelectorAll('.menu-list button').forEach(optBtn => {
  optBtn.addEventListener('click', () => {
    let text = optBtn.getAttribute('data-option');
    const parentMenu = optBtn.closest('.menu-list');
    const menuBtn = document.querySelector(`.menu-btn[data-menu="${parentMenu.id}"]`);
    const ledOrIcon = menuBtn.querySelector('.led, .icon')?.outerHTML || '';
    const caret = menuBtn.querySelector('.caret')?.outerHTML || '';

    // Convertir en dos líneas si contiene paréntesis
    if (text.includes("(")) {
      let parts = text.split("(");
      text = `${parts[0].trim()}<br>(${parts[1]}`;
    }

    menuBtn.innerHTML = `${ledOrIcon}${text}${caret}`;

    if (parentMenu.id === "alarm") updateLED(optBtn.dataset.option);
    if (parentMenu.id === "testing") updateTestingLED(optBtn.dataset.option);
    if (parentMenu.id === "status") updateStatusLED(optBtn.dataset.option);
    if (parentMenu.id === "events") updateEventLED(optBtn.dataset.option);

    // Umami tracking: Track menu option selection
    trackEvent('Menu_Option_Selected', { 
      menu: parentMenu.id, 
      option: optBtn.dataset.option 
    });

    try { beep(880, 0.06, 0.04); } catch (e) { }

    parentMenu.classList.remove('show');
    parentMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (parentMenu.id === 'alarm') wrapEl.classList.remove('threat-open');
  });
});

// ALARM LED
function updateLED(level) {
  const btn = document.querySelector('.menu-btn[data-menu="alarm"]');
  const led = btn.querySelector('.led');
  led.className = 'led';
  led.style.opacity = 1;
  led.classList.remove('blink');
  btn.style.boxShadow = "none";

  let color = "rgba(255, 0, 0, 0.16)";

  if (level === "HIGH") {
    led.classList.add('high', 'blink');
    color = "#ff0000ff";
  } else if (level === "MEDIUM") {
    led.classList.add('medium');
    color = "yellow";
  } else if (level === "LOW") {
    led.classList.add('low');
    color = "#00ff66";
  }

  btn.style.setProperty('--anim-color', color);
  btn.classList.remove('border-active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      btn.classList.add('border-active');
    });
  });
}

// TESTING LED
function updateTestingLED(level) {
  const btn = document.querySelector('.menu-btn[data-menu="testing"]');
  const led = btn.querySelector('.led');
  led.className = 'led';
  led.style.opacity = 1;
  led.classList.remove('blink');
  btn.style.boxShadow = "none";

  let color = "rgba(255, 0, 0, 0.16)";

  if (level.startsWith("ALLOWED")) {
    led.classList.add('allowed');
    color = "#00ff66";
  } else if (level === "PROHIBITED") {
    led.classList.add('prohibited', 'blink');
    color = "#ff0000ff";
  }
  btn.style.setProperty('--anim-color', color);
  btn.classList.remove('border-active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      btn.classList.add('border-active');
    });
  });
}
function updateEventLED(value) {
  const btn = document.querySelector('.menu-btn[data-menu="events"]');
  const led = btn.querySelector('.led');

  // Reset LED
  led.className = "led";
  led.style.opacity = 1;
  led.style.backgroundColor = "";

  let color = "#ff1e1e";

  if (value === "CLASS-D RIOT") {
    color = "#ff6600";
    led.classList.add("blink");
    led.style.backgroundColor = color;
  } else {
    led.classList.add("prohibited", "blink");
  }

  btn.style.setProperty('--anim-color', color);
  btn.classList.remove('border-active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      btn.classList.add('border-active');
    });
  });
}

// STATUS LED
function updateStatusLED(status) {
  const menuBtn = document.querySelector('.menu-btn[data-menu="status"]');
  const caret = menuBtn.querySelector('.caret')?.outerHTML || "";
  
  let color = "#555";
  let shadow = "none";
  let blinkClass = "";

  // Reset
  menuBtn.style.boxShadow = "none";

  switch (status) {
    case "SCP BREACH":
      color = "#ff0000ff";
      blinkClass = " blink";
      break;
    case "SITE LOCKDOWN":
      color = "#9900ffff";
      blinkClass = " blink";
      break;
    case "CLASS-D ESCAPE":
      color = "#ff6600";
      blinkClass = " blink";
      break;
    case "CHAOS INSURGENCY":
      color = "#00b7ffff";
      blinkClass = " blink";
      break;
    case "NUCLEAR PROTOCOL":
      color = "#ff0000ff";
      blinkClass = " blink";
      break;
    case "CLEAR":
      color = "#00ff00";
      break;
  }

  menuBtn.innerHTML = `<span class="led${blinkClass}" style="background-color: ${color}; box-shadow: ${shadow}; opacity: 1;"></span>${status}${caret}`;

  menuBtn.style.setProperty('--anim-color', color);
  document.body.style.setProperty('--fog-color', color);
  menuBtn.classList.remove('border-active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      menuBtn.classList.add('border-active');
    });
  });
}

function getMenuText(menuId) {
  const menuBtn = document.querySelector(`.menu-btn[data-menu="${menuId}"]`);
  if (!menuBtn) return "N/A";
  for (let node of menuBtn.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.trim();
    }
  }
  return "N/A";
}

// GENERATE BROADCAST
document.getElementById('generateBtn')?.addEventListener('click', () => {
  const warningEl = document.getElementById('noParamsWarning');
  const lengthWarningEl = document.getElementById('lengthWarning');

  // limpiar aviso antes
  warningEl.style.display = "none";
  if (lengthWarningEl) lengthWarningEl.style.display = "none";
  outputEl.style.borderColor = "";

  const alarm = getMenuText("alarm");
  const status = getMenuText("status").toUpperCase();
  let testingRaw = getMenuText("testing");
  const idOption = document.getElementById("idCheck").checked;
  const containmentOption = document.getElementById("containmentCheck").checked;


  // Normalización del TESTING para broadcast
  let testing = "";
  if (testingRaw.toUpperCase() === "ALLOWED") testing = "ALLOWED";
  else if (testingRaw.toUpperCase() === "PROHIBITED") testing = "PROHIBITED";

  const statusMessages = {
    "SCP BREACH": "All personnel must initiate containment protocols immediately. Follow all emergency procedures",
    "SITE LOCKDOWN": "Site lockdown initiated armed teams are to respond and await further instructions",
    "CLASS-D ESCAPE": "Class-D personnel have escaped containment. All staff stay alert",
    "CHAOS INSURGENCY": "Chaos Insurgency activity detected. All armed personnel proceed to intercept and contain threats",
    "NUCLEAR PROTOCOL": "All personnel must evacuate to shelters immediately. Failure to comply will result in fatality",
    "CLEAR": "All personnel resume normal duties",
  };
  const eventMessages = {
    "610 EVENT": "SCP-610 anomaly active. Avoid exposure. Containment and quarantine teams deploy immediately",
    "076 EVENT": "SCP-076 containment breach. Armed response teams engage immediately with heavy gunfire",
    "CLASS-D RIOT": "Class-D personnel are rioting. Security teams must contain the situation immediately",
    "323 BREACH": "SCP-323 containment All personnel evacuate immediately. Response teams engage with full-force authorization."

  };

  let customMessage = "";

  // EVENTO seleccionado
  const eventSelected = getMenuText("events").toUpperCase();

  // 🔥 PRIORIDAD DE EVENTOS SOBRE STATUS
  if (
    // Regla 1: SCP BREACH + 076 o 610 → solo evento
    (status === "SCP BREACH" &&
      (eventSelected === "076 EVENT" || eventSelected === "610 EVENT" || eventSelected === "323 BREACH")) ||

    // Regla 2: CLASS-D ESCAPE + CLASS-D RIOT → solo evento
    (status === "CLASS-D ESCAPE" &&
      (eventSelected === "CLASS-D RIOT")) ||

    //Regla 3:Site lockdown + 076 o 610 --> custom mssg
    (status === "SITE LOCKDOWN" &&
      (eventSelected === "076 EVENT" || eventSelected === "610 EVENT"))

  ) {
    customMessage = eventMessages[eventSelected] || "";
  }
  else {
    // Normal: mensaje del status primero
    customMessage = statusMessages[status] || "";

    // Añadir mensaje del evento si existe
    if (eventMessages[eventSelected]) {
      customMessage += " | " + eventMessages[eventSelected];
    }
  }



  // -------- CONTAINMENT + INFECTIOUS SCP COMBINED LOGIC --------

  // recopilar SCPs activados
  let activeSCPs = [];

  if (document.getElementById("scp035").checked) {
    activeSCPs.push("mask");
  }
  if (document.getElementById("scp008").checked) {
    activeSCPs.push("008");
  }
  if (document.getElementById("scp409").checked) {
    activeSCPs.push("crystal");
  }
  if (document.getElementById("scp701").checked) {
    activeSCPs.push("701");
  }

  let containmentOn = document.getElementById("containmentCheck").checked;

  // *** Construcción correcta del mensaje ***
  if (containmentOn) {
    if (activeSCPs.length > 0) {
      customMessage += ` | CON-X+, ${activeSCPs.join(", ")} testing requires SID+ authorization`;
    } else {
      customMessage += ` | CON-X+ testing requires SID+ authorization`;
    }
  } else {
    if (activeSCPs.length > 0) {
      customMessage += ` | ${activeSCPs.join(", ")} testing requires SID+ authorization`;
    }
  }

  // ID REQUIREMENT
  if (idOption) customMessage += " | Present identification at CP";

  let parts = [];

  // STATUS
  if (status && status !== "SELECT") {
    parts.push(`Site Status: ${status}`);
  }

  // THREAT
  if (alarm && alarm !== "SELECT") {
    parts.push(`Threat: ${alarm}`);
  }

  // TESTING
  if (testing && testing !== "SELECT") {
    parts.push(`Testing: ${testing}`);
  }

  // 🚨 SI NO HAY PARÁMETROS
  if (parts.length === 0) {
    outputEl.value = "";
    updateCharCounter();
    warningEl.style.display = "block";
    try { beep(220, 0.15, 0.08); } catch (e) { }
    return;
  }


  // MENSAJE FINAL
  if (customMessage) {
    parts.push(customMessage);
  }

  // SI NO HAY NADA → NO GENERAR
  if (parts.length === 0) {
    outputEl.value = "";
    updateCharCounter();
    return;
  }

  // BROADCAST FINAL
  outputEl.value = `/broadcast ${parts.join(" | ")}`;

  // Check length limit (200 chars)
  if (outputEl.value.length > 200) {
    if (lengthWarningEl) {
      lengthWarningEl.style.display = "block";
      lengthWarningEl.textContent = `⚠ WARNING: EXCEEDS 200 CHARACTERS (${outputEl.value.length}/200)`;
    }
    outputEl.style.borderColor = "#ffaa00";
  }
  updateCharCounter();

  // Trigger Flash Animation
  outputEl.classList.remove('flash');
  void outputEl.offsetWidth; // Force reflow to restart animation
  outputEl.classList.add('flash');

  // Umami tracking: Track broadcast generation
  trackEvent('Generate_Button_Clicked', { 
    hasAlarm: alarm !== 'SELECT',
    hasStatus: status !== 'SELECT',
    hasTesting: testing !== 'SELECT',
    characterCount: outputEl.value.length
  });

  playAlert(alarm);
});


// COPY
document.getElementById('copyBtn')?.addEventListener('click', () => {
  if (!outputEl.value.trim()) { alert('No hay texto para copiar.'); return; }
  outputEl.select();
  navigator.clipboard?.writeText(outputEl.value)
    .then(() => {
      const copyBtn = document.getElementById('copyBtn');
      copyBtn.textContent = 'COPIED!';
      setTimeout(() => copyBtn.textContent = 'COPY', 1000);
      
      // Umami tracking: Track copy action
      trackEvent('Copy_Button_Clicked', { 
        characterCount: outputEl.value.length 
      });
    })
    .catch(() => {
      document.execCommand('copy');
      const copyBtn = document.getElementById('copyBtn');
      copyBtn.textContent = 'COPIED!';
      setTimeout(() => copyBtn.textContent = 'COPY', 1000);
      
      // Umami tracking: Track copy action (fallback)
      trackEvent('Copy_Button_Clicked', { 
        characterCount: outputEl.value.length,
        method: 'fallback'
      });
    });
});

// CLEAR ALL
document.getElementById('clearBtn')?.addEventListener('click', () => {
  outputEl.value = '';
  updateCharCounter();

  // Hide warning if visible
  document.getElementById('noParamsWarning').style.display = 'none';
  const lengthWarningEl = document.getElementById('lengthWarning');
  if (lengthWarningEl) lengthWarningEl.style.display = 'none';
  outputEl.style.borderColor = "";

  menuButtons.forEach(btn => {
    const menuId = btn.getAttribute('data-menu');
    btn.innerHTML = originalButtonHTML[menuId];
  });

  document.querySelectorAll('.led').forEach(led => {
    led.style.opacity = 1;
    led.classList.remove('blink');
  });

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.style.removeProperty('--anim-color');
    btn.classList.remove('border-active');
    btn.style.boxShadow = "";
  });
  document.body.style.removeProperty('--fog-color');

  // Reset checkboxes
  document.getElementById("idCheck").checked = false;
  document.getElementById("scp008").checked = false;
  document.getElementById("scp409").checked = false;
  document.getElementById("scp701").checked = false;
  document.getElementById("scp035").checked = false;
  document.getElementById("containmentCheck").checked = false;
  
  // Umami tracking: Track clear action
  trackEvent('Clear_Button_Clicked', { page: 'broadcast_simple' });
});
// MODE SWITCH - SIMPLE PAGE
const switchBtn = document.getElementById("modeSwitch");

// Simple mode → slider OFF, Advanced mode → slider ON
// For simple page, slider starts OFF:
switchBtn.classList.remove("active");

switchBtn.addEventListener("click", () => {
  // Umami tracking: Track mode switch
  trackNavigation('broadcast_advanced', 'broadcast_simple');
  trackEvent('Mode_Switch_Clicked', { from: 'simple', to: 'advanced' });
  
  window.location.href = "../advanced/index.html";
});

let classifiedMode = false;

function enableClassified() {
  classifiedMode = true;
  document.body.classList.add("classified");
}

function disableClassified() {
  classifiedMode = false;
  document.body.classList.remove("classified");
}

// --- UI SOUNDS ---
function playHoverSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  // High pitch, short, low volume (Tech chirp)
  beep(1200, 0.01, 0.02);
}

function playClickSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  // Mechanical click sound (lower pitch)
  beep(300, 0.03, 0.05);
}

const uiElements = document.querySelectorAll(
  '.menu-btn, .action-btn, .primary, .checkbox-btn, .mode-toggle, .mode-toggle-bottom, .back-btn, .menu-list button'
);

uiElements.forEach(el => {
  el.addEventListener('mouseenter', playHoverSound);
  el.addEventListener('click', playClickSound);
});

// Umami tracking: Track checkbox changes
const checkboxes = {
  'scp035': 'SCP035',
  'scp008': 'SCP008',
  'scp409': 'SCP409',
  'scp701': 'SCP701',
  'containmentCheck': 'CON-X',
  'idCheck': 'ID'
};

Object.entries(checkboxes).forEach(([id, name]) => {
  const checkbox = document.getElementById(id);
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      trackEvent('Checkbox_Toggled', { 
        checkbox: name, 
        checked: checkbox.checked 
      });
    });
  }
});

// Umami tracking: Track Back button click
const backBtn = document.getElementById('backBtn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    trackNavigation('home', 'broadcast_simple');
    trackEvent('Back_Button_Clicked', { from: 'broadcast_simple' });
    window.location.href = '../../home/index.html';
  });
}
