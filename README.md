# ⚡ Speed Reader

A modern, installable Progressive Web App (PWA) for speed reading text using Rapid Serial Visual Presentation (RSVP).

## Features

- 🚀 **Speed Reading**: Adjustable reading speed from 100 to 1000 words per minute
- 📝 **Text Input**: Paste or type text directly into the app
- ⚙️ **Customizable**: Control words per flash (1-5 words)
- 📊 **Progress Tracking**: Real-time stats showing progress, words read, and time remaining
- 📱 **PWA Ready**: Installable as a Progressive Web App on any device
- 🎨 **Modern UI**: Beautiful dark theme with gradient accents

## Getting Started

### Generate Icons (Required for PWA)

Before using the app as a PWA, you need to generate the icon files:

**Option 1: Using the HTML Generator (Recommended)**
1. Open `generate-icons.html` in your web browser
2. Click the download buttons to save `icon-192.png` and `icon-512.png`
3. Save them in the project root directory

**Option 2: Using Node.js**
```bash
npm install canvas
node generate-icons.js
```

**Option 3: Using Python**
```bash
pip install Pillow
python3 generate-icons.py
```

### Running the App

1. Simply open `index.html` in a web browser
2. Or serve it using a local web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```
3. Navigate to `http://localhost:8000` in your browser

### Installing as PWA

1. Open the app in a supported browser (Chrome, Edge, Safari, Firefox)
2. Look for the install prompt or use the browser's menu:
   - **Chrome/Edge**: Click the install icon in the address bar
   - **Safari (iOS)**: Tap Share → Add to Home Screen
   - **Firefox**: Use the browser menu to install
3. The app will be installed and can be launched like a native app

## How to Use

1. **Paste or type your text** into the text area
2. **Adjust settings**:
   - **Reading Speed**: Set words per minute (100-1000 WPM)
   - **Words per Flash**: How many words to show at once (1-5)
3. **Click "Start Reading"** to begin
4. **Use controls**:
   - **Pause**: Temporarily stop reading
   - **Reset**: Start over from the beginning

## Technical Details

- **Pure JavaScript**: No frameworks required
- **Service Worker**: Enables offline functionality and PWA features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Keyboard navigation and focus indicators included

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS and macOS)
- Any modern browser with Service Worker support

## License

Free to use and modify.
