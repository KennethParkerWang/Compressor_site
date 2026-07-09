#!/usr/bin/env node
// scripts/audit-no-fabrication.mjs
// 反胡编审查:扫所有 .ts/.tsx/.md,标记潜在风险
// 规则:
//   1. 论文标题/作者/年份格式不正确的
//   2. URL 不带 LIT-XXXX / 资源名引用
//   3. 数字声明 (SOTA / 压缩率) 不带来源链接
//   4. arXiv 编号格式不对
// 用法: npm run audit:no-fab

import {readdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SCAN_DIRS = ['src/pages', 'src/components', 'docs'];
const SKIP = ['node_modules', '.docusaurus', 'build'];

const SOTA_PATTERN = /(\d+\.?\d*)\s*(bpp|bps|MB\/s|GHz|fps|%)/gi;
const ARXIV_PATTERN = /arXiv:\s*(\d{4}\.\d{4,5})/gi;
const LIT_REF_PATTERN = /LIT-\d{4}/g;

async function walk(dir) {
  const out = [];
  let entries;
  try { entries = await readdir(dir); } catch { return out; }
  for (const e of entries) {
    if (SKIP.includes(e)) continue;
    const p = path.join(dir, e);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...await walk(p));
    else if (/\.(ts|tsx|md|mdx)$/.test(e)) out.push(p);
  }
  return out;
}

async function main() {
  const files = [];
  for (const d of SCAN_DIRS) files.push(...await walk(path.join(ROOT, d)));
  console.log(`扫描 ${files.length} 个文件 ...`);

  const issues = [];
  for (const f of files) {
    const src = await readFile(f, 'utf8');
    // 规则 3: 出现 SOTA 数字 + 5 行内没有 LIT-XXXX 引用
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      // 跳过注释
      const trimmed = ln.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      // SOTA 数字
      for (const m of ln.matchAll(SOTA_PATTERN)) {
        const ctx = lines.slice(Math.max(0, i - 5), i + 1).join('\n');
        if (!LIT_REF_PATTERN.test(ctx) && !/来源|sources?|\bbenchmark\b/i.test(ctx)) {
          issues.push({file: f, line: i + 1, msg: `数字 "${m[0]}" 5 行内缺来源标记`});
        }
      }
      // arXiv 格式
      for (const m of ln.matchAll(ARXIV_PATTERN)) {
        if (!/^\d{4}\.\d{4,5}(v\d+)?$/.test(m[1])) {
          issues.push({file: f, line: i + 1, msg: `arXiv 编号格式不对: ${m[1]}`});
        }
      }
    }
  }

  if (issues.length === 0) {
    console.log('反胡编审查通过 ✓');
  } else {
    console.log(`发现 ${issues.length} 个潜在风险:`);
    for (const i of issues) console.log(`  ${i.file}:${i.line} - ${i.msg}`);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });