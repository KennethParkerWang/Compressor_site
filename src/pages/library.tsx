// Library - 文献库主页面
import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useLocation} from '@docusaurus/router';
import Fuse from 'fuse.js';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Separator} from '../components/ui/separator';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '../components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {getLiteratureCoverImage, literatureData, type LiteratureItem} from '../data/literatureData';
import {readingPaths} from '../data/readingPaths';
import {useNotes} from '../stores/workbench';
import {BookOpen, ChevronRight, Code2, Database, Download, ExternalLink, Plus, Search, Sparkles, X, Calendar, Tag, FileText} from 'lucide-react';
import {bulkAddNotes, createReadTasks} from '../components/workbench/actions';
import {useWorkbenchStats} from '../components/workbench/stats';
import {EvidenceBadge, MetricTile, StatusPill} from '../components/research-console/ResearchConsole';
import CitationExportDialog from '../components/library/CitationExportDialog';
import LocalPaperShelf from '../components/library/LocalPaperShelf';
import PaperPdfControl from '../components/library/PaperPdfControl';
import ReadingStatusControl from '../components/library/ReadingStatusControl';
import {auditCitationRecords, classifyCitationItems} from '../utils/citations';
import styles from './library.module.css';

const CN = {
  addNote: '加笔记',
  addRead: '加入阅读',
  addTask: '加任务',
  addToPath: '加入路径',
  allChapters: '章节',
  cancel: '取消',
  chapters: '章节',
  clear: '清除',
  colAct: '操作',
  colAuthor: '作者',
  colDiff: '难度',
  colPri: '优先级',
  colTitle: '标题',
  colYear: '年份',
  coreReason: '核心原因',
  create: '创建',
  difficulty: '难度',
  empty: '暂无',
  external: '外部',
  filterUnread: '只看未读',
  hint: '统一管理压缩算法文献、标准、代码和数据集。按章节、资源类型、优先级筛选后,可以批量生成阅读任务或笔记。',
  inPath: '在路径中',
  laneNeedsExp: '需要实验',
  laneNeedsNote: '需要笔记',
  laneNeedsPdf: '需 PDF',
  laneNeedsReport: '需要报告',
  laneThisWeek: '本周',
  matchMode: '匹配模式',
  matchedLit: '已匹配文献',
  matchMatched: '已匹配',
  matchPending: '待匹配',
  more: '更多',
  of: '之',
  oneLine: '一句话',
  pickDue: '截止(可选)',
  pickLane: '选择车道',
  pickMinutes: '分钟数',
  pickPriority: '优先级',
  priority: '优先级',
  readerBenefit: '读者收益',
  readingList: '阅读视图',
  reason: '原因',
  refs: '相关',
  rows: '行',
  searchPh: '搜索关键词',
  selectAll: '全选',
  sortBy: '排序方式',
  sortChapter: '按章节',
  sortPriority: '按优先级',
  sortTitle: '按标题',
  sortYearAsc: '年份↑',
  sortYearDesc: '年份↓',
  statusNote: '笔记状态',
  statusRead: '阅读状态',
  tableMgmt: '批量管理',
  title: '文献库 / Library',
  usage1: '用法:阅读 / 笔记',
  usage2: '用途',
  usage3: '用法',
  usageTitle: '使用场景',
  whyRead: '为何读',
  add: '新增',
  noNote: '暂无笔记',
  noteDraft: '笔记草稿',
  noteWriting: '正在写笔记',
  noteDone: '笔记已完成',
  cite: '引用',
  exportCitations: '导出引用',
  tags: '标签',
  year: '年',
  pending: '待处理',
  allDif: '难度',
  allPri: '优先级',
  allYear: '年份',
  assetFilter: '资源类型',
  assetAll: '全部',
  assetBadge: '附加资源',
  assetPdf: '论文资料',
  assetCode: '代码与项目',
  assetDataset: '数据集 / 基准',
  assetStandard: '标准文档',
  assetOfficial: '官方页面',
  assetProject: '项目主页',
  assetOther: '其它',
  clickForDetail: '点卡片看详情',
  unpublishedOnly: '只看未发表',
  showUnpub: '含未发表',
  pubStatus: '发表状态',
  pubPublished: '已正式发表',
  pubUnpublished: '未发表(预印本)',
  unpubBadge: '未发表',
  unpubReason: '未发表原因',
};

const PRIORITY_COLORS: Record<string, string> = {
  '奠基': '#1d4ed8',
  '必读': '#b45309',
  '推荐': '#0d9488',
  '参考': '#64748b',
};

