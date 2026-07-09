#!/usr/bin/env node
// scripts/tutorial-progress.mjs
// 输出当前 P0/P1/P2 教程的覆盖/缺口/进度
// 用法: npm run tutorial:progress

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TUTORIALS = path.join(ROOT, 'src/data/tutorials.ts');

const STAGES = [
  {key: 'entry', label: 'P0 入门', plan: 8},
  {key: 'intermediate', label: 'P1 原理', plan: 5},
  {key: 'advanced', label: 'P2 专题', plan: 3},
];

async function main() {
  let src;
  try { src = await readFile(TUTORIALS, 'utf8'); }
  catch { console.log('src/data/tutorials.ts 不存在,未启动'); return; }

  const tuts = [];
  const re = /\{\s*id:\s*'(TUT-\d{4})'[\s\S]*?stage:\s*'(entry|intermediate|advanced)'[\s\S]*?estimatedMinutes:\s*(\d+)/g;
  for (const m of src.matchAll(re)) {
    tuts.push({id: m[1], stage: m[2], minutes: parseInt(m[3], 10)});
  }

  for (const s of STAGES) {
    const items = tuts.filter((t) => t.stage === s.key);
    const totalMin = items.reduce((a, b) => a + b.minutes, 0);
    const pct = s.plan === 0 ? 0 : Math.round(items.length / s.plan * 100);
    console.log(`\n${s.label}: ${items.length}/${s.plan} (${pct}%)  总时长 ${totalMin} min`);
    for (const t of items) console.log(`  - ${t.id} (${t.minutes} min)`);
  }
  console.log(`\n总计: ${tuts.length} 篇教程`);
}

main().catch((e) => { console.error(e); process.exit(2); });