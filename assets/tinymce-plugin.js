(function(){
  // TinyMCE plugin to insert the [typegeez_editor] shortcode
  tinymce.create('tinymce.plugins.typegeez', {
    init: function(ed, url){
      ed.addButton('typegeez_button', {
        title: 'Insert Type Geez Editor',
        icon: 'translation',
        onclick: function(){ ed.selection.setContent('[typegeez_editor]'); }
      });
    }
  });
  // Register plugin
  tinymce.PluginManager.add('typegeez', tinymce.plugins.typegeez);
})();