const TYPE_BADGE: Record<string, {label: string; emoji: string; color: string}> = {
  paper: { label: '论文', emoji: '📄', color: '#2563eb' },
  survey: { label: '综述', emoji: '📚', color: '#7c3aed' },
  thesis: { label: '论文', emoji: '🎓', color: '#0891b2' },
  book: { label: '专著', emoji: '📖', color: '#0891b2' },
  report: { label: '技术报告', emoji: '📋', color: '#0891b2' },
  preprint: { label: '预印本', emoji: '📝', color: '#2563eb' },
  documentation: { label: '文档', emoji: '📘', color: '#475569' },
  standard: { label: '标准', emoji: '📏', color: '#b91c1c' },
  software: { label: '软件', emoji: '🛠', color: '#059669' },
};
const DIFF_COLORS: Record<string, string> = {
  intro: '#10b981',
  intermediate: '#0ea5e9',
  advanced: '#dc2626',
  hard: '#b91c1c',
};
const NOTE_LABELS: Record<string, string> = {
  draft: CN.noteDraft,
  writing: CN.noteWriting,
  'in-review': CN.noteWriting,
  done: CN.noteDone,
  final: CN.noteDone,
};

interface RowVm extends LiteratureItem {
  chapterLabel: string;
  sectionLabel: string;
  noteStatus: 'draft' | 'writing' | 'done' | 'none';
}

function getNoteStatus(litId: string): 'draft' | 'writing' | 'done' | 'none' {
  const notes = useNotes.getState?.().notes ?? [];
  const note = notes.find((n) => n.litId === litId);
  if (!note) return 'none';
  return (note.status as any) ?? 'draft';
}

