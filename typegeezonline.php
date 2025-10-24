<?php
/**
 * Plugin Name: Type Geez WP
 * Description: Type Ge’ez/Ethiopic anywhere in WordPress using a phonetic transliteration keyboard. Works in Classic, Gutenberg, and frontend via shortcode with an easy on/off toggle.
 * Version: 1.0
 * Author: Habtamu Soressa
 * Text Domain: typegeezwp
 */

defined('ABSPATH') or die('Direct access not allowed');

function typegeez_enqueue_assets(){
    $plugin_url = plugin_dir_url(__FILE__);
    wp_enqueue_style('typegeez-style', $plugin_url . 'assets/style.css');
    wp_enqueue_script('typegeez-translit', $plugin_url . 'assets/translit.js', array(), false, true);
    wp_enqueue_script('typegeez-main', $plugin_url . 'assets/main.js', array('typegeez-translit'), false, true);
}
add_action('wp_enqueue_scripts', 'typegeez_enqueue_assets');

// Render callback used by the block (shortcode-based UI removed)
function typegeez_render_block($atts = array()){
    ob_start();
    ?>
    <div class="typegeez-app">
      <div class="editor-top">
        <div class="info">Use your physical keyboard. Toggle phonetic mode for transliteration-based input.</div>
        <div class="modes">
          <button id="phoneticToggleBtn" class="button button-secondary phonetic-btn off" aria-pressed="false" aria-label="Toggle Ge'ez input">
            <span class="tgz-label">ግዕዝ Ge'ez</span>
            <span class="tgz-onoff" aria-hidden="true"></span>
          </button>
        </div>
  <div class="switch-state" id="switchState" aria-live="polite">Off</div>
      </div>
      <textarea id="output" placeholder="Start typing..."></textarea>
      <div id="composition" class="composition" aria-live="polite"></div>
      <div class="controls">
        <button id="clearBtn">Clear</button>
        <button id="copyBtn">Copy</button>
        <button id="downloadBtn">Download (.txt)</button>
      </div>
      <div id="keymapModal" class="keymap-modal" aria-hidden="true">
        <div class="keymap-panel">
          <div class="keymap-header"><input id="keymapSearch" placeholder="Search Latin sequence or Ethiopic" /><button id="keymapClose">Close</button></div>
          <div id="keymapList" class="keymap-list"></div>
          <div style="margin-top:8px"><a id="downloadKeymap" href="#">Download keymap JSON</a></div>
        </div>
      </div>
    </div>
    <?php
    return ob_get_clean();
}

// Re-enable the shortcode for the known-good frontend editor rendering
add_shortcode('typegeez_editor', 'typegeez_render_block');

// Register a minimal Gutenberg block so editors can insert the Type Geez editor via the block inserter.
function typegeez_register_block(){
  $plugin_url = plugin_dir_url(__FILE__);
  wp_register_script('typegeez-block-editor', $plugin_url . 'assets/block-editor.js', array('wp-blocks','wp-element'), false, true);
  // Server-side render the block using the dedicated render callback
  register_block_type('typegeezonline/editor', array(
    'editor_script' => 'typegeez-block-editor',
    'render_callback' => 'typegeez_render_block'
  ));
}
add_action('init','typegeez_register_block');

// Ensure scripts/styles needed for the editor preview are available inside the block editor
function typegeez_enqueue_block_editor_assets(){
  $plugin_url = plugin_dir_url(__FILE__);
  // transliteration engine and main behavior in the editor for live preview
  wp_enqueue_script('typegeez-translit', $plugin_url . 'assets/translit.js', array(), false, true);
  wp_enqueue_script('typegeez-main', $plugin_url . 'assets/main.js', array('typegeez-translit'), false, true);
  // Gutenberg editor typing integration and toggle
  wp_enqueue_script(
    'typegeez-gutenberg-typing',
    $plugin_url . 'assets/gutenberg-typing.js',
    array('wp-plugins','wp-edit-post','wp-element','wp-components','wp-data','typegeez-translit'),
    false,
    true
  );
  wp_enqueue_style('typegeez-style', $plugin_url . 'assets/style.css');
}
add_action('enqueue_block_editor_assets','typegeez_enqueue_block_editor_assets');

// Admin editor integration: enqueue the admin-editor helper (no shortcode/meta box)
function typegeez_enqueue_admin_assets($hook){
  if(!in_array($hook, array('post.php','post-new.php'))) return;
  $plugin_url = plugin_dir_url(__FILE__);
  // transliteration engine and admin editor integration
  wp_enqueue_script('typegeez-translit', $plugin_url . 'assets/translit.js', array(), false, true);
  wp_enqueue_script('typegeez-admin-editor', $plugin_url . 'assets/admin-editor.js', array('jquery','typegeez-translit'), false, true);
  // styles for split toggle button
  wp_enqueue_style('typegeez-style', $plugin_url . 'assets/style.css');
}
add_action('admin_enqueue_scripts','typegeez_enqueue_admin_assets');

// Classic editor: place the toggle button at the top toolbar (next to Add Media)
function typegeez_render_classic_toggle(){
  // Only output on classic editor screens (post.php/post-new.php already gated by admin_enqueue_scripts)
  echo '<button type="button" id="typegeez-enable-editor" class="button button-secondary phonetic-btn off" style="margin-left:6px" aria-pressed="false" title="Toggle Ge\'ez phonetic typing">'
    . '<span class="tgz-label">ግዕዝ Ge\'ez</span><span class="tgz-onoff" aria-hidden="true"></span>'
    . '</button>';
}
add_action('media_buttons','typegeez_render_classic_toggle', 15);
