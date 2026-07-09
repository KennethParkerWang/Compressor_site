// 看 library.tsx 现在哪些 '???' 形式的 value
const fs = require('fs');
const s = fs.readFileSync('src/pages/library.tsx', 'utf8');
const re = /(\b[a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'(\?+)'/g;
let m;
let cnt = 0;
while ((m = re.exec(s))) {
  cnt++;
  console.log(cnt, m[0].slice(0, 80));
}