// Advanced Error Handling and Auto-Recovery System
// 100+ Detailed Error Codes for Broadcast Generator

class ErrorHandler {
  constructor() {
    this.errors = new Map();
    this.recoveryStrategies = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 100;
    this.initializeErrorCodes();
    this.setupRecovery();
  }

  initializeErrorCodes() {
    // ============= GENERATOR ERRORS (GEN-001 to GEN-050) =============
    const genErrors = [
      { code: 'GEN-001', name: 'Generator Infinite Loop', message: 'Generator exceeded 50 iteration limit', severity: 'CRITICAL', recovery: 'RESTART_GENERATOR' },
      { code: 'GEN-002', name: 'Invalid Message Parts', message: 'Message parts object structure invalid', severity: 'HIGH', recovery: 'RESET_GENERATOR_STATE' },
      { code: 'GEN-003', name: 'Character Count Mismatch', message: 'Character counter desynchronized from actual message', severity: 'HIGH', recovery: 'RECALC_CHAR_LIMIT' },
      { code: 'GEN-004', name: 'Message Generation Failed', message: 'Generator.generate() returned null or undefined', severity: 'CRITICAL', recovery: 'RESTART_GENERATOR' },
      { code: 'GEN-005', name: 'Overflow Flag Corruption', message: 'Overflow detection flag unreliable', severity: 'HIGH', recovery: 'RESET_GENERATOR_STATE' },
      { code: 'GEN-006', name: 'Priority Field Missing', message: 'Message part missing priority field', severity: 'HIGH', recovery: 'RESET_GENERATOR_STATE' },
      { code: 'GEN-007', name: 'Level Selection Invalid', message: 'Selected message level (Brief/Medium/Verbose) invalid', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
      { code: 'GEN-008', name: 'Text Content Null', message: 'Message part text field is null', severity: 'HIGH', recovery: 'RESET_GENERATOR_STATE' },
      { code: 'GEN-009', name: 'Levels Array Empty', message: 'Message part has no level options', severity: 'HIGH', recovery: 'RESET_GENERATOR_STATE' },
      { code: 'GEN-010', name: 'MaxIterations Exceeded', message: 'Generator loop iterations exceeded safe limit', severity: 'CRITICAL', recovery: 'RESTART_GENERATOR' },
      { code: 'GEN-011', name: 'Generator State Undefined', message: 'window.broadcastGenerator is undefined', severity: 'CRITICAL', recovery: 'RESTART_GENERATOR' },
      { code: 'GEN-012', name: 'Shrink Algorithm Failed', message: 'Message shrinking algorithm crashed', severity: 'HIGH', recovery: 'RESTART_GENERATOR' },
      { code: 'GEN-013', name: 'Expand Algorithm Failed', message: 'Message expanding algorithm crashed', severity: 'HIGH', recovery: 'RESTART_GENERATOR' },
      { code: 'GEN-014', name: 'Character Limit Inconsistent', message: 'Max character limit changed mid-operation', severity: 'MEDIUM', recovery: 'RECALC_CHAR_LIMIT' },
      { code: 'GEN-015', name: 'Message Parts Circular Reference', message: 'Circular reference detected in message parts', severity: 'CRITICAL', recovery: 'RESET_GENERATOR_STATE' },
    ];

    // ============= UI ERRORS (UI-001 to UI-060) =============
    const uiErrors = [
      { code: 'UI-001', name: 'Output Textarea Missing', message: 'Element #output not found in DOM', severity: 'CRITICAL', recovery: 'RECREATE_OUTPUT_ELEMENT' },
      { code: 'UI-002', name: 'Character Counter Missing', message: 'Element #char-counter not found', severity: 'HIGH', recovery: 'REINITIALIZE_COUNTER' },
      { code: 'UI-003', name: 'Menu System Broken', message: 'No .menu elements found in DOM', severity: 'CRITICAL', recovery: 'REBUILD_MENUS' },
      { code: 'UI-004', name: 'Animation Failed', message: 'Typewriter animation crashed', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'UI-005', name: 'Clear Button Missing', message: 'Element #clearBtn not found', severity: 'MEDIUM', recovery: 'REINITIALIZE_COUNTER' },
      { code: 'UI-006', name: 'Copy Button Missing', message: 'Element #copyBtn not found', severity: 'MEDIUM', recovery: 'REINITIALIZE_COUNTER' },
      { code: 'UI-007', name: 'Menu Button Not Responsive', message: 'Menu button click event not firing', severity: 'HIGH', recovery: 'REBUILD_MENUS' },
      { code: 'UI-008', name: 'Menu Panel Not Showing', message: 'Menu panel failed to display', severity: 'HIGH', recovery: 'REBUILD_MENUS' },
      { code: 'UI-009', name: 'Textarea Selection Failed', message: 'Cannot select text in output textarea', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'UI-010', name: 'Textarea Read-Only Broken', message: 'Output textarea is not read-only', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'UI-011', name: 'Focus Management Failed', message: 'Element focus/blur not working', severity: 'LOW', recovery: 'REINITIALIZE_COUNTER' },
      { code: 'UI-012', name: 'Event Listener Attachment Failed', message: 'addEventListener returned error', severity: 'HIGH', recovery: 'REBUILD_MENUS' },
      { code: 'UI-013', name: 'DOM Query Selector Failed', message: 'querySelector returned unexpected result', severity: 'HIGH', recovery: 'REBUILD_MENUS' },
      { code: 'UI-014', name: 'Element Visibility Issue', message: 'Element exists but not visible', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'UI-015', name: 'Button Disabled State Stuck', message: 'Button permanently disabled', severity: 'MEDIUM', recovery: 'REINITIALIZE_COUNTER' },
      { code: 'UI-016', name: 'Scroll Position Lost', message: 'Scroll position not preserved', severity: 'LOW', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'UI-017', name: 'Tooltip Display Error', message: 'Tooltips not appearing on hover', severity: 'LOW', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'UI-018', name: 'Input Field Validation Failed', message: 'Input validation logic broken', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
      { code: 'UI-019', name: 'Modal Dialog Failed', message: 'Error modal overlay creation failed', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'UI-020', name: 'Accessibility Tree Corrupted', message: 'ARIA attributes invalid', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
    ];

    // ============= STYLE ERRORS (STY-001 to STY-040) =============
    const styErrors = [
      { code: 'STY-001', name: 'Textarea Style Corruption', message: 'Output textarea CSS invalid', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-002', name: 'Color Theme Mismatch', message: 'Color classes not applied correctly', severity: 'MEDIUM', recovery: 'REAPPLY_COLOR_THEME' },
      { code: 'STY-003', name: 'CSS Variable Undefined', message: 'CSS custom property not defined', severity: 'HIGH', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-004', name: 'Border Style Broken', message: 'Textarea border rendering failed', severity: 'LOW', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-005', name: 'Shadow Effect Missing', message: 'Box shadow not rendering', severity: 'LOW', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-006', name: 'Font Loading Failed', message: 'Custom fonts did not load', severity: 'LOW', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-007', name: 'Animation Transition Broken', message: 'CSS transitions not working', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'STY-008', name: 'Flexbox Layout Failed', message: 'Flex container not arranging items', severity: 'HIGH', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-009', name: 'Grid Layout Failed', message: 'CSS Grid layout broken', severity: 'HIGH', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-010', name: 'Responsive Design Broken', message: 'Media queries not working', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-011', name: 'Opacity Not Applied', message: 'Element opacity CSS broken', severity: 'LOW', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-012', name: 'Z-Index Conflict', message: 'Element stacking order wrong', severity: 'MEDIUM', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-013', name: 'Overflow Hidden Not Working', message: 'Text overflow visible when should hide', severity: 'LOW', recovery: 'RESET_TEXTAREA_STYLES' },
      { code: 'STY-014', name: 'Text Color Unreadable', message: 'Text color contrast too low', severity: 'MEDIUM', recovery: 'REAPPLY_COLOR_THEME' },
      { code: 'STY-015', name: 'Background Color Corrupted', message: 'Background color CSS invalid', severity: 'MEDIUM', recovery: 'REAPPLY_COLOR_THEME' },
    ];

    // ============= ANIMATION ERRORS (ANI-001 to ANI-020) =============
    const aniErrors = [
      { code: 'ANI-001', name: 'Typewriter Loop Stuck', message: 'Animation infinite loop detected', severity: 'HIGH', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-002', name: 'Character Animation Skipped', message: 'Animation frames dropped', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-003', name: 'Timing Desynchronized', message: 'Animation timing out of sync', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-004', name: 'Diff Algorithm Failed', message: 'Text difference detection crashed', severity: 'HIGH', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-005', name: 'Sleep Function Error', message: 'Animation delay function failed', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-006', name: 'DOM Update Blocked', message: 'Animation DOM updates blocked', severity: 'HIGH', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-007', name: 'RequestAnimationFrame Failed', message: 'Browser animation frame request failed', severity: 'HIGH', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-008', name: 'Transform Animation Glitch', message: 'CSS transform animation buggy', severity: 'LOW', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-009', name: 'Keyframe Parsing Error', message: '@keyframes CSS error', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'ANI-010', name: 'Animation Flag Stuck', message: 'typingInProgress flag permanently true', severity: 'HIGH', recovery: 'RESET_ANIMATION_STATE' },
    ];

    // ============= AUDIO ERRORS (AUD-001 to AUD-025) =============
    const audErrors = [
      { code: 'AUD-001', name: 'Audio Context Failed', message: 'Web Audio API unavailable', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-002', name: 'Oscillator Creation Failed', message: 'Cannot create audio oscillator', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-003', name: 'Audio Playback Denied', message: 'Browser blocked audio autoplay', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-004', name: 'Speaker Volume Zero', message: 'System volume muted', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-005', name: 'Audio Codec Unsupported', message: 'Audio format not supported', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-006', name: 'Microphone Permission Denied', message: 'Microphone access blocked', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-007', name: 'Audio Buffer Empty', message: 'Audio buffer not initialized', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-008', name: 'Tone Generation Failed', message: 'playTone function crashed', severity: 'LOW', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-009', name: 'Audio Manager Not Initialized', message: 'AudioManager instance missing', severity: 'MEDIUM', recovery: 'MUTE_AUDIO' },
      { code: 'AUD-010', name: 'Frequency Value Invalid', message: 'Audio frequency out of range', severity: 'LOW', recovery: 'MUTE_AUDIO' },
    ];

    // ============= DATA ERRORS (DAT-001 to DAT-040) =============
    const datErrors = [
      { code: 'DAT-001', name: 'Broadcast Options Invalid', message: 'getBroadcastOptions() returned bad data', severity: 'HIGH', recovery: 'RESET_OPTIONS' },
      { code: 'DAT-002', name: 'Local Storage Corrupted', message: 'localStorage data invalid', severity: 'MEDIUM', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'DAT-003', name: 'Session Storage Broken', message: 'sessionStorage access failed', severity: 'MEDIUM', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'DAT-004', name: 'IndexedDB Error', message: 'IndexedDB operation failed', severity: 'MEDIUM', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'DAT-005', name: 'JSON Parse Failed', message: 'JSON.parse() threw error', severity: 'HIGH', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'DAT-006', name: 'JSON Stringify Failed', message: 'JSON.stringify() threw error', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
      { code: 'DAT-007', name: 'Data Type Mismatch', message: 'Expected string got different type', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
      { code: 'DAT-008', name: 'Array Index Out of Bounds', message: 'Accessing invalid array index', severity: 'HIGH', recovery: 'RESET_OPTIONS' },
      { code: 'DAT-009', name: 'Object Property Undefined', message: 'Accessing undefined object property', severity: 'HIGH', recovery: 'RESET_OPTIONS' },
      { code: 'DAT-010', name: 'Null Pointer Exception', message: 'Dereferencing null value', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'DAT-011', name: 'Map/Set Corruption', message: 'Map or Set structure corrupted', severity: 'HIGH', recovery: 'RESET_OPTIONS' },
      { code: 'DAT-012', name: 'Global State Inconsistent', message: 'Global variables out of sync', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'DAT-013', name: 'Cache Stale', message: 'Cached data is outdated', severity: 'MEDIUM', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'DAT-014', name: 'Memory Leak Detected', message: 'Potential memory leak in data structures', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'DAT-015', name: 'Data Synchronization Lost', message: 'Data sync between components broken', severity: 'HIGH', recovery: 'RESET_OPTIONS' },
    ];

    // ============= NETWORK ERRORS (NET-001 to NET-030) =============
    const netErrors = [
      { code: 'NET-001', name: 'Clipboard API Denied', message: 'Browser denied clipboard access', severity: 'MEDIUM', recovery: 'FALLBACK_COPY' },
      { code: 'NET-002', name: 'Clipboard Empty', message: 'Clipboard read returned empty', severity: 'MEDIUM', recovery: 'FALLBACK_COPY' },
      { code: 'NET-003', name: 'Copy Command Failed', message: 'document.execCommand("copy") failed', severity: 'MEDIUM', recovery: 'FALLBACK_COPY' },
      { code: 'NET-004', name: 'Network Timeout', message: 'Network request timed out', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-005', name: 'CORS Policy Violation', message: 'Cross-origin request blocked', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-006', name: 'HTTP 404 Error', message: 'Resource not found', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-007', name: 'HTTP 500 Error', message: 'Server error', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-008', name: 'SSL Certificate Error', message: 'SSL/TLS certificate invalid', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-009', name: 'DNS Resolution Failed', message: 'Cannot resolve domain name', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-010', name: 'WebSocket Connection Failed', message: 'WebSocket handshake failed', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-011', name: 'Fetch Request Aborted', message: 'fetch() request was aborted', severity: 'MEDIUM', recovery: 'FALLBACK_COPY' },
      { code: 'NET-012', name: 'Rate Limiting Exceeded', message: 'Too many requests from this IP', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-013', name: 'Proxy Connection Failed', message: 'Cannot connect through proxy', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-014', name: 'TLS Handshake Failed', message: 'TLS protocol handshake error', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'NET-015', name: 'Connection Refused', message: 'Server refused connection', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
    ];

    // ============= STATE ERRORS (STA-001 to STA-030) =============
    const staErrors = [
      { code: 'STA-001', name: 'Application State Corrupted', message: 'Global application state invalid', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-002', name: 'State Machine Invalid Transition', message: 'Invalid state transition attempted', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-003', name: 'Event Handler Not Registered', message: 'Event handler missing', severity: 'HIGH', recovery: 'REBUILD_MENUS' },
      { code: 'STA-004', name: 'Singleton Instance Missing', message: 'Required singleton not initialized', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-005', name: 'Context Lost', message: '"this" context undefined', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-006', name: 'Callback Hell', message: 'Too many nested callbacks', severity: 'MEDIUM', recovery: 'RESET_ANIMATION_STATE' },
      { code: 'STA-007', name: 'Promise Rejection Unhandled', message: 'Unhandled promise rejection', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-008', name: 'Async/Await Deadlock', message: 'Async function deadlocked', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-009', name: 'Variable Name Collision', message: 'Variable shadowing detected', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-010', name: 'Type Coercion Error', message: 'JavaScript type coercion failed unexpectedly', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
      { code: 'STA-011', name: 'Race Condition', message: 'Race condition in concurrent operations', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-012', name: 'Deadlock Detected', message: 'Deadlock between components', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-013', name: 'Stack Overflow', message: 'Call stack size exceeded', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-014', name: 'Heap Out of Memory', message: 'JavaScript heap out of memory', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'STA-015', name: 'Reference Cycle', message: 'Circular reference preventing garbage collection', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
    ];

    // ============= BROWSER/ENVIRONMENT ERRORS (ENV-001 to ENV-025) =============
    const envErrors = [
      { code: 'ENV-001', name: 'Browser Unsupported', message: 'Browser does not support required features', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-002', name: 'ES6 Module Not Supported', message: 'Browser does not support ES6 modules', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-003', name: 'Service Worker Failed', message: 'Service worker registration failed', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-004', name: 'Window Object Not Available', message: 'Global window object unavailable', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-005', name: 'Document Object Not Available', message: 'DOM document object unavailable', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-006', name: 'LocalStorage Disabled', message: 'Browser has localStorage disabled', severity: 'MEDIUM', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'ENV-007', name: 'Cookies Disabled', message: 'Browser cookies are disabled', severity: 'LOW', recovery: 'RESET_OPTIONS' },
      { code: 'ENV-008', name: 'JavaScript Disabled', message: 'JavaScript execution disabled', severity: 'CRITICAL', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-009', name: 'Private Browsing Enabled', message: 'Storage limited in private mode', severity: 'MEDIUM', recovery: 'CLEAR_LOCAL_STORAGE' },
      { code: 'ENV-010', name: 'Strict Mode Violation', message: '"use strict" mode error', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-011', name: 'Sandbox Restriction', message: 'Operation blocked by sandbox', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-012', name: 'Content Security Policy Violation', message: 'CSP blocked resource', severity: 'HIGH', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-013', name: 'Feature Not Enabled', message: 'Required browser feature not enabled', severity: 'MEDIUM', recovery: 'FULL_PAGE_RESET' },
      { code: 'ENV-014', name: 'API Deprecated', message: 'Using deprecated API', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
      { code: 'ENV-015', name: 'Permissions Denied', message: 'Required permission denied by user', severity: 'MEDIUM', recovery: 'RESET_OPTIONS' },
    ];

    // Register all errors
    [...genErrors, ...uiErrors, ...styErrors, ...aniErrors, ...audErrors, ...datErrors, ...netErrors, ...staErrors, ...envErrors].forEach(e => {
      this.registerError(e.code, {
        name: e.name,
        message: e.message,
        severity: e.severity,
        recovery: e.recovery,
        hint: `Error code ${e.code}: ${e.name}. Category: ${e.code.substring(0, 3)}.`
      });
    });
  }

  registerError(code, config) {
    this.errors.set(code, {
      code,
      ...config,
      timestamp: null,
      lastOccurrence: null
    });
  }

  setupRecovery() {
    this.recoveryStrategies.set('RESTART_GENERATOR', () => {
      try {
        window.location.reload();
      } catch (e) {
        console.error('Recovery failed:', e);
      }
    });

    this.recoveryStrategies.set('RESET_GENERATOR_STATE', () => {
      const generator = window.broadcastGenerator;
      if (generator) {
        generator.maxIterations = 50;
        generator.maxChars = 200;
      }
    });

    this.recoveryStrategies.set('RECREATE_OUTPUT_ELEMENT', () => {
      const existing = document.getElementById('output');
      if (!existing) {
        const container = document.querySelector('.output-container');
        if (container) {
          const textarea = document.createElement('textarea');
          textarea.id = 'output';
          textarea.rows = 8;
          textarea.setAttribute('aria-label', 'Broadcast generated');
          textarea.setAttribute('readonly', '');
          container.appendChild(textarea);
        }
      }
    });

    this.recoveryStrategies.set('REINITIALIZE_COUNTER', () => {
      try {
        window.updateCharCounter?.();
      } catch (e) {
        console.error('Counter reinitialization failed:', e);
      }
    });

    this.recoveryStrategies.set('REBUILD_MENUS', () => {
      try {
        document.location.reload();
      } catch (e) {
        console.error('Menu rebuild failed:', e);
      }
    });

    this.recoveryStrategies.set('RESET_ANIMATION_STATE', () => {
      window.typingInProgress = false;
    });

    this.recoveryStrategies.set('RESET_TEXTAREA_STYLES', () => {
      const textarea = document.getElementById('output');
      if (textarea) {
        textarea.className = '';
        textarea.style.cssText = '';
      }
    });

    this.recoveryStrategies.set('REAPPLY_COLOR_THEME', () => {
      const textarea = document.getElementById('output');
      if (textarea) {
        const length = textarea.value.length;
        textarea.classList.remove('color-error', 'color-warning', 'color-success');
        if (length > 200) {
          textarea.classList.add('color-error');
        } else if (length > 150) {
          textarea.classList.add('color-warning');
        } else {
          textarea.classList.add('color-success');
        }
      }
    });

    this.recoveryStrategies.set('MUTE_AUDIO', () => {
      window.audioMuted = true;
    });

    this.recoveryStrategies.set('RESET_OPTIONS', () => {
      const clearBtn = document.getElementById('clearBtn');
      if (clearBtn) clearBtn.click();
    });

    this.recoveryStrategies.set('CLEAR_LOCAL_STORAGE', () => {
      try {
        localStorage.clear();
        window.location.reload();
      } catch (e) {
        console.error('LocalStorage clear failed:', e);
      }
    });

    this.recoveryStrategies.set('FALLBACK_COPY', () => {
      const textarea = document.getElementById('output');
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
      }
    });

    this.recoveryStrategies.set('FULL_PAGE_RESET', () => {
      window.location.href = window.location.href;
    });

    this.recoveryStrategies.set('RECALC_CHAR_LIMIT', () => {
      const textarea = document.getElementById('output');
      if (textarea) {
        window.updateCharCounter?.();
      }
    });
  }

  logError(code, context = {}) {
    const errorConfig = this.errors.get(code);
    if (!errorConfig) {
      console.error(`Unknown error code: ${code}`);
      return;
    }

    const errorLog = {
      code,
      timestamp: new Date().toISOString(),
      severity: errorConfig.severity,
      name: errorConfig.name,
      message: errorConfig.message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorHistory.push(errorLog);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    try {
      const allErrors = JSON.parse(localStorage.getItem('broadcastErrorHistory') || '[]');
      allErrors.push(errorLog);
      localStorage.setItem('broadcastErrorHistory', JSON.stringify(allErrors.slice(-200)));
    } catch (e) {
      console.warn('Could not save error to localStorage:', e);
    }

    this.displayError(code, errorConfig);
    return errorLog;
  }

  displayError(code, config) {
    // Create full-screen error modal
    const modal = document.createElement('div');
    modal.className = 'error-modal-overlay';
    modal.innerHTML = `
      <div class="error-modal-content">
        <div class="error-modal-header">
          <span class="error-code-large">${code}</span>
          <span class="error-severity-badge error-severity-${config.severity.toLowerCase()}">${config.severity}</span>
        </div>
        <h2 class="error-modal-title">${config.name}</h2>
        <div class="error-modal-message">${config.message}</div>
        <div class="error-modal-hint">
          <strong>💡 Hint:</strong> ${config.hint || 'An error has occurred. Click Auto-Repair to attempt recovery.'}
        </div>
        <div class="error-modal-actions">
          <button class="error-btn-recover" data-code="${code}">🔧 AUTO-REPAIR</button>
          <button class="error-btn-debug" data-code="${code}">📊 DEBUG INFO</button>
          <button class="error-btn-close">❌ DISMISS</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.error-btn-recover').addEventListener('click', () => {
      this.attemptRecovery(code);
      modal.remove();
    });

    modal.querySelector('.error-btn-debug').addEventListener('click', () => {
      this.showDebugInfo(code);
    });

    modal.querySelector('.error-btn-close').addEventListener('click', () => {
      modal.remove();
    });

    setTimeout(() => {
      if (modal.parentNode) modal.remove();
    }, 15000);
  }

  attemptRecovery(code) {
    const config = this.errors.get(code);
    if (!config || !config.recovery) return;

    const strategy = this.recoveryStrategies.get(config.recovery);
    if (strategy) {
      try {
        strategy();
        this.showNotification(`✅ Successfully recovered from ${code}`, 'success');
      } catch (e) {
        this.logError('STA-001', { failedRecovery: code, error: e.message });
        this.showNotification(`❌ Recovery failed. Please refresh the page.`, 'error');
      }
    }
  }

  showDebugInfo(code) {
    const config = this.errors.get(code);
    const debugWindow = window.open('', '', 'width=800,height=600');

    debugWindow.document.write(`
      <html><head><title>Debug - ${code}</title><style>
        body { font-family: monospace; background: #1a1a1a; color: #0f0; padding: 20px; }
        pre { background: #000; padding: 15px; border-radius: 5px; overflow-x: auto; }
      </style></head><body>
      <h2>Debug Information - ${code}</h2>
      <pre>${JSON.stringify({
        error: config,
        lastErrors: this.errorHistory.slice(-5),
        pageState: {
          outputLength: document.getElementById('output')?.value?.length || 0,
          outputHTML: document.getElementById('output')?.innerHTML || 'N/A',
          menuButtons: Array.from(document.querySelectorAll('.menu-btn')).map(b => b.textContent.trim()),
          timestamp: new Date().toISOString()
        }
      }, null, 2)}</pre>
      </body></html>
    `);
  }

  showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#00cc66' : type === 'error' ? '#ff3333' : '#0066ff'};
      color: white;
      border-radius: 6px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  triggerErrorForTesting(code) {
    const config = this.errors.get(code);
    if (config) {
      this.displayError(code, config);
    } else {
      console.error(`Error code ${code} not found`);
    }
  }

  getErrorHistory() {
    return this.errorHistory;
  }

  getAllErrorCodes() {
    return Array.from(this.errors.keys());
  }

  exportErrorReport() {
    const report = {
      exported: new Date().toISOString(),
      errors: this.errorHistory,
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine
      }
    };
    return JSON.stringify(report, null, 2);
  }
}

// Initialize globally
window.errorHandler = new ErrorHandler();

export { ErrorHandler };
