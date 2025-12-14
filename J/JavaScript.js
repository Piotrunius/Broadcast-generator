import { BroadcastGenerator } from './engine/broadcast-generator.js';
import { AudioManager } from './utils/audio-manager.js';

const generator = new BroadcastGenerator();
const audioManager = new AudioManager();

// Helpers
const menuButtons = document.querySelectorAll('.menu-btn');
const allLists = document.querySelectorAll('.menu-list');
const outputEl = document.getElementById('output');
const originalButtonHTML = {};

menuButtons.forEach(btn => {
  const menuId = btn.getAttribute('data-menu');
  originalButtonHTML[menuId] = btn.innerHTML;
  
  // Add hover listener
  btn.addEventListener('mouseenter', () => audioManager.playHover());
});

// Toggle menu
menuButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const menuId = btn.getAttribute('data-menu');
    const list = document.querySelector(`.menu-list#${menuId}`);
    allLists.forEach(l=>{
      if(l !== list){
        l.classList.remove('show');
        const b = document.querySelector(`.menu-btn[data-menu="${l.dataset.menu}"]`);
        if(b) b.setAttribute('aria-expanded','false');
        l.setAttribute('aria-hidden','true');
      }
    });
    const isShown = list.classList.contains('show');
    if(isShown){
      list.classList.remove('show');
      btn.setAttribute('aria-expanded','false');
      list.setAttribute('aria-hidden','true');
    } else {
      list.classList.add('show');
      btn.setAttribute('aria-expanded','true');
      list.setAttribute('aria-hidden','false');
    }
    audioManager.playToggle(); 
  });
});

// Click outside
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.menu')){
    allLists.forEach(l=>{
      l.classList.remove('show');
      l.setAttribute('aria-hidden','true');
      const b = document.querySelector(`.menu-btn[data-menu="${l.dataset.menu}"]`);
      if(b) b.setAttribute('aria-expanded','false');
    });
  }
});

// Estado de parpadeo sincronizado
let blinkVisible = true;
let blinkInterval = setInterval(() => {
  document.querySelectorAll('.led.blink').forEach(led=>{
    led.style.opacity = blinkVisible ? 1 : 0;
  });
  blinkVisible = !blinkVisible;
}, 200);

// Actualizar LEDs al seleccionar opción
document.querySelectorAll('.menu-list button').forEach(optBtn => {
  // Add hover listener
  optBtn.addEventListener('mouseenter', () => audioManager.playHover());

  optBtn.addEventListener('click', () => {
    let text = optBtn.getAttribute('data-option');
    const parentMenu = optBtn.closest('.menu-list');
    const menuBtn = document.querySelector(`.menu-btn[data-menu="${parentMenu.id}"]`);
    const ledOrIcon = menuBtn.querySelector('.led, .icon')?.outerHTML || '';
    const caret = menuBtn.querySelector('.caret')?.outerHTML || '';

    // Convertir en dos líneas si contiene paréntesis
    if(text.includes("(")) {
      let parts = text.split("(");
      text = `${parts[0].trim()}<br>(${parts[1]}`;
    }

    menuBtn.innerHTML = `${ledOrIcon}${text}${caret}`;

    if(parentMenu.id === "alarm") updateLED(optBtn.dataset.option);
    if(parentMenu.id === "testing") updateTestingLED(optBtn.dataset.option);
    if(parentMenu.id === "status") updateStatusIcon(optBtn.dataset.option);
    if(parentMenu.id === "events") updateEventLED(optBtn.dataset.option);

    audioManager.playClick();

    parentMenu.classList.remove('show');
    parentMenu.setAttribute('aria-hidden','true');
    menuBtn.setAttribute('aria-expanded','false');
  });
});

// Checkboxes hover effect (Simple version has separate checkboxes)
document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const container = cb.closest('div') || cb.parentElement; 
    // In simple version, they might just be inputs. Let's check HTML if needed, but adding to parent is safe.
    if(container) container.addEventListener('mouseenter', () => audioManager.playHover());
    
    cb.addEventListener('change', () => audioManager.playClick());
});


// ALARM LED
function updateLED(level){
  const led = document.querySelector('.menu-btn[data-menu="alarm"] .led');
  led.className = 'led';
  led.style.opacity = 1;
  led.classList.remove('blink');

  if(level === "HIGH") led.classList.add('high', 'blink');
  else if(level === "MEDIUM") led.classList.add('medium');
  else if(level === "LOW") led.classList.add('low');
}

// TESTING LED
function updateTestingLED(level){
  const led = document.querySelector('.menu-btn[data-menu="testing"] .led');
  led.className = 'led';
  led.style.opacity = 1;
  led.classList.remove('blink');

  if(level.startsWith("ALLOWED")) led.classList.add('allowed');
  else if(level === "PROHIBITED") led.classList.add('prohibited', 'blink');
}
function updateEventLED(value){
    const led = document.querySelector('.menu-btn[data-menu="events"] .led');

    // Reset LED
    led.className = "led";
    led.style.opacity = 1;

    // Siempre rojo + parpadeo
    led.classList.add("prohibited", "blink");
}

// STATUS iconos
function updateStatusIcon(status){
    const menuBtn = document.querySelector('.menu-btn[data-menu="status"]');
    const iconHTML = getStatusIconHTML(status);
    const caret = menuBtn.querySelector('.caret')?.outerHTML || "";

    menuBtn.innerHTML = `<span class="icon">${iconHTML}</span>${status}${caret}`;
}

