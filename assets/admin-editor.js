(function($){
  // admin-editor.js: transliteration in Classic editor (Textarea + TinyMCE Visual)
  var enabled = false;
  var buffer = '';
  var targetTextarea = null;
  var bufferStart = null;
  var lastTranslit = '';
  var suppressInput = false;
  var punctuationMap = { '.':'።', ',':'፣', ':':'፥', ';':'፤' };
  // Title (Classic editor) separate state
  var targetTitle = null;
  var bufferTitle = '';
  var bufferStartTitle = null;
  var lastTranslitTitle = '';
  var suppressInputTitle = false;

  function setAria(btn, val){
    btn.attr('aria-pressed', val ? 'true' : 'false');
    // Fixed label per request
    btn.text("ግ | ግእዝ Ge'ez");
    // Color feedback: green when on, gray when off
    if(val){ btn.css({ backgroundColor:'#2ecc71', borderColor:'#27ae60', color:'#ffffff' }); }
    else { btn.css({ backgroundColor:'#bdc3c7', borderColor:'#95a5a6', color:'#2c3e50' }); }
  }

  // TEXTAREA (Text tab)
  function attachToTextarea(textarea){
    targetTextarea = textarea;
    textarea.off('.typegeez');
    textarea.on('keydown.typegeez', function(e){
      if(!enabled) return;
      if(e.ctrlKey || e.metaKey || e.altKey){
        // Allow shortcuts like Ctrl/Cmd+A/C/V/Z/Y
        buffer = '';
        bufferStart = null;
        lastTranslit = '';
        suppressInput = false;
        return;
      }
      if(/^([A-Za-z])$/.test(e.key)){
        e.preventDefault();
        var start = textarea.prop('selectionStart');
        if(bufferStart === null) bufferStart = start;
        buffer += e.key;
        var tr = Translit.transliterateWord(buffer);
        var val = textarea.val();
        var caretPos = textarea.prop('selectionStart');
        var before = val.slice(0, bufferStart);
        var after = val.slice(caretPos);
        textarea.val(before + tr + after);
        var caret = before.length + tr.length;
        textarea.prop('selectionStart', caret);
        textarea.prop('selectionEnd', caret);
        lastTranslit = tr;
        suppressInput = true;
        return;
      }
      if(e.key === 'Backspace'){
        if(buffer.length>0){
          e.preventDefault();
          buffer = buffer.slice(0,-1);
          var tr2 = Translit.transliterateWord(buffer);
          var val2 = textarea.val();
          var caretPos2 = textarea.prop('selectionStart');
          var before2 = val2.slice(0, bufferStart);
          var after2 = val2.slice(caretPos2);
          textarea.val(before2 + tr2 + after2);
          var caret2 = before2.length + tr2.length;
          textarea.prop('selectionStart', caret2);
          textarea.prop('selectionEnd', caret2);
          lastTranslit = tr2;
          if(buffer.length === 0){ bufferStart = null; lastTranslit = ''; }
          suppressInput = true;
          return;
        }
        return;
      }
      // commit on non-letter keys
      if(buffer.length > 0 && !/^[A-Za-z]$/.test(e.key)){
        buffer = '';
        bufferStart = null;
        lastTranslit = '';
      }
    });
  textarea.on('keypress.typegeez', function(e){ if(enabled && /^[A-Za-z]$/.test(e.key)){ if(e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); }});
    textarea.on('input.typegeez', function(){
      if(!enabled) return;
      if(suppressInput){ suppressInput = false; return; }
      if(bufferStart !== null && lastTranslit){
        var val = textarea.val();
        var caret = textarea.prop('selectionStart');
        var before = val.slice(0, bufferStart);
        var after = val.slice(caret);
        var normalized = before + lastTranslit + after;
        if(val !== normalized){
          textarea.val(normalized);
          var c = before.length + lastTranslit.length;
          textarea.prop('selectionStart', c);
          textarea.prop('selectionEnd', c);
        }
      }
    });
  }
  function detachFromTextarea(){ if(targetTextarea){ targetTextarea.off('.typegeez'); targetTextarea = null; } }

  // TITLE (Classic editor post title input)
  function attachToTitle(input){
    targetTitle = input;
    input.off('.typegeez');
    var node = input.get(0);
    // Clean previous native listeners if any
    if(node && node.__tgzTitleHandlers){
      if(node.__tgzTitleHandlers.beforeinput) node.removeEventListener('beforeinput', node.__tgzTitleHandlers.beforeinput, true);
      if(node.__tgzTitleHandlers.input) node.removeEventListener('input', node.__tgzTitleHandlers.input, true);
      if(node.__tgzTitleHandlers.focusout) node.removeEventListener('focusout', node.__tgzTitleHandlers.focusout, true);
      node.__tgzTitleHandlers = null;
    }
    input.on('keydown.typegeez', function(e){
      if(!enabled) return;
      if(e.ctrlKey || e.metaKey || e.altKey){ bufferTitle=''; bufferStartTitle=null; lastTranslitTitle=''; return; }
      var mappedT = punctuationMap[e.key];
      if(mappedT){
        e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation();
        var st = input.prop('selectionStart'); var en = input.prop('selectionEnd');
        var v = input.val(); input.val(v.slice(0,st) + mappedT + v.slice(en));
        var pos = st + mappedT.length; input.prop('selectionStart', pos); input.prop('selectionEnd', pos);
        bufferTitle=''; bufferStartTitle=null; lastTranslitTitle=''; suppressInputTitle=true; return;
      }
      if(/^([A-Za-z])$/.test(e.key)){
        e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation();
        var start = input.prop('selectionStart');
        if(bufferStartTitle === null) bufferStartTitle = start;
        bufferTitle += e.key;
        var tr = Translit.transliterateWord(bufferTitle);
        var val = input.val();
        var caretPos = input.prop('selectionStart');
        var before = val.slice(0, bufferStartTitle);
        var after = val.slice(caretPos);
        input.val(before + tr + after);
        var caret = before.length + tr.length;
        input.prop('selectionStart', caret);
        input.prop('selectionEnd', caret);
        lastTranslitTitle = tr;
        suppressInputTitle = true;
        return;
      }
      if(e.key === 'Backspace'){
        if(bufferTitle.length>0){
          e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation();
          bufferTitle = bufferTitle.slice(0,-1);
          var tr2 = Translit.transliterateWord(bufferTitle);
          var val2 = input.val();
          var caretPos2 = input.prop('selectionStart');
          var before2 = val2.slice(0, bufferStartTitle);
          var after2 = val2.slice(caretPos2);
          input.val(before2 + tr2 + after2);
          var caret2 = before2.length + tr2.length;
          input.prop('selectionStart', caret2);
          input.prop('selectionEnd', caret2);
          lastTranslitTitle = tr2;
          if(bufferTitle.length === 0){ bufferStartTitle = null; lastTranslitTitle = ''; }
          suppressInputTitle = true;
          return;
        }
        return;
      }
      // commit on non-letter keys
      if(bufferTitle.length > 0 && !/^[A-Za-z]$/.test(e.key)){
        bufferTitle = '';
        bufferStartTitle = null;
        lastTranslitTitle = '';
      }
    });
  input.on('keypress.typegeez', function(e){ if(enabled && /^[A-Za-z]$/.test(e.key)){ if(e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation(); }});
    input.on('input.typegeez', function(){
      if(!enabled) return;
      if(suppressInputTitle){ suppressInputTitle = false; return; }
      if(bufferStartTitle !== null && lastTranslitTitle){
        var val = input.val();
        var caret = input.prop('selectionStart');
        var before = val.slice(0, bufferStartTitle);
        var after = val.slice(caret);
        var normalized = before + lastTranslitTitle + after;
        if(val !== normalized){
          input.val(normalized);
          var c = before.length + lastTranslitTitle.length;
          input.prop('selectionStart', c);
          input.prop('selectionEnd', c);
        }
      }
    });
    if(node){
      var beforeInputHandler = function(ev){
        if(!enabled) return;
        var t = ev.inputType || '';
        var data = ev.data || '';
        if(t === 'insertText' || t === 'insertCompositionText'){
          if(/^[A-Za-z]$/.test(data)){
            ev.preventDefault();
            if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); else if(ev.stopPropagation) ev.stopPropagation();
          }
        }
      };
      var inputHandler = function(ev){
        if(!enabled) return;
        var data = (ev.data !== undefined) ? ev.data : '';
        var type = ev.inputType || '';
        if(type === 'insertText' || /^[A-Za-z]$/.test(data)){
          if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); else if(ev.stopPropagation) ev.stopPropagation();
        }
      };
      var focusOutHandler = function(){ bufferTitle=''; bufferStartTitle=null; lastTranslitTitle=''; };
      node.addEventListener('beforeinput', beforeInputHandler, true);
      node.addEventListener('input', inputHandler, true);
      node.addEventListener('focusout', focusOutHandler, true);
      node.__tgzTitleHandlers = { beforeinput: beforeInputHandler, input: inputHandler, focusout: focusOutHandler };
    }
  }
  function detachFromTitle(){
    if(targetTitle){
      var node = targetTitle.get(0);
      targetTitle.off('.typegeez');
      if(node && node.__tgzTitleHandlers){
        if(node.__tgzTitleHandlers.beforeinput) node.removeEventListener('beforeinput', node.__tgzTitleHandlers.beforeinput, true);
        if(node.__tgzTitleHandlers.input) node.removeEventListener('input', node.__tgzTitleHandlers.input, true);
        if(node.__tgzTitleHandlers.focusout) node.removeEventListener('focusout', node.__tgzTitleHandlers.focusout, true);
        node.__tgzTitleHandlers = null;
      }
      targetTitle = null;
    }
  }

  // TINYMCE (Visual tab) — wrapper-free range replacement
  function attachToTinyMCE(){
    if(typeof tinymce === 'undefined' || !tinymce.activeEditor) return;
    var ed = tinymce.activeEditor;
    var composing = false;
    var compStart = null; // {container, offset}

    function getRng(){ return ed.selection.getRng(); }
    function setSelection(startContainer, startOffset, endContainer, endOffset){
      var doc = ed.getDoc();
      var rng = doc.createRange();
      rng.setStart(startContainer, startOffset);
      rng.setEnd(endContainer, endOffset);
      ed.selection.setRng(rng);
    }
    function replaceFromStart(text){
      var current = getRng();
      if(!compStart){ compStart = { container: current.startContainer, offset: current.startOffset }; }
      setSelection(compStart.container, compStart.offset, current.endContainer, current.endOffset);
      ed.selection.setContent(text);
    }
    function clearComposition(){ composing = false; compStart = null; buffer = ''; lastTranslit = ''; }

    ed.off('keydown');
    ed.off('keypress');
    ed.on('keydown', function(e){
      if(!enabled) return;
      if(e.ctrlKey || e.metaKey || e.altKey){ composing = false; compStart = null; buffer=''; lastTranslit=''; return; }
      var mapped = punctuationMap[e.key];
      if(mapped){
        e.preventDefault(); ed.selection.setContent(mapped);
        composing=false; compStart=null; buffer=''; lastTranslit=''; return;
      }
      var key = e.key || String.fromCharCode(e.keyCode || 0);
      if(/^[A-Za-z]$/.test(key)){
        e.preventDefault();
        composing = true;
        buffer += key;
        var tr = Translit.transliterateWord(buffer);
        lastTranslit = tr;
        replaceFromStart(tr);
        return;
      }
      if(e.keyCode === 8){ // Backspace
        if(composing && buffer.length>0){
          e.preventDefault();
          buffer = buffer.slice(0,-1);
          var tr2 = Translit.transliterateWord(buffer);
          lastTranslit = tr2;
          if(buffer.length === 0){ replaceFromStart(''); clearComposition(); }
          else { replaceFromStart(tr2); }
          return;
        }
        return;
      }
      if(composing && (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab')){ clearComposition(); return; }
    });
  ed.on('keypress', function(e){ if(enabled && /^[A-Za-z]$/.test(e.key || String.fromCharCode(e.charCode||0))){ if(e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); }});
  }
  function detachFromTinyMCE(){ if(typeof tinymce !== 'undefined' && tinymce.activeEditor){ var ed = tinymce.activeEditor; ed.off('keydown'); ed.off('keypress'); } }

  $(document).ready(function(){
    var btn = $('#typegeez-enable-editor');
    if(!btn.length) return;
    setAria(btn, false);

    function attachCurrentEditor(){
      if(typeof tinymce !== 'undefined' && tinymce.activeEditor && !tinymce.activeEditor.isHidden()){
        attachToTinyMCE();
      } else {
        var ta = $('#content'); if(ta.length) attachToTextarea(ta);
      }
      var title = $('#title'); if(title.length) attachToTitle(title);
    }

    btn.on('click', function(){
      enabled = !enabled; setAria(btn, enabled);
      if(enabled){
        attachCurrentEditor();
        var tries = 0; var iv = setInterval(function(){
          if(!enabled){ clearInterval(iv); return; }
          if(typeof tinymce !== 'undefined' && tinymce.activeEditor){ attachCurrentEditor(); clearInterval(iv); }
          if(++tries > 10){ clearInterval(iv); }
        }, 200);
      } else {
        detachFromTextarea(); detachFromTinyMCE(); detachFromTitle();
        buffer = ''; bufferStart = null; lastTranslit = ''; suppressInput = false;
        bufferTitle = ''; bufferStartTitle = null; lastTranslitTitle = ''; suppressInputTitle = false;
      }
    });

    // Re-attach when user switches Visual/Text
    $('body').on('click', '#content-tmce', function(){ if(enabled){ setTimeout(attachCurrentEditor, 150); }});
    $('body').on('click', '#content-html', function(){ if(enabled){ var ta = $('#content'); if(ta.length) attachToTextarea(ta); }});
  });
})(jQuery);
