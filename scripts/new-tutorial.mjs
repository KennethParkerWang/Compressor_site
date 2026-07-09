#!/usr/bin/env node
// scripts/new-tutorial.mjs
// 一键新建教程文件 + 自动注册到 tutorials.ts 草稿
// 用法: node scripts/new-tutorial.mjs TUT-0101 entry

import {readFile, writeFile, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const id = process.argv[2];
const stage = process.argv[3] || 'entry';
if (!id || !/^TUT-\d{4}$/.test(id)) {
  console.error('用法: node scripts/new-tutorial.mjs TUT-0101 entry');
  process.exit(1);
}

const TUTORIALS_FILE = path.join(ROOT, 'src/data/tutorials.ts');
const TEMPLATE = `  {
    id: '${id}',
    title: 'TODO 标题',
    subtitle: 'TODO 一句话副标题',
    stage: '${stage === 'entry' ? 'entry' : stage === 'intermediate' ? 'intermediate' : 'advanced'}',
    difficulty: '${stage === 'entry' ? 'intro' : stage === 'intermediate' ? 'intermediate' : 'advanced'}',
    estimatedMinutes: 30,
    summary: 'TODO 卡片摘要,1-2 句话讲清你将学到什么。',
    prerequisites: [],
    linkedTerms: [],
    linkedPapers: [],
    linkedResources: [],
    linkedAssets: [],
    sections: [],
    commonPitfalls: [
      'TODO 坑 1',
      'TODO 坑 2',
      'TODO 坑 3',
    ],
    prevId: null,
    nextId: null,
    author: '站主',
    publishedAt: '${new Date().toISOString().slice(0,10)}',
    updatedAt: '${new Date().toISOString().slice(0,10)}',
    tags: [],
    codeExamples: [],
  },
`;

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  if (!(await exists(TUTORIALS_FILE))) {
    // 创建骨架
    const skeleton = `// 教程数据 - 全部教程统一在此管理
// ID 规则: TUT-01xx 入门, TUT-02xx 原理, TUT-03xx 专题
// schema: docs/schemas/tutorial.schema.yaml
// 校验:   npm run lint:tutorial-refs

export type TutorialStage = 'entry' | 'intermediate' | 'advanced';
export type TutorialDifficulty = 'intro' | 'intermediate' | 'advanced';

export interface TutorialSection {
  id: string;
  type: 'intro' | 'prerequisites' | 'body' | 'intuition' | 'formalization'
      | 'code' | 'comparison' | 'pitfalls' | 'callout' | 'next';
  title: string;
  body?: string;
  calloutType?: 'tip' | 'info' | 'warn' | 'danger' | 'compare';
  items?: Array<{kind: string; id: string}>;
  subsections?: TutorialSection[];
  linkedRefs?: Array<{kind: string; id: string}>;
  code?: {lang: string; title?: string; content: string};
}

export interface Tutorial {
  id: string;
  title: string;
  subtitle?: string;
  stage: TutorialStage;
  difficulty: TutorialDifficulty;
  estimatedMinutes: number;
  summary: string;
  prerequisites: Array<{kind: 'tutorial'|'term'|'paper'|'resource'; id: string}>;
  linkedTerms: string[];
  linkedPapers: string[];
  linkedResources: string[];
  linkedAssets: string[];
  sections: TutorialSection[];
  commonPitfalls: string[];
  prevId: string | null;
  nextId: string | null;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  codeExamples: Array<{lang: string; title?: string; code: string; note?: string}>;
  comparison?: {title: string; columns: string[]; rows: Array<Record<string, string>>};
}

export const TUTORIALS: Tutorial[] = [
${TEMPLATE}];
`;
    await writeFile(TUTORIALS_FILE, skeleton, 'utf8');
    console.log(`已创建 ${TUTORIALS_FILE},骨架含 1 条占位教程 ${id}`);
  } else {
    // 在 TUTORIALS = [ 后插入
    const src = await readFile(TUTORIALS_FILE, 'utf8');
    const marker = 'export const TUTORIALS: Tutorial[] = [';
    const idx = src.indexOf(marker);
    if (idx < 0) throw new Error('未找到 TUTORIALS 数组起始位置');
    const insertAt = idx + marker.length;
    const updated = src.slice(0, insertAt) + '\n' + TEMPLATE + src.slice(insertAt);
    await writeFile(TUTORIALS_FILE, updated, 'utf8');
    console.log(`已追加 ${id} 到 ${TUTORIALS_FILE}`);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });