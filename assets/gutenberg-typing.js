(function(wp){
  if(!wp || !wp.plugins || !wp.element || !wp.editPost) return;
  var registerPlugin = wp.plugins.registerPlugin;
  var PluginMoreMenuItem = wp.editPost.PluginMoreMenuItem || null;
  var el = wp.element.createElement;
  var useState = wp.element.useState;
  var useEffect = wp.element.useEffect;

  var noticesDispatch = null;
  try { noticesDispatch = wp.data && wp.data.dispatch ? wp.data.dispatch('core/notices') : null; } catch(e){ noticesDispatch = null; }

  var state = { enabled: false };
  var stateKey = 'typegeez_gb_enabled';
  var elementState = new WeakMap(); // per-editable state
  var listenersAttached = false; // ensure we don't attach twice
  var isUpdatingTitle = false; // prevent feedback when programmatically updating title
  var punctuationMap = { '.':'።', ',':'፣', ':':'፥', ';':'፤' };

  function isEditable(target){
    if(!target) return false;
    // Limit to block editor region
    var root = target.closest ? target.closest('.edit-post-layout, .block-editor, .interface-interface-skeleton') : null;
    if(!root) return false;
    if(target.isContentEditable) return true;
    var role = target.getAttribute ? target.getAttribute('role') : null;
    if(role === 'textbox') return true;
    if(target.tagName === 'TEXTAREA') return true;
    if(target.tagName === 'INPUT'){
      var type = (target.type || 'text').toLowerCase();
      if(type === 'text' || type === 'search' || type === '') return true;
    }
    return false;
  }

  function getOrInitStateFor(el){
    var s = elementState.get(el);
    if(!s){ s = { buffer:'', compStartRange:null, lastTranslit:'' }; elementState.set(el, s); }
    return s;
  }
    if(key === ' '){
      // Handle space in Gutenberg title explicitly (controlled input)
      if(isTitle(el)){
        e.preventDefault();
        if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation();
        var idx = getCaretIndexInTitle(el);
        if(idx != null){
          var tval3 = getGutenbergTitle();
          var next3 = tval3.slice(0, idx) + ' ' + tval3.slice(idx);
          var newPos3 = idx + 1;
          updateGutenbergTitle(next3);
          (function(pos, rootEl){ setTimeout(function(){ setCaretIndexInTitle(rootEl, pos); }, 0); })(newPos3, el);
        }
        var s3 = getOrInitStateFor(el); s3.buffer=''; s3.compStartRange=null; s3.compStartIndex=null; s3.lastTranslit='';
        return;
      }
    }

  function getTitleRoot(el){
    if(!el) return null;
    var root = null;
    try {
      if(el.closest) {
        root = el.closest('.editor-post-title, .editor-post-title__input');
      }
    } catch(_) { root = null; }
    return root;
  }
  function isTitle(el){ return !!getTitleRoot(el); }

  function updateGutenbergTitle(value){
    if(!wp || !wp.data || !wp.data.dispatch) return;
    var disp = null;
    try { disp = wp.data.dispatch('core/editor'); } catch(e){ disp = null; }
    if(disp && typeof disp.editPost === 'function'){
      isUpdatingTitle = true;
      disp.editPost({ title: value });
      setTimeout(function(){ isUpdatingTitle = false; }, 0);
    }
  }

  function getGutenbergTitle(){
    if(!wp || !wp.data || !wp.data.select) return '';
    try{
      var sel = wp.data.select('core/editor');
      if(sel && typeof sel.getEditedPostAttribute === 'function'){
        return sel.getEditedPostAttribute('title') || '';
      }
    }catch(e){}
    return '';
  }

  function replaceFromStartContentEditable(el, s, text){
    var sel = window.getSelection();
    if(!sel || sel.rangeCount === 0) return;
    if(!s.compStartRange){
      var r = sel.getRangeAt(0).cloneRange();
      s.compStartRange = r;
    }
    var current = sel.getRangeAt(0);
    var doc = current.commonAncestorContainer.ownerDocument || document;
    var rng = doc.createRange();
    try {
      rng.setStart(s.compStartRange.startContainer, s.compStartRange.startOffset);
    } catch(err){
      // Fallback if start container became stale
      s.compStartRange = current.cloneRange();
      rng.setStart(s.compStartRange.startContainer, s.compStartRange.startOffset);
    }
    rng.setEnd(current.endContainer, current.endOffset);
    // Replace the content in range with plain text
    rng.deleteContents();
    var textNode = doc.createTextNode(text);
    rng.insertNode(textNode);
    // Move caret to the end of inserted text
    sel.removeAllRanges();
    var after = doc.createRange();
    after.setStart(textNode, textNode.nodeValue.length);
    after.setEnd(textNode, textNode.nodeValue.length);
    sel.addRange(after);
  }

  function getCaretIndexInTitle(el){
    var root = getTitleRoot(el);
    if(!root) return null;
    var sel = window.getSelection();
    if(!sel || sel.rangeCount === 0) return null;
    var doc = root.ownerDocument || document;
    try {
      var rng = sel.getRangeAt(0);
      var prefix = doc.createRange();
      prefix.setStart(root, 0);
      prefix.setEnd(rng.endContainer, rng.endOffset);
      return prefix.toString().length;
    } catch(_) { return null; }
  }

  function setCaretIndexInTitle(el, index){
    var root = getTitleRoot(el);
    if(!root) return;
    var sel = window.getSelection();
    var doc = root.ownerDocument || document;
    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var remaining = index;
    var node;
    while((node = walker.nextNode())){
      var len = node.nodeValue.length;
      if(remaining <= len){
        var rng = doc.createRange();
        rng.setStart(node, Math.max(0, remaining));
        rng.collapse(true);
        sel.removeAllRanges();
        sel.addRange(rng);
        return;
      }
      remaining -= len;
    }
    var endRng = doc.createRange();
    endRng.selectNodeContents(root);
    endRng.collapse(false);
    sel.removeAllRanges();
    sel.addRange(endRng);
  }

  function handleLetterKey(el, key){
    if(isUpdatingTitle) return; // avoid loops when we just set programmatically
    var s = getOrInitStateFor(el);
    s.buffer += key;
    var tr = (typeof Translit !== 'undefined' && Translit.transliterateWord) ? Translit.transliterateWord(s.buffer) : s.buffer;
    s.lastTranslit = tr;
    if(isTitle(el)){
      var caretIdx = getCaretIndexInTitle(el);
      if(caretIdx == null) return;
      if(s.compStartIndex == null) s.compStartIndex = caretIdx;
      var currentTitle = getGutenbergTitle();
      var beforeT = currentTitle.slice(0, s.compStartIndex);
      var afterT = currentTitle.slice(caretIdx);
      var nextTitle = beforeT + tr + afterT;
      var newPos = beforeT.length + tr.length;
      updateGutenbergTitle(nextTitle);
      (function(pos, rootEl){ setTimeout(function(){ setCaretIndexInTitle(rootEl, pos); }, 0); })(newPos, el);
    } else if(el.isContentEditable){
      replaceFromStartContentEditable(el, s, tr);
    } else if('selectionStart' in el) {
      var start = el.selectionStart;
      if(s.compStartRange == null) s.compStartRange = start;
      var caret = el.selectionStart;
      var val = el.value;
      var before = val.slice(0, s.compStartRange);
      var after = val.slice(caret);
      el.value = before + tr + after;
      var newPos = before.length + tr.length;
      el.selectionStart = el.selectionEnd = newPos;
    }
  }

  function handleBackspace(el){
    if(isUpdatingTitle) return false;
    var s = getOrInitStateFor(el);
    if(!s.buffer) return false;
    s.buffer = s.buffer.slice(0,-1);
    var tr2 = (typeof Translit !== 'undefined' && Translit.transliterateWord) ? Translit.transliterateWord(s.buffer) : s.buffer;
    s.lastTranslit = tr2;
    if(isTitle(el)){
      var caretIdx2 = getCaretIndexInTitle(el);
      if(caretIdx2 == null) return false;
      var startIdx = (s.compStartIndex == null) ? caretIdx2 : s.compStartIndex;
      var currentTitle2 = getGutenbergTitle();
      var beforeT2 = currentTitle2.slice(0, startIdx);
      var afterT2 = currentTitle2.slice(caretIdx2);
      var nextTitle2 = beforeT2 + tr2 + afterT2;
      var pos2 = beforeT2.length + tr2.length;
      updateGutenbergTitle(nextTitle2);
      (function(pos, rootEl){ setTimeout(function(){ setCaretIndexInTitle(rootEl, pos); }, 0); })(pos2, el);
      if(s.buffer.length === 0){ s.compStartIndex = null; s.lastTranslit = ''; }
    } else if(el.isContentEditable){
      if(s.buffer.length === 0){
        replaceFromStartContentEditable(el, s, '');
        s.compStartRange = null; s.lastTranslit = '';
      } else {
        replaceFromStartContentEditable(el, s, tr2);
      }
    } else if('selectionStart' in el){
      var caret = el.selectionStart;
      var val = el.value;
      var start = (s.compStartRange == null) ? caret : s.compStartRange;
      var before = val.slice(0, start);
      var after = val.slice(caret);
      el.value = before + tr2 + after;
      var newPos = before.length + tr2.length;
      el.selectionStart = el.selectionEnd = newPos;
      if(s.buffer.length === 0){ s.compStartRange = null; s.lastTranslit = ''; }
    }
    return true;
  }

  function commit(el){
    var s = getOrInitStateFor(el);
    if(s.buffer){ s.buffer=''; s.compStartRange=null; s.lastTranslit=''; }
  }

  function onKeyDown(e){
    if(!state.enabled) return;
    var el = e.target;
    if(!isEditable(el)) return;
    var key = e.key || '';
    if(e.metaKey || e.ctrlKey || e.altKey) { commit(el); return; }
    var mapped = punctuationMap[key];
    if(mapped){
      e.preventDefault();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation();
      // Insert mapped punctuation at caret and clear composition
      var s = getOrInitStateFor(el);
      if(isTitle(el)){
        var caretIdx = getCaretIndexInTitle(el);
        if(caretIdx != null){
          var tval = getGutenbergTitle();
          var next = (tval.slice(0, caretIdx) + mapped + tval.slice(caretIdx));
          var newPos = caretIdx + mapped.length;
          updateGutenbergTitle(next);
          (function(pos, rootEl){ setTimeout(function(){ setCaretIndexInTitle(rootEl, pos); }, 0); })(newPos, el);
        }
        s.buffer=''; s.compStartRange=null; s.compStartIndex=null; s.lastTranslit='';
        return;
      }
      if(el.isContentEditable){
        // Insert at caret by replacing current selection only
        s.compStartRange = null;
        replaceFromStartContentEditable(el, s, mapped);
        s.buffer=''; s.compStartRange=null; s.compStartIndex=null; s.lastTranslit='';
        return;
      }
      if('selectionStart' in el){
        var st = el.selectionStart, en = el.selectionEnd;
        var val = el.value || '';
        el.value = val.slice(0,st) + mapped + val.slice(en);
        var pos2 = st + mapped.length; el.selectionStart = el.selectionEnd = pos2;
        s.buffer=''; s.compStartRange=null; s.compStartIndex=null; s.lastTranslit='';
        return;
      }
    }
    if(/^[A-Za-z]$/.test(key)){
      e.preventDefault();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      else if(e.stopPropagation) e.stopPropagation();
      handleLetterKey(el, key);
      return;
    }
    if(key === 'Backspace'){
      if(handleBackspace(el)) { e.preventDefault(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); else if(e.stopPropagation) e.stopPropagation(); }
      return;
    }
    // Commit buffer on non-letter
    commit(el);
  }

  function onKeyPress(e){
    if(!state.enabled) return;
    var el = e.target;
    if(!isEditable(el)) return;
    var key = e.key || String.fromCharCode(e.charCode||0);
    if(/^[A-Za-z]$/.test(key)){
      if(e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      else if(e.stopPropagation) e.stopPropagation();
    }
  }

  function onBeforeInput(e){
    if(!state.enabled) return;
    var el = e.target;
    if(!isEditable(el)) return;
    var t = e.inputType || '';
    // Prevent Gutenberg from inserting raw Latin text; our keydown handler handles it
    if(t === 'insertText' || t === 'insertCompositionText'){
      var data = e.data || '';
      if(/^[A-Za-z]$/.test(data) || punctuationMap[data]){
        e.preventDefault();
        if(e.stopImmediatePropagation) e.stopImmediatePropagation();
        else if(e.stopPropagation) e.stopPropagation();
      }
    }
  }

  function onInput(e){
    if(!state.enabled) return;
    var el = e.target;
    if(!isEditable(el)) return;
    // Stop React/Gutenberg from processing native input for the title when typing letters
    var data = (e.data !== undefined) ? e.data : '';
    var type = e.inputType || '';
    if(isTitle(el) && (/^[A-Za-z]$/.test(data) || punctuationMap[data])){
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      else if(e.stopPropagation) e.stopPropagation();
    }
  }

  function onFocusOut(e){
    var el = e.target;
    var s = elementState.get(el);
    if(s){ s.buffer=''; s.compStartRange=null; s.lastTranslit=''; }
  }

  function addListeners(){
    if(listenersAttached) return;
    listenersAttached = true;
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keypress', onKeyPress, true);
    document.addEventListener('beforeinput', onBeforeInput, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('focusout', onFocusOut, true);
  }
  function removeListeners(){
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('keypress', onKeyPress, true);
    document.removeEventListener('beforeinput', onBeforeInput, true);
    document.removeEventListener('input', onInput, true);
    document.removeEventListener('focusout', onFocusOut, true);
    elementState = new WeakMap();
    listenersAttached = false;
  }

  function setEnabled(val){
    state.enabled = !!val;
    try { localStorage.setItem(stateKey, state.enabled ? '1':'0'); } catch(e){}
    if(state.enabled){
      addListeners();
      if(noticesDispatch && noticesDispatch.createNotice){ noticesDispatch.createNotice('info', "Ge'ez typing enabled", { isDismissible:true, type:'snackbar' }); }
    }else{
      removeListeners();
      if(noticesDispatch && noticesDispatch.createNotice){ noticesDispatch.createNotice('info', "Ge'ez typing disabled", { isDismissible:true, type:'snackbar' }); }
    }
  }

  var ToggleMenuItem = function(){
    var _a = useState(state.enabled), isOn = _a[0], setIsOn = _a[1];
    useEffect(function(){
      var saved = null;
      try { saved = localStorage.getItem(stateKey); } catch(e) { saved = null; }
      if(saved === '1') { setEnabled(true); setIsOn(true); }
    }, []);
    var onClick = function(){ var next = !state.enabled; setEnabled(next); setIsOn(next); };
    // Fallback if PluginMoreMenuItem is unavailable
    if(!PluginMoreMenuItem){
      return el('div', { style:{ padding:'8px' } }, el('button', { className:'components-button', onClick:onClick }, "ግ | ግእዝ Ge'ez"));
    }
    return el(PluginMoreMenuItem, { icon:'translation', role:'menuitemcheckbox', checked:isOn, onClick:onClick }, "ግ | ግእዝ Ge'ez");
  };

  registerPlugin('typegeez-gutenberg-typing', { render: ToggleMenuItem });
})(window.wp);
