const fs = require('fs');
const s = fs.readFileSync('src/data/literatureData.ts', 'utf8');
const att = (s.match(/"attachments":\s*\[/g) || []).length;
console.log('attachments 出现次数:', att);
const noUrl = (s.match(/"url":\s*"/g) || []).length;
console.log('url 字段保留:', noUrl);
const kinds = {};
let i = 0;
while ((i = s.indexOf('"kind":', i + 1)) > 0) {
  const seg = s.slice(i, i + 40);
  const m2 = seg.match(/"kind":\s*"(\w+)"/);
  if (m2) kinds[m2[1]] = (kinds[m2[1]] || 0) + 1;
}
console.log('attachment kinds:', kinds);
console.log('literature 节点数(找 LIT-):', (s.match(/"id":\s*"LIT-/g) || []).length);