import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleGauge,
  Database,
  ExternalLink,
  FileSearch,
  FlaskConical,
  GitBranch,
  Layers3,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Target,
  X,
  Zap,
} from 'lucide-react';
import WorkbenchShell from '../../components/workbench/WorkbenchShell';
import {
  evolutionLanes,
  evolutionNodes,
  pipelineStages,
  scenarioMeta,
  type EvolutionNode,
  type PipelineStage,
  type ScenarioKey,
} from '../../data/algorithmEvolution';
import {
  compressionTypeLabels,
  getAlgorithmCatalogDetail,
  getCatalogCoverage,
  type AlgorithmCompressionType,
} from '../../data/algorithmCatalogDetails';
import styles from './styles.module.css';

type Lang = 'zh' | 'en';
type Objective = 'balanced' | 'ratio' | 'speed' | 'recent';
type TypeFilter = 'all' | AlgorithmCompressionType;
type StageFilter = 'all' | PipelineStage;

interface LocalizedText {
  zh: string;
  en: string;
}

interface CatalogRecord {
  node: EvolutionNode;
  detail: ReturnType<typeof getAlgorithmCatalogDetail>;
  coverage: ReturnType<typeof getCatalogCoverage>;
}

const COPY = {
  zh: {
    title: '压缩算法研究决策台',
    description: '按数据类型、研究目标、可逆性和证据完整度筛选压缩算法，建立可比较的候选集。',
    eyebrow: 'Algorithm research console',
    intro: '先定义数据和目标，再选择可比基线、前沿方法与评测协议。本页用于研究决策，不用目录评分替代真实实验。',
    algorithms: '方法条目',
    domains: '数据场景',
    sourced: '有来源条目',
    latest: '最新年份',
    lineage: '算法脉络',
    dossier: '算法档案',
    benchmark: 'SOTA 与基准',
    taskTitle: '定义研究任务',
    taskLead: '选择数据场景、优化目标和压缩类型。候选表会立即重排。',
    dataScenario: '数据场景',
    objective: '排序目标',
    compressionType: '压缩类型',
    all: '全部',
    search: '搜索算法、标签、作用或年份',
    pipeline: '处理阶段',
    shortlist: '候选算法短名单',
    shortlistLead: '顺序来自目录中的场景标签、速度/压缩潜力和来源覆盖，仅用于缩小研究范围。',
    candidates: '个候选',
    selected: '当前分析',
    role: '结构定位',
    value: '研究价值',
    evidence: '证据状态',
    sources: '个可访问来源',
    noMeasured: '未收录可比实测',
    measured: '已收录可核验数值',
    addCompare: '加入对比',
    removeCompare: '移出对比',
    compareFull: '对比位已满',
    openSource: '打开主来源',
    openDossier: '进入算法档案',
    openLineage: '查看演化关系',
    comparison: '三算法对比工作区',
    comparisonLead: '只比较结构属性。真实优劣必须在相同数据、参数、硬件和正确性约束下实验。',
    designProfile: '目录设计画像，不是 benchmark 分数',
    year: '年份',
    family: '技术族',
    stage: '主阶段',
    speed: '速度倾向',
    ratio: '压缩潜力',
    scope: '适用场景',
    remove: '移除',
    coverage: '数据类型覆盖与评测口径',
    coverageLead: '每个类型使用不同的强基线和指标，不能把所有压缩器塞进一张总榜。',
    baseline: '建议基线',
    metrics: '核心指标',
    entries: '目录条目',
    tracks: '研究路线',
    tracksLead: '从成熟工程基线到前沿模型，按同一问题域组织阅读、实现和消融。',
    question: '关键问题',
    inspect: '查看该算法',
    loop: '研究闭环',
    loopLead: '任何新算法都必须经过相同的任务定义、基线、实验与证据归档流程。',
    noResults: '当前筛选没有结果，请放宽条件。',
    rank: '序号',
    algorithm: '算法',
    compare: '对比',
    evidenceBoundary: '边界：1–5 档是目录中的定性设计标签，不是跨论文可直接比较的实测性能。',
  },
  en: {
    title: 'Compression Algorithm Research Console',
    description: 'Filter compression methods by data, objective, reversibility, and evidence coverage.',
    eyebrow: 'Algorithm research console',
    intro: 'Define the data and objective first, then choose comparable baselines, frontier methods, and an evaluation protocol. Catalog scores never replace experiments.',
    algorithms: 'method records',
    domains: 'data scenarios',
    sourced: 'sourced records',
    latest: 'latest year',
    lineage: 'Lineage',
    dossier: 'Dossiers',
    benchmark: 'SOTA & benchmarks',
    taskTitle: 'Define the research task',
    taskLead: 'Choose a data scenario, objective, and compression type. The shortlist updates immediately.',
    dataScenario: 'Data scenario',
    objective: 'Ranking objective',
    compressionType: 'Compression type',
    all: 'All',
    search: 'Search algorithms, tags, roles, or years',
    pipeline: 'Pipeline stage',
    shortlist: 'Candidate shortlist',
    shortlistLead: 'Ordering uses scenario tags, qualitative speed/ratio intent, and source coverage only to narrow the research space.',
    candidates: 'candidates',
    selected: 'Selected analysis',
    role: 'System role',
    value: 'Research value',
    evidence: 'Evidence status',
    sources: 'accessible sources',
    noMeasured: 'No comparable measurements indexed',
    measured: 'Verifiable measurements indexed',
    addCompare: 'Add to comparison',
    removeCompare: 'Remove from comparison',
    compareFull: 'Comparison is full',
    openSource: 'Open primary source',
    openDossier: 'Open dossiers',
    openLineage: 'View lineage',
    comparison: 'Three-method comparison workspace',
    comparisonLead: 'Only structural attributes are compared. Real conclusions require the same data, settings, hardware, and correctness constraints.',
    designProfile: 'Catalog design profile, not a benchmark score',
    year: 'Year',
    family: 'Family',
    stage: 'Primary stage',
    speed: 'Speed intent',
    ratio: 'Ratio potential',
    scope: 'Scenarios',
    remove: 'Remove',
    coverage: 'Data coverage and evaluation regimes',
    coverageLead: 'Each data type needs its own strong baselines and metrics; one universal leaderboard is not defensible.',
    baseline: 'Baselines',
    metrics: 'Core metrics',
    entries: 'records',
    tracks: 'Research tracks',
    tracksLead: 'Organize reading, implementation, and ablations from mature engineering baselines to frontier models.',
    question: 'Key question',
    inspect: 'Inspect method',
    loop: 'Research loop',
    loopLead: 'Every new method passes through the same task, baseline, experiment, and evidence workflow.',
    noResults: 'No candidates match. Relax the filters.',
    rank: 'Rank',
    algorithm: 'Algorithm',
    compare: 'Compare',
    evidenceBoundary: 'Boundary: 1–5 levels are qualitative catalog labels, not cross-paper benchmark results.',
  },
} as const;

