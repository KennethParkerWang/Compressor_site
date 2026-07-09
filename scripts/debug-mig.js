const fs = require('fs');
const s = fs.readFileSync('src/data/literatureData.ts', 'utf8');
const idx = s.indexOf('"id": "LIT-0001"');
const block = s.slice(idx, idx + 1500);
console.log('--- 块 ---');
console.log(block);
const m = block.match(/"url":\s*"([^"]+)"(\s*,)?/);
console.log('\n--- urlMatch ---');
console.log(m);