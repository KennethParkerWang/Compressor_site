import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  BadgeCheck,
  BookOpen,
  Database,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  LayoutGrid,
  PlayCircle,
  Rows3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Video,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  TUTORIAL_CATEGORY_META,
  TUTORIAL_LEVEL_LABELS,
  TUTORIAL_MEDIA_LABELS,
  TUTORIAL_QUALITY_LABELS,
  TUTORIAL_RESOURCES,
  getTutorialResourceCoverImage,
  type TutorialResource,
  type TutorialResourceCategory,
  type TutorialResourceLevel,
  type TutorialResourceMedia,
  type TutorialResourceQuality,
} from '../data/tutorials';
import styles from './tutorials.module.css';

type ViewMode = 'cover' | 'matrix';

const CATEGORY_ORDER: TutorialResourceCategory[] = [
  'foundation',
  'algorithm',
  'dataset',
  'benchmark',
  'implementation',
  'standards',
  'frontier',
  'course',
];

const MEDIA_ORDER: TutorialResourceMedia[] = [
  'article',
  'docs',
  'spec',
  'course',
  'video',
  'benchmark',
  'code',
  'paper-guide',
];

const LEVEL_ORDER: TutorialResourceLevel[] = ['intro', 'intermediate', 'advanced', 'reference'];

const QUALITY_ORDER: TutorialResourceQuality[] = ['official', 'standard', 'university', 'benchmark', 'author', 'community'];

const TRACKS: Array<{
  title: string;
  detail: string;
  categories: TutorialResourceCategory[];
}> = [
  {title: '基础建模', detail: '信息论、压缩管线、熵编码基础', categories: ['foundation']},
  {title: '算法拆解', detail: 'Huffman、LZ、ANS、PAQ、Zstd/Brotli', categories: ['algorithm', 'standards']},
  {title: '数据评测', detail: 'corpus、benchmark、评测规则和可复现记录', categories: ['dataset', 'benchmark']},
  {title: '前沿复现', detail: '学习型压缩、CLIC、CompressAI、TFC', categories: ['frontier', 'implementation']},
];

