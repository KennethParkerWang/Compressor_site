import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  FlaskConical,
  Layers3,
  Search,
  Target,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import ManagedPageSection from '../components/admin/ManagedPageSection';
import {useWorkbenchStats} from '../components/workbench/stats';
import {algorithmModules} from '../data/algorithmModules';
import {getNextWeeklyReportIndex, getWeeklyReportAt} from '../data/weeklyReports';
import {ANNUAL_PLAN_ROWS, GANTT_TASKS, YEAR_MONTHS, type GanttTask} from '../data/projectAnnualPlan';
import {ANNUAL_PLAN_ROWS_EN, GANTT_TASKS_EN} from '../data/projectAnnualPlan.en';
import styles from './index.module.css';

type Lang = 'zh' | 'en';
type RequirementState = 'complete' | 'active' | 'scheduled' | 'review' | 'overdue';

const REQUIREMENT_SCHEDULES = [
  {start: '2026-07-01', end: '2026-08-31', update: 'live'},
  {start: '2026-07-10', end: '2026-08-31', update: 'biweekly'},
  {start: '2026-08-01', end: '2026-09-30', update: 'weekly'},
  {start: '2026-08-01', end: '2026-08-31', update: 'weekly'},
  {start: '2026-08-16', end: '2026-12-31', update: 'monthly'},
] as const;

