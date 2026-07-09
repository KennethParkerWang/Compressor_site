const fs = require('fs');
let s = fs.readFileSync('src/pages/library.tsx', 'utf8');
const lines = s.split('\n');
// 修 294/295/296
lines[293] = lines[293].replace('<SelectItem value="??">??</SelectItem>', '<SelectItem value="必读">必读</SelectItem>');
lines[294] = lines[294].replace('<SelectItem value="??">??</SelectItem>', '<SelectItem value="推荐">推荐</SelectItem>');
lines[295] = lines[295].replace('<SelectItem value="??">??</SelectItem>', '<SelectItem value="参考">参考</SelectItem>');
fs.writeFileSync('src/pages/library.tsx', lines.join('\n'));
// 验证
const s2 = fs.readFileSync('src/pages/library.tsx', 'utf8');
console.log('After fix:');
const lines2 = s2.split('\n');
for (let i = 290; i < 300 && i < lines2.length; i++) {
  console.log((i+1) + ': ' + lines2[i].trim());
}