function countBy<T extends string>(items: TutorialResource[], key: (item: TutorialResource) => T): Partial<Record<T, number>> {
  return items.reduce<Partial<Record<T, number>>>((acc, item) => {
    const value = key(item);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function getHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getMediaIcon(media: TutorialResourceMedia): React.ComponentType<{size?: number}> {
  if (media === 'video') return Video;
  if (media === 'course') return GraduationCap;
  if (media === 'benchmark') return Database;
  if (media === 'spec') return ShieldCheck;
  return FileText;
}

function matchesText(resource: TutorialResource, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [
    resource.title,
    resource.subtitle,
    resource.source,
    resource.publisher,
    resource.language,
    resource.category,
    resource.media,
    resource.level,
    resource.quality,
    ...resource.topics,
    ...resource.useFor,
    ...(resource.prerequisites ?? []),
  ].some((value) => value.toLowerCase().includes(q));
}

function ResourceCoverCard({resource}: {resource: TutorialResource}): React.ReactElement {
  const Icon = getMediaIcon(resource.media);
  const coverImage = getTutorialResourceCoverImage(resource);
  const coverImageSrc = useBaseUrl(coverImage ?? '');
  return (
    <a
      className={`${styles.coverCard} ${coverImage ? styles.coverCardWithImage : ''}`}
      data-tone={resource.coverTone}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.coverSurface}>
        {coverImage ? (
          <>
            <img
              className={styles.coverImage}
              src={coverImageSrc}
              alt={resource.coverAlt ?? `${resource.title} webpage preview`}
              loading="lazy"
            />
            <div className={styles.coverScrim} />
          </>
        ) : null}
        <div className={styles.coverMeta}>
          <span>{TUTORIAL_MEDIA_LABELS[resource.media]}</span>
          <span>{TUTORIAL_QUALITY_LABELS[resource.quality]}</span>
        </div>
        <div className={styles.coverIcon}>
          <Icon size={24} />
          {resource.media === 'video' ? <PlayCircle size={16} /> : null}
        </div>
        <div className={styles.coverCategory}>{TUTORIAL_CATEGORY_META[resource.category].shortLabel}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3>{resource.title}</h3>
          <ExternalLink size={14} />
        </div>
        <p>{resource.subtitle}</p>
        <dl className={styles.cardFacts}>
          <div>
            <dt>Source</dt>
            <dd>{resource.source}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>{TUTORIAL_LEVEL_LABELS[resource.level]}</dd>
          </div>
          <div>
            <dt>Lang</dt>
            <dd>{resource.language}</dd>
          </div>
        </dl>
        <div className={styles.topicRow}>
          {resource.topics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}
        </div>
      </div>
    </a>
  );
}

function ResourceMatrixRow({resource}: {resource: TutorialResource}): React.ReactElement {
  const Icon = getMediaIcon(resource.media);
  const coverImage = getTutorialResourceCoverImage(resource);
  const coverImageSrc = useBaseUrl(coverImage ?? '');
  return (
    <a
      className={`${styles.matrixRow} ${coverImage ? styles.matrixRowWithImage : ''}`}
      data-tone={resource.coverTone}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.matrixMedia}>
        {coverImage ? (
          <img
            className={styles.matrixThumb}
            src={coverImageSrc}
            alt={resource.coverAlt ?? `${resource.title} webpage preview`}
            loading="lazy"
          />
        ) : null}
        <div className={styles.matrixMediaOverlay}>
          <Icon size={20} />
          <span>{TUTORIAL_MEDIA_LABELS[resource.media]}</span>
        </div>
      </div>
      <div className={styles.matrixMain}>
        <div className={styles.matrixTitleLine}>
          <h3>{resource.title}</h3>
          <ExternalLink size={14} />
        </div>
        <p>{resource.subtitle}</p>
        <div className={styles.matrixUse}>
          {resource.useFor.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      <div className={styles.matrixFacts}>
        <span>{TUTORIAL_CATEGORY_META[resource.category].label}</span>
        <span>{TUTORIAL_QUALITY_LABELS[resource.quality]} / {TUTORIAL_LEVEL_LABELS[resource.level]}</span>
        <span>{resource.language} / {resource.year ?? 'updated'}</span>
        <span>{getHost(resource.url)}</span>
      </div>
    </a>
  );
}

export default function TutorialsResourcePage(): React.ReactElement {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<TutorialResourceCategory | 'all'>('all');
  const [media, setMedia] = useState<TutorialResourceMedia | 'all'>('all');
  const [level, setLevel] = useState<TutorialResourceLevel | 'all'>('all');
  const [quality, setQuality] = useState<TutorialResourceQuality | 'all'>('all');
  const [videoOnly, setVideoOnly] = useState(false);
  const [view, setView] = useState<ViewMode>('cover');

  const counts = useMemo(() => ({
    category: countBy(TUTORIAL_RESOURCES, (item) => item.category),
    media: countBy(TUTORIAL_RESOURCES, (item) => item.media),
    quality: countBy(TUTORIAL_RESOURCES, (item) => item.quality),
    level: countBy(TUTORIAL_RESOURCES, (item) => item.level),
  }), []);

  const filtered = useMemo(() => {
    return TUTORIAL_RESOURCES.filter((resource) => {
      if (category !== 'all' && resource.category !== category) return false;
      if (media !== 'all' && resource.media !== media) return false;
      if (level !== 'all' && resource.level !== level) return false;
      if (quality !== 'all' && resource.quality !== quality) return false;
      if (videoOnly && resource.media !== 'video' && resource.media !== 'course') return false;
      return matchesText(resource, query.trim());
    });
  }, [category, level, media, quality, query, videoOnly]);

  const totals = useMemo(() => {
    const officialLike = TUTORIAL_RESOURCES.filter((item) =>
      item.quality === 'official' || item.quality === 'standard' || item.quality === 'university').length;
    const videoLike = TUTORIAL_RESOURCES.filter((item) => item.media === 'video' || item.media === 'course').length;
    const benchmarkLike = TUTORIAL_RESOURCES.filter((item) => item.category === 'dataset' || item.category === 'benchmark').length;
    const frontierLike = TUTORIAL_RESOURCES.filter((item) => item.category === 'frontier').length;
    return {officialLike, videoLike, benchmarkLike, frontierLike};
  }, []);

  function applyTrack(categories: TutorialResourceCategory[]): void {
    setCategory(categories[0]);
    setMedia('all');
    setLevel('all');
    setQuality('all');
    setVideoOnly(false);
  }

  function clearFilters(): void {
    setQuery('');
    setCategory('all');
    setMedia('all');
    setLevel('all');
    setQuality('all');
    setVideoOnly(false);
  }

  return (
    <Layout title="教程资源库" description="无损压缩与学习型压缩教程、说明贴、标准文档、视频课程和评测资料索引">
      <WorkbenchShell pageTitle="教程资源库">
        <main className={styles.page}>
          <section className={styles.hero}>
            <div className={styles.heroMain}>
              <span className={styles.eyebrow}>Curated Learning Resources</span>
              <h2>压缩算法教程、说明贴、视频课程与标准资料</h2>
              <div className={styles.heroActions}>
                <a href="https://stanforddatacompressionclass.github.io/notes/" target="_blank" rel="noopener noreferrer">
                  Stanford EE274 <ExternalLink size={12} />
                </a>
                <a href="https://www.rfc-editor.org/rfc/rfc8878.html" target="_blank" rel="noopener noreferrer">
                  Zstandard RFC <ExternalLink size={12} />
                </a>
                <a href="https://interdigitalinc.github.io/CompressAI/" target="_blank" rel="noopener noreferrer">
                  CompressAI <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className={styles.heroStats}>
              <div><strong>{TUTORIAL_RESOURCES.length}</strong><span>资源</span></div>
              <div><strong>{totals.officialLike}</strong><span>官方/标准/课程</span></div>
              <div><strong>{totals.videoLike}</strong><span>视频/课程</span></div>
              <div><strong>{totals.benchmarkLike}</strong><span>数据/评测</span></div>
            </div>
          </section>

          <section className={styles.trackGrid} aria-label="Learning tracks">
            {TRACKS.map((track) => (
              <button key={track.title} type="button" className={styles.trackCard} onClick={() => applyTrack(track.categories)}>
                <span>{track.title}</span>
                <strong>{track.detail}</strong>
              </button>
            ))}
          </section>

          <section className={styles.workspace}>
            <aside className={styles.sidebar}>
              <div className={styles.filterPanel}>
                <div className={styles.panelTitle}>
                  <Filter size={14} />
                  <span>分类</span>
                </div>
                <div className={styles.categoryList}>
                  <button type="button" className={category === 'all' ? styles.optionOn : styles.option} onClick={() => setCategory('all')}>
                    <span>全部资源</span>
                    <b>{TUTORIAL_RESOURCES.length}</b>
                  </button>
                  {CATEGORY_ORDER.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={category === item ? styles.optionOn : styles.option}
                      onClick={() => setCategory(item)}
                    >
                      <span>{TUTORIAL_CATEGORY_META[item].label}</span>
                      <b>{counts.category[item] ?? 0}</b>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterPanel}>
                <label className={styles.searchBox}>
                  <Search size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="检索标题、来源、算法、数据集"
                  />
                </label>
                <button type="button" className={videoOnly ? styles.videoToggleOn : styles.videoToggle} onClick={() => setVideoOnly((value) => !value)}>
                  <Video size={14} />
                  <span>只看视频/课程</span>
                </button>
              </div>

              <div className={styles.filterPanel}>
                <div className={styles.panelTitle}>
                  <SlidersHorizontal size={14} />
                  <span>媒体类型</span>
                </div>
                <div className={styles.pillWrap}>
                  <button type="button" className={media === 'all' ? styles.pillOn : styles.pill} onClick={() => setMedia('all')}>全部</button>
                  {MEDIA_ORDER.map((item) => (
                    <button key={item} type="button" className={media === item ? styles.pillOn : styles.pill} onClick={() => setMedia(item)}>
                      {TUTORIAL_MEDIA_LABELS[item]} <span>{counts.media[item] ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterPanel}>
                <div className={styles.panelTitle}>
                  <BookOpen size={14} />
                  <span>难度层级</span>
                </div>
                <div className={styles.pillWrap}>
                  <button type="button" className={level === 'all' ? styles.pillOn : styles.pill} onClick={() => setLevel('all')}>全部</button>
                  {LEVEL_ORDER.map((item) => (
                    <button key={item} type="button" className={level === item ? styles.pillOn : styles.pill} onClick={() => setLevel(item)}>
                      {TUTORIAL_LEVEL_LABELS[item]} <span>{counts.level[item] ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterPanel}>
                <div className={styles.panelTitle}>
                  <BadgeCheck size={14} />
                  <span>来源级别</span>
                </div>
                <div className={styles.pillWrap}>
                  <button type="button" className={quality === 'all' ? styles.pillOn : styles.pill} onClick={() => setQuality('all')}>全部</button>
                  {QUALITY_ORDER.map((item) => (
                    <button key={item} type="button" className={quality === item ? styles.pillOn : styles.pill} onClick={() => setQuality(item)}>
                      {TUTORIAL_QUALITY_LABELS[item]} <span>{counts.quality[item] ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className={styles.results}>
              <div className={styles.resultToolbar}>
                <div>
                  <span className={styles.resultLabel}>结果</span>
                  <strong>{filtered.length}</strong>
                  <span className={styles.resultMeta}> / {TUTORIAL_RESOURCES.length}</span>
                </div>
                <div className={styles.toolbarActions}>
                  <button type="button" onClick={clearFilters}>清空筛选</button>
                  <div className={styles.viewSwitch}>
                    <button type="button" className={view === 'cover' ? styles.viewOn : styles.viewBtn} onClick={() => setView('cover')} aria-label="封面卡片视图">
                      <LayoutGrid size={14} />
                    </button>
                    <button type="button" className={view === 'matrix' ? styles.viewOn : styles.viewBtn} onClick={() => setView('matrix')} aria-label="矩阵列表视图">
                      <Rows3 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <Search size={24} />
                  <h3>无匹配资源</h3>
                  <p>调整分类、媒体类型或关键词后重新检索。</p>
                </div>
              ) : view === 'cover' ? (
                <div className={styles.coverGrid}>
                  {filtered.map((resource) => <ResourceCoverCard key={resource.id} resource={resource} />)}
                </div>
              ) : (
                <div className={styles.matrixList}>
                  {filtered.map((resource) => <ResourceMatrixRow key={resource.id} resource={resource} />)}
                </div>
              )}
            </section>
          </section>
        </main>
      </WorkbenchShell>
    </Layout>
  );
}
