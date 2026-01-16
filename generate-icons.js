// Simple icon generator using Node.js
// Run with: node generate-icons.js
// Requires: npm install canvas (or use generate-icons.html in browser)

const fs = require('fs');

function createIcon(size) {
    // Create a simple SVG icon
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <path d="M ${size*0.35} ${size*0.3} L ${size*0.65} ${size*0.4} L ${size*0.4} ${size*0.5} L ${size*0.65} ${size*0.7} L ${size*0.25} ${size*0.6} L ${size*0.6} ${size*0.5} Z" fill="white"/>
</svg>`;
    
    return svg;
}

try {
    // Try to use canvas library if available
    const { createCanvas } = require('canvas');
    
    function createPNGIcon(size, filename) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#6b7280');
        gradient.addColorStop(1, '#9ca3af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Draw lightning bolt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const centerX = size / 2;
        const centerY = size / 2;
        const boltWidth = size * 0.15;
        const boltHeight = size * 0.4;
        
        ctx.moveTo(centerX - boltWidth * 0.3, centerY - boltHeight * 0.5);
        ctx.lineTo(centerX + boltWidth * 0.5, centerY - boltHeight * 0.2);
        ctx.lineTo(centerX - boltWidth * 0.2, centerY);
        ctx.lineTo(centerX + boltWidth * 0.3, centerY + boltHeight * 0.5);
        ctx.lineTo(centerX - boltWidth * 0.5, centerY + boltHeight * 0.2);
        ctx.lineTo(centerX + boltWidth * 0.2, centerY);
        ctx.closePath();
        ctx.fill();
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filename, buffer);
        console.log(`Created ${filename}`);
    }
    
    createPNGIcon(192, 'icon-192.png');
    createPNGIcon(512, 'icon-512.png');
    console.log('Icons created successfully!');
    
} catch (error) {
    console.log('Canvas library not available. Creating SVG icons instead...');
    console.log('For PNG icons, either:');
    console.log('  1. Run: npm install canvas');
    console.log('  2. Or open generate-icons.html in a browser');
    
    // Create SVG icons as fallback
    fs.writeFileSync('icon-192.svg', createIcon(192));
    fs.writeFileSync('icon-512.svg', createIcon(512));
    console.log('Created SVG icons. Please convert to PNG or use generate-icons.html');
}
