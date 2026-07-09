const fs = require('fs');
const s = fs.readFileSync('src/pages/library.tsx', 'utf8');
const lines = s.split('\n');
const re = /title[^a-zA-Z]*:\s*['"]([^'"]+)['"]/;
lines.forEach((l, i) => {
  const m = l.match(re);
  if (m && m[1].includes('?')) console.log((i + 1) + ':', l.trim());
});