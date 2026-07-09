import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import PageHero from '../components/PageHero';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {ExternalLink, Filter, Search, ShieldAlert, Table2, Database, Layers3} from 'lucide-react';
import {MetricTile, StatusPill} from '../components/research-console/ResearchConsole';
import {
  compressionDatasets,
  DATASET_DOMAIN_LABELS,
  type CompressionDataset,
  type DatasetDomain,
  type DatasetRisk,
} from '../data/datasets';
import styles from './datasets.module.css';

const DOMAIN_ORDER: DatasetDomain[] = ['general', 'text', 'image', 'video', 'audio', 'scientific', 'genomic', 'structured'];
const RISK_LABEL: Record<DatasetRisk, string> = {low: '低风险', medium: '需核验', high: '授权敏感'};
const RISK_LABEL_EN: Record<DatasetRisk, string> = {low: 'Low risk', medium: 'Needs review', high: 'Sensitive license'};
const STATUS_LABEL: Record<CompressionDataset['citationStatus'], string> = {
  official: '官方入口',
  paper: '论文数据集',
  challenge: '挑战赛',
  curated: '整理子集',
};
const STATUS_LABEL_EN: Record<CompressionDataset['citationStatus'], string> = {
  official: 'Official source',
  paper: 'Paper dataset',
  challenge: 'Challenge dataset',
  curated: 'Curated subset',
};

const DOMAIN_LABEL_EN: Record<DatasetDomain, string> = {
  general: 'General / Mixed',
  text: 'Text / Language Modeling',
  image: 'Image',
  video: 'Video',
  audio: 'Audio / Speech',
  scientific: 'Scientific Arrays',
  genomic: 'Genomics',
  structured: 'Logs / Structured Data',
};

const COPY = {
  zh: {
    layoutTitle: '数据集',
    title: '压缩研究数据集与基准库',
    kicker: 'Dataset Registry',
    description: '压缩研究数据集与 benchmark 库',
    datasets: '数据集',
    datasetsHint: '公开入口与基准集',
    domains: '领域',
    domainsHint: '通用/文本/图像/视频/音频/科学/基因/结构化',
    lowRisk: '低风险',
    lowRiskHint: '引用与授权风险较低',
    review: '需核验',
    reviewHint: '需记录许可、子集和版本',
    domainFilter: '领域筛选',
    allDatasets: '全部数据集',
    risk: '风险',
    allRisk: '全部风险',
    search: '搜索数据集、场景或标签',
    table: 'Dataset Table',
    sourceRecorded: '来源入口已记录',
    dataset: '数据集',
    domain: '领域',
    scale: '规模',
    citation: '引用',
    subdomain: '子类',
    citationStatus: '引用状态',
    license: '授权/许可',
    boundary: '使用边界',
    tags: '标签',
    openSource: '打开来源',
    experiment: '实验台',
  },
  en: {
    layoutTitle: 'Datasets',
    title: 'Compression Dataset Registry',
    kicker: 'Dataset Registry',
    description: 'Benchmark datasets and source links for compression research',
    datasets: 'Datasets',
    datasetsHint: 'Public sources and benchmark corpora',
    domains: 'Domains',
    domainsHint: 'General, text, image, video, audio, scientific, genomic, structured',
    lowRisk: 'Low Risk',
    lowRiskHint: 'Lower citation and licensing risk',
    review: 'Needs Review',
    reviewHint: 'License, subset, and version must be recorded',
    domainFilter: 'Domain Filter',
    allDatasets: 'All Datasets',
    risk: 'Risk',
    allRisk: 'All Risk Levels',
    search: 'Search datasets, scenarios, or tags',
    table: 'Dataset Table',
    sourceRecorded: 'Source links recorded',
    dataset: 'Dataset',
    domain: 'Domain',
    scale: 'Scale',
    citation: 'Citation',
    subdomain: 'Subdomain',
    citationStatus: 'Citation Status',
    license: 'License',
    boundary: 'Usage Notes',
    tags: 'Tags',
    openSource: 'Open Source',
    experiment: 'Experiment Lab',
  },
};

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function hasCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function domainLabel(domain: DatasetDomain, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? DATASET_DOMAIN_LABELS[domain].label : DOMAIN_LABEL_EN[domain];
}

