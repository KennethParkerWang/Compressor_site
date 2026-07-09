// 找出这 5 个文件的 mojibake 字节位置
const fs = require('fs');
const files = [
  'src/pages/algorithm-board.tsx',
  'src/pages/calendar.tsx',
  'src/pages/library.tsx',
  'src/pages/research-feed.tsx',
  'src/pages/zotero.tsx',
];

for (const f of files) {
  const buf = fs.readFileSync(f);
  console.log(`\n=== ${f} (${buf.length} bytes) ===`);
  // 找到非 ASCII 字节位置
  const positions = [];
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] >= 0x80) positions.push(i);
  }
  if (positions.length === 0) {
    console.log('no non-ascii');
    continue;
  }
  // 找不合法 utf-8 的段
  const dec = new TextDecoder('utf-8', {fatal: true});
  // 尝试解码每个非 ascii 字节周围的 context
  for (let idx = 0; idx < Math.min(positions.length, 5); idx++) {
    const p = positions[idx];
    const ctx = buf.slice(Math.max(0, p - 20), Math.min(buf.length, p + 30));
    console.log(`pos ${p}: hex ${ctx.toString('hex').slice(0, 80)}`);
    console.log(`  utf8 try: ${ctx.toString('utf8').replace(/\r?\n/g, '\\n')}`);
    // 验证是合法 utf8
    try {
      dec.decode(ctx);
      console.log(`  -> valid utf-8`);
    } catch (e) {
      console.log(`  -> INVALID: ${e.message}`);
    }
  }
}