import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Columns3,
  ExternalLink,
  FileText,
  FlaskConical,
  Highlighter,
  Image as ImageIcon,
  Lightbulb,
  Link2,
  ListChecks,
  MessageSquareText,
  Network,
  NotebookPen,
  Quote,
  Save,
  Search,
  Tags,
} from 'lucide-react';
import type {Session} from '@supabase/supabase-js';
import type {LiteratureItem} from '../../data/literatureData';
import {getLiteratureCoverImage} from '../../data/literatureData';
import type {UserReadingState} from '../../data/userReadingState';
import {upsertUserReadingState} from '../../lib/accountDataApi';
import {getAdminFilePublicUrl} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import PaperPdfControl from '../library/PaperPdfControl';
import PublicAssetPanel from '../public-assets/PublicAssetPanel';
import SiteAccountMenu from '../auth/SiteAccountMenu';
import styles from './paperReaderWorkspace.module.css';

type ReaderMode = 'cover' | 'pdf' | 'analysis' | 'split' | 'figures' | 'notes';
type ExperimentTab = 'paper' | 'reproduction' | 'comparison';
type ClipKind = 'note' | 'term' | 'task' | 'question' | 'citation';

interface ReaderTerm {
  name: string;
  group: string;
  description: string;
  sectionId: string;
}

interface AnalysisSection {
  id: string;
  title: string;
  body: string;
  terms: string[];
}

interface ExperimentDraft {
  dataset: string;
  metric: string;
  value: string;
  blockSize: string;
  environment: string;
  note: string;
}

interface ReaderClip {
  id: string;
  kind: ClipKind;
  text: string;
  sectionId: string;
  createdAt: string;
}

interface PaperWorkspaceData extends Record<string, unknown> {
  readerMode?: ReaderMode;
  activeSection?: string;
  sixNotes?: Record<string, string>;
  paperExperiment?: ExperimentDraft;
  reproductionExperiment?: ExperimentDraft;
  bookmarks?: string[];
  clippings?: ReaderClip[];
}

const EMPTY_EXPERIMENT: ExperimentDraft = {
  dataset: '', metric: 'compressionRatio', value: '', blockSize: '', environment: '', note: '',
};
const EMPTY_NOTES: Record<string, string> = {};

const NOTE_FIELDS = [
  ['problem', '01 · 研究问题', '这篇论文试图解决什么问题？'],
  ['baseline', '02 · 原有方法', '论文比较或改进了哪些方法？'],
  ['method', '03 · 核心方法', '方法的关键步骤和创新点是什么？'],
  ['evidence', '04 · 实验证据', '哪些结果支持论文结论？'],
  ['limitations', '05 · 局限边界', '方法在哪些条件下可能失效？'],
  ['project', '06 · 项目价值', '它能怎样帮助当前无损压缩项目？'],
] as const;

const TERM_BANK: ReaderTerm[] = [
  {name: 'Entropy', group: '信息论', description: '描述信息源不确定性，也是无损压缩理论下界的依据。', sectionId: 'background'},
  {name: 'Probability Model', group: '建模', description: '估计符号或特征出现概率，直接影响最终码长。', sectionId: 'method'},
  {name: 'Arithmetic Coding', group: '熵编码', description: '将概率分布转换为接近理论极限的可逆码流。', sectionId: 'formula'},
  {name: 'Range Coding', group: '熵编码', description: '算术编码的整数区间工程实现。', sectionId: 'formula'},
  {name: 'ANS', group: '熵编码', description: '兼顾接近算术编码的压缩率与高吞吐解码。', sectionId: 'method'},
  {name: 'Huffman Coding', group: '熵编码', description: '经典前缀码构造方法，适合快速稳定解码。', sectionId: 'method'},
  {name: 'LZ77', group: '字典匹配', description: '引用历史窗口中的重复片段减少冗余。', sectionId: 'pipeline'},
  {name: 'BWT', group: '预处理', description: '可逆重排相似上下文，便于后续建模和编码。', sectionId: 'pipeline'},
  {name: 'Context Mixing', group: '上下文建模', description: '融合多个上下文模型形成最终预测。', sectionId: 'method'},
  {name: 'PPM', group: '上下文建模', description: '用不同阶历史上下文预测下一符号。', sectionId: 'method'},
  {name: 'Rate-Distortion', group: '评价指标', description: '描述码率与重建误差之间的权衡。', sectionId: 'experiments'},
  {name: 'BPB', group: '评价指标', description: 'Bits Per Byte，每个原始字节对应的压缩比特数。', sectionId: 'results'},
];

