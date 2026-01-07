import { AudioManager } from '../utils/audio-manager.js';
import { RAW_RECIPES } from './data/scp-recipes.js';
import { trackEvent, trackNavigation } from '../utils/umami-tracker.js'; // Umami tracking

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

const uiElements = document.querySelectorAll('.primary, .btn-clear, .back-btn');
uiElements.forEach(el => {
  el.addEventListener('mouseenter', playHoverSound);
  el.addEventListener('click', playClickSound);
});

// ================================
//  SCP-914 ROUTE CALCULATOR + SEARCH MENUS
// ================================

// ========= PARSE DE RECETAS Y GRAFO =========
const TRANSFORMATIONS = RAW_RECIPES.split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('//'))
  .map((line) => {
    const [input, setting, output] = line.split('|').map((s) => s.trim());
    return { input, setting, output };
  });

const adjacency = {};
const allItemsSet = new Set();

for (const t of TRANSFORMATIONS) {
  if (!adjacency[t.input]) adjacency[t.input] = [];
  adjacency[t.input].push({ to: t.output, setting: t.setting });
  allItemsSet.add(t.input);
  allItemsSet.add(t.output);
}

// No tiene sentido elegir "None" como item
allItemsSet.delete('None');
const ALL_ITEMS = Array.from(allItemsSet).sort();

// ========= AUTOCOMPLETE + VALIDACIÓN =========

// Valida y cambia el color del borde dinamicamente
function validateInput(container) {
  const input = container.querySelector('input');
  const text = input.value.trim().toLowerCase();

  if (text === '') {
    container.classList.remove('valid', 'invalid');
    return;
  }

  if (ALL_ITEMS.some((i) => i.toLowerCase() === text)) {
    container.classList.add('valid');
    container.classList.remove('invalid');
  } else {
    container.classList.add('invalid');
    container.classList.remove('valid');
  }
}

// Autocomplete + lista filtrada
function setupSearchDropdown(id) {
  const box = document.getElementById(id);
  const input = box.querySelector('input');
  const list = box.querySelector('ul');

  // Add hover effect to the input box container maybe? or just input focus
  input.addEventListener('focus', () => playHoverSound());
  input.addEventListener('input', () => beep(1200, 0.005, 0.01));

  function updateList() {
    const query = input.value.toLowerCase();
    list.innerHTML = '';

    const filtered = ALL_ITEMS.filter((i) => i.toLowerCase().includes(query));

    filtered.forEach((item) => {
      let li = document.createElement('li');
      li.textContent = item;

      // Hover effect for list items
      li.addEventListener('mouseenter', () => playHoverSound());

      li.onclick = () => {
        input.value = item;
        validateInput(box);
        list.classList.remove('show');
        playClickSound();
      };
      list.appendChild(li);
    });

    if (filtered.length > 0) list.classList.add('show');
    else list.classList.remove('show');

    validateInput(box);
  }

  input.addEventListener('input', updateList);
  input.addEventListener('focus', updateList);

  // Click to clear output (requested behavior)
  input.addEventListener('click', () => {
    if ((id === 'outputSelect' || id === 'inputSelect') && input.value) {
      input.value = '';
      updateList();
    }
  });

  // =====================
  //  ENTER + TAB AUTOFILL
  // =====================
  input.addEventListener('keydown', (e) => {
    // TAB mantiene autocomplete como antes
    if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = list.querySelectorAll('li');

      if (suggestions.length > 0) {
        input.value = suggestions[0].textContent; // autocompleta primer item
        validateInput(box);
        list.classList.remove('show');
        playClickSound();
      }
      return;
    }

    // ENTER YA NO AUTOCOMPLETA — AHORA CALCULA RUTA
    if (e.key === 'Enter') {
      e.preventDefault();
      // Simula presionar el botón CALCULATE PATH
      document.getElementById('calcBtn')?.click();
      return;
    }
  });

  // cerrar lista si haces clic fuera
  document.addEventListener('click', (e) => {
    if (!box.contains(e.target)) {
      list.classList.remove('show');
    }
  });
}

