// Map v2 - 章节卡片网格视图,占满宽度,详情用 Modal
// 不再用 React Flow 关系图作为默认(避免 dagre + 容器高度问题)
// 5 视图:网格(默认) / 列表 / 时间线 / 树状 / 径向
import React, {useMemo, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '../components/ui/dialog';
import {literatureData, type LiteratureItem} from '../data/literatureData';
import {treeData, type Chapter} from '../data/treeData';
import {Grid3x3, Table2, Calendar, Network, Sun, Search, FileText, CalendarDays, BookOpen, ExternalLink, ChevronDown, ChevronUp} from 'lucide-react';
import styles from './map.module.css';

const CN = {
  title: '研究图谱 / Research Map',
  hint: '压缩算法文献的多种可视化视图:默认是章节卡片网格,点击文献看详情;树状/径向看占比;时间线看年份;关系图看章节-文献关系。',
  search: '搜索文献 / 章节 / 作者',
  chapter: '章节',
  all: '全部',
  count: '篇',
  paper: '文献',
  chapterLabel: '章节',
  close: '关闭',
  view: {
    grid: '网格',
    table: '列表',
    timeline: '时间线',
    treemap: '树状',
    sunburst: '径向',
    graph: '关系',
  },
  empty: '没有匹配的文献',
  noAbstract: '暂无摘要',
  clickForDetail: '点击查看详情',
};

type ViewKey = 'grid' | 'table' | 'timeline' | 'treemap' | 'sunburst' | 'graph';

// 章节配色
const CHAPTER_COLORS = ['#1d4ed8','#b45309','#0d9488','#7c3aed','#dc2626','#0891b2','#65a30d','#c2410c'];

function getChapterColor(id: string): string {
  const idx = treeData.findIndex((c) => c.id === id);
  return CHAPTER_COLORS[idx % CHAPTER_COLORS.length];
}

function MapClient(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [search, setSearch] = useState('');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [view, setView] = useState<ViewKey>('grid');
  const [selected, setSelected] = useState<LiteratureItem | null>(null);

  // 初始 URL ?lit=xxx
  React.useEffect(() => {
    const lit = params.get('lit');
    if (lit) {
      const found = literatureData.find((l) => l.id === lit);
      if (found) setSelected(found);
    }
  }, []);

  const filtered = useMemo(() => {
    let arr = literatureData.slice();
    if (chapterFilter !== 'all') arr = arr.filter((l) => l.chapterId === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        (l.authors ?? '').toLowerCase().includes(q) ||
        (l.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (l.abstractZh ?? l.abstract ?? '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [chapterFilter, search]);

  // 章节分组
  const byChapter = useMemo(() => {
    const map: Record<string, LiteratureItem[]> = {};
    for (const c of treeData) map[c.id] = [];
    for (const l of filtered) {
      const cid = (l as any).chapterId ?? treeData[0].id;
      if (!map[cid]) map[cid] = [];
      map[cid].push(l);
    }
    return map;
  }, [filtered]);

  return (
    <>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.viewTabs}>
            {([
              {key: 'grid', label: CN.view.grid, Icon: Grid3x3},
              {key: 'table', label: CN.view.table, Icon: Table2},
              {key: 'timeline', label: CN.view.timeline, Icon: Calendar},
              {key: 'treemap', label: CN.view.treemap, Icon: Network},
              {key: 'sunburst', label: CN.view.sunburst, Icon: Sun},
            ] as const).map((v) => (
              <button key={v.key} type="button"
                className={`${styles.viewTab} ${view === v.key ? styles.viewTabOn : ''}`}
                onClick={() => setView(v.key)}>
                <v.Icon size={13} /> {v.label}
              </button>
            ))}
          </div>
          <Select value={chapterFilter} onValueChange={setChapterFilter}>
            <SelectTrigger className={styles.select}><SelectValue placeholder={CN.chapter} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{CN.all}({filtered.length})</SelectItem>
              {treeData.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.id} · {c.titleZh ?? c.title} ({(byChapter[c.id] ?? []).length})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={styles.searchBox}>
          <Search size={14} />
          <input
            type="text"
            placeholder={CN.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 视图区 */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>{CN.empty}</div>
      ) : view === 'grid' ? (
        <GridView byChapter={byChapter} onSelect={setSelected} />
      ) : view === 'table' ? (
        <TableView data={filtered} onSelect={setSelected} />
      ) : view === 'timeline' ? (
        <TimelineView data={filtered} onSelect={setSelected} />
      ) : view === 'treemap' ? (
        <TreemapView data={filtered} onSelect={setSelected} />
      ) : (
        <SunburstView data={filtered} onSelect={setSelected} />
      )}

      {/* 详情弹窗 */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent style={{maxWidth: 720}}>
          {selected ? <PaperDetailModal l={selected} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============= 网格视图(默认)=============
function GridView({byChapter, onSelect}: {byChapter: Record<string, LiteratureItem[]>; onSelect: (l: LiteratureItem) => void}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => new Set());

  const toggleChapter = (chapterId: string): void => {
    setExpandedChapters((current) => {
      const next = new Set(current);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  return (
    <div className={styles.chapterGrid}>
      {treeData.map((c) => {
        const items = byChapter[c.id] ?? [];
        if (items.length === 0) return null;
        const color = getChapterColor(c.id);
        const expanded = expandedChapters.has(c.id);
        const visibleItems = expanded ? items : items.slice(0, 6);
        return (
          <Card
            key={c.id}
            className={styles.chapterCard}
            data-expanded={expanded}
            style={{'--chapter-color': color} as React.CSSProperties}
          >
            <CardContent>
              <div className={styles.chapterHead}>
                <span className={styles.chapterId} style={{background: color}}>{c.id}</span>
                <h3 className={styles.chapterTitle}>{c.titleZh ?? c.title}</h3>
                <Badge variant="secondary">{items.length} 篇</Badge>
              </div>
              {c.summaryZh ? <p className={styles.chapterSummary}>{c.summaryZh}</p> : null}
              <div className={styles.paperList}>
                {visibleItems.map((l) => (
                  <button key={l.id} type="button" className={styles.paperRow} onClick={() => onSelect(l)}>
                    <span className={styles.paperYear}>{l.year ?? '-'}</span>
                    <span className={styles.paperTitle}>{l.title}</span>
                    <ExternalLink size={12} className={styles.paperArrow} />
                  </button>
                ))}
                {items.length > 6 ? (
                  <button
                    type="button"
                    className={styles.chapterExpand}
                    onClick={() => toggleChapter(c.id)}
                    aria-expanded={expanded}
                  >
                    {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {expanded ? '收起文献' : `展开其余 ${items.length - 6} 篇`}
                  </button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============= 列表视图 =============
function TableView({data, onSelect}: {data: LiteratureItem[]; onSelect: (l: LiteratureItem) => void}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{width: 60}}>年份</th>
            <th>标题</th>
            <th style={{width: 120}}>作者</th>
            <th style={{width: 100}}>章节</th>
            <th style={{width: 80}}>优先级</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l) => (
            <tr key={l.id} onClick={() => onSelect(l)}>
              <td className={styles.tdYear}>{l.year ?? '-'}</td>
              <td className={styles.tdTitle}>{l.title}</td>
              <td className={styles.tdAuthor}>{(l.authors ?? '').split(',')[0]}{(l.authors ?? '').includes(',') ? ' 等' : ''}</td>
              <td className={styles.tdChapter}><span className={styles.chip} style={{background: getChapterColor((l as any).chapterId ?? '')}}>{(l as any).chapterId}</span></td>
              <td className={styles.tdPri}>{l.priority ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============= 时间线视图 =============
function TimelineView({data, onSelect}: {data: LiteratureItem[]; onSelect: (l: LiteratureItem) => void}) {
  const sorted = useMemo(() => data.slice().sort((a, b) => (a.year ?? 0) - (b.year ?? 0)), [data]);
  const years = useMemo(() => {
    const ys = Array.from(new Set(sorted.map((l) => l.year ?? 0).filter((y) => y > 0))).sort();
    return ys;
  }, [sorted]);
  const minY = years[0] ?? 2000;
  const maxY = years[years.length - 1] ?? 2025;
  return (
    <div className={styles.timelineWrap}>
      <div className={styles.timelineAxis}>
        {years.map((y) => <div key={y} className={styles.timelineTick}>{y}</div>)}
      </div>
      <div className={styles.timelineRows}>
        {sorted.map((l) => {
          const off = ((l.year ?? minY) - minY) / Math.max(1, maxY - minY);
          return (
            <div key={l.id} className={styles.timelineRow} onClick={() => onSelect(l)}>
              <span className={styles.timelineYear}>{l.year ?? '-'}</span>
              <span className={styles.timelineTitle}>{l.title}</span>
              <span className={styles.timelineMeta}>{(l.authors ?? '').split(',')[0]}</span>
              <div className={styles.timelineBar} style={{left: `${off * 100}%`, background: getChapterColor((l as any).chapterId ?? '')}} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============= 树状视图(SVG 简化版)=============
function TreemapView({data, onSelect}: {data: LiteratureItem[]; onSelect: (l: LiteratureItem) => void}) {
  const layout = useMemo(() => {
    const total = data.length || 1;
    let cur = 0;
    return treeData.map((c) => {
      const items = data.filter((l) => (l as any).chapterId === c.id);
      const ratio = items.length / total;
      const w = ratio;
      const start = cur;
      cur += w;
      return {c, items, start, w};
    }).filter((x) => x.items.length > 0);
  }, [data]);

  return (
    <div className={styles.treemapWrap}>
      {layout.map(({c, items, start, w}) => {
        const color = getChapterColor(c.id);
        return (
          <button key={c.id} type="button"
            className={styles.treemapCell}
            style={{left: `${start * 100}%`, width: `${w * 100}%`, background: color}}
            onClick={() => items.length > 0 && onSelect(items[0])}>
            <div className={styles.tmHead}>{c.id}</div>
            <div className={styles.tmBody}>{c.titleZh ?? c.title}</div>
            <div className={styles.tmFoot}>{items.length} 篇</div>
          </button>
        );
      })}
    </div>
  );
}

// ============= 径向视图(SVG 简化)=============
function SunburstView({data, onSelect}: {data: LiteratureItem[]; onSelect: (l: LiteratureItem) => void}) {
  const total = data.length;
  const SIZE = 360;
  const R = 150;
  const segments = useMemo(() => {
    let cur = -Math.PI / 2;
    return treeData.map((c) => {
      const items = data.filter((l) => (l as any).chapterId === c.id);
      if (items.length === 0) return null;
      const angle = (items.length / total) * Math.PI * 2;
      const start = cur;
      const end = cur + angle;
      cur = end;
      return {c, items, start, end};
    }).filter(Boolean) as {c: Chapter; items: LiteratureItem[]; start: number; end: number}[];
  }, [data, total]);

  function arcPath(start: number, end: number, r0: number, r1: number) {
    const x0 = SIZE / 2 + r1 * Math.cos(start);
    const y0 = SIZE / 2 + r1 * Math.sin(start);
    const x1 = SIZE / 2 + r1 * Math.cos(end);
    const y1 = SIZE / 2 + r1 * Math.sin(end);
    const x2 = SIZE / 2 + r0 * Math.cos(end);
    const y2 = SIZE / 2 + r0 * Math.sin(end);
    const x3 = SIZE / 2 + r0 * Math.cos(start);
    const y3 = SIZE / 2 + r0 * Math.sin(start);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
  }

  return (
    <div className={styles.sunburstWrap}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.sunSvg}>
        {segments.map(({c, items, start, end}) => {
          const color = getChapterColor(c.id);
          const midA = (start + end) / 2;
          const lx = SIZE / 2 + (R + 18) * Math.cos(midA);
          const ly = SIZE / 2 + (R + 18) * Math.sin(midA);
          return (
            <g key={c.id}>
              <path d={arcPath(start, end, 50, R)} fill={color} stroke="#fff" strokeWidth={2}
                onClick={() => onSelect(items[0])} style={{cursor: 'pointer', opacity: 0.85}} />
              <text x={lx} y={ly} fontSize={11} fontWeight={600} fill={color} textAnchor="middle">
                {c.id} · {items.length}
              </text>
            </g>
          );
        })}
        <text x={SIZE / 2} y={SIZE / 2} fontSize={32} fontWeight={700} textAnchor="middle" fill="#0f172a">
          {total}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 22} fontSize={11} textAnchor="middle" fill="#64748b">篇文献</text>
      </svg>
    </div>
  );
}

// ============= 详情 Modal =============
function PaperDetailModal({l}: {l: LiteratureItem}) {
  const c = treeData.find((c) => c.id === (l as any).chapterId);
  return (
    <>
      <DialogHeader>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
          <span className={styles.chip} style={{background: getChapterColor((l as any).chapterId ?? '')}}>{(l as any).chapterId}</span>
          {c ? <span className={styles.detailChapter}>{c.titleZh ?? c.title}</span> : null}
        </div>
        <DialogTitle style={{fontSize: 18, lineHeight: 1.4}}>{l.title}</DialogTitle>
        <DialogDescription style={{fontSize: 13, color: '#64748b'}}>
          {l.authors ?? ''} · {l.year ?? ''} · {l.priority ?? ''}
        </DialogDescription>
      </DialogHeader>
      <div style={{padding: '0 0 12px', fontSize: 14, lineHeight: 1.7, color: '#1e293b'}}>
        {l.abstractZh ? <p style={{margin: '8px 0 12px'}}>{l.abstractZh}</p> : <p style={{margin: '8px 0 12px', color: '#94a3b8', fontStyle: 'italic'}}>{CN.noAbstract}</p>}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10}}>
          {(l.tags ?? []).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div>
        {l.doi ? (
          <div style={{marginTop: 14, fontSize: 12, color: '#64748b'}}>
            DOI: <a href={`https://doi.org/${l.doi}`} target="_blank" rel="noopener" style={{color: '#1d4ed8'}}>{l.doi}</a>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function MapPage(): React.ReactElement {
  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <BrowserOnly fallback={<div style={{padding: 40, textAlign: 'center', color: '#64748b'}}>载入中…</div>}>
          {() => <MapClient />}
        </BrowserOnly>
      </WorkbenchShell>
    </Layout>
  );
}
