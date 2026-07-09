// 全局 Command Palette: ⌘K / Ctrl+K 唤起,跨文献/笔记/任务/章节/路径搜索 + 直接跳转
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Fuse from 'fuse.js';
import {useLocation} from '@docusaurus/router';
import {literatureData} from '../../data/literatureData';
import {readingPaths} from '../../data/readingPaths';
import {readingNotes} from '../../data/readingNotes';
import {researchTasks} from '../../data/researchTasks';
import {treeData} from '../../data/treeData';
import {algorithmModules} from '../../data/algorithmModules';
import {standardScenarios} from '../../data/standardScenarios';
import {BookOpen, FileText, NotebookPen, Sparkles, Map as MapIcon, Target, Compass, ChevronRight, Search} from 'lucide-react';
import styles from './CommandPalette.module.css';

type PaletteItem = {
  id: string;
  kind: 'paper' | 'path' | 'note' | 'task' | 'chapter' | 'module' | 'scenario' | 'page';
  label: string;
  hint?: string;
  href: string;
  icon: React.ReactNode;
  score?: number;
};

const PAGES: {to: string; zhLabel: string; zhHint: string; enLabel: string; enHint: string}[] = [
  {to: '/', zhLabel: '今日总览', zhHint: '科研驾驶舱与进度入口', enLabel: 'Today Dashboard', enHint: 'Research progress dashboard'},
  {to: '/library', zhLabel: '文献库', zhHint: '论文、标准、代码和数据集证据', enLabel: 'Library', enHint: 'Evidence database'},
  {to: '/sota', zhLabel: 'SOTA榜单', zhHint: '榜单证据与结果复核', enLabel: 'SOTA Leaderboards', enHint: 'Leaderboard evidence'},
  {to: '/datasets', zhLabel: '数据集', zhHint: '基准数据集与评测入口', enLabel: 'Datasets', enHint: 'Benchmark registry'},
  {to: '/hub', zhLabel: '资源库', zhHint: '工具、课程、项目、标准与模板', enLabel: 'Resource Library', enHint: 'Tools, courses, projects, standards, and templates'},
  {to: '/map', zhLabel: '研究图谱', zhHint: '文献关系与研究结构', enLabel: 'Research Map', enHint: 'Literature relationship map'},
  {to: '/reading-paths', zhLabel: '阅读路线', zhHint: '按主题组织的学习顺序', enLabel: 'Reading Paths', enHint: 'Curated reading syllabus'},
  {to: '/notes', zhLabel: '研究笔记', zhHint: '精读笔记与写作沉淀', enLabel: 'Notes', enHint: 'Research notes'},
  {to: '/tasks', zhLabel: '任务看板', zhHint: '研究任务与执行状态', enLabel: 'Tasks', enHint: 'Execution board'},
  {to: '/calendar', zhLabel: '日程计划', zhHint: '项目节奏与任务截止', enLabel: 'Calendar', enHint: 'Project schedule'},
  {to: '/weekly-reports', zhLabel: '双周汇报中心', zhHint: '双周汇报排期、可编辑草稿和全屏展示入口', enLabel: 'Biweekly Briefings', enHint: 'Biweekly schedule, editable drafts, and fullscreen presentation'},
  {to: '/project-overview', zhLabel: '项目年度计划', zhHint: '甲方视角的研发计划面板', enLabel: 'Project Overview', enHint: 'Delivery and acceptance plan'},
  {to: '/neural-hub', zhLabel: '深度压缩器', zhHint: '学习式压缩方向库', enLabel: 'Learned Compression', enHint: 'Learned compression library'},
  {to: '/research-feed', zhLabel: '来源监控', zhHint: '候选资料发现与筛选', enLabel: 'Research Feed', enHint: 'External source monitor'},
  {to: '/algorithm-board', zhLabel: '算法模块', zhHint: '压缩器流程模块', enLabel: 'Algorithm Modules', enHint: 'Codec modules'},
  {to: '/algorithm-evolution', zhLabel: '演化天梯', zhHint: '压缩算法历史脉络', enLabel: 'Algorithm Evolution Ladder', enHint: 'Compression algorithm atlas'},
  {to: '/algorithm-catalog', zhLabel: '算法目录', zhHint: '压缩算法档案', enLabel: 'Algorithm Catalog', enHint: 'Algorithm dossiers'},
  {to: '/standards', zhLabel: '标准矩阵', zhHint: '标准与应用场景', enLabel: 'Standards', enHint: 'Standards and scenarios'},
  {to: '/experiments', zhLabel: '实验台', zhHint: '复现实验与测试向导', enLabel: 'Experiments', enHint: 'Reproduction lab'},
  {to: '/core', zhLabel: '核心论文', zhHint: '优先精读论文集合', enLabel: 'Core Papers', enHint: 'Essential papers'},
  {to: '/database', zhLabel: '文献总表', zhHint: '文献库简表', enLabel: 'Database', enHint: 'Literature table'},
  {to: '/settings', zhLabel: '设置', zhHint: '外观与工作区配置', enLabel: 'Settings', enHint: 'Appearance and workspace settings'},
];

