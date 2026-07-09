const fs = require('fs');
const s = fs.readFileSync('src/pages/calendar.tsx', 'utf8');
const lines = s.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('??') || l.includes('????') || l.includes('?????')) {
    console.log((i + 1) + ':', l.trim().slice(0, 100));
  }
}