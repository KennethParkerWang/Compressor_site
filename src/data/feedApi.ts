// feedApi.ts - Browser-side source synchronization.
// This is a manual candidate sync, not a production crawler. A backend job is
// still required for scheduled refresh, proxying, quota control, and audit logs.

import type {FeedItem, FeedSource} from './researchFeedMock';

const SEARCH_QUERY = 'learned compression OR neural compression OR image compression OR video compression OR lossless compression';
const SINCE_YEAR = 2024;
const CURRENT_YEAR = new Date().getFullYear();

function newId(src: string): string {
  return `${src.toUpperCase().slice(0, 2)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeText(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDoi(value: string | undefined): string {
  return normalizeText(value).replace(/^https doi org /, '').replace(/^doi /, '');
}

export function feedItemKey(item: FeedItem): string {
  if (item.doi) return `doi:${normalizeDoi(item.doi)}`;
  if (item.arxivId) return `arxiv:${normalizeText(item.arxivId)}`;
  if (item.githubRepo) return `github:${normalizeText(item.githubRepo)}`;
  return `title:${normalizeText(item.title)}`;
}

export function dedupeFeedItems(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  for (const item of items) {
    const key = feedItemKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function assertOk(response: Response, label: string): void {
  if (!response.ok) {
    throw new Error(`${label} HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
  }
}

function formatFetchError(label: string, error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? 'unknown error');
  if (raw === 'UNPAYWALL_EMAIL_REQUIRED') {
    return `${label} 需要在 Settings 中配置联系邮箱后同步。`;
  }
  if (raw === 'UNPAYWALL_EMAIL_INVALID') {
    return `${label} 联系邮箱格式无效，请在 Settings 中修正。`;
  }
  if (/failed to fetch|networkerror|load failed|cors/i.test(raw)) {
    return `${label} 请求未完成：可能受浏览器跨域、网络环境或接口限额影响，生产环境建议通过后端代理同步。`;
  }
  if (/HTTP 401|HTTP 403/i.test(raw)) {
    return `${label} 鉴权受限：请检查 API key、访问权限或接口策略。`;
  }
  if (/HTTP 429/i.test(raw)) {
    return `${label} 触发限流：稍后重试，或在 Settings 中配置 API key / 后端代理。`;
  }
  if (/HTTP 5\d\d/i.test(raw)) {
    return `${label} 服务端暂不可用：外部源返回 ${raw}。`;
  }
  return `${label} 同步失败：${raw}`;
}

function toYear(value: unknown): number {
  const year = Number(value);
  return Number.isFinite(year) ? year : 0;
}

async function fetchOpenAlex(): Promise<FeedItem[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(SEARCH_QUERY)}&filter=publication_year:${SINCE_YEAR}-${CURRENT_YEAR}&sort=relevance_score:desc&per_page=12`;
  const response = await fetch(url);
  assertOk(response, 'OpenAlex');
  const json = await response.json();
  return (json.results ?? [])
    .filter((work: any) => work?.title)
    .map((work: any): FeedItem => ({
      id: newId('oa'),
      source: 'openalex',
      bucket: 'new-papers',
      title: work.title,
      authors: (work.authorships ?? []).slice(0, 5).map((a: any) => a.author?.display_name ?? '').filter(Boolean),
      year: toYear(work.publication_year),
      venue: work.primary_location?.source?.display_name ?? work.host_venue?.display_name ?? '',
      doi: work.doi ? String(work.doi).replace('https://doi.org/', '') : undefined,
      citedBy: work.cited_by_count,
      oaPdfUrl: work.open_access?.oa_url ?? undefined,
      reason: 'OpenAlex relevance search: learned / neural / image / video compression',
      fetchedAt: new Date().toISOString(),
    }));
}

async function fetchArxiv(): Promise<FeedItem[]> {
  const query = 'all:"learned compression" OR all:"neural compression" OR all:"image compression" OR all:"video compression" OR all:"lossless compression"';
  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending`;
  const response = await fetch(url);
  assertOk(response, 'arXiv');
  const text = await response.text();
  return parseArxivAtom(text);
}

