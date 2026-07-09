const fs = require('fs');
const b = fs.readFileSync('src/pages/library.tsx');
const idx = b.indexOf(Buffer.from("addNote: '"));
const seg = b.slice(idx, idx + 30);
console.log('hex:', seg.toString('hex'));
console.log('utf8:', seg.toString('utf8'));