// Inicializar INPUT y OUTPUT (asegúrate de que en el HTML existen estos IDs)
setupSearchDropdown('inputSelect');
setupSearchDropdown('outputSelect');

// ========= CLEAR BUTTON =========
const clearBtn = document.getElementById('clearFields');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {

    document.querySelector('#inputSelect input').value = '';
    document.querySelector('#outputSelect input').value = '';

    document.querySelectorAll('.search-select').forEach((box) => {
      box.classList.remove('valid', 'invalid');
    });

    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.textContent = '';
    
    // Umami tracking: Track clear action in SCP-914
    trackEvent('Clear_Button_Clicked', { page: 'scp914' });
  });
}

// ========= REFERENCIAS DEL BOTÓN Y CONSOLA =========
const calcBtn = document.getElementById('calcBtn');
const resultEl = document.getElementById('result');


// ============================================================
// 🔥 RUTA INTELIGENTE — Busca la forma más corta hasta llegar
// ============================================================
function findSmartRoute(start, goal) {
  if (start === goal) return [];

  const queue = [start];
  const visited = new Map();

  // Guardamos siempre un objeto { from, setting }
  visited.set(start, { from: null, setting: null });

  while (queue.length) {
    const current = queue.shift();
    const edges = adjacency[current] || [];

    for (const edge of edges) {
      const next = edge.to;

      if (!visited.has(next)) {
        visited.set(next, { from: current, setting: edge.setting });

        // 🎯 Llegamos al objetivo: reconstruir ruta
        if (next === goal) {
          const path = [];
          let node = goal;

          // Vamos hacia atrás desde goal → start
          while (visited.get(node).from !== null) {
            const info = visited.get(node);
            path.push({
              from: info.from,
              to: node,
              setting: info.setting,
            });
            node = info.from;
          }

          return path.reverse(); // orden correcto de start → goal
        }

        queue.push(next);
      }
    }
  }

  // No hay ninguna forma de llegar
  return null;
}

function findAllRoutesTo(goal) {
  const reverseAdj = {};
  // 1. Build Reverse Graph
  for (const [input, edges] of Object.entries(adjacency)) {
    for (const edge of edges) {
      if (!reverseAdj[edge.to]) reverseAdj[edge.to] = [];
      reverseAdj[edge.to].push({ from: input, setting: edge.setting });
    }
  }

  const allPaths = [];
  // Queue stores: { node, route: [ { from, setting, to }, ... ] }
  const queue = [{ node: goal, route: [] }];
  const visited = new Set([goal]);

  while (queue.length > 0) {
    const { node, route } = queue.shift();

    if (node !== goal) {
      allPaths.push({ start: node, route: route });
    }

    const parents = reverseAdj[node] || [];
    for (const p of parents) {
      if (!visited.has(p.from)) {
        visited.add(p.from);
        const newStep = { from: p.from, setting: p.setting, to: node };
        queue.push({ node: p.from, route: [newStep, ...route] });
      }
    }
  }
  return allPaths.sort((a, b) => a.route.length - b.route.length);
}

// Convertir modos en colores automáticos COMPLETO y CORRECTO
function styleSetting(text) {
  return text
    .replace(/\bVery Fine\b/g, `<span class='veryfine'>Very Fine</span>`)
    .replace(/\bFine\b(?!<\/span>)/g, `<span class='fine'>Fine</span>`)
    .replace(/\bRough\b/g, `<span class='rough'>Rough</span>`)
    .replace(/\b1:1\b/g, `<span class='equal'>1:1</span>`);
}

// 📄 NUEVO FORMATO COLOR SCP
function highlightItem(name) {
  return `<span class="selected-item">${name}</span>`;
}