const COPY = {
  zh: {
    layoutTitle: '无损压缩研究项目',
    description: '围绕无损压缩算法调研、复现、评测和改进的项目工作台。',
    heroLabel: 'LOSSLESS COMPRESSION · 2026–2027',
    title: '无损压缩研究项目',
    lede: '从文献证据出发，建立可复现的压缩器基线，在统一数据集与指标上完成算法比较，并形成可验证的改进方案。',
    objectiveLabel: '项目目标',
    objective: '研究工程压缩、上下文混合与神经压缩路线，兼顾压缩比、吞吐、内存、时延和无损校验。',
    search: '搜索资料',
    library: '进入文献库',
    systemMap: '查看压缩系统',
    visualTitle: '无损压缩系统主链路',
    visualCaption: '编码建模、熵编码、比特流与解码同步构成同一条可验证链路。',
    metricLiterature: '文献证据库',
    metricLiteratureDetail: (count: number) => `目标 80 篇 · 当前已录入 ${count} 篇`,
    metricModules: '研究模块',
    metricModulesDetail: '覆盖工程、上下文与神经路线',
    metricReports: '第一期汇报',
    metricReportsDetail: (submitted: number, expected: number) => `${submitted}/${expected} 份已归档`,
    metricNext: '下一汇报节点',
    metricNextDetail: (days: number) => days === 0 ? '今天开始' : `距开始 ${days} 天`,
    focusLabel: '当前重点',
    focusTitle: '先把研究证据和复现基线做实',
    focusBody: '首页只呈现需要立即判断的信息，完整要求与年度明细保留在下方参考区。',
    now: 'NOW · 当前',
    next: 'NEXT · 接下来',
    risk: 'BLOCKER · 阻塞项',
    currentPhase: '当前阶段',
    nextBriefing: '下一次双周汇报',
    pendingDataset: 'Silesia 与腾讯数据集状态尚未登记，腾讯下载链接仍待提供。',
    outputsLabel: '研究产出',
    outputsTitle: '已有证据与尚未完成的闭环',
    outputsBody: '只展示仓库中已经登记的内容；没有真实结果的部分明确标记为空缺。',
    evidenceLibrary: '文献与研究地图',
    evidenceLibraryBody: '文献条目已形成检索入口，可继续筛选年份、来源与研究路线。',
    evidenceBriefing: '阶段汇报材料',
    evidenceBriefingBody: (names: string) => names ? `已归档：${names}` : '尚无已归档汇报材料。',
    evidenceExperiment: '复现与对比实验',
    evidenceExperimentBody: '尚未录入可核验的环境、参数和结果；当前重点是建立 baseline。',
    open: '打开',
    planLabel: '年度节奏',
    planTitle: '从当前月份看下一阶段',
    planBody: '优先显示当前与相邻月份；完整十二个月计划可在下方展开。',
    currentMonth: '当前月份',
    deliverable: '阶段交付',
    ganttLabel: '项目时间轴',
    ganttTitle: '年度项目甘特图',
    ganttBody: '任务条展示技术研发、成果沉淀和验收交付之间的时间关系。',
    openAnnualPlan: '查看完整年度计划页',
    ganttTask: '项目任务',
    scopeLabel: '研究边界',
    scopeTitle: '当前纳入整理的算法与数据对象',
    scopeBody: '纳入范围不等于已完成精读或复现，状态以真实材料和实验记录为准。',
    objects: [
      {group: '工程压缩器', items: 'gzip / DEFLATE、xz / LZMA、Zstd', status: '资料整理中'},
      {group: '上下文混合', items: 'PAQ / PAQ8px、cmix', status: '资料整理中'},
      {group: '神经压缩', items: 'NNCP', status: '资料整理中'},
      {group: '数据集', items: 'Silesia、腾讯数据集', status: '链接与下载待确认'},
    ],
    detailLabel: '详细参考',
    detailTitle: '项目要求与完整年度计划',
    detailBody: '需要核对原始要求、动态状态和十二个月交付物时再展开。',
    requirementsSummary: '展开项目要求与动态状态',
    annualSummary: '展开十二个月年度计划表',
    requirementsHeaders: ['序号', '项目要求', '计划节点', '当前状态', '更新机制', '入口'],
    annualHeaders: ['月份', '阶段定位', '主要研发任务', '成果沉淀任务', '阶段交付物'],
    planWindow: '计划周期',
    stateTargetMet: '数量达标',
    stateComplete: '已完成',
    statePartial: '部分完成',
    stateActive: '进行中',
    stateScheduled: '计划中',
    stateReview: '待核验',
    stateOverdue: '已逾期',
    updates: {
      live: '自动 · 页面加载时',
      biweekly: (date: string) => `自动 · 每 14 天\n下次 ${date}`,
      weekly: '定期 · 每周五核验',
      monthly: '定期 · 每月末核验',
    },
    tasks: [
      {title: '搜集项目相关论文', requirement: '以顶刊、顶会为主，不少于 80 篇；优先 2025、2026 年文章，同时保留经典算法论文。', action: '查看文献库', to: '/library'},
      {title: '精读论文并制作汇报 PPT', requirement: '每人精读 5–10 篇最相关论文，制作 PPT，并在项目碰头会上汇报。', action: '查看双周汇报', to: '/weekly-reports'},
      {title: '尝试复现相关代码', requirement: '复现精读论文的相关代码，保留运行环境、参数和输出。', action: '进入实验页', to: '/experiments'},
      {title: '下载约定数据集', requirement: '下载 Silesia 和腾讯数据集；腾讯数据集下载链接待提供。', action: '查看数据集', to: '/datasets'},
      {title: '形成算法对比实验报告', requirement: '在统一数据集上比较算法压缩效果，并整理为可复核的实验报告。', action: '查看实验记录', to: '/experiments'},
    ],
    statusLiterature: (count: number) => `文献库当前有 ${count} 条记录，仍需继续筛选相关性、年份和来源级别。`,
    statusReading: (submitted: number, expected: number) => `第一期汇报材料已收到 ${submitted}/${expected} 份。`,
    statusReproduction: '尚未录入可以核对的代码复现结果。',
    statusDataset: 'Silesia 与腾讯数据集的下载状态尚未登记。',
    statusExperiment: '尚未录入真实对比结果。',
    footerNote: '所有数量来自当前仓库；未登记的精读、下载、复现和实验结果不会用示例内容补齐。',
  },
  en: {
    layoutTitle: 'Lossless Compression Research Project',
    description: 'A project workbench for lossless compression review, reproduction, benchmarking, and improvement.',
    heroLabel: 'LOSSLESS COMPRESSION · 2026–2027',
    title: 'Lossless Compression Research Project',
    lede: 'Start from literature evidence, establish reproducible baselines, compare compressors on shared datasets and metrics, then produce verifiable improvements.',
    objectiveLabel: 'Project objective',
    objective: 'Study engineering, context-mixing, and neural compression while measuring ratio, throughput, memory, latency, and bit-exact verification.',
    search: 'Search material', library: 'Open library', systemMap: 'Open compression system',
    visualTitle: 'Lossless compression system path', visualCaption: 'Modeling, entropy coding, bitstream syntax, and synchronized decoding form one verifiable chain.',
    metricLiterature: 'Evidence library', metricLiteratureDetail: (count: number) => `Target 80 · ${count} records available`,
    metricModules: 'Research modules', metricModulesDetail: 'Engineering, context, and neural routes',
    metricReports: 'First briefing', metricReportsDetail: (submitted: number, expected: number) => `${submitted}/${expected} submissions archived`,
    metricNext: 'Next briefing', metricNextDetail: (days: number) => days === 0 ? 'Starts today' : `Starts in ${days} days`,
    focusLabel: 'Current focus', focusTitle: 'Make the evidence and reproduction baseline reliable first',
    focusBody: 'The home page keeps immediate decisions visible; full requirements and annual details are available below.',
    now: 'NOW', next: 'NEXT', risk: 'BLOCKER', currentPhase: 'Current phase', nextBriefing: 'Next biweekly briefing',
    pendingDataset: 'Silesia and Tencent dataset status is not recorded; the Tencent link is still pending.',
    outputsLabel: 'Research output', outputsTitle: 'Recorded evidence and missing loops',
    outputsBody: 'Only recorded repository content is shown. Areas without real results remain explicitly incomplete.',
    evidenceLibrary: 'Literature and research map', evidenceLibraryBody: 'Searchable literature is available for further screening by year, venue, and route.',
    evidenceBriefing: 'Briefing material', evidenceBriefingBody: (names: string) => names ? `Archived: ${names}` : 'No briefing material is archived.',
    evidenceExperiment: 'Reproduction and comparison', evidenceExperimentBody: 'No verifiable environment, parameter, or result is recorded; baseline setup is the current priority.',
    open: 'Open', planLabel: 'Annual cadence', planTitle: 'Current and upcoming stages',
    planBody: 'Current and adjacent months are shown first; expand the full twelve-month plan below.', currentMonth: 'Current month', deliverable: 'Deliverable',
    ganttLabel: 'Project timeline', ganttTitle: 'Annual Project Gantt', ganttBody: 'Bars connect R&D, research outputs, and final delivery over time.',
    openAnnualPlan: 'Open full annual plan', ganttTask: 'Task', scopeLabel: 'Research boundary',
    scopeTitle: 'Methods and datasets currently in scope', scopeBody: 'Being in scope does not mean a reading or reproduction is complete; status requires evidence.',
    objects: [
      {group: 'Engineering codecs', items: 'gzip / DEFLATE, xz / LZMA, Zstd', status: 'Material in progress'},
      {group: 'Context mixing', items: 'PAQ / PAQ8px, cmix', status: 'Material in progress'},
      {group: 'Neural compression', items: 'NNCP', status: 'Material in progress'},
      {group: 'Datasets', items: 'Silesia, Tencent dataset', status: 'Link and download pending'},
    ],
    detailLabel: 'Reference', detailTitle: 'Requirements and full annual plan', detailBody: 'Expand these only when checking original requirements, dynamic status, or monthly deliverables.',
    requirementsSummary: 'Expand project requirements and status', annualSummary: 'Expand twelve-month annual plan',
    requirementsHeaders: ['No.', 'Requirement', 'Window', 'Status', 'Update rule', 'Entry'], annualHeaders: ['Month', 'Stage', 'Main R&D tasks', 'Output tasks', 'Deliverables'],
    planWindow: 'Window', stateTargetMet: 'Target met', stateComplete: 'Complete', statePartial: 'Partial', stateActive: 'In progress', stateScheduled: 'Scheduled', stateReview: 'Needs review', stateOverdue: 'Overdue',
    updates: {live: 'Automatic · on load', biweekly: (date: string) => `Automatic · every 14 days\nNext ${date}`, weekly: 'Periodic · Friday review', monthly: 'Periodic · month-end review'},
    tasks: [
      {title: 'Collect project-related papers', requirement: 'Collect at least 80 papers, prioritizing top venues and 2025–2026 work while retaining classic papers.', action: 'Open library', to: '/library'},
      {title: 'Read papers and prepare slides', requirement: 'Each person reads 5–10 relevant papers and presents slides at project meetings.', action: 'Open briefings', to: '/weekly-reports'},
      {title: 'Reproduce related code', requirement: 'Keep the environment, parameters, and outputs for each reproduction.', action: 'Open experiments', to: '/experiments'},
      {title: 'Download agreed datasets', requirement: 'Download Silesia and Tencent datasets; the Tencent link is pending.', action: 'Open datasets', to: '/datasets'},
      {title: 'Prepare comparison report', requirement: 'Compare algorithms on shared datasets and create an auditable report.', action: 'Open experiments', to: '/experiments'},
    ],
    statusLiterature: (count: number) => `${count} records are stored; relevance, year, and venue screening continues.`,
    statusReading: (submitted: number, expected: number) => `${submitted}/${expected} first-briefing submissions are recorded.`,
    statusReproduction: 'No verifiable reproduction result is recorded.', statusDataset: 'Dataset download status is not recorded.', statusExperiment: 'No real comparison result is recorded.',
    footerNote: 'All counts come from the repository; missing readings, downloads, reproductions, and results are never filled with examples.',
  },
} as const;

