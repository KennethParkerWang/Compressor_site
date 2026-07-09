import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {useFeed, useTasks, useSettings} from '../stores/workbench';
import {feedBucketMeta, feedSourceMeta, type FeedBucket, type FeedSource, type FeedItem} from '../data/researchFeedMock';
import {literatureData} from '../data/literatureData';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Database,
  Eye,
  FileText,
  Inbox,
  Link as LinkIcon,
  Plus,
  RadioTower,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {formatRelative} from '../components/workbench/actions';
import {
  EmptyState,
  EvidenceBadge,
  InfoStrip,
  MetricTile,
  ResearchPanel,
  SourceChip,
  StatusPill,
} from '../components/research-console/ResearchConsole';
import styles from './research-feed.module.css';

const CN = {
  accept: '加入文献库',
  addToTask: '加入任务',
  all: '全部',
  bucket: '状态',
  citedBy: '被引',
  empty: '暂无网络候选',
  filterAll: '全部来源',
  hint: '跨源检索、候选去重与人工入库前的来源状态监控。',
  matched: '已匹配',
  moveTo: '移动到',
  newPapers: '新文献候选',
  noPdf: '未检测到 OA',
  oa: 'OA PDF',
  reject: '拒绝',
  refresh: '刷新网络源',
  search: '搜索候选',
  source: '来源',
  title: '来源监控 / Source Monitor',
  total: '候选',
  view: '查看',
  showAll: '展开详情',
  hide: '收起',
  allAuthors: '作者',
  unknown: '未知',
  dup: '库内重复',
  fetchedAt: '获取时间',
};

const SOURCE_ORDER: FeedSource[] = ['openalex', 'arxiv', 'semantic-scholar', 'github', 'unpaywall'];
type PillTone = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate' | 'cyan';

function sourceTone(status: ReturnType<typeof useFeed.getState>['sourceStatus'][FeedSource] | undefined, enabled: boolean): PillTone {
  if (!enabled || status?.state === 'disabled') return 'slate';
  if (!status) return 'amber';
  if (status.state === 'success') return 'green';
  if (status.state === 'empty') return 'amber';
  return 'red';
}

function sourceLabel(status: ReturnType<typeof useFeed.getState>['sourceStatus'][FeedSource] | undefined, enabled: boolean): string {
  if (!enabled || status?.state === 'disabled') return 'Off';
  if (!status) return '待同步';
  if (status.state === 'success') return '已同步';
  if (status.state === 'empty') return '本次为空';
  return '受限';
}

function sourceMessage(status: ReturnType<typeof useFeed.getState>['sourceStatus'][FeedSource] | undefined, enabled: boolean): string {
  if (status?.message) return status.message;
  return enabled ? '已启用，尚未执行本轮同步。' : '未启用，可在 Settings 中打开。';
}

