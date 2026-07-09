// 扫所有源文件,找形如 "?? text" 或 "text ??" 的中文占位符
// 跳过 JS ?? 操作符(右侧/左侧是标识符或数字)
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

let totalMatches = 0;
const report = [];

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  // 1. mojibake 检测:连续的 0xc0-0xff 字节被错误显示
  const buf = fs.readFileSync(f);
  // 找 latin1 形式的中文(字节 c0-ff 但后一个字节不是合法 utf8 continuation)
  // 这是因为 0xc0-0xff 作为单字节在 latin1 中是字符,但在 utf8 中只能作为 leading
  // 简单启发:连续 2+ 字节范围 0xc0-0xff 的,且都后续接同样范围
  const mojibakeBytes = [];
  for (let i = 0; i < buf.length - 1; i++) {
    const b = buf[i];
    const b2 = buf[i + 1];
    if (b >= 0xc0 && b <= 0xff && b2 >= 0x80 && b2 <= 0xff) {
      mojibakeBytes.push(i);
    }
  }
  if (mojibakeBytes.length > 4) {
    report.push({file: f, type: 'mojibake-bytes', count: mojibakeBytes.length});
    totalMatches += mojibakeBytes.length;
  }

  // 2. 字面 ?? 占位符:在字符串内,出现在引号内且不是 ?? 运算符
  // 简化:行内  ??  连续 2+,且周围是中文/标识符(非 ASCII)
  const lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 匹配 "[中文]??[中文]" 或 "...?? text"
    const m = line.match(/(?<=[\u4e00-\u9fff'"\s])(\?{2,})(?=[\u4e00-\u9fff'"\s])/g);
    if (m) {
      for (const mm of m) {
        report.push({file: f, line: i + 1, sample: line.trim().slice(0, 120), type: 'literal-??'});
        totalMatches++;
      }
    }
  }
}

console.log('total issues:', totalMatches);
report.slice(0, 60).forEach(r => console.log(`[${r.type}] ${r.file}:${r.line || ''} - ${(r.sample || '').slice(0, 80)}`));