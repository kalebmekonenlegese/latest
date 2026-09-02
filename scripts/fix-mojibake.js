const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');
const exts = new Set(['.html']);

const replacements = {
  'Ã¢â‚¬Â¢': '•',
  'Ã¢â‚¬Âº': '›',
  'Ã¢â‚¬Â¹': '‹',
  'Ã¢Å“â€¢': '•',
  'â˜…': '★',
  'Ã‚Â°': '°',
  'ÃƒÂ©': 'é'
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

function dryRun(){
  const files = walk(ROOT);
  let total = 0;
  for(const f of files){
    const orig = fs.readFileSync(f,'utf8');
    let updated = orig;
    for(const [k,v] of Object.entries(replacements)) updated = updated.split(k).join(v);
    if(updated !== orig){
      total++;
      console.log('===', f);
      const origLines = orig.split(/\r?\n/);
      const newLines = updated.split(/\r?\n/);
      for(let i=0;i<origLines.length;i++){
        if(origLines[i] !== newLines[i]){
          console.log(' L'+(i+1)+':', origLines[i].trim());
          console.log(' ->', newLines[i].trim());
        }
      }
    }
  }
  console.log('Dry-run complete. Files that would change:', total);
}

if(require.main === module){
  dryRun();
}
