# TROUBLESHOOTING & DEBUGGING GUIDE

Quick reference for fixing issues in the Broadcast Generator.

## 🚀 Quick Start: Emergency Recovery

**Something broken?** Press the **🔧 Recover** button. It:
1. Diagnoses what's wrong
2. Automatically fixes most issues
3. Shows you what was fixed

---

## 🔍 5-Step Troubleshooting Process

### Step 1: Check Browser Console
Press `F12` → Click **Console** tab

**Look for:**
- Red error messages
- Yellow warnings
- Stack traces

**Common errors:**
```
Uncaught TypeError: Cannot read property 'value' of null
→ Element missing, click Recovery button

Uncaught SyntaxError: Unexpected token
→ JavaScript file corrupted, reload page

CORS error
→ Server issue, check network
```

### Step 2: Click Recovery Button
- Located top-right of controls panel
- Will auto-diagnose and attempt repairs
- Shows what it fixed

### Step 3: Check Menu States
- Open each menu (Brief, Medium, Verbose)
- Selections should highlight
- All options should be clickable
- If not, something's broken

### Step 4: Test Output
- Type something in menus
- Message should appear in large text box
- Character counter should show below
- Color should match count (green/yellow/red)

### Step 5: Try Full Reset
If nothing works:
1. Refresh page (Ctrl+R or Cmd+R)
2. Open menu and make selection
3. If still broken, clear browser cache and refresh

---

## 🧪 Testing Checklist

Before deploying changes, test these:

### ✅ Core Generation
- [ ] Select from Brief menu
- [ ] Select from Medium menu
- [ ] Select from Verbose menu
- [ ] Message appears in output
- [ ] Character counter updates
- [ ] No JavaScript errors in console

### ✅ Animation
- [ ] Text types smoothly (not jumpy)
- [ ] Changing selection updates text naturally
- [ ] Animation stops when text is done
- [ ] No duplicate characters appear

### ✅ Color System
- [ ] Text is GREEN for 0-150 chars
- [ ] Text is YELLOW for 151-200 chars
- [ ] Text is RED for 201+ chars
- [ ] Color changes smoothly when typing

### ✅ Buttons
- [ ] **Clear** button wipes output
- [ ] **Copy** button copies to clipboard
- [ ] **Recover** button appears and works
- [ ] Buttons have hover effects

### ✅ Error Handling
- [ ] Recovery button appears
- [ ] Click it shows diagnostics
- [ ] Error notifications appear when needed
- [ ] Auto-dismiss after 10 seconds
- [ ] Notification has action buttons

### ✅ Mobile Responsiveness
- [ ] Menus stack properly
- [ ] Buttons aren't too small
- [ ] Text box is readable
- [ ] No horizontal scrolling needed

---

## 🐛 Common Issues & Fixes

### Issue: Output box empty or missing
**What to do:**
1. Check HTML has: `<textarea id="output" readonly></textarea>`
2. Click Recovery button
3. Reload page

### Issue: Character counter broken
**What to do:**
1. Check HTML has: `<span id="char-counter">0/200</span>`
2. Click Recovery button
3. Type something - counter should update

### Issue: Colors not changing
**What to do:**
1. Check CSS has color classes:
   - `.color-success`
   - `.color-warning`
   - `.color-error`
2. Click Recovery button
3. Type 200+ characters - should turn red

### Issue: Animation super slow
**What to do:**
1. Check line 443 in main-advanced.js has: `await sleep(25);`
2. Lower number = faster typing (15ms is snappy)
3. Higher number = slower typing (50ms is very slow)
4. Default is 25ms

### Issue: Can't copy to clipboard
**What to do:**
1. Check browser allows clipboard access
2. Click the Copy button - browser may ask permission
3. Grant permission
4. Try again

### Issue: Messages appear broken
**What to do:**
1. Check broadcast-data.js has valid message parts
2. Ensure all parts have `text`, `levels`, `currentLevel`
3. Reload page

---

## 🔧 Developer Console Commands

Paste these in browser console (F12) to debug:

