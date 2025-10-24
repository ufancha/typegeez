=== Type Geez WP ===
Contributors: ufancha
Tags: geez, ethiopic, amharic, transliteration, typing, editor, gutenberg, classic editor
Requires at least: 5.2
Tested up to: 6.6
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Type Ge’ez/Ethiopic anywhere in WordPress using a phonetic transliteration keyboard. Works in Classic, Gutenberg, and frontend via shortcode with an easy on/off toggle.

== Description ==
Type Geez WP lets you type Ge’ez (Ethiopic) using familiar Latin letters. It converts phonetic sequences (like "se", "ssa", "S", "v", etc.) into correct Ethiopic characters as you type.

- One click toggle to enable/disable phonetic typing
- Works in Classic editor (Visual & Text), Gutenberg (block editor), and the frontend
- Frontend editor via shortcode: `[typegeez_editor]`
- WordPress-styled UI with an inline ON/OFF switch
- Keymap viewer and quick Copy/Download (.txt)

Accessibility: The toggle is keyboard accessible and uses ARIA attributes for state.

Performance: Assets are only loaded where needed (shortcode/block usage and editor screens).

= Transliteration highlights =
- Includes v-series (ቨ ቩ ቪ ቫ ቬ ቭ ቮ)
- Maps "ss" to ሥ and the ሠ-series
- Maps capital "S" family to ጸ-series (S → ጽ)
- Explicit "sse" → ሠ override

== Installation ==
1. Upload the plugin files to `/wp-content/plugins/typegeezonline` or install via Plugins → Add New.
2. Activate the plugin through the "Plugins" screen in WordPress.
3. Classic Editor: You’ll see a "ግዕዝ Ge’ez" toggle near Add Media and an "Insert Type Geez" button to insert the shortcode.
4. Gutenberg: Add the "Type Geez" block, or use a Shortcode block with `[typegeez_editor]`.
5. Frontend: Insert `[typegeez_editor]` into a post or page.

== Frequently Asked Questions ==
= How do I insert the editor on a page? =
- Use the block named "Type Geez" (Block Editor) or the shortcode `[typegeez_editor]`.

= Does it work in the Classic Editor? =
- Yes. Toggle phonetic typing and insert the shortcode using the toolbar buttons.

= Can I customize the placeholder or start enabled? =
- Not yet, but the plugin is ready to accept shortcode attributes in a future release. Open an issue if you need this.

== Screenshots ==
1. Frontend editor with Ge’ez toggle.
2. Classic editor toolbar buttons.
3. Gutenberg block integration.

== Changelog ==
= 1.0.0 =
- Initial public release. Classic/Gutenberg/frontend support, improved transliteration (v-series, ss/S families, sse override). WordPress-styled toggle with inline switch.

== Upgrade Notice ==
= 1.0.0 =
Initial release.
