// 批量修复 23 个 mojibake 文件
// 思路:扫描所有连续 latin1 字节段,把每段当作 latin1 字符串读出,然后用 utf8 编码
const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'src');

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    const s = fs.statSync(fp);
    if (s.isDirectory()) walk(fp, files);
    else if (/\.(tsx?|mdx?|css|ts)$/.test(f)) files.push(fp);
  }
  return files;
}

function findLatin1Segments(buf) {
  // 找连续 2+ 字节范围 0xc0-0xff 的
  const segs = [];
  let i = 0;
  while (i < buf.length) {
    const b = buf[i];
    if (b >= 0xc0 && b <= 0xff) {
      // 找段尾
      let j = i;
      while (j < buf.length && buf[j] >= 0x80) j++;
      // 必须是 0xc0-0xff 起始且非合法 utf-8 leading
      // 合法 utf-8 leading: 0xc0-0xdf + 1 continuation, 0xe0-0xef + 2, 0xf0-0xf7 + 3
      if (j - i >= 2) {
        // 验证:解码为 latin1 字符串,再编码 utf-8,看是否得到不同的字节(确认是 latin1 而非 utf-8)
        const seg = buf.slice(i, j);
        const latin1Str = seg.toString('latin1');
        const utf8Back = Buffer.from(latin1Str, 'utf8');
        // 如果 utf8 回写得到相同字节,说明原本是 utf-8
        if (!utf8Back.equals(seg)) {
          segs.push({start: i, end: j, buf: seg});
        }
      }
      i = j;
    } else {
      i++;
    }
  }
  return segs;
}

const files = walk(root);
let totalFiles = 0;
let totalSegments = 0;
const dec = new TextDecoder('utf-8', {fatal: true});

for (const f of files) {
  const buf = fs.readFileSync(f);
  // 检查是否真有 mojibake
  let hasMojibake = false;
  try {
    dec.decode(buf);
  } catch (e) {
    hasMojibake = true;
  }
  if (!hasMojibake) continue;

  const segs = findLatin1Segments(buf);
  if (segs.length === 0) {
    console.log('NO SEGMENTS for', f);
    continue;
  }

  // 合并重叠
  segs.sort((a, b) => a.start - b.start);
  let result = Buffer.alloc(0);
  let cursor = 0;
  let segmentCount = 0;
  for (const seg of segs) {
    if (seg.start < cursor) continue; // skip overlap
    result = Buffer.concat([result, buf.slice(cursor, seg.start)]);
    const latin1Str = seg.buf.toString('latin1');
    const utf8Bytes = Buffer.from(latin1Str, 'utf8');
    result = Buffer.concat([result, utf8Bytes]);
    cursor = seg.end;
    segmentCount++;
  }
  result = Buffer.concat([result, buf.slice(cursor)]);

  // 验证
  let valid = false;
  try {
    dec.decode(result);
    valid = true;
  } catch (e) {}
  if (valid) {
    fs.writeFileSync(f, result);
    totalFiles++;
    totalSegments += segmentCount;
    console.log(`FIXED ${f} (${segmentCount} segments)`);
  } else {
    console.log(`FAILED ${f}`);
  }
}

console.log(`Total: ${totalFiles} files, ${totalSegments} segments`);