export default function PaperReaderWorkspace({paper, lang}: {paper: LiteratureItem; lang: 'zh' | 'en'}): React.ReactElement {
  return (
    <BrowserOnly fallback={<div className={styles.loading}>正在打开论文工作台…</div>}>
      {() => <PaperReaderWorkspaceClient paper={paper} lang={lang} />}
    </BrowserOnly>
  );
}

function PaperReaderWorkspaceClient({paper, lang}: {paper: LiteratureItem; lang: 'zh' | 'en'}): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const coverPath = getLiteratureCoverImage(paper) ?? '';
  const resolvedCoverUrl = useBaseUrl(coverPath || '__missing-cover__');
  const coverUrl = coverPath ? resolvedCoverUrl : '';
  const [session, setSession] = React.useState<Session | null>(null);
  const [mode, setMode] = React.useState<ReaderMode>('cover');
  const [activeSection, setActiveSection] = React.useState('background');
  const [experimentTab, setExperimentTab] = React.useState<ExperimentTab>('paper');
  const [termQuery, setTermQuery] = React.useState('');
  const [workspace, setWorkspace] = React.useState<PaperWorkspaceData>({});
  const workspaceRef = React.useRef<PaperWorkspaceData>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [selectedText, setSelectedText] = React.useState('');
  const [selectionPosition, setSelectionPosition] = React.useState({left: 0, top: 0});
  const sections = React.useMemo(() => buildAnalysisSections(paper), [paper]);
  const terms = React.useMemo(() => getRelatedTerms(paper), [paper]);
  const filteredTerms = terms.filter((term) => `${term.name} ${term.group} ${term.description}`.toLowerCase().includes(termQuery.trim().toLowerCase()));
  const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];
  const paperExperiment = workspace.paperExperiment ?? EMPTY_EXPERIMENT;
  const reproductionExperiment = workspace.reproductionExperiment ?? EMPTY_EXPERIMENT;
  const bookmarks = workspace.bookmarks ?? [];
  const clippings = workspace.clippings ?? [];

  React.useEffect(() => { workspaceRef.current = workspace; }, [workspace]);

  React.useEffect(() => {
    let active = true;
    const resolve = async (nextSession: Session | null): Promise<void> => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setWorkspace({});
        setMode('cover');
        setActiveSection('background');
        setLoading(false);
        return;
      }
      setLoading(true);
      const {data, error} = await client.from('user_reading_state').select('*')
        .eq('user_id', nextSession.user.id).eq('literature_id', paper.id).maybeSingle();
      if (!active) return;
      if (error) setMessage(safeSupabaseError(error, config));
      const loaded = (data?.data ?? {}) as PaperWorkspaceData;
      setWorkspace(loaded);
      setMode(loaded.readerMode ?? 'cover');
      setActiveSection(loaded.activeSection ?? 'background');
      setLoading(false);
    };
    void client.auth.getSession().then(({data, error}) => {
      if (error && active) { setMessage(safeSupabaseError(error, config)); setLoading(false); return; }
      void resolve(data.session);
    });
    const {data: listener} = client.auth.onAuthStateChange((_event, nextSession) => { void resolve(nextSession); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [client, config, paper.id]);

  const persist = React.useCallback(async (patch: Partial<PaperWorkspaceData>, successText?: string): Promise<boolean> => {
    const next = {...workspaceRef.current, ...patch};
    workspaceRef.current = next;
    setWorkspace(next);
    if (!session) {
      setMessage('登录后才能保存个人笔记、实验结果和阅读位置。');
      return false;
    }
    setSaving(true);
    try {
      const state: UserReadingState = {
        literatureId: paper.id,
        status: 'reading',
        progress: readingProgress(next.readerMode ?? mode),
        lastReadAt: new Date().toISOString(),
        data: next,
      };
      await upsertUserReadingState(client, session.user.id, state);
      if (successText) setMessage(successText);
      return true;
    } catch (error) {
      setMessage(safeSupabaseError(error, config));
      return false;
    } finally {
      setSaving(false);
    }
  }, [client, config, mode, paper.id, session]);

  const changeMode = (next: ReaderMode): void => {
    setMode(next);
    setSelectedText('');
    if (session) void persist({readerMode: next});
  };

  const selectSection = (sectionId: string): void => {
    setActiveSection(sectionId);
    setMode('analysis');
    if (session) void persist({readerMode: 'analysis', activeSection: sectionId});
    window.setTimeout(() => document.getElementById(`reader-section-${sectionId}`)?.scrollIntoView({behavior: 'smooth', block: 'start'}), 20);
  };

  const toggleBookmark = (): void => {
    const next = bookmarks.includes(activeSection) ? bookmarks.filter((item) => item !== activeSection) : [...bookmarks, activeSection];
    void persist({bookmarks: next}, bookmarks.includes(activeSection) ? '已取消章节书签。' : '章节书签已保存。');
  };

  const handleSelection = (): void => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (!text || text.length < 2) { setSelectedText(''); return; }
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    setSelectedText(text.slice(0, 800));
    setSelectionPosition({
      left: Math.max(12, Math.min(window.innerWidth - 520, rect?.left ?? 20)),
      top: Math.max(70, (rect?.top ?? 100) - 48),
    });
  };

  const saveClip = (kind: ClipKind): void => {
    if (!selectedText) return;
    const clip: ReaderClip = {id: crypto.randomUUID(), kind, text: selectedText, sectionId: activeSection, createdAt: new Date().toISOString()};
    void persist({clippings: [clip, ...clippings]}, `${clipKindLabel(kind)}已加入当前论文工作区。`);
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
  };

  if (loading) return <div className={styles.loading}>正在恢复上次阅读位置…</div>;

  return (
    <main className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.identity}>
          <Link to={lang === 'en' ? '/en/library' : '/library'}><ArrowLeft size={15} />返回文献库</Link>
          <div><span>Paper Deep Dive · {paper.id}</span><h1>{paper.title}</h1><p>{[paper.authors, paper.year, paper.venue].filter(Boolean).join(' · ')}</p></div>
        </div>
        <ReaderModeTabs mode={mode} onChange={changeMode} />
        <div className={styles.topActions}>{paper.url ? <a href={paper.url} target="_blank" rel="noreferrer">原文<ExternalLink size={13} /></a> : null}<SiteAccountMenu compact /></div>
      </header>

      <div className={styles.columns}>
        <aside className={styles.termSidebar}>
          <header><span>TERMINOLOGY</span><h2>术语与前置知识</h2><p>点击术语定位解读，详情进入现有术语库。</p></header>
          <label className={styles.search}><Search size={14} /><input value={termQuery} onChange={(event) => setTermQuery(event.target.value)} placeholder="搜索本文术语" /></label>
          <div className={styles.termList}>{filteredTerms.map((term) => (
            <article key={term.name} className={styles.termCard} data-active={currentSection?.terms.includes(term.name)}>
              <button type="button" onClick={() => selectSection(term.sectionId)}><span><strong>{term.name}</strong><small>{term.group}</small></span><p>{term.description}</p></button>
              <Link to={`/terms?term=${encodeURIComponent(term.name)}`}>术语库<Link2 size={11} /></Link>
            </article>
          ))}</div>
        </aside>

        <section className={styles.readerPane}>
          {mode === 'cover' ? <PaperCover paper={paper} coverUrl={coverUrl} onEnter={() => changeMode('analysis')} /> : null}
          {mode === 'pdf' ? <PaperPdfViewer paper={paper} /> : null}
          {mode === 'analysis' ? <StructuredAnalysis paper={paper} sections={sections} activeSection={activeSection} bookmarks={bookmarks} onSectionChange={(id) => { setActiveSection(id); if (session) void persist({activeSection: id}); }} onToggleBookmark={toggleBookmark} onMouseUp={handleSelection} /> : null}
          {mode === 'split' ? <SplitReading paper={paper} sections={sections} activeSection={activeSection} onSectionChange={setActiveSection} onMouseUp={handleSelection} /> : null}
          {mode === 'figures' ? <FigureAnalysis paper={paper} coverUrl={coverUrl} /> : null}
          {mode === 'notes' ? <SixQuestionNotes paper={paper} notes={workspace.sixNotes ?? EMPTY_NOTES} session={session} saving={saving} onSave={(notes) => void persist({sixNotes: notes}, '六问笔记已保存到当前账户。')} /> : null}
        </section>

        <aside className={styles.contextSidebar}>
          <section className={styles.chapterContext}>
            <header><span>CURRENT SECTION</span><button type="button" onClick={toggleBookmark} data-active={bookmarks.includes(activeSection)} title="章节书签"><Bookmark size={15} /></button></header>
            <h2>{currentSection?.title}</h2>
            <p>{currentSection?.body || '当前章节内容尚未整理。'}</p>
            <div>{currentSection?.terms.map((term) => <span key={term}>{term}</span>)}</div>
          </section>
          <div className={styles.experimentTabs} role="tablist">
            <button type="button" role="tab" aria-selected={experimentTab === 'paper'} onClick={() => setExperimentTab('paper')}>论文结果</button>
            <button type="button" role="tab" aria-selected={experimentTab === 'reproduction'} onClick={() => setExperimentTab('reproduction')}>复现结果</button>
            <button type="button" role="tab" aria-selected={experimentTab === 'comparison'} onClick={() => setExperimentTab('comparison')}>结果对比</button>
          </div>
          <div className={styles.experimentBody}>
            {experimentTab === 'paper' ? <ExperimentEditor title="论文结果摘录" value={paperExperiment} disabled={!session || saving} onChange={(value) => setWorkspace((current) => ({...current, paperExperiment: value}))} onSave={(value) => void persist({paperExperiment: value}, '论文结果摘录已保存。')} /> : null}
            {experimentTab === 'reproduction' ? <ExperimentEditor title="我的复现结果" value={reproductionExperiment} disabled={!session || saving} onChange={(value) => setWorkspace((current) => ({...current, reproductionExperiment: value}))} onSave={(value) => void persist({reproductionExperiment: value}, '复现结果已保存。')} /> : null}
            {experimentTab === 'comparison' ? <ExperimentComparison paperValue={paperExperiment} reproductionValue={reproductionExperiment} /> : null}
          </div>
          <section className={styles.personalContext}><header><NotebookPen size={14} /><strong>个人阅读资产</strong></header><div><span>书签</span><b>{bookmarks.length}</b></div><div><span>摘录与疑问</span><b>{clippings.length}</b></div>{clippings.slice(0, 4).map((clip) => <p key={clip.id}><em>{clipKindLabel(clip.kind)}</em>{clip.text}</p>)}{!session ? <Link to={`/login?next=${encodeURIComponent(`/paper-reading?lit=${paper.id}`)}`}>登录后保存个人内容</Link> : null}</section>
          {message ? <p className={styles.message}>{message}</p> : null}
        </aside>
      </div>

      {selectedText ? <SelectionToolbar position={selectionPosition} onAction={saveClip} onClose={() => setSelectedText('')} /> : null}
    </main>
  );
}

