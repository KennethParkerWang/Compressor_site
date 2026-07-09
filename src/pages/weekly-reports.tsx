import React, {useEffect, useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import ReactMarkdown from 'react-markdown';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  FileText,
  ImagePlus,
  HelpCircle,
  ListChecks,
  Maximize2,
  Minimize2,
  MonitorUp,
  PanelTopOpen,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  FIRST_WEEKLY_REPORT_DATE,
  WEEKLY_REPORT_CADENCE,
  WEEKLY_REPORT_PRINCIPLES,
  weeklyReports,
  type WeeklyReportItem,
  type WeeklyReportStatus,
  type WeeklyReportTrack,
} from '../data/weeklyReports';
import styles from './weekly-reports.module.css';

type Lang = 'zh' | 'en';

const STATUS_COPY: Record<Lang, Record<WeeklyReportStatus, string>> = {
  zh: {
    'not-started': '未开始',
    'outline-ready': '大纲已建',
    drafting: '撰写中',
    review: '待复查',
    ready: '可汇报',
    done: '已完成',
  },
  en: {
    'not-started': 'Not Started',
    'outline-ready': 'Outline Ready',
    drafting: 'Drafting',
    review: 'Review',
    ready: 'Ready',
    done: 'Done',
  },
};

const TRACK_COPY: Record<Lang, Record<WeeklyReportTrack, string>> = {
  zh: {
    project: '项目管理',
    literature: '文献调研',
    data: '数据与基线',
    experiment: '复现实验',
    delivery: '阶段交付',
  },
  en: {
    project: 'Project',
    literature: 'Literature',
    data: 'Data & Baselines',
    experiment: 'Experiments',
    delivery: 'Delivery',
  },
};

const PAGE_COPY = {
  zh: {
    title: '双周汇报中心',
    layoutTitle: '双周汇报中心',
    hint: '集中管理双周会时间、汇报大纲、可编辑草稿、材料准备状态、待确认问题和全屏展示入口。',
    kicker: 'Biweekly Briefing Hub',
    heroTitle: '双周会汇报内容与展示中心',
    heroLead: '用于把两周工作从“零散进度”整理成一小时内可展示、可讨论、可追踪的汇报材料。第一次汇报时间：2026-07-10 14:30-15:30。',
    firstDate: '首次汇报',
    cadence: '固定节奏',
    contentRule: '内容规则',
    total: '排期数量',
    reports: '次汇报',
    currentFocus: '当前重点',
    structureTitle: '栏目规划',
    structureDesc: '建议把每次双周会拆成“会前准备、会上展示、会后沉淀”三段，后续每次只更新草稿和证据材料。',
    timelineTitle: '双周会汇报排期',
    timelineDesc: '先保留 8 次汇报主题，当前统一按 14:30-15:30 的一小时会议组织；后续可根据腾讯会议周期继续调整日期。',
    detailTitle: '汇报内容面板',
    openReport: '打开汇报',
    fullScreen: '全屏展示',
    exitFullScreen: '退出全屏',
    copyOutline: '复制大纲',
    copied: '已复制',
    agenda: '建议大纲',
    materials: '材料清单',
    questions: '老师可能会问',
    nextActions: '会后动作',
    editableDraft: '可编辑汇报稿',
    markdownEditor: 'Markdown 编辑',
    preview: '实时预览',
    saveDraft: '保存草稿',
    resetDraft: '恢复默认稿',
    copyDraft: '复制 Markdown',
    saved: '已保存',
    dragHint: '把图片拖到编辑框的目标位置，会插入 Markdown 图片。',
    editorTip: '建议用一级/二级标题组织汇报；图片、表格和讨论点都可以直接放进草稿。',
    purpose: '汇报目标',
    summary: '内容状态说明',
    schedule: '时间安排',
    linksTitle: '关联入口',
    annualPlan: '年度研发计划',
    calendar: '日程计划',
    tasks: '任务看板',
    presentationMode: '展示模式',
    slide: '页',
    pageOf: ' / ',
    emptyContent: '内容待完善，当前先保留结构位置。',
  },
  en: {
    title: 'Biweekly Briefings',
    layoutTitle: 'Biweekly Briefings',
    hint: 'Manage biweekly meeting time, outlines, editable drafts, material readiness, open questions, and fullscreen presentation.',
    kicker: 'Biweekly Briefing Hub',
    heroTitle: 'Biweekly Briefing Content and Presentation Hub',
    heroLead: 'Turn two weeks of progress into a one-hour presentable, discussable, and traceable briefing. First meeting: 2026-07-10 14:30-15:30.',
    firstDate: 'First Briefing',
    cadence: 'Cadence',
    contentRule: 'Content Rule',
    total: 'Schedule',
    reports: 'briefings',
    currentFocus: 'Current Focus',
    structureTitle: 'Column Plan',
    structureDesc: 'Organize each briefing into before-meeting preparation, live presentation, and after-meeting follow-up.',
    timelineTitle: 'Biweekly Briefing Schedule',
    timelineDesc: 'Keep 8 briefing topics for now, organized around a one-hour 14:30-15:30 meeting slot; dates can be adjusted with the Tencent meeting cycle later.',
    detailTitle: 'Briefing Content Panel',
    openReport: 'Open',
    fullScreen: 'Fullscreen',
    exitFullScreen: 'Exit Fullscreen',
    copyOutline: 'Copy Outline',
    copied: 'Copied',
    agenda: 'Suggested Agenda',
    materials: 'Materials',
    questions: 'Likely Questions',
    nextActions: 'After-Meeting Actions',
    editableDraft: 'Editable Briefing Draft',
    markdownEditor: 'Markdown Editor',
    preview: 'Live Preview',
    saveDraft: 'Save Draft',
    resetDraft: 'Reset Default',
    copyDraft: 'Copy Markdown',
    saved: 'Saved',
    dragHint: 'Drag images into the target position in the editor to insert Markdown images.',
    editorTip: 'Use headings for the briefing structure; images, tables, and discussion points can be kept in the draft.',
    purpose: 'Purpose',
    summary: 'Content Status',
    schedule: 'Schedule',
    linksTitle: 'Related Links',
    annualPlan: 'Annual Plan',
    calendar: 'Calendar',
    tasks: 'Task Board',
    presentationMode: 'Presentation Mode',
    slide: 'Slide',
    pageOf: ' / ',
    emptyContent: 'Content is not finalized yet; this section reserves the structure.',
  },
} as const;

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function localizePath(path: string, lang: Lang): string {
  return lang === 'en' ? `/en${path === '/' ? '' : path}` : path;
}

