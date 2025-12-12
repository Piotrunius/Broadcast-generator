// ================================
//  SCP-914 ROUTE CALCULATOR + SEARCH MENUS
// ================================

// --- Datos crudos (tu tabla) ---
const RAW_RECIPES = `
Blowtorch|Rough|Coffee
Cassette|Rough|Photograph
Clipboard|Rough|Coffee
Crowbar|Rough|Vent Map
Desert Eagle|Rough|Coffee
Flashlight|Rough|Crowbar
Food Tray|Rough|Green Food
Green Food|Rough|Food Tray
Hacking Tool|Rough|Mop
HK416|Rough|Iron Bars
Iron Bars|Rough|Crowbar
Lavender|Rough|Pizza
M249|Rough|Iron Bars
Medkit|Rough|Orange Food
Orange Food|Rough|Food Tray
Photograph|Rough|Cassette
Pizza|Rough|Red Food
P90L|Rough|Pizza
Red Food|Rough|Food Tray
Teddy|Rough|Glock-17
UMP-45|Rough|Red Food
Vent Map|Rough|Red Food
Wall Patch|Rough|Crowbar

Blowtorch|1:1|Crowbar
Clipboard|1:1|Food Tray
Coffee|1:1|Clipboard
Crowbar|1:1|Flashlight
Flashlight|1:1|Wall Patch
Food Tray|1:1|Coffee
Green Food|1:1|Red Food
Orange Food|1:1|Red Food
Red Food|1:1|Orange Food
Iron Bars|1:1|Wood Planks
Medkit|1:1|Mop
Mop|1:1|Red Food
Pizza|1:1|Food Tray
Riot Shield|1:1|Mop
SCP-860|1:1|Vent Map
Vent Map|1:1|Crowbar
Wall Patch|1:1|Iron Bars
Wood Planks|1:1|Iron Bars
M249|1:1|HK416
HK416|1:1|P90L
P90L|1:1|Wall Patch
Desert Eagle|1:1|Glock-17
Stolen M4|1:1|HK416
SCAR-L|1:1|HK416
UMP-45|1:1|P90L
Teddy|1:1|Vent Map
Lavender|1:1|Pizza
Hacking Tool|1:1|First Aid Kit
Photograph|1:1|Photograph
Cassette|1:1|Cassette

Blowtorch|Fine|Hacking Tool
Clipboard|Fine|Flashlight
Coffee|Fine|Orange Food
Crowbar|Fine|Wall Patch
Flashlight|Fine|Coffee
Orange Food|Fine|Green Food
Red Food|Fine|Green Food
Iron Bars|Fine|Blowtorch
Medkit|Fine|Food Tray
Mop|Fine|Coffee
Pizza|Fine|First Aid Kit
SCP-860|Fine|Iron Bars
Vent Map|Fine|Flashlight
Wall Patch|Fine|None
Wood Planks|Fine|Crowbar
M249|Fine|MP5SD
HK416|Fine|Riot Shield
P90L|Fine|UMP-45
Desert Eagle|Fine|MP5SD
Stolen M4|Fine|AK74
SCAR-L|Fine|Blowtorch
UMP-45|Fine|Riot Shield
Teddy|Fine|Clipboard
Lavender|Fine|Pizza
Hacking Tool|Fine|Flashlight
Photograph|Fine|Photograph
Cassette|Fine|Cassette

Blowtorch|Very Fine|Wall Patch
Clipboard|Very Fine|Glock-17
Coffee|Very Fine|Pizza
Crowbar|Very Fine|Blowtorch
Food Tray|Very Fine|Coffee
Green Food|Very Fine|Crowbar
Orange Food|Very Fine|Crowbar
Red Food|Very Fine|Crowbar
Iron Bars|Very Fine|Wall Patch
Medkit|Very Fine|Pizza
Mop|Very Fine|Flashlight
Riot Shield|Very Fine|Flashlight
SCP-860|Very Fine|SCP-198
Vent Map|Very Fine|Blowtorch
Wood Planks|Very Fine|Wall Patch
M249|Very Fine|Desert Eagle
HK416|Very Fine|Desert Eagle
P90L|Very Fine|Mop
Desert Eagle|Very Fine|Green Food
Stolen M4|Very Fine|M249
SCAR-L|Very Fine|UMP-45
UMP-45|Very Fine|Vent Map
Teddy|Very Fine|First Aid Kit
Lavender|Very Fine|FAMAS
Hacking Tool|Very Fine|Pizza
Photograph|Very Fine|Photograph
Cassette|Very Fine|Cassette
`;

