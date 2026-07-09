const fs = require('fs');
const lit = fs.readFileSync('src/data/literatureData.ts', 'utf8');
const kCount = {};
let i = 0;
while ((i = lit.indexOf('sourceKind', i + 1)) > 0) {
  const seg = lit.slice(i, i + 80);
  const m2 = seg.match(/sourceKind["':\s]*"(\w+)"/);
  if (m2) kCount[m2[1]] = (kCount[m2[1]] || 0) + 1;
}
console.log('sourceKind 分布:', kCount);
console.log('合计:', Object.values(kCount).reduce((a, b) => a + b, 0));
const urls = lit.match(/https?:\/\/[^\s",}]+/g) || [];
console.log('\n总 url 数:', urls.length);
const hosts = {};
for (const u of urls) {
  try {
    const h = new URL(u).hostname;
    hosts[h] = (hosts[h] || 0) + 1;
  } catch (e) { void e; }
}
const sorted = Object.entries(hosts).sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('\n前 20 host:');
for (const [h, n] of sorted) console.log(' ', n, h);

// 看 url 字段在 paper 上的语义,只取 url 的 host 分布
console.log('\n--- "url" 字段 host ---');
const urlMatches = lit.match(/"url":\s*"https?:\/\/[^"]+"/g) || [];
const urlHosts = {};
for (const u of urlMatches) {
  const m3 = u.match(/https?:\/\/([^/]+)/);
  if (m3) urlHosts[m3[1]] = (urlHosts[m3[1]] || 0) + 1;
}
const sortedUrl = Object.entries(urlHosts).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [h, n] of sortedUrl) console.log(' ', n, h);