function getStatusIconHTML(status){
    switch(status){

        case "SCP BREACH":
            return `<img src="iconos/breach.png">`;

        case "SITE LOCKDOWN":
            return `<img src="iconos/lockdown.png">`;

        case "CLASS-D ESCAPE":
            return `<img src="iconos/class-descape.png">`;

        case "CLASS-D RIOT":
            return `<img src="iconos/riot.png">`;

        case "CHAOS INSURGENCY":
            return `<img src="iconos/chaosinsurgency.png">`;

        case "610 EVENT":
            return `<img src="iconos/610.png">`;

        case "076 EVENT":
            return `<img src="iconos/abel.png">`;

        case "NUCLEAR PROTOCOL":
            return `<img src="iconos/nuke.png">`;

        case "CLEAR":
            return `<img src="iconos/clear.png">`;

        default:
            return "";
    }
}

function getMenuText(menuId){
  const menuBtn = document.querySelector(`.menu-btn[data-menu="${menuId}"]`);
  if(!menuBtn) return "N/A";
  for(let node of menuBtn.childNodes){
    if(node.nodeType === Node.TEXT_NODE){
      return node.textContent.trim();
    }
  }
  return "N/A";
}

// GENERATE BROADCAST
const generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
    generateBtn.addEventListener('mouseenter', () => audioManager.playHover());
    
    generateBtn.addEventListener('click', ()=>{

      const alarm = getMenuText("alarm");
      const status = getMenuText("status").toUpperCase();
      let testingRaw = getMenuText("testing");
      
      let testing = "";
      if(testingRaw.toUpperCase() === "ALLOWED") testing = "ALLOWED";
      else if(testingRaw.toUpperCase() === "PROHIBITED") testing = "PROHIBITED";
      else testing = testingRaw;

      const eventSelected = getMenuText("events");
      const events = [];
      if (eventSelected && eventSelected !== "SELECT EVENT" && eventSelected !== "N/A") {
          events.push(eventSelected);
      }

      const requirements = {
          idCheck: document.getElementById("idCheck").checked,
          conX: document.getElementById("containmentCheck").checked,
          scp035: document.getElementById("scp035").checked,
          scp008: document.getElementById("scp008").checked,
          scp409: document.getElementById("scp409").checked,
          scp701: document.getElementById("scp701").checked
      };

      const options = {
          status,
          alarm,
          testing,
          events,
          breachedSCPs: [],
          requirements,
          customText: ""
      };

      const broadcast = generator.generate(options);
      outputEl.value = broadcast;

      audioManager.playAlert(alarm);
    });
}


// COPY
const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
    copyBtn.addEventListener('mouseenter', () => audioManager.playHover());
    
    copyBtn.addEventListener('click', ()=>{
      if(!outputEl.value.trim()) { 
          // alert('No hay texto para copiar.'); 
          audioManager.playError();
          return; 
      }
      outputEl.select();
      navigator.clipboard?.writeText(outputEl.value)
        .then(()=> {
          const copyBtn = document.getElementById('copyBtn');
          copyBtn.textContent = 'COPIED!';
          setTimeout(()=> copyBtn.textContent = 'COPY',1000);
          audioManager.playSuccess();
        })
        .catch(()=> {
          document.execCommand('copy');
          const copyBtn = document.getElementById('copyBtn');
          copyBtn.textContent = 'COPIED!';
          setTimeout(()=> copyBtn.textContent = 'COPY',1000);
          audioManager.playSuccess();
        });
    });
}

// CLEAR ALL
const clearBtn = document.getElementById('clearBtn');
if(clearBtn) {
    clearBtn.addEventListener('mouseenter', () => audioManager.playHover());

    clearBtn.addEventListener('click', ()=>{
      // Clear old timeouts/intervals first
      const maxTimeoutId = setTimeout(() => {}, 0);
      clearTimeout(maxTimeoutId);
      
      for (let i = 1; i < maxTimeoutId; i++) {
        window.clearTimeout(i);
        window.clearInterval(i);
      }

      // Play sound AFTER clearing
      try {
        audioManager.playSuccess();
      } catch(e) {
        console.log('Audio error:', e);
      }

      // Clear output
      outputEl.value = '';
      outputEl.style.cssText = '';

      // Reset menu buttons
      menuButtons.forEach(btn=>{
        const menuId = btn.getAttribute('data-menu');
        btn.innerHTML = originalButtonHTML[menuId];
        btn.classList.remove('selected');
      });

      // Reset all LEDs
      document.querySelectorAll('.led').forEach(led=>{
        led.className = 'led';
        led.style.opacity = 1;
        led.classList.remove('blink');
        led.style.backgroundColor = '';
        led.style.boxShadow = '';
      });

      // Uncheck all checkboxes
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });

      // Update character counter if exists
      if (window.updateCharCounter) {
        window.updateCharCounter();
      }

      // Force UI refresh
      document.body.offsetHeight;

      console.log('✓ All cleared - state reset to zero');
    });
}

// MODE SWITCH - SIMPLE PAGE
const switchBtn = document.getElementById("modeSwitch");

switchBtn.classList.remove("active");
switchBtn.addEventListener('mouseenter', () => audioManager.playHover());

switchBtn.addEventListener("click", () => {
  window.location.href = "advanced.html";
});