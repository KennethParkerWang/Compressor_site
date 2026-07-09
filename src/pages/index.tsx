import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  FileSearch,
  FlaskConical,
  ListChecks,
  NotebookPen,
  RadioTower,
  Search,
  Trophy,
} from 'lucide-react';
import CountUp from '../components/workbench/CountUp';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {useWorkbenchStats} from '../components/workbench/stats';
import {useTasks} from '../stores/workbench';
import {
  ConsoleLink,
  EmptyState,
  EvidenceBadge,
  InfoStrip,
  MetricTile,
  ResearchPanel,
  StatusPill,
} from '../components/research-console/ResearchConsole';
import {LEADERBOARDS, LB_DOMAIN_LABELS, type LeaderboardDomain} from '../data/leaderboards';
import {NEURAL_ITEMS, MODALITY_META} from '../data/neuralHub';
import styles from './index.module.css';

const NEXT_STEPS = [
  {
    to: '/sota',
    icon: Trophy,
    title: '核验 SOTA 榜单',
    desc: '从官方榜、论文表格、代码仓库回到可追溯证据。',
    tone: 'amber' as const,
  },
  {
    to: '/neural-hub',
    icon: Brain,
    title: '深度学习压缩器',
    desc: '聚焦 LLM 无损、神经图像/视频/音频 codec 和神经熵模型。',
    tone: 'purple' as const,
  },
  {
    to: '/datasets',
    icon: Database,
    title: '选择数据集基准',
    desc: '按通用、文本、图像、视频、音频、科学和基因组场景选择 benchmark。',
    tone: 'cyan' as const,
  },
  {
    to: '/library',
    icon: Database,
    title: '进入事实数据库',
    desc: '用筛选、搜索、批量操作管理论文、标准、代码和数据集。',
    tone: 'blue' as const,
  },
  {
    to: '/experiments',
    icon: FlaskConical,
    title: '设计复现实验',
    desc: '把榜单结论转成可跑的 benchmark 和消融计划。',
    tone: 'green' as const,
  },
];

