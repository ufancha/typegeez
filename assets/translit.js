(function(global){
  // (copied transliteration engine)
  const baseSyllables = {
    h: ['ሀ','ሁ','ሂ','ሃ','ሄ','ህ','ሆ'],
    l: ['ለ','ሉ','ሊ','ላ','ሌ','ል','ሎ'],
    m: ['መ','ሙ','ሚ','ማ','ሜ','ም','ሞ'],
    s: ['ሰ','ሱ','ሲ','ሳ','ሴ','ስ','ሶ'],
    sh: ['ሸ','ሹ','ሺ','ሻ','ሼ','ሽ','ሾ'],
    r: ['ረ','ሩ','ሪ','ራ','ሬ','ር','ሮ'],
    k: ['ከ','ኩ','ኪ','ካ','ኬ','ክ','ኮ'],
    kh: ['ኸ','ኹ','ኺ','ኻ','ኼ','ኽ','ኾ'],
    g: ['ገ','ጉ','ጊ','ጋ','ጌ','ግ','ጎ'],
    b: ['በ','ቡ','ቢ','ባ','ቤ','ብ','ቦ'],
    t: ['ተ','ቱ','ቲ','ታ','ቴ','ት','ቶ'],
    ch: ['ቸ','ቹ','ቺ','ቻ','ቼ','ች','ቾ'],
    q: ['ቀ','ቁ','ቂ','ቃ','ቄ','ቅ','ቆ'],
    n: ['ነ','ኑ','ኒ','ና','ኔ','ን','ኖ'],
    ny: ['ኘ','ኙ','ኚ','ኛ','ኜ','ኝ','ኞ'],
    '':'አ','\'':'አ',
    a: ['አ','ኡ','ኢ','ኣ','ኤ','እ','ኦ'],
    y: ['የ','ዩ','ዪ','ያ','ዬ','ይ','ዮ'],
    w: ['ወ','ዉ','ዊ','ዋ','ዌ','ው','ዎ'],
    d: ['ደ','ዱ','ዲ','ዳ','ዴ','ድ','ዶ'],
    z: ['ዘ','ዙ','ዚ','ዛ','ዜ','ዝ','ዞ'],
    'zh': ['ጸ','ጹ','ጺ','ጻ','ጼ','ጽ','ጾ'],
    p: ['ፐ','ፑ','ፒ','ፓ','ፔ','ፕ','ፖ'],
    f: ['ፈ','ፉ','ፊ','ፋ','ፌ','ፍ','ፎ'],
    v: ['ቨ','ቩ','ቪ','ቫ','ቬ','ቭ','ቮ'],
  'sh2': ['ሠ','ሡ','ሢ','ሣ','ሤ','ሥ','ሦ'],
  // Map double-s to the ሠ-series so 'ssu'->'ሡ', 'ssi'->'ሢ', 'ssa'->'ሣ', 'ss'->'ሥ', 'sso'->'ሦ'
  ss: ['ሠ','ሡ','ሢ','ሣ','ሤ','ሥ','ሦ'],
    h2: ['ሐ','ሑ','ሒ','ሓ','ሔ','ሕ','ሖ']
  };

  const vowelIndex = { 'a':0,'u':1,'i':2,'aa':3,'ie':4,'e':5,'o':6,'ai':2,'au':1,'ae':5,'aie':4,'':5 };
  const translitMap = {};
  Object.keys(baseSyllables).forEach(cons => {
    const forms = baseSyllables[cons];
    if (!Array.isArray(forms)) return;
    Object.keys(vowelIndex).forEach(v => {
      const idx = vowelIndex[v];
      const key = (cons + v).toLowerCase();
      translitMap[key] = forms[idx];
    });
    const singleKey = cons.toLowerCase();
    if (Array.isArray(forms)) translitMap[singleKey] = forms[5];
  });

  Object.assign(translitMap, { 'a': baseSyllables['a'][0], 'u': baseSyllables['a'][1], 'i': baseSyllables['a'][2], 'aa': baseSyllables['a'][3], 'ie': baseSyllables['a'][4], 'e': baseSyllables['a'][5], 'o': baseSyllables['a'][6], 'ch': translitMap['ch'] || 'ቸ', 'sh': translitMap['sh'] || 'ሸ', 'kh': translitMap['kh'] || 'ኸ', 'ny': translitMap['ny'] || 'ኘ' });

  const explicit = {
    'he':'ሀ','hu':'ሁ','hi':'ሂ','ha':'ሃ','hie':'ሄ','h':'ህ','ho':'ሆ',
    'He':'ሐ','Heu':'ሑ','Hei':'ሒ','Ha':'ሓ','Hie':'ሔ','H':'ሕ','Ho':'ሖ','h2e':'ኀ','h2u':'ኁ','h2i':'ኂ','h2a':'ኃ','h2ie':'ኄ','h2':'ኅ','h2o':'ኆ',
    'le':'ለ','lu':'ሉ','li':'ሊ','la':'ላ','lie':'ሌ','l':'ል','lo':'ሎ',
    'me':'መ','mu':'ሙ','mi':'ሚ','ma':'ማ','mie':'ሜ','m':'ም','mo':'ሞ',
    's2e':'ሠ','s2u':'ሡ','s2i':'ሢ','s2a':'ሣ','s2ie':'ሤ','s2':'ሥ','s2o':'ሦ',
    'se':'ሰ','su':'ሱ','si':'ሲ','sa':'ሳ','sie':'ሴ','s':'ስ','so':'ሶ',
  // Uppercase S maps to the ጸ-series (ts' family)
  'Se':'ጸ','Su':'ጹ','Si':'ጺ','Sa':'ጻ','Sie':'ጼ','S':'ጽ','So':'ጾ',
    'qe':'ቀ','qu':'ቁ','qi':'ቂ','qa':'ቃ','qie':'ቄ','q':'ቅ','qo':'ቆ','que':'ቈ','qui':'ቊ','qua':'ቋ','quie':'ቌ','qW':'ቍ',
    'ke':'ከ','ku':'ኩ','ki':'ኪ','ka':'ካ','kie':'ኬ','k':'ክ','ko':'ኮ','kue':'ኰ','kui':'ኲ','kua':'ኳ','kuie':'ኴ','kW':'ኵ',
    'Ke':'ኸ','Ku':'ኹ','Ki':'ኺ','Ka':'ኻ','Kie':'ኼ','K':'ኽ','Ko':'ኾ',
    'be':'በ','bu':'ቡ','bi':'ቢ','ba':'ባ','bie':'ቤ','b':'ብ','bo':'ቦ',
    'te':'ተ','tu':'ቱ','ti':'ቲ','ta':'ታ','tie':'ቴ','t':'ት','to':'ቶ',
    'ce':'ቸ','cu':'ቹ','ci':'ቺ','ca':'ቻ','cie':'ቼ','c':'ች','co':'ቾ',
    'ne':'ነ','nu':'ኑ','ni':'ኒ','na':'ና','nie':'ኔ','n':'ን','no':'ኖ',
    'Ne':'ኘ','Nu':'ኙ','Ni':'ኚ','Na':'ኛ','Nie':'ኜ','N':'ኝ','No':'ኞ',
    'we':'ወ','wu':'ዉ','wi':'ዊ','wa':'ዋ','wie':'ዌ','w':'ው','wo':'ዎ',
    'Oe':'ዐ','Ou':'ዑ','Oi':'ዒ','Oa':'ዓ','Oie':'ዔ','O':'ዕ','Oo':'ዖ',
    'ze':'ዘ','zu':'ዙ','zi':'ዚ','za':'ዛ','zie':'ዜ','z':'ዝ','zo':'ዞ',
    'Ze':'ዠ','Zu':'ዡ','Zi':'ዢ','Za':'ዣ','Zie':'ዤ','Z':'ዥ','Zo':'ዦ',
    'ye':'የ','yu':'ዩ','yi':'ዪ','ya':'ያ','yie':'ዬ','y':'ይ','yo':'ዮ',
    'de':'ደ','du':'ዱ','di':'ዲ','da':'ዳ','die':'ዴ','d':'ድ','do':'ዶ',
    'je':'ጀ','ju':'ጁ','ji':'ጂ','ja':'ጃ','jie':'ጄ','j':'ጅ','jo':'ጆ',
    'ge':'ገ','gu':'ጉ','gi':'ጊ','ga':'ጋ','gie':'ጌ','g':'ግ','go':'ጎ','gue':'ጐ','gui':'ጒ','gua':'ጓ','guie':'ጔ','gW':'ጕ',
    'Te':'ጠ','Tu':'ጡ','Ti':'ጢ','Ta':'ጣ','Tie':'ጤ','T':'ጥ','To':'ጦ',
    'Ce':'ጨ','Cu':'ጩ','Ci':'ጪ','Ca':'ጫ','Cie':'ጬ','C':'ጭ','Co':'ጮ',
    'Pe':'ጰ','Pu':'ጱ','Pi':'ጲ','Pa':'ጳ','Pie':'ጴ','P':'ጵ','Po':'ጶ',
  'xe':'ጸ','xu':'ጹ','xi':'ጺ','xa':'ጻ','xie':'ጼ','x':'ጽ','xo':'ጾ',
    'x2e':'ፀ','x2u':'ፁ','x2i':'ፂ','x2a':'ፃ','x2ie':'ፄ','x2':'ፅ','x2o':'ፆ',
    'fe':'ፈ','fu':'ፉ','fi':'ፊ','fa':'ፋ','fie':'ፌ','f':'ፍ','fo':'ፎ',
    'pe':'ፐ','pu':'ፑ','pi':'ፒ','pa':'ፓ','pie':'ፔ','p':'ፕ','po':'ፖ',
    // v-series
    've':'ቨ','vu':'ቩ','vi':'ቪ','va':'ቫ','vie':'ቬ','v':'ቭ','vo':'ቮ',
    // custom: map double s to 6th form ሥ
    'ss':'ሥ',
    // special-case: request sse -> ሠ (override default 6th-form mapping)
    'sse':'ሠ'
  };

  // 8th-column mappings. Capitalized sequences (Shift + sequence) can map to alternate 8th-form glyphs.
  const ext8 = {
    'lua':'ሏ','Lua':'ሏ',
    'hua':'ሗ','Hua':'ሗ',
    'mua':'ሟ','Mua':'ሟ',
    's2ua':'ሧ','S2ua':'ሧ',
    'rua':'ሯ','Rua':'ሯ',
    'sua':'ሷ','Sua':'ሷ',
    'koa':'ኯ','Koa':'ኯ',
    'goa':'ጏ','Goa':'ጏ',
    'woa':'ዏ','Woa':'ዏ',
    'kua':'ኯ','Kua':'ኯ',
    'zua':'ዟ','Zua':'ዟ',
    'bua':'ቧ','Bua':'ቧ',
    'tua':'ቷ','Tua':'ቷ',
    'nua':'ኗ','Nua':'ኟ',
    'doa':'ዯ','Doa':'ዯ',
    'gua':'ጓ','Gua':'ጓ',
  'xua':'ጇ','Xua':'ጇ',
  // ch/c labialized (wa) forms
  'cua':'ቿ','Cua':'ጯ','chua':'ቿ','Chua':'ጯ',
    'x2ua':'ፇ','X2ua':'ፇ',
    'fua':'ፏ','Fua':'ፏ',
    'pua':'ፗ','Pua':'ፗ'
  };
  Object.keys(ext8).forEach(k => { translitMap[k] = ext8[k]; });
  Object.keys(explicit).forEach(k => { translitMap[k] = explicit[k]; });

  function suggest(buffer) {
    if(!buffer) return [];
    const b = buffer;
    const suggestions = [];
    for (let len = Math.min(4, b.length); len >= 1; len--) {
      const tail = b.slice(-len);
      if (translitMap[tail]) suggestions.push({input: tail, output: translitMap[tail]});
      if (!translitMap[tail] && translitMap[tail.toLowerCase()]) suggestions.push({input: tail, output: translitMap[tail.toLowerCase()]});
      for (const v of Object.keys(vowelIndex)){
        if (tail.length > v.length && tail.endsWith(v)){
          const cons = tail.slice(0, tail.length - v.length);
          const key = cons + v;
          if(translitMap[key]) suggestions.push({input: tail, output: translitMap[key]});
          else if(translitMap[key.toLowerCase()]) suggestions.push({input: tail, output: translitMap[key.toLowerCase()]});
        }
      }
    }
    const uniq = [];
    const seen = new Set();
    for(const s of suggestions){ if(!seen.has(s.output)){ seen.add(s.output); uniq.push(s); }}
    return uniq.slice(0,6);
  }

  function transliterateWord(word){
    let i = 0; const out = []; const w = word;
    while(i < w.length){
      let matched = false;
      for(let len = Math.min(4, w.length - i); len >= 1; len--){
        const part = w.slice(i, i+len);
        if(translitMap[part]){ out.push(translitMap[part]); i += len; matched = true; break; }
        if(translitMap[part.toLowerCase()]){ out.push(translitMap[part.toLowerCase()]); i += len; matched = true; break; }
      }
      if(!matched){ out.push(w[i]); i++; }
    }
    return out.join('');
  }

  const Translit = { suggest, transliterateWord, translitMap, baseSyllables };
  if(typeof module !== 'undefined' && module.exports) module.exports = Translit;
  else global.Translit = Translit;
})(typeof window !== 'undefined' ? window : global);
