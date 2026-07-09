// 自动把 literatureData 里所有 url 分类到 attachments
// 替换策略:把 "url": "..." 整行替换成
//   "url": "...",
//   "attachments": [...]
// url 行末的逗号自动加(无论原文件有没有)
const fs = require('fs');
const path = require('path');

const FILE = path.join('src', 'data', 'literatureData.ts');
let src = fs.readFileSync(FILE, 'utf8');

const KIND_LABEL = {
  pdf: 'PDF 全文',
  code: '代码仓库',
  project: '项目主页',
  dataset: '数据集 / 基准',
  video: '视频 / 演讲',
  slides: '幻灯片',
  official: '官方页面 / DOI',
  standard: '标准文档',
  other: '其它',
};

function classify(url) {
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch (e) { return 'other'; }
  if (host.endsWith('arxiv.org') || host.endsWith('arxiv-vanity.com')) return 'pdf';
  if (url.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (host === 'github.com' || host === 'raw.githubusercontent.com' || host === 'gitlab.com' || host === 'bitbucket.org' || host === 'gist.github.com') return 'code';
  if (host === 'doi.org' || host === 'dx.doi.org') return 'official';
  if (host === 'mattmahoney.net' || host === 'www.mattmahoney.net') return 'dataset';
  if (host === 'prize.hutter1.net') return 'dataset';
  if (host === 'corpus.canterbury.ac.nz') return 'dataset';
  if (host === 'sun.aei.polsl.pl') return 'dataset';
  if (host === 'www.imagecompression.info' || host === 'imagecompression.info') return 'dataset';
  if (host === 'www.rfc-editor.org' || host === 'datatracker.ietf.org') return 'standard';
  if (host === 'ccsds.org' || host === 'public.ccsds.org') return 'standard';
  if (host === 'dicom.nema.org') return 'standard';
  if (host === 'www.iso.org' || host === 'iso.org') return 'standard';
  if (host === 'www.itu.int' || host === 'itu.int') return 'standard';
  if (host === 'www.w3.org') return 'standard';
  if (host.endsWith('openaccess.thecvf.com') || host === 'openaccess.thecvf.com') return 'pdf';
  if (host === 'proceedings.mlr.press') return 'pdf';
  if (host === 'aclanthology.org') return 'pdf';
  if (host === 'www.vldb.org') return 'pdf';
  if (host === 'www.usenix.org') return 'pdf';
  if (host.endsWith('ieee.org') || host === 'ieeexplore.ieee.org') return 'pdf';
  if (host.endsWith('springer.com') || host === 'link.springer.com') return 'pdf';
  if (host.endsWith('acm.org') || host === 'dl.acm.org') return 'pdf';
  if (host === 'jmlr.org' || host === 'www.jmlr.org') return 'pdf';
  if (host.endsWith('youtube.com') || host === 'youtu.be' || host.endsWith('vimeo.com')) return 'video';
  if (host === 'bellard.org' || host === 'fahaihi.github.io' || host === 'tukaani.org' || host === 'www.7-zip.org' || host === 'facebook.github.io') return 'project';
  if (host.endsWith('.github.io')) return 'project';
  return 'official';
}

// 找 LIT- 块
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

let migratedCount = 0;
const kindCount = {};

for (let k = blocks.length - 1; k >= 0; k--) {
  const { start, end } = blocks[k];
  const block = src.slice(start, end);
  const urlMatch = block.match(/"url":\s*"([^"]+)"(\s*,)?/);
  if (!urlMatch) continue;
  const url = urlMatch[1];
  const kind = classify(url);
  kindCount[kind] = (kindCount[kind] || 0) + 1;
  const label = KIND_LABEL[kind] || '其它';
  const urlFieldEnd = start + block.indexOf(urlMatch[0]) + urlMatch[0].length;

  // 替换为: "url": "..."(原样), ,\n "attachments": [...]
  // 如果原 url 行末已经有逗号,就不重复加
  const trailing = urlMatch[2] ? '' : ',';
  const repl = `"url": "${url}"${trailing}\n    "attachments": [\n      { "kind": "${kind}", "label": "${label}", "url": "${url}" }\n    ],`;
  src = src.slice(0, start + block.indexOf(urlMatch[0])) + repl + src.slice(urlFieldEnd);
  migratedCount++;
}

console.log('Migrated:', migratedCount, '/', blocks.length);
console.log('Kind:', kindCount);
fs.writeFileSync(FILE, src);
console.log('Done');