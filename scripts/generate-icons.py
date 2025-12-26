#!/usr/bin/env python3
"""
Scribe Icon Generator
Creates app icons in all required sizes for macOS/Tauri

Design: Focus Circle with Pen (Concept 2)
- Rounded square background
- Diagonal pen stroke
- Focus dot
- ADHD-friendly warm accent on dark background
"""

from PIL import Image, ImageDraw
import os
import math

# Colors (ADHD-friendly palette)
BG_COLOR = (26, 26, 26)  # #1a1a1a - Dark background
ACCENT_COLOR = (212, 165, 116)  # #d4a574 - Warm accent (pen)
FOCUS_DOT = (74, 222, 128)  # #4ade80 - Green focus dot
HIGHLIGHT = (255, 255, 255, 40)  # Semi-transparent white


def create_icon(size):
    """Create a single icon at the specified size."""
    # Create image with alpha channel
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Calculate dimensions
    padding = size * 0.1
    corner_radius = size * 0.22  # macOS style rounded corners

    # Draw rounded rectangle background
    draw_rounded_rect(
        draw, padding, padding, size - padding, size - padding, corner_radius, BG_COLOR
    )

    # Add subtle inner shadow/highlight
    inner_padding = padding + size * 0.02
    draw_rounded_rect(
        draw,
        inner_padding,
        inner_padding,
        size - inner_padding,
        size - inner_padding,
        corner_radius * 0.9,
        (30, 30, 30),
        outline_only=True,
    )

    # Draw diagonal pen stroke
    pen_width = max(3, int(size * 0.08))
    pen_start = (size * 0.25, size * 0.75)
    pen_end = (size * 0.70, size * 0.30)

    # Pen body (thicker line)
    draw.line([pen_start, pen_end], fill=ACCENT_COLOR, width=pen_width)

    # Pen tip (triangle)
    tip_size = size * 0.08
    tip_x, tip_y = pen_end
    angle = math.atan2(pen_start[1] - pen_end[1], pen_start[0] - pen_end[0])

    tip_points = [
        (
            tip_x - tip_size * math.cos(angle - 0.5),
            tip_y - tip_size * math.sin(angle - 0.5),
        ),
        (
            tip_x - tip_size * math.cos(angle + 0.5),
            tip_y - tip_size * math.sin(angle + 0.5),
        ),
        (
            tip_x + tip_size * 0.5 * math.cos(angle + math.pi),
            tip_y + tip_size * 0.5 * math.sin(angle + math.pi),
        ),
    ]
    draw.polygon(tip_points, fill=ACCENT_COLOR)

    # Draw focus dot
    dot_radius = size * 0.06
    dot_center = (size * 0.55, size * 0.55)
    draw.ellipse(
        [
            dot_center[0] - dot_radius,
            dot_center[1] - dot_radius,
            dot_center[0] + dot_radius,
            dot_center[1] + dot_radius,
        ],
        fill=FOCUS_DOT,
    )

    # Add subtle glow around dot
    glow_radius = dot_radius * 1.5
    for i in range(3):
        alpha = 30 - i * 10
        glow_color = (74, 222, 128, alpha)
        glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        r = glow_radius + i * 2
        glow_draw.ellipse(
            [
                dot_center[0] - r,
                dot_center[1] - r,
                dot_center[0] + r,
                dot_center[1] + r,
            ],
            fill=glow_color,
        )
        img = Image.alpha_composite(img, glow_img)

    return img


def draw_rounded_rect(draw, x1, y1, x2, y2, radius, color, outline_only=False):
    """Draw a rounded rectangle."""
    if outline_only:
        # Draw outline only
        draw.arc([x1, y1, x1 + radius * 2, y1 + radius * 2], 180, 270, fill=color)
        draw.arc([x2 - radius * 2, y1, x2, y1 + radius * 2], 270, 360, fill=color)
        draw.arc([x1, y2 - radius * 2, x1 + radius * 2, y2], 90, 180, fill=color)
        draw.arc([x2 - radius * 2, y2 - radius * 2, x2, y2], 0, 90, fill=color)
        draw.line([x1 + radius, y1, x2 - radius, y1], fill=color)
        draw.line([x1 + radius, y2, x2 - radius, y2], fill=color)
        draw.line([x1, y1 + radius, x1, y2 - radius], fill=color)
        draw.line([x2, y1 + radius, x2, y2 - radius], fill=color)
    else:
        # Fill rounded rectangle
        draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=color)
        draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=color)
        draw.ellipse([x1, y1, x1 + radius * 2, y1 + radius * 2], fill=color)
        draw.ellipse([x2 - radius * 2, y1, x2, y1 + radius * 2], fill=color)
        draw.ellipse([x1, y2 - radius * 2, x1 + radius * 2, y2], fill=color)
        draw.ellipse([x2 - radius * 2, y2 - radius * 2, x2, y2], fill=color)


def main():
    # Icon sizes needed for Tauri/macOS
    sizes = {
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "icon.png": 1024,  # Master icon
        # Windows sizes
        "Square30x30Logo.png": 30,
        "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71,
        "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107,
        "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150,
        "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310,
        "StoreLogo.png": 50,
    }

    icons_dir = os.path.join(os.path.dirname(__file__), "..", "src-tauri", "icons")
    os.makedirs(icons_dir, exist_ok=True)

    print("🎨 Generating Scribe icons...")
    print(f"   Output directory: {icons_dir}")
    print()

    for filename, size in sizes.items():
        filepath = os.path.join(icons_dir, filename)
        img = create_icon(size)
        img.save(filepath, "PNG")
        print(f"   ✅ {filename} ({size}x{size})")

    # Generate .icns for macOS
    print()
    print("🍎 Generating macOS .icns...")

    # Create iconset directory
    iconset_dir = os.path.join(icons_dir, "icon.iconset")
    os.makedirs(iconset_dir, exist_ok=True)

    icns_sizes = [16, 32, 64, 128, 256, 512, 1024]
    for size in icns_sizes:
        img = create_icon(size)
        img.save(os.path.join(iconset_dir, f"icon_{size}x{size}.png"), "PNG")
        if size <= 512:
            img2x = create_icon(size * 2)
            img2x.save(os.path.join(iconset_dir, f"icon_{size}x{size}@2x.png"), "PNG")

    # Convert to .icns using iconutil
    icns_path = os.path.join(icons_dir, "icon.icns")
    os.system(f'iconutil -c icns "{iconset_dir}" -o "{icns_path}"')

    # Clean up iconset
    import shutil

    shutil.rmtree(iconset_dir)

    print(f"   ✅ icon.icns")

    # Generate .ico for Windows
    print()
    print("🪟 Generating Windows .ico...")

    ico_sizes = [16, 32, 48, 64, 128, 256]
    ico_images = [create_icon(s) for s in ico_sizes]
    ico_path = os.path.join(icons_dir, "icon.ico")
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:],
    )
    print(f"   ✅ icon.ico")

    print()
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║              🎉 Icons generated successfully!             ║")
    print("╚═══════════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    main()
