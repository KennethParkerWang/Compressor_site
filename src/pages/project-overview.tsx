import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  LayoutList,
  PackageCheck,
  Rows3,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  ACHIEVEMENT_PLAN_ROWS,
  ANNUAL_PLAN_ROWS,
  CONTRACT_METRIC_ROWS,
  GANTT_TASKS,
  MILESTONE_ROWS,
  PROJECT_METRICS,
  PROJECT_OVERVIEW,
  PROJECT_ROUTE_STEPS,
  QUICK_ANCHORS,
  RISK_ROWS,
  SECTION_ICONS,
  YEAR_MONTHS,
  type AchievementType,
  type MetricStatus,
  type ProjectPlanTone,
} from '../data/projectAnnualPlan';
import {
  ACHIEVEMENT_PLAN_ROWS_EN,
  ANNUAL_PLAN_ROWS_EN,
  CONTRACT_METRIC_ROWS_EN,
  GANTT_TASKS_EN,
  MILESTONE_ROWS_EN,
  PROJECT_METRICS_EN,
  PROJECT_OVERVIEW_EN,
  PROJECT_ROUTE_STEPS_EN,
  QUICK_ANCHORS_EN,
  RISK_ROWS_EN,
} from '../data/projectAnnualPlan.en';
import styles from './project-overview.module.css';

const TONE_CLASS: Record<ProjectPlanTone, string> = {
  research: styles.toneResearch,
  data: styles.toneData,
  model: styles.toneModel,
  experiment: styles.toneExperiment,
  achievement: styles.toneAchievement,
  delivery: styles.toneDelivery,
  risk: styles.toneRisk,
};

const TONE_LABEL: Record<'zh' | 'en', Record<ProjectPlanTone, string>> = {
  zh: {
    research: '文献调研',
    data: '数据与复现',
    model: '算法研发',
    experiment: '实验优化',
    achievement: '成果沉淀',
    delivery: '验收交付',
    risk: '风险缓冲',
  },
  en: {
    research: 'Literature Review',
    data: 'Data & Reproduction',
    model: 'Algorithm R&D',
    experiment: 'Experiment Optimization',
    achievement: 'Research Outputs',
    delivery: 'Acceptance Delivery',
    risk: 'Risk Buffer',
  },
};

const ACHIEVEMENT_FILTERS: Record<'zh' | 'en', Array<{value: AchievementType | 'all'; label: string}>> = {
  zh: [
    {value: 'all', label: '全部成果'},
    {value: 'review', label: '综述论文'},
    {value: 'paper', label: '研究论文'},
    {value: 'patent', label: '专利'},
    {value: 'engineering', label: '工程交付'},
  ],
  en: [
    {value: 'all', label: 'All outputs'},
    {value: 'review', label: 'Survey'},
    {value: 'paper', label: 'Research papers'},
    {value: 'patent', label: 'Patents'},
    {value: 'engineering', label: 'Engineering'},
  ],
};