const KIND_LABEL: Record<'zh' | 'en', Record<PaletteItem['kind'], string>> = {
  zh: {
    paper: '文献',
    path: '路线',
    note: '笔记',
    task: '任务',
    chapter: '章节',
    module: '模块',
    scenario: '标准',
    page: '页面',
  },
  en: {
    paper: 'Paper',
    path: 'Path',
    note: 'Note',
    task: 'Task',
    chapter: 'Chapter',
    module: 'Module',
    scenario: 'Standard',
    page: 'Page',
  },
};

const PALETTE_COPY = {
  zh: {
    placeholder: '搜索文献、章节、笔记、任务、路线、模块、页面…',
    empty: '没有匹配项。可以试试 Shannon 或 Huffman。',
    move: '移动',
    select: '选择',
    close: '关闭',
    count: '项',
  },
  en: {
    placeholder: 'Search papers, chapters, notes, tasks, paths, modules, pages...',
    empty: 'No matches. Try "Shannon" or "Huffman".',
    move: 'Move',
    select: 'Select',
    close: 'Close',
    count: 'items',
  },
};

function buildIndex(lang: 'zh' | 'en'): PaletteItem[] {
  const items: PaletteItem[] = [];
  const href = (value: string) => localizeHref(value, lang);
  for (const l of literatureData) {
    items.push({
      id: l.id,
      kind: 'paper',
      label: l.title,
      hint: `${l.authors ?? ''} ${l.year ?? ''} ${l.chapterTitleZh ?? ''}`.trim(),
      href: href(`/library?lit=${l.id}`),
      icon: <FileText size={14} />,
    });
  }
  for (const p of readingPaths) {
    items.push({
      id: p.id,
      kind: 'path',
      label: lang === 'zh' ? (p.nameZh ?? p.name) : p.name,
      hint: p.goal ?? p.audience ?? '',
      href: href(`/reading-paths?path=${p.id}`),
      icon: <Target size={14} />,
    });
  }
  for (const n of readingNotes) {
    items.push({
      id: n.id,
      kind: 'note',
      label: n.title,
      hint: `${n.author} ${n.year} ${n.tags?.join(' ') ?? ''}`,
      href: href(`/notes?note=${n.id}`),
      icon: <NotebookPen size={14} />,
    });
  }
  for (const t of researchTasks) {
    items.push({
      id: t.id,
      kind: 'task',
      label: t.title,
      hint: `${t.status} ${t.priority} ${t.dueDate ?? ''}`,
      href: href(`/tasks?task=${t.id}`),
      icon: <Sparkles size={14} />,
    });
  }
  for (const c of treeData) {
    items.push({
      id: c.id,
      kind: 'chapter',
      label: c.titleZh ?? c.title,
      hint: `${c.id} ${c.title ?? ''}`,
      href: href(`/library?chapter=${c.id}`),
      icon: <Compass size={14} />,
    });
  }
  for (const m of algorithmModules) {
    items.push({
      id: m.id,
      kind: 'module',
      label: m.nameZh ?? m.id,
      hint: `${m.id} ${m.category ?? ''}`,
      href: href(`/algorithm-board?module=${m.id}`),
      icon: <MapIcon size={14} />,
    });
  }
  for (const s of standardScenarios) {
    items.push({
      id: s.id,
      kind: 'scenario',
      label: s.nameZh ?? s.id,
      hint: s.problem ?? '',
      href: href(`/standards?scenario=${s.id}`),
      icon: <BookOpen size={14} />,
    });
  }
  for (const p of PAGES) {
    items.push({
      id: 'page:' + p.to,
      kind: 'page',
      label: lang === 'zh' ? p.zhLabel : p.enLabel,
      hint: lang === 'zh' ? p.zhHint : p.enHint,
      href: href(p.to),
      icon: <ChevronRight size={14} />,
    });
  }
  return items;
}

