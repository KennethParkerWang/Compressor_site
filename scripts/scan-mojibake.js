// 用更准的方法:试图 utf-8 解码,有 invalid sequence 才是真 mojibake
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

const files = walk(root);
console.log('files:', files.length);

// 用 Node 的 TextDecoder('utf-8', {fatal: true}) 严格解码
const dec = new TextDecoder('utf-8', {fatal: true});
let realMojibake = 0;
const reports = [];

for (const f of files) {
  const buf = fs.readFileSync(f);
  try {
    dec.decode(buf);
    // 通过
  } catch (e) {
    // 有 invalid utf-8 byte sequence
    realMojibake++;
    reports.push({file: f.replace(process.cwd() + '\\', ''), err: e.message});
  }
}

console.log('真 mojibake 文件数:', realMojibake);
reports.slice(0, 40).forEach(r => console.log(r.file, '-', r.err));