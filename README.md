# 🛠️ Broadcast Generator

A broadcast message generator for SCP Site Roleplay, featuring advanced message customization and real-time preview.

## 🚀 Quick Start

**First time? Open `index.html` in your browser for full setup instructions!**

### Option 1: Quick Start Scripts (Easiest)

**On Windows:**
```bash
start-server.bat
```

**On Linux/Mac:**
```bash
./start-server.sh
```

Then open in browser: `http://localhost:8000/pages/home/index.html`

### Option 2: Manual Python Server

**On Linux/Mac:**
```bash
python3 -m http.server 8000
```

**On Windows:**
```bash
python -m http.server 8000
```

Then open in browser: `http://localhost:8000/pages/home/index.html`

### Option 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click any HTML file → "Open with Live Server"

### Option 4: Direct File Open

Simply open any HTML file directly in your browser (drag & drop or File → Open):

- Home page: `pages/home/index.html`
- Simple generator: `pages/broadcast/simple/index.html`
- Advanced generator: `pages/broadcast/advanced/index.html`
- SCP-914 Recipes: `pages/scp-914/index.html`

**⚠️ Important:** Some features may not work when opening files directly due to CORS restrictions. Use a local server (Options 1-3) for best experience.

## 🔧 Requirements

- **Python 3.x** (for local server) - [Download Python](https://www.python.org/downloads/)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installing Python

**Windows:**
1. Download from [python.org](https://www.python.org/downloads/)
2. Run installer
3. ✅ Check "Add Python to PATH" during installation

**Linux/Mac:**
- Usually pre-installed
- Or install via package manager: `apt install python3` (Ubuntu/Debian) or `brew install python3` (Mac)

## 📂 Project Structure

- `src/` — application source code
  - `scripts/` — JavaScript modules
  - `styles/` — CSS stylesheets
- `pages/` — HTML pages
- `assets/` — icons and images

## 🔔 Features

- **Simple & Advanced Modes**: Choose complexity level
- **Real-time Preview**: Live typewriter animation
- **Character Counter**: Roblox 200-char limit tracking
- **Copy Validation**: Prevents oversize messages
- **Dynamic Feedback**: Color-coded status (green/yellow/red)
- **Keyboard Shortcuts**: Power user efficiency
- **Easter Eggs**: Hidden features for exploration
- **SCP-914 Recipes**: Complete recipe database

## ⌨️ Keyboard Shortcuts (Advanced Mode)

- `Ctrl+Alt+C` / `Cmd+Option+C` — Copy to clipboard
- `Ctrl+Alt+X` / `Cmd+Option+X` — Clear all
- `Shift+?` — Show keyboard shortcuts

## 🎮 Easter Eggs

Try the Konami code and explore hidden features throughout the application!