const PAGE_COPY = {
  zh: {
    layoutTitle: '项目年度研发计划',
    heroKicker: '年度研发计划',
    routeLabel: '项目路线',
    summaryAria: '项目摘要',
    period: '项目周期',
    acceptance: '验收时间',
    dualTrack: '主线结构',
    dualTrackValue: '技术研发 + 成果沉淀',
    calendar: '日程视图',
    tasks: '任务看板',
    copied: '已复制',
    copyPlan: '复制计划',
    detailMode: '详细版',
    compactMode: '精简版',
    detailHint: '展示完整年度表、成果表、指标、甘特图、里程碑与风险',
    compactHint: '展示汇报版关键主线、节点、指标和风险摘要',
    anchorAria: '页面快速跳转',
    metricsAria: '项目概览指标',
    routeTitle: '项目总体路线',
    routeBadge: '技术研发与成果沉淀并行推进',
    annualTitle: '年度研发进度总表',
    allMonths: '全部月份',
    annualHeaders: ['时间阶段', '阶段定位', '主要研发任务', '成果沉淀任务', '阶段交付物'],
    currentStage: '当前阶段',
    outputsTitle: '成果产出推进表',
    metricTitle: '合同考核指标完成时间表',
    metricHeaders: ['考核指标', '目标要求', '完成时间', '验证方式', '证据材料', '状态'],
    ganttTitle: '甘特图式任务安排',
    ganttNote: '悬停任务条查看交付物',
    milestonesTitle: '阶段里程碑与交付物',
    risksTitle: '风险与缓冲安排',
    compactTitle: '精简版总览',
    compactSubtitle: '用于快速汇报的项目主线、关键节点、验收指标和风险摘要。',
    compactTechTrack: '技术研发主线',
    compactOutputTrack: '成果沉淀主线',
    compactAcceptanceFocus: '验收关注点',
    compactRiskFocus: '主要风险缓冲',
    compactMilestoneTitle: 'M1–M6 关键节点',
    compactAnchors: ['精简总览', '关键节点', '指标验收', '风险应对'],
    routeEyebrow: '双主线路线图',
    annualEyebrow: '年度进度表',
    outputsEyebrow: '成果产出',
    metricsEyebrow: '验收指标',
    ganttEyebrow: '甘特安排',
    milestonesEyebrow: '里程碑',
    risksEyebrow: '风险缓冲',
    compactEyebrow: '精简视图',
    maintenanceEyebrow: '计划维护',
    start: '启动时间',
    midNode: '中期节点',
    finish: '计划完成',
    approach: '推进方式',
    output: '阶段产物',
    highRisk: '高风险',
    mediumRisk: '中风险',
    lowRisk: '低风险',
    trigger: '触发条件',
    impact: '影响范围',
    buffer: '缓冲安排',
    owner: '责任角色',
    maintenanceTitle: '计划维护说明',
    maintenance:
      '年度计划、成果推进、合同指标、甘特任务、里程碑和风险条目统一维护在',
    maintenanceTail: '。页面只负责展示和筛选，避免计划内容散落在组件中。',
    library: '文献库',
    experiments: '实验台',
    backAnnual: '返回年度计划',
    markdown: {
      route: '项目路线',
      annual: '年度研发进度',
      main: '主要研发任务',
      achievement: '成果沉淀任务',
      deliverable: '阶段交付物',
      outputs: '成果产出推进',
      milestone: '里程碑',
      started: '启动',
      planned: '计划完成',
      outputPrefix: '阶段产物',
    },
    status: {
      未开始: '未开始',
      进行中: '进行中',
      已完成: '已完成',
      风险中: '风险中',
    } satisfies Record<MetricStatus, string>,
  },
  en: {
    layoutTitle: 'Annual R&D Plan',
    heroKicker: 'Annual R&D Plan',
    routeLabel: 'Project Route',
    summaryAria: 'Project summary',
    period: 'Project Period',
    acceptance: 'Acceptance',
    dualTrack: 'Workstream Structure',
    dualTrackValue: 'Technical R&D + Research Outputs',
    calendar: 'Schedule',
    tasks: 'Task Board',
    copied: 'Copied',
    copyPlan: 'Copy Plan',
    detailMode: 'Detailed',
    compactMode: 'Compact',
    detailHint: 'Show full annual table, output schedule, metrics, Gantt chart, milestones, and risks',
    compactHint: 'Show presentation-ready tracks, milestones, metrics, and risk summary',
    anchorAria: 'Page quick navigation',
    metricsAria: 'Project overview metrics',
    routeTitle: 'Overall Project Roadmap',
    routeBadge: 'Technical R&D and research outputs proceed in parallel',
    annualTitle: 'Annual R&D Progress Table',
    allMonths: 'All months',
    annualHeaders: ['Period', 'Stage Positioning', 'Main R&D Tasks', 'Output Accumulation Tasks', 'Stage Deliverables'],
    currentStage: 'Current stage',
    outputsTitle: 'Research Output Schedule',
    metricTitle: 'Contract Metric Completion Schedule',
    metricHeaders: ['Metric', 'Target', 'Planned Time', 'Verification Method', 'Evidence', 'Status'],
    ganttTitle: 'Gantt-Style Task Schedule',
    ganttNote: 'Hover task bars to view deliverables',
    milestonesTitle: 'Milestones and Deliverables',
    risksTitle: 'Risks and Buffer Arrangements',
    compactTitle: 'Compact Overview',
    compactSubtitle: 'A presentation-ready summary of project tracks, key milestones, acceptance metrics, and risk buffers.',
    compactTechTrack: 'Technical R&D Track',
    compactOutputTrack: 'Research Output Track',
    compactAcceptanceFocus: 'Acceptance Focus',
    compactRiskFocus: 'Main Risk Buffers',
    compactMilestoneTitle: 'M1–M6 Key Milestones',
    compactAnchors: ['Compact Overview', 'Milestones', 'Metrics', 'Risks'],
    routeEyebrow: 'Dual-Track Roadmap',
    annualEyebrow: 'Annual Progress',
    outputsEyebrow: 'Research Outputs',
    metricsEyebrow: 'Acceptance Metrics',
    ganttEyebrow: 'Gantt Schedule',
    milestonesEyebrow: 'Milestones',
    risksEyebrow: 'Risk Buffers',
    compactEyebrow: 'Compact View',
    maintenanceEyebrow: 'Plan Maintenance',
    start: 'Start',
    midNode: 'Midpoint',
    finish: 'Planned Completion',
    approach: 'Execution Method',
    output: 'Stage Outputs',
    highRisk: 'High Risk',
    mediumRisk: 'Medium Risk',
    lowRisk: 'Low Risk',
    trigger: 'Trigger',
    impact: 'Impact',
    buffer: 'Buffer Plan',
    owner: 'Owner',
    maintenanceTitle: 'Plan Maintenance',
    maintenance:
      'Annual plan, output schedule, contract metrics, Gantt tasks, milestones, and risks are maintained in',
    maintenanceTail: '. The page is responsible only for presentation and filtering, so plan content does not scatter across components.',
    library: 'Library',
    experiments: 'Experiments',
    backAnnual: 'Back to Annual Plan',
    markdown: {
      route: 'Project Route',
      annual: 'Annual R&D Progress',
      main: 'Main R&D tasks',
      achievement: 'Output accumulation tasks',
      deliverable: 'Stage deliverables',
      outputs: 'Research Output Schedule',
      milestone: 'Milestones',
      started: 'starts',
      planned: 'planned completion',
      outputPrefix: 'Stage outputs',
    },
    status: {
      未开始: 'Not Started',
      进行中: 'In Progress',
      已完成: 'Completed',
      风险中: 'At Risk',
    } satisfies Record<MetricStatus, string>,
  },
};

