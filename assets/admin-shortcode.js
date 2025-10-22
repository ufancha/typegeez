(function($){
  $(document).ready(function(){
    $('#typegeez-insert-shortcode').on('click', function(){
      // If TinyMCE is active, insert into editor; otherwise, insert into textarea
      if(typeof tinymce !== 'undefined' && tinymce.activeEditor && !tinymce.activeEditor.isHidden()){
        tinymce.activeEditor.execCommand('mceInsertContent', false, '[typegeez_editor]');
      } else {
        var textarea = $('#content');
        if(textarea.length){
          var val = textarea.val();
          textarea.val(val + '\n[typegeez_editor]\n');
        }
      }
      alert('Inserted [typegeez_editor] into content. Save the post and view page to see the editor.');
    });
  });
})(jQuery);