function getTitle(report: WeeklyReportItem, lang: Lang): string {
  return lang === 'zh' ? report.titleZh : report.titleEn;
}

function getPurpose(report: WeeklyReportItem, lang: Lang): string {
  return lang === 'zh' ? report.purposeZh : report.purposeEn;
}

function getSummary(report: WeeklyReportItem, lang: Lang): string {
  return lang === 'zh' ? report.summaryZh : report.summaryEn;
}

function getAgenda(report: WeeklyReportItem, lang: Lang): string[] {
  return lang === 'zh' ? report.agendaZh : report.agendaEn;
}

function getQuestions(report: WeeklyReportItem, lang: Lang): string[] {
  return lang === 'zh' ? report.questionsZh : report.questionsEn;
}

function getNextActions(report: WeeklyReportItem, lang: Lang): string[] {
  return lang === 'zh' ? report.nextActionsZh : report.nextActionsEn;
}

function getDefaultDraft(report: WeeklyReportItem, lang: Lang): string {
  return (lang === 'zh' ? report.draftZh : report.draftEn) ?? makeOutline(report, lang);
}

function makeOutline(report: WeeklyReportItem, lang: Lang): string {
  const copy = PAGE_COPY[lang];
  const lines = [
    `# ${getTitle(report, lang)}`,
    '',
    `${copy.schedule}: ${report.date} ${lang === 'zh' ? report.weekdayZh : report.weekdayEn} ${report.time}`,
    '',
    `## ${copy.purpose}`,
    getPurpose(report, lang),
    '',
    `## ${copy.agenda}`,
    ...getAgenda(report, lang).map((item, index) => `${index + 1}. ${item}`),
    '',
    `## ${copy.questions}`,
    ...getQuestions(report, lang).map((item, index) => `${index + 1}. ${item}`),
    '',
    `## ${copy.nextActions}`,
    ...getNextActions(report, lang).map((item, index) => `${index + 1}. ${item}`),
  ];
  return lines.join('\n');
}

