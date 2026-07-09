#!/usr/bin/env node
// scripts/verify-urls.mjs
// HEAD 校验 src/data/resources.ts 里所有 url 是否可访问
// 用法: npm run verify-urls

import {readFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const RESOURCES_FILE = path.join(ROOT, 'src/data/resources.ts');
const LIT_FILE = path.join(ROOT, 'src/data/literatureData.ts');

const TIMEOUT_MS = 8000;
const CONCURRENCY = 6;

function extractObjects(source, kind /* 'resource' | 'literature' */) {
  // 极简提取: 找到 '{ name: ..., url: ... }' 或 '{ id: ..., url: ... }' 的对象
  // 用一个简单的正则匹配 + 嵌套花括号深度计数
  const out = [];
  const re = /\{/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const start = m.index;
    let depth = 1;
    let i = start + 1;
    while (i < source.length && depth > 0) {
      const c = source[i];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    const chunk = source.slice(start, i);
    const idMatch = chunk.match(/(?:name|id):\s*'([^']+)'/);
    const urlMatch = chunk.match(/url:\s*'([^']+)'/);
    if (idMatch && urlMatch) {
      out.push({id: idMatch[1], url: urlMatch[1]});
    }
  }
  return out;
}

async function head(url) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: ac.signal,
      headers: {'user-agent': 'compressor-research-verify/1.0'},
    });
    return res.status;
  } catch (e) {
    // 部分服务器禁 HEAD,fallback GET
    try {
      const ac2 = new AbortController();
      const t2 = setTimeout(() => ac2.abort(), TIMEOUT_MS);
      const r = await fetch(url, {method: 'GET', redirect: 'follow', signal: ac2.signal,
        headers: {'user-agent': 'compressor-research-verify/1.0'}});
      return r.status;
    } catch (e2) {
      return 0;
    }
  } finally {
    clearTimeout(t);
  }
}

async function run(items, label) {
  const results = [];
  let idx = 0;
  const workers = Array.from({length: CONCURRENCY}, async () => {
    while (idx < items.length) {
      const i = items[idx++];
      const status = await head(i.url);
      results.push({...i, status});
      process.stdout.write(`[${label}] ${status === 0 ? 'ERR' : status} ${i.url}\n`);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const [resSrc, litSrc] = await Promise.all([
    readFile(RESOURCES_FILE, 'utf8'),
    readFile(LIT_FILE, 'utf8'),
  ]);
  const resources = extractObjects(resSrc, 'resource');
  const literature = extractObjects(litSrc, 'literature');
  console.log(`共 ${resources.length} 资源 + ${literature.length} 论文待校验`);
  const r1 = await run(resources, 'RES');
  const r2 = await run(literature, 'LIT');
  const dead = [...r1, ...r2].filter((r) => r.status === 0 || (r.status >= 400 && r.status !== 401 && r.status !== 403));
  if (dead.length) {
    console.log(`\n失效链接 ${dead.length} 条:`);
    for (const d of dead) console.log(`  ${d.status} ${d.id} ${d.url}`);
    process.exit(1);
  } else {
    console.log(`\n所有链接可用 ✓`);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });