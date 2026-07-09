import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {
  BarChart3,
  Brain,
  Code2,
  ExternalLink,
  FileText,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  EmptyState,
  EvidenceBadge,
  InfoStrip,
  MetricTile,
  SourceChip,
  StatusPill,
} from '../components/research-console/ResearchConsole';
import {
  NEURAL_ITEMS,
  MODALITY_META,
  SORT_MODES,
  LICENSE_OPTIONS,
  filterAndSort,
  getKpis,
  type NeuralItem,
  type NeuralModality,
  type SortMode,
  type LicenseFilter,
} from '../data/neuralHub';
import styles from './neural-hub.module.css';

const CN = {
  title: '深度学习压缩器 / Learned Compression',
  hint: '深度学习参与压缩器设计的论文、代码和 benchmark 证据库。',
  pickModality: '模态',
  pickYear: '年份范围',
  pickSota: '证据',
  pickLicense: 'License',
  pickMaturity: '成熟度',
  pickLang: '实现语言',
  resetFilter: '重置筛选',
  emptyHint: '没有匹配的项，试试重置筛选条件。',
};

export default function NeuralHubPage(): React.ReactElement {
  const [activeModality, setActiveModality] = useState<Set<NeuralModality>>(
    () => new Set<NeuralModality>(Object.keys(MODALITY_META) as NeuralModality[]),
  );
  const [yearMin, setYearMin] = useState(2017);
  const [yearMax, setYearMax] = useState(2026);
  const [onlyOpenSource, setOnlyOpenSource] = useState(false);
  const [hasSota, setHasSota] = useState<'any' | 'yes' | 'no'>('any');
  const [license, setLicense] = useState<LicenseFilter>('any');
  const [maturity, setMaturity] = useState<'all' | 'paper-only' | 'code-only' | 'mature'>('all');
  const [lang, setLang] = useState<'any' | 'python' | 'cpp' | 'rust'>('any');
  const [sort, setSort] = useState<SortMode>('sota');
  const [view, setView] = useState<'cards' | 'list'>('list');

  const kpis = useMemo(() => getKpis(NEURAL_ITEMS), []);
  const recent2024 = useMemo(() => NEURAL_ITEMS.filter((item) => item.year >= 2024).length, []);
  const recent2025 = useMemo(() => NEURAL_ITEMS.filter((item) => item.year >= 2025).length, []);
  const withBenchmark = useMemo(() => NEURAL_ITEMS.filter((item) => item.sotaBench).length, []);

  const result = useMemo(() => {
    return filterAndSort(
      NEURAL_ITEMS,
      activeModality,
      [yearMin, yearMax],
      onlyOpenSource,
      hasSota,
      license,
      maturity,
      lang,
      sort,
    );
  }, [activeModality, yearMin, yearMax, onlyOpenSource, hasSota, license, maturity, lang, sort]);

  const countByModality = useMemo(() => {
    const map = new Map<NeuralModality, number>();
    for (const item of NEURAL_ITEMS) map.set(item.modality, (map.get(item.modality) ?? 0) + 1);
    return map;
  }, []);

  function toggleModality(id: NeuralModality): void {
    setActiveModality((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetFilter(): void {
    setActiveModality(new Set(Object.keys(MODALITY_META) as NeuralModality[]));
    setYearMin(2017);
    setYearMax(2026);
    setOnlyOpenSource(false);
    setHasSota('any');
    setLicense('any');
    setMaturity('all');
    setLang('any');
    setSort('sota');
    setView('list');
  }

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div className={styles.page}>
          <section className={styles.heroBand}>
            <div>
              <span className={styles.kicker}>Learned Compression</span>
              <h2>深度学习压缩器库</h2>
              <p>聚焦深度学习实际参与压缩器设计的工作：概率模型、熵模型、可学习变换、神经图像/视频/音频 codec、LLM 无损压缩与生成式低码率方案。</p>
            </div>
            <InfoStrip tone="amber">{NEURAL_ITEMS.length} 条记录 · {recent2024} 条 2024+ · {withBenchmark} 条含 benchmark 证据</InfoStrip>
          </section>

          <section className={styles.kpiGrid}>
            <MetricTile label="Records" value={kpis.total} hint="深度学习压缩器条目" icon={Brain} tone="purple" />
            <MetricTile label="2024+" value={recent2024} hint="近年新工作" icon={Sparkles} tone="blue" />
            <MetricTile label="2025+" value={recent2025} hint="最新候选方向" icon={BarChart3} tone="green" />
            <MetricTile label="Code" value={kpis.open} hint={`开源率 ${Math.round((kpis.open / kpis.total) * 100)}%`} icon={Code2} tone="cyan" />
            <MetricTile label="Benchmark" value={withBenchmark} hint="含 SOTA / RD 证据" icon={FileText} tone="amber" />
          </section>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <section className={styles.sidePanel}>
                <h3><SlidersHorizontal size={14} /> {CN.pickModality}</h3>
                <div className={styles.modalityList}>
                  {(Object.values(MODALITY_META)).map((meta) => {
                    const active = activeModality.has(meta.id);
                    return (
                      <button
                        key={meta.id}
                        type="button"
                        className={styles.modalityRow}
                        data-active={active ? 1 : 0}
                        onClick={() => toggleModality(meta.id)}
                        style={{'--modality': meta.color} as React.CSSProperties}
                      >
                        <span className={styles.modalityMark} />
                        <span>
                          <strong>{meta.labelZh}</strong>
                          <em>{meta.brief}</em>
                        </span>
                        <b>{countByModality.get(meta.id) ?? 0}</b>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.sidePanel}>
                <h3><Filter size={14} /> {CN.pickYear}</h3>
                <div className={styles.yearRange}>
                  <div className={styles.yearLabel}><span>{yearMin}</span><span>{yearMax}</span></div>
                  <input type="range" min={2017} max={2026} value={yearMin} onChange={(event) => setYearMin(Math.min(Number(event.target.value), yearMax))} />
                  <input type="range" min={2017} max={2026} value={yearMax} onChange={(event) => setYearMax(Math.max(Number(event.target.value), yearMin))} />
                </div>
              </section>

              <section className={styles.sidePanel}>
                <h3><FileText size={14} /> {CN.pickSota}</h3>
                <div className={styles.chipGroup}>
                  <button type="button" className={styles.chip} data-active={hasSota === 'yes' ? 1 : 0} onClick={() => setHasSota(hasSota === 'yes' ? 'any' : 'yes')}>带 benchmark</button>
                  <button type="button" className={styles.chip} data-active={onlyOpenSource ? 1 : 0} onClick={() => setOnlyOpenSource(!onlyOpenSource)}>有代码</button>
                  <button type="button" className={styles.chip} data-active={yearMin >= 2024 ? 1 : 0} onClick={() => setYearMin(yearMin >= 2024 ? 2017 : 2024)}>2024+</button>
                  <button type="button" className={styles.chip} data-active={yearMin >= 2025 ? 1 : 0} onClick={() => setYearMin(yearMin >= 2025 ? 2017 : 2025)}>2025+</button>
                </div>
              </section>

              <section className={styles.sidePanel}>
                <h3><Code2 size={14} /> {CN.pickLicense}</h3>
                <div className={styles.chipGroup}>
                  {LICENSE_OPTIONS.map((item) => (
                    <button key={item} type="button" className={styles.chip} data-active={license === item ? 1 : 0} onClick={() => setLicense(item)}>
                      {item === 'only-paper' ? '仅论文' : item === 'any' ? '任意' : item}
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.sidePanel}>
                <h3><Sparkles size={14} /> {CN.pickMaturity}</h3>
                <div className={styles.chipGroup}>
                  <button type="button" className={styles.chip} data-active={maturity === 'all' ? 1 : 0} onClick={() => setMaturity('all')}>全部</button>
                  <button type="button" className={styles.chip} data-active={maturity === 'paper-only' ? 1 : 0} onClick={() => setMaturity('paper-only')}>仅论文</button>
                  <button type="button" className={styles.chip} data-active={maturity === 'code-only' ? 1 : 0} onClick={() => setMaturity('code-only')}>有代码</button>
                  <button type="button" className={styles.chip} data-active={maturity === 'mature' ? 1 : 0} onClick={() => setMaturity('mature')}>成熟</button>
                </div>
              </section>

              <section className={styles.sidePanel}>
                <h3><Code2 size={14} /> {CN.pickLang}</h3>
                <div className={styles.chipGroup}>
                  {(['any', 'python', 'cpp', 'rust'] as const).map((item) => (
                    <button key={item} type="button" className={styles.chip} data-active={lang === item ? 1 : 0} onClick={() => setLang(item)}>
                      {item === 'any' ? '任意' : item === 'cpp' ? 'C++' : item}
                    </button>
                  ))}
                </div>
              </section>

              <button type="button" className={styles.resetBtn} onClick={resetFilter}>
                <RotateCcw size={14} />
                {CN.resetFilter}
              </button>
            </aside>

            <main className={styles.mainCol}>
              <div className={styles.toolbar}>
                <div className={styles.toolbarTitle}>
                  <strong>{result.length}</strong>
                  <span>/ {NEURAL_ITEMS.length} 条匹配</span>
                </div>
                <label className={styles.sortSelect}>
                  排序
                  <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
                    {SORT_MODES.map((mode) => (
                      <option key={mode.id} value={mode.id}>{mode.label} · {mode.brief}</option>
                    ))}
                  </select>
                </label>
                <div className={styles.viewSwitch}>
                  <button type="button" className={view === 'list' ? styles.viewBtnOn : styles.viewBtn} onClick={() => setView('list')} title="紧凑列表">
                    <List size={14} />
                  </button>
                  <button type="button" className={view === 'cards' ? styles.viewBtnOn : styles.viewBtn} onClick={() => setView('cards')} title="卡片视图">
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>

              {result.length === 0 ? (
                <EmptyState icon={Brain} title={CN.emptyHint} description="当前筛选条件过窄。重置后可重新按模态、年份、代码和 benchmark 逐步收敛。" />
              ) : view === 'list' ? (
                <CompactList items={result} />
              ) : (
                <div className={styles.cardGrid}>
                  {result.map((item) => <NeuralCard key={item.id} item={item} />)}
                </div>
              )}
            </main>
          </div>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function CompactList({items}: {items: NeuralItem[]}): React.ReactElement {
  return (
    <div className={styles.listTable}>
      <div className={styles.listHead}>
        <span>年份</span>
        <span>工作 / 方向</span>
        <span>模态</span>
        <span>证据</span>
        <span>链接</span>
      </div>
      {items.map((item) => {
        const meta = MODALITY_META[item.modality];
        return (
          <article key={item.id} className={styles.listRow} style={{'--modality': meta.color} as React.CSSProperties}>
            <span className={styles.listYear}>{item.year}</span>
            <span className={styles.listTitle}>
              <strong>{item.title}</strong>
              <em>{item.venue} · {item.authors}</em>
            </span>
            <span><StatusPill tone="slate">{meta.labelZh}</StatusPill></span>
            <span className={styles.evidenceCell}>
              {item.sotaBench ? <EvidenceBadge type="paper">Benchmark</EvidenceBadge> : <EvidenceBadge type="curated">Radar</EvidenceBadge>}
              {item.codeUrl || item.github ? <EvidenceBadge type="code">Code</EvidenceBadge> : null}
            </span>
            <span className={styles.linkCell}>
              <a href={item.paperUrl} target="_blank" rel="noreferrer" title="论文"><FileText size={14} /></a>
              {item.codeUrl ? <a href={item.codeUrl} target="_blank" rel="noreferrer" title="代码"><Code2 size={14} /></a> : null}
            </span>
          </article>
        );
      })}
    </div>
  );
}

function NeuralCard({item}: {item: NeuralItem}): React.ReactElement {
  const meta = MODALITY_META[item.modality];
  const tone = item.losslessOrLossy === 'lossless' ? 'green' : item.losslessOrLossy === 'lossy' ? 'red' : 'blue';

  return (
    <article className={styles.card} style={{'--modality': meta.color} as React.CSSProperties}>
      <header className={styles.cardHead}>
        <span className={styles.cardMark} />
        <div>
          <div className={styles.cardMeta}>{item.year} · {item.venue}</div>
          <h3>{item.title}</h3>
        </div>
      </header>
      <p className={styles.authors}>{item.authors}</p>
      <div className={styles.badgeRow}>
        <StatusPill tone="slate">{meta.labelZh}</StatusPill>
        <StatusPill tone={tone}>{item.losslessOrLossy === 'lossless' ? '无损' : item.losslessOrLossy === 'lossy' ? '有损' : '混合'}</StatusPill>
        {item.sotaBench ? <EvidenceBadge type="paper">Benchmark</EvidenceBadge> : null}
        {item.codeUrl || item.github ? <EvidenceBadge type="code">Code</EvidenceBadge> : null}
      </div>
      <p className={styles.summary}>{item.summaryZh}</p>
      {item.sotaBench ? (
        <div className={styles.benchmark}>
          <strong>{item.sotaBench.dataset}</strong>
          <span>{item.sotaBench.metric}: {item.sotaBench.value}</span>
        </div>
      ) : null}
      <div className={styles.barGrid}>
        <Bar label="创新" value={item.qualityBar.novelty} />
        <Bar label="复用" value={item.qualityBar.reusability} />
        <Bar label="部署" value={item.qualityBar.deployment} />
        <Bar label="代码" value={item.qualityBar.codeQuality} />
      </div>
      <footer className={styles.cardFoot}>
        <div className={styles.sourceChips}>
          {item.github ? <SourceChip label={`${item.github.repo} · ${item.github.stars.toLocaleString()} stars`} href={item.codeUrl} kind="code" /> : null}
        </div>
        <div className={styles.cardLinks}>
          <a href={item.paperUrl} target="_blank" rel="noreferrer"><FileText size={13} /> 论文</a>
          {item.codeUrl ? <a href={item.codeUrl} target="_blank" rel="noreferrer"><Code2 size={13} /> 代码 <ExternalLink size={11} /></a> : null}
        </div>
      </footer>
    </article>
  );
}

function Bar({label, value}: {label: string; value: number}): React.ReactElement {
  return (
    <div className={styles.barCol}>
      <span>{label} {value}</span>
      <div><i style={{width: `${(value / 10) * 100}%`}} /></div>
    </div>
  );
}
