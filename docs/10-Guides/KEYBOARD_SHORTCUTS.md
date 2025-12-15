# KEYBOARD SHORTCUTS REFERENCE

Quick keyboard shortcuts for power users.

## 🎯 Main Shortcuts

### Recovery & Auto-Fix
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- **Action:** Auto-diagnose and fix issues
- **Tip:** Use this when something seems broken

### Copy to Clipboard
- **Windows/Linux:** `Ctrl + Alt + C`
- **Mac:** `Cmd + Option + C`
- **Action:** Copy generated message to clipboard
- **Tip:** Faster than clicking the Copy button

### Clear Output
- **Windows/Linux:** `Ctrl + Alt + X`
- **Mac:** `Cmd + Option + X`
- **Action:** Wipe the output box and reset counter
- **Tip:** Quick reset between broadcasts

### Help (Shortcuts)
- **All platforms:** `Shift + ?`
- **Action:** Display keyboard shortcuts help dialog
- **Tip:** Can't remember a shortcut? Press this

---

## 🎮 How They Work

### Recovery Shortcut
When you press `Ctrl+Shift+R`:
1. The Recovery button is automatically clicked
2. System scans for problems
3. Shows what was fixed (or if nothing needed fixing)
4. You see a green feedback message
5. Same as clicking the button, but faster!

### Copy Shortcut
When you press `Ctrl+Alt+C`:
1. Your message is copied to clipboard
2. You'll see "Copied to clipboard" feedback
3. Ready to paste anywhere
4. Works same as Copy button

### Clear Shortcut
When you press `Ctrl+Alt+X`:
1. Output box becomes empty
2. Character counter resets to 0/200
3. All menus go back to default selections
4. Ready to generate a new message

### Help Shortcut
When you press `Shift+?`:
1. A help dialog pops up
2. Shows all available shortcuts
3. Displays both Windows/Linux and Mac versions
4. Press Escape to close

---

## 💡 Pro Tips

### Chaining Shortcuts
1. Generate a message
2. Press `Ctrl+Alt+C` to copy
3. Press `Ctrl+Alt+X` to clear
4. Make new selections
5. Repeat!

### Recovery Workflow
If something feels off:
1. Press `Ctrl+Shift+R` (auto-recover)
2. Wait for confirmation
3. Continue working

Don't need to click anything or wait for Recovery button to appear!

### Mac Users
- Replace `Ctrl` with `Cmd`
- Replace `Alt` with `Option`
- Rest of shortcuts work exactly the same

### Linux Users
- Same as Windows: `Ctrl`, `Alt`, etc.
- Works with all Linux distributions

---

## ⌨️ Visual Feedback

When you use a keyboard shortcut, you'll see:
- A **green notification** appears briefly
- It tells you what action was performed
- Message disappears after 2 seconds
- Completely non-intrusive

---

## 🎓 Learning Shortcuts

### Week 1: Start with the essential shortcut
- Just learn `Ctrl+Shift+R` for recovery
- Use it whenever you need to fix something

### Week 2: Add copy shortcut
- Learn `Ctrl+Alt+C` to copy
- Saves clicking the button repeatedly

### Week 3: Add clear shortcut
- Learn `Ctrl+Alt+X` to reset
- Speeds up workflow between messages

### Week 4: Bonus shortcuts
- Use `Shift+?` to reference help anytime
- Master all of them!

---

## 🔄 Troubleshooting Shortcuts

### Shortcut not working?

**Check 1: Modifier keys**
```
Windows/Linux: Ctrl, Alt, Shift
Mac: Cmd, Option, Shift (Cmd = Ctrl, Option = Alt)
```

**Check 2: Order matters**
- Hold down modifier keys FIRST
- Then press the letter key
- Not: Letter + modifiers

**Check 3: Browser interference**
Some browsers/extensions catch keyboard shortcuts first:
- Try disabling extensions
- Try incognito/private mode
- Try different browser

**Check 4: System shortcuts**
Your system might be using these:
- Try in fullscreen mode
- Or try different shortcuts

---

## 📝 Custom Shortcuts (Advanced)

Want to add your own? Edit [main-advanced.js](../src/scripts/broadcast/advanced/main-advanced.js) in the `setupKeyboardShortcuts()` function:

```javascript
// Example: Add Ctrl+K for something custom
if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
  e.preventDefault();
  // Your custom action here
  doSomething();
}
```

---

## 🎯 One-Sheet Summary

| Windows/Linux | Mac | Action |
|---|---|---|
| `Ctrl+Shift+R` | `Cmd+Shift+R` | Auto-recover & diagnose |
| `Ctrl+Alt+C` | `Cmd+Option+C` | Copy to clipboard |
| `Ctrl+Alt+X` | `Cmd+Option+X` | Clear output |
| `Shift+?` | `Shift+?` | Show this help |

---

**Last Updated:** December 15, 2025
