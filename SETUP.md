# Alexander Bridgeman's Portfolio - Setup Guide

## 🚀 Quick Start

This is a static HTML/CSS/JavaScript portfolio website with memory games. The project has been configured to run with a local development server.

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation & Running

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

   or

   ```bash
   npm run dev
   ```

3. **The website will automatically open in your browser** at an available port (typically http://localhost:8080 or similar)

## 🎮 Features

### Main Portfolio

- Personal portfolio page with links to projects
- Clean, responsive design
- Links to GitHub, LinkedIn, and YouTube

### Number Memorization Game

- Test your short-term memory with sequences of numbers
- Progressive difficulty (starts with 5 numbers, increases with each correct answer)
- Located at `/Number-Memorization-Game/numbergame.html`

### Symbol Memorization Game

- Similar to the number game but using symbols (♥, ⚑, ★, ☻, ♞, ⛹, ♛, ☂, ♫)
- Located at `/Number-Memorization-Game/symbolgame.html`

## 🔧 Troubleshooting

### Problem: "npm error code ENOENT" or "Could not read package.json"

**Solution:** This was the original issue. The project is now fixed with a proper `package.json` file.

### Problem: "Error: listen EADDRINUSE: address already in use"

**Solution:** The server will automatically find an available port. If issues persist:

1. Stop any other running servers
2. Try: `npm run serve` (runs without auto-opening browser)
3. Manually open the displayed URL in your browser

### Problem: Games not working

**Check:**

1. Make sure JavaScript is enabled in your browser
2. Open browser developer tools (F12) and check for console errors
3. Ensure all files are being served from the same domain (not file:// protocol)

## 📁 Project Structure

```
├── index.html              # Main portfolio page
├── style.css              # Main styles
├── package.json           # Project configuration & scripts
├── Number-Memorization-Game/
│   ├── index.html         # Game selection page
│   ├── numbergame.html    # Number memory game
│   ├── numberapp.js       # Number game logic
│   ├── numberstyle.css    # Number game styles
│   ├── symbolgame.html    # Symbol memory game
│   ├── symbolapp.js       # Symbol game logic
│   └── symbolstyle.css    # Symbol game styles
└── images/
    └── websiteimages.psd
```

## 🌐 Alternative Serving Methods

If you prefer not to use npm, you can also serve this project using:

### Python (if installed)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### PHP (if installed)

```bash
php -S localhost:8000
```

### Live Server (VS Code Extension)

Install the "Live Server" extension in VS Code and right-click on `index.html` → "Open with Live Server"

## 🔍 Development Notes

- This is a static website that doesn't require a build process
- All games work entirely in the browser with vanilla JavaScript
- No external API calls or backend required
- Responsive design works on mobile and desktop
- Uses Google Fonts (Inconsolata, Rubik) for typography

## 📄 License

MIT License - See LICENSE file for details
