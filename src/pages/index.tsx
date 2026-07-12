import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
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
    layoutTitle: '项目说明与研究索引',
    description: '集中存放项目相关论文、压缩器资料、数据集、实验记录和双周汇报文件。',
    eyebrow: '项目说明',
    title: '无损压缩研究项目',
    lede: '集中存放项目相关论文、压缩器资料、数据集、实验记录和双周汇报文件。页面只展示已经录入的内容；未完成的任务直接标记为待完成。',
    search: '搜索资料',
    library: '进入文献库',
    literatureCount: '文献库条目',
    moduleCount: '系统模块',
    reportCount: '第一期材料',
    nextReport: '下次汇报',
    requirementsLabel: '原始任务',
    requirementsTitle: '项目要求与当前状态',
    requirementsBody: '计划节点预先锁定；页面会按日期自动切换阶段，并依据已录入的论文、汇报和实验材料更新完成状态。',
    requirementsHeaders: ['序号', '项目要求', '计划节点', '当前状态', '更新机制', '入口'],
    stateRecorded: '已有记录',
    statePartial: '部分完成',
    statePending: '待录入',
    stateTargetMet: '数量达标',
    stateComplete: '已完成',
    stateActive: '进行中',
    stateScheduled: '计划中',
    stateReview: '待核验',
    stateOverdue: '已逾期',
    planWindow: '计划周期',
    updates: {
      live: '自动 · 页面加载时',
      biweekly: (date: string) => `自动 · 每 14 天\n下次 ${date}`,
      weekly: '定期 · 每周五核验',
      monthly: '定期 · 每月末核验',
    },
    tasks: [
      {
        title: '搜集项目相关论文',
        requirement: '以顶刊、顶会为主，不少于 80 篇；优先 2025、2026 年文章，同时保留经典算法论文，并支撑综述论文任务。',
        action: '查看文献库',
        to: '/library',
      },
      {
        title: '精读论文并制作汇报 PPT',
        requirement: '每人精读 5–10 篇最相关论文，制作 PPT，并在两周后的项目碰头会上汇报。',
        action: '查看双周汇报',
        to: '/weekly-reports',
      },
      {
        title: '尝试复现相关代码',
        requirement: '争取复现精读论文的相关代码，可借助大模型；复现结果需要保留运行环境、参数和输出。',
        action: '进入实验页',
        to: '/experiments',
      },
      {
        title: '下载约定数据集',
        requirement: '下载 Silesia 和腾讯数据集；腾讯数据集下载链接待提供，数据量过大时再沟通移动硬盘。',
        action: '查看数据集',
        to: '/datasets',
      },
      {
        title: '形成算法对比实验报告',
        requirement: '在下载的数据集上比较不同算法的压缩效果，并尝试整理为实验报告。',
        action: '查看实验记录',
        to: '/experiments',
      },
    ],
    statusLiterature: (count: number) => `文献库当前有 ${count} 条记录；仍需继续筛选相关性、年份和来源级别。`,
    statusReading: (submitted: number, expected: number) => `第一期汇报材料已收到 ${submitted}/${expected} 份；精读篇数尚未统一登记。`,
    statusReproduction: '尚未录入可以核对的代码复现结果。',
    statusDataset: 'Silesia 与腾讯数据集的下载状态尚未登记；腾讯下载链接仍待提供。',
    statusExperiment: '实验页面和记录字段已经建立，但尚未录入真实对比结果。',
    annualLabel: '年度计划',
    annualTitle: '年度研发进度表',
    annualBody: '计划内容与年度计划页使用同一份数据；当前月份会根据系统日期自动高亮。',
    annualHeaders: ['月份', '阶段定位', '主要研发任务', '成果沉淀任务', '阶段交付物'],
    currentMonth: '当前月份',
    ganttLabel: '任务时间轴',
    ganttTitle: '年度项目甘特图',
    ganttBody: '沿用年度计划页的十二个月项目甘特样式；当前月份自动高亮，悬停任务条可查看交付物。',
    openAnnualPlan: '查看完整年度计划',
    ganttTask: '项目任务',
    scopeLabel: '当前整理范围',
    scopeTitle: '目前准备学习和汇报的对象',
    scopeBody: '这些名称来自当前汇报准备清单，只表示已经列入整理范围，不代表已经完成精读、复现或实验。',
    objects: [
      {group: '工程压缩器', items: 'gzip / DEFLATE、xz / LZMA、Zstd', status: '资料整理中'},
      {group: '上下文混合', items: 'PAQ / PAQ8px、cmix', status: '资料整理中'},
      {group: '神经压缩', items: 'NNCP', status: '资料整理中'},
      {group: '数据集', items: 'Silesia、腾讯数据集', status: '链接与下载待确认'},
    ],
    openSystemMap: '查看压缩器系统地图',
    materialsLabel: '实际文件',
    materialsTitle: '已上传材料与待补内容',
    firstReport: '第一期双周汇报',
    submitted: '已提交',
    pendingSubmission: (count: number) => `还有 ${count} 位同学的材料待提交。`,
    noSubmission: '当前没有已提交材料。',
    nextBriefing: '下一次双周汇报',
    datasetPending: '数据集下载链接与本地文件状态尚未登记。',
    pdf: 'PDF',
    pptx: 'PPTX',
    viewReport: '进入汇报页',
    footerNote: '页面数量来自当前仓库；没有录入的论文精读、数据集下载、复现和实验结果不会用示例内容补齐。',
  },
  en: {
    layoutTitle: 'Project Description and Research Index',
    description: 'Project papers, codec references, datasets, experiments, and biweekly briefing files.',
    eyebrow: 'Project description',
    title: 'Lossless Compression Research Project',
    lede: 'A central place for project papers, codec references, datasets, experiment records, and biweekly briefing files. Only recorded material is shown; unfinished work is marked explicitly.',
    search: 'Search material',
    library: 'Open literature library',
    literatureCount: 'Library entries',
    moduleCount: 'System modules',
    reportCount: 'First briefing files',
    nextReport: 'Next briefing',
    requirementsLabel: 'Original tasks',
    requirementsTitle: 'Project requirements and current status',
    requirementsBody: 'Milestones are fixed in advance. The page advances phases by date and uses recorded papers, briefings, and experiment evidence to update completion.',
    requirementsHeaders: ['No.', 'Project requirement', 'Planned window', 'Current status', 'Update rule', 'Entry'],
    stateRecorded: 'Recorded',
    statePartial: 'Partial',
    statePending: 'Pending record',
    stateTargetMet: 'Target met',
    stateComplete: 'Complete',
    stateActive: 'In progress',
    stateScheduled: 'Scheduled',
    stateReview: 'Needs review',
    stateOverdue: 'Overdue',
    planWindow: 'Planned window',
    updates: {
      live: 'Automatic · on page load',
      biweekly: (date: string) => `Automatic · every 14 days\nNext ${date}`,
      weekly: 'Periodic · Friday review',
      monthly: 'Periodic · month-end review',
    },
    tasks: [
      {
        title: 'Collect project-related papers',
        requirement: 'Collect at least 80 papers, prioritizing top venues and 2025–2026 work while retaining classic algorithm papers and supporting the survey task.',
        action: 'Open library',
        to: '/library',
      },
      {
        title: 'Read papers and prepare slides',
        requirement: 'Each person should closely read 5–10 highly relevant papers, prepare slides, and report at the project meeting two weeks later.',
        action: 'Open briefings',
        to: '/weekly-reports',
      },
      {
        title: 'Attempt code reproduction',
        requirement: 'Reproduce code related to the selected papers where possible, keeping the environment, parameters, and outputs.',
        action: 'Open experiments',
        to: '/experiments',
      },
      {
        title: 'Download the agreed datasets',
        requirement: 'Download Silesia and the Tencent dataset. The Tencent download link is still pending; discuss storage hardware if necessary.',
        action: 'Open datasets',
        to: '/datasets',
      },
      {
        title: 'Prepare an algorithm comparison report',
        requirement: 'Compare compression methods on the downloaded datasets and organize the results into an experiment report.',
        action: 'Open experiment records',
        to: '/experiments',
      },
    ],
    statusLiterature: (count: number) => `${count} records are currently stored; relevance, year, and venue screening still needs review.`,
    statusReading: (submitted: number, expected: number) => `${submitted}/${expected} first-briefing submissions are recorded; paper-reading counts are not yet tracked consistently.`,
    statusReproduction: 'No verifiable code reproduction result has been recorded.',
    statusDataset: 'Dataset download status is not recorded; the Tencent download link is still pending.',
    statusExperiment: 'The experiment fields exist, but no real comparison result has been recorded.',
    annualLabel: 'Annual plan',
    annualTitle: 'Annual R&D Progress Table',
    annualBody: 'This table uses the same data as the annual-plan page. The current month is highlighted from the system date.',
    annualHeaders: ['Month', 'Stage positioning', 'Main R&D tasks', 'Output accumulation', 'Deliverables'],
    currentMonth: 'Current month',
    ganttLabel: 'Task timeline',
    ganttTitle: 'Annual Project Gantt Chart',
    ganttBody: 'Uses the annual-plan page\'s twelve-month project Gantt style. The current month is highlighted automatically; hover a bar for its deliverable.',
    openAnnualPlan: 'Open full annual plan',
    ganttTask: 'Project task',
    scopeLabel: 'Current scope',
    scopeTitle: 'Methods currently listed for study and briefing',
    scopeBody: 'These names come from the current briefing list. Inclusion does not mean the paper reading, reproduction, or experiment has been completed.',
    objects: [
      {group: 'Engineering codecs', items: 'gzip / DEFLATE, xz / LZMA, Zstd', status: 'Material in progress'},
      {group: 'Context mixing', items: 'PAQ / PAQ8px, cmix', status: 'Material in progress'},
      {group: 'Neural compression', items: 'NNCP', status: 'Material in progress'},
      {group: 'Datasets', items: 'Silesia, Tencent dataset', status: 'Link and download pending'},
    ],
    openSystemMap: 'Open compressor system map',
    materialsLabel: 'Actual files',
    materialsTitle: 'Uploaded material and missing items',
    firstReport: 'First biweekly briefing',
    submitted: 'Submitted',
    pendingSubmission: (count: number) => `${count} submission(s) are still missing.`,
    noSubmission: 'No submitted material is currently recorded.',
    nextBriefing: 'Next biweekly briefing',
    datasetPending: 'Dataset download links and local file status have not been recorded.',
    pdf: 'PDF',
    pptx: 'PPTX',
    viewReport: 'Open briefing page',
    footerNote: 'Counts come from the current repository. Missing paper readings, downloads, reproductions, and experiment results are not filled with example content.',
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
  const assetBase = stripLocaleFromBaseUrl(siteConfig.baseUrl).replace(/\/$/, '');
  const missingSubmissions = Math.max(0, firstReport.expectedSubmissionCount - firstReport.submissions.length);
  const taskStatuses = [
    copy.statusLiterature(stats.totalLit),
    copy.statusReading(firstReport.submissions.length, firstReport.expectedSubmissionCount),
    copy.statusReproduction,
    copy.statusDataset,
    copy.statusExperiment,
  ];
  const annualRows = lang === 'en' ? ANNUAL_PLAN_ROWS_EN : ANNUAL_PLAN_ROWS;
  const ganttTasks = lang === 'en' ? GANTT_TASKS_EN : GANTT_TASKS;
  const currentMonth = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
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

    const updateText = schedule.update === 'biweekly'
      ? copy.updates.biweekly(formatShortDate(nextReport.date, lang))
      : copy.updates[schedule.update];

    return {
      ...task,
      detail: taskStatuses[index],
      plan: formatPlanWindow(schedule.start, schedule.end),
      state,
      stateLabel,
      updateText,
    };
  });

  return (
    <Layout title={copy.layoutTitle} description={copy.description}>
      <WorkbenchShell pageTitle={copy.layoutTitle}>
        <div className={styles.page}>
          <header className={styles.intro}>
            <div>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h1>{copy.title}</h1>
              <p>{copy.lede}</p>
            </div>
            <div className={styles.introActions}>
              <button type="button" onClick={() => (window as {__openCommandPalette__?: () => void}).__openCommandPalette__?.()}>
                <Search size={16} />
                {copy.search}
              </button>
              <Link to="/library">
                <BookOpen size={16} />
                {copy.library}
              </Link>
            </div>
          </header>

          <section className={styles.facts} aria-label={copy.requirementsTitle}>
            <div><strong>{stats.totalLit}</strong><span>{copy.literatureCount}</span></div>
            <div><strong>{algorithmModules.length}</strong><span>{copy.moduleCount}</span></div>
            <div><strong>{firstReport.submissions.length} / {firstReport.expectedSubmissionCount}</strong><span>{copy.reportCount}</span></div>
            <div><strong>{formatShortDate(nextReport.date, lang)}</strong><span>{copy.nextReport}</span></div>
          </section>

          <section className={styles.requirementsSection}>
            <SectionHeading index="01" label={copy.requirementsLabel} title={copy.requirementsTitle} body={copy.requirementsBody} />
            <div className={styles.dataTableWrap}>
              <table className={styles.requirementsTable}>
                <thead><tr>{copy.requirementsHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {requirementRows.map((task, index) => (
                    <tr key={task.title} data-state={task.state}>
                      <td className={styles.rowNumber}>{String(index + 1).padStart(2, '0')}</td>
                      <td className={styles.requirementCell}><strong>{task.title}</strong><p>{task.requirement}</p></td>
                      <td className={styles.planCell}><span>{copy.planWindow}</span><strong>{task.plan}</strong></td>
                      <td className={styles.statusCell}><span data-state={task.state}>{task.stateLabel}</span><p>{task.detail}</p></td>
                      <td className={styles.updateCell}>{task.updateText}</td>
                      <td className={styles.actionCell}><Link className={styles.tableAction} to={task.to}>{task.action}<ArrowRight size={14} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.annualSection}>
            <SectionHeading index="02" label={copy.annualLabel} title={copy.annualTitle} body={copy.annualBody} />
            <div className={styles.dataTableWrap}>
              <table className={styles.annualPlanTable}>
                <thead><tr>{copy.annualHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {annualRows.map((row) => (
                    <tr key={row.month} data-current={row.month === currentMonth}>
                      <td className={styles.monthCell}><span>{row.month}</span>{row.month === currentMonth ? <em>{copy.currentMonth}</em> : null}</td>
                      <td><strong>{row.position}</strong><i data-tone={row.tone}>{row.tone}</i></td>
                      <td>{row.mainTasks}</td>
                      <td>{row.achievementTasks}</td>
                      <td>{row.deliverables}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.ganttSection}>
            <SectionHeading index="03" label={copy.ganttLabel} title={copy.ganttTitle} body={copy.ganttBody} />
            <div className={styles.homeGanttFrame}>
              <header><span>PROJECT / 2026.07–2027.06</span><Link to="/project-overview">{copy.openAnnualPlan}<ArrowRight size={14} /></Link></header>
              <HomeGantt tasks={ganttTasks} currentMonth={currentMonth} taskLabel={copy.ganttTask} />
            </div>
          </section>

          <section className={styles.scopeSection}>
            <SectionHeading index="04" label={copy.scopeLabel} title={copy.scopeTitle} body={copy.scopeBody} />
            <div className={styles.scopeLayout}>
              <div className={styles.objectTable}>
                {copy.objects.map((item) => (
                  <div className={styles.objectRow} key={item.group}>
                    <strong>{item.group}</strong>
                    <span>{item.items}</span>
                    <em>{item.status}</em>
                  </div>
                ))}
                <Link className={styles.inlineAction} to="/algorithm-board">
                  {copy.openSystemMap}<ArrowRight size={14} />
                </Link>
              </div>

              <aside className={styles.materialsPanel}>
                <span className={styles.sectionLabel}>{copy.materialsLabel}</span>
                <h3>{copy.materialsTitle}</h3>

                <div className={styles.materialGroup}>
                  <div className={styles.materialGroupHead}>
                    <strong>{copy.firstReport}</strong>
                    <span>{formatDate(firstReport.date, lang)}</span>
                  </div>
                  {firstReport.submissions.length > 0 ? firstReport.submissions.map((submission) => (
                    <div className={styles.submissionRow} key={submission.pptxPath}>
                      <div>
                        <strong>{lang === 'zh' ? submission.presenterZh : submission.presenterEn}</strong>
                        <span>{copy.submitted} · {submission.submittedAt}</span>
                      </div>
                      <div className={styles.fileLinks}>
                        <a href={`${assetBase}/${submission.pdfPath}`}>{copy.pdf}</a>
                        <a href={`${assetBase}/${submission.pptxPath}`}>{copy.pptx}</a>
                      </div>
                    </div>
                  )) : <p>{copy.noSubmission}</p>}
                  {missingSubmissions > 0 ? <p className={styles.pendingText}>{copy.pendingSubmission(missingSubmissions)}</p> : null}
                </div>

                <div className={styles.statusLine}>
                  <Clock3 size={16} />
                  <span><strong>{copy.nextBriefing}</strong>{formatDate(nextReport.date, lang)} · {nextReport.time}</span>
                </div>
                <div className={styles.statusLine}>
                  <FileText size={16} />
                  <span>{copy.datasetPending}</span>
                </div>
                <Link className={styles.inlineAction} to={`/weekly-reports?report=${firstReport.id}`}>
                  {copy.viewReport}<ArrowRight size={14} />
                </Link>
              </aside>
            </div>
          </section>

          <footer className={styles.scopeFooter}>
            <CheckCircle2 size={16} />
            <span>{copy.footerNote}</span>
          </footer>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function HomeGantt({
  tasks,
  currentMonth,
  taskLabel,
}: {
  tasks: readonly GanttTask[];
  currentMonth: string;
  taskLabel: string;
}): React.ReactElement {
  return (
    <div className={styles.ganttWrap}>
      <div className={styles.ganttMonths}>
        <span>{taskLabel}</span>
        {YEAR_MONTHS.map((month) => (
          <b key={month} data-current={month === currentMonth}>{month.replace('20', '')}</b>
        ))}
      </div>
      {tasks.map((task) => {
        const start = getMonthIndex(task.start);
        const end = getMonthIndex(task.end);
        return (
          <div className={styles.ganttRow} key={task.id}>
            <div className={styles.ganttLabel}>
              <strong>{task.name}</strong>
              <span>{task.track}</span>
            </div>
            <div className={styles.ganttGrid}>
              <div
                className={styles.ganttBar}
                data-tone={task.tone}
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
  );
}

function getMonthIndex(month: string): number {
  const index = YEAR_MONTHS.indexOf(month as (typeof YEAR_MONTHS)[number]);
  return index >= 0 ? index : 0;
}

function getTimedRequirementState(now: Date, start: string, end: string): RequirementState {
  const current = now.getTime();
  const startAt = Date.parse(`${start}T00:00:00+08:00`);
  const endAt = Date.parse(`${end}T23:59:59+08:00`);
  const reviewEndsAt = endAt + 7 * 86400000;
  if (current < startAt) return 'scheduled';
  if (current <= endAt) return 'active';
  if (current <= reviewEndsAt) return 'review';
  return 'overdue';
}

function getRequirementStateLabel(state: RequirementState, copy: typeof COPY.zh | typeof COPY.en): string {
  const labels = {
    complete: copy.stateComplete,
    active: copy.stateActive,
    scheduled: copy.stateScheduled,
    review: copy.stateReview,
    overdue: copy.stateOverdue,
  };
  return labels[state];
}

function formatPlanWindow(start: string, end: string): string {
  const [startYear, startMonth, startDay] = start.split('-');
  const [endYear, endMonth, endDay] = end.split('-');
  const endLabel = startYear === endYear ? `${endMonth}.${endDay}` : `${endYear}.${endMonth}.${endDay}`;
  return `${startYear}.${startMonth}.${startDay}–${endLabel}`;
}

function SectionHeading({index, label, title, body}: {index: string; label: string; title: string; body: string}): React.ReactElement {
  return (
    <header className={styles.sectionHeading}>
      <span className={styles.sectionNumber}>{index}</span>
      <div>
        <span className={styles.sectionLabel}>{label}</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </header>
  );
}

function formatDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function formatShortDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function stripLocaleFromBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/en\/?$/, '/');
}