function ReaderModeTabs({mode, onChange}: {mode: ReaderMode; onChange: (mode: ReaderMode) => void}): React.ReactElement {
  const items: Array<[ReaderMode, string, React.ReactNode]> = [
    ['cover', '档案', <BookOpen size={14} />], ['pdf', 'PDF 原文', <FileText size={14} />],
    ['analysis', '结构化解读', <Network size={14} />], ['split', '原文对照', <Columns3 size={14} />],
    ['figures', '图表解析', <ImageIcon size={14} />], ['notes', '六问笔记', <NotebookPen size={14} />],
  ];
  return <nav className={styles.modeTabs} aria-label="论文阅读模式">{items.map(([id, label, icon]) => <button key={id} type="button" data-active={mode === id} onClick={() => onChange(id)}>{icon}{label}</button>)}</nav>;
}

function PaperCover({paper, coverUrl, onEnter}: {paper: LiteratureItem; coverUrl: string; onEnter: () => void}): React.ReactElement {
  return <article className={styles.coverPage}>
    <section className={styles.coverHero}>
      <div className={styles.coverVisual}>{coverUrl ? <img src={coverUrl} alt={paper.coverAlt ?? `${paper.title} 封面`} /> : <><BookOpen size={50} /><span>{paper.year ?? 'PAPER'}</span></>}</div>
      <div><span>{paper.chapterTitleZh || paper.chapterTitleEn}</span><h2>{paper.title}</h2><p className={styles.authors}>{paper.authors || '作者信息待补充'} · {paper.year || '年份待补充'} · {paper.venue || '来源待补充'}</p><p className={styles.abstract}>{paper.summaryZh || '摘要尚未整理，建议从论文原文或已上传笔记中补充。'}</p><div className={styles.tagRow}>{(paper.tags ?? []).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    </section>
    <section className={styles.coverFacts}><article><Lightbulb size={18} /><div><span>核心价值</span><h3>为什么值得精读</h3><p>{paper.coreReason || '尚未录入可核验的核心贡献。'}</p></div></article><article><ListChecks size={18} /><div><span>阅读目标</span><h3>读完应当获得什么</h3><p>{paper.readerBenefit || '尚未整理该论文对当前项目的具体价值。'}</p></div></article></section>
    <section className={styles.pipeline}><span>INPUT</span><ChevronRight size={15} /><span>{paper.tags?.[0] ?? 'METHOD'}</span><ChevronRight size={15} /><span>{paper.tags?.[1] ?? 'MODEL'}</span><ChevronRight size={15} /><span>BITSTREAM / RESULT</span></section>
    <button type="button" className={styles.enterButton} onClick={onEnter}>进入结构化解读<ChevronRight size={17} /></button>
  </article>;
}

function StructuredAnalysis({paper, sections, activeSection, bookmarks, onSectionChange, onToggleBookmark, onMouseUp}: {paper: LiteratureItem; sections: AnalysisSection[]; activeSection: string; bookmarks: string[]; onSectionChange: (id: string) => void; onToggleBookmark: () => void; onMouseUp: () => void}): React.ReactElement {
  return <article className={styles.analysisPage}>
    <header className={styles.analysisLead}><span>STRUCTURED READING</span><h2>{paper.title}</h2><p>仅展示当前资料中可核对的信息；缺失内容保留明确空状态，不补造论文结论。</p></header>
    <nav className={styles.analysisToc}>{sections.map((section, index) => <a key={section.id} href={`#reader-section-${section.id}`} data-active={activeSection === section.id} onClick={() => onSectionChange(section.id)}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}{bookmarks.includes(section.id) ? <Bookmark size={11} /> : null}</a>)}</nav>
    <div className={styles.document} onMouseUp={onMouseUp}>{sections.map((section, index) => <section key={section.id} id={`reader-section-${section.id}`} data-active={activeSection === section.id} onMouseEnter={() => onSectionChange(section.id)}><aside>{String(index + 1).padStart(2, '0')}</aside><div><header><h3>{section.title}</h3>{activeSection === section.id ? <button type="button" onClick={onToggleBookmark}><Bookmark size={13} />书签</button> : null}</header>{section.body ? <p>{section.body}</p> : <div className={styles.emptyState}><FileText size={18} /><span>当前资料未提供可核验内容，等待管理员或论文笔记补充。</span></div>}<footer>{section.terms.map((term) => <span key={term}>{term}</span>)}</footer></div></section>)}</div>
  </article>;
}

