const b = require('fs').readFileSync('src/pages/library.tsx');
const i = b.indexOf(Buffer.from('value="intro"'));
const seg = b.slice(i, i + 80);
console.log('hex:', seg.toString('hex'));
console.log('text:', JSON.stringify(seg.toString('utf8')));