function formatSmartRoute(start, goal, route) {
  if (!route) {
    return `<pre>❌ No route found from "${start}" to "${goal}".</pre>`;
  }
  if (route.length === 0) {
    return `<pre>INPUT = OUTPUT\nNo refinement required.</pre>`;
  }

  const startLabel = highlightItem(start);
  const goalLabel = highlightItem(goal);

  let out = `<pre>======   SCP-914 RECIPE ROUTE REPORT   ======\n\n`;
  out += `STEPS   ➜  ${route.length}\n`;
  out += `PROCESS PATH:\n\n`;

  route.forEach((step, i) => {
    // si el from/to coincide con start/goal, lo pintamos en amarillo
    const fromLabel = step.from === start ? startLabel : step.from === goal ? goalLabel : step.from;

    const toLabel = step.to === goal ? goalLabel : step.to === start ? startLabel : step.to;

    out += `${i + 1}. ${fromLabel}\n`;
    out += `    └─► ${styleSetting(step.setting)}  ➜  ${toLabel}\n\n`;
  });

  return out;
}

// ========== BOTÓN CALCULATE — usa la ruta inteligente ==========
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const inputVal = document.querySelector('#inputSelect input')?.value.trim();
    const outputVal = document.querySelector('#outputSelect input')?.value.trim();

    // ➤ Caso 1: Nada seleccionado
    if (!inputVal && !outputVal) {
      resultEl.innerHTML = '<pre>⚠ Enter at least OUTPUT.</pre>';
      playError();
      return;
    }

    // ➤ Caso 2: Solo OUTPUT → mostrar combinaciones directas disponibles
    if (!inputVal && outputVal) {
      const allRoutes = findAllRoutesTo(outputVal);

      if (allRoutes.length === 0) {
        resultEl.innerHTML = `<pre>❌ No recipes found to create "${outputVal}".</pre>`;
        playError();
        return;
      }

      // Group by step count
      const bySteps = {};
      allRoutes.forEach(r => {
        const steps = r.route.length;
        if (!bySteps[steps]) bySteps[steps] = [];
        bySteps[steps].push(r);
      });

      let out = `<pre>====== ALL RECIPES FOR: ${outputVal} ======`;

      Object.keys(bySteps).sort((a, b) => a - b).forEach(steps => {
        const group = bySteps[steps];
        const sLabel = steps == 1 ? "STEP" : "STEPS";
        out += `\n\n[ ${steps} ${sLabel} ]\n`;

        group.forEach(item => {
          item.route.forEach((step, i) => {
            if (i === 0) {
              out += `• ${highlightItem(step.from)} ➜ ${styleSetting(step.setting)} ➜ ${highlightItem(step.to)}\n`;
            } else {
              const indent = "   ".repeat(i);
              out += ` ${indent} - ${highlightItem(step.from)} ➜ ${styleSetting(step.setting)} ➜ ${highlightItem(step.to)}\n`;
            }
          });
          out += '\n';
        });
      });

      out += `=================================================</pre>`;

      resultEl.innerHTML = out;
      playSuccess();
      return;
    }

    // ➤ Caso normal INPUT + OUTPUT → ruta inteligente
    const route = findSmartRoute(inputVal, outputVal);
    resultEl.innerHTML = formatSmartRoute(inputVal, outputVal, route);

    if (!route) {
      playError();
    } else {
      playSuccess();
    }
    
    // Umami tracking: Track calculate recipes action
    trackEvent('Calculate_Recipes_Clicked', { 
      hasInput: !!inputVal, 
      hasOutput: !!outputVal,
      success: !!route 
    });
  });
}

function playSuccess() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  beep(880, 0.1, 0.05);
}

function playError() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  beep(200, 0.2, 0.05);
}

// Umami tracking: Track Back button click in SCP-914
const backBtn914 = document.getElementById('backBtn914');
if (backBtn914) {
  backBtn914.addEventListener('click', () => {
    trackNavigation('home', 'scp914');
    trackEvent('Back_Button_Clicked', { from: 'scp914' });
    
    // Small delay to ensure tracking completes before navigation
    setTimeout(() => {
      window.location.href = '../home/index.html';
    }, 100);
  });
}