const STATUS_CLASS: Record<MetricStatus, string> = {
  未开始: styles.statusTodo,
  进行中: styles.statusDoing,
  已完成: styles.statusDone,
  风险中: styles.statusRisk,
};

const CURRENT_DATE = new Date();
const CURRENT_MONTH = `${CURRENT_DATE.getFullYear()}.${String(CURRENT_DATE.getMonth() + 1).padStart(2, '0')}`;

function getMonthIndex(month: string): number {
  const index = YEAR_MONTHS.indexOf(month);
  return index >= 0 ? index : 0;
}

function buildMarkdownPlan({
  project,
  annualRows,
  achievementRows,
  milestoneRows,
  copy,
}: {
  project: typeof PROJECT_OVERVIEW;
  annualRows: typeof ANNUAL_PLAN_ROWS;
  achievementRows: typeof ACHIEVEMENT_PLAN_ROWS;
  milestoneRows: typeof MILESTONE_ROWS;
  copy: typeof PAGE_COPY.zh;
}): string {
  const annual = annualRows
    .map((row) => `### ${row.month} ${row.position}
- ${copy.markdown.main}: ${row.mainTasks}
- ${copy.markdown.achievement}: ${row.achievementTasks}
- ${copy.markdown.deliverable}: ${row.deliverables}`)
    .join('\n\n');

  const achievements = achievementRows
    .map((row) => `- ${row.name}: ${row.start} ${copy.markdown.started}; ${row.finish} ${copy.markdown.planned}. ${copy.markdown.outputPrefix}: ${row.outputs}`)
    .join('\n');

  const milestones = milestoneRows
    .map((row) => `- ${row.id} ${row.title} (${row.time}): ${row.deliverables.join(', ')}`)
    .join('\n');

  return `# ${project.title}

${project.subtitle}

## ${copy.markdown.route}
${project.route}

## ${copy.markdown.annual}
${annual}

## ${copy.markdown.outputs}
${achievements}

## ${copy.markdown.milestone}
${milestones}
`;
}

