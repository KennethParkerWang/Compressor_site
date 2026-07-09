#!/usr/bin/env node
// scripts/lint-tutorial-refs.mjs
// 校验教程(TUT-XXXX)里所有 LIT-XXXX / 术语 / 资源引用都存在
// 用法: npm run lint:tutorial-refs

import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TUTORIALS_GLOB = ['src/data/tutorials.ts'];
const TERM_FILE = path.join(ROOT, 'src/data/terms.ts');
const LIT_FILE = path.join(ROOT, 'src/data/literatureData.ts');
const RES_FILE = path.join(ROOT, 'src/data/resources.ts');
const ASSET_FILE = path.join(ROOT, 'src/data/projectAssets.json');

const LIT_ID = /['"]?(LIT-\d{4,5})['"]?/g;
const TUT_ID = /['"]?(TUT-\d{4})['"]?/g;

function readJson(p) { return readFile(p, 'utf8').then(JSON.parse); }

function extractSet(source, regex) {
  const out = new Set();
  for (const m of source.matchAll(regex)) out.add(m[1]);
  return out;
}

function extractAllTerms(source) {
  // { name: 'Foo', ... }
  const set = new Set();
  const re = /name:\s*'([^']+)'/g;
  for (const m of source.matchAll(re)) set.add(m[1]);
  return set;
}

function extractAllResources(source) {
  const set = new Set();
  const re = /name:\s*'([^']+)'/g;
  for (const m of source.matchAll(re)) set.add(m[1]);
  return set;
}

function extractAllLits(source) {
  const set = new Set();
  const re = /['"]?(LIT-\d{4,5})['"]?/g;
  for (const m of source.matchAll(re)) set.add(m[1]);
  return set;
}

function extractAllAssets(json) {
  const set = new Set();
  for (const a of json) if (a.id) set.add(a.id);
  return set;
}

async function main() {
  const [tutSrc, termSrc, litSrc, resSrc, assetJson] = await Promise.all([
    readFile(path.join(ROOT, TUTORIALS_GLOB[0]), 'utf8').catch(() => ''),
    readFile(TERM_FILE, 'utf8'),
    readFile(LIT_FILE, 'utf8'),
    readFile(RES_FILE, 'utf8'),
    readJson(ASSET_FILE).catch(() => []),
  ]);

  if (!tutSrc) {
    console.log('src/data/tutorials.ts 不存在 (还没建),跳过。');
    return;
  }

  const usedLits = extractSet(tutSrc, LIT_ID);
  const usedTuts = extractSet(tutSrc, TUT_ID);

  const allLits = extractAllLits(litSrc);
  const allTuts = extractAllLits(tutSrc); // 含自身
  const allTerms = extractAllTerms(termSrc);
  const allRes = extractAllResources(resSrc);
  const allAssets = extractAllAssets(assetJson);

  const errors = [];

  for (const id of usedLits) {
    if (!allLits.has(id)) errors.push(`LIT 不存在: ${id}`);
  }
  for (const id of usedTuts) {
    // 自身可包含,只校验 prev/next 链是否闭合
    const expected = id;
    if (!id.startsWith('TUT-')) errors.push(`非法 ID: ${id}`);
  }

  // 校验 prevId / nextId
  const prevRe = /prevId:\s*['"]?(TUT-\d{4})['"]?/g;
  const nextRe = /nextId:\s*['"]?(TUT-\d{4})['"]?/g;
  const prevIds = new Set([...tutSrc.matchAll(prevRe)].map((m) => m[1]));
  const nextIds = new Set([...tutSrc.matchAll(nextRe)].map((m) => m[1]));
  const tutIds = new Set([...tutSrc.matchAll(/^\s*id:\s*['"]?(TUT-\d{4})['"]?/gm)].map((m) => m[1]));

  for (const id of prevIds) if (!tutIds.has(id)) errors.push(`prevId 指向不存在的教程: ${id}`);
  for (const id of nextIds) if (!tutIds.has(id)) errors.push(`nextId 指向不存在的教程: ${id}`);

  // 校验术语在教程 linkedTerms 引用
  const termRe = /linkedTerms:\s*\[([^\]]+)\]/g;
  for (const m of tutSrc.matchAll(termRe)) {
    const ids = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    for (const t of ids) if (!allTerms.has(t)) errors.push(`术语不存在: ${t}`);
  }

  // 校验资源
  const resRe = /linkedResources:\s*\[([^\]]+)\]/g;
  for (const m of tutSrc.matchAll(resRe)) {
    const ids = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    for (const t of ids) if (!allRes.has(t)) errors.push(`资源不存在: ${t}`);
  }

  // 校验资产
  const assetRe = /linkedAssets:\s*\[([^\]]+)\]/g;
  for (const m of tutSrc.matchAll(assetRe)) {
    const ids = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    for (const t of ids) if (!allAssets.has(t)) errors.push(`资产不存在: ${t}`);
  }

  if (errors.length === 0) {
    console.log(`教程引用校验通过 ✓ (教程 ${tutIds.size} 篇,LIT ${usedLits.size} 处)`);
  } else {
    console.log(`发现 ${errors.length} 处问题:`);
    for (const e of errors) console.log(`  - ${e}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });