# Type Geez Source Notes

## Where the source lives
- All JavaScript logic (Classic editor bridge, Gutenberg helpers, transliteration engine, and frontend UI) is written in human-readable ES2015+ and lives in `assets/*.js`.
- Styles for both the WordPress editors and the frontend shortcode live in `assets/style.css`.
- Translation templates are stored in `languages/type-geez.pot`.
- The PHP integration code lives in `typegeez.php`.

## Build & distribution
- There is **no** bundler/minifier/transpiler step today. The files in `assets/` are exactly what we enqueue in WordPress and distribute through the plugin ZIP.
- To modify the plugin, edit the relevant file in `assets/`, test on a WordPress site with `WP_DEBUG` enabled, and commit the change.
- If a build tool is introduced later, document the commands here and in `readme.txt` so reviewers can reproduce the compiled output.

## Repository
Development happens publicly at <https://github.com/ufancha/typegeez>. Issues, discussions, and pull requests should be opened there.
