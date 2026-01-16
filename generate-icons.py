#!/usr/bin/env python3
"""
Generate PWA icons for Speed Reader app.
Requires Pillow: pip install Pillow
"""

import sys

try:
    from PIL import Image, ImageDraw

    def create_icon(size, filename):
        """Create an icon with gradient background and lightning bolt."""
        # Create image with gradient background
        img = Image.new('RGB', (size, size), color='#6b7280')
        draw = ImageDraw.Draw(img)
        
        # Draw gradient-like effect (gray gradient)
        for i in range(size):
            r = int(107 + (156 - 107) * i / size)
            g = int(114 + (163 - 114) * i / size)
            b = int(128 + (175 - 128) * i / size)
            draw.rectangle([(0, i), (size, i+1)], fill=(r, g, b))
        
        # Draw lightning bolt
        center_x, center_y = size // 2, size // 2
        bolt_width = int(size * 0.15)
        bolt_height = int(size * 0.4)
        
        # Lightning bolt points
        points = [
            (center_x - int(bolt_width * 0.3), center_y - int(bolt_height * 0.5)),
            (center_x + int(bolt_width * 0.5), center_y - int(bolt_height * 0.2)),
            (center_x - int(bolt_width * 0.2), center_y),
            (center_x + int(bolt_width * 0.3), center_y + int(bolt_height * 0.5)),
            (center_x - int(bolt_width * 0.5), center_y + int(bolt_height * 0.2)),
            (center_x + int(bolt_width * 0.2), center_y),
        ]
        
        draw.polygon(points, fill='white')
        img.save(filename, 'PNG')
        print(f'✓ Created {filename}')

    if __name__ == '__main__':
        print('Generating PWA icons...')
        create_icon(192, 'icon-192.png')
        create_icon(512, 'icon-512.png')
        print('✓ Icons created successfully!')

except ImportError:
    print('Error: Pillow is not installed.')
    print('Install it with: pip install Pillow')
    print('\nAlternatively, use generate-icons.html in a browser.')
    sys.exit(1)
except Exception as e:
    print(f'Error: {e}')
    print('\nAlternatively, use generate-icons.html in a browser.')
    sys.exit(1)