const KIND_COLOR: Record<PaletteItem['kind'], string> = {
  paper: '#1f4ed8',
  path: '#0d9488',
  note: '#b45309',
  task: '#7c3aed',
  chapter: '#334155',
  module: '#0ea5e9',
  scenario: '#059669',
  page: '#64748b',
};

export default function CommandPalette(): React.ReactElement | null {
  const location = useLocation();
  const lang: 'zh' | 'en' = location.pathname === '/en' || location.pathname.startsWith('/en/') ? 'en' : 'zh';
  const copy = PALETTE_COPY[lang];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const items = useMemo(() => buildIndex(lang), [lang]);
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['label', 'hint'],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
      }),
    [items],
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      const pages = items.filter((it) => it.kind === 'page');
      const recent = items.filter((it) => it.kind !== 'page').slice(0, 8);
      return [...pages, ...recent];
    }
    return fuse.search(query).slice(0, 24).map((r) => ({...r.item, score: r.score}));
  }, [query, items, fuse]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const choose = useCallback((item: PaletteItem) => {
    setOpen(false);
    setQuery('');
    if (typeof window !== 'undefined') {
      window.location.assign(item.href);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cur = results[active];
        if (cur) choose(cur);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, choose]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).__openCommandPalette__ = () => setOpen(true);
    return () => {
      delete (window as any).__openCommandPalette__;
    };
  }, []);

  if (!mounted || !open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <Search size={16} />
          <input
            autoFocus
            className={styles.input}
            placeholder={copy.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.kbd}>esc</span>
        </div>
        <ul className={styles.list}>
          {results.length === 0 ? (
            <li className={styles.empty}>{copy.empty}</li>
          ) : (
            results.map((it, i) => (
              <li
                key={it.id}
                className={`${styles.item} ${i === active ? styles.active : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(it)}
              >
                <span className={styles.icon}>{it.icon}</span>
                <span className={styles.kind} style={{background: KIND_COLOR[it.kind]}}>
                  {KIND_LABEL[lang][it.kind]}
                </span>
                <span className={styles.label}>{it.label}</span>
                {it.hint ? <span className={styles.hint}>{it.hint}</span> : null}
                <ChevronRight size={14} className={styles.go} />
              </li>
            ))
          )}
        </ul>
        <div className={styles.footer}>
          <span><kbd>↑↓</kbd> {copy.move}</span>
          <span><kbd>⏎</kbd> {copy.select}</span>
          <span><kbd>esc</kbd> {copy.close}</span>
          <span className={styles.count}>{results.length} {copy.count}</span>
        </div>
      </div>
    </div>
  );
}

function localizeHref(href: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh' || !href.startsWith('/')) return href;
  return href === '/' ? '/en/' : `/en${href}`;
}