export default function LibraryPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focusLit = params.get('lit');
  const focusChapter = params.get('chapter');

  const stats = useWorkbenchStats();
  const notes = useNotes((s) => s.notes);
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [year, setYear] = useState<string>('all');
  const [assetKind, setAssetKind] = useState<string>('all');
  const [sort, setSort] = useState<'yearDesc' | 'yearAsc' | 'title' | 'priority' | 'chapter'>('yearDesc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<LiteratureItem | null>(null);
  const [bulkOpen, setBulkOpen] = useState<'task' | 'note' | 'path' | 'citation' | null>(null);
  const [citationScope, setCitationScope] = useState<'selected' | 'filtered'>('selected');
  const [bulkDoneAt, setBulkDoneAt] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [view, setView] = useState<'reading' | 'table'>('reading');
  const [pubFilter, setPubFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [citationFilter, setCitationFilter] = useState<'all' | 'citable' | 'nonpaper' | 'duplicate' | 'unpublished'>('all');

  const data: RowVm[] = useMemo(() => {
    return literatureData.map((l) => ({
      ...l,
      chapterLabel: l.chapterTitleZh ?? l.chapterTitleEn ?? l.chapterId,
      sectionLabel: l.sectionTitleZh ?? l.sectionTitleEn ?? l.sectionId,
      noteStatus: getNoteStatus(l.id),
    }));
  }, [notes]);

  const fuse = useMemo(
    () => new Fuse(data, {
      keys: ['title', 'authors', 'tags', 'summaryZh', 'venue', 'chapterLabel', 'sectionLabel'],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 1,
    }),
    [data],
  );

  const citationRecords = useMemo(() => classifyCitationItems(data, false), [data]);
  const citationAudit = useMemo(() => auditCitationRecords(citationRecords, true), [citationRecords]);
  const citationById = useMemo(() => {
    const map = new Map<string, (typeof citationRecords)[number]>();
    for (const record of citationRecords) map.set(record.item.id, record);
    return map;
  }, [citationRecords]);

  const filtered = useMemo(() => {
    let arr: RowVm[] = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : data;
    if (chapter !== 'all') arr = arr.filter((r) => r.chapterId === chapter);
    if (priority !== 'all') arr = arr.filter((r) => r.priority === priority);
    if (difficulty !== 'all') arr = arr.filter((r) => r.difficulty === difficulty);
    if (year !== 'all') arr = arr.filter((r) => r.year === year);
    if (pubFilter === 'unpublished') arr = arr.filter((r) => r.unpublished === true);
    else if (pubFilter === 'published') arr = arr.filter((r) => !r.unpublished);
    if (assetKind !== 'all') {
      arr = arr.filter((r) => {
        const isPaper = ['paper', 'thesis', 'book', 'survey', 'report', 'preprint', 'documentation'].includes(r.type ?? '');
        const isStandard = r.type === 'standard';
        const isSoftware = r.type === 'software' || (r.attachments ?? []).some((a) => a.kind === 'code' || a.kind === 'project');
        const isDataset = (r.attachments ?? []).some((a) => a.kind === 'dataset');
        const hasProject = (r.attachments ?? []).some((a) => a.kind === 'project');
        const isOfficialOnly = (r.type === 'documentation' || r.type === 'software') && !(r.attachments ?? []).some((a) => a.kind === 'code' || a.kind === 'project' || a.kind === 'pdf' || a.kind === 'standard');
        const k = assetKind;
        if (k === 'paper') return isPaper;
        if (k === 'standard') return isStandard;
        if (k === 'code') return isSoftware;
        if (k === 'dataset') return isDataset;
        if (k === 'official') return isOfficialOnly;
        if (k === 'project') return hasProject;
        return true;
      });
    }
    if (citationFilter !== 'all') {
      arr = arr.filter((r) => {
        const record = citationById.get(r.id);
        if (citationFilter === 'citable') return Boolean(record?.citable && !record.duplicateOf);
        if (citationFilter === 'nonpaper') return Boolean(record && !record.citable);
        if (citationFilter === 'duplicate') return Boolean(record?.duplicateOf);
        if (citationFilter === 'unpublished') return Boolean(r.unpublished);
        return true;
      });
    }
    arr = arr.slice().sort((a, b) => {
      switch (sort) {
        case 'yearAsc': return (a.year ?? '').localeCompare(b.year ?? '');
        case 'title': return (a.title ?? '').localeCompare(b.title ?? '');
        case 'priority': return (a.priority ?? '').localeCompare(b.priority ?? '');
        case 'chapter': return (a.chapterId ?? '').localeCompare(b.chapterId ?? '');
        default: return (b.year ?? '').localeCompare(a.year ?? '');
      }
    });
    return arr;
  }, [data, fuse, query, chapter, priority, difficulty, year, sort, assetKind, pubFilter, citationFilter, citationById]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const assetStats = useMemo(() => {
    const unpublished = data.filter((item) => item.unpublished).length;
    const code = data.filter((item) => (item.attachments ?? []).some((asset) => asset.kind === 'code' || asset.kind === 'project')).length;
    const dataset = data.filter((item) => (item.attachments ?? []).some((asset) => asset.kind === 'dataset')).length;
    const standard = data.filter((item) => item.type === 'standard' || (item.attachments ?? []).some((asset) => asset.kind === 'standard')).length;
    const paper = data.filter((item) => ['paper', 'survey', 'thesis', 'book', 'report', 'preprint'].includes(item.type ?? '')).length;
    return {unpublished, code, dataset, standard, paper};
  }, [data]);

  useEffect(() => {
    setVisibleCount(50);
  }, [query, chapter, priority, difficulty, year, sort]);

  useEffect(() => {
    if (!focusLit) return;
    const item = literatureData.find((l) => l.id === focusLit);
    if (item) setDetail(item);
  }, [focusLit]);

  useEffect(() => {
    if (!focusChapter) return;
    setChapter(focusChapter);
  }, [focusChapter]);

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function selectVisible() { setSelected(new Set(visible.map((v) => v.id))); }
  function clearSelect() { setSelected(new Set()); }
  function scrollMore() { setVisibleCount((c) => Math.min(c + 50, filtered.length)); }
  const chapterOpts = stats.litByChapter;

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <section className={styles.libraryBrief}>
          <div>
            <span className={styles.kicker}>Evidence Database</span>
            <h2>文献、标准、代码与数据集证据库</h2>
          </div>
          <div className={styles.libraryBriefActions}>
            <Button variant="outline" onClick={() => { setCitationScope('filtered'); setBulkOpen('citation'); }}>
              <Download size={14} /> 导出当前筛选
            </Button>
          </div>
        </section>

        <LocalPaperShelf />

        <section className={styles.libraryMetrics}>
          <MetricTile label="Records" value={stats.totalLit} hint="全库事实条目" icon={Database} tone="blue" />
          <MetricTile label="Papers" value={assetStats.paper} hint="论文/综述/书籍/报告" icon={BookOpen} tone="green" />
          <MetricTile label="Formal refs" value={citationAudit.exportable} hint="默认正式参考文献" icon={FileText} tone="cyan" />
          <MetricTile label="Excluded" value={citationAudit.excluded} hint="资源页/缺元数据/非正式" icon={Code2} tone="purple" />
          <MetricTile label="Preprint" value={citationAudit.unpublished} hint="需单独开关导出" icon={Sparkles} tone="amber" />
        </section>

        <section className={styles.citationAudit}>
          <div>
            <span>Citation Readiness</span>
            <strong>{citationAudit.exportable} 条正式参考文献可导出</strong>
            <p>默认排除 {citationAudit.excluded} 条资源页、缺元数据或非正式条目；识别 {citationAudit.duplicates} 条重复候选；预印本/未发表条目 {citationAudit.unpublished} 条，需在导出弹窗中单独启用。</p>
          </div>
          <div className={styles.auditActions}>
            <Button onClick={() => { setCitationScope('filtered'); setBulkOpen('citation'); }}>
              <Download size={14} /> 导出引用库
            </Button>
            <Button variant="outline" onClick={() => { setCitationFilter('citable'); setAssetKind('paper'); }}>
              查看可引用
            </Button>
          </div>
        </section>

        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="reading">{CN.readingList}</TabsTrigger>
            <TabsTrigger value="table">{CN.tableMgmt}</TabsTrigger>
                      </TabsList>

          <div className={styles.filterBar}>
            <div className={styles.filterMeta}>
              <StatusPill tone="blue">当前 {filtered.length} 条</StatusPill>
              <EvidenceBadge type="curated">人工整理</EvidenceBadge>
              <EvidenceBadge type="code">资源链接可追踪</EvidenceBadge>
            </div>
            <div className={styles.searchWrap}>
              <Search size={14} />
              <Input
                placeholder={CN.searchPh}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
              {query ? (
                <button type="button" onClick={() => setQuery('')} className={styles.clearBtn}>
                  <X size={12} />
                </button>
              ) : null}
            </div>

            <div className={styles.assetTabs} title={CN.assetFilter}>
              {([
                {k: 'all', label: CN.assetAll, emoji: ''},
                {k: 'paper', label: CN.assetPdf, emoji: ''},
                {k: 'standard', label: CN.assetStandard, emoji: ''},
                {k: 'code', label: CN.assetCode, emoji: ''},
                {k: 'dataset', label: CN.assetDataset, emoji: ''},
                {k: 'project', label: CN.assetProject, emoji: ''},
                {k: 'official', label: CN.assetOfficial, emoji: ''},
              ] as const).map((t) => (
                <button key={t.k} type="button"
                  className={`${styles.assetTab} ${assetKind === t.k ? styles.assetTabOn : ''}`}
                  onClick={() => setAssetKind(t.k)}>
                  <span className={styles.assetTabEmoji}>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.citationTabs} title="引用状态">
              {([
                {k: 'all', label: '全部'},
                {k: 'citable', label: `可引用 ${citationAudit.exportable}`},
                {k: 'nonpaper', label: `非文献 ${citationAudit.excluded}`},
                {k: 'duplicate', label: `重复 ${citationAudit.duplicates}`},
                {k: 'unpublished', label: `预印本 ${citationAudit.unpublished}`},
              ] as const).map((item) => (
                <button key={item.k} type="button" className={citationFilter === item.k ? styles.citationTabOn : styles.citationTab} onClick={() => setCitationFilter(item.k)}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className={styles.filterRow}>
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className={styles.select}><SelectValue placeholder={CN.chapters} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{CN.allChapters} ({stats.totalLit})</SelectItem>
                  {chapterOpts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.id} · {c.label} ({c.count})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className={styles.select}><SelectValue placeholder={CN.sortBy} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearDesc">{CN.sortYearDesc}</SelectItem>
                  <SelectItem value="yearAsc">{CN.sortYearAsc}</SelectItem>
                  <SelectItem value="title">{CN.sortTitle}</SelectItem>
                  <SelectItem value="priority">{CN.sortPriority}</SelectItem>
                  <SelectItem value="chapter">{CN.sortChapter}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className={styles.select}><SelectValue placeholder={CN.difficulty} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有难度</SelectItem>
                  <SelectItem value="intro">intro · 入门</SelectItem>
                  <SelectItem value="intermediate">intermediate · 中级</SelectItem>
                  <SelectItem value="advanced">advanced · 进阶</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className={styles.select}><SelectValue placeholder={CN.priority} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有优先级</SelectItem>
                  <SelectItem value="奠基">奠基</SelectItem>
                  <SelectItem value="必读">必读</SelectItem>
                  <SelectItem value="推荐">推荐</SelectItem>
                  <SelectItem value="参考">参考</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pubFilter} onValueChange={(v) => setPubFilter(v as any)}>
                <SelectTrigger className={styles.select}><SelectValue placeholder={CN.pubStatus} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{CN.assetAll}</SelectItem>
                  <SelectItem value="published">{CN.pubPublished}</SelectItem>
                  <SelectItem value="unpublished">{CN.pubUnpublished}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="reading">
            <div className={styles.readingGrid}>
              {visible.slice(0, 30).map((l) => (
                <PaperCard key={l.id} l={l} onOpen={() => setDetail(l)} />
              ))}
            </div>
            {visible.length === 0 ? <div className={styles.empty}>{CN.empty}</div> : null}
          </TabsContent>

          <TabsContent value="table">
            <div className={styles.toolbar}>
              <span className={styles.count}>
                显示 <strong>{visible.length}</strong> / {filtered.length} {CN.rows}
              </span>
              <div className={styles.toolbarActions}>
                <Button variant="ghost" size="sm" onClick={selectVisible}>{CN.selectAll}</Button>
                <Button variant="ghost" size="sm" onClick={clearSelect}>{CN.clear}</Button>
                <Separator orientation="vertical" className={styles.divider} />
                <Button size="sm" disabled={selected.size === 0} onClick={() => setBulkOpen('task')}>
                  <Plus size={14} /> {CN.addTask} {selected.size > 0 ? `(${selected.size})` : ''}
                </Button>
                <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={() => setBulkOpen('note')}>
                  <Plus size={14} /> {CN.addNote}
                </Button>
                <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={() => setBulkOpen('path')}>
                  <Plus size={14} /> {CN.addToPath}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setCitationScope(selected.size > 0 ? 'selected' : 'filtered'); setBulkOpen('citation'); }}>
                  <Download size={14} /> {CN.exportCitations}{selected.size > 0 ? ` (${selected.size})` : ''}
                </Button>
              </div>
            </div>

            {bulkDoneAt ? (
              <div className={styles.toast}>已创建 {bulkDoneAt} 条记录,可到 <Link to="/tasks">Tasks</Link> / <Link to="/notes">Notes</Link> 查看。</div>
            ) : null}

            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <div className={styles.cCheck}>
                  <Checkbox
                    checked={visible.length > 0 && visible.every((v) => selected.has(v.id))}
                    onCheckedChange={(c) => { if (c) selectVisible(); else clearSelect(); }}
                  />
                </div>
                <div className={styles.cTitle}>{CN.colTitle}</div>
                <div className={styles.cAuthor}>{CN.colAuthor}</div>
                <div className={styles.cYear}>{CN.colYear}</div>
                <div className={styles.cPri}>{CN.colPri}</div>
                <div className={styles.cDiff}>{CN.colDiff}</div>
                <div className={styles.cStatus}>{CN.statusRead}</div>
                <div className={styles.cStatus}>{CN.statusNote}</div>
              </div>

              {visible.length === 0 ? (
                <div className={styles.empty}>{CN.empty}</div>
              ) : (
                visible.map((l) => {
                  const isSel = selected.has(l.id);
                  return (
                    <div key={l.id} className={`${styles.row} ${isSel ? styles.rowSelected : ''}`}>
                      <div className={styles.cCheck}>
                        <Checkbox checked={isSel} onCheckedChange={() => toggleSelect(l.id)} />
                      </div>
                      <div className={styles.cTitle}>
                        <button type="button" onClick={() => setDetail(l)} className={styles.titleBtn}>
                          <span className={styles.titleMain}>{l.title}</span>
                          <span className={styles.chapterHint}>{l.chapterId} · {l.chapterLabel} / {l.sectionLabel}</span>
                        </button>
                      </div>
                      <div className={styles.cAuthor}>{l.authors ?? '-'}</div>
                      <div className={styles.cYear}>{l.year ?? '-'}</div>
                      <div className={styles.cPri}>
                        {l.priority ? (
                          <span className={styles.priDot} style={{background: PRIORITY_COLORS[l.priority] ?? '#64748b'}}>{l.priority}</span>
                        ) : '-'}
                      </div>
                      <div className={styles.cDiff}>
                        {l.difficulty ? (
                          <span className={styles.diffDot} style={{background: DIFF_COLORS[l.difficulty] ?? '#64748b'}}>{l.difficulty}</span>
                        ) : '-'}
                      </div>
                      <div className={styles.cStatus}>
                        {l.recommendedAction ? <Badge variant="outline">{l.recommendedAction}</Badge> : '-'}
                      </div>
                      <div className={styles.cStatus}>
                        {l.noteStatus === 'none' ? <span style={{color: '#94a3b8'}}>未建笔记</span> :
                          <Badge variant={l.noteStatus === 'done' ? 'default' : 'outline'}>{NOTE_LABELS[l.noteStatus] ?? l.noteStatus}</Badge>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {visibleCount < filtered.length ? (
              <div className={styles.moreWrap}>
                <Button variant="outline" onClick={scrollMore}>{CN.more} ({filtered.length - visibleCount})</Button>
              </div>
            ) : null}
          </TabsContent>

                  </Tabs>

        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent style={{maxWidth: 720, width: '90vw', maxHeight: '90vh', overflowY: 'auto'}}>
            {detail ? <LitDetail lit={detail} onCitation={() => { setCitationScope('selected'); setSelected(new Set([detail.id])); setBulkOpen('citation'); }} /> : <DetailEmpty />}
          </DialogContent>
        </Dialog>

        <BulkTaskDialog open={bulkOpen === 'task'} onOpenChange={(o) => setBulkOpen(o ? 'task' : null)} ids={Array.from(selected)} onDone={(n) => { setBulkOpen(null); setBulkDoneAt(n); clearSelect(); }} />
        <BulkNoteDialog open={bulkOpen === 'note'} onOpenChange={(o) => setBulkOpen(o ? 'note' : null)} ids={Array.from(selected)} onDone={(n) => { setBulkOpen(null); setBulkDoneAt(n); clearSelect(); }} />
        <BulkPathDialog open={bulkOpen === 'path'} onOpenChange={(o) => setBulkOpen(o ? 'path' : null)} ids={Array.from(selected)} onDone={(n) => { setBulkOpen(null); setBulkDoneAt(n); clearSelect(); }} />
        <CitationExportDialog
          open={bulkOpen === 'citation'}
          onOpenChange={(o) => setBulkOpen(o ? 'citation' : null)}
          title={citationScope === 'selected' && selected.size > 0 ? `导出选中文献 · ${selected.size} 条` : `导出当前筛选 · ${filtered.length} 条`}
          items={citationScope === 'selected' && selected.size > 0 ? data.filter((item) => selected.has(item.id)) : filtered}
        />
      </WorkbenchShell>
    </Layout>
  );
}

function getAttachmentCounts(l: RowVm): { total: number; kinds: Record<string, number> } {
  const kinds: Record<string, number> = {};
  for (const a of l.attachments ?? []) {
    kinds[a.kind] = (kinds[a.kind] || 0) + 1;
  }
  return { total: (l.attachments ?? []).length, kinds };
}

function getLiteratureHost(url?: string): string {
  if (!url) return 'local record';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'external source';
  }
}

function PaperCard({l, onOpen}: {l: RowVm; onOpen: () => void}) {
  const noteLabel = l.noteStatus === 'none' ? CN.noNote : (NOTE_LABELS[l.noteStatus] ?? l.noteStatus);
  const [coverFailed, setCoverFailed] = useState(false);
  const coverImage = getLiteratureCoverImage(l);
  const coverSrc = useBaseUrl(coverImage ?? '');
  const sourceHost = getLiteratureHost(l.url);
  const typeLabel = TYPE_BADGE[l.type ?? '']?.label ?? l.type ?? '文献';
  const hasCover = Boolean(coverImage) && !coverFailed;
  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest('button, a, [role="button"]')) return;
    onOpen();
  };
  const handleCardKey = (e: React.KeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest('button, a, [role="button"]')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
  };
  return (
    <article className={styles.paperCard} onClick={handleCardClick} role="button" tabIndex={0}
      onKeyDown={handleCardKey}>
      <div className={`${styles.paperCover} ${hasCover ? '' : styles.paperCoverFallback}`}>
        {hasCover ? (
          <img
            src={coverSrc}
            alt={l.coverAlt ?? `${l.title} source preview`}
            loading="lazy"
            onError={() => setCoverFailed(true)}
          />
        ) : null}
        <div className={styles.paperCoverOverlay}>
          <span>{typeLabel}</span>
          <strong>{sourceHost}</strong>
        </div>
        {!hasCover ? (
          <div className={styles.paperCoverFallbackBody}>
            <span>{l.id}</span>
            <strong>{l.year ?? l.chapterId}</strong>
            <em>{l.venue ?? sourceHost}</em>
          </div>
        ) : null}
      </div>

      <div className={styles.paperCardBody}>
      <header className={styles.paperCardHeader}>
        <div className={styles.paperIdGroup}>
          <span className={styles.paperId}>{l.id}</span>
          {TYPE_BADGE[l.type ?? ''] ? (
            <span className={styles.typePill} style={{background: TYPE_BADGE[l.type ?? ''].color}} title={TYPE_BADGE[l.type ?? ''].label}>
              <span className={styles.typePillEmoji}>{TYPE_BADGE[l.type ?? ''].emoji}</span>
              {TYPE_BADGE[l.type ?? ''].label}
            </span>
          ) : null}
          {l.priority ? (
            <span className={styles.priPill} style={{background: PRIORITY_COLORS[l.priority] ?? '#64748b'}}>{l.priority}</span>
          ) : null}
          {l.unpublished ? (
            <span className={styles.unpubPill} title={l.unpublishedReason ?? CN.unpubBadge}>
              ⚠ {CN.unpubBadge}
            </span>
          ) : null}
        </div>
        <div className={styles.paperCardMeta}>
          {l.year ? <span className={styles.paperYear}><Calendar size={10} /> {l.year}</span> : null}
        </div>
      </header>

      <h3 className={styles.paperCardTitle} onClick={onOpen}>{l.title}</h3>

      <div className={styles.paperCardAuthors}>
        <FileText size={11} />
        <span>{l.authors ?? '-'}</span>
      </div>

      <div className={styles.paperCardVenue}>
        <span className={styles.paperChapter}>{l.chapterId}</span>
        <span className={styles.paperChapterLabel}>{l.chapterLabel}</span>
        {l.venue ? <span className={styles.paperVenue}>· {l.venue}</span> : null}
      </div>

      {l.summaryZh ? <p className={styles.paperAbstract}>{l.summaryZh}</p> : null}

      {l.coreReason ? (
        <div className={styles.paperCore}>
          <Sparkles size={11} />
          <span>{l.coreReason}</span>
        </div>
      ) : null}

      {l.tags && l.tags.length > 0 ? (
        <div className={styles.paperCardTags}>
          {l.tags.slice(0, 4).map((t) => (
            <span key={t} className={styles.paperTag}><Tag size={9} />{t}</span>
          ))}
        </div>
      ) : null}

      {(() => {
        const ac = getAttachmentCounts(l);
        if (ac.total === 0) return null;
        const ORDER = ['pdf', 'code', 'dataset', 'standard', 'project', 'official', 'video', 'slides', 'other'];
        const EMOJI: Record<string, string> = { pdf: '📄', code: '🛠', dataset: '📊', standard: '📏', project: '🏠', official: '🔗', video: '🎬', slides: '🎞️', other: '🔖' };
        return (
          <div className={styles.paperCardAssets} title={CN.assetBadge}>
            <span className={styles.assetBadgeCount}>📎 {ac.total}</span>
            {ORDER.filter((k) => ac.kinds[k]).map((k) => (
              <span key={k} className={styles.assetBadge} data-kind={k}>
                <span>{EMOJI[k]}</span>
                <span>{ac.kinds[k]}</span>
              </span>
            ))}
          </div>
        );
      })()}

      <footer className={styles.paperCardFooter}>
        <div className={styles.paperCardFooterLeft}>
          {l.difficulty ? (
            <span className={styles.diffDot} style={{background: DIFF_COLORS[l.difficulty] ?? '#64748b'}}>{l.difficulty}</span>
          ) : null}
          <span className={styles.noteBadge} data-state={l.noteStatus}>{noteLabel}</span>
          <ReadingStatusControl literatureId={l.id} />
          </div>
        <div className={styles.paperFooterActions}>
          <PaperPdfControl paperId={l.id} paperTitle={l.title} />
          <Link to={`/paper-reading?lit=${l.id}`} className={styles.paperReadLink} onClick={(e) => e.stopPropagation()}>
            <BookOpen size={12} /> 精读
          </Link>
          <button type="button" onClick={onOpen} className={styles.paperOpenBtn}>
          展开 →
        </button>
        </div>
      </footer>
      </div>
    </article>
  );
}

function DetailEmpty() {
  return (
    <div style={{padding: 24, color: '#64748b', fontSize: 13, textAlign: 'center'}}>
      <p style={{margin: '12px 0'}}>选择一篇文献后将展示完整详情。</p>
      <ul style={{textAlign: 'left', lineHeight: 1.8, paddingLeft: 16, fontSize: 12}}>
        <li>查看作者、年份、章节和推荐动作</li>
        <li>检查附加资源、代码、数据集和标准链接</li>
        <li>加入阅读任务或生成笔记草稿</li>
        <li>后续可补充 BibTeX 与引用导出</li>
      </ul>
    </div>
  );
}

function LitDetail({lit, onCitation}: {lit: LiteratureItem; onCitation?: () => void}) {
  const paths = (lit.readingPathIds ?? []).map((id) => readingPaths.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className={styles.detail}>
      <DialogHeader>
        <span className={styles.detailChapter}>{lit.chapterId} · {lit.chapterTitleZh ?? lit.chapterTitleEn}</span>
        <DialogTitle className={styles.detailTitle}>{lit.title}</DialogTitle>
        <p style={{fontSize: 12.5, color: '#64748b', margin: '4px 0 0'}}>
          {lit.authors ?? '-'} · {lit.year ?? '-'} · {lit.venue ?? '-'}
        </p>
        {lit.unpublished ? (
          <div style={{marginTop: 8, padding: '6px 10px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 6, fontSize: 12, color: '#92400e'}}>
            ⚠ <strong>{CN.unpubBadge}</strong>
            {lit.unpublishedReason ? <span style={{marginLeft: 6, color: '#78350f'}}>· {lit.unpublishedReason}</span> : null}
          </div>
        ) : null}
      </DialogHeader>

      <div className={styles.detailSection}>
        {lit.priority ? (
          <span className={styles.priDot} style={{background: PRIORITY_COLORS[lit.priority] ?? '#64748b'}}>{lit.priority}</span>
        ) : null}
        {lit.difficulty ? (
          <span className={styles.diffDot} style={{background: DIFF_COLORS[lit.difficulty] ?? '#64748b'}}>{lit.difficulty}</span>
        ) : null}
        {lit.recommendedAction ? <Badge variant="outline">{lit.recommendedAction}</Badge> : null}
      </div>

      {lit.summaryZh ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.oneLine}</h4>
          <p className={styles.detailP}><Sparkles size={11} /> {lit.summaryZh}</p>
        </section>
      ) : null}

      {lit.coreReason ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.whyRead}</h4>
          <p className={styles.detailP}>{lit.coreReason}</p>
        </section>
      ) : null}

      {lit.readerBenefit ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.readerBenefit}</h4>
          <p className={styles.detailP}>{lit.readerBenefit}</p>
        </section>
      ) : null}

      {(lit.attachments ?? []).length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>📎 {CN.assetBadge} ({lit.attachments.length})</h4>
          <div className={styles.assetList}>
            {lit.attachments.map((a, i) => {
              const EMOJI: Record<string, string> = { pdf: '📄', code: '🛠', dataset: '📊', standard: '📏', project: '🏠', official: '🔗', video: '🎬', slides: '🎞️', other: '🔖' };
              const KIND_BG: Record<string, string> = {
                pdf: '#fef3c7', code: '#dbeafe', dataset: '#dcfce7', standard: '#ede9fe',
                project: '#cffafe', official: '#f1f5f9', video: '#fee2e2', other: '#f1f5f9',
              };
              return (
                <a key={i} href={a.url} target="_blank" rel="noreferrer" className={styles.assetItem}>
                  <span className={styles.assetItemEmoji}>{EMOJI[a.kind] ?? '🔖'}</span>
                  <div className={styles.assetItemBody}>
                    <div className={styles.assetItemLabel}>{a.label ?? a.kind}</div>
                    <div className={styles.assetItemUrl}>{a.url.replace(/^https?:\/\//, '').slice(0, 60)}{a.url.length > 60 ? '…' : ''}</div>
                  </div>
                  <ExternalLink size={12} className={styles.assetItemArrow} />
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {lit.tags && lit.tags.length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.tags}</h4>
          <div className={styles.tagsRow}>
            {lit.tags.map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </section>
      ) : null}

      {paths.length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.refs}</h4>
          <ul className={styles.pathList}>
            {paths.map((p: any) => (
              <li key={p.id}>
                <Link to={`/reading-paths?path=${p.id}`} className={styles.pathLink}>
                  <ChevronRight size={12} /> {p.nameZh ?? p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.detailActions}>
        {lit.url ? (
          <a href={lit.url} target="_blank" rel="noreferrer" className={styles.outBtn}>
            <ExternalLink size={14} /> {CN.external}
          </a>
        ) : null}
        <Button onClick={() => {
          createReadTasks([lit.id], {lane: 'needs-note', dueIn: 7, minutes: 120, priority: 'normal'});
        }}>
          <Plus size={14} /> {CN.addRead}
        </Button>
        <Button variant="outline" onClick={() => bulkAddNotes([lit.id])}>
          <Plus size={14} /> {CN.addNote}
        </Button>
        <Link to={`/paper-reading?lit=${lit.id}`} className={styles.outBtn}>
          <BookOpen size={14} /> 论文精读
        </Link>
        <Button variant="outline" onClick={onCitation}>
          <Download size={14} /> {CN.exportCitations}
        </Button>
      </div>
    </div>
  );
}

function BulkTaskDialog({open, onOpenChange, ids, onDone}: {open: boolean; onOpenChange: (o: boolean) => void; ids: string[]; onDone: (n: number) => void}) {
  const [lane, setLane] = useState<'this-week' | 'needs-note' | 'needs-pdf' | 'needs-experiment' | 'needs-report'>('this-week');
  const [dueIn, setDueIn] = useState(7);
  const [minutes, setMinutes] = useState(120);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const submit = () => { const n = createReadTasks(ids, {lane, dueIn, minutes, priority}).length; onDone(n); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{CN.addTask} · {ids.length} 篇</DialogTitle></DialogHeader>
        <div className={styles.formGrid}>
          <label>{CN.pickLane}
            <Select value={lane} onValueChange={(v) => setLane(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">{CN.laneThisWeek}</SelectItem>
                <SelectItem value="needs-note">{CN.laneNeedsNote}</SelectItem>
                <SelectItem value="needs-pdf">{CN.laneNeedsPdf}</SelectItem>
                <SelectItem value="needs-experiment">{CN.laneNeedsExp}</SelectItem>
                <SelectItem value="needs-report">{CN.laneNeedsReport}</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label>{CN.pickDue}<Input type="number" value={dueIn} onChange={(e) => setDueIn(Number(e.target.value) || 0)} /></label>
          <label>{CN.pickMinutes}<Input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 0)} /></label>
          <label>{CN.pickPriority}
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">low</SelectItem>
                <SelectItem value="normal">normal</SelectItem>
                <SelectItem value="high">high</SelectItem>
                <SelectItem value="urgent">urgent</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{CN.cancel}</Button>
          <Button onClick={submit}>{CN.create}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkNoteDialog({open, onOpenChange, ids, onDone}: {open: boolean; onOpenChange: (o: boolean) => void; ids: string[]; onDone: (n: number) => void}) {
  const submit = () => { const n = bulkAddNotes(ids).length; onDone(n); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{CN.addNote} · {ids.length} 篇</DialogTitle></DialogHeader>
        <p className={styles.dialogP}>为选中的 {ids.length} 篇文献生成笔记草稿,之后可到 Notes 继续编辑。</p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{CN.cancel}</Button>
          <Button onClick={submit}>{CN.create}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkPathDialog({open, onOpenChange, ids, onDone}: {open: boolean; onOpenChange: (o: boolean) => void; ids: string[]; onDone: (n: number) => void}) {
  const [pathId, setPathId] = useState(readingPaths[0]?.id ?? '');
  const submit = () => { onDone(ids.length); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{CN.addToPath} · {ids.length} 篇</DialogTitle></DialogHeader>
        <label className={styles.formLabel}>选择阅读路线
          <Select value={pathId} onValueChange={setPathId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {readingPaths.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nameZh ?? p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{CN.cancel}</Button>
          <Button onClick={submit}>{CN.create}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Checkbox({checked, onCheckedChange}: {checked: boolean; onCheckedChange: (v: boolean) => void}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      style={{width: 16, height: 16, cursor: 'pointer'}}
    />
  );
}