const OBJECTIVES: readonly {id: Objective; label: LocalizedText; hint: LocalizedText}[] = [
  {id: 'balanced', label: {zh: '综合平衡', en: 'Balanced'}, hint: {zh: '速度与压缩潜力并重', en: 'Balance speed and ratio intent'}},
  {id: 'ratio', label: {zh: '压缩优先', en: 'Ratio first'}, hint: {zh: '优先高压缩潜力路线', en: 'Favor high-ratio designs'}},
  {id: 'speed', label: {zh: '速度优先', en: 'Speed first'}, hint: {zh: '优先吞吐和低延迟', en: 'Favor throughput and latency'}},
  {id: 'recent', label: {zh: '前沿优先', en: 'Frontier first'}, hint: {zh: '优先近年正式方法', en: 'Favor recent formal methods'}},
];

const TYPE_FILTERS: readonly TypeFilter[] = ['all', 'lossless', 'lossy', 'near-lossless', 'hybrid', 'format', 'model'];

const DOMAIN_GUIDANCE: Record<ScenarioKey, {baselines: string; metrics: LocalizedText}> = {
  archive: {baselines: 'Zstandard · xz/LZMA2 · gzip · Brotli', metrics: {zh: '压缩后字节 · 编解码吞吐 · 峰值内存 · SHA-256', en: 'Bytes · encode/decode throughput · peak memory · SHA-256'}},
  web: {baselines: 'gzip · Brotli · Zstandard', metrics: {zh: '传输字节 · 解码延迟 · CPU · 浏览器/协议支持', en: 'Transfer bytes · decode latency · CPU · protocol support'}},
  realtime: {baselines: 'LZ4 · Snappy · Zstandard', metrics: {zh: '吞吐 · p50/p99 延迟 · 工作集 · 压缩率', en: 'Throughput · p50/p99 latency · working set · ratio'}},
  text: {baselines: 'Brotli · PPMd · CMIX · L3TC', metrics: {zh: 'bits/byte · 编解码时间 · 模型大小 · 随机访问', en: 'Bits/byte · encode/decode time · model size · random access'}},
  image: {baselines: 'PNG · WebP Lossless · JPEG XL · JPEG-LS', metrics: {zh: '无损 bpp/字节；有损必须报告完整率失真曲线', en: 'Lossless bpp/bytes; lossy requires full rate-distortion curves'}},
  audio: {baselines: 'FLAC', metrics: {zh: 'bits/sample · 编解码吞吐 · seek · bit-exact', en: 'Bits/sample · throughput · seek · bit-exact'}},
  video: {baselines: 'FFV1', metrics: {zh: 'bits/frame · 编解码 fps · 切片恢复 · bit-exact', en: 'Bits/frame · encode/decode fps · slice recovery · bit-exact'}},
  timeseries: {baselines: 'Gorilla · Chimp · Elf · ALP', metrics: {zh: 'bytes/value · 写入吞吐 · 扫描/点查延迟 · 解码成本', en: 'Bytes/value · ingest throughput · scan/point latency · decode cost'}},
  tabular: {baselines: 'ALP · BtrBlocks · Zstandard', metrics: {zh: 'bytes/value · scan throughput · 查询时间 · SIMD 利用', en: 'Bytes/value · scan throughput · query time · SIMD utilization'}},
  genomics: {baselines: 'CRAM · DeepGeCo', metrics: {zh: 'bits/base/read · 吞吐 · 参考依赖 · 质量值策略', en: 'Bits/base/read · throughput · reference dependency · quality policy'}},
  'point-cloud': {baselines: 'Draco · MPEG G-PCC · UniPCGC', metrics: {zh: 'bpov/字节；有损同时报告 D1/D2 或任务质量', en: 'Bpov/bytes; lossy also reports D1/D2 or task quality'}},
  scientific: {baselines: 'bitshuffle · ZFP · SZ3 · ALP', metrics: {zh: '无损比率或率失真 · 误差界 · 吞吐 · CPU/GPU', en: 'Lossless ratio or RD · error bound · throughput · CPU/GPU'}},
  'max-ratio': {baselines: 'PAQ8PX · CMIX · LMCompress', metrics: {zh: 'bits/byte · 解码计算 · 内存 · 模型/边信息成本', en: 'Bits/byte · decode compute · memory · model/side-info cost'}},
};

