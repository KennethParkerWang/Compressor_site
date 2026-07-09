const fs = require('fs');
let s = fs.readFileSync('src/pages/library.tsx', 'utf8');
const lines = s.split('\n');
// 找到 line 291-297
for (let i = 290; i < 300 && i < lines.length; i++) {
  console.log((i+1) + ': ' + JSON.stringify(lines[i]).slice(0, 150));
}