function riskLabel(risk: DatasetRisk, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? RISK_LABEL[risk] : RISK_LABEL_EN[risk];
}

function statusLabel(status: CompressionDataset['citationStatus'], lang: 'zh' | 'en'): string {
  return lang === 'zh' ? STATUS_LABEL[status] : STATUS_LABEL_EN[status];
}

function scaleLabel(scale: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return scale;
  return hasCjk(scale) ? 'See source for scale details' : scale;
}

function benchmarkUse(item: CompressionDataset, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return item.benchmarkUse;
  return `${item.name} is indexed as a ${DOMAIN_LABEL_EN[item.domain].toLowerCase()} benchmark candidate for compression experiments.`;
}

function usageNotes(item: CompressionDataset, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return item.notes;
  return item.risk === 'low'
    ? 'Suitable for reproducible experiments after recording the exact version and source URL.'
    : 'Use with an explicit subset definition, license note, and version record.';
}

export default function DatasetsPage(): React.ReactElement {
  const location = useLocation();
  const lang: 'zh' | 'en' = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const copy = COPY[lang];
  const [domain, setDomain] = useState<DatasetDomain | 'all'>('all');
  const [risk, setRisk] = useState<DatasetRisk | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(compressionDatasets[0]?.id ?? '');

  const selected = compressionDatasets.find((item) => item.id === selectedId) ?? compressionDatasets[0];
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return compressionDatasets.filter((item) => {
      if (domain !== 'all' && item.domain !== domain) return false;
      if (risk !== 'all' && item.risk !== risk) return false;
      if (!q) return true;
      return [
        item.name,
        item.subdomain,
        item.benchmarkUse,
        item.notes,
        item.license,
        item.scale,
        ...item.tags,
      ].some((value) => value.toLowerCase().includes(q));
    });
  }, [domain, query, risk]);

  const domainCounts = useMemo(() => {
    const map: Partial<Record<DatasetDomain | 'all', number>> = {all: compressionDatasets.length};
    for (const item of compressionDatasets) map[item.domain] = (map[item.domain] ?? 0) + 1;
    return map;
  }, []);

  const riskCounts = useMemo(() => ({
    low: compressionDatasets.filter((item) => item.risk === 'low').length,
    medium: compressionDatasets.filter((item) => item.risk === 'medium').length,
    high: compressionDatasets.filter((item) => item.risk === 'high').length,
  }), []);

  return (
    <Layout title={copy.layoutTitle} description={copy.description}>
      <WorkbenchShell pageTitle={copy.layoutTitle}>
        <div className={styles.page}>
          <PageHero
            kicker={copy.kicker}
            title={copy.title}
            actions={(
              <>
              <a href="https://corpus.canterbury.ac.nz/descriptions/" target="_blank" rel="noreferrer">
                Canterbury <ExternalLink size={12} />
              </a>
              <a href="http://mattmahoney.net/dc/text.html" target="_blank" rel="noreferrer">
                Mahoney <ExternalLink size={12} />
              </a>
              <a href="https://sdrbench.github.io/" target="_blank" rel="noreferrer">
                SDRBench <ExternalLink size={12} />
              </a>
              </>
            )}
          />

          <section className={styles.metrics}>
            <MetricTile label={copy.datasets} value={compressionDatasets.length} hint={copy.datasetsHint} icon={Database} tone="blue" />
            <MetricTile label={copy.domains} value={DOMAIN_ORDER.length} hint={copy.domainsHint} icon={Layers3} tone="purple" />
            <MetricTile label={copy.lowRisk} value={riskCounts.low} hint={copy.lowRiskHint} icon={ShieldAlert} tone="green" />
            <MetricTile label={copy.review} value={riskCounts.medium + riskCounts.high} hint={copy.reviewHint} icon={Filter} tone="amber" />
          </section>

          <section className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.panel}>
                <h3>{copy.domainFilter}</h3>
                <button type="button" className={domain === 'all' ? styles.filterOn : styles.filterBtn} onClick={() => setDomain('all')}>
                  <span>{copy.allDatasets}</span><b>{domainCounts.all}</b>
                </button>
                {DOMAIN_ORDER.map((item) => (
                  <button key={item} type="button" className={domain === item ? styles.filterOn : styles.filterBtn} onClick={() => setDomain(item)}>
                    <span>{domainLabel(item, lang)}</span><b>{domainCounts[item] ?? 0}</b>
                  </button>
                ))}
              </div>
              <div className={styles.panel}>
                <h3>{copy.risk}</h3>
                {(['all', 'low', 'medium', 'high'] as const).map((item) => (
                  <button key={item} type="button" className={risk === item ? styles.filterOn : styles.filterBtn} onClick={() => setRisk(item)}>
                    <span>{item === 'all' ? copy.allRisk : riskLabel(item, lang)}</span>
                    <b>{item === 'all' ? compressionDatasets.length : riskCounts[item]}</b>
                  </button>
                ))}
              </div>
              <label className={styles.searchBox}>
                <Search size={14} />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
              </label>
            </aside>

            <main className={styles.main}>
              <div className={styles.tablePanel}>
                <header className={styles.tableHeader}>
                  <div>
                    <span>{copy.table}</span>
                    <strong>{visible.length} / {compressionDatasets.length}</strong>
                  </div>
                  <StatusPill tone="blue">{copy.sourceRecorded}</StatusPill>
                </header>
                <div className={styles.datasetTable}>
                  <div className={styles.tableHead}>
                    <span>{copy.dataset}</span>
                    <span>{copy.domain}</span>
                    <span>{copy.scale}</span>
                    <span>{copy.citation}</span>
                    <span>{copy.risk}</span>
                  </div>
                  {visible.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === selected.id ? styles.tableRowOn : styles.tableRow}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span>
                        <strong>{item.name}</strong>
                        <em>{benchmarkUse(item, lang)}</em>
                      </span>
                      <span>{domainLabel(item.domain, lang)}</span>
                      <span>{scaleLabel(item.scale, lang)}</span>
                      <span>{statusLabel(item.citationStatus, lang)}</span>
                      <span data-risk={item.risk}>{riskLabel(item.risk, lang)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <aside className={styles.detail}>
                <header>
                  <span>{selected.id}</span>
                  <h3>{selected.name}</h3>
                </header>
                <p>{benchmarkUse(selected, lang)}</p>
                <div className={styles.detailGrid}>
                  <div><span>{copy.domain}</span><strong>{domainLabel(selected.domain, lang)}</strong></div>
                  <div><span>{copy.subdomain}</span><strong>{selected.subdomain}</strong></div>
                  <div><span>{copy.scale}</span><strong>{scaleLabel(selected.scale, lang)}</strong></div>
                  <div><span>{copy.citationStatus}</span><strong>{statusLabel(selected.citationStatus, lang)}</strong></div>
                  <div><span>{copy.license}</span><strong>{selected.license}</strong></div>
                  <div><span>{copy.risk}</span><strong>{riskLabel(selected.risk, lang)}</strong></div>
                </div>
                <section>
                  <h4>{copy.boundary}</h4>
                  <p>{usageNotes(selected, lang)}</p>
                </section>
                <section>
                  <h4>{copy.tags}</h4>
                  <div className={styles.tags}>
                    {selected.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </section>
                <div className={styles.detailActions}>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                    <Button><ExternalLink size={13} /> {copy.openSource}</Button>
                  </a>
                  <a href={`/experiments?dataset=${selected.id}`}>
                    <Button variant="outline"><Table2 size={13} /> {copy.experiment}</Button>
                  </a>
                </div>
              </aside>
            </main>
          </section>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}
