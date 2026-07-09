const fs = require('fs');
let src = fs.readFileSync('src/data/literatureData.ts', 'utf8');
const blocks = [];
let i = 0;
while (true) {
  const start = src.indexOf('"id": "LIT-', i);
  if (start < 0) break;
  let end = src.indexOf('"id": "LIT-', start + 1);
  if (end < 0) end = src.indexOf('];', start);
  if (end < 0) break;
  blocks.push({ start, end });
  i = end;
}
console.log('blocks:', blocks.length);
// 找包含 doi.org/10.1109/TIT.1956.1056818 的块
const targetIdx = src.indexOf('"url": "https://doi.org/10.1109/TIT.1956.1056818"');
console.log('targetIdx:', targetIdx);
for (let k = 0; k < blocks.length; k++) {
  const { start, end } = blocks[k];
  if (targetIdx >= start && targetIdx < end) {
    console.log('block', k, 'start:', start, 'end:', end);
    const block = src.slice(start, end);
    const urlMatch = block.match(/"url":\s*"([^"]+)"(\s*,)?/);
    console.log('urlMatch:', urlMatch);
    if (urlMatch) {
      const idxInBlock = block.indexOf(urlMatch[0]);
      console.log('idxInBlock:', idxInBlock, 'length:', urlMatch[0].length);
      console.log('m[2] truthy:', !!urlMatch[2]);
    }
  }
}