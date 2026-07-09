const fs = require('fs');
const path = require('path');
const files = ['library.tsx','calendar.tsx','algorithm-board.tsx','research-feed.tsx','zotero.tsx','tasks.tsx','experiments.tsx','standards.tsx','reading-paths.tsx','settings.tsx','database.tsx','core.tsx','notes.tsx','map.tsx','index.tsx'];
for (const f of files) {
  const s = fs.readFileSync(path.join('src/pages', f), 'utf8');
  const lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // 找含 ?? 的 SelectItem/option/Button 等
    if (/SelectItem|option|Button|button/i.test(l) && /\?{2,}/.test(l)) {
      console.log(f + ':' + (i + 1) + ': ' + l.trim().slice(0, 120));
    }
  }
}