function parseArxivAtom(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const getTag = (tag: string): string => {
      const found = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return found ? found[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
    };
    const id = getTag('id');
    const arxivId = id.includes('/abs/') ? id.split('/abs/')[1] : '';
    const year = parseInt(getTag('published').slice(0, 4), 10) || 0;
    if (!arxivId || year < SINCE_YEAR) continue;
    const authors = Array.from(entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g))
      .map((author) => author[1].trim())
      .slice(0, 5);
    items.push({
      id: newId('ax'),
      source: 'arxiv',
      bucket: 'new-papers',
      title: getTag('title'),
      authors,
      year,
      venue: 'arXiv',
      arxivId,
      reason: 'arXiv submitted-date search: compression research query pack',
      fetchedAt: new Date().toISOString(),
    });
  }
  return items;
}

async function fetchSemanticScholar(apiKey?: string): Promise<FeedItem[]> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent('learned compression neural codec image video lossless')}&year=${SINCE_YEAR}-${CURRENT_YEAR}&limit=12&fields=title,authors,year,venue,citationCount,openAccessPdf,externalIds`;
  const options: RequestInit = {headers: {}};
  if (apiKey) (options.headers as Record<string, string>)['x-api-key'] = apiKey;
  const response = await fetch(url, options);
  assertOk(response, 'Semantic Scholar');
  const json = await response.json();
  return (json.data ?? [])
    .filter((paper: any) => paper?.title)
    .map((paper: any): FeedItem => ({
      id: newId('ss'),
      source: 'semantic-scholar',
      bucket: 'needs-review',
      title: paper.title,
      authors: (paper.authors ?? []).slice(0, 5).map((author: any) => author.name ?? '').filter(Boolean),
      year: toYear(paper.year),
      venue: paper.venue ?? '',
      doi: paper.externalIds?.DOI ?? undefined,
      arxivId: paper.externalIds?.ArXiv ?? undefined,
      citedBy: paper.citationCount,
      oaPdfUrl: paper.openAccessPdf?.url ?? undefined,
      reason: 'Semantic Scholar relevance search: compression + codec query pack',
      fetchedAt: new Date().toISOString(),
    }));
}

async function fetchGitHub(apiKey?: string): Promise<FeedItem[]> {
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const query = `compression codec pushed:>${since}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=10`;
  const options: RequestInit = {headers: {Accept: 'application/vnd.github.v3+json'}};
  if (apiKey) (options.headers as Record<string, string>).Authorization = `token ${apiKey}`;
  const response = await fetch(url, options);
  assertOk(response, 'GitHub');
  const json = await response.json();
  return (json.items ?? []).map((repo: any): FeedItem => ({
    id: newId('gh'),
    source: 'github',
    bucket: 'github',
    title: `${repo.full_name}${repo.description ? ` - ${repo.description}` : ''}`,
    authors: [],
    year: parseInt(String(repo.pushed_at).slice(0, 4), 10) || 0,
    venue: repo.language ?? '',
    githubRepo: repo.full_name,
    reason: `GitHub repository update: ${repo.stargazers_count ?? 0} stars, pushed ${String(repo.pushed_at).slice(0, 10)}`,
    fetchedAt: new Date().toISOString(),
  }));
}

async function fetchUnpaywall(apiKey?: string): Promise<FeedItem[]> {
  const email = apiKey?.trim();
  if (!email) throw new Error('UNPAYWALL_EMAIL_REQUIRED');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('UNPAYWALL_EMAIL_INVALID');

  const query = 'learned compression OR neural compression OR image compression OR video compression OR lossless compression';
  const url = `https://api.unpaywall.org/v2/search/?query=${encodeURIComponent(query)}&is_oa=true&email=${encodeURIComponent(email)}`;
  const response = await fetch(url);
  assertOk(response, 'Unpaywall');
  const json = await response.json();
  const records = (json.results ?? []).map((result: any) => result.response ?? result);
  return records
    .filter((record: any) => record?.title && record?.is_oa)
    .slice(0, 12)
    .map((record: any): FeedItem => {
      const doi = record.doi ? String(record.doi).replace('https://doi.org/', '') : undefined;
      const pdfUrl = record.best_oa_location?.url_for_pdf ?? record.oa_locations?.find((location: any) => location?.url_for_pdf)?.url_for_pdf;
      return {
        id: newId('up'),
        source: 'unpaywall',
        bucket: 'open-access',
        title: record.title,
        authors: (record.z_authors ?? []).slice(0, 5).map((author: any) => `${author.given ?? ''} ${author.family ?? ''}`.trim()).filter(Boolean),
        year: toYear(record.year),
        venue: record.journal_name ?? record.venue ?? '',
        doi,
        citedBy: record.citation_count,
        oaPdfUrl: pdfUrl ?? record.oa_url ?? undefined,
        reason: 'Unpaywall OA search: compression-related open access candidates',
        fetchedAt: new Date().toISOString(),
      };
    });
}

