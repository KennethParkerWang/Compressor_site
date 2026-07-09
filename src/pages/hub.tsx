import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  Archive,
  Code2,
  Database,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  PackageOpen,
  Search,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {EmptyState, MetricTile, ResearchPanel} from '../components/research-console/ResearchConsole';
import {RESOURCES, RESOURCE_CATEGORY_LABELS, getResourceCoverImage, type Resource, type ResourceCategory} from '../data/resources';
import {literatureData} from '../data/literatureData';
import styles from './hub.module.css';

const RESOURCE_ORDER: ResourceCategory[] = ['tool', 'framework', 'pretrained', 'tutorial', 'project', 'standard', 'template'];

const CN = {
  title: '资源库 / Resource Library',
  noResult: '未找到匹配的资源',
};

function getHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function ResourceCover({resource}: {resource: Resource}): React.ReactElement {
  const [failed, setFailed] = useState(false);
  const image = getResourceCoverImage(resource);
  const imageSrc = useBaseUrl(image);
  const label = RESOURCE_CATEGORY_LABELS[resource.category].label;

  return (
    <div className={`${styles.resCover} ${failed ? styles.resCoverFallback : ''}`}>
      {!failed ? (
        <img
          src={imageSrc}
          alt={resource.coverAlt ?? `${resource.name} webpage preview`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : null}
      <div className={styles.resCoverOverlay}>
        <span>{label}</span>
        <strong>{getHost(resource.url)}</strong>
      </div>
      {failed ? (
        <div className={styles.resCoverFallbackBody}>
          <span>{resource.emoji}</span>
          <strong>{resource.name}</strong>
        </div>
      ) : null}
    </div>
  );
}

export default function Hub(): React.ReactElement {
  const [cat, setCat] = useState<ResourceCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const displayResources = useMemo(
    () => RESOURCES.filter((resource) => resource.category !== 'dataset' && resource.category !== 'leaderboard'),
    [],
  );

  const litById = useMemo(() => {
    const map: Record<string, typeof literatureData[number]> = {};
    for (const item of literatureData) map[item.id] = item;
    return map;
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map: Partial<Record<ResourceCategory, typeof RESOURCES>> = {};
    for (const resource of displayResources) {
      if (cat !== 'all' && resource.category !== cat) continue;
      if (q && !(
        resource.name.toLowerCase().includes(q) ||
        resource.briefZh.toLowerCase().includes(q) ||
        (resource.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      )) continue;
      (map[resource.category] = map[resource.category] || []).push(resource);
    }
    return map;
  }, [cat, displayResources, query]);

  const counts = useMemo(() => {
    const map: Partial<Record<ResourceCategory | 'all', number>> = {all: displayResources.length};
    for (const resource of displayResources) map[resource.category] = (map[resource.category] ?? 0) + 1;
    return map;
  }, [displayResources]);

  return (
    <Layout title={CN.title} description="压缩研究工具、课程、项目、标准与模板资源库">
      <WorkbenchShell pageTitle={CN.title}>
        <div className={styles.page}>
          <section className={styles.consoleHeader}>
            <div>
              <span className={styles.kicker}>Resource Library</span>
              <h2>工具、课程、项目、标准与模板</h2>
            </div>
            <div className={styles.liveBarCompact}>
              <a href="/sota">SOTA <LinkIcon size={11} /></a>
              <a href="/datasets">Datasets <Database size={11} /></a>
              <a href="https://www.acm.org/publications/policies/artifact-review-badging" target="_blank" rel="noopener noreferrer">
                Artifact Review <ExternalLink size={11} />
              </a>
            </div>
          </section>

          <section className={styles.kpiGrid}>
            <MetricTile label="Resources" value={displayResources.length} hint="不含 SOTA 与数据集" icon={Archive} tone="blue" />
            <MetricTile label="Tools" value={(counts.tool ?? 0) + (counts.framework ?? 0)} hint="codec / framework / library" icon={Code2} tone="green" />
            <MetricTile label="Standards" value={counts.standard ?? 0} hint="格式规范与官方文档" icon={FileText} tone="purple" />
            <MetricTile label="Templates" value={counts.template ?? 0} hint="报告、复现、验收模板" icon={PackageOpen} tone="amber" />
          </section>

          <div className={styles.resLayout}>
            <aside className={styles.boardSidebar}>
              <ResearchPanel eyebrow="Resource" title="资源筛选">
                <div className={styles.domainList}>
                  <button type="button" className={`${styles.domainBtn} ${cat === 'all' ? styles.domainBtnOn : ''}`} onClick={() => setCat('all')}>
                    <PackageOpen size={14} />
                    <span>全部资源</span>
                    <b>{counts.all}</b>
                  </button>
                  {RESOURCE_ORDER.map((c) => {
                    const count = counts[c] ?? 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.domainBtn} ${cat === c ? styles.domainBtnOn : ''}`}
                        onClick={() => setCat(c)}
                      >
                        <span className={styles.domainMark} />
                        <span>{RESOURCE_CATEGORY_LABELS[c].label}</span>
                        <b>{count}</b>
                      </button>
                    );
                  })}
                </div>
                <label className={styles.searchBox}>
                  <Search size={14} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索资源、标签或说明" />
                </label>
              </ResearchPanel>
            </aside>

            <main className={styles.resMain}>
              {Object.keys(grouped).length === 0 ? (
                <EmptyState icon={Search} title={CN.noResult} description="换一个类别或关键词再试。" />
              ) : (
                RESOURCE_ORDER.filter((c) => grouped[c]?.length).map((c) => (
                  <ResearchPanel
                    key={c}
                    eyebrow="Resource Group"
                    title={`${RESOURCE_CATEGORY_LABELS[c].label} · ${grouped[c]!.length}`}
                  >
                    <div className={styles.resGrid}>
                      {grouped[c]!.map((resource) => (
                        <article key={resource.name} className={styles.resCard}>
                          <ResourceCover resource={resource} />
                          <header className={styles.resHeader}>
                            <span className={styles.resType}>{resource.category}</span>
                            <h3>{resource.name}</h3>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" title="打开资源">
                              <ExternalLink size={14} />
                            </a>
                          </header>
                          <p>{resource.briefZh}</p>
                          {resource.tags?.length ? (
                            <div className={styles.resTags}>
                              {resource.tags.map((tag) => <span key={tag}>{tag}</span>)}
                            </div>
                          ) : null}
                          {(resource.relatedLits ?? []).length > 0 ? (
                            <div className={styles.resRel}>
                              <FileText size={12} />
                              关联 {(resource.relatedLits ?? []).map((id) => litById[id]?.title).filter(Boolean).length || resource.relatedLits!.length} 篇文献
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </ResearchPanel>
                ))
              )}
            </main>
          </div>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}
