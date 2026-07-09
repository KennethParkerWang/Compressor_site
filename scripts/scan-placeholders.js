// 扫描所有 pages 中残留的 '???' 占位
const fs = require('fs');
const path = require('path');
const files = ['library.tsx','calendar.tsx','algorithm-board.tsx','research-feed.tsx','zotero.tsx','tasks.tsx','experiments.tsx','standards.tsx','reading-paths.tsx','settings.tsx','database.tsx','core.tsx','notes.tsx','map.tsx','index.tsx'];
for (const f of files) {
  const s = fs.readFileSync(path.join('src/pages', f), 'utf8');
  // 匹配 "key: '??'" 或 "'??': value"
  const reFull = /(\b[a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'(\?+)'/g;
  const reDict = /'(\?+)'\s*:\s*'/g;
  const reJsxText = />([^<>{}\n]*\?{2,}[^<>{}\n]*)</g;
  const reStr = /['"]([^'"]*\?{3,}[^'"]*)['"]/g;
  let m, total = 0;
  while ((m = reFull.exec(s))) {
    console.log(`${f}:FULL ${m[0].slice(0, 80)}`);
    total++;
  }
  while ((m = reDict.exec(s))) {
    console.log(`${f}:DICT ${m[0]}`);
    total++;
  }
  while ((m = reJsxText.exec(s))) {
    console.log(`${f}:JSX ${m[0]}`);
    total++;
  }
  while ((m = reStr.exec(s))) {
    // 排除掉 ?? 操作符混淆:值里全是 ? 或者前后都是 ' ??
    const v = m[1];
    if (/^[\s\?]+$/.test(v) || /\?\?/.test(v)) continue;
    if (v.length > 3 && /^\?+/.test(v.trim())) {
      console.log(`${f}:STR ${JSON.stringify(m[0]).slice(0, 80)}`);
      total++;
    }
  }
}