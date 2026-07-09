const fs = require('fs');
const path = require('path');
const files = ['library.tsx','calendar.tsx','algorithm-board.tsx','standards.tsx','research-feed.tsx','zotero.tsx','tasks.tsx','experiments.tsx','reading-paths.tsx','settings.tsx','database.tsx','core.tsx'];
for (const f of files) {
  const s = fs.readFileSync(path.join('src/pages', f), 'utf8');
  const m = s.match(/title:\s*['"]([^'"]+)['"]/);
  console.log(`=== ${f} ===`);
  console.log('  title:', m ? JSON.stringify(m[1]) : '(none)');
  // 找形如 "[中文]??[中文]" 的占位
  const re = /['"][^'"\n]*\?{2,}[^'"\n]*['"]/g;
  let cnt = 0;
  let mm;
  while ((mm = re.exec(s))) {
    if (mm[0].length > 4) {
      console.log('  place:', JSON.stringify(mm[0]).slice(0, 80));
      cnt++;
      if (cnt > 5) break;
    }
  }
}