export default function Home(): React.ReactElement {
  const {siteConfig, i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const stats = useWorkbenchStats();
  const now = new Date();
  const firstReport = getWeeklyReportAt(0, now);
  const nextReport = getWeeklyReportAt(getNextWeeklyReportIndex(now), now);
  const systemImage = useBaseUrl('/research/compressor-system/overview/encoder-decoder-system.svg');
  const annualRows = lang === 'en' ? ANNUAL_PLAN_ROWS_EN : ANNUAL_PLAN_ROWS;
  const ganttTasks = lang === 'en' ? GANTT_TASKS_EN : GANTT_TASKS;
  const currentMonth = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentPlanIndex = Math.max(0, annualRows.findIndex((row) => row.month === currentMonth));
  const currentPlan = annualRows[currentPlanIndex];
  const nextPlan = annualRows[Math.min(annualRows.length - 1, currentPlanIndex + 1)];
  const visiblePlanRows = annualRows.slice(Math.max(0, currentPlanIndex - 1), Math.min(annualRows.length, currentPlanIndex + 3));
  const daysToNextReport = Math.max(0, Math.ceil((Date.parse(`${nextReport.date}T14:30:00+08:00`) - now.getTime()) / 86400000));
  const literatureProgress = Math.min(100, Math.round((stats.totalLit / 80) * 100));
  const reportProgress = Math.min(100, Math.round((firstReport.submissions.length / firstReport.expectedSubmissionCount) * 100));
  const assetBase = stripLocaleFromBaseUrl(siteConfig.baseUrl).replace(/\/$/, '');
  const submittedNames = firstReport.submissions.map((item) => lang === 'zh' ? item.presenterZh : item.presenterEn).join('、');
  const taskStatuses = [
    copy.statusLiterature(stats.totalLit),
    copy.statusReading(firstReport.submissions.length, firstReport.expectedSubmissionCount),
    copy.statusReproduction,
    copy.statusDataset,
    copy.statusExperiment,
  ];
  const requirementRows = copy.tasks.map((task, index) => {
    const schedule = REQUIREMENT_SCHEDULES[index];
    let state = getTimedRequirementState(now, schedule.start, schedule.end);
    let stateLabel = getRequirementStateLabel(state, copy);
    if (index === 0 && stats.totalLit > 0) {
      state = stats.totalLit >= 80 ? 'complete' : 'active';
      stateLabel = stats.totalLit >= 80 ? copy.stateTargetMet : copy.stateActive;
    }
    if (index === 1 && firstReport.submissions.length > 0) {
      const complete = firstReport.submissions.length >= firstReport.expectedSubmissionCount;
      state = complete ? 'complete' : 'active';
      stateLabel = complete ? copy.stateComplete : copy.statePartial;
    }
    return {
      ...task,
      detail: taskStatuses[index],
      plan: formatPlanWindow(schedule.start, schedule.end),
      state,
      stateLabel,
      updateText: schedule.update === 'biweekly' ? copy.updates.biweekly(formatShortDate(nextReport.date, lang)) : copy.updates[schedule.update],
    };
  });

  return (
    <Layout title={copy.layoutTitle} description={copy.description}>
      <WorkbenchShell pageTitle={copy.layoutTitle}>
        <div className={styles.page} data-wallpaper-readable="home">
          <header className={styles.hero}>
            <ManagedPageSection
              pageKey="home"
              sectionKey={lang === 'en' ? 'hero-en' : 'hero-zh'}
              label={lang === 'en' ? 'homepage title, text and image' : '首页标题、正文与图片'}
              fallback={{title: copy.title, content: copy.lede, imageUrl: systemImage, imageAlt: copy.visualTitle}}
            >
              {(managedHero) => <>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>{copy.heroLabel}</span>
              <h1>{managedHero.title}</h1>
              <p className={styles.lede}>{managedHero.content}</p>
              <div className={styles.objective}><Target size={18} /><div><span>{copy.objectiveLabel}</span><strong>{copy.objective}</strong></div></div>
              <div className={styles.heroActions}>
                <Link className={styles.primaryAction} to="/library"><BookOpen size={16} />{copy.library}</Link>
                <Link className={styles.secondaryAction} to="/algorithm-board"><Layers3 size={16} />{copy.systemMap}</Link>
                <button type="button" className={styles.iconAction} onClick={() => (window as {__openCommandPalette__?: () => void}).__openCommandPalette__?.()} title={copy.search} aria-label={copy.search}><Search size={17} /></button>
              </div>
            </div>
            <figure className={styles.systemFigure}>
              <div><span>{copy.visualTitle}</span><strong>ENCODE → BITSTREAM → DECODE</strong></div>
              <img src={managedHero.imageUrl ?? systemImage} alt={managedHero.imageAlt ?? copy.visualTitle} />
              <figcaption>{copy.visualCaption}</figcaption>
            </figure>
              </>}
            </ManagedPageSection>
          </header>

          <section className={styles.metrics} aria-label={copy.focusLabel}>
            <Metric icon={<BookOpen size={17} />} value={String(stats.totalLit)} label={copy.metricLiterature} detail={copy.metricLiteratureDetail(stats.totalLit)} progress={literatureProgress} />
            <Metric icon={<Layers3 size={17} />} value={String(algorithmModules.length)} label={copy.metricModules} detail={copy.metricModulesDetail} />
            <Metric icon={<FileText size={17} />} value={`${firstReport.submissions.length}/${firstReport.expectedSubmissionCount}`} label={copy.metricReports} detail={copy.metricReportsDetail(firstReport.submissions.length, firstReport.expectedSubmissionCount)} progress={reportProgress} />
            <Metric icon={<CalendarDays size={17} />} value={formatShortDate(nextReport.date, lang)} label={copy.metricNext} detail={copy.metricNextDetail(daysToNextReport)} />
          </section>

          <section className={styles.focusSection}>
            <SectionHeading index="01" label={copy.focusLabel} title={copy.focusTitle} body={copy.focusBody} />
            <div className={styles.focusBand}>
              <article data-tone="active"><span>{copy.now}</span><h3>{copy.currentPhase} · {currentPlan.month}</h3><p>{currentPlan.mainTasks}</p></article>
              <article data-tone="next"><span>{copy.next}</span><h3>{copy.nextBriefing} · {formatDate(nextReport.date, lang)}</h3><p>{nextPlan.mainTasks}</p><Link to={`/weekly-reports?report=${nextReport.id}`}>{copy.open}<ArrowRight size={14} /></Link></article>
              <article data-tone="risk"><span>{copy.risk}</span><h3>{lang === 'zh' ? '数据与实验条件' : 'Data and experiment readiness'}</h3><p>{copy.pendingDataset}</p><Link to="/datasets">{copy.open}<ArrowRight size={14} /></Link></article>
            </div>
          </section>

          <section className={styles.outputsSection}>
            <SectionHeading index="02" label={copy.outputsLabel} title={copy.outputsTitle} body={copy.outputsBody} />
            <div className={styles.outputGrid}>
              <article><span className={styles.outputIcon}><Database size={20} /></span><div><span>{stats.totalLit} RECORDS</span><h3>{copy.evidenceLibrary}</h3><p>{copy.evidenceLibraryBody}</p></div><Link to="/map">{copy.open}<ArrowRight size={14} /></Link></article>
              <article><span className={styles.outputIcon}><FileText size={20} /></span><div><span>{firstReport.submissions.length}/{firstReport.expectedSubmissionCount} ARCHIVED</span><h3>{copy.evidenceBriefing}</h3><p>{copy.evidenceBriefingBody(submittedNames)}</p><div className={styles.fileLinks}>{firstReport.submissions.flatMap((submission) => [<a key={submission.pdfPath} href={`${assetBase}/${submission.pdfPath}`}>PDF</a>, <a key={submission.pptxPath} href={`${assetBase}/${submission.pptxPath}`}>PPTX</a>])}</div></div><Link to={`/weekly-reports?report=${firstReport.id}`}>{copy.open}<ArrowRight size={14} /></Link></article>
              <article data-incomplete="true"><span className={styles.outputIcon}><FlaskConical size={20} /></span><div><span>VERIFICATION PENDING</span><h3>{copy.evidenceExperiment}</h3><p>{copy.evidenceExperimentBody}</p></div><Link to="/experiments">{copy.open}<ArrowRight size={14} /></Link></article>
            </div>
          </section>

          <section className={styles.planSection}>
            <SectionHeading index="03" label={copy.planLabel} title={copy.planTitle} body={copy.planBody} />
            <div className={styles.planTimeline}>
              {visiblePlanRows.map((row) => (
                <article key={row.month} data-current={row.month === currentMonth}>
                  <header><span>{row.month}</span>{row.month === currentMonth ? <em>{copy.currentMonth}</em> : null}</header>
                  <h3>{row.position}</h3><p>{row.mainTasks}</p><footer><span>{copy.deliverable}</span><strong>{row.deliverables}</strong></footer>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.ganttSection}>
            <SectionHeading index="04" label={copy.ganttLabel} title={copy.ganttTitle} body={copy.ganttBody} />
            <div className={styles.homeGanttFrame}>
              <header><span>PROJECT / 2026.07–2027.06</span><Link to="/project-overview">{copy.openAnnualPlan}<ArrowRight size={14} /></Link></header>
              <HomeGantt tasks={ganttTasks} currentMonth={currentMonth} taskLabel={copy.ganttTask} />
            </div>
          </section>

          <section className={styles.scopeSection}>
            <SectionHeading index="05" label={copy.scopeLabel} title={copy.scopeTitle} body={copy.scopeBody} />
            <div className={styles.scopeRows}>{copy.objects.map((item) => <div key={item.group}><strong>{item.group}</strong><span>{item.items}</span><em>{item.status}</em></div>)}</div>
          </section>

          <section className={styles.detailSection}>
            <SectionHeading index="06" label={copy.detailLabel} title={copy.detailTitle} body={copy.detailBody} />
            <details className={styles.detailDisclosure}>
              <summary>{copy.requirementsSummary}<ArrowRight size={16} /></summary>
              <div className={styles.dataTableWrap}><table className={styles.requirementsTable}><thead><tr>{copy.requirementsHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{requirementRows.map((task, index) => <tr key={task.title} data-state={task.state}><td className={styles.rowNumber}>{String(index + 1).padStart(2, '0')}</td><td className={styles.requirementCell}><strong>{task.title}</strong><p>{task.requirement}</p></td><td className={styles.planCell}><span>{copy.planWindow}</span><strong>{task.plan}</strong></td><td className={styles.statusCell}><span data-state={task.state}>{task.stateLabel}</span><p>{task.detail}</p></td><td className={styles.updateCell}>{task.updateText}</td><td className={styles.actionCell}><Link to={task.to}>{task.action}<ArrowRight size={14} /></Link></td></tr>)}</tbody></table></div>
            </details>
            <details className={styles.detailDisclosure}>
              <summary>{copy.annualSummary}<ArrowRight size={16} /></summary>
              <div className={styles.dataTableWrap}><table className={styles.annualPlanTable}><thead><tr>{copy.annualHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{annualRows.map((row) => <tr key={row.month} data-current={row.month === currentMonth}><td><strong>{row.month}</strong></td><td>{row.position}</td><td>{row.mainTasks}</td><td>{row.achievementTasks}</td><td>{row.deliverables}</td></tr>)}</tbody></table></div>
            </details>
          </section>

          <footer className={styles.pageFooter}><CheckCircle2 size={16} /><span>{copy.footerNote}</span></footer>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function Metric({icon, value, label, detail, progress}: {icon: React.ReactNode; value: string; label: string; detail: string; progress?: number}): React.ReactElement {
  return <article className={styles.metric}><span className={styles.metricIcon}>{icon}</span><div><strong>{value}</strong><span>{label}</span><p>{detail}</p>{typeof progress === 'number' ? <i><b style={{width: `${progress}%`}} /></i> : null}</div></article>;
}

function HomeGantt({tasks, currentMonth, taskLabel}: {tasks: readonly GanttTask[]; currentMonth: string; taskLabel: string}): React.ReactElement {
  return <div className={styles.ganttWrap}><div className={styles.ganttMonths}><span>{taskLabel}</span>{YEAR_MONTHS.map((month) => <b key={month} data-current={month === currentMonth}>{month.replace('20', '')}</b>)}</div>{tasks.map((task) => { const start = getMonthIndex(task.start); const end = getMonthIndex(task.end); return <div className={styles.ganttRow} key={task.id}><div className={styles.ganttLabel}><strong>{task.name}</strong><span>{task.track}</span></div><div className={styles.ganttGrid}><div className={styles.ganttBar} data-tone={task.tone} style={{gridColumn: `${start + 1} / ${end + 2}`}} title={`${task.name}\n${task.start}–${task.end}\n${task.deliverable}`}><span>{task.start}–{task.end}</span></div></div></div>;})}</div>;
}

function getMonthIndex(month: string): number { const index = YEAR_MONTHS.indexOf(month as (typeof YEAR_MONTHS)[number]); return index >= 0 ? index : 0; }

function getTimedRequirementState(now: Date, start: string, end: string): RequirementState {
  const current = now.getTime(); const startAt = Date.parse(`${start}T00:00:00+08:00`); const endAt = Date.parse(`${end}T23:59:59+08:00`); const reviewEndsAt = endAt + 7 * 86400000;
  if (current < startAt) return 'scheduled'; if (current <= endAt) return 'active'; if (current <= reviewEndsAt) return 'review'; return 'overdue';
}

function getRequirementStateLabel(state: RequirementState, copy: typeof COPY.zh | typeof COPY.en): string {
  return {complete: copy.stateComplete, active: copy.stateActive, scheduled: copy.stateScheduled, review: copy.stateReview, overdue: copy.stateOverdue}[state];
}

function formatPlanWindow(start: string, end: string): string {
  const [startYear, startMonth, startDay] = start.split('-'); const [endYear, endMonth, endDay] = end.split('-'); const endLabel = startYear === endYear ? `${endMonth}.${endDay}` : `${endYear}.${endMonth}.${endDay}`; return `${startYear}.${startMonth}.${startDay}–${endLabel}`;
}

function SectionHeading({index, label, title, body}: {index: string; label: string; title: string; body: string}): React.ReactElement {
  return <header className={styles.sectionHeading}><span className={styles.sectionNumber}>{index}</span><div><span className={styles.sectionLabel}>{label}</span><h2>{title}</h2><p>{body}</p></div></header>;
}

function formatDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'}).format(new Date(`${date}T12:00:00+08:00`));
}
function formatShortDate(date: string, lang: Lang): string { return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {month: '2-digit', day: '2-digit'}).format(new Date(`${date}T12:00:00+08:00`)); }
function stripLocaleFromBaseUrl(baseUrl: string): string { return baseUrl.replace(/\/en\/?$/, '/'); }
