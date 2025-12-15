# ERROR CODE REFERENCE GUIDE

Complete documentation of all error codes, their meanings, solutions, and prevention strategies for the Broadcast Generator application.

## 📋 Error Code System

**Format:** `[SECTION]-[NUMBER]`
**Example:** `GEN-001`, `UI-002`, `STY-001`

Sections:
- **GEN** - Generator/Logic errors
- **UI** - User interface errors
- **STY** - Styling/CSS errors
- **AUD** - Audio system errors
- **DAT** - Data/State errors
- **NET** - Network/Clipboard errors
- **STA** - Overall application state errors

---

## 🔴 CRITICAL ERRORS (Requires immediate attention)

### GEN-001: Generator Infinite Loop Detection
**Severity:** CRITICAL
**Message:** Generator exceeded iteration limits

**What it means:**
The message generator encountered a situation where it would loop indefinitely. This safety mechanism kicked in to prevent complete application freeze.

**Typical causes:**
- Corrupted message parts object
- Circular reference in message structure
- Infinite loop in shrink/expand algorithm

**How to fix:**
1. Click **"Auto-Repair"** button
2. If that doesn't work, click **"Recover"** (page refresh)
3. Check browser console for detailed error logs

**Prevention:**
- Avoid manually modifying `messageParts` array
- Don't remove the `maxIterations = 50` safety limit from generator
- Test generator with extreme inputs (very long messages)

**Developer notes:**
```javascript
// The generator has built-in safeguards:
if (shrinkIterations >= this.maxIterations) {
  overflow = true;
  break; // Force exit after 50 iterations max
}
```

---

