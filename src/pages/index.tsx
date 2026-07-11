import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  FlaskConical,
  Network,
  Presentation,
  Search,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {useWorkbenchStats} from '../components/workbench/stats';
import {algorithmModules} from '../data/algorithmModules';
import {literatureData, type LiteratureItem} from '../data/literatureData';
import {getNextWeeklyReportIndex, getWeeklyReportAt} from '../data/weeklyReports';
import styles from './index.module.css';

type Lang = 'zh' | 'en';

const FEATURED_IDS = ['LIT-0001', 'LIT-0018', 'LIT-0096', 'LIT-0184', 'LIT-0207'];

const PIPELINE = [
  {zh: '输入与分流', en: 'Input'},
  {zh: '可逆预处理', en: 'Preprocess'},
  {zh: '冗余建模', en: 'Model'},
  {zh: '概率融合', en: 'Mix'},
  {zh: '熵编码', en: 'Encode'},
  {zh: '工程封装', en: 'Frame'},
] as const;

const COPY = {
  zh: {
    layoutTitle: '无损压缩研究',
    description: '无损压缩研究项目记录：文献、算法、数据集、实验与阶段汇报。',
    eyebrow: '研究计划 / Lossless Compression Research',
    title: '无损压缩研究',
    lede: '围绕通用无损压缩，整理可核验的文献证据，理解压缩器内部机制，并在统一数据集上完成可复现实验。',
    search: '搜索研究资料',
    library: '浏览文献',
    records: '资料记录',
    modules: '系统模块',
    notes: '研究笔记',
    submissions: '已提交汇报',
    question: '当前研究问题',
    questionText: '不同数据粒度和冗余结构下，经典字典方法、上下文混合与神经预测分别在压缩率、速度和内存上付出什么代价？',
    tracks: '研究主线',
    track1: '工程基线',
    track1Body: 'gzip / DEFLATE、xz / LZMA、Zstd',
    track2: '上下文建模',
    track2Body: 'PAQ8px、cmix、概率混合与算术编码',
    track3: '神经预测',
    track3Body: 'NNCP、Transformer 概率模型与模型成本',
    mapTitle: '压缩器系统主线',
    mapLabel: '方法系统',
    mapBody: '所有方法都可以放回同一条可逆信息处理流水线中比较。',
    openMap: '查看系统地图',
    readingTitle: '当前阅读集',
    readingBody: '先读奠基材料，再进入工程实现和神经压缩。',
    viewAll: '查看全部文献',
    open: '打开',
    reportTitle: '下一次双周汇报',
    reportNo: '期次',
    reportDate: '时间',
    reportMaterials: '材料',
    reportPending: '等待两位同学提交',
    reportOpen: '进入汇报页',
    experimentTitle: '实验记录',
    experimentBody: '实验页已经具备数据集、基线、块大小、指标和 bit-exact 检查入口。真实结果尚未写入时保持为空，不用示例数值冒充结论。',
    experimentAction: '设计实验',
    protocol: '统一记录',
    protocolItems: ['压缩后字节数与 bits/byte', '压缩与解压吞吐', '峰值内存与硬件环境', 'bit-exact 解压校验'],
    scopeTitle: '本阶段边界',
    scopeBody: '先完成文献筛选、核心方法讲清楚和基线协议固定，再讨论算法改进。',
    evidenceTitle: '研究证据与进展',
    evidenceLabel: '阶段输出',
    evidenceBody: '把当前阅读材料、实验协议和阶段输出放在同一条证据链中持续更新。',
  },
  en: {
    layoutTitle: 'Lossless Compression Research',
    description: 'A lossless compression research record covering literature, algorithms, datasets, experiments, and briefings.',
    eyebrow: 'Research Program / Lossless Compression',
    title: 'Lossless Compression Research',
    lede: 'A working record for general-purpose lossless compression: verifiable literature, codec mechanisms, and reproducible experiments on shared datasets.',
    search: 'Search research material',
    library: 'Browse literature',
    records: 'Records',
    modules: 'System modules',
    notes: 'Research notes',
    submissions: 'Submitted briefings',
    question: 'Current research question',
    questionText: 'Across different data granularities and redundancy structures, what trade-offs do dictionary methods, context mixing, and neural predictors make in ratio, speed, and memory?',
    tracks: 'Research tracks',
    track1: 'Engineering baselines',
    track1Body: 'gzip / DEFLATE, xz / LZMA, Zstd',
    track2: 'Context modeling',
    track2Body: 'PAQ8px, cmix, probability mixing, arithmetic coding',
    track3: 'Neural prediction',
    track3Body: 'NNCP, Transformer probability models, model cost',
    mapTitle: 'Codec system path',
    mapLabel: 'Method system',
    mapBody: 'Each compressor can be compared on the same reversible information-processing pipeline.',
    openMap: 'Open system map',
    readingTitle: 'Current reading set',
    readingBody: 'Start with foundations, then move into implementations and neural compression.',
    viewAll: 'View all literature',
    open: 'Open',
    reportTitle: 'Next biweekly briefing',
    reportNo: 'Cycle',
    reportDate: 'Time',
    reportMaterials: 'Material',
    reportPending: 'Waiting for two submissions',
    reportOpen: 'Open briefing page',
    experimentTitle: 'Experiment record',
    experimentBody: 'The experiment page records dataset, baseline, block size, metrics, and bit-exact validation. Empty results remain empty until a real run is available.',
    experimentAction: 'Design experiment',
    protocol: 'Record consistently',
    protocolItems: ['Compressed bytes and bits/byte', 'Compression and decompression throughput', 'Peak memory and hardware', 'Bit-exact decompression check'],
    scopeTitle: 'Current scope',
    scopeBody: 'Finish screening, explain the core methods, and freeze the baseline protocol before proposing algorithm changes.',
    evidenceTitle: 'Evidence and progress',
    evidenceLabel: 'Stage outputs',
    evidenceBody: 'Keep reading material, experiment protocols, and stage outputs in one continuously updated evidence chain.',
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
  const featured = FEATURED_IDS
    .map((id) => literatureData.find((item) => item.id === id))
    .filter((item): item is LiteratureItem => Boolean(item));
  const reportStart = new Date(`${nextReport.date}T14:30:00+08:00`);
  const daysUntil = Math.max(0, Math.ceil((reportStart.getTime() - now.getTime()) / 86400000));
  const assetBase = stripLocaleFromBaseUrl(siteConfig.baseUrl).replace(/\/$/, '');

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

          <section className={styles.facts} aria-label={lang === 'zh' ? '研究资料概况' : 'Research material summary'}>
            <div><strong>{stats.totalLit}</strong><span>{copy.records}</span></div>
            <div><strong>{algorithmModules.length}</strong><span>{copy.modules}</span></div>
            <div><strong>{stats.totalNotes}</strong><span>{copy.notes}</span></div>
            <div><strong>{firstReport.submissions.length} / {firstReport.expectedSubmissionCount}</strong><span>{copy.submissions}</span></div>
          </section>

          <section className={styles.focusSection}>
            <header className={styles.focusHeader}>
              <span className={styles.sectionNumber}>01</span>
              <div>
                <span className={styles.sectionLabel}>{copy.question}</span>
                <h2>{copy.questionText}</h2>
              </div>
            </header>
            <div className={styles.trackList}>
              <ResearchTrack index="01" title={copy.track1} body={copy.track1Body} />
              <ResearchTrack index="02" title={copy.track2} body={copy.track2Body} />
              <ResearchTrack index="03" title={copy.track3} body={copy.track3Body} />
            </div>

            <aside className={styles.reportBlock}>
              <div className={styles.reportHead}>
                <Presentation size={18} />
                <span>{copy.reportTitle}</span>
                <strong>{daysUntil} {lang === 'zh' ? '天' : daysUntil === 1 ? 'day' : 'days'}</strong>
              </div>
              <h2>{lang === 'zh' ? nextReport.titleZh : nextReport.titleEn}</h2>
              <dl>
                <div><dt>{copy.reportNo}</dt><dd>WR-{String(nextReport.no).padStart(2, '0')}</dd></div>
                <div><dt>{copy.reportDate}</dt><dd>{formatReportDate(nextReport.date, lang)} · {nextReport.time}</dd></div>
                <div><dt>{copy.reportMaterials}</dt><dd>{copy.reportPending}</dd></div>
              </dl>
              <Link to={`/weekly-reports?report=${nextReport.id}`}>
                {copy.reportOpen}
                <ArrowRight size={15} />
              </Link>
            </aside>
          </section>

          <section className={styles.systemMap}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionLead}>
                <span className={styles.sectionNumber}>02</span>
                <div>
                  <span className={styles.sectionLabel}>{copy.mapLabel}</span>
                  <h2>{copy.mapTitle}</h2>
                  <p>{copy.mapBody}</p>
                </div>
              </div>
              <Link to="/algorithm-board">{copy.openMap}<ArrowRight size={14} /></Link>
            </div>
            <div className={styles.pipeline}>
              {PIPELINE.map((step, index) => (
                <React.Fragment key={step.zh}>
                  <div>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{lang === 'zh' ? step.zh : step.en}</strong>
                  </div>
                  {index < PIPELINE.length - 1 ? <ArrowRight size={16} aria-hidden /> : null}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className={styles.evidenceSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionLead}>
                <span className={styles.sectionNumber}>03</span>
                <div>
                  <span className={styles.sectionLabel}>{copy.evidenceLabel}</span>
                  <h2>{copy.evidenceTitle}</h2>
                  <p>{copy.evidenceBody}</p>
                </div>
              </div>
            </div>

            <div className={styles.contentGrid}>
              <section className={styles.readingSection}>
                <div className={styles.subsectionHeading}>
                  <div>
                    <h3>{copy.readingTitle}</h3>
                    <p>{copy.readingBody}</p>
                  </div>
                  <Link to="/library">{copy.viewAll}<ArrowRight size={14} /></Link>
                </div>
                <div className={styles.readingList}>
                  {featured.map((item) => (
                    <Link key={item.id} to={`/library?lit=${item.id}`} className={styles.readingRow}>
                      <img src={`${assetBase}/img/literature-covers/${item.id.toLowerCase()}.png`} alt="" loading="lazy" />
                      <span className={styles.readingMain}>
                        <span>{item.chapterId} · {lang === 'zh' ? item.chapterTitleZh : item.chapterTitleEn}</span>
                        <strong>{item.title}</strong>
                        <em>{[item.authors, item.year, item.venue].filter(Boolean).join(' · ')}</em>
                      </span>
                      <span className={styles.openLabel}>{copy.open}<ArrowRight size={13} /></span>
                    </Link>
                  ))}
                </div>
              </section>

              <aside className={styles.experimentSection}>
                <div className={styles.experimentIcon}><FlaskConical size={19} /></div>
                <span className={styles.sectionLabel}>{copy.experimentTitle}</span>
                <h3>{copy.experimentTitle}</h3>
                <p>{copy.experimentBody}</p>
                <h4>{copy.protocol}</h4>
                <ul>
                  {copy.protocolItems.map((item) => <li key={item}><Check size={15} />{item}</li>)}
                </ul>
                <Link to="/experiments">{copy.experimentAction}<ArrowRight size={14} /></Link>
              </aside>
            </div>
          </section>

          <footer className={styles.scopeFooter}>
            <div>
              <Clock3 size={16} />
              <span><strong>{copy.scopeTitle}</strong>{copy.scopeBody}</span>
            </div>
            <span><CalendarDays size={15} />2026 · Phase 01</span>
          </footer>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function ResearchTrack({index, title, body}: {index: string; title: string; body: string}): React.ReactElement {
  return (
    <div className={styles.trackRow}>
      <span>{index}</span>
      <strong>{title}</strong>
      <p>{body}</p>
      <Network size={15} />
    </div>
  );
}

function formatReportDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    month: 'short',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function stripLocaleFromBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/en\/?$/, '/');
}
