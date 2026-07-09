// 修复之前 migration 没加逗号的 url 行
// 模式: "url": "..."(无逗号)\n    "attachments":
const fs = require('fs');
let s = fs.readFileSync('src/data/literatureData.ts', 'utf8');
const re = /"url":\s*"([^"]+)"\n(\s*"attachments":)/g;
let count = 0;
s = s.replace(re, (m, url, rest) => {
  count++;
  return `"url": "${url}",\n${rest}`;
});
console.log('Fixed', count, 'missing commas');
fs.writeFileSync('src/data/literatureData.ts', s);