### Check application state
```javascript
// See what's currently selected
console.log(window.broadcastGenerator)

// Check error history
console.log(window.errorHandler.getErrorHistory())

// See all stored errors
console.log(JSON.parse(localStorage.getItem('broadcastErrorHistory')))

// Check diagnostic results
console.log(performDiagnostics())
```

### Test features
```javascript
// Manually trigger output update
updateCharCounter()

// Force update colors
updateOutputColor()

// Test animation
typeText("TEST MESSAGE")

// Trigger an error
errorHandler.logError('TEST-001', {message: 'Testing'})

// Show test notification
errorHandler.showNotification('Test message', 'info')
```

### Reset everything
```javascript
// Clear all errors
localStorage.removeItem('broadcastErrorHistory')

// Reset generator
window.broadcastGenerator.reset()

// Full diagnostic
performDiagnostics()
```

---

## 📊 Performance Optimization

### If animation is laggy:
1. Check computer's CPU usage
2. Close extra browser tabs
3. Reduce animation time (lower sleep value)
4. Skip animation for large changes (currently >60%)

### If page is slow:
1. Check Network tab in DevTools
2. Compress CSS files
3. Lazy-load images
4. Check for infinite loops in console

### Monitor performance:
```javascript
// Check how long operations take
console.time('operation')
// ... do something ...
console.timeEnd('operation')
```

---

## 🎯 Error Code Quick Reference

**Seeing error codes?** Check [ERROR_CODES.md](../20-References/ERROR_CODES.md) for details.

**Common codes:**
- `GEN-001` → Generator loop issue
- `UI-001` → Output box missing
- `UI-002` → Counter broken
- `STY-001` → Colors broken
- `NET-001` → Can't copy

---

## 📱 Mobile Issues

### Touch events not working
1. Check buttons are large enough (min 44px)
2. Test on actual device (simulator can be finicky)
3. Check for pointer/touch event listeners

### Text box too small
1. Check CSS for `min-height` on textarea
2. Ensure viewport meta tag exists
3. Test at different screen sizes

### Menus not scrolling
1. Check CSS `max-height` on menu containers
2. Ensure `overflow: auto` is set
3. Test on real device

---

## 🔐 Security Notes

### When clearing localStorage:
```javascript
localStorage.clear()
// Careful - this clears ALL sites' data
```

### Safe alternative:
```javascript
localStorage.removeItem('broadcastErrorHistory')
// Only clears our error history
```

### Avoid exposing:
- Don't log passwords to console
- Don't commit localStorage dumps to git
- Be careful with error messages (may contain user data)

---

## 📞 Getting More Help

1. **Check error message** - Click "Debug Info" on notification
2. **Read error documentation** - See [ERROR_CODES.md](../20-References/ERROR_CODES.md)
3. **Check browser console** - F12 → Console tab
4. **Test with Recovery button** - Often fixes itself
5. **Clear cache and reload** - Hard refresh (Ctrl+Shift+R)
6. **Check HTML structure** - Ensure no elements are deleted

---

## 🎓 Understanding the System

**How errors are caught:**
1. Something goes wrong → Logged to errorHandler
2. Error given a code (GEN-001, UI-002, etc.)
3. Recovery strategy defined for that code
4. Notification shown to user
5. Auto-repair button attempts recovery

**How recovery works:**
1. Diagnostics check what's broken
2. Appropriate fix strategy applied
3. Result verified
4. Success/failure shown to user

**How colors work:**
- 0-150 chars = Green ✅
- 151-200 chars = Yellow ⚠️
- 201+ chars = Red ❌

---

## 📋 Maintenance Checklist

**Weekly:**
- [ ] Check error logs (localStorage)
- [ ] Test all menus work
- [ ] Test copy functionality
- [ ] Verify colors change properly

**Monthly:**
- [ ] Clear old error logs
- [ ] Check browser compatibility
- [ ] Test on mobile devices
- [ ] Review performance metrics

**Before deployment:**
- [ ] Full test checklist (see above)
- [ ] Clear errors from localStorage
- [ ] Test on target browsers
- [ ] Check all links work
- [ ] Verify error handling system

---

**Last Updated:** December 15, 2025
**Version:** 1.0.0