### UI-001: Output Element Missing
**Severity:** CRITICAL
**Message:** Output textarea element (#output) not found

**What it means:**
The main message output textarea doesn't exist in the DOM. Without it, there's nowhere to display generated messages.

**Typical causes:**
- HTML file corrupted or modified
- JavaScript loaded before HTML renders
- CSS hidden the element

**How to fix:**
1. Click **"Auto-Repair"** - system will recreate element
2. If still broken, refresh the page
3. Check that HTML contains: `<textarea id="output" readonly></textarea>`

**Prevention:**
- Never delete or rename the `#output` element
- Don't use CSS to hide it (`display: none`)
- Ensure main-advanced.js loads after HTML is ready

**HTML requirement:**
```html
<div class="output-container">
  <textarea id="output" rows="8" aria-label="Broadcast generated" readonly></textarea>
</div>
```

---

## 🟠 HIGH PRIORITY ERRORS

### GEN-002: Invalid Message Parts
**Severity:** HIGH
**Message:** Message parts object is malformed

**What it means:**
The message parts array (which contains individual broadcast components) is missing required properties or has invalid structure.

**Typical causes:**
- Manual modification of `messageParts`
- Incomplete initialization of generator
- Data corruption from external interference

**How to fix:**
1. Click **"Auto-Repair"** to reset generator state
2. Clear all selections and restart
3. If persists, use full page reset

**Prevention:**
- Keep message parts as read-only where possible
- Validate structure before use
- Use TypeScript/JSDoc for type checking

**Valid message part structure:**
```javascript
{
  text: "message text",           // String content
  levels: ["brief", "medium", "verbose"],  // Array of detail levels
  currentLevel: "medium",         // Current detail level
  priority: 5,                    // Integer 1-10
  getFormatted: function() {      // Function to format text
    return "[SCP-" + this.text + "]";
  }
}
```

---

### GEN-003: Character Limit Calculation Error
**Severity:** HIGH
**Message:** Character limit calculation returned invalid value

**What it means:**
The 200-character limit checker is not working properly, potentially allowing oversized messages to be sent.

**How to fix:**
1. Click **"Auto-Repair"** to recalculate
2. Check that counter displays correct count
3. Test by typing message and watching counter

**Prevention:**
- Ensure `maxChars = 200` is set in generator
- Test counter with messages of various lengths
- Validate output length before copying

---

### UI-003: Menu System Breakdown
**Severity:** HIGH
**Message:** Menu system not functioning properly

**What it means:**
Menu buttons don't open/close or selections aren't registering.

**Typical causes:**
- Event listeners not attached
- CSS preventing interaction
- JavaScript not loaded

**How to fix:**
1. Check browser console for JavaScript errors
2. Click **"Auto-Repair"**
3. If still broken, try full page refresh
4. Check that CSS hasn't hidden menu elements

**Prevention:**
- Don't modify menu HTML structure
- Ensure `main-advanced.js` is loaded as module
- Test all menus work before deployment

---

### DAT-001: Broadcast Options Invalid
**Severity:** HIGH
**Message:** getBroadcastOptions() returned invalid data

**What it means:**
The function that collects all menu selections returned garbage or incomplete data.

**How to fix:**
1. Click **"Clear"** to reset all selections
2. Make fresh selections
3. Try again

**Prevention:**
- Don't manually manipulate menu selection states
- Keep all menu buttons in valid state
- Test getBroadcastOptions() with various selections

---

## 🟡 MEDIUM PRIORITY ERRORS

### UI-002: Character Counter Display Error
**Severity:** MEDIUM
**Message:** Character counter failed to update

**What it means:**
The "X/200" counter isn't displaying or updating as you type.

**Typical causes:**
- Counter element was deleted
- CSS styling broken
- updateCharCounter() not called

**How to fix:**
1. Click **"Auto-Repair"** to reinitialize
2. Type something - counter should appear below output
3. If no counter, check browser console

**Prevention:**
- Don't delete char-counter DOM elements manually
- Keep CSS styling intact for `#char-counter`
- Ensure `updateCharCounter()` is called after text changes

---

### UI-004: Animation Loop Failed
**Severity:** MEDIUM
**Message:** Typewriter animation encountered an error

**What it means:**
The smooth character-by-character typing animation crashed.

**How to fix:**
1. Click **"Auto-Repair"** to reset animation state
2. Make a selection - animation should work again
3. If still broken, close and reopen menu

**Prevention:**
- Don't manually set `typingInProgress = true`
- Keep animation timeout management clean
- Test animation with rapid menu changes

---

### STY-001: Textarea Style Corruption
**Severity:** MEDIUM
**Message:** Output textarea styling is invalid

**What it means:**
The textarea color/border/shadow effects aren't displaying correctly.

**How to fix:**
1. Click **"Auto-Repair"** to reset styles
2. Textarea color should match character count (green/yellow/red)
3. If not, check CSS file for corruption

**Prevention:**
- Don't inline style the textarea
- Use CSS classes: `.color-success`, `.color-warning`, `.color-error`
- Keep broadcast-advanced.css intact

---

### NET-001: Clipboard API Failed
**Severity:** MEDIUM
**Message:** Failed to copy text to clipboard

**What it means:**
Browser blocked clipboard access when you clicked Copy.

**Typical causes:**
- Browser permissions denied
- HTTPS required but not available
- Browser doesn't support Clipboard API

**How to fix:**
1. Check browser notification for permission request
2. Click "Allow" for clipboard access
3. Try copying again
4. Auto-recovery will use fallback method

**Prevention:**
- Request clipboard permission early
- Use HTTPS in production (required for Clipboard API)
- Test clipboard access before deploying

---

### DAT-002: Local Storage Corruption
**Severity:** MEDIUM
**Message:** Local storage data is corrupted

**What it means:**
Saved preferences/history in browser storage are corrupted.

**How to fix:**
1. Click **"Auto-Repair"** - will clear storage and refresh
2. Preferences will reset to defaults
3. System will work normally

**Prevention:**
- Be careful with localStorage modifications
- Validate data before storing
- Keep storage clean (don't store huge objects)

---

## 🟢 LOW PRIORITY ERRORS

### AUD-001: Audio Manager Failure
**Severity:** LOW
**Message:** Audio playback failed

**What it means:**
Click sounds and success/error beeps won't play.

**Typical causes:**
- Browser has audio muted
- Audio permissions denied
- Web Audio API not supported

**How to fix:**
1. Check if browser/tab volume is muted
2. Allow audio permissions if requested
3. Application will still work without audio
4. Click **"Auto-Repair"** to mute (graceful fallback)

**Prevention:**
- Test audio on different browsers
- Have graceful degradation without audio
- Show visual feedback in addition to audio

---

### STY-002: Color Theme Inconsistency
**Severity:** LOW
**Message:** Color theme not properly applied

**What it means:**
Some colors might be slightly off or inconsistent.

**How to fix:**
1. Click **"Auto-Repair"** to reapply colors
2. Textarea should show green/yellow/red based on character count
3. Counter should match textarea color

**Prevention:**
- Use CSS variables for consistent colors
- Keep color system documented
- Test on different monitors/lighting

---

## 🔍 DIAGNOSTIC AND DEBUG SYSTEM

### How to Access Error History

**In Browser Console:**
```javascript
// View all errors that occurred
window.errorHandler.getErrorHistory()

// Export error report for developer
console.log(window.errorHandler.exportErrorReport())

// Check if there are issues
const diag = performDiagnostics()
console.log(diag)
```

**Debug Window:**
- When you see an error notification, click **"Debug Info"**
- A new window opens with detailed debug information
- Includes error stack, page state, and browser info

### Error History Storage
- Last 50 errors stored in memory
- Last 100 errors stored in browser localStorage
- Accessible at: `localStorage.getItem('broadcastErrorHistory')`

---

## 🛠️ RECOVERY STRATEGIES

Each error has an automatic recovery strategy:

| Strategy | Action |
|----------|--------|
| RESTART_GENERATOR | Reload page |
| RESET_GENERATOR_STATE | Reset generator properties |
| RECREATE_OUTPUT_ELEMENT | Create missing textarea |
| REINITIALIZE_COUNTER | Recreate character counter |
| REBUILD_MENUS | Reload page with fresh menu state |
| RESET_ANIMATION_STATE | Reset typing animation flags |
| RESET_TEXTAREA_STYLES | Remove all inline styles |
| REAPPLY_COLOR_THEME | Reapply green/yellow/red colors |
| MUTE_AUDIO | Disable audio system |
| RESET_OPTIONS | Clear all selections |
| CLEAR_LOCAL_STORAGE | Wipe and refresh |
| FALLBACK_COPY | Use old-school copy method |
| FULL_PAGE_RESET | Complete reload |

---

## 🧪 MANUAL TESTING ERROR SCENARIOS

### Test GEN-001 (infinite loop)
```javascript
// This would trigger the safety limit:
generator.maxIterations = 1; // Force early exit
generator.generate({alarm: 'HIGH', events: ['610', '076', '323']})
```

### Test UI-001 (missing output)
```javascript
document.getElementById('output').remove()
// Click Recovery button - element recreates
```

### Test UI-002 (broken counter)
```javascript
document.getElementById('char-counter').remove()
// Click Recovery button - counter reinitializes
```

### Test AUD-001 (audio fails)
```javascript
window.audioMuted = true
// Audio disabled gracefully
```

---

## 📊 ERROR SEVERITY LEVELS

| Level | Blocks | Impact | Response |
|-------|--------|--------|----------|
| CRITICAL | Yes | App unusable | Auto-repair + reload |
| HIGH | Partially | Major feature broken | Auto-repair or fix manually |
| MEDIUM | No | Minor degradation | Auto-recover, graceful fallback |
| LOW | No | Cosmetic issue | Ignore or auto-fix |

---

## 🔗 RELATED DOCUMENTATION

- [Main Bug Fix Documentation](../10-Guides/BUG_FIX_DOCUMENTATION.md) - Technical details
- [Testing Guide](../10-Guides/QUICK_TEST_GUIDE.md) - How to test manually
- [Feature Guide](../30-Reports/FEATURE_IMPLEMENTATION_COMPLETE.md) - How features work

---

## 📝 LOGGING ERRORS

To log a custom error:

```javascript
errorHandler.logError('GEN-001', {
  context: 'Additional info',
  value: someDebugValue
})
```

To display custom notification:

```javascript
errorHandler.showNotification('Something happened!', 'success')
// Types: 'success', 'error', 'info'
```

---

**Last Updated:** December 15, 2025
**Error System Version:** 1.0.0
**Total Error Codes:** 14
