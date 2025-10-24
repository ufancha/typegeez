# WordPress.org assets

Placeholders for plugin directory assets. WordPress.org requires PNG/JPG files in the SVN `/assets/` directory (not inside the plugin).

Included SVG source files (edit/export to PNG):
- banner-1544x500.svg → export to `banner-1544x500.png`
- banner-772x250.svg → export to `banner-772x250.png`
- icon-256x256.svg → export to `icon-256x256.png`
- icon-128x128.svg → export to `icon-128x128.png`

Recommended export steps:
1. Open the SVGs in Figma, Illustrator, or Inkscape.
2. Export at 1x to PNG with transparent or solid background as desired.
3. Optimize PNGs (optional): `pngquant --quality=70-90 --strip *.png`.
4. Commit to WordPress.org SVN under `/assets` (sibling of `/trunk`).

Example SVN layout:
```
/assets
  banner-1544x500.png
  banner-772x250.png
  icon-256x256.png
  icon-128x128.png
/trunk
  ...plugin files...
/tags/1.0.0
  ...plugin files...
```

Notes:
- Colors use WordPress blue (#2271b1 → #135e96). Text: “Type Geez WP” and Ethiopic glyphs (ግዕዝ).
- If Ethiopic fonts are missing on export, install “Noto Sans Ethiopic” or “Abyssinica SIL”.
