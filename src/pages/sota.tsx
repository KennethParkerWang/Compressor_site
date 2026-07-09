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
  MetricTile,
  ResearchPanel,
  SourceChip,
} from '../components/research-console/ResearchConsole';
import {LB_DOMAIN_LABELS, type LeaderboardDomain, type Leaderboard} from '../data/leaderboards';
import {loadLeaderboards} from '../data/leaderboards.loader';
import styles from './hub.module.css';

const CN = {
  title: 'SOTA 榜单 / Leaderboards',
  all: '全部领域',
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
        lb.dataset.toLowerCase().includes(q) ||
        lb.metric.toLowerCase().includes(q) ||
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

  const kpis = useMemo(() => {
    const entries = lbs.reduce((sum, lb) => sum + lb.entries.length, 0);
    const recent = lbs.filter((lb) => Number(lb.updatedAt.slice(0, 4)) >= 2025).length;
    const withCode = lbs.reduce((sum, lb) => sum + lb.entries.filter((entry) => entry.codeUrl).length, 0);
    const domains = new Set(lbs.map((lb) => lb.domain)).size;
    return {entries, recent, withCode, domains};
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
    <Layout title={CN.title} description="压缩研究 SOTA 榜单真相源">
      <WorkbenchShell pageTitle={CN.title}>
        <div className={styles.page}>
          <section className={styles.consoleHeader}>
            <div>
              <span className={styles.kicker}>Leaderboard Console</span>
              <h2>压缩榜单真相源</h2>
            </div>
            <div className={styles.liveBarCompact}>
              <a href="http://mattmahoney.net/dc/text.html" target="_blank" rel="noopener noreferrer">Mahoney <ExternalLink size={11} /></a>
              <a href="http://prize.hutter1.net/" target="_blank" rel="noopener noreferrer">Hutter Prize <ExternalLink size={11} /></a>
              <a href="https://clic2025.compression.cc/" target="_blank" rel="noopener noreferrer">CLIC <ExternalLink size={11} /></a>
            </div>
          </section>

          <section className={styles.kpiGrid}>
            <MetricTile label="Leaderboards" value={loaded ? lbs.length : '...'} hint={`${kpis.domains} 个领域`} icon={Trophy} tone="amber" />
            <MetricTile label="Entries" value={loaded ? kpis.entries : '...'} hint="方法 / codec 记录" icon={Table2} tone="blue" />
            <MetricTile label="2025+ Updated" value={loaded ? kpis.recent : '...'} hint="近年核验优先" icon={Globe2} tone="green" />
            <MetricTile label="Code Evidence" value={loaded ? kpis.withCode : '...'} hint="含代码链接条目" icon={Code2} tone="purple" />
          </section>

          <div className={styles.boardLayout}>
            <aside className={styles.boardSidebar}>
              <ResearchPanel eyebrow="Filter" title="领域筛选">
                <div className={styles.domainList}>
                  <button type="button" className={`${styles.domainBtn} ${domain === 'all' ? styles.domainBtnOn : ''}`} onClick={() => setDomain('all')}>
                    <Layers size={14} />
                    <span>{CN.all}</span>
                    <b>{domainCount.all ?? 0}</b>
                  </button>
                  {(Object.keys(LB_DOMAIN_LABELS) as LeaderboardDomain[]).map((d) => {
                    const count = domainCount[d] ?? 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={d}
                        type="button"
                        className={`${styles.domainBtn} ${domain === d ? styles.domainBtnOn : ''}`}
                        onClick={() => setDomain(d)}
                      >
                        <span className={styles.domainMark} />
                        <span>{LB_DOMAIN_LABELS[d].label}</span>
                        <b>{count}</b>
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
              ) : visible.length === 0 ? (
                <EmptyState icon={Search} title={CN.noResult} description="换一个领域或关键词再试。" />
              ) : (
                visible.map((lb) => (
                  <LeaderboardCard
                    key={lb.id}
                    lb={lb}
                    expanded={expanded.has(lb.id)}
                    onToggle={() => toggle(lb.id)}
                  />
                ))
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
  const sourceKind = /official|clic|hutter|mahoney/i.test(lb.sourceName) ? 'official' : 'curated';

  return (
    <article className={styles.lbCard}>
      <header className={styles.lbHeader}>
        <div className={styles.lbTitleBlock}>
          <div className={styles.lbDomain}>{LB_DOMAIN_LABELS[lb.domain].label}</div>
          <h3>{lb.title.replace(/[★🔥]/g, '').trim()}</h3>
          <div className={styles.lbMetaLine}>
            <span><strong>Dataset</strong>{lb.dataset}</span>
            <span><strong>Metric</strong>{lb.metric}</span>
            <span><strong>Updated</strong>{lb.updatedAt}</span>
          </div>
        </div>
        <div className={styles.lbEvidence}>
          <EvidenceBadge type={sourceKind}>{sourceKind === 'official' ? '官方 / 主榜' : '整理快照'}</EvidenceBadge>
          {hasPaper ? <EvidenceBadge type="paper">论文链接</EvidenceBadge> : null}
          {hasCode ? <EvidenceBadge type="code">代码链接</EvidenceBadge> : null}
        </div>
      </header>

      <div className={styles.sourceRow}>
        <SourceChip label={lb.sourceName} href={lb.sourceUrl} kind="source" />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.lbTable}>
          <thead>
            <tr>
              <th className={styles.colRank}>#</th>
              <th>方法</th>
              <th>年份</th>
              <th>指标</th>
              <th className={styles.colLinks}>证据</th>
            </tr>
          </thead>
          <tbody>
            {top.map((entry, index) => (
              <tr key={`${entry.method}-${index}`}>
                <td className={styles.colRank}>{entry.rank ?? index + 1}</td>
                <td className={styles.colMethod}>
                  <strong>{entry.method}</strong>
                  {entry.notes ? <span>{entry.notes}</span> : null}
                </td>
                <td className={styles.colYear}>{entry.year}</td>
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
