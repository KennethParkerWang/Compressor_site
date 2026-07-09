const fs = require('fs');
const b = fs.readFileSync('src/data/literatureData.ts');
const idx = b.indexOf('"url": "https://doi.org/10.1109/TIT.1956.1056818"');
const seg = b.slice(idx, idx + 80);
console.log('hex:', seg.toString('hex'));
console.log('text:', JSON.stringify(seg.toString('utf8')));