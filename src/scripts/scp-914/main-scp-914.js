import { AudioManager } from '../utils/audio-manager.js';
import { RAW_RECIPES } from './data/scp-recipes.js';

const audioManager = new AudioManager();

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
  input.addEventListener('focus', () => audioManager.playHover());
  input.addEventListener('input', () => audioManager.playType());

  function updateList() {
    const query = input.value.toLowerCase();
    list.innerHTML = '';

    const filtered = ALL_ITEMS.filter((i) => i.toLowerCase().includes(query));

    filtered.forEach((item) => {
      let li = document.createElement('li');
      li.textContent = item;

      // Hover effect for list items
      li.addEventListener('mouseenter', () => audioManager.playHover());

      li.onclick = () => {
        input.value = item;
        validateInput(box);
        list.classList.remove('show');
        audioManager.playClick();
      };
      list.appendChild(li);
    });

    if (filtered.length > 0) list.classList.add('show');
    else list.classList.remove('show');

    validateInput(box);
  }

  input.addEventListener('input', updateList);
  input.addEventListener('focus', updateList);

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
        audioManager.playClick();
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
  clearBtn.addEventListener('mouseenter', () => audioManager.playHover());
  clearBtn.addEventListener('click', () => {
    try {
      audioManager.playSuccess();
    } catch (e) {
      console.log('Audio error:', e);
    }

    document.querySelector('#inputSelect input').value = '';
    document.querySelector('#outputSelect input').value = '';

    document.querySelectorAll('.search-select').forEach((box) => {
      box.classList.remove('valid', 'invalid');
    });

    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.textContent = '';
  });
}

// ========= REFERENCIAS DEL BOTÓN Y CONSOLA =========
const calcBtn = document.getElementById('calcBtn');
const resultEl = document.getElementById('result');

if (calcBtn) {
  calcBtn.addEventListener('mouseenter', () => audioManager.playHover());
}

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

function findDirectInputsFor(output) {
  let results = [];

  for (const item in adjacency) {
    adjacency[item].forEach((step) => {
      if (step.to === output) {
        results.push({
          from: item,
          setting: step.setting,
          to: output,
        });
      }
    });
  }
  return results.length ? results : null;
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
      audioManager.playError();
      return;
    }

    // ➤ Caso 2: Solo OUTPUT → mostrar combinaciones directas disponibles
    if (!inputVal && outputVal) {
      const results = findDirectInputsFor(outputVal);

      if (!results) {
        resultEl.innerHTML = `<pre>❌ No direct transformation leads to "${outputVal}".</pre>`;
        audioManager.playError();
        return;
      }

      let out = `<pre>====== DIRECT INPUTS FOR: ${outputVal} ======    \n\n`;
      results.forEach((r, i) => {
        out += `${i + 1}. ${highlightItem(r.from)}  ──►  ${styleSetting(r.setting)}  ──►  ${highlightItem(r.to)}\n`;
      });
      out += `\n==========================================\n✔ Showing all 1-step conversion options\n</pre>`;

      resultEl.innerHTML = out;
      audioManager.playSuccess();
      return;
    }

    // ➤ Caso normal INPUT + OUTPUT → ruta inteligente
    const route = findSmartRoute(inputVal, outputVal);
    resultEl.innerHTML = formatSmartRoute(inputVal, outputVal, route);

    if (!route) {
      audioManager.playError();
    } else {
      audioManager.playSuccess();
    }
  });
}
