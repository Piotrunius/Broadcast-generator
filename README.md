# 🛠️ Broadcast Generator — Documentation & Developer Guide

Welcome! This is the central guide for using, testing, and developing the Broadcast Generator. It includes a sorted documentation hub, quick start, testing instructions, and advanced developer tooling.

## 🚀 Quick Start

- Start here: [docs/00-Start/START_HERE.md](docs/00-Start/START_HERE.md)
- Index: [docs/00-Start/DOCUMENTATION_INDEX.md](docs/00-Start/DOCUMENTATION_INDEX.md)

## 📂 Project Structure

- Code: [src](src) — application source
- Pages: [pages](pages) — HTML pages
- Docs: [docs](docs) — sorted documentation
	- 00-Start — entry points and navigation
	- 10-Guides — how-tos and troubleshooting
	- 20-References — reference materials and error codes
	- 30-Reports — reports and summaries
- Reports: [reports](reports) — project-level summaries (for stakeholders)
- Tests: [tests](tests) — manual test artifacts
- Tools: [tools](tools) — helper scripts

## 📖 Documentation (sorted)

- Simple Explanation: [docs/20-References/ENGLISH_EXPLANATION.md](docs/20-References/ENGLISH_EXPLANATION.md)
- Technical Deep Dive: [docs/10-Guides/BUG_FIX_DOCUMENTATION.md](docs/10-Guides/BUG_FIX_DOCUMENTATION.md)
- Project Summary: [docs/30-Reports/IMPLEMENTATION_REPORT.md](docs/30-Reports/IMPLEMENTATION_REPORT.md)
- Feature Details: [docs/30-Reports/FEATURE_IMPLEMENTATION_COMPLETE.md](docs/30-Reports/FEATURE_IMPLEMENTATION_COMPLETE.md)
- Testing Guide: [docs/10-Guides/QUICK_TEST_GUIDE.md](docs/10-Guides/QUICK_TEST_GUIDE.md)
- Error Handling: [docs/20-References/ERROR_CODES.md](docs/20-References/ERROR_CODES.md)
- Troubleshooting: [docs/10-Guides/TROUBLESHOOTING_GUIDE.md](docs/10-Guides/TROUBLESHOOTING_GUIDE.md)
- Keyboard Shortcuts: [docs/10-Guides/KEYBOARD_SHORTCUTS.md](docs/10-Guides/KEYBOARD_SHORTCUTS.md)
- Polish Version: [docs/30-Reports/PODSUMOWANIE_PL.md](docs/30-Reports/PODSUMOWANIE_PL.md)

## 🧪 Local Testing

Serve locally:

```bash
python3 -m http.server 8000
```

Open the app:

- Advanced generator: pages/broadcast/advanced/index.html

Manual error modal test page:

- [tests/test-error-system.html](tests/test-error-system.html)

## 🧰 Developer Tools

- Verify implementation: [tools/verify-implementation.sh](tools/verify-implementation.sh)
- Console helpers (from browser devtools):
	- `triggerTestError('GEN-001')` — show a sample error modal
	- `listErrorCodes()` — list all available codes
	- `getErrorHistory()` — show logged errors
   	- `window.__devPanel.show()` - Show A debug/easter egg window

## 🔔 Features Overview

- Hardened typewriter animation
- Live character counter (Roblox 200-char limit)
- Copy validation (prevents oversize messages)
- Dynamic color feedback (green/yellow/red)
- Error modal overlay with auto-recovery
- 100+ error codes across categories
- Keyboard shortcuts for power users

## 📈 Stakeholder Reports

- [reports/IMPLEMENTATION_COMPLETE.md](reports/IMPLEMENTATION_COMPLETE.md)
- [reports/IMPLEMENTATION_COMPLETE_SUMMARY.md](reports/IMPLEMENTATION_COMPLETE_SUMMARY.md)
- [reports/ERROR_SYSTEM_UPDATE.md](reports/ERROR_SYSTEM_UPDATE.md)
- [reports/FEATURES_SUMMARY.txt](reports/FEATURES_SUMMARY.txt)

## 🧭 Navigation Table

| Area | Link |
|------|------|
| Start | docs/00-Start/START_HERE.md |
| Index | docs/00-Start/DOCUMENTATION_INDEX.md |
| Guides | docs/10-Guides/ |
| References | docs/20-References/ |
| Reports | docs/30-Reports/ |
| Project Reports | reports/ |
| Tests | tests/ |
| Tools | tools/ |
