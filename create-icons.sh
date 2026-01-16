#!/bin/bash
# Simple script to create PNG icons from SVG using available tools

echo "Creating PWA icons..."

# Try different methods to convert SVG to PNG
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert -background none -resize 192x192 icon-192.svg icon-192.png
    convert -background none -resize 512x512 icon-512.svg icon-512.png
    echo "✓ Icons created!"
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    rsvg-convert -w 192 -h 192 icon-192.svg > icon-192.png
    rsvg-convert -w 512 -h 512 icon-512.svg > icon-512.png
    echo "✓ Icons created!"
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape..."
    inkscape icon-192.svg --export-type=png --export-filename=icon-192.png -w 192 -h 192
    inkscape icon-512.svg --export-type=png --export-filename=icon-512.png -w 512 -h 512
    echo "✓ Icons created!"
else
    echo "No conversion tool found. Please:"
    echo "  1. Open generate-icons.html in a browser and download the icons"
    echo "  2. Or install ImageMagick: brew install imagemagick"
    echo "  3. Or use the Python script: pip install Pillow && python3 generate-icons.py"
fi