function PaperPdfViewer({paper, compact = false}: {paper: LiteratureItem; compact?: boolean}): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const [url, setUrl] = React.useState<string | null>(findExternalPdf(paper));
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    let active = true;
    void client.from('files').select('*').eq('related_type', `paper-pdf:${paper.id}`).eq('published', true).order('created_at', {ascending: false}).limit(1).then(({data, error: loadError}) => {
      if (!active) return;
      if (loadError) { setError(safeSupabaseError(loadError, config)); return; }
      if (data?.[0]?.storage_path) setUrl(getAdminFilePublicUrl(client, data[0].storage_path));
    });
    return () => { active = false; };
  }, [client, config, paper.id]);
  return <section className={compact ? styles.pdfCompact : styles.pdfViewer}><header><div><span>PDF ORIGINAL</span><strong>{url ? '原文阅读器' : '尚未绑定 PDF'}</strong></div><PaperPdfControl paperId={paper.id} paperTitle={paper.title} />{url ? <a href={url} target="_blank" rel="noreferrer">新窗口打开<ExternalLink size={12} /></a> : null}</header>{url ? <iframe src={url} title={`${paper.title} PDF`} /> : <div className={styles.pdfEmpty}><FileText size={34} /><strong>暂无可嵌入的 PDF</strong><p>管理员可在文献卡片或本页上传 PDF；已有外部原文时仍可通过顶部“原文”打开。</p></div>}{error ? <p className={styles.message}>{error}</p> : null}</section>;
}

