import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {
  ChevronDown,
  ChevronUp,
  Code2,
  ExternalLink,
  FileText,
  Globe2,
  Layers,
  Link as LinkIcon,
  Search,
  Table2,
  Trophy,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  EmptyState,
  EvidenceBadge,
  InfoStrip,
  MetricTile,
  ResearchPanel,
  SourceChip,
} from '../components/research-console/ResearchConsole';
import {
  LB_DOMAIN_LABELS,
  LB_EVIDENCE_LABELS,
  LB_MODE_LABELS,
  LB_PRESENTATION_LABELS,
  type LeaderboardDomain,
  type Leaderboard,
} from '../data/leaderboards';
import {loadLeaderboards} from '../data/leaderboards.loader';
import styles from './sota.module.css';

const CN = {
  title: '可核验压缩基准 / Benchmarks',
  all: '全部数据类型',
  noResult: '未找到匹配的榜单',
  searchPh: '搜索方法、数据集、指标或来源',
  viewAll: '展开全部',
  collapseAll: '收起',
};

export default function SotaPage(): React.ReactElement {
  const [lbs, setLbs] = useState<Leaderboard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [domain, setDomain] = useState<LeaderboardDomain | 'all'>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLeaderboards().then((boards) => {
      setLbs(boards);
      setLoaded(true);
    });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lbs.filter((lb) => {
      if (domain !== 'all' && lb.domain !== domain) return false;
      if (!q) return true;
      return (
        lb.title.toLowerCase().includes(q) ||
        lb.task.toLowerCase().includes(q) ||
        lb.dataset.toLowerCase().includes(q) ||
        lb.metric.toLowerCase().includes(q) ||
        lb.protocol.toLowerCase().includes(q) ||
        lb.sourceName.toLowerCase().includes(q) ||
        lb.entries.some((entry) => entry.method.toLowerCase().includes(q))
      );
    });
  }, [lbs, domain, query]);

  const domainCount = useMemo(() => {
    const map: Partial<Record<LeaderboardDomain | 'all', number>> = {all: lbs.length};
    for (const lb of lbs) map[lb.domain] = (map[lb.domain] ?? 0) + 1;
    return map;
  }, [lbs]);

  const domainGroups = useMemo(() => {
    const domains = Object.keys(LB_DOMAIN_LABELS) as LeaderboardDomain[];
    return domains
      .filter((item) => domain === 'all' || item === domain)
      .map((item) => ({domain: item, boards: visible.filter((board) => board.domain === item)}))
      .filter((group) => query.trim().length === 0 || group.boards.length > 0);
  }, [domain, query, visible]);

  const kpis = useMemo(() => {
    const ranked = lbs.filter((lb) => lb.presentation === 'ranking').length;
    const comparisons = lbs.filter((lb) => lb.presentation === 'comparison').length;
    const official = lbs.filter((lb) => lb.evidence === 'official').length;
    const withCode = lbs.reduce((sum, lb) => sum + lb.entries.filter((entry) => entry.codeUrl).length, 0);
    const coveredDomains = new Set(lbs.map((lb) => lb.domain)).size;
    const totalDomains = Object.keys(LB_DOMAIN_LABELS).length;
    return {ranked, comparisons, official, withCode, coveredDomains, totalDomains};
  }, [lbs]);

  function toggle(id: string): void {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Layout title={CN.title} description="压缩算法公开基准结果与来源记录">
      <WorkbenchShell pageTitle={CN.title}>
        <div className={styles.page}>
          <section className={styles.consoleHeader}>
            <div>
              <span className={styles.kicker}>Verified Benchmark Evidence</span>
              <h2>按数据类型与评测口径组织</h2>
              <p className={styles.headerDescription}>只有同一任务、数据集、版本和指标的结果才进入排名；论文自报、工程实测与待复现资料分别标记。</p>
            </div>
            <div className={styles.liveBarCompact}>
              <a href="http://mattmahoney.net/dc/text.html" target="_blank" rel="noopener noreferrer">Mahoney <ExternalLink size={11} /></a>
              <a href="http://prize.hutter1.net/" target="_blank" rel="noopener noreferrer">Hutter Prize <ExternalLink size={11} /></a>
              <a href="https://clic2025.compression.cc/" target="_blank" rel="noopener noreferrer">CLIC <ExternalLink size={11} /></a>
            </div>
          </section>

          <section className={styles.methodRules} aria-label="榜单收录规则">
            <div><strong>01</strong><span>同一任务</span><small>无损、近无损和率失真不混排</small></div>
            <div><strong>02</strong><span>同一数据</span><small>记录语料、版本、切分与预处理</small></div>
            <div><strong>03</strong><span>同一指标</span><small>BPP、BPSP、ELO 与压缩率不互换</small></div>
            <div><strong>04</strong><span>证据分级</span><small>官方榜、论文同表、工程实测、待复现</small></div>
          </section>

          <section className={styles.kpiGrid}>
            <MetricTile label="Official Boards" value={loaded ? kpis.official : '...'} hint={`${kpis.coveredDomains}/${kpis.totalDomains} 数据类型已覆盖`} icon={Trophy} tone="amber" />
            <MetricTile label="Rankable" value={loaded ? kpis.ranked : '...'} hint="满足同口径直接排名" icon={Table2} tone="blue" />
            <MetricTile label="Paper Tables" value={loaded ? kpis.comparisons : '...'} hint="同一论文协议内比较" icon={Globe2} tone="green" />
            <MetricTile label="Code Evidence" value={loaded ? kpis.withCode : '...'} hint="含代码链接条目" icon={Code2} tone="purple" />
          </section>

          <div className={styles.boardLayout}>
            <aside className={styles.boardSidebar}>
              <ResearchPanel eyebrow="筛选" title="开源数据类型">
                <div className={styles.domainList}>
                  <button type="button" className={`${styles.domainBtn} ${domain === 'all' ? styles.domainBtnOn : ''}`} onClick={() => setDomain('all')}>
                    <Layers size={14} />
                    <span>{CN.all}</span>
                    <b>{domainCount.all ?? 0}</b>
                  </button>
                  {(Object.keys(LB_DOMAIN_LABELS) as LeaderboardDomain[]).map((d) => {
                    const count = domainCount[d] ?? 0;
                    return (
                      <button
                        key={d}
                        type="button"
                        className={`${styles.domainBtn} ${domain === d ? styles.domainBtnOn : ''}`}
                        onClick={() => setDomain(d)}
                      >
                        <span className={styles.domainMark} />
                        <span>{LB_DOMAIN_LABELS[d].label}</span>
                        <b>{count > 0 ? count : '待补'}</b>
                      </button>
                    );
                  })}
                </div>
                <label className={styles.searchBox}>
                  <Search size={14} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={CN.searchPh} />
                </label>
              </ResearchPanel>
            </aside>

            <main className={styles.boardMain}>
              {!loaded ? (
                <EmptyState icon={Trophy} title="正在加载榜单快照" description="优先读取自动抓取榜单，失败时回退到本地静态数据。" />
              ) : domainGroups.length === 0 ? (
                <EmptyState icon={Search} title={CN.noResult} description="换一个数据类型或关键词再试。" />
              ) : (
                domainGroups.map((group) => {
                  const meta = LB_DOMAIN_LABELS[group.domain];
                  return (
                    <section className={styles.domainGroup} key={group.domain}>
                      <header className={styles.domainGroupHeader}>
                        <div><span>{meta.emoji}</span><div><h3>{meta.label}</h3><p>{meta.description}</p></div></div>
                        <small>{meta.datasets}</small>
                      </header>
                      {group.boards.length > 0 ? group.boards.map((lb) => (
                        <LeaderboardCard
                          key={lb.id}
                          lb={lb}
                          expanded={expanded.has(lb.id)}
                          onToggle={() => toggle(lb.id)}
                        />
                      )) : (
                        <div className={styles.coverageGap}>
                          <strong>暂无可核验的同口径公开榜单</strong>
                          <span>已登记代表数据集，待补统一指标、环境与公开来源；不会用跨数据集结果冒充 SOTA。</span>
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </main>
          </div>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function LeaderboardCard({
  lb,
  expanded,
  onToggle,
}: {
  lb: Leaderboard;
  expanded: boolean;
  onToggle: () => void;
}): React.ReactElement {
  const top = lb.entries.slice(0, expanded ? lb.entries.length : Math.min(6, lb.entries.length));
  const hasPaper = lb.entries.some((entry) => entry.paperUrl);
  const hasCode = lb.entries.some((entry) => entry.codeUrl);
  const evidenceType = lb.evidence === 'official'
    ? 'official'
    : lb.evidence === 'paper'
      ? 'paper'
      : lb.evidence === 'reference'
        ? 'unverified'
        : 'curated';
  const primarySourceLabel = {
    official: '打开官方榜单',
    paper: '打开论文表格来源',
    engineering: '打开评测项目',
    reference: '打开证据来源',
  }[lb.evidence];

  return (
    <article className={styles.lbCard}>
      <header className={styles.lbHeader}>
        <div className={styles.lbTitleBlock}>
          <div className={styles.lbDomain}>{LB_DOMAIN_LABELS[lb.domain].label} · {LB_MODE_LABELS[lb.mode]} · {LB_PRESENTATION_LABELS[lb.presentation]}</div>
          <h3>{lb.title.replace(/[★🔥]/g, '').trim()}</h3>
          <div className={styles.lbMetaLine}>
            <span><strong>Task</strong>{lb.task}</span>
            <span><strong>Dataset</strong>{lb.dataset}</span>
            <span><strong>Metric</strong>{lb.metric}</span>
            <span><strong>Verified</strong>{lb.updatedAt}</span>
          </div>
        </div>
        <div className={styles.lbEvidence}>
          <EvidenceBadge type={evidenceType}>{LB_EVIDENCE_LABELS[lb.evidence]}</EvidenceBadge>
          {hasPaper ? <EvidenceBadge type="paper">论文链接</EvidenceBadge> : null}
          {hasCode ? <EvidenceBadge type="code">代码链接</EvidenceBadge> : null}
        </div>
      </header>

      <InfoStrip tone={lb.presentation === 'ranking' ? 'green' : lb.presentation === 'comparison' ? 'blue' : 'amber'}>
        <strong>评测协议：</strong>{lb.protocol}
        {lb.datasetVersion ? <> · <strong>版本：</strong>{lb.datasetVersion}</> : null}
      </InfoStrip>

      {lb.limitations ? <div className={styles.limitation}><strong>适用边界</strong><span>{lb.limitations}</span></div> : null}

      <div className={styles.sourceRow}>
        <a className={styles.primarySourceLink} href={lb.sourceUrl} target="_blank" rel="noopener noreferrer">
          {primarySourceLabel}
          <ExternalLink size={13} />
        </a>
        <SourceChip label={lb.sourceName} href={lb.sourceUrl} kind="source" />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.lbTable}>
          <thead>
            <tr>
              <th className={styles.colRank}>名次</th>
              <th>方法 / 配置</th>
              <th>年份</th>
              <th>指标</th>
              <th className={styles.colLinks}>证据</th>
            </tr>
          </thead>
          <tbody>
            {top.map((entry, index) => (
              <tr key={`${entry.method}-${index}`} data-comparable={entry.comparable === false ? 'false' : 'true'}>
                <td className={styles.colRank}>{lb.presentation === 'registry' || entry.comparable === false ? '—' : entry.rank ?? index + 1}</td>
                <td className={styles.colMethod}>
                  <strong>{entry.method}</strong>
                  {entry.config ? <code>{entry.config}</code> : null}
                  {entry.notes ? <span>{entry.notes}</span> : null}
                </td>
                <td className={styles.colYear}>{entry.year ?? '—'}</td>
                <td className={styles.colMetric}>{entry.metric}</td>
                <td className={styles.colLinks}>
                  <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" title="来源">
                    <LinkIcon size={14} />
                  </a>
                  {entry.paperUrl ? (
                    <a href={entry.paperUrl} target="_blank" rel="noopener noreferrer" title="论文">
                      <FileText size={14} />
                    </a>
                  ) : null}
                  {entry.codeUrl ? (
                    <a href={entry.codeUrl} target="_blank" rel="noopener noreferrer" title="代码">
                      <Code2 size={14} />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lb.entries.length > 6 ? (
        <button type="button" className={styles.expandBtn} onClick={onToggle}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? CN.collapseAll : `${CN.viewAll} (${lb.entries.length - 6})`}
        </button>
      ) : null}
    </article>
  );
}