const RESEARCH_TRACKS: readonly {id: string; title: LocalizedText; brief: LocalizedText; question: LocalizedText; algorithms: readonly string[]}[] = [
  {
    id: 'industrial',
    title: {zh: '通用工程无损', en: 'General-purpose lossless'},
    brief: {zh: '从快速匹配到强解析，覆盖系统吞吐、归档与 Web 分发。', en: 'From fast matching to stronger parsing across systems, archives, and web delivery.'},
    question: {zh: '怎样在压缩率、编码成本和解码延迟之间选可部署方案？', en: 'How should deployable codecs trade ratio, encode cost, and decode latency?'},
    algorithms: ['lz4', 'zstd', 'brotli', 'xz'],
  },
  {
    id: 'context',
    title: {zh: '高压缩概率建模', en: 'High-ratio probability modeling'},
    brief: {zh: '从 PPM/PAQ/CMIX 到大模型，研究更准概率带来的收益与计算代价。', en: 'From PPM/PAQ/CMIX to large models, study probability gains against compute cost.'},
    question: {zh: '新增模型复杂度是否在包含模型和解码成本后仍然值得？', en: 'Does added model complexity still pay after model and decode costs are counted?'},
    algorithms: ['ppmd', 'paq8px', 'cmix', 'lmcompress'],
  },
  {
    id: 'media',
    title: {zh: '图像与视听媒体', en: 'Image and audiovisual media'},
    brief: {zh: '以媒体结构专用预测、变换和标准格式为基线，再比较学习式模型。', en: 'Start with media-specific prediction, transforms, and standards before learned models.'},
    question: {zh: '当前任务是 bit-exact 无损，还是需要率失真和感知质量？', en: 'Is the task bit-exact, or does it require rate-distortion and perceptual quality?'},
    algorithms: ['jpeg-xl', 'flac', 'ffv1', 'callic'],
  },
  {
    id: 'numeric',
    title: {zh: '时序、列存与科学浮点', en: 'Time-series, columnar, and scientific floats'},
    brief: {zh: '区分流式 XOR、十进制转整数、bit-plane 与误差界科学压缩。', en: 'Separate streaming XOR, decimal-to-integer, bit-plane, and error-bounded methods.'},
    question: {zh: '数据来自传感器流、列式分析还是多维科学数组？', en: 'Does the data come from sensor streams, columnar analytics, or scientific arrays?'},
    algorithms: ['chimp', 'alp', 'btrblocks', 'sz3'],
  },
  {
    id: 'structured',
    title: {zh: '基因组与三维结构', en: 'Genomics and 3D structure'},
    brief: {zh: '利用参考序列、几何连接和属性结构，同时处理标准兼容与外部依赖。', en: 'Exploit references, geometry connectivity, and attributes while tracking standards and dependencies.'},
    question: {zh: '外部参考、量化或模型依赖是否被计入可移植性与码流成本？', en: 'Are references, quantization, and model dependencies counted in portability and rate?'},
    algorithms: ['cram', 'deepgeco', 'g-pcc', 'unipcgc'],
  },
  {
    id: 'learned',
    title: {zh: '学习式压缩前沿', en: 'Learned compression frontier'},
    brief: {zh: '覆盖无损预测、有损熵模型、状态空间模型和跨数据类型大模型压缩。', en: 'Covers lossless prediction, lossy entropy models, state-space models, and large-model compression.'},
    question: {zh: '参数、边信息、训练数据、硬件和解码确定性是否完整披露？', en: 'Are parameters, side information, training data, hardware, and decode determinism disclosed?'},
    algorithms: ['l3tc', 'fnlic', 'mambaic', 'msdzip'],
  },
];

