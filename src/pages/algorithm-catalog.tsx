import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '../components/ui/dialog';
import {StatusPill} from '../components/research-console/ResearchConsole';
import {
  evolutionLanes,
  evolutionNodes,
  pipelineStages,
  scenarioMeta,
  type EvolutionLane,
  type EvolutionNode,
  type PipelineStage,
  type ScenarioKey,
} from '../data/algorithmEvolution';
import {
  BarChart3,
  Boxes,
  BookOpenCheck,
  Database,
  ExternalLink,
  FileText,
  GitBranch,
  Image as ImageIcon,
  Layers3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  Workflow,
} from 'lucide-react';
import {
  compressionTypeLabels,
  getAlgorithmCatalogDetail,
  getCatalogCoverage,
  sourceTypeLabels,
  type AlgorithmCatalogDetail,
  type AlgorithmSourceType,
} from '../data/algorithmCatalogDetails';
import styles from './algorithm-catalog.module.css';

const laneById = Object.fromEntries(evolutionLanes.map((lane) => [lane.id, lane]));
const stageById = Object.fromEntries(pipelineStages.map((stage) => [stage.id, stage]));
const scenarioById = Object.fromEntries(scenarioMeta.map((scenario) => [scenario.id, scenario]));

const sourceToneByType: Record<AlgorithmSourceType, 'blue' | 'green' | 'amber' | 'purple' | 'slate' | 'cyan'> = {
  paper: 'blue',
  standard: 'green',
  'official-doc': 'green',
  'official-repo': 'purple',
  benchmark: 'cyan',
  tutorial: 'amber',
  secondary: 'slate',
  missing: 'amber',
};

export default function AlgorithmCatalogPage(): React.ReactElement {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [lane, setLane] = useState<EvolutionLane | 'all'>('all');
  const [stage, setStage] = useState<PipelineStage | 'all'>('all');
  const [selected, setSelected] = useState<EvolutionNode | null>(null);
  const [sort, setSort] = useState<'time' | 'family' | 'ratio' | 'speed'>('time');
  const requestedAlgorithm = new URLSearchParams(location.search).get('algorithm');

  React.useEffect(() => {
    if (!requestedAlgorithm) return;
    const requestedNode = evolutionNodes.find((node) => node.id === requestedAlgorithm && node.kind !== 'idea');
    if (requestedNode) setSelected(requestedNode);
  }, [requestedAlgorithm]);

  const algorithms = useMemo(
    () => {
      const laneOrder = new Map(evolutionLanes.map((item, index) => [item.id, index]));
      const arr = evolutionNodes.filter((node) => node.kind !== 'idea').slice();
      if (sort === 'family') return arr.sort((a, b) => (laneOrder.get(a.lane) ?? 0) - (laneOrder.get(b.lane) ?? 0) || a.year - b.year);
      if (sort === 'ratio') return arr.sort((a, b) => b.ratio - a.ratio || b.year - a.year);
      if (sort === 'speed') return arr.sort((a, b) => b.speed - a.speed || b.year - a.year);
      return arr.sort((a, b) => b.year - a.year);
    },
    [sort],
  );

  const catalogRecords = useMemo(
    () => algorithms.map((node) => {
      const detail = getAlgorithmCatalogDetail(node);
      return {node, detail, coverage: getCatalogCoverage(detail)};
    }),
    [algorithms],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogRecords.filter(({node, detail}) => {
      if (lane !== 'all' && node.lane !== lane) return false;
      if (stage !== 'all' && node.stage !== stage) return false;
      if (!q) return true;
      return [
        node.title,
        node.subtitle,
        node.role,
        node.why,
        ...node.tags,
        ...detail.aliases,
        detail.compressionType,
        detail.sourceNature,
        detail.narratedFlow,
        ...detail.structure.map((item) => `${item.title} ${item.detail}`),
        ...detail.implementationNotes.map((item) => `${item.title} ${item.detail}`),
        ...detail.sources.map((source) => `${source.label} ${source.note}`),
        laneById[node.lane]?.label,
        stageById[node.stage]?.label,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
    });
  }, [catalogRecords, lane, query, stage]);

  const selectedDetail = selected ? getAlgorithmCatalogDetail(selected) : null;
  const selectedCoverage = selectedDetail ? getCatalogCoverage(selectedDetail) : null;
  const sourceRichCount = catalogRecords.filter((record) => record.coverage.sourceCount > 0).length;
  const benchmarkValueCount = catalogRecords.filter((record) => record.coverage.hasRealBenchmark).length;
  const diagramSlots = catalogRecords.filter((record) => record.detail.diagram.status === 'placeholder').length;

  return (
    <Layout title="算法档案库 / Algorithm Dossier" description="压缩算法档案库">
      <WorkbenchShell pageTitle="算法档案库 / Algorithm Dossier">
        <section className={styles.header}>
          <div>
            <span className={styles.kicker}>Algorithm Dossier</span>
            <h2>压缩算法档案库</h2>
          </div>
          <div className={styles.metrics}>
            <span><Boxes size={14} /> {algorithms.length} algorithms</span>
            <span><GitBranch size={14} /> {evolutionLanes.length} families</span>
            <span><ShieldCheck size={14} /> {sourceRichCount} sourced</span>
            <span><BarChart3 size={14} /> {benchmarkValueCount} measured</span>
            <span><ImageIcon size={14} /> {diagramSlots} graph slots</span>
          </div>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={14} />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索算法、结构、场景或标签" />
          </label>
          <div className={styles.filterGroup}>
            <button type="button" className={sort === 'time' ? styles.filterOn : ''} onClick={() => setSort('time')}>按时间</button>
            <button type="button" className={sort === 'family' ? styles.filterOn : ''} onClick={() => setSort('family')}>按分类</button>
            <button type="button" className={sort === 'ratio' ? styles.filterOn : ''} onClick={() => setSort('ratio')}>压缩率</button>
            <button type="button" className={sort === 'speed' ? styles.filterOn : ''} onClick={() => setSort('speed')}>速度</button>
          </div>
          <div className={styles.filterGroup}>
            <SlidersHorizontal size={14} />
            <button type="button" className={lane === 'all' ? styles.filterOn : ''} onClick={() => setLane('all')}>全部族</button>
            {evolutionLanes.map((item) => (
              <button key={item.id} type="button" className={lane === item.id ? styles.filterOn : ''} onClick={() => setLane(item.id)}>
                {item.short}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <button type="button" className={stage === 'all' ? styles.filterOn : ''} onClick={() => setStage('all')}>全部模块</button>
            {pipelineStages.map((item) => (
              <button key={item.id} type="button" className={stage === item.id ? styles.filterOn : ''} onClick={() => setStage(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.grid}>
          {visible.map(({node, detail, coverage}) => {
            const laneMeta = laneById[node.lane];
            const stageMeta = stageById[node.stage];
            return (
              <button key={node.id} type="button" className={styles.card} onClick={() => setSelected(node)} style={{'--lane': laneMeta.color} as React.CSSProperties}>
                <header>
                  <span>{node.year}</span>
                  <StatusPill tone={coverage.hasRealBenchmark ? 'green' : 'slate'}>{coverage.hasRealBenchmark ? '有公开数值' : '未收录表现'}</StatusPill>
                </header>
                <div className={styles.cardTitleRow}>
                  <h3>{node.title}</h3>
                  <span>{compressionTypeLabels[detail.compressionType]}</span>
                </div>
                {detail.diagram.image ? (
                  <div className={styles.cardFigure}>
                    <img src={detail.diagram.image} alt={`${node.title} mechanism figure`} loading="lazy" />
                  </div>
                ) : null}
                <p className={styles.cardSubtitle}>{node.subtitle}</p>
                <p className={styles.cardBrief}>{detail.cardHighlights[0]}</p>
                <div className={styles.cardMeta}>
                  <span>{laneMeta.label}</span>
                  <span>{stageMeta.label}</span>
                  <span>{detail.standardStatus}</span>
                </div>
                <div className={styles.coverageGrid}>
                  <span><FileText size={13} /> {coverage.sourceCount} sources</span>
                  <span><BarChart3 size={13} /> {coverage.hasRealBenchmark ? 'measured' : '未收录表现'}</span>
                  <span><ImageIcon size={13} /> {coverage.hasDiagram ? 'diagram' : 'slot'}</span>
                </div>
                <div className={styles.scoreBars}>
                  <ScoreBar label="Speed" value={node.speed} />
                  <ScoreBar label="Ratio" value={node.ratio} />
                </div>
                <div className={styles.tags}>
                  {node.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </button>
            );
          })}
        </section>

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className={styles.catalogDialog}>
            {selected && selectedDetail && selectedCoverage ? (
              <AlgorithmDetail node={selected} detail={selectedDetail} />
            ) : null}
          </DialogContent>
        </Dialog>
      </WorkbenchShell>
    </Layout>
  );
}

function ScoreBar({label, value}: {label: string; value: number}): React.ReactElement {
  return (
    <div className={styles.scoreBar}>
      <span>{label}</span>
      <div aria-label={`${label} ${value} of 5`}>
        {Array.from({length: 5}).map((_, index) => (
          <i key={index} data-on={index < value ? 'true' : 'false'} />
        ))}
      </div>
      <b>{value}/5</b>
    </div>
  );
}

function formatBenchmarkValue(value: string | number | null, unit: string): string {
  if (value === null || value === 'NaN') return 'NaN';
  if (typeof value === 'number') return `${value.toLocaleString()} ${unit}`;
  return `${value} ${unit}`.trim();
}

function AlgorithmDetail({node, detail}: {node: EvolutionNode; detail: AlgorithmCatalogDetail}): React.ReactElement {
  const lane = laneById[node.lane];
  const stage = stageById[node.stage];
  const coverage = getCatalogCoverage(detail);
  const primarySource = detail.sources.find((source) => source.url);
  const measurableBenchmarks = detail.benchmarks.filter((row) => row.value !== null && row.value !== 'NaN');

  return (
    <div className={styles.detail}>
      <div className={styles.detailScroll}>
        <DialogHeader className={styles.detailHeader}>
          <span className={styles.detailMeta}>{node.year} · {lane.label} · {stage.label}</span>
          <DialogTitle className={styles.detailTitle}>{node.title}</DialogTitle>
          <p className={styles.subtitle}>{node.subtitle}</p>
          <div className={styles.aliases}>
            {detail.aliases.slice(0, 6).map((alias) => <span key={alias}>{alias}</span>)}
          </div>
        </DialogHeader>

        <section className={styles.detailSummary}>
          <div>
            <h4>结构定位</h4>
            <p>{node.role}</p>
          </div>
          <div>
            <h4>技术价值</h4>
            <p>{node.why}</p>
          </div>
        </section>

        <section className={styles.dossierGrid}>
          <DossierField label="年份" value={node.year} />
          <DossierField label="技术族" value={lane.label} />
          <DossierField label="处理模块" value={stage.label} />
          <DossierField label="压缩类型" value={compressionTypeLabels[detail.compressionType]} />
          <DossierField label="输入单元" value={detail.inputUnit} />
          <DossierField label="输出单元" value={detail.outputUnit} />
          <DossierField label="标准状态" value={detail.standardStatus} />
          <DossierField label="实现状态" value={detail.implementationStatus} />
          <DossierField label="来源性质" value={detail.sourceNature} wide />
        </section>

        <section>
          <SectionTitle icon={<Layers3 size={15} />} title="算法结构" />
          <div className={styles.structureGrid}>
            {detail.structure.map((item) => (
              <article key={`${node.id}-structure-${item.title}`}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<BookOpenCheck size={15} />} title="压缩流程" />
          <p className={styles.narratedFlow}>{detail.narratedFlow}</p>
        </section>

        <section>
          <SectionTitle icon={<Wrench size={15} />} title="算法实现" />
          <div className={styles.implementationList}>
            {detail.implementationNotes.map((item) => (
              <article key={`${node.id}-implementation-${item.title}`}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Workflow size={15} />} title="技术步骤拆解" />
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>阶段</th>
                  <th>输入</th>
                  <th>处理动作</th>
                  <th>输出</th>
                </tr>
              </thead>
              <tbody>
                {detail.pipeline.map((step) => (
                  <tr key={`${node.id}-${step.name}`}>
                    <td><strong>{step.name}</strong></td>
                    <td>{step.input}</td>
                    <td>{step.operation}</td>
                    <td>{step.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <SectionTitle icon={<Database size={15} />} title="来源与证据" />
          <div className={styles.sourceList}>
            {detail.sources.map((source, index) => {
              const body = (
                <>
                  <span className={styles.sourceTop}>
                    <StatusPill tone={sourceToneByType[source.type]}>{sourceTypeLabels[source.type]}</StatusPill>
                    <strong>{source.label}</strong>
                    {source.url ? <ExternalLink size={13} /> : null}
                  </span>
                  <span className={styles.sourceNote}>{source.note}</span>
                </>
              );
              return source.url ? (
                <a key={`${source.label}-${index}`} href={source.url} target="_blank" rel="noreferrer" className={styles.sourceItem}>
                  {body}
                </a>
              ) : (
                <div key={`${source.label}-${index}`} className={styles.sourceItem}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle icon={<ImageIcon size={15} />} title="结构图位" />
          <div className={styles.diagramSlot} data-status={detail.diagram.status}>
            {detail.diagram.image ? (
              <figure className={styles.diagramFigure}>
                <img src={detail.diagram.image} alt={`${node.title} mechanism figure`} />
              </figure>
            ) : null}
            <div className={styles.diagramText}>
              <span>{detail.diagram.status === 'available' ? 'Diagram' : 'Reserved diagram slot'}</span>
              <strong>{detail.diagram.title}</strong>
              <p>{detail.diagram.caption}</p>
            </div>
            {detail.diagram.sourceUrl ? (
              <a href={detail.diagram.sourceUrl} target="_blank" rel="noreferrer">
                {detail.diagram.sourceLabel ?? 'Open diagram source'} <ExternalLink size={13} />
              </a>
            ) : (
              <span className={styles.nanBadge}>待插入框架图</span>
            )}
          </div>
        </section>

        {coverage.hasRealBenchmark ? (
          <section>
            <SectionTitle icon={<BarChart3 size={15} />} title="公开表现" />
            <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>数据集</th>
                    <th>指标</th>
                    <th>数值</th>
                    <th>实现/版本</th>
                    <th>参数</th>
                    <th>来源</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {measurableBenchmarks.map((row, index) => {
                    const value = formatBenchmarkValue(row.value, row.unit);
                    return (
                      <tr key={`${node.id}-benchmark-${index}`}>
                        <td>{row.dataset}</td>
                        <td>{row.metric}</td>
                        <td>{value}</td>
                        <td>{row.implementation}</td>
                        <td>{row.setting}</td>
                        <td>
                          {row.sourceUrl ? (
                            <a href={row.sourceUrl} target="_blank" rel="noreferrer">{row.sourceLabel}</a>
                          ) : row.sourceLabel}
                        </td>
                        <td>{row.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={styles.benchmarkNote}>
              <StatusPill tone="green">含可核验数值</StatusPill>
              <span>仅展示已绑定数据集、实现版本、参数或来源的条目；未抽取数据不在此处展示。</span>
            </div>
          </section>
        ) : null}

        <section>
          <SectionTitle icon={<Layers3 size={15} />} title="适用场景与边界" />
          <div className={styles.scenarios}>
            {node.scenarios.map((scenario: ScenarioKey) => (
              <span key={scenario}>
                <b>{scenarioById[scenario]?.label ?? scenario}</b>
                <small>{scenarioById[scenario]?.description ?? ''}</small>
              </span>
            ))}
          </div>
          <ul className={styles.limitations}>
            {detail.limitations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <div className={styles.detailActions}>
          <Button asChild variant="outline"><Link to={`/algorithm-evolution?node=${node.id}`}><GitBranch size={13} /> 查看演化关系</Link></Button>
          {primarySource ? (
            <Button asChild><a href={primarySource.url} target="_blank" rel="noreferrer"><ExternalLink size={13} /> 打开主来源</a></Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DossierField({label, value, wide = false}: {label: string; value: React.ReactNode; wide?: boolean}): React.ReactElement {
  return (
    <div className={styles.dossierField} data-wide={wide ? 'true' : 'false'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionTitle({icon, title}: {icon: React.ReactNode; title: string}): React.ReactElement {
  return (
    <h4 className={styles.sectionTitle}>
      {icon}
      <span>{title}</span>
    </h4>
  );
}
