<?php
/**
 * Plugin Name: Type Geez WP
 * Plugin URI: https://github.com/ufancha/typegeezwp
 * Description: Type Ge’ez/Ethiopic anywhere in WordPress using a phonetic transliteration keyboard. Works in Classic, Gutenberg, and frontend via shortcode with an easy on/off toggle.
 * Version: 1.0.0
 * Author: Habtamu Soressa
 * Author URI: https://github.com/ufancha
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.2
 * Requires PHP: 7.2
 * Tested up to: 6.6
 * Text Domain: typegeezwp
 * Domain Path: /languages
 */

defined('ABSPATH') or die('Direct access not allowed');

// i18n
function typegeez_load_textdomain(){
  load_plugin_textdomain('typegeezwp', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init','typegeez_load_textdomain');

// Register assets (enqueue only when rendering)
function typegeez_register_assets(){
  $plugin_url = plugin_dir_url(__FILE__);
  $plugin_path = plugin_dir_path(__FILE__);
  $ver_css = @filemtime($plugin_path . 'assets/style.css');
  $ver_translit = @filemtime($plugin_path . 'assets/translit.js');
  $ver_main = @filemtime($plugin_path . 'assets/main.js');
  wp_register_style('typegeez-style', $plugin_url . 'assets/style.css', array(), $ver_css ? $ver_css : null);
  wp_register_script('typegeez-translit', $plugin_url . 'assets/translit.js', array(), $ver_translit ? $ver_translit : null, true);
  wp_register_script('typegeez-main', $plugin_url . 'assets/main.js', array('typegeez-translit'), $ver_main ? $ver_main : null, true);
}
add_action('init','typegeez_register_assets');

// Render callback used by the block (shortcode-based UI removed)
function typegeez_render_block($atts = array()){
    // Ensure required assets are loaded only when the editor is rendered on frontend
    if(!is_admin()){
      wp_enqueue_style('typegeez-style');
      wp_enqueue_script('typegeez-translit');
      wp_enqueue_script('typegeez-main');
    }
    ob_start();
    ?>
    <div class="typegeez-app">
      <div class="editor-top">
        <div class="info"><?php echo esc_html__("Use your physical keyboard. Toggle phonetic mode for transliteration-based input.", 'typegeezwp'); ?></div>
        <div class="modes">
          <button id="phoneticToggleBtn" class="button button-secondary phonetic-btn off" aria-pressed="false" aria-label="<?php echo esc_attr__("Toggle Ge'ez input", 'typegeezwp'); ?>">
            <span class="tgz-label"><?php echo esc_html__("ግዕዝ Ge'ez", 'typegeezwp'); ?></span>
            <span class="tgz-onoff" aria-hidden="true"></span>
          </button>
        </div>
  <div class="switch-state" id="switchState" aria-live="polite"><?php echo esc_html__('Off', 'typegeezwp'); ?></div>
      </div>
      <textarea id="output" placeholder="<?php echo esc_attr__('Start typing...', 'typegeezwp'); ?>"></textarea>
      <div id="composition" class="composition" aria-live="polite"></div>
      <div class="controls">
        <button id="clearBtn"><?php echo esc_html__('Clear', 'typegeezwp'); ?></button>
        <button id="copyBtn"><?php echo esc_html__('Copy', 'typegeezwp'); ?></button>
        <button id="downloadBtn"><?php echo esc_html__('Download (.txt)', 'typegeezwp'); ?></button>
      </div>
      <div id="keymapModal" class="keymap-modal" aria-hidden="true">
        <div class="keymap-panel">
          <div class="keymap-header"><input id="keymapSearch" placeholder="<?php echo esc_attr__('Search Latin sequence or Ethiopic', 'typegeezwp'); ?>" /><button id="keymapClose"><?php echo esc_html__('Close', 'typegeezwp'); ?></button></div>
          <div id="keymapList" class="keymap-list"></div>
          <div style="margin-top:8px"><a id="downloadKeymap" href="#"><?php echo esc_html__('Download keymap JSON', 'typegeezwp'); ?></a></div>
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
  // Ensure core editor utilities are available (wp.editor, send_to_editor)
  if(function_exists('wp_enqueue_editor')){
    wp_enqueue_editor();
  } else {
    wp_enqueue_script('editor');
  }
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
  echo '<button type="button" id="typegeez-enable-editor" class="button button-secondary phonetic-btn off" style="margin-left:6px" aria-pressed="false" title="' . esc_attr__("Toggle Ge'ez phonetic typing", 'typegeezwp') . '">'
    . '<span class="tgz-label">' . esc_html__("ግዕዝ Ge'ez", 'typegeezwp') . '</span><span class="tgz-onoff" aria-hidden="true"></span>'
    . '</button>'
    // Insert-shortcode helper for Classic editor
    . ' <button type="button" id="typegeez-insert-shortcode" class="button" title="' . esc_attr__('Insert Type Geez editor shortcode', 'typegeezwp') . '">' . esc_html__('Insert Type Geez', 'typegeezwp') . '</button>';
}
add_action('media_buttons','typegeez_render_classic_toggle', 15);