export default function ProjectOverviewPage(): React.ReactElement {
  const location = useLocation();
  const isEnglishLocale = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const lang: 'zh' | 'en' = isEnglishLocale ? 'en' : 'zh';
  const copy = PAGE_COPY[lang];
  const toneLabel = TONE_LABEL[lang];
  const project = isEnglishLocale ? PROJECT_OVERVIEW_EN : PROJECT_OVERVIEW;
  const metrics = isEnglishLocale ? PROJECT_METRICS_EN : PROJECT_METRICS;
  const routeSteps = isEnglishLocale ? PROJECT_ROUTE_STEPS_EN : PROJECT_ROUTE_STEPS;
  const annualPlanRows = isEnglishLocale ? ANNUAL_PLAN_ROWS_EN : ANNUAL_PLAN_ROWS;
  const achievementPlanRows = isEnglishLocale ? ACHIEVEMENT_PLAN_ROWS_EN : ACHIEVEMENT_PLAN_ROWS;
  const contractMetricRows = isEnglishLocale ? CONTRACT_METRIC_ROWS_EN : CONTRACT_METRIC_ROWS;
  const ganttTasks = isEnglishLocale ? GANTT_TASKS_EN : GANTT_TASKS;
  const milestoneRows = isEnglishLocale ? MILESTONE_ROWS_EN : MILESTONE_ROWS;
  const riskRows = isEnglishLocale ? RISK_ROWS_EN : RISK_ROWS;
  const quickAnchors = isEnglishLocale ? QUICK_ANCHORS_EN : QUICK_ANCHORS;
  const achievementFilters = ACHIEVEMENT_FILTERS[lang];
  const [monthFilter, setMonthFilter] = useState<'all' | string>('all');
  const [achievementFilter, setAchievementFilter] = useState<AchievementType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'detail' | 'compact'>('detail');
  const [copied, setCopied] = useState(false);
  const isCompact = viewMode === 'compact';

  const annualRows = useMemo(
    () => monthFilter === 'all' ? annualPlanRows : annualPlanRows.filter((row) => row.month === monthFilter),
    [annualPlanRows, monthFilter],
  );

  const achievementRows = useMemo(
    () => achievementFilter === 'all' ? achievementPlanRows : achievementPlanRows.filter((row) => row.type === achievementFilter),
    [achievementFilter, achievementPlanRows],
  );

  const anchors = isCompact
    ? [
      {id: 'compact-overview', label: copy.compactAnchors[0], icon: SECTION_ICONS.route},
      {id: 'milestones', label: copy.compactAnchors[1], icon: SECTION_ICONS.milestones},
      {id: 'contract-metrics', label: copy.compactAnchors[2], icon: SECTION_ICONS.metrics},
      {id: 'risks', label: copy.compactAnchors[3], icon: SECTION_ICONS.risks},
    ]
    : quickAnchors;

  async function handleCopyPlan(): Promise<void> {
    const text = buildMarkdownPlan({
      project,
      annualRows: annualPlanRows,
      achievementRows: achievementPlanRows,
      milestoneRows,
      copy,
    });
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Layout title={project.title} description={project.subtitle}>
      <WorkbenchShell pageTitle={copy.layoutTitle}>
        <main className={styles.page}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.kicker}>{copy.heroKicker}</span>
              <h2>{project.title}</h2>
              <p className={styles.subtitle}>{project.subtitle}</p>
              <div className={styles.routeLine}>
                <span>{copy.routeLabel}</span>
                <p>{project.route}</p>
              </div>
            </div>
            <aside className={styles.heroAside} aria-label={copy.summaryAria}>
              <div>
                <span>{copy.period}</span>
                <strong>{project.period}</strong>
              </div>
              <div>
                <span>{copy.acceptance}</span>
                <strong>{project.acceptance}</strong>
              </div>
              <div>
                <span>{copy.dualTrack}</span>
                <strong>{copy.dualTrackValue}</strong>
              </div>
              <div className={styles.heroActions}>
                <div className={styles.viewToggle} role="group" aria-label={isEnglishLocale ? 'View mode' : '视图模式'}>
                  <button
                    type="button"
                    className={viewMode === 'detail' ? styles.viewToggleOn : undefined}
                    onClick={() => setViewMode('detail')}
                    title={copy.detailHint}
                  >
                    <LayoutList size={14} />
                    {copy.detailMode}
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'compact' ? styles.viewToggleOn : undefined}
                    onClick={() => setViewMode('compact')}
                    title={copy.compactHint}
                  >
                    <Rows3 size={14} />
                    {copy.compactMode}
                  </button>
                </div>
                <Link to="/calendar" className={styles.actionBtn}>
                  <CalendarDays size={14} />
                  {copy.calendar}
                </Link>
                <Link to="/tasks" className={styles.actionBtn}>
                  <ClipboardCheck size={14} />
                  {copy.tasks}
                </Link>
                <button type="button" className={styles.actionBtn} onClick={handleCopyPlan}>
                  <Copy size={14} />
                  {copied ? copy.copied : copy.copyPlan}
                </button>
              </div>
            </aside>
          </section>

          <nav className={styles.anchorNav} aria-label={copy.anchorAria}>
            {anchors.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.id} href={`#${item.id}`}>
                  <Icon size={14} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <section className={styles.metricGrid} aria-label={copy.metricsAria}>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article key={metric.label} className={`${styles.metricCard} ${TONE_CLASS[metric.tone]}`}>
                  <div className={styles.metricIcon}><Icon size={17} /></div>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </article>
              );
            })}
          </section>

          <section className={styles.panel} id="route">
            <PanelTitle
              eyebrow={copy.routeEyebrow}
              title={copy.routeTitle}
              icon={SECTION_ICONS.route}
              action={<span className={styles.routeBadge}>{copy.routeBadge}</span>}
            />
            <div className={styles.routeMap}>
              {routeSteps.map((step, index) => (
                <React.Fragment key={step.label}>
                  <div className={`${styles.routeStep} ${TONE_CLASS[step.tone]}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{step.label}</strong>
                    <p>{step.detail}</p>
                  </div>
                  {index < routeSteps.length - 1 ? <ArrowRight className={styles.routeArrow} size={16} /> : null}
                </React.Fragment>
              ))}
            </div>
          </section>

          {isCompact ? (
            <CompactProjectView
              copy={copy}
              lang={lang}
              toneLabel={toneLabel}
              annualRows={annualPlanRows}
              contractRows={contractMetricRows}
              milestoneRows={milestoneRows}
              riskRows={riskRows}
            />
          ) : (
            <>
          <section className={styles.panel} id="annual-plan">
            <PanelTitle
              eyebrow={copy.annualEyebrow}
              title={copy.annualTitle}
              icon={SECTION_ICONS.annual}
              action={(
                <label className={styles.filterSelect}>
                  <Filter size={13} />
                  <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
                    <option value="all">{copy.allMonths}</option>
                    {YEAR_MONTHS.map((month) => <option key={month} value={month}>{month}</option>)}
                  </select>
                </label>
              )}
            />
            <div className={styles.annualTable}>
              <div className={styles.annualHead}>
                {copy.annualHeaders.map((header) => <span key={header}>{header}</span>)}
              </div>
              {annualRows.map((row) => (
                <article key={row.month} className={styles.annualRow}>
                  <div className={styles.monthCell}>
                    <span className={`${styles.monthPill} ${TONE_CLASS[row.tone]}`}>{row.month}</span>
                    {row.month === CURRENT_MONTH ? <em>{copy.currentStage}</em> : null}
                  </div>
                  <div className={styles.positionCell}>
                    <b>{row.position}</b>
                    <span className={`${styles.typeBadge} ${TONE_CLASS[row.tone]}`}>{toneLabel[row.tone]}</span>
                  </div>
                  <p>{row.mainTasks}</p>
                  <p>{row.achievementTasks}</p>
                  <p>{row.deliverables}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} id="achievements">
            <PanelTitle
              eyebrow={copy.outputsEyebrow}
              title={copy.outputsTitle}
              icon={SECTION_ICONS.achievements}
              action={(
                <div className={styles.segmented}>
                  {achievementFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={achievementFilter === filter.value ? styles.segmentOn : undefined}
                      onClick={() => setAchievementFilter(filter.value)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            />
            <div className={styles.achievementGrid}>
              {achievementRows.map((row) => (
                <article key={row.name} className={`${styles.achievementCard} ${styles[`achievement${row.type}` as keyof typeof styles] ?? ''}`}>
                  <header>
                    <span>{getAchievementLabel(row.type, lang)}</span>
                    <strong>{row.name}</strong>
                  </header>
                  <dl>
                    <div><dt>{copy.start}</dt><dd>{row.start}</dd></div>
                    <div><dt>{copy.midNode}</dt><dd>{row.midNode}</dd></div>
                    <div><dt>{copy.finish}</dt><dd>{row.finish}</dd></div>
                  </dl>
                  <section>
                    <h4>{copy.approach}</h4>
                    <p>{row.approach}</p>
                  </section>
                  <section>
                    <h4>{copy.output}</h4>
                    <p>{row.outputs}</p>
                  </section>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} id="contract-metrics">
            <PanelTitle
              eyebrow={copy.metricsEyebrow}
              title={copy.metricTitle}
              icon={SECTION_ICONS.metrics}
            />
            <div className={styles.metricTable}>
              <div className={styles.metricHead}>
                {copy.metricHeaders.map((header) => <span key={header}>{header}</span>)}
              </div>
              {contractMetricRows.map((row) => (
                <article key={row.metric} className={styles.metricRow}>
                  <b>{row.metric}</b>
                  <p>{row.target}</p>
                  <span>{row.plannedTime}</span>
                  <p>{row.verification}</p>
                  <p>{row.evidence}</p>
                  <span className={`${styles.statusBadge} ${STATUS_CLASS[row.status]}`}>{copy.status[row.status]}</span>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} id="gantt">
            <PanelTitle
              eyebrow={copy.ganttEyebrow}
              title={copy.ganttTitle}
              icon={SECTION_ICONS.gantt}
              action={<span className={styles.tableNote}>{copy.ganttNote}</span>}
            />
            <div className={styles.ganttWrap}>
              <div className={styles.ganttMonths}>
                <span />
                {YEAR_MONTHS.map((month) => (
                  <b key={month} className={month === CURRENT_MONTH ? styles.currentMonth : undefined}>{month.replace('20', '')}</b>
                ))}
              </div>
              {ganttTasks.map((task) => {
                const start = getMonthIndex(task.start);
                const end = getMonthIndex(task.end);
                return (
                  <div key={task.id} className={styles.ganttRow}>
                    <div className={styles.ganttLabel}>
                      <strong>{task.name}</strong>
                      <span>{task.track}</span>
                    </div>
                    <div className={styles.ganttGrid}>
                      <div
                        className={`${styles.ganttBar} ${TONE_CLASS[task.tone]}`}
                        style={{gridColumn: `${start + 1} / ${end + 2}`}}
                        title={`${task.name}\n${task.start}–${task.end}\n${task.deliverable}`}
                      >
                        <span>{task.start}–{task.end}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.panel} id="milestones">
            <PanelTitle
              eyebrow={copy.milestonesEyebrow}
              title={copy.milestonesTitle}
              icon={SECTION_ICONS.milestones}
            />
            <div className={styles.milestoneRail}>
              {milestoneRows.map((item) => (
                <article key={item.id} className={`${styles.milestoneCard} ${TONE_CLASS[item.tone]}`}>
                  <span className={styles.milestoneId}>{item.id}</span>
                  <div>
                    <header>
                      <strong>{item.title}</strong>
                      <em>{item.time}</em>
                    </header>
                    <p>{item.content}</p>
                    <div className={styles.deliverableTags}>
                      {item.deliverables.map((deliverable) => <span key={deliverable}>{deliverable}</span>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} id="risks">
            <PanelTitle
              eyebrow={copy.risksEyebrow}
              title={copy.risksTitle}
              icon={SECTION_ICONS.risks}
            />
            <div className={styles.riskGrid}>
              {riskRows.map((risk) => (
                <article key={risk.risk} className={styles.riskCard} data-level={risk.level}>
                  <header>
                    <span>{getRiskLabel(risk.level, lang, copy)}</span>
                    <strong>{risk.risk}</strong>
                  </header>
                  <dl>
                    <div><dt>{copy.trigger}</dt><dd>{risk.trigger}</dd></div>
                    <div><dt>{copy.impact}</dt><dd>{risk.impact}</dd></div>
                    <div><dt>{copy.buffer}</dt><dd>{risk.buffer}</dd></div>
                    <div><dt>{copy.owner}</dt><dd>{risk.owner}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.footerPanel}>
            <div>
              <span className={styles.kicker}>{copy.maintenanceEyebrow}</span>
              <h2>{copy.maintenanceTitle}</h2>
              <p>
                {copy.maintenance}
                <code>src/data/projectAnnualPlan.ts</code>
                {copy.maintenanceTail}
              </p>
            </div>
            <div className={styles.footerLinks}>
              <Link to="/library"><FileText size={14} /> {copy.library}</Link>
              <Link to="/experiments"><PackageCheck size={14} /> {copy.experiments}</Link>
              <a href="#annual-plan"><ExternalLink size={14} /> {copy.backAnnual}</a>
            </div>
          </section>
            </>
          )}
        </main>
      </WorkbenchShell>
    </Layout>
  );
}

function CompactProjectView({
  copy,
  lang,
  toneLabel,
  annualRows,
  contractRows,
  milestoneRows,
  riskRows,
}: {
  copy: typeof PAGE_COPY.zh;
  lang: 'zh' | 'en';
  toneLabel: Record<ProjectPlanTone, string>;
  annualRows: typeof ANNUAL_PLAN_ROWS;
  contractRows: typeof CONTRACT_METRIC_ROWS;
  milestoneRows: typeof MILESTONE_ROWS;
  riskRows: typeof RISK_ROWS;
}): React.ReactElement {
  const technicalRows = annualRows.filter((row) => ['2026.07', '2026.09', '2026.10', '2026.12', '2027.02', '2027.04', '2027.06'].includes(row.month));
  const outputRows = annualRows.filter((row) => ['2026.07', '2026.10', '2026.12', '2027.02', '2027.04', '2027.05', '2027.06'].includes(row.month));
  const compactMetrics = contractRows.slice(0, 4);
  const compactRisks = riskRows.slice(0, 4);

  return (
    <>
      <section className={styles.panel} id="compact-overview">
        <PanelTitle
          eyebrow={copy.compactEyebrow}
          title={copy.compactTitle}
          icon={SECTION_ICONS.route}
          action={<span className={styles.tableNote}>{copy.compactSubtitle}</span>}
        />
        <div className={styles.compactGrid}>
          <CompactTrack
            title={copy.compactTechTrack}
            rows={technicalRows}
            toneLabel={toneLabel}
            pick="main"
          />
          <CompactTrack
            title={copy.compactOutputTrack}
            rows={outputRows}
            toneLabel={toneLabel}
            pick="achievement"
          />
        </div>
      </section>

      <section className={styles.panel} id="milestones">
        <PanelTitle eyebrow={copy.milestonesEyebrow} title={copy.compactMilestoneTitle} icon={SECTION_ICONS.milestones} />
        <div className={styles.compactMilestones}>
          {milestoneRows.map((item) => (
            <article key={item.id} className={`${styles.compactMilestone} ${TONE_CLASS[item.tone]}`}>
              <span>{item.id}</span>
              <strong>{item.title}</strong>
              <em>{item.time}</em>
              <p>{item.content}</p>
              <div>
                {item.deliverables.slice(0, 4).map((deliverable) => <b key={deliverable}>{deliverable}</b>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel} id="contract-metrics">
        <PanelTitle eyebrow={copy.metricsEyebrow} title={copy.compactAcceptanceFocus} icon={SECTION_ICONS.metrics} />
        <div className={styles.compactMetricList}>
          {compactMetrics.map((row) => (
            <article key={row.metric} className={`${styles.compactMetric} ${TONE_CLASS[row.tone]}`}>
              <header>
                <strong>{row.metric}</strong>
                <span className={`${styles.statusBadge} ${STATUS_CLASS[row.status]}`}>{copy.status[row.status]}</span>
              </header>
              <p>{row.target}</p>
              <dl>
                <div><dt>{lang === 'zh' ? '时间' : 'Time'}</dt><dd>{row.plannedTime}</dd></div>
                <div><dt>{lang === 'zh' ? '证据' : 'Evidence'}</dt><dd>{row.evidence}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel} id="risks">
        <PanelTitle eyebrow={copy.risksEyebrow} title={copy.compactRiskFocus} icon={SECTION_ICONS.risks} />
        <div className={styles.compactRiskList}>
          {compactRisks.map((risk) => (
            <article key={risk.risk} className={styles.compactRisk} data-level={risk.level}>
              <header>
                <span>{getRiskLabel(risk.level, lang, copy)}</span>
                <strong>{risk.risk}</strong>
              </header>
              <p>{risk.buffer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function CompactTrack({
  title,
  rows,
  toneLabel,
  pick,
}: {
  title: string;
  rows: typeof ANNUAL_PLAN_ROWS;
  toneLabel: Record<ProjectPlanTone, string>;
  pick: 'main' | 'achievement';
}): React.ReactElement {
  return (
    <article className={styles.compactTrack}>
      <h3>{title}</h3>
      <ol>
        {rows.map((row) => (
          <li key={`${title}-${row.month}`} className={TONE_CLASS[row.tone]}>
            <span>{row.month}</span>
            <div>
              <strong>{row.position}</strong>
              <em>{toneLabel[row.tone]}</em>
              <p>{pick === 'main' ? row.mainTasks : row.achievementTasks}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function getAchievementLabel(type: AchievementType, lang: 'zh' | 'en'): string {
  const labels = {
    zh: {review: '综述', paper: '论文', patent: '专利', engineering: '工程'},
    en: {review: 'Survey', paper: 'Paper', patent: 'Patent', engineering: 'Engineering'},
  } satisfies Record<'zh' | 'en', Record<AchievementType, string>>;
  return labels[lang][type];
}

function getRiskLabel(level: '高' | '中' | '低', lang: 'zh' | 'en', copy: typeof PAGE_COPY.zh): string {
  if (lang === 'zh') return `${level}风险`;
  if (level === '高') return copy.highRisk;
  if (level === '中') return copy.mediumRisk;
  return copy.lowRisk;
}

function PanelTitle({
  eyebrow,
  title,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{size?: number}>;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <header className={styles.panelHead}>
      <div className={styles.panelTitle}>
        <span className={styles.panelIcon}><Icon size={16} /></span>
        <div>
          <span className={styles.kicker}>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>
      {action ? <div className={styles.panelAction}>{action}</div> : null}
    </header>
  );
}