function SplitReading({paper, sections, activeSection, onSectionChange, onMouseUp}: {paper: LiteratureItem; sections: AnalysisSection[]; activeSection: string; onSectionChange: (id: string) => void; onMouseUp: () => void}): React.ReactElement {
  const current = sections.find((item) => item.id === activeSection) ?? sections[0];
  return <div className={styles.splitView}><PaperPdfViewer paper={paper} compact /><section className={styles.splitAnalysis} onMouseUp={onMouseUp}><header><span>INTERPRETATION</span><select value={activeSection} onChange={(event) => onSectionChange(event.target.value)}>{sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select></header><h2>{current.title}</h2>{current.body ? <p>{current.body}</p> : <div className={styles.emptyState}><FileText size={18} /><span>当前章节尚未整理。</span></div>}<div>{current.terms.map((term) => <span key={term}>{term}</span>)}</div></section></div>;
}

function FigureAnalysis({paper, coverUrl}: {paper: LiteratureItem; coverUrl: string}): React.ReactElement {
  return <article className={styles.figurePage}><header><span>FIGURES & PIPELINE</span><h2>图表与方法流程</h2><p>第一版只展示已登记图像和可由现有元数据确定的方法关系，不生成虚构论文图表。</p></header>{coverUrl ? <figure><img src={coverUrl} alt={paper.coverAlt ?? paper.title} /><figcaption>当前登记的论文封面或代表图</figcaption></figure> : null}<section className={styles.figurePipeline}><div><BookOpen size={18} /><span>论文输入与问题</span></div><ChevronRight size={17} /><div><Network size={18} /><span>{paper.tags?.[0] ?? '核心方法待提取'}</span></div><ChevronRight size={17} /><div><BarChart3 size={18} /><span>实验指标与结论</span></div></section><div className={styles.emptyState}><ImageIcon size={20} /><span>论文内部图表尚未登记。可在后台替换页面图像或上传论文笔记后继续解析。</span></div></article>;
}

function SixQuestionNotes({paper, notes, session, saving, onSave}: {paper: LiteratureItem; notes: Record<string, string>; session: Session | null; saving: boolean; onSave: (notes: Record<string, string>) => void}): React.ReactElement {
  const [draft, setDraft] = React.useState(notes);
  React.useEffect(() => setDraft(notes), [paper.id, notes]);
  return <article className={styles.notesPage}><header><div><span>SIX-QUESTION NOTE</span><h2>六问精读笔记</h2><p>笔记保存到当前账户，与其他用户完全隔离。</p></div><button type="button" disabled={!session || saving} onClick={() => onSave(draft)}><Save size={15} />{saving ? '保存中…' : '保存笔记'}</button></header>{!session ? <div className={styles.loginNotice}>登录后才能跨设备保存笔记。</div> : null}<div className={styles.noteGrid}>{NOTE_FIELDS.map(([key, label, placeholder]) => <label key={key}><span>{label}</span><textarea rows={6} value={draft[key] ?? ''} placeholder={placeholder} onChange={(event) => setDraft((current) => ({...current, [key]: event.target.value}))} /></label>)}</div><PublicAssetPanel title="论文笔记附件" relatedType="paper-note" relatedKey={paper.id} accept=".md,.txt,.doc,.docx,.pdf" allowedMimeTypes={['text/markdown', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf']} /></article>;
}

function ExperimentEditor({title, value, disabled, onChange, onSave}: {title: string; value: ExperimentDraft; disabled: boolean; onChange: (value: ExperimentDraft) => void; onSave: (value: ExperimentDraft) => void}): React.ReactElement {
  const field = (key: keyof ExperimentDraft, label: string, placeholder: string) => <label><span>{label}</span><input value={value[key]} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange({...value, [key]: event.target.value})} /></label>;
  return <div className={styles.experimentEditor}><h3><FlaskConical size={15} />{title}</h3>{field('dataset', '数据集', '例如 Silesia')}{field('metric', '评价指标', 'compressionRatio / BPB')}{field('value', '结果值', '输入数值')}{field('blockSize', '块大小', '例如 1 MiB')}{field('environment', '环境/版本', 'CPU、GPU、代码版本')}<label><span>备注</span><textarea rows={4} value={value.note} disabled={disabled} onChange={(event) => onChange({...value, note: event.target.value})} /></label><button type="button" disabled={disabled} onClick={() => onSave(value)}><Save size={14} />保存</button></div>;
}

function ExperimentComparison({paperValue, reproductionValue}: {paperValue: ExperimentDraft; reproductionValue: ExperimentDraft}): React.ReactElement {
  const paperNumber = Number(paperValue.value);
  const reproductionNumber = Number(reproductionValue.value);
  const comparable = Number.isFinite(paperNumber) && Number.isFinite(reproductionNumber) && paperValue.value !== '' && reproductionValue.value !== '';
  const difference = comparable ? reproductionNumber - paperNumber : 0;
  const relative = comparable && paperNumber !== 0 ? (difference / paperNumber) * 100 : null;
  const max = Math.max(Math.abs(paperNumber) || 0, Math.abs(reproductionNumber) || 0, 1);
  return <div className={styles.comparison}><h3><BarChart3 size={15} />对齐比较</h3>{paperValue.metric !== reproductionValue.metric || paperValue.dataset !== reproductionValue.dataset ? <div className={styles.compareWarning}>请先对齐数据集和评价指标。</div> : null}<div className={styles.bars}><div><span style={{height: `${Math.max(8, Math.abs(paperNumber || 0) / max * 100)}%`}} /><b>{paperValue.value || '—'}</b><small>论文</small></div><div><span style={{height: `${Math.max(8, Math.abs(reproductionNumber || 0) / max * 100)}%`}} /><b>{reproductionValue.value || '—'}</b><small>复现</small></div></div><dl><div><dt>数据集</dt><dd>{reproductionValue.dataset || paperValue.dataset || '—'}</dd></div><div><dt>指标</dt><dd>{reproductionValue.metric || paperValue.metric || '—'}</dd></div><div><dt>绝对差值</dt><dd>{comparable ? difference.toFixed(4) : '—'}</dd></div><div><dt>相对差值</dt><dd>{relative === null ? '—' : `${relative.toFixed(2)}%`}</dd></div></dl></div>;
}

function SelectionToolbar({position, onAction, onClose}: {position: {left: number; top: number}; onAction: (kind: ClipKind) => void; onClose: () => void}): React.ReactElement {
  const actions: Array<[ClipKind, string, React.ReactNode]> = [['note', '笔记', <NotebookPen size={13} />], ['term', '术语', <Tags size={13} />], ['task', '任务', <ListChecks size={13} />], ['question', '疑问', <MessageSquareText size={13} />], ['citation', '引用', <Quote size={13} />]];
  return <div className={styles.selectionToolbar} style={position}><Highlighter size={14} />{actions.map(([kind, label, icon]) => <button key={kind} type="button" onClick={() => onAction(kind)}>{icon}{label}</button>)}<button type="button" onClick={onClose} aria-label="关闭">×</button></div>;
}

function buildAnalysisSections(paper: LiteratureItem): AnalysisSection[] {
  const tags = [...(paper.tags ?? [])];
  const projectLocation = [paper.chapterTitleZh, paper.sectionTitleZh].filter(Boolean).join(' / ');
  const attachments = (paper.attachments ?? []).map((item) => item.label ?? item.kind).join('、');
  return [
    {id: 'background', title: '研究背景', body: paper.summaryZh ?? '', terms: tags.slice(0, 3)},
    {id: 'problem', title: '研究问题', body: paper.coreReason ?? '', terms: tags.slice(0, 3)},
    {id: 'contributions', title: '核心贡献', body: paper.readerBenefit ?? '', terms: tags.slice(0, 4)},
    {id: 'overview', title: '方法总览', body: tags.length ? `当前资料将方法标记为：${tags.join('、')}。详细流程仍需从原文逐段提取。` : '', terms: tags.slice(0, 4)},
    {id: 'method', title: '模块拆解', body: '', terms: tags.slice(0, 5)},
    {id: 'pipeline', title: '数据流程', body: '', terms: tags.slice(0, 4)},
    {id: 'formula', title: '公式解释', body: '', terms: []},
    {id: 'experiments', title: '实验设置', body: attachments ? `已登记的相关资料：${attachments}。实验参数需要从论文表格或复现记录中补充。` : '', terms: ['Dataset', 'Metric']},
    {id: 'results', title: '实验结果', body: '', terms: ['BPB', 'Compression Ratio']},
    {id: 'advantages', title: '优点', body: '', terms: tags.slice(0, 3)},
    {id: 'limitations', title: '局限', body: '', terms: []},
    {id: 'project', title: '与项目的关系', body: projectLocation ? `该论文位于项目研究结构：${projectLocation}。${paper.readerBenefit ?? ''}` : paper.readerBenefit ?? '', terms: tags.slice(0, 4)},
    {id: 'reproducibility', title: '可复现性判断', body: paper.url || attachments ? '已登记原文或关联资源；仍需核对代码版本、数据集、参数、硬件和无损校验后才能形成可复现结论。' : '', terms: ['Reproducibility', 'Verification']},
  ];
}

function getRelatedTerms(paper: LiteratureItem): ReaderTerm[] {
  const text = [paper.title, paper.summaryZh, paper.coreReason, paper.readerBenefit, ...(paper.tags ?? [])].filter(Boolean).join(' ').toLowerCase();
  const direct = TERM_BANK.filter((term) => term.name.toLowerCase().split(/[-\s]/).some((part) => part.length > 2 && text.includes(part)));
  const fallback = TERM_BANK.filter((term) => paper.chapterId === '01' ? ['信息论', '熵编码', '建模', '字典匹配'].includes(term.group) : ['建模', '熵编码', '评价指标'].includes(term.group));
  return Array.from(new Map([...direct, ...fallback].map((term) => [term.name, term])).values()).slice(0, 12);
}

function findExternalPdf(paper: LiteratureItem): string | null {
  const attached = paper.attachments?.find((item) => item.kind === 'pdf')?.url;
  if (attached) return attached;
  if (paper.url && (/\.pdf($|\?)/i.test(paper.url) || paper.url.includes('arxiv.org/pdf'))) return paper.url;
  return null;
}

function readingProgress(mode: ReaderMode): number {
  return {cover: 5, pdf: 25, analysis: 55, split: 65, figures: 75, notes: 90}[mode];
}

function clipKindLabel(kind: ClipKind): string {
  return {note: '笔记', term: '术语候选', task: '任务候选', question: '疑问', citation: '引用收藏'}[kind];
}
