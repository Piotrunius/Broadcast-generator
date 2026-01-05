import { AudioManager } from '../../utils/audio-manager.js';

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
    if (parentMenu.id === "status") updateStatusIcon(optBtn.dataset.option);
    if (parentMenu.id === "events") updateEventLED(optBtn.dataset.option);


    try { beep(880, 0.06, 0.04); } catch (e) { }

    parentMenu.classList.remove('show');
    parentMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (parentMenu.id === 'alarm') wrapEl.classList.remove('threat-open');
  });
});

// ALARM LED
function updateLED(level) {
  const led = document.querySelector('.menu-btn[data-menu="alarm"] .led');
  led.className = 'led';
  led.style.opacity = 1;
  led.classList.remove('blink');

  if (level === "HIGH") led.classList.add('high', 'blink');
  else if (level === "MEDIUM") led.classList.add('medium');
  else if (level === "LOW") led.classList.add('low');
}

// TESTING LED
function updateTestingLED(level) {
  const led = document.querySelector('.menu-btn[data-menu="testing"] .led');
  led.className = 'led';
  led.style.opacity = 1;
  led.classList.remove('blink');

  if (level.startsWith("ALLOWED")) led.classList.add('allowed');
  else if (level === "PROHIBITED") led.classList.add('prohibited', 'blink');
}
function updateEventLED(value) {
  const led = document.querySelector('.menu-btn[data-menu="events"] .led');

  // Reset LED
  led.className = "led";
  led.style.opacity = 1;

  // Siempre rojo + parpadeo
  led.classList.add("prohibited", "blink");
}

// STATUS iconos
function updateStatusIcon(status) {
  const menuBtn = document.querySelector('.menu-btn[data-menu="status"]');
  const iconHTML = getStatusIconHTML(status);
  const caret = menuBtn.querySelector('.caret')?.outerHTML || "";

  menuBtn.innerHTML = `<span class="icon">${iconHTML}</span>${status}${caret}`;
}

function getStatusIconHTML(status) {
  switch (status) {

    case "SCP BREACH":
      return `<img src="../../../../assets/icons/breach.png">`;

    case "SITE LOCKDOWN":
      return `<img src="../../../../assets/icons/lockdown.png">`;

    case "CLASS-D ESCAPE":
      return `<img src="../../../../assets/icons/class-descape.png">`;

    case "CLASS-D RIOT":
      return `<img src="../../../../assets/icons/riot.png">`;

    case "CHAOS INSURGENCY":
      return `<img src="../../../../assets/icons/chaosinsurgency.png">`;

    case "610 EVENT":
      return `<img src="../../../../assets/icons/610.png">`;

    case "076 EVENT":
      return `<img src="../../../../assets/icons/abel.png">`;

    case "NUCLEAR PROTOCOL":
      return `<img src="../../../../assets/icons/nuke.png">`;

    case "CLEAR":
      return `<img src="../../../../assets/icons/clear.png">`;

    default:
      return "";
  }
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

  // Trigger Flash Animation
  outputEl.classList.remove('flash');
  void outputEl.offsetWidth; // Force reflow to restart animation
  outputEl.classList.add('flash');

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
    })
    .catch(() => {
      document.execCommand('copy');
      const copyBtn = document.getElementById('copyBtn');
      copyBtn.textContent = 'COPIED!';
      setTimeout(() => copyBtn.textContent = 'COPY', 1000);
    });
});

// CLEAR ALL
document.getElementById('clearBtn')?.addEventListener('click', () => {
  outputEl.value = '';

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

  // Reset checkboxes
  document.getElementById("idCheck").checked = false;
  document.getElementById("scp008").checked = false;
  document.getElementById("scp409").checked = false;
  document.getElementById("scp701").checked = false;
  document.getElementById("scp035").checked = false;
  document.getElementById("containmentCheck").checked = false;
});
// MODE SWITCH - SIMPLE PAGE
const switchBtn = document.getElementById("modeSwitch");

// Simple mode → slider OFF, Advanced mode → slider ON
// For simple page, slider starts OFF:
switchBtn.classList.remove("active");

switchBtn.addEventListener("click", () => {
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