function makeSlides(report: WeeklyReportItem, lang: Lang): Array<{label: string; title: string; bullets: string[]}> {
  const copy = PAGE_COPY[lang];
  return [
    {
      label: '01',
      title: getTitle(report, lang),
      bullets: [
        `${report.date} ${lang === 'zh' ? report.weekdayZh : report.weekdayEn} ${report.time}`,
        getPurpose(report, lang),
      ],
    },
    {
      label: '02',
      title: copy.agenda,
      bullets: getAgenda(report, lang),
    },
    {
      label: '03',
      title: copy.summary,
      bullets: [getSummary(report, lang), copy.emptyContent],
    },
    {
      label: '04',
      title: copy.questions,
      bullets: getQuestions(report, lang),
    },
    {
      label: '05',
      title: copy.nextActions,
      bullets: getNextActions(report, lang),
    },
  ];
}

export default function WeeklyReportsPage(): React.ReactElement {
  const location = useLocation();
  const lang: Lang = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const copy = PAGE_COPY[lang];
  const [selectedId, setSelectedId] = useState(weeklyReports[0].id);
  const [presenting, setPresenting] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [draftCopied, setDraftCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draft, setDraft] = useState('');
  const presenterRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const selected = useMemo(
    () => weeklyReports.find((report) => report.id === selectedId) ?? weeklyReports[0],
    [selectedId],
  );
  const slides = useMemo(() => makeSlides(selected, lang), [selected, lang]);
  const firstReport = weeklyReports[0];
  const readyCount = weeklyReports.filter((report) => report.status !== 'not-started').length;

  useEffect(() => {
    const reportId = new URLSearchParams(location.search).get('report');
    if (reportId && weeklyReports.some((report) => report.id === reportId)) {
      setSelectedId(reportId);
    }
  }, [location.search]);

  useEffect(() => {
    const storageKey = getDraftStorageKey(selected.id, lang);
    const stored = window.localStorage.getItem(storageKey);
    setDraft(stored ?? getDefaultDraft(selected, lang));
    setDraftSaved(false);
    setDraftCopied(false);
  }, [lang, selected]);

  useEffect(() => {
    if (!presenting) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closePresentation();
      if (event.key === 'ArrowRight') setSlideIndex((value) => Math.min(value + 1, slides.length - 1));
      if (event.key === 'ArrowLeft') setSlideIndex((value) => Math.max(value - 1, 0));
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [presenting, slides.length]);

  async function copyOutline(): Promise<void> {
    try {
      await navigator.clipboard.writeText(makeOutline(selected, lang));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function copyDraft(): Promise<void> {
    try {
      await navigator.clipboard.writeText(draft);
      setDraftCopied(true);
      window.setTimeout(() => setDraftCopied(false), 1600);
    } catch {
      setDraftCopied(false);
    }
  }

  function saveDraft(): void {
    window.localStorage.setItem(getDraftStorageKey(selected.id, lang), draft);
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 1600);
  }

  function resetDraft(): void {
    const nextDraft = getDefaultDraft(selected, lang);
    setDraft(nextDraft);
    window.localStorage.removeItem(getDraftStorageKey(selected.id, lang));
    setDraftSaved(false);
  }

  function insertIntoDraft(snippet: string): void {
    const editor = editorRef.current;
    if (!editor) {
      setDraft((value) => `${value}\n${snippet}`);
      return;
    }
    const start = editor.selectionStart ?? draft.length;
    const end = editor.selectionEnd ?? draft.length;
    const prefix = draft.slice(0, start);
    const suffix = draft.slice(end);
    const spacingBefore = prefix.endsWith('\n') || prefix.length === 0 ? '' : '\n';
    const spacingAfter = suffix.startsWith('\n') || suffix.length === 0 ? '' : '\n';
    const nextDraft = `${prefix}${spacingBefore}${snippet}${spacingAfter}${suffix}`;
    setDraft(nextDraft);
    window.setTimeout(() => {
      const cursor = start + spacingBefore.length + snippet.length + spacingAfter.length;
      editor.focus();
      editor.setSelectionRange(cursor, cursor);
    }, 0);
  }

  function handleImageDrop(event: React.DragEvent<HTMLTextAreaElement>): void {
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;
    event.preventDefault();
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (!dataUrl) return;
        const safeName = file.name.replace(/[()[\]]/g, '-');
        insertIntoDraft(`![${safeName}](${dataUrl})`);
      };
      reader.readAsDataURL(file);
    }
  }

  function openPresentation(): void {
    setSlideIndex(0);
    setPresenting(true);
    window.setTimeout(() => {
      presenterRef.current?.requestFullscreen?.().catch(() => undefined);
    }, 60);
  }

  function closePresentation(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
    setPresenting(false);
  }

  return (
    <Layout title={copy.layoutTitle} description={copy.hint}>
      <WorkbenchShell pageTitle={copy.title}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{copy.kicker}</span>
            <h2>{copy.heroTitle}</h2>
            <p>{copy.heroLead}</p>
          </div>
          <div className={styles.heroPanel}>
            <div>
              <span>{copy.firstDate}</span>
              <strong>{FIRST_WEEKLY_REPORT_DATE}</strong>
              <em>{lang === 'zh' ? firstReport.weekdayZh : firstReport.weekdayEn} {firstReport.time}</em>
            </div>
            <div>
              <span>{copy.cadence}</span>
              <strong>{WEEKLY_REPORT_CADENCE[lang].fixedTime}</strong>
              <em>{WEEKLY_REPORT_CADENCE[lang].rule}</em>
            </div>
          </div>
        </section>

        <section className={styles.metrics} aria-label={copy.currentFocus}>
          <article>
            <CalendarCheck size={18} />
            <span>{copy.total}</span>
            <strong>{weeklyReports.length} {copy.reports}</strong>
          </article>
          <article>
            <Clock3 size={18} />
            <span>{copy.cadence}</span>
            <strong>{WEEKLY_REPORT_CADENCE[lang].fixedTime}</strong>
          </article>
          <article>
            <CheckCircle2 size={18} />
            <span>{copy.currentFocus}</span>
            <strong>{readyCount}/{weeklyReports.length}</strong>
          </article>
          <article>
            <AlertCircle size={18} />
            <span>{copy.contentRule}</span>
            <strong>{WEEKLY_REPORT_CADENCE[lang].first}</strong>
          </article>
        </section>

        <section className={styles.planBlock}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>{copy.structureTitle}</span>
              <h2>{copy.structureTitle}</h2>
              <p>{copy.structureDesc}</p>
            </div>
          </div>
          <div className={styles.principles}>
            {WEEKLY_REPORT_PRINCIPLES.map((item, index) => (
              <article key={item.titleEn}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{lang === 'zh' ? item.titleZh : item.titleEn}</strong>
                <p>{lang === 'zh' ? item.descZh : item.descEn}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.workspace}>
          <section className={styles.schedule}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.kicker}>{copy.schedule}</span>
                <h2>{copy.timelineTitle}</h2>
                <p>{copy.timelineDesc}</p>
              </div>
            </div>
            <div className={styles.reportList}>
              {weeklyReports.map((report) => {
                const active = report.id === selected.id;
                return (
                  <button
                    key={report.id}
                    type="button"
                    className={styles.reportCard}
                    data-active={active ? 'true' : 'false'}
                    onClick={() => setSelectedId(report.id)}
                  >
                    <span className={styles.reportNo}>WR-{String(report.no).padStart(2, '0')}</span>
                    <span className={styles.reportDate}>
                      {report.date} · {lang === 'zh' ? report.weekdayZh : report.weekdayEn} · {report.time}
                    </span>
                    <strong>{getTitle(report, lang)}</strong>
                    <span className={styles.reportMeta}>
                      <em data-track={report.track}>{TRACK_COPY[lang][report.track]}</em>
                      <em data-status={report.status}>{STATUS_COPY[lang][report.status]}</em>
                    </span>
                    <span className={styles.reportSummary}>{getSummary(report, lang)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className={styles.detail}>
            <div className={styles.detailTop}>
              <div>
                <span className={styles.kicker}>WR-{String(selected.no).padStart(2, '0')}</span>
                <h2>{getTitle(selected, lang)}</h2>
                <p>{selected.date} · {lang === 'zh' ? selected.weekdayZh : selected.weekdayEn} · {selected.time}</p>
              </div>
              <span className={styles.statusBadge} data-status={selected.status}>
                {STATUS_COPY[lang][selected.status]}
              </span>
            </div>

            <div className={styles.actionRow}>
              <button type="button" onClick={openPresentation}>
                <Maximize2 size={15} />
                {copy.fullScreen}
              </button>
              <button type="button" onClick={copyOutline}>
                <Copy size={15} />
                {copied ? copy.copied : copy.copyOutline}
              </button>
            </div>

            <InfoBlock icon={PanelTopOpen} title={copy.purpose}>
              <p>{getPurpose(selected, lang)}</p>
            </InfoBlock>
            <InfoBlock icon={FileText} title={copy.summary}>
              <p>{getSummary(selected, lang)}</p>
            </InfoBlock>
            <InfoBlock icon={ListChecks} title={copy.agenda}>
              <ol>
                {getAgenda(selected, lang).map((item) => <li key={item}>{item}</li>)}
              </ol>
            </InfoBlock>
            <InfoBlock icon={MonitorUp} title={copy.materials}>
              <div className={styles.materialGrid}>
                {selected.materials.map((material) => (
                  <span key={material.nameEn} data-status={material.status}>
                    {lang === 'zh' ? material.nameZh : material.nameEn}
                    <em>{STATUS_COPY[lang][material.status]}</em>
                  </span>
                ))}
              </div>
            </InfoBlock>
            <InfoBlock icon={HelpCircle} title={copy.questions}>
              <ul>
                {getQuestions(selected, lang).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </InfoBlock>
            <InfoBlock icon={ArrowRight} title={copy.nextActions}>
              <ul>
                {getNextActions(selected, lang).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </InfoBlock>

            <section className={styles.editorBlock}>
              <div className={styles.editorHead}>
                <div>
                  <h3>
                    <FileText size={15} />
                    {copy.editableDraft}
                  </h3>
                  <p>{copy.editorTip}</p>
                </div>
                <div className={styles.editorActions}>
                  <button type="button" onClick={saveDraft}>
                    <Save size={14} />
                    {draftSaved ? copy.saved : copy.saveDraft}
                  </button>
                  <button type="button" onClick={copyDraft}>
                    <Copy size={14} />
                    {draftCopied ? copy.copied : copy.copyDraft}
                  </button>
                  <button type="button" onClick={resetDraft}>
                    <RotateCcw size={14} />
                    {copy.resetDraft}
                  </button>
                </div>
              </div>
              <div className={styles.editorShell}>
                <label className={styles.editorPane}>
                  <span>{copy.markdownEditor}</span>
                  <textarea
                    ref={editorRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleImageDrop}
                    spellCheck={false}
                  />
                  <em>
                    <ImagePlus size={14} />
                    {copy.dragHint}
                  </em>
                </label>
                <div className={styles.previewPane}>
                  <span>{copy.preview}</span>
                  <article>
                    <ReactMarkdown>{draft}</ReactMarkdown>
                  </article>
                </div>
              </div>
            </section>

            <div className={styles.links}>
              <span>{copy.linksTitle}</span>
              <Link to={localizePath('/project-overview', lang)}>{copy.annualPlan}</Link>
              <Link to={localizePath('/calendar', lang)}>{copy.calendar}</Link>
              <Link to={localizePath('/tasks', lang)}>{copy.tasks}</Link>
            </div>
          </aside>
        </div>

        {presenting ? (
          <div className={styles.fullscreenOverlay} ref={presenterRef}>
            <div className={styles.presenterChrome}>
              <span>{copy.presentationMode}</span>
              <strong>{copy.slide}{copy.pageOf}{slideIndex + 1}/{slides.length}</strong>
              <button type="button" onClick={closePresentation}>
                <Minimize2 size={16} />
                {copy.exitFullScreen}
              </button>
              <button type="button" className={styles.iconOnly} onClick={closePresentation} aria-label={copy.exitFullScreen}>
                <X size={18} />
              </button>
            </div>
            <article className={styles.slide}>
              <span>{slides[slideIndex].label}</span>
              <h2>{slides[slideIndex].title}</h2>
              <ul>
                {slides[slideIndex].bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </article>
            <div className={styles.presenterNav}>
              <button
                type="button"
                disabled={slideIndex === 0}
                onClick={() => setSlideIndex((value) => Math.max(value - 1, 0))}
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                {slides.map((slide, index) => (
                  <button
                    key={slide.label}
                    type="button"
                    data-active={index === slideIndex}
                    onClick={() => setSlideIndex(index)}
                    aria-label={`${copy.slide} ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={slideIndex === slides.length - 1}
                onClick={() => setSlideIndex((value) => Math.min(value + 1, slides.length - 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </WorkbenchShell>
    </Layout>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{size?: number}>;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className={styles.infoBlock}>
      <h3>
        <Icon size={15} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function getDraftStorageKey(reportId: string, lang: Lang): string {
  return `cr.weeklyReports.${reportId}.${lang}.draft`;
}