export default function ResearchFeedPage(): React.ReactElement {
  const {
    items,
    isRefreshing,
    refreshError,
    lastRefreshAt,
    lastRefreshAdded,
    lastRefreshSeen,
    sourceStatus,
    accept,
    reject,
    moveToBucket,
    refresh,
  } = useFeed();
  const settings = useSettings((s) => s.settings);
  const {addTask} = useTasks();
  const [tab, setTab] = useState<FeedBucket | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<FeedSource | 'all'>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(id: string): void {
    setExpanded((state) => {
      const next = new Set(state);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let arr = items;
    if (tab !== 'all') arr = arr.filter((item) => item.bucket === tab);
    if (sourceFilter !== 'all') arr = arr.filter((item) => item.source === sourceFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.authors.join(' ').toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [items, tab, sourceFilter, query]);

  const bucketCounts = useMemo(() => {
    const map: Record<string, number> = {all: items.length};
    for (const bucket of Object.keys(feedBucketMeta) as FeedBucket[]) {
      map[bucket] = items.filter((item) => item.bucket === bucket).length;
    }
    return map;
  }, [items]);

  const sourceCounts = useMemo(() => {
    const map: Partial<Record<FeedSource, number>> = {};
    for (const item of items) map[item.source] = (map[item.source] ?? 0) + 1;
    return map;
  }, [items]);

  const enabledSources = SOURCE_ORDER.filter((source) => settings.sources[source]?.enabled).length;
  const lastFetched = items.map((item) => item.fetchedAt).sort().at(-1);
  const syncSummary = lastRefreshAt
    ? `最近同步新增 ${lastRefreshAdded} 条，外部源返回 ${lastRefreshSeen} 条；重复候选已按 DOI / arXiv / GitHub / 标题自动合并。`
    : '浏览器端同步受来源 API、CORS、限额与网络环境影响；生产版本建议接入后端任务队列、代理与审计日志。';

  async function handleRefresh(): Promise<void> {
    await refresh(settings.sources);
  }

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div className={styles.page}>
          <section className={styles.hero}>
            <div>
              <span className={styles.kicker}>Network Source Monitor</span>
              <h2>跨源检索与候选文献同步</h2>
              <p>
                按需同步 OpenAlex、arXiv、Semantic Scholar、GitHub 与 Unpaywall 的压缩算法相关候选。所有候选先进入人工确认队列，不会自动写入 Library 或 Tasks。
              </p>
            </div>
            <InfoStrip tone={refreshError ? 'amber' : lastRefreshAt ? 'green' : 'blue'}>
              {refreshError ?? syncSummary}
            </InfoStrip>
          </section>

          <section className={styles.metrics}>
            <MetricTile label="Candidates" value={items.length} hint="本地候选队列" icon={Inbox} tone={items.length ? 'blue' : 'slate'} />
            <MetricTile label="Sources On" value={enabledSources} hint={`${SOURCE_ORDER.length} 个来源`} icon={RadioTower} tone="green" />
            <MetricTile label="New Added" value={lastRefreshAdded} hint="最近一次同步新增" icon={CheckCircle2} tone={lastRefreshAdded ? 'green' : 'slate'} />
            <MetricTile label="Returned" value={lastRefreshSeen} hint="最近一次外部返回" icon={FileText} tone={lastRefreshSeen ? 'cyan' : 'slate'} />
            <MetricTile label="Last Sync" value={lastRefreshAt ? formatRelative(lastRefreshAt) : 'Never'} hint={lastFetched ? `最新候选 ${formatRelative(lastFetched)}` : '尚未同步'} icon={Clock3} tone="amber" />
          </section>

          <div className={styles.grid}>
            <ResearchPanel
              eyebrow="Source Status"
              title="网络源接入状态"
              description="展示每个外部源最近一次同步结果；失败通常来自浏览器跨域、接口限流、鉴权策略或当前网络环境。"
              action={<Button onClick={handleRefresh} disabled={isRefreshing}>{isRefreshing ? <><RefreshCw size={14} className={styles.spin} /> 刷新中</> : <><RefreshCw size={14} /> {CN.refresh}</>}</Button>}
            >
              <div className={styles.sourceList}>
                {SOURCE_ORDER.map((source) => {
                  const config = settings.sources[source];
                  const enabled = config?.enabled ?? false;
                  const count = sourceCounts[source] ?? 0;
                  const status = sourceStatus[source];
                  return (
                    <div key={source} className={styles.sourceRow}>
                      <span className={styles.sourceIcon}>
                        {source === 'github' ? <Code2 size={15} /> : source === 'unpaywall' ? <BookOpen size={15} /> : <RadioTower size={15} />}
                      </span>
                      <span className={styles.sourceBody}>
                        <strong>{feedSourceMeta[source].label}</strong>
                        <em>{sourceMessage(status, enabled)}</em>
                      </span>
                      <StatusPill tone={sourceTone(status, enabled)}>{sourceLabel(status, enabled)}</StatusPill>
                      <StatusPill tone={(status?.count ?? 0) ? 'blue' : 'slate'}>{status?.count ?? 0} returned</StatusPill>
                      <StatusPill tone={count ? 'cyan' : 'slate'}>{count} saved</StatusPill>
                    </div>
                  );
                })}
              </div>
              <div className={styles.sourceActions}>
                <Link to="/settings" className={styles.textLink}><Settings size={14} /> 配置来源 <ArrowRight size={13} /></Link>
                <Link to="/library" className={styles.textLink}><Database size={14} /> 回到文献库 <ArrowRight size={13} /></Link>
              </div>
            </ResearchPanel>

            <ResearchPanel
              eyebrow="Import Queue"
              title="候选导入队列"
              description="候选经过去重后保留在本地队列；确认价值后再进入 Library 或 Tasks，避免来源噪声污染事实库。"
            >
              <div className={styles.queueTools}>
                <div className={styles.filterMeta}>
                  <EvidenceBadge type="curated">人工确认入库</EvidenceBadge>
                  <EvidenceBadge type="unverified">来源候选</EvidenceBadge>
                  {refreshError ? <StatusPill tone="amber" icon={<AlertTriangle size={12} />}>部分来源受限</StatusPill> : null}
                  {lastRefreshAt ? <StatusPill tone="blue">新增 {lastRefreshAdded} / 返回 {lastRefreshSeen}</StatusPill> : null}
                </div>
                <div className={styles.toolRow}>
                  <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as any)}>
                    <SelectTrigger className={styles.srcSel}><SelectValue placeholder={CN.source} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{CN.filterAll}</SelectItem>
                      {SOURCE_ORDER.map((source) => (
                        <SelectItem key={source} value={source}>{feedSourceMeta[source].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className={styles.searchBox}>
                    <Search size={14} />
                    <Input placeholder={CN.search} value={query} onChange={(event) => setQuery(event.target.value)} className={styles.searchInput} />
                  </label>
                </div>
              </div>

              <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
                <TabsList className={styles.tabsList}>
                  <TabsTrigger value="all">{CN.all} ({bucketCounts.all})</TabsTrigger>
                  {(Object.keys(feedBucketMeta) as FeedBucket[]).map((bucket) => (
                    <TabsTrigger key={bucket} value={bucket}>{feedBucketMeta[bucket].label} ({bucketCounts[bucket]})</TabsTrigger>
                  ))}
                </TabsList>

                {(['all'] as const).concat(Object.keys(feedBucketMeta) as FeedBucket[]).map((bucket) => (
                  <TabsContent key={bucket} value={bucket}>
                    <ListView
                      items={filtered.filter((item) => bucket === 'all' || item.bucket === bucket)}
                      expanded={expanded}
                      toggleExpand={toggleExpand}
                      onAccept={accept}
                      onReject={reject}
                      onMove={moveToBucket}
                      onAddTask={(item) => {
                        addTask({
                          title: `阅读候选：${item.title}`,
                          description: item.reason,
                          status: 'todo',
                          lane: 'this-week',
                          refs: [{kind: 'paper', refId: item.id, label: item.title}],
                          estimatedMinutes: 90,
                          priority: 'normal',
                        });
                      }}
                      onView={(item) => {
                        const matched = literatureData.find((lit) => lit.title.toLowerCase() === item.title.toLowerCase());
                        if (matched) window.location.assign(`/library?lit=${matched.id}`);
                        else if (item.oaPdfUrl) window.open(item.oaPdfUrl, '_blank', 'noopener,noreferrer');
                        else if (item.doi) window.open(`https://doi.org/${item.doi}`, '_blank', 'noopener,noreferrer');
                        else if (item.arxivId) window.open(`https://arxiv.org/abs/${item.arxivId}`, '_blank', 'noopener,noreferrer');
                        else if (item.githubRepo) window.open(`https://github.com/${item.githubRepo}`, '_blank', 'noopener,noreferrer');
                        else toggleExpand(item.id);
                      }}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </ResearchPanel>
          </div>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function ListView({
  items,
  expanded,
  toggleExpand,
  onAccept,
  onReject,
  onMove,
  onAddTask,
  onView,
}: {
  items: FeedItem[];
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onMove: (id: string, bucket: FeedBucket) => void;
  onAddTask: (item: FeedItem) => void;
  onView: (item: FeedItem) => void;
}): React.ReactElement {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={CN.empty}
        description="当前没有待确认候选。可以手动同步外部来源，或从 Library / SOTA / Learned Compression 选择条目推进研究。"
        actions={(
          <>
            <Link to="/library" className={styles.textLink}>Library <ArrowRight size={13} /></Link>
            <Link to="/sota" className={styles.textLink}>SOTA <ArrowRight size={13} /></Link>
            <Link to="/neural-hub" className={styles.textLink}>Learned Compression <ArrowRight size={13} /></Link>
          </>
        )}
      />
    );
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const matchedLit = literatureData.find((lit) => lit.title.toLowerCase() === item.title.toLowerCase());
        const isExpanded = expanded.has(item.id);
        return (
          <li key={item.id} className={styles.card}>
            <div className={styles.cardTop}>
              <Badge variant="outline">{feedSourceMeta[item.source]?.label ?? item.source}</Badge>
              <Badge>{feedBucketMeta[item.bucket]?.label ?? item.bucket}</Badge>
              {matchedLit ? <Badge variant="default">{CN.matched} · {matchedLit.id}</Badge> : null}
              {matchedLit ? <Badge variant="default" style={{background: '#fee2e2', color: '#991b1b'}}>{CN.dup}</Badge> : null}
            </div>

            <h3 className={styles.cardTitle}>{item.title}</h3>

            <div className={styles.cardMeta}>
              <span><FileText size={12} /> {item.authors.slice(0, 3).join(', ') || CN.unknown}</span>
              <span>{item.year}</span>
              {item.venue ? <span><LinkIcon size={12} /> {item.venue}</span> : null}
              {item.citedBy ? <span><Bookmark size={12} /> {CN.citedBy} {item.citedBy}</span> : null}
            </div>

            <div className={styles.cardChips}>
              {item.doi ? <SourceChip label={item.doi} href={`https://doi.org/${item.doi}`} kind="paper" /> : null}
              {item.arxivId ? <SourceChip label={item.arxivId} href={`https://arxiv.org/abs/${item.arxivId}`} kind="paper" /> : null}
              {item.githubRepo ? <SourceChip label={item.githubRepo} href={`https://github.com/${item.githubRepo}`} kind="code" /> : null}
              {item.oaPdfUrl ? <EvidenceBadge type="official">{CN.oa}</EvidenceBadge> : <StatusPill tone="slate">{CN.noPdf}</StatusPill>}
            </div>

            <div className={styles.cardReason}>
              <Sparkles size={13} />
              <span>{item.reason}</span>
            </div>

            <div className={styles.cardFoot}>
              <span className={styles.cardTime}>{CN.fetchedAt}: {formatRelative(item.fetchedAt)}</span>
              <div className={styles.cardActions}>
                <Button size="sm" variant="ghost" onClick={() => onView(item)}><Eye size={13} /> {CN.view}</Button>
                <Button size="sm" variant="outline" onClick={() => onReject(item.id)}><Trash2 size={13} /> {CN.reject}</Button>
                <Button size="sm" variant="outline" onClick={() => onAddTask(item)}><Plus size={13} /> {CN.addToTask}</Button>
                <Button size="sm" onClick={() => onAccept(item.id)}><CheckCircle2 size={13} /> {CN.accept}</Button>
              </div>
            </div>

            <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(item.id)}>
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {isExpanded ? CN.hide : CN.showAll}
            </button>

            {isExpanded ? (
              <div className={styles.cardExpand}>
                <div><strong>{CN.allAuthors}:</strong> {item.authors.join(', ') || '-'}</div>
                {item.doi ? <div><strong>DOI:</strong> <a href={`https://doi.org/${item.doi}`} target="_blank" rel="noreferrer">{item.doi}</a></div> : null}
                {item.arxivId ? <div><strong>arXiv:</strong> <a href={`https://arxiv.org/abs/${item.arxivId}`} target="_blank" rel="noreferrer">{item.arxivId}</a></div> : null}
                {item.githubRepo ? <div><strong>Repo:</strong> <a href={`https://github.com/${item.githubRepo}`} target="_blank" rel="noreferrer">{item.githubRepo}</a></div> : null}
                {item.oaPdfUrl ? <div><strong>OA PDF:</strong> <a href={item.oaPdfUrl} target="_blank" rel="noreferrer">{item.oaPdfUrl}</a></div> : null}
                <div className={styles.moveRow}>
                  <strong>{CN.moveTo}:</strong>
                  {(Object.keys(feedBucketMeta) as FeedBucket[]).map((bucket) => (
                    <Button key={bucket} size="sm" variant="ghost" onClick={() => onMove(item.id, bucket)}>
                      {feedBucketMeta[bucket].label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