const PIPELINE_EN: Record<PipelineStage, string> = {
  foundation: 'Theory / objective',
  match: 'Dictionary match',
  transform: 'Transform',
  model: 'Probability model',
  fusion: 'Model fusion',
  entropy: 'Entropy coder',
  container: 'Format / system',
};

function local(value: LocalizedText, lang: Lang): string {
  return value[lang];
}

function scoreRecord(record: CatalogRecord, objective: Objective): number {
  const {node, coverage} = record;
  const sourceBonus = Math.min(coverage.sourceCount, 3) * 0.15;
  if (objective === 'ratio') return node.ratio * 2 + node.speed * 0.35 + sourceBonus;
  if (objective === 'speed') return node.speed * 2 + node.ratio * 0.35 + sourceBonus;
  if (objective === 'recent') return node.year * 0.05 + node.ratio * 0.25 + sourceBonus;
  return node.speed + node.ratio + sourceBonus;
}

export default function AlgorithmBoardPage(): React.ReactElement {
  const {i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const [scenario, setScenario] = React.useState<'all' | ScenarioKey>('all');
  const [objective, setObjective] = React.useState<Objective>('balanced');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [stageFilter, setStageFilter] = React.useState<StageFilter>('all');
  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('zstd');
  const [compareIds, setCompareIds] = React.useState<string[]>(['lz4', 'zstd', 'xz']);

  const records = React.useMemo<CatalogRecord[]>(() => evolutionNodes
    .filter((node) => node.kind !== 'idea')
    .map((node) => {
      const detail = getAlgorithmCatalogDetail(node);
      return {node, detail, coverage: getCatalogCoverage(detail)};
    }), []);

  const visible = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records
      .filter((record) => scenario === 'all' || record.node.scenarios.includes(scenario))
      .filter((record) => typeFilter === 'all' || record.detail.compressionType === typeFilter)
      .filter((record) => stageFilter === 'all' || record.node.stage === stageFilter)
      .filter((record) => {
        if (!normalized) return true;
        const haystack = [
          record.node.title,
          record.node.subtitle,
          record.node.role,
          record.node.why,
          record.node.year,
          ...record.node.tags,
        ].join(' ').toLowerCase();
        return haystack.includes(normalized);
      })
      .sort((a, b) => scoreRecord(b, objective) - scoreRecord(a, objective) || b.node.year - a.node.year);
  }, [objective, query, records, scenario, stageFilter, typeFilter]);

  React.useEffect(() => {
    if (visible.length && !visible.some((record) => record.node.id === selectedId)) {
      setSelectedId(visible[0].node.id);
    }
  }, [selectedId, visible]);

  const selected = records.find((record) => record.node.id === selectedId) ?? visible[0] ?? records[0];
  const compared = compareIds
    .map((id) => records.find((record) => record.node.id === id))
    .filter((record): record is CatalogRecord => Boolean(record));
  const laneById = Object.fromEntries(evolutionLanes.map((lane) => [lane.id, lane]));
  const stageById = Object.fromEntries(pipelineStages.map((stage) => [stage.id, stage]));
  const sourcedCount = records.filter((record) => record.coverage.sourceCount > 0).length;
  const newestYear = Math.max(...records.map((record) => record.node.year));
  const primarySource = selected?.detail.sources.find((source) => source.url);

  const toggleCompare = (id: string): void => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const inspectAlgorithm = (id: string): void => {
    setSelectedId(id);
    window.requestAnimationFrame(() => document.getElementById('shortlist')?.scrollIntoView({behavior: 'smooth', block: 'start'}));
  };

  return (
    <Layout title={copy.title} description={copy.description}>
      <WorkbenchShell fullBleed>
        <div className={styles.page}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
              <div className={styles.heroLinks}>
                <Link to="/algorithm-evolution"><GitBranch size={15} />{copy.lineage}<ArrowRight size={14} /></Link>
                <Link to="/algorithm-catalog"><Database size={15} />{copy.dossier}<ArrowRight size={14} /></Link>
                <Link to="/sota"><BarChart3 size={15} />{copy.benchmark}<ArrowRight size={14} /></Link>
              </div>
            </div>
            <dl className={styles.heroStats}>
              <div><dt>{copy.algorithms}</dt><dd>{records.length}</dd></div>
              <div><dt>{copy.domains}</dt><dd>{scenarioMeta.length}</dd></div>
              <div><dt>{copy.sourced}</dt><dd>{sourcedCount}</dd></div>
              <div><dt>{copy.latest}</dt><dd>{newestYear}</dd></div>
            </dl>
          </header>

          <section className={styles.taskPanel} aria-labelledby="research-task-title">
            <header className={styles.sectionIntro}>
              <span>01</span>
              <div><h2 id="research-task-title">{copy.taskTitle}</h2><p>{copy.taskLead}</p></div>
            </header>

            <div className={styles.taskControls}>
              <FilterBlock label={copy.dataScenario} icon={<Database size={15} />}>
                <div className={styles.scenarioSegments}>
                  <button type="button" data-active={scenario === 'all'} onClick={() => setScenario('all')}>{copy.all}</button>
                  {scenarioMeta.map((item) => (
                    <button key={item.id} type="button" data-active={scenario === item.id} onClick={() => setScenario(item.id)} title={item.description}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </FilterBlock>

              <div className={styles.controlRow}>
                <FilterBlock label={copy.objective} icon={<Target size={15} />}>
                  <div className={styles.objectiveSegments}>
                    {OBJECTIVES.map((item) => (
                      <button key={item.id} type="button" data-active={objective === item.id} onClick={() => setObjective(item.id)} title={local(item.hint, lang)}>
                        {local(item.label, lang)}
                      </button>
                    ))}
                  </div>
                </FilterBlock>
                <FilterBlock label={copy.compressionType} icon={<ShieldCheck size={15} />}>
                  <div className={styles.typeSegments}>
                    {TYPE_FILTERS.map((item) => (
                      <button key={item} type="button" data-active={typeFilter === item} onClick={() => setTypeFilter(item)}>
                        {item === 'all' ? copy.all : compressionTypeLabels[item]}
                      </button>
                    ))}
                  </div>
                </FilterBlock>
              </div>

              <label className={styles.searchBox}>
                <Search size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
                {query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search" title="Clear search"><X size={14} /></button> : null}
              </label>
            </div>
          </section>

          <section className={styles.pipelinePanel} aria-label={copy.pipeline}>
            <header><Layers3 size={16} /><strong>{copy.pipeline}</strong></header>
            <div className={styles.pipelineStages}>
              <button type="button" data-active={stageFilter === 'all'} onClick={() => setStageFilter('all')}>
                <span>00</span><strong>{copy.all}</strong><small>{records.length}</small>
              </button>
              {pipelineStages.map((stage, index) => {
                const count = records.filter((record) => record.node.stage === stage.id).length;
                return (
                  <button key={stage.id} type="button" data-active={stageFilter === stage.id} onClick={() => setStageFilter(stage.id)} title={stage.description}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{lang === 'zh' ? stage.label : PIPELINE_EN[stage.id]}</strong>
                    <small>{count}</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="shortlist" className={styles.shortlistSection}>
            <header className={styles.sectionIntro}>
              <span>02</span>
              <div><h2>{copy.shortlist}</h2><p>{copy.shortlistLead}</p></div>
              <b>{visible.length} {copy.candidates}</b>
            </header>

            <div className={styles.shortlistWorkspace}>
              <div className={styles.candidateTableWrap}>
                {visible.length ? (
                  <table className={styles.candidateTable}>
                    <thead>
                      <tr>
                        <th>{copy.rank}</th>
                        <th>{copy.algorithm}</th>
                        <th>{copy.family}</th>
                        <th>{copy.stage}</th>
                        <th>{copy.speed}</th>
                        <th>{copy.ratio}</th>
                        <th>{copy.evidence}</th>
                        <th>{copy.compare}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.slice(0, 12).map((record, index) => {
                        const comparedNow = compareIds.includes(record.node.id);
                        const compareDisabled = compareIds.length >= 3 && !comparedNow;
                        return (
                          <tr key={record.node.id} data-active={record.node.id === selected?.node.id}>
                            <td><span className={styles.rank}>{String(index + 1).padStart(2, '0')}</span></td>
                            <td>
                              <button type="button" className={styles.algorithmName} onClick={() => setSelectedId(record.node.id)}>
                                <strong>{record.node.title}</strong>
                                <span>{record.node.year} · {compressionTypeLabels[record.detail.compressionType]}</span>
                              </button>
                            </td>
                            <td><span className={styles.familyLabel} style={{'--family-color': laneById[record.node.lane]?.color} as React.CSSProperties}>{laneById[record.node.lane]?.label}</span></td>
                            <td>{lang === 'zh' ? stageById[record.node.stage]?.label : PIPELINE_EN[record.node.stage]}</td>
                            <td><CompactScore value={record.node.speed} /></td>
                            <td><CompactScore value={record.node.ratio} /></td>
                            <td><span className={styles.sourceCount}>{record.coverage.sourceCount}</span></td>
                            <td>
                              <button
                                type="button"
                                className={styles.compareButton}
                                data-active={comparedNow}
                                onClick={() => toggleCompare(record.node.id)}
                                disabled={compareDisabled}
                                aria-label={comparedNow ? copy.removeCompare : compareDisabled ? copy.compareFull : copy.addCompare}
                                title={comparedNow ? copy.removeCompare : compareDisabled ? copy.compareFull : copy.addCompare}
                              >
                                {comparedNow ? <Check size={15} /> : <Plus size={15} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : <div className={styles.emptyState}><FileSearch size={24} /><strong>{copy.noResults}</strong></div>}
              </div>

              {selected ? (
                <aside className={styles.analysisPanel} style={{'--family-color': laneById[selected.node.lane]?.color} as React.CSSProperties}>
                  <header>
                    <span>{copy.selected}</span>
                    <div><strong>{selected.node.title}</strong><small>{selected.node.year} · {compressionTypeLabels[selected.detail.compressionType]}</small></div>
                  </header>
                  <div className={styles.analysisScores}>
                    <ScoreBlock label={copy.speed} value={selected.node.speed} />
                    <ScoreBlock label={copy.ratio} value={selected.node.ratio} />
                  </div>
                  <section><h3>{copy.role}</h3><p>{selected.node.role}</p></section>
                  <section><h3>{copy.value}</h3><p>{selected.node.why}</p></section>
                  <section>
                    <h3>{copy.scope}</h3>
                    <div className={styles.scopeTags}>{selected.node.scenarios.map((item) => <span key={item}>{scenarioMeta.find((scenarioItem) => scenarioItem.id === item)?.label ?? item}</span>)}</div>
                  </section>
                  <section className={styles.evidenceStatus}>
                    <h3>{copy.evidence}</h3>
                    <p><BookOpenCheck size={14} /><strong>{selected.coverage.sourceCount}</strong> {copy.sources}</p>
                    <p><Activity size={14} />{selected.coverage.hasRealBenchmark ? copy.measured : copy.noMeasured}</p>
                  </section>
                  <div className={styles.analysisActions}>
                    <Link to={`/algorithm-catalog?algorithm=${selected.node.id}`}><Database size={14} />{copy.openDossier}</Link>
                    <Link to={`/algorithm-evolution?node=${selected.node.id}`}><GitBranch size={14} />{copy.openLineage}</Link>
                    {primarySource?.url ? <a href={primarySource.url} target="_blank" rel="noreferrer"><ExternalLink size={14} />{copy.openSource}</a> : null}
                  </div>
                </aside>
              ) : null}
            </div>
            <p className={styles.boundaryNote}><ShieldCheck size={14} />{copy.evidenceBoundary}</p>
          </section>

          <section className={styles.comparisonSection}>
            <header className={styles.sectionIntro}>
              <span>03</span>
              <div><h2>{copy.comparison}</h2><p>{copy.comparisonLead}</p></div>
              <small>{copy.designProfile}</small>
            </header>
            <div className={styles.comparisonTableWrap}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th>{copy.algorithm}</th>
                    {compared.map((record) => (
                      <th key={record.node.id}>
                        <div><strong>{record.node.title}</strong><button type="button" onClick={() => toggleCompare(record.node.id)} aria-label={`${copy.remove} ${record.node.title}`} title={`${copy.remove} ${record.node.title}`}><X size={14} /></button></div>
                        <small>{record.node.subtitle}</small>
                      </th>
                    ))}
                    {Array.from({length: Math.max(0, 3 - compared.length)}).map((_, index) => <th key={`empty-${index}`} className={styles.emptyCompare}>{copy.addCompare}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow label={copy.year} records={compared} render={(record) => record.node.year} />
                  <ComparisonRow label={copy.compressionType} records={compared} render={(record) => compressionTypeLabels[record.detail.compressionType]} />
                  <ComparisonRow label={copy.family} records={compared} render={(record) => laneById[record.node.lane]?.label} />
                  <ComparisonRow label={copy.stage} records={compared} render={(record) => lang === 'zh' ? stageById[record.node.stage]?.label : PIPELINE_EN[record.node.stage]} />
                  <ComparisonRow label={copy.speed} records={compared} render={(record) => <CompactScore value={record.node.speed} />} />
                  <ComparisonRow label={copy.ratio} records={compared} render={(record) => <CompactScore value={record.node.ratio} />} />
                  <ComparisonRow label={copy.evidence} records={compared} render={(record) => `${record.coverage.sourceCount} ${copy.sources}`} />
                  <ComparisonRow label={copy.scope} records={compared} render={(record) => record.node.scenarios.map((id) => scenarioMeta.find((item) => item.id === id)?.label ?? id).join(' · ')} />
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.coverageSection}>
            <header className={styles.sectionIntro}>
              <span>04</span>
              <div><h2>{copy.coverage}</h2><p>{copy.coverageLead}</p></div>
            </header>
            <div className={styles.coverageTableWrap}>
              <table className={styles.coverageTable}>
                <thead><tr><th>{copy.dataScenario}</th><th>{copy.entries}</th><th>{copy.baseline}</th><th>{copy.metrics}</th><th /></tr></thead>
                <tbody>
                  {scenarioMeta.map((item) => {
                    const count = records.filter((record) => record.node.scenarios.includes(item.id)).length;
                    const guidance = DOMAIN_GUIDANCE[item.id];
                    return (
                      <tr key={item.id}>
                        <td><strong>{item.label}</strong><small>{item.description}</small></td>
                        <td><b>{count}</b></td>
                        <td>{guidance.baselines}</td>
                        <td>{local(guidance.metrics, lang)}</td>
                        <td><button type="button" onClick={() => { setScenario(item.id); document.getElementById('shortlist')?.scrollIntoView({behavior: 'smooth'}); }} aria-label={`${copy.inspect} ${item.label}`} title={`${copy.inspect} ${item.label}`}><ChevronRight size={16} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.tracksSection}>
            <header className={styles.sectionIntro}>
              <span>05</span>
              <div><h2>{copy.tracks}</h2><p>{copy.tracksLead}</p></div>
            </header>
            <div className={styles.trackGrid}>
              {RESEARCH_TRACKS.map((track, index) => (
                <article key={track.id} className={styles.track}>
                  <header><span>R{String(index + 1).padStart(2, '0')}</span><h3>{local(track.title, lang)}</h3></header>
                  <p>{local(track.brief, lang)}</p>
                  <div className={styles.trackQuestion}><CircleGauge size={15} /><span><b>{copy.question}</b>{local(track.question, lang)}</span></div>
                  <div className={styles.trackAlgorithms}>
                    {track.algorithms.map((id) => {
                      const record = records.find((item) => item.node.id === id);
                      return record ? <button type="button" key={id} onClick={() => inspectAlgorithm(id)}>{record.node.title}<ArrowRight size={13} /></button> : null;
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.researchLoop}>
            <header className={styles.sectionIntro}>
              <span>06</span>
              <div><h2>{copy.loop}</h2><p>{copy.loopLead}</p></div>
            </header>
            <ol>
              <li><span>01</span><Target size={18} /><div><strong>{lang === 'zh' ? '锁定任务' : 'Lock the task'}</strong><p>{lang === 'zh' ? '数据版本、无损/误差界、吞吐、延迟和资源目标。' : 'Dataset version, lossless/error-bound mode, throughput, latency, and resources.'}</p></div><Link to="/datasets"><ArrowRight size={15} /></Link></li>
              <li><span>02</span><Table2 size={18} /><div><strong>{lang === 'zh' ? '建立强基线' : 'Choose strong baselines'}</strong><p>{lang === 'zh' ? '通用基线、领域标准和最近研究方法分层比较。' : 'Layer general codecs, domain standards, and recent methods.'}</p></div><Link to="/algorithm-catalog"><ArrowRight size={15} /></Link></li>
              <li><span>03</span><FlaskConical size={18} /><div><strong>{lang === 'zh' ? '执行可复现实验' : 'Run reproducible experiments'}</strong><p>{lang === 'zh' ? '固定命令、参数、硬件、重复次数、哈希和失败日志。' : 'Fix commands, settings, hardware, repetitions, hashes, and failures.'}</p></div><Link to="/experiments"><ArrowRight size={15} /></Link></li>
              <li><span>04</span><BookOpenCheck size={18} /><div><strong>{lang === 'zh' ? '归档证据' : 'Archive evidence'}</strong><p>{lang === 'zh' ? '结果回指原始 CSV/JSON、论文、版本和实验记录。' : 'Link results to raw CSV/JSON, papers, versions, and logs.'}</p></div><Link to="/sota"><ArrowRight size={15} /></Link></li>
            </ol>
          </section>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function FilterBlock({label, icon, children}: {label: string; icon: React.ReactNode; children: React.ReactNode}): React.ReactElement {
  return <div className={styles.filterBlock}><span>{icon}{label}</span>{children}</div>;
}

function CompactScore({value}: {value: number}): React.ReactElement {
  return (
    <span className={styles.compactScore} aria-label={`${value} of 5`}>
      {Array.from({length: 5}).map((_, index) => <i key={index} data-on={index < value} />)}
    </span>
  );
}

function ScoreBlock({label, value}: {label: string; value: number}): React.ReactElement {
  return <div><span>{label}</span><CompactScore value={value} /><b>{value}/5</b></div>;
}

function ComparisonRow({label, records, render}: {label: string; records: CatalogRecord[]; render: (record: CatalogRecord) => React.ReactNode}): React.ReactElement {
  return (
    <tr>
      <th>{label}</th>
      {records.map((record) => <td key={`${label}-${record.node.id}`}>{render(record)}</td>)}
      {Array.from({length: Math.max(0, 3 - records.length)}).map((_, index) => <td key={`${label}-empty-${index}`} />)}
    </tr>
  );
}