export interface SourceRefreshStatus {
  source: FeedSource;
  ok: boolean;
  state: 'disabled' | 'success' | 'empty' | 'error';
  count: number;
  message: string;
  refreshedAt?: string;
}

export interface RefreshResult {
  items: FeedItem[];
  errors: string[];
  sourceStatus: Partial<Record<FeedSource, SourceRefreshStatus>>;
}

export async function refreshFeed(opts: {
  sources: Record<string, {enabled: boolean; apiKey?: string}>;
}): Promise<RefreshResult> {
  const errors: string[] = [];
  const sourceStatus: Partial<Record<FeedSource, SourceRefreshStatus>> = {};
  const perSourceItems: Partial<Record<FeedSource, FeedItem[]>> = {};
  const refreshedAt = new Date().toISOString();

  const jobs: Array<{source: FeedSource; label: string; job: () => Promise<FeedItem[]>}> = [
    {source: 'openalex', label: 'OpenAlex', job: fetchOpenAlex},
    {source: 'arxiv', label: 'arXiv', job: fetchArxiv},
    {source: 'semantic-scholar', label: 'Semantic Scholar', job: () => fetchSemanticScholar(opts.sources['semantic-scholar']?.apiKey)},
    {source: 'github', label: 'GitHub', job: () => fetchGitHub(opts.sources.github?.apiKey)},
    {source: 'unpaywall', label: 'Unpaywall', job: () => fetchUnpaywall(opts.sources.unpaywall?.apiKey)},
  ];

  async function run(source: FeedSource, label: string, job: () => Promise<FeedItem[]>): Promise<void> {
    if (!opts.sources[source]?.enabled) {
      sourceStatus[source] = {
        source,
        ok: false,
        state: 'disabled',
        count: 0,
        message: `${label} 未启用，可在 Settings 中打开。`,
        refreshedAt,
      };
      return;
    }
    try {
      const items = dedupeFeedItems(await job());
      perSourceItems[source] = items;
      sourceStatus[source] = {
        source,
        ok: true,
        state: items.length > 0 ? 'success' : 'empty',
        count: items.length,
        message: items.length > 0 ? `${label} 本次返回 ${items.length} 条候选。` : `${label} 本次未返回符合查询条件的候选。`,
        refreshedAt,
      };
    } catch (error: unknown) {
      const message = formatFetchError(label, error);
      errors.push(message);
      sourceStatus[source] = {
        source,
        ok: false,
        state: 'error',
        count: 0,
        message,
        refreshedAt,
      };
    }
  }

  await Promise.allSettled(jobs.map(({source, label, job}) => run(source, label, job)));

  const results = jobs.flatMap(({source}) => perSourceItems[source] ?? []);

  return {
    items: dedupeFeedItems(results),
    errors,
    sourceStatus,
  };
}
