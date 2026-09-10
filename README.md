# Broadcast Generator

> Tools for Roblox SCP Site Roleplay

A web-based control panel featuring a broadcast generator and SCP-914 recipe analyzer, designed specifically for the SCP Site Roleplay game on Roblox.

## 🎯 Features

### Broadcast Generator

- **Simple Mode**: Generate standard broadcasts for SCP containment events
- **Advanced Mode**: Create custom broadcasts with additional options and Easter eggs
- Support for multiple SCP breach scenarios (SCP-035, SCP-008, SCP-076, SCP-323, SCP-409, SCP-610, SCP-701, etc.)
- Site lockdown announcements
- Customizable event messages

### SCP-914 Recipes

- Interactive recipe calculator
- Search and filter inputs/outputs
- Autocomplete functionality (TAB key)
- View refinement paths and optimal routes
- All recipes sourced from [SCP-914 Wiki](https://scpsiteroleplay.miraheze.org/wiki/SCP-914)

### Performance Features

- **Performance Mode**: Toggle animations for better performance on lower-end devices
- **Audio Controls**: Manage sound effects
- Responsive design for various screen sizes
- Optimized loading with FOUC (Flash of Unstyled Content) prevention

## 🚀 Getting Started

### Online Access

Visit the live site: [Live Site](https://aresysite.github.io/Broadcast-generator)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/aresysite/Broadcast-generator.git
cd Broadcast-generator
```

2. Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
Broadcast-generator/
├── assets/
│   └── icons/          # SCP logos and icons
├── pages/
│   ├── broadcast/      # Broadcast generator pages
│   │   ├── simple/     # Simple broadcast mode
│   │   └── advanced/   # Advanced broadcast mode (if applicable)
│   ├── home/           # Main control panel
│   └── scp-914/        # SCP-914 recipe analyzer
├── src/
│   ├── scripts/        # JavaScript functionality
│   │   ├── core/       # Core utilities (animations, particles, audio)
│   │   ├── broadcast/  # Broadcast generator logic
│   │   └── scp-914/    # SCP-914 calculator logic
│   └── styles/         # CSS stylesheets
│       ├── base/       # Base styles and animations
│       └── pages/      # Page-specific styles
├── index.html          # Entry point (redirects to home)
└── LICENSE
```

## 🎮 Usage

### Broadcast Generator

1. Navigate to the **Broadcast Generator** from the control panel
2. Choose between Simple or Advanced mode
3. Select an SCP breach event or site status
4. Customize the message if needed
5. Copy the generated broadcast for use in-game

### SCP-914 Recipes

1. Click **SCP-914 RECIPES** from the control panel
2. Enter an input item in the search field
3. Enter an output item (optional - leaving blank shows all possible outputs)
4. Press **CALCULATE RECIPES** or hit Enter
5. View the refinement path and settings needed

**Tips:**

- Press TAB to autocomplete
- Press ENTER to calculate
- Use CLEAR to reset fields
- Highlighted settings show refinement type

## 🛠️ Technologies

- **HTML5**: Structure and content
- **CSS3**: Styling and animations
- **JavaScript (ES6+)**: Interactive functionality
- **Umami Analytics**: Privacy-focused analytics
- **Copilot**: Built with the help of modern AI tools to ensure clean and efficient code.

## 📊 Language Composition

- JavaScript: 54.7%
- CSS: 34.5%
- HTML: 10.8%

## 🔄 Recent Updates

### January 5, 2026

- Removed icons for status menu
- Added colors and animations for broadcast simple page menus
- Added ability to modify simple broadcasts
- Fixed simple broadcast page UI on low resolutions

### January 3, 2026

- Advanced mode added
- New animations
- New credits page
- Performance mode
- Easter eggs in advanced mode

[View full changelog in the application]

## 👥 Credits

- **Project Lead**: victorbot365
- **Developer**: Piotrunius
- **Special Thanks**: SCP Site Roleplay Community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/aresysite/Broadcast-generator/issues).

## ⚠️ Disclaimer

This tool is fan-made and is not officially affiliated with the SCP Foundation or Roblox SCP Site Roleplay. All SCP-related content is based on works shared under Creative Commons.

---

© 2026 victorbot365 & Piotrunius
