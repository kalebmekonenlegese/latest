const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');
const exts = new Set(['.html']);

// Broken lordicon URLs (confirmed 404) -> replacement (valid)
const BROKEN = [
  'https://cdn.lordicon.com/abhwnlcl.json',
  'https://cdn.lordicon.com/ajdvssml.json',
  'https://cdn.lordicon.com/cgagxdkh.json',
  'https://cdn.lordicon.com/csqxqico.json',
  'https://cdn.lordicon.com/cxdjxowu.json',
  'https://cdn.lordicon.com/eyxvujdt.json',
  'https://cdn.lordicon.com/fnzywfcl.json',
  'https://cdn.lordicon.com/gfcymwwz.json',
  'https://cdn.lordicon.com/gfskmper.json',
  'https://cdn.lordicon.com/goekhvmz.json',
  'https://cdn.lordicon.com/gxddmtib.json',
  'https://cdn.lordicon.com/hjbrqndu.json',
  'https://cdn.lordicon.com/hzuejoyc.json',
  'https://cdn.lordicon.com/ikshqotn.json',
  'https://cdn.lordicon.com/iqywdbpc.json',
  'https://cdn.lordicon.com/iyftrlbl.json',
  'https://cdn.lordicon.com/jtveugaa.json',
  'https://cdn.lordicon.com/ofgzofep.json',
  'https://cdn.lordicon.com/ogqzpmjq.json',
  'https://cdn.lordicon.com/oqdidnpp.json',
  'https://cdn.lordicon.com/psduqmmb.json',
  'https://cdn.lordicon.com/qqkgfssl.json',
  'https://cdn.lordicon.com/quwfeyls.json',
  'https://cdn.lordicon.com/xklvbwud.json',
  'https://cdn.lordicon.com/xxjptekd.json',
  'https://cdn.lordicon.com/yolaexdl.json'
];

// Single valid replacement icon (keeps visual consistency)
const VALID = 'https://cdn.lordicon.com/puvaffet.json';

const MOJIBAKE = {
  'Ã¢â‚¬Â¢': '•',
  'Ã¢â‚¬Âº': '›',
  'Ã¢â‚¬Â¹': '‹',
  'Ã¢Å“â€¢': '•',
  'â˜…': '★',
  'Ã‚Â°': '°',
  'ÃƒÂ©': 'é',
  'Ã¢Ëœâ€\u00a0': '"',
  'Ã¢â„¢Â¡': '¡'
};

function walk(dir){
  const out = [];
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir,name);
    if(fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if(exts.has(path.extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const replacedIcons = {}
let mojibakeFiles = 0;

for(const f of files){
  let text = fs.readFileSync(f,'utf8');
  let orig = text;
  // replace broken icons
  for(const b of BROKEN){
    if(text.includes(b)){
      text = text.split(b).join(VALID);
      replacedIcons[b] = replacedIcons[b] || [];
      replacedIcons[b].push(f);
    }
  }
  // replace mojibake sequences
  let changed = false;
  for(const [k,v] of Object.entries(MOJIBAKE)){
    if(text.includes(k)){
      text = text.split(k).join(v);
      changed = true;
    }
  }
  if(changed) mojibakeFiles++;
  if(text !== orig){
    fs.writeFileSync(f, text, 'utf8');
  }
}

// Output report
console.log('Replaced Lordicon URLs:');
for(const [k,files] of Object.entries(replacedIcons)){
  console.log(k, '->', VALID);
  files.forEach(f=>console.log('  ', f));
}
console.log('Total broken icons replaced:', Object.keys(replacedIcons).length);
console.log('Mojibake fixes applied to files:', mojibakeFiles);
