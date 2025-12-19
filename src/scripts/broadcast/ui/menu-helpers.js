// Shared UI helpers for broadcast pages

export function setLEDByLevel(led, level) {
  if (!led) return;
  const upper = String(level || '').toUpperCase();
  led.className = 'led';
  led.style.opacity = 1;

  switch (upper) {
    case 'HIGH':
      led.classList.add('high', 'blink');
      break;
    case 'MEDIUM':
      led.classList.add('medium');
      break;
    case 'LOW':
      led.classList.add('low');
      break;
    case 'ALLOWED':
      led.classList.add('allowed');
      break;
    case 'PROHIBITED':
      led.classList.add('prohibited', 'blink');
      break;
    case 'BLACK':
      led.classList.add('black', 'blink-fast');
      break;
    case 'WHITE':
      led.classList.add('white');
      break;
    default:
      break;
  }
}

export function getStatusIconHTML(status, basePath) {
  const s = String(status || '');
  const p = basePath || '';
  switch (s) {
    case 'SCP BREACH':
      return `<img src="${p}breach.png" alt="SCP Breach">`;
    case 'SITE LOCKDOWN':
      return `<img src="${p}lockdown.png" alt="Site Lockdown">`;
    case 'CLASS-D ESCAPE':
      return `<img src="${p}class-descape.png" alt="Class-D Escape">`;
    case 'CLASS-D RIOT':
      return `<img src="${p}riot.png" alt="Class-D Riot">`;
    case 'CHAOS INSURGENCY':
      return `<img src="${p}chaosinsurgency.png" alt="Chaos Insurgency">`;
    case '610 EVENT':
      return `<img src="${p}610.png" alt="610 Event">`;
    case '076 EVENT':
      return `<img src="${p}abel.png" alt="076 Event">`;
    case 'NUCLEAR PROTOCOL':
      return `<img src="${p}nuke.png" alt="Nuclear Protocol">`;
    case 'CLEAR':
      return `<img src="${p}clear.png" alt="Clear">`;
    default:
      return '';
  }
}

export function extractMenuButtonText(menuBtn) {
  if (!menuBtn) return 'N/A';
  for (let node of menuBtn.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.trim();
      if (t) return t;
    }
  }
  return 'N/A';
}
