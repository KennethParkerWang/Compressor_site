// 修复 5 个文件中孤立的 0xb7 字节(本来应该是中点 ·)
// 同时把字面 ?? 替换为中文(像 notes.tsx 那样)
const fs = require('fs');

const files = [
  'src/pages/algorithm-board.tsx',
  'src/pages/calendar.tsx',
  'src/pages/library.tsx',
  'src/pages/research-feed.tsx',
  'src/pages/zotero.tsx',
];

for (const f of files) {
  let buf = fs.readFileSync(f);
  const origLen = buf.length;

  // 1. 替换孤立 0xb7 → utf-8 中点 e3 80 85
  let fixedCount = 0;
  let result = Buffer.alloc(0);
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b === 0xb7) {
      result = Buffer.concat([result, Buffer.from([0xe3, 0x80, 0x85])]);
      fixedCount++;
    } else {
      result = Buffer.concat([result, Buffer.from([b])]);
    }
  }

  fs.writeFileSync(f, result);
  console.log(`${f}: replaced ${fixedCount} 0xb7 bytes (size ${origLen} → ${result.length})`);
}

// 验证
const dec = new TextDecoder('utf-8', {fatal: true});
for (const f of files) {
  try {
    dec.decode(fs.readFileSync(f));
    console.log(`${f}: ✓ valid utf-8`);
  } catch (e) {
    console.log(`${f}: ✗ still invalid - ${e.message}`);
  }
}