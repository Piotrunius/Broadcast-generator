document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGEMENT ---
  const initialState = {
    alarm: null,
    status: null,
    testing: null,
    directive: null,
    maintenance: null,
    shelterOrder: false,
    idCheck: false,
    contagiousThreat: false,
    conxPermission: false,
    breachedSCPs: [],
    permissionSCPs: [],
  };

  let state = { ...initialState };

  // --- DOM ELEMENTS ---
  const outputEl = document.getElementById('output');
  const allMenus = document.querySelectorAll('.menu');
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  const allMenuOptions = document.querySelectorAll('.menu-list button');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const breachControl = document.getElementById('breachControl');
  const breachCheckboxes = document.querySelectorAll('#breachControl input[type="checkbox"]');
  const permissionCheckboxes = document.querySelectorAll('[data-permission]');

  // --- AUDIO ---
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function beep(freq = 880, duration = 0.08, vol = 0.06) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  }

  // --- CORE LOGIC ---
  function updateBroadcast() {
    const { alarm, status, testing, directive, maintenance, shelterOrder, idCheck, contagiousThreat, conxPermission, breachedSCPs, permissionSCPs } = state;

    let mainParts = [];
    let messageParts = [];

    // Handle Status and Threat
    if (status && status !== 'ALL CLEAR') mainParts.push(`Site Status: ${status}`);
    if (alarm) mainParts.push(`Threat: ${alarm}`);
    if (testing) mainParts.push(`Testing: ${testing}`);

    // Initial message based on status
    const statusMessages = {
      "SCP BREACH": "Multiple SCP subjects have breached containment.",
      "610 EVENT": "A 610 event is active. All personnel must avoid any contact.",
      "076 EVENT": "SCP-076-2 is active. All armed personnel engage immediately.",
      "SITE LOCKDOWN": "Site is under full lockdown. No personnel movement is authorized.",
      "CLASS-D ESCAPE": "Multiple Class-D personnel have escaped their cells.",
      "CLASS-D RIOT": "A riot is active in the Class-D cell block.",
      "CHAOS INSURGENCY": "Chaos Insurgency operatives have infiltrated the facility.",
      "NUCLEAR PROTOCOL": "The on-site nuclear warhead has been activated. Evacuate immediately.",
    };
    if (status && statusMessages[status]) {
      messageParts.push(statusMessages[status]);
    }

    // Breach specific messages
    if (breachedSCPs.length > 0) {
      messageParts.push(`Breached subjects include: SCP-${breachedSCPs.join(', SCP-')}.`);
    }
    if (contagiousThreat) {
      messageParts.push("Threat is contagious. MTF Beta-7 (Maz Hatters) dispatched.");
    }

    // Directives
    if (directive) messageParts.push(directive + ".");
    if (shelterOrder) messageParts.push("All non-combat personnel must report to shelters immediately.");

    // Maintenance & Permissions
    if (maintenance) messageParts.push(`Maintenance crews are requested to ${maintenance}.`);
    
    let permissionText = [];
    if (conxPermission) permissionText.push("CON-X");
    if (permissionSCPs.length > 0) permissionText.push(...permissionSCPs);
    if(permissionText.length > 0) {
        messageParts.push(`${permissionText.join(', ')} testing requires SID+ authorization.`);
    }

    if (idCheck) messageParts.push("Present identification at all checkpoints.");

    // Final Assembly
    let finalBroadcast = "";
    if (status === 'ALL CLEAR') {
        finalBroadcast = "/broadcast All threats have been neutralized. " + messageParts.join(' ');
    } else if (mainParts.length > 0) {
        finalBroadcast = `/broadcast ${mainParts.join(' | ')} | ${messageParts.join(' ')}`;
    }

    outputEl.value = finalBroadcast.trim();
  }

  // --- UI UPDATES ---
  function updateUI() {
    // Conditional Panels
    breachControl.classList.toggle('hidden', state.status !== 'SCP BREACH');

    // Menus
    document.querySelectorAll('.menu-btn').forEach(btn => {
      const menuId = btn.dataset.menu;
      const selectedValue = state[menuId];
      const btnTextNode = btn.childNodes[2]; // Assuming text is the third child

      if (selectedValue) {
        btnTextNode.textContent = ` ${selectedValue.split('(')[0].trim()} `;
        // Update LED for alarm only, others not needed anymore
        const led = btn.querySelector('.led');
        if (led && menuId === 'alarm') {
          led.className = 'led';
          led.classList.add(selectedValue.toLowerCase());
        }
      } else {
        // Restore original menu button text, but for new elements use SELECT
        if (menuId === 'directive') btnTextNode.textContent = ' COMBAT ';
        else if (menuId === 'maintenance') btnTextNode.textContent = ' REPAIRS ';
        else if (menuId === 'testing') btnTextNode.textContent = ' STATUS ';
        else btnTextNode.textContent = ' SELECT ';
        const led = btn.querySelector('.led');
        if (led) led.className = 'led'; // Reset LED class
      }
    });

    // Menu list button selection styles
    document.querySelectorAll('.menu-list button').forEach(button => {
        const menuId = button.closest('.menu-list').id;
        if (state[menuId] === button.dataset.option) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });


    // Checkboxes (General and specific)
    document.getElementById('shelterOrder').checked = state.shelterOrder;
    document.getElementById('idCheck').checked = state.idCheck;
    document.getElementById('contagiousThreat').checked = state.contagiousThreat;
    document.getElementById('conxPermission').checked = state.conxPermission;
    
    // Repair checkboxes
    // The previous HTML had a menu for maintenance, not checkboxes with IDs repairPumps and repairGens.
    // Assuming `state.maintenance` now stores the selected repair option
    if (state.maintenance === "Repair Water Pumps") {
      // Logic for displaying state for 'Repair Water Pumps'
    } else if (state.maintenance === "Repair Generators") {
      // Logic for displaying state for 'Repair Generators'
    }

    breachCheckboxes.forEach(cb => cb.checked = state.breachedSCPs.includes(cb.dataset.scp));
    permissionCheckboxes.forEach(cb => cb.checked = state.permissionSCPs.includes(cb.dataset.permission));
    
    updateBroadcast();
  }
  
  // --- EVENT LISTENERS ---

  // Menus
  document.querySelectorAll('.menu-list button').forEach(optBtn => {
    optBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuId = optBtn.closest('.menu-list').id;
      state[menuId] = optBtn.dataset.option;
      
      if (menuId === 'status' && state.status !== 'SCP BREACH') {
          state.breachedSCPs = [];
          state.contagiousThreat = false;
      }
      // Special handling for 610/076 events: clear breach-related selections
      if (menuId === 'status' && (state.status === '610 EVENT' || state.status === '076 EVENT')) {
          state.breachedSCPs = [];
          state.contagiousThreat = false;
      }


      beep();
      updateUI();
      optBtn.closest('.menu-list').classList.remove('show');
    });
  });

  // Checkboxes
  allCheckboxes.forEach(cb => {
    // Skip breach and permission checkboxes as they have their own specific listeners
    if (cb.dataset.scp || cb.dataset.permission) return; 

    cb.addEventListener('change', () => {
      const id = cb.id;
      state[id] = cb.checked;
      beep(900, 0.05, 0.03);
      updateUI();
    });
  });

  // Breach Checkboxes
  breachCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const scp = cb.dataset.scp;
      if (cb.checked) {
        state.breachedSCPs.push(scp);
        if (['008', '610'].includes(scp)) state.contagiousThreat = true;
      } else {
        state.breachedSCPs = state.breachedSCPs.filter(s => s !== scp);
        // If the last contagious SCP is unchecked, set contagiousThreat to false
        if (!state.breachedSCPs.some(s => ['008', '610'].includes(s))) {
            state.contagiousThreat = false;
        }
      }
      beep(900, 0.05, 0.03);
      updateUI();
    });
  });
  
  // Permission Checkboxes
  permissionCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
        const perm = cb.dataset.permission;
        if(cb.checked) state.permissionSCPs.push(perm);
        else state.permissionSCPs = state.permissionSCPs.filter(p => p !== perm);
        beep(900, 0.05, 0.03);
        updateUI();
    });
  });

  // Clear
  clearBtn.addEventListener('click', () => {
    state = { ...initialState }; // Reset to initial state
    beep(600, 0.1, 0.05);
    updateUI();
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    if (!outputEl.value.trim()) return;
    navigator.clipboard.writeText(outputEl.value).then(() => {
      copyBtn.textContent = 'COPIED!';
      setTimeout(() => { copyBtn.textContent = 'COPY' }, 1500);
    });
  });

  // Menu Toggling
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const list = btn.nextElementSibling;
        const isShown = list.classList.contains('show');
        document.querySelectorAll('.menu-list').forEach(l => l.classList.remove('show'));
        if (!isShown) list.classList.add('show');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu')) {
      document.querySelectorAll('.menu-list').forEach(l => l.classList.remove('show'));
    }
  });

  updateUI();
});