export default function Home(): React.ReactElement {
  const stats = useWorkbenchStats();
  const tasks = useTasks((s) => s.tasks);
  const openTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'doing');
  const recentNeural = NEURAL_ITEMS.filter((item) => item.year >= 2024).length;
  const withCode = NEURAL_ITEMS.filter((item) => item.codeUrl || item.github).length;
  const leaderboardEntries = LEADERBOARDS.reduce((sum, board) => sum + board.entries.length, 0);
  const verifiedBoards = LEADERBOARDS.filter((board) => board.sourceUrl && board.updatedAt).length;

  const frontierItems = React.useMemo(
    () => [...NEURAL_ITEMS]
      .filter((item) => item.year >= 2024)
      .sort((a, b) => b.year - a.year || Number(!!b.sotaBench) - Number(!!a.sotaBench))
      .slice(0, 6),
    [],
  );

  const boardStatus = React.useMemo(() => {
    return (Object.keys(LB_DOMAIN_LABELS) as LeaderboardDomain[])
      .map((domain) => {
        const boards = LEADERBOARDS.filter((board) => board.domain === domain);
        const latest = boards.map((board) => board.updatedAt).sort().at(-1) ?? '-';
        return {domain, label: LB_DOMAIN_LABELS[domain].label, count: boards.length, latest};
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const topChapters = React.useMemo(
    () => [...stats.litByChapter].sort((a, b) => b.count - a.count).slice(0, 5),
    [stats.litByChapter],
  );

  return (
    <Layout title="Today · Research Console" description="压缩算法科研平台总览">
      <WorkbenchShell pageTitle="Today · 科研驾驶舱">
        <div className={styles.page}>
          <section className={styles.heroBand}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Research Intelligence Console</span>
              <h2>压缩算法研究控制台</h2>
            </div>
            <div className={styles.heroActions}>
              <Link to="/library" className={styles.primaryAction}>
                <BookOpen size={16} />
                打开文献库
              </Link>
              <button type="button" className={styles.secondaryAction} onClick={() => (window as any).__openCommandPalette__?.()}>
                <Search size={16} />
                全局搜索
              </button>
            </div>
          </section>

          <section className={styles.metricGrid} aria-label="平台总览指标">
            <MetricTile label="Literature" value={<CountUp value={stats.totalLit} />} hint="论文 / 标准 / 代码 / 数据集" icon={Database} tone="blue" />
            <MetricTile label="SOTA Boards" value={<CountUp value={LEADERBOARDS.length} />} hint={`${leaderboardEntries} 条榜单记录`} icon={Trophy} tone="amber" />
            <MetricTile label="Learned" value={<CountUp value={NEURAL_ITEMS.length} />} hint={`${recentNeural} 条 2024+`} icon={Brain} tone="purple" />
            <MetricTile label="Open Code" value={<CountUp value={withCode} />} hint="Hub 中可复现入口" icon={FileSearch} tone="green" />
            <MetricTile label="Notes" value={<CountUp value={stats.totalNotes} />} hint={`${stats.notesThisWeek} 篇本周更新`} icon={NotebookPen} tone="cyan" />
            <MetricTile label="Tasks" value={<CountUp value={tasks.length} />} hint={`${openTasks.length} 条待推进`} icon={ClipboardList} tone={tasks.length === 0 ? 'slate' : 'red'} />
          </section>

          <section className={styles.twoCol}>
            <ResearchPanel
              eyebrow="Next Research Entry"
              title="下一步研究入口"
              description="按研究判断链路排序：先确认榜单事实，再回看前沿工作，最后进入任务执行。"
            >
              <div className={styles.entryList}>
                {NEXT_STEPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.to} to={item.to} className={styles.entryRow} data-tone={item.tone}>
                      <span className={styles.entryIcon}><Icon size={17} /></span>
                      <span className={styles.entryBody}>
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </span>
                      <ArrowRight size={15} />
                    </Link>
                  );
                })}
              </div>
            </ResearchPanel>

            <ResearchPanel
              eyebrow="Execution"
              title="任务执行层"
              action={<ConsoleLink to="/tasks">打开 Tasks</ConsoleLink>}
            >
              {tasks.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="任务栏已清空"
                  actions={(
                    <>
                      <Link to="/library" className={styles.textButton}>从 Library 创建</Link>
                      <Link to="/sota" className={styles.textButton}>从 SOTA 核验</Link>
                      <Link to="/neural-hub" className={styles.textButton}>从 Learned Compression 追踪</Link>
                    </>
                  )}
                />
              ) : (
                <div className={styles.taskList}>
                  {openTasks.slice(0, 5).map((task) => (
                    <Link key={task.id} to={`/tasks?task=${task.id}`} className={styles.taskRow}>
                      <span>
                        <strong>{task.title}</strong>
                        <em>{task.lane} · {task.estimatedMinutes} min</em>
                      </span>
                      <StatusPill tone={task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'amber' : 'blue'}>
                        {task.priority}
                      </StatusPill>
                    </Link>
                  ))}
                </div>
              )}
            </ResearchPanel>
          </section>

          <section className={styles.twoColWide}>
            <ResearchPanel
              eyebrow="Learned Compression"
              title="深度学习压缩器"
              description="收录深度学习参与压缩器设计的论文、代码和 benchmark 证据。"
              action={<ConsoleLink to="/neural-hub">进入库</ConsoleLink>}
            >
              <div className={styles.frontierList}>
                {frontierItems.map((item) => {
                  const meta = MODALITY_META[item.modality];
                  return (
                    <Link key={item.id} to="/neural-hub" className={styles.frontierRow}>
                      <span className={styles.yearCell}>{item.year}</span>
                      <span className={styles.frontierMain}>
                        <strong>{item.title}</strong>
                        <span>{meta.labelZh} · {item.venue}</span>
                      </span>
                      {item.sotaBench ? <EvidenceBadge type="paper">Benchmark</EvidenceBadge> : <EvidenceBadge type="curated">Radar</EvidenceBadge>}
                    </Link>
                  );
                })}
              </div>
            </ResearchPanel>

            <ResearchPanel
              eyebrow="SOTA Verification"
              title="榜单核验状态"
              description={`${verifiedBoards}/${LEADERBOARDS.length} 个榜单已有来源链接与更新时间。`}
              action={<ConsoleLink to="/sota">查看榜单</ConsoleLink>}
            >
              <div className={styles.boardGrid}>
                {boardStatus.map((item) => (
                  <Link key={item.domain} to={`/sota`} className={styles.boardRow}>
                    <span>
                      <strong>{item.label}</strong>
                      <em>{item.latest}</em>
                    </span>
                    <StatusPill tone="blue">{item.count} boards</StatusPill>
                  </Link>
                ))}
              </div>
            </ResearchPanel>
          </section>

          <section className={styles.bottomGrid}>
            <ResearchPanel eyebrow="Library Distribution" title="文献数据库密度" action={<ConsoleLink to="/library">筛选文献</ConsoleLink>}>
              <div className={styles.chapterList}>
                {topChapters.map((chapter) => (
                  <Link key={chapter.id} to={`/library?chapter=${chapter.id}`} className={styles.chapterRow}>
                    <span>
                      <strong>{chapter.id}</strong>
                      <em>{chapter.label}</em>
                    </span>
                    <b>{chapter.count}</b>
                  </Link>
                ))}
              </div>
            </ResearchPanel>

            <ResearchPanel eyebrow="Evidence Policy" title="证据口径">
              <div className={styles.policyStack}>
                <InfoStrip tone="blue">SOTA 负责榜单核验，Datasets 负责实验基准选择，Learned Compression 负责深度学习压缩器证据，Library 负责文献与引用管理。</InfoStrip>
                <div className={styles.policyBadges}>
                  <EvidenceBadge type="official">官方榜单优先</EvidenceBadge>
                  <EvidenceBadge type="paper">论文表格可追溯</EvidenceBadge>
                  <EvidenceBadge type="code">代码仓库辅助核验</EvidenceBadge>
                  <StatusPill tone="green" icon={<CheckCircle2 size={12} />}>任务池 0 条</StatusPill>
                </div>
              </div>
            </ResearchPanel>

            <ResearchPanel eyebrow="Live Surface" title="常用入口">
              <div className={styles.quickGrid}>
                <Link to="/hub"><Trophy size={15} /> Resource Library</Link>
                <Link to="/datasets"><Database size={15} /> Datasets</Link>
                <Link to="/experiments"><FlaskConical size={15} /> Experiments</Link>
                <Link to="/notes"><NotebookPen size={15} /> Notes</Link>
                <Link to="/research-feed"><RadioTower size={15} /> Sources</Link>
              </div>
            </ResearchPanel>
          </section>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}
