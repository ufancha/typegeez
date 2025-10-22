// Main plugin JS - adapted from src/main.js (simplified loader)
(function(){
  const output = document.getElementById('output');
  // If no editor is present, or we've already bound handlers, exit.
  if(!output || output.__typeGeezBound){ return; }
  const phoneticBtn = document.getElementById('phoneticToggleBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const suggestionsRoot = document.getElementById('suggestions');
  const compositionRoot = document.getElementById('composition');
  let bufferStart = null; let wordBuffer = ''; let pendingCommit = null; let pendingCommitKey = null;
  let latinBuffer = ''; let lastTranslit = ''; let composing = false;

  function phoneticOn(){ return phoneticBtn && phoneticBtn.getAttribute('aria-pressed') === 'true'; }
  function updateSwitchState(){ const el = document.getElementById('switchState'); if(!el) return; if(phoneticOn()){ el.textContent = 'On'; el.classList.add('on'); } else { el.textContent = 'Off'; el.classList.remove('on'); }}
  function setPhonetic(on){ if(!phoneticBtn) return; phoneticBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); updateSwitchState(); if(on){ bufferStart = output.selectionStart || 0; wordBuffer = ''; latinBuffer = ''; lastTranslit=''; composing=false; if(suggestionsRoot){ suggestionsRoot.innerHTML=''; } compositionRoot.textContent=''; if(pendingCommit){ clearTimeout(pendingCommit); pendingCommit=null; pendingCommitKey=null; } } else { bufferStart = null; wordBuffer=''; latinBuffer=''; lastTranslit=''; composing=false; if(suggestionsRoot){ suggestionsRoot.innerHTML=''; } compositionRoot.textContent=''; }}
  if(phoneticBtn) phoneticBtn.addEventListener('click', ()=> setPhonetic(!phoneticOn()));
  updateSwitchState(); setPhonetic(false);

  // helpers
  function insertAtCursor(text){ const start = output.selectionStart || 0; const end = output.selectionEnd || 0; output.value = output.value.slice(0,start) + text + output.value.slice(end); const pos = start + text.length; output.selectionStart = output.selectionEnd = pos; output.focus(); }
  function isBoundary(ch){ if(ch===undefined) return true; if(/\s/.test(ch)) return true; if(/^[A-Za-z]$/.test(ch)) return false; return true; }
  function updateSuggestions(list){
    // Suggestions disabled per request
    suggestionsRoot.innerHTML='';
    suggestionsRoot.setAttribute('aria-hidden','true');
  }
  function applySuggestion(s){
    if(bufferStart===null) return;
    // Replace the last transliterated preview (use lastTranslit length). If lastTranslit is empty,
    // fall back to replacing from bufferStart to current selectionStart.
    const sel = output.selectionStart || 0;
    const endIdx = bufferStart + (lastTranslit ? lastTranslit.length : (sel - bufferStart));
    const before = output.value.slice(0, bufferStart);
    const after = output.value.slice(endIdx);
    output.value = before + s.output + after;
    const caret = before.length + s.output.length;
    output.selectionStart = output.selectionEnd = caret;
    // clear composition state
    latinBuffer = '';
    lastTranslit = '';
    composing = false;
    bufferStart = null;
    suggestionsRoot.innerHTML='';
    compositionRoot.textContent='';
    output.focus();
  }

  function replaceComposition(translitStr){
    // Use the current caret position as the end of the composition region to replace.
    const sel = output.selectionStart || 0;
    if (bufferStart === null) bufferStart = sel;
    const endIdx = sel; // replace from bufferStart up to current caret
    const before = output.value.slice(0, bufferStart);
    const after = output.value.slice(endIdx);
    output.value = before + translitStr + after;
    const caret = before.length + translitStr.length;
    output.selectionStart = output.selectionEnd = caret;
    output.focus();
    lastTranslit = translitStr;
    composing = true;
  }
  function commitComposition(){ latinBuffer=''; lastTranslit=''; composing=false; bufferStart=null; wordBuffer=''; if(suggestionsRoot){ suggestionsRoot.innerHTML=''; } compositionRoot.textContent=''; }

  // copy/clear/download
  clearBtn.addEventListener('click', ()=> { output.value=''; output.focus(); });
  copyBtn.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(output.value); copyBtn.textContent='Copied!'; setTimeout(()=> copyBtn.textContent='Copy',1200);}catch(e){ alert('Copy failed — your browser may block clipboard access.'); }});
  downloadBtn.addEventListener('click', ()=>{ const blob = new Blob([output.value], {type:'text/plain;charset=utf-8'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='ethiopic.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });

  // key handlers
  output.addEventListener('keydown', (e)=>{
    if(!phoneticOn() || typeof Translit === 'undefined') return;
    const isLetter = /^[A-Za-z]$/.test(e.key);
  if(isLetter){ e.preventDefault(); const sel = output.selectionStart || 0; if(bufferStart === null) bufferStart = sel; latinBuffer += e.key; const preview = Translit.transliterateWord(latinBuffer); compositionRoot.textContent = preview; replaceComposition(preview); return; }
    if(e.key === 'Backspace'){
  if(latinBuffer && latinBuffer.length>0){ e.preventDefault(); latinBuffer = latinBuffer.slice(0,-1); if(latinBuffer.length === 0){ const before = output.value.slice(0, bufferStart); const after = output.value.slice(output.selectionStart); output.value = before + after; output.selectionStart = output.selectionEnd = bufferStart; commitComposition(); } else { const preview = Translit.transliterateWord(latinBuffer); compositionRoot.textContent = preview; replaceComposition(preview); } return; }
    }
    if(e.key === ' ' || e.key === 'Enter' || e.key === '\t'){ if(composing){ commitComposition(); return; } }
    // boundary transliteration
    if(e.key === ' ' || e.key === 'Enter' || e.key === '\t'){
      const selStart = output.selectionStart; let i = selStart - 1; const full = output.value; while(i >= 0 && !isBoundary(full[i])) i--; const wstart = i + 1; const word = full.slice(wstart, selStart); if(word){ const tr = Translit.transliterateWord(word); const before = full.slice(0, wstart); const after = full.slice(selStart); const newVal = before + tr + after; const newCaret = before.length + tr.length; setTimeout(()=>{ output.value = newVal + e.key; output.selectionStart = output.selectionEnd = newCaret + 1; bufferStart = null; wordBuffer=''; },0); }
    }
  });

  output.addEventListener('keypress', (e)=>{
    if(!phoneticOn() || typeof Translit === 'undefined') return;
    if(e.key === "'"){
      const selStart = output.selectionStart; const full = output.value; const prevChar = full[selStart-1]; if(!prevChar) return; const sixthForms = Object.values(Translit.baseSyllables).map(arr=>arr[5]); if(sixthForms.includes(prevChar)){ e.preventDefault(); const before = full.slice(0, selStart); const after = full.slice(selStart); const newVal = before + 'አ' + after; output.value = newVal; const caret = selStart + 1; output.selectionStart = output.selectionEnd = caret; }
    }
  });

  const punctuationMap = { '.':'።', ',':'፣', ':':'፥', ';':'፤' };
  output.addEventListener('keydown', (e)=>{ if(!phoneticOn()) return; if(e.ctrlKey||e.metaKey||e.altKey) return; const mapped = punctuationMap[e.key]; if(mapped){ e.preventDefault(); insertAtCursor(mapped); } });

  window.addEventListener('load', ()=> output && output.focus());
  // Mark as bound to avoid duplicate listeners
  output.__typeGeezBound = true;
})();
