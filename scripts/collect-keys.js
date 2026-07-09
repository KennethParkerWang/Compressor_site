// 扫所有页面里 CN 字典中"未翻译"的 key
// 检测规则: keyName: '???' (整个 value 是 ? 占位符)
const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/library.tsx',
  'src/pages/calendar.tsx',
  'src/pages/algorithm-board.tsx',
  'src/pages/research-feed.tsx',
  'src/pages/zotero.tsx',
  'src/pages/tasks.tsx',
  'src/pages/experiments.tsx',
  'src/pages/standards.tsx',
  'src/pages/reading-paths.tsx',
  'src/pages/settings.tsx',
  'src/pages/database.tsx',
  'src/pages/core.tsx',
  'src/pages/notes.tsx',
  'src/pages/map.tsx',
  'src/pages/index.tsx',
];

const all = new Map(); // key -> [{file, line, value}]
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const lines = s.split('\n');
  // 匹配 "  keyName: '???'" 形式
  const re = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'(\?+)'\s*,?\s*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) {
      if (!all.has(m[1])) all.set(m[1], []);
      all.get(m[1]).push({file: f, line: i + 1, value: m[2]});
    }
  }
}

console.log('未翻译 keys 总数:', all.size);
const keys = [...all.keys()].sort();
console.log('\nKey 列表:');
keys.forEach(k => {
  const refs = all.get(k);
  console.log(`  ${k} (${refs.length}次, e.g. ${refs[0].file}:${refs[0].line})`);
});