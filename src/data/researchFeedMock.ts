// Research Feed - 联网更新候选
// 数据源: OpenAlex / Semantic Scholar / Unpaywall / arXiv / GitHub
// 所有新增条目先进入候选区,确认后入库

export type FeedSource = 'openalex' | 'semantic-scholar' | 'unpaywall' | 'arxiv' | 'github' ;

export type FeedBucket =
  | 'new-papers'
  | 'related'
  | 'open-access'
  | 'github'
  | 'needs-review';

export interface FeedItem {
  id: string;
  source: FeedSource;
  bucket: FeedBucket;
  title: string;
  authors: readonly string[];
  year: number;
  venue?: string;
  doi?: string;
  arxivId?: string;
  githubRepo?: string;
  oaPdfUrl?: string;
  citedBy?: number;
  matchedLitId?: string;
  reason: string;
  fetchedAt: string;
}

const isoMinusHours = (h: number): string => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

export const researchFeedMock: FeedItem[] = [];

export const feedBucketMeta: Record<FeedBucket, { label: string; hint: string; color: string }> = {
  'new-papers': { label: '新论文候选', hint: '过去 24-72h 出现的新论文', color: 'blue' },
  related: { label: '相关论文推荐', hint: '与已收藏文献引用网络相近', color: 'violet' },
  'open-access': { label: '可下载 PDF', hint: '检测到合法 OA PDF', color: 'emerald' },
  github: { label: 'GitHub 更新', hint: '你关注的仓库有新版本', color: 'amber' },
  'needs-review': { label: '待人工确认', hint: '需要人工判断是否入库', color: 'rose' },
};

export const feedSourceMeta: Record<FeedSource, { label: string; icon: string }> = {
  openalex: { label: 'OpenAlex', icon: '🅾️' },
  'semantic-scholar': { label: 'Semantic Scholar', icon: '🅢' },
  unpaywall: { label: 'Unpaywall', icon: '🅤' },
  arxiv: { label: 'arXiv', icon: '🅐' },
  github: { label: 'GitHub', icon: '🅖' },
};

export default researchFeedMock;
