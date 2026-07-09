const fs = require('fs');
let s = fs.readFileSync('src/pages/library.tsx', 'utf8');

const edits = [
  ['<SelectItem value="intro">intro \u00ef\u00bf\u00bd ??</SelectItem>', '<SelectItem value="intro">intro \u00b7 \u5165\u95e8</SelectItem>'],
  ['<SelectItem value="intermediate">intermediate \u00ef\u00bf\u00bd ??</SelectItem>', '<SelectItem value="intermediate">intermediate \u00b7 \u4e2d\u7ea7</SelectItem>'],
  ['<SelectItem value="advanced">advanced \u00ef\u00bf\u00bd ??</SelectItem>', '<SelectItem value="advanced">advanced \u00b7 \u8fdb\u9636</SelectItem>'],
];

let r = s, n = 0;
for (const [a, b] of edits) {
  if (r.includes(a)) {
    r = r.replace(a, b);
    n++;
  } else {
    console.log('not found:', a.slice(0, 80));
  }
}
fs.writeFileSync('src/pages/library.tsx', r);
console.log('replaced', n);