// ========= PARSE DE RECETAS Y GRAFO =========
const TRANSFORMATIONS = RAW_RECIPES
  .split("\n")
  .map(l => l.trim())
  .filter(l => l && !l.startsWith("//"))
  .map(line => {
    const [input, setting, output] = line.split("|").map(s => s.trim());
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
allItemsSet.delete("None");
const ALL_ITEMS = Array.from(allItemsSet).sort();

// ========= AUTOCOMPLETE + VALIDACIÓN =========

// Valida y cambia el color del borde dinamicamente
function validateInput(container){
  const input = container.querySelector("input");
  const text = input.value.trim().toLowerCase();

  if(text === ""){
    container.classList.remove("valid","invalid");
    return;
  }

  if(ALL_ITEMS.some(i => i.toLowerCase() === text)){
    container.classList.add("valid");
    container.classList.remove("invalid");
  } else {
    container.classList.add("invalid");
    container.classList.remove("valid");
  }
}

// Autocomplete + lista filtrada
function setupSearchDropdown(id){
  const box = document.getElementById(id);
  const input = box.querySelector("input");
  const list = box.querySelector("ul");

  function updateList(){
    const query = input.value.toLowerCase();
    list.innerHTML = "";

    const filtered = ALL_ITEMS.filter(i => i.toLowerCase().includes(query));

    filtered.forEach(item => {
      let li = document.createElement("li");
      li.textContent = item;
      li.onclick = () => {
        input.value = item;
        validateInput(box);
        list.classList.remove("show");
      };
      list.appendChild(li);
    });

    if(filtered.length > 0) list.classList.add("show");
    else list.classList.remove("show");

    validateInput(box);
  }

  input.addEventListener("input", updateList);
  input.addEventListener("focus", updateList);

  // =====================
  //  ENTER + TAB AUTOFILL
  // =====================
input.addEventListener("keydown", (e) => {

    // TAB mantiene autocomplete como antes
    if(e.key === "Tab"){
        e.preventDefault();
        const suggestions = list.querySelectorAll("li");

        if(suggestions.length > 0){
            input.value = suggestions[0].textContent; // autocompleta primer item
            validateInput(box);
            list.classList.remove("show");
        }
        return;
    }

    // ENTER YA NO AUTOCOMPLETA — AHORA CALCULA RUTA
    if(e.key === "Enter"){
        e.preventDefault();
        // Simula presionar el botón CALCULATE PATH
        document.getElementById("calcBtn")?.click();
        return;
    }
});

// cerrar lista si haces clic fuera
document.addEventListener("click", e => {
    if(!box.contains(e.target)){
        list.classList.remove("show");
    }
});
}



// Inicializar INPUT y OUTPUT (asegúrate de que en el HTML existen estos IDs)
setupSearchDropdown("inputSelect");
setupSearchDropdown("outputSelect");

// ========= CLEAR BUTTON =========
const clearBtn = document.getElementById("clearFields");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    document.querySelector("#inputSelect input").value  = "";
    document.querySelector("#outputSelect input").value = "";

    document.querySelectorAll(".search-select").forEach(box => {
      box.classList.remove("valid", "invalid");
    });

    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.textContent = "";
  });
}

// ========= REFERENCIAS DEL BOTÓN Y CONSOLA =========
const calcBtn  = document.getElementById("calcBtn");
const resultEl = document.getElementById("result");

