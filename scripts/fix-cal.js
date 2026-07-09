// 对 calendar.tsx 做最后的字面 ? 替换
// 这些是注释和 JSX text,不是 CN_MAP 里的 key
const fs = require('fs');
const s = fs.readFileSync('src/pages/calendar.tsx', 'utf8');

// 一一替换(按行)
const replacements = [
  ['// Calendar - FullCalendar ?/?/?/?? + ???? + ????????', '// Calendar - FullCalendar 月/周/日/列表 + 热力图 + 任务同步'],
  ['// ?????:? ?-? ??? 52 ?', '// 关键公式:行 = 周,列 = 年内的 52 周'],
  ['title="Google Calendar ?????????"', 'title="Google Calendar 同步(开发中)"'],
  ['{/* ??????? */}', '{/* 顶部说明 */}'],
  ['// ============= ??????? =============', '// ============= 顶部说明 ============='],
  ['// ????/??????,???? 1 ?', '// 加载/筛选任务,每周 1 列'],
  ['// ???????????', '// 计算每周任务数'],
  ['// ? start ?????????', '// 从 start 开始生成日期'],
  ['// ??', '// 略'],
  ['// ?? 52 ? � 7 ?', '// 渲染 52 周 × 7 天'],
  ['// ??????????', '// 按周统计'],
  ['title={`${cell.date} � ${cell.count} ???`}', 'title={`${cell.date} 共 ${cell.count} 项任务`}'],
];

let r = s;
let n = 0;
for (const [from, to] of replacements) {
  if (r.includes(from)) {
    r = r.replace(from, to);
    n++;
  }
}
fs.writeFileSync('src/pages/calendar.tsx', r);
console.log('replaced', n, 'places');