// ============================================================
// 🔥 RUTA INTELIGENTE — Busca la forma más corta hasta llegar
// ============================================================
function findSmartRoute(start, goal) {
  if (start === goal) return [];

  const queue   = [start];
  const visited = new Map();

  // Guardamos siempre un objeto { from, setting }
  visited.set(start, { from: null, setting: null });

  while (queue.length) {
    const current = queue.shift();
    const edges   = adjacency[current] || [];

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
              setting: info.setting
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

function findDirectInputsFor(output){
    let results = [];

    for(const item in adjacency){
        adjacency[item].forEach(step=>{
            if(step.to === output){
                results.push({
                    from: item,
                    setting: step.setting,
                    to: output
                });
            }
        });
    }
    return results.length ? results : null;
}

// Convertir modos en colores automáticos COMPLETO y CORRECTO
function styleSetting(text){
    return text
        .replace(/\bVery Fine\b/g, `<span class='veryfine'>Very Fine</span>`)
        .replace(/\bFine\b(?!<\/span>)/g, `<span class='fine'>Fine</span>`)
        .replace(/\bRough\b/g, `<span class='rough'>Rough</span>`)
        .replace(/\b1:1\b/g, `<span class='equal'>1:1</span>`);
}


// 📄 NUEVO FORMATO COLOR SCP
function highlightItem(name){
    return `<span class="selected-item">${name}</span>`;
}

function formatSmartRoute(start, goal, route){
    if(!route){
        return `<pre>❌ No route found from "${start}" to "${goal}".</pre>`;
    }
    if(route.length === 0){
        return `<pre>INPUT = OUTPUT\nNo refinement required.</pre>`;
    }

    const startLabel = highlightItem(start);
    const goalLabel  = highlightItem(goal);

    let out = `<pre>======   SCP-914 RECIPE ROUTE REPORT   ======\n\n`;
    out += `STEPS   ➜  ${route.length}\n`;
    out += `PROCESS PATH:\n\n`;

    route.forEach((step,i)=>{
        // si el from/to coincide con start/goal, lo pintamos en amarillo
        const fromLabel = (step.from === start) ? startLabel :
                          (step.from === goal)  ? goalLabel  : step.from;

        const toLabel   = (step.to === goal)   ? goalLabel   :
                          (step.to === start)  ? startLabel  : step.to;

        out += `${i+1}. ${fromLabel}\n`;
        out += `    └─► ${styleSetting(step.setting)}  ➜  ${toLabel}\n\n`;
    });

    return out;
}

// ========== BOTÓN CALCULATE — usa la ruta inteligente ==========
if (calcBtn) {
calcBtn.addEventListener("click", () => {
  const inputVal  = document.querySelector("#inputSelect input")?.value.trim();
  const outputVal = document.querySelector("#outputSelect input")?.value.trim();

  // ➤ Caso 1: Nada seleccionado
  if(!inputVal && !outputVal){
      resultEl.innerHTML = "<pre>⚠ Enter at least OUTPUT.</pre>";
      return;
  }

  // ➤ Caso 2: Solo OUTPUT → mostrar combinaciones directas disponibles
  if(!inputVal && outputVal){
      const results = findDirectInputsFor(outputVal);

      if(!results){
          resultEl.innerHTML = `<pre>❌ No direct transformation leads to "${outputVal}".</pre>`;
          return;
      }

      let out = `<pre>====== DIRECT INPUTS FOR: ${outputVal} ======\n\n`;
      results.forEach((r,i)=>{
          out+= `${i+1}. ${highlightItem(r.from)}  ──►  ${styleSetting(r.setting)}  ──►  ${highlightItem(r.to)}\n`;
      });
      out+= `\n==========================================\n✔ Showing all 1-step conversion options\n</pre>`;

      resultEl.innerHTML = out;
      return;
  }

  // ➤ Caso normal INPUT + OUTPUT → ruta inteligente
  const route = findSmartRoute(inputVal, outputVal);
  resultEl.innerHTML = formatSmartRoute(inputVal, outputVal, route);
});
}
