import React, {useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {
  evolutionBranches,
  evolutionEras,
  evolutionLanes,
  evolutionNodes,
  evolutionRelations,
  getEvolutionLane,
  getEvolutionNode,
  getPipelineStage,
  getScenario,
  pipelineStages,
  scenarioMeta,
  type EvolutionLane,
  type EvolutionNode,
  type EvolutionRelation,
} from '../data/algorithmEvolution';
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  GitBranch,
  History,
  Layers3,
  Maximize2,
  Minimize2,
  Route,
  Search,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import {
  MetricTile,
  ResearchPanel,
  StatusPill,
} from '../components/research-console/ResearchConsole';
import styles from './algorithm-evolution.module.css';

type LaneFilter = EvolutionLane | 'all';
type ViewMode = 'roadmap' | 'chains' | 'pipeline' | 'tradeoff' | 'scenarios';
type GraphScope = 'core' | 'all';

interface GraphPoint {
  x: number;
  y: number;
  lane: EvolutionLane;
  stack: number;
}

const CN = {
  title: '压缩算法演化图谱 / Compression Algorithm Atlas',
  hint: '面向通用无损、上下文建模与学习式压缩的主干谱系、工程取舍与场景映射。',
};

const KIND_LABEL: Record<EvolutionNode['kind'], string> = {
  idea: '思想',
  algorithm: '算法',
  format: '格式',
  codec: '压缩器',
  model: '模型',
  standard: '标准',
};

const VIEW_META: Array<{
  id: ViewMode;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {id: 'roadmap', label: '历史主线', description: '时间轴、技术域与关键关系', icon: Route},
  {id: 'chains', label: '技术分支', description: '算法族谱与改进动力', icon: GitBranch},
  {id: 'pipeline', label: '架构位置', description: '算法在压缩器流水线中的职责', icon: Workflow},
  {id: 'tradeoff', label: '性能取舍', description: '速度、压缩率与部署属性', icon: BarChart3},
  {id: 'scenarios', label: '场景适配', description: '数据类型与应用边界', icon: Layers3},
];

const GRAPH_WIDTH = 1680;
const GRAPH_LEFT = 150;
const GRAPH_RIGHT = 72;
const GRAPH_TOP = 92;
const GRAPH_ROW = 184;
const GRAPH_HEIGHT = GRAPH_TOP + evolutionLanes.length * GRAPH_ROW + 54;
const NODE_WIDTH = 146;
const KIND_DEPTH: Record<EvolutionNode['kind'], string> = {
  idea: '8%',
  algorithm: '14%',
  format: '18%',
  codec: '22%',
  model: '26%',
  standard: '20%',
};
const GRAPH_STRETCH = {
  fit: 1,
  wide: 1.32,
  max: 1.68,
} as const;

type GraphStretch = keyof typeof GRAPH_STRETCH;

const CORE_ROADMAP_IDS = new Set([
  'morse',
  'shannon',
  'huffman',
  'arithmetic',
  'range-coding',
  'ans',
  'lz77',
  'lz78',
  'lzw',
  'lzss',
  'deflate',
  'gzip',
  'png',
  'bwt',
  'bzip2',
  'lzma',
  'xz',
  'lzo',
  'lz4',
  'zstd',
  'brotli',
  'ppm',
  'ppmd',
  'ctw',
  'dmc',
  'paq',
  'paq8i',
  'paq8px',
  'zpaq',
  'cmix',
  'jpeg-ls',
  'webp-lossless',
  'bitshuffle',
  'zfp',
  'flac',
  'ffv1',
  'cram',
  'gorilla',
  'draco',
  'g-pcc',
  'jpeg-xl',
  'chimp',
  'sz3',
  'alp',
  'neural-entropy',
  'llm-compression',
  'lmcompress',
  'l3tc',
  'callic',
  'fnlic',
  'unipcgc',
  'deepgeco',
]);

const CORE_RELATION_LABELS = new Set([
  'shannon-huffman',
  'shannon-arithmetic',
  'lz77-deflate',
  'deflate-gzip',
  'deflate-png',
  'bwt-bzip2',
  'ppm-paq',
  'paq-paq8i',
  'paq8px-cmix',
  'lz4-zstd',
  'ans-zstd',
  'cmix-llm-compression',
]);

const TRADEOFF_LANDMARKS = new Set([
  'deflate',
  'gzip',
  'lzma',
  'paq',
  'paq8i',
  'cmix',
  'lz4',
  'snappy',
  'brotli',
  'zstd',
  'flac',
  'gorilla',
  'alp',
  'jpeg-xl',
  'sz3',
  'neural-entropy',
  'llm-compression',
  'lmcompress',
  'l3tc',
]);

const SCENARIO_NOTES: Record<string, string> = {
  archive: '关注通用性、兼容性和最终文件大小,编码慢一些通常可以接受。',
  web: '关注传输体积、浏览器/服务端支持和解码速度,典型对象是 HTML/CSS/JS/字体。',
  realtime: '关注低延迟和吞吐,常见于日志、缓存、数据库页、RPC 或内存块。',
  text: '文本有强上下文和重复结构,适合 BWT、PPM、Brotli、PAQ 等模型。',
  image: '图像有二维局部相关性,通常需要预测、过滤、颜色变换或专用模型。',
  audio: '无损音频依赖波形预测与残差编码，需报告 bits/sample、seek、吞吐和 PCM 精确恢复。',
  video: '无损视频需区分帧内/帧间、切片恢复和归档兼容，不能与有损视频的率失真榜混排。',
  timeseries: '时序浮点方法利用时间戳差分、XOR 位模式或十进制语义，应同时测写入、扫描和点查。',
  tabular: '列存压缩要把解码成本放进扫描和查询执行，不能只看脱离系统的压缩率。',
  genomics: '基因组数据需按 FASTQ/FASTA/BAM/CRAM/VCF、参考依赖和质量值策略分别比较。',
  'point-cloud': '点云需区分几何与属性、有损与无损，并对齐 G-PCC/Draco 等标准或工程基线。',
  scientific: '科学数组有数值连续性、bit-plane 和块结构,不应只当普通字节流处理。',
  'max-ratio': '极限压缩率路线通常牺牲速度、内存和实现复杂度,更像研究上限或离线工具。',
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function knownInfluences(node: EvolutionNode): EvolutionNode[] {
  return node.influences
    .map((id) => getEvolutionNode(id))
    .filter((item): item is EvolutionNode => Boolean(item));
}

function getRelation(from: string, to: string): EvolutionRelation | undefined {
  return evolutionRelations.find((relation) => relation.from === from && relation.to === to);
}

function collectLineageIds(selectedId: string, relations: readonly EvolutionRelation[]): Set<string> {
  const ancestors = new Set<string>([selectedId]);
  const descendants = new Set<string>([selectedId]);
  let ancestorChanged = true;
  while (ancestorChanged) {
    ancestorChanged = false;
    for (const relation of relations) {
      if (ancestors.has(relation.to) && !ancestors.has(relation.from)) {
        ancestors.add(relation.from);
        ancestorChanged = true;
      }
    }
  }
  let descendantChanged = true;
  while (descendantChanged) {
    descendantChanged = false;
    for (const relation of relations) {
      if (descendants.has(relation.from) && !descendants.has(relation.to)) {
        descendants.add(relation.to);
        descendantChanged = true;
      }
    }
  }
  return new Set([...ancestors, ...descendants]);
}

function parseEraYears(years: string): [number, number] {
  const matches = years.match(/\d{4}/g)?.map(Number);
  return [matches?.[0] ?? 0, matches?.[1] ?? matches?.[0] ?? 0];
}

function yearToX(year: number, graphWidth = GRAPH_WIDTH): number {
  const eraWidth = (graphWidth - GRAPH_LEFT - GRAPH_RIGHT) / evolutionEras.length;
  const eraIndex = Math.max(
    0,
    evolutionEras.findIndex((era) => {
      const [start, end] = parseEraYears(era.years);
      return year >= start && year <= end;
    }),
  );
  const [start, end] = parseEraYears(evolutionEras[eraIndex]?.years ?? evolutionEras[0].years);
  const local = end === start ? 0.5 : Math.min(1, Math.max(0, (year - start) / (end - start)));
  return GRAPH_LEFT + eraIndex * eraWidth + local * eraWidth;
}

export default function AlgorithmEvolutionPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialNode = params.get('node');
  const [laneFilter, setLaneFilter] = useState<LaneFilter>('all');
  const [view, setView] = useState<ViewMode>('roadmap');
  const [graphScope, setGraphScope] = useState<GraphScope>('core');
  const [selectedId, setSelectedId] = useState(initialNode && getEvolutionNode(initialNode) ? initialNode : 'deflate');
  const [isRoadmapFullscreen, setRoadmapFullscreen] = useState(false);

  React.useEffect(() => {
    if (initialNode && getEvolutionNode(initialNode)) setSelectedId(initialNode);
  }, [initialNode]);

  React.useEffect(() => {
    if (view !== 'roadmap' && isRoadmapFullscreen) setRoadmapFullscreen(false);
  }, [isRoadmapFullscreen, view]);

  React.useEffect(() => {
    if (!isRoadmapFullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRoadmapFullscreen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isRoadmapFullscreen]);

  const selected = getEvolutionNode(selectedId) ?? evolutionNodes[0];
  const selectedLane = getEvolutionLane(selected.lane);

  const visibleNodes = useMemo(
    () =>
      (laneFilter === 'all' ? evolutionNodes : evolutionNodes.filter((node) => node.lane === laneFilter))
        .slice()
        .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title)),
    [laneFilter],
  );

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleRelations = useMemo(
    () => evolutionRelations.filter((relation) => visibleNodeIds.has(relation.from) && visibleNodeIds.has(relation.to)),
    [visibleNodeIds],
  );
  const roadmapNodes = useMemo(
    () => (graphScope === 'core' ? visibleNodes.filter((node) => CORE_ROADMAP_IDS.has(node.id)) : visibleNodes),
    [graphScope, visibleNodes],
  );
  const roadmapIds = useMemo(() => new Set(roadmapNodes.map((node) => node.id)), [roadmapNodes]);
  const roadmapRelations = useMemo(
    () => visibleRelations.filter((relation) => roadmapIds.has(relation.from) && roadmapIds.has(relation.to)),
    [roadmapIds, visibleRelations],
  );

  const firstYear = Math.min(...evolutionNodes.map((node) => node.year));
  const lastYear = Math.max(...evolutionNodes.map((node) => node.year));
  const activeView = VIEW_META.find((item) => item.id === view) ?? VIEW_META[0];

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title}>
        <div className={styles.page}>
          <section className={styles.hero}>
            <div>
              <span className={styles.kicker}>Algorithm Lineage</span>
              <h2>压缩算法技术路线图</h2>
              <p>
                以年份为横轴、技术域为纵轴，呈现压缩算法从信息论、字典匹配、可逆变换、上下文建模到学习式压缩的主干关系。
              </p>
            </div>
          </section>

          <section className={styles.metrics}>
            <MetricTile label="Algorithms" value={evolutionNodes.length} hint="Curated nodes" icon={History} tone="blue" />
            <MetricTile label="Relations" value={evolutionRelations.length} hint="Lineage links" icon={Route} tone="green" />
            <MetricTile label="Tracks" value={evolutionLanes.length} hint="Technical domains" icon={Layers3} tone="purple" />
            <MetricTile label="Timeline" value={`${firstYear}-${lastYear}`} hint="Historical coverage" icon={GitBranch} tone="cyan" />
          </section>

          <ResearchPanel
            eyebrow="Atlas Controls"
            title="图谱控制台"
          >
            <div className={styles.controlGrid}>
              <div className={styles.viewTabs} role="tablist" aria-label="算法演化视角">
                {VIEW_META.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cx(styles.viewTab, view === item.id && styles.viewTabActive)}
                      onClick={() => setView(item.id)}
                      title={item.description}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.laneFilters}>
                <button
                  type="button"
                  className={cx(styles.laneFilter, laneFilter === 'all' && styles.laneFilterActive)}
                  onClick={() => setLaneFilter('all')}
                >
                  <Search size={13} />
                  全部技术域
                </button>
                {evolutionLanes.map((lane) => (
                  <button
                    key={lane.id}
                    type="button"
                    className={cx(styles.laneFilter, laneFilter === lane.id && styles.laneFilterActive)}
                    onClick={() => setLaneFilter(lane.id)}
                    style={{'--lane-color': lane.color, '--lane-soft': lane.soft} as React.CSSProperties}
                  >
                    <span className={styles.laneDot} />
                    {lane.label}
                  </button>
                ))}
              </div>
              <div className={styles.scopeTabs} aria-label="路线图密度">
                <button
                  type="button"
                  className={cx(styles.scopeTab, graphScope === 'core' && styles.scopeTabActive)}
                  onClick={() => setGraphScope('core')}
                >
                  主干视图
                </button>
                <button
                  type="button"
                  className={cx(styles.scopeTab, graphScope === 'all' && styles.scopeTabActive)}
                  onClick={() => setGraphScope('all')}
                >
                  全量视图
                </button>
              </div>
            </div>
          </ResearchPanel>

          <div className={styles.workspace}>
            <section className={styles.mapSurface}>
              <header className={styles.surfaceHeader}>
                <div>
                  <span>{activeView.description}</span>
                  <h2>{activeView.label}</h2>
                </div>
                <div className={styles.surfaceHeaderActions}>
                  {view === 'roadmap' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRoadmapFullscreen((value) => !value)}
                      aria-label={isRoadmapFullscreen ? '退出全屏' : '全屏查看历史主线'}
                      title={isRoadmapFullscreen ? '退出全屏' : '全屏查看历史主线'}
                    >
                      {isRoadmapFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                      <span className={styles.fullscreenLabel}>
                        {isRoadmapFullscreen ? '退出全屏' : '全屏'}
                      </span>
                    </Button>
                  ) : null}
                </div>
              </header>

              {view === 'roadmap' ? (
                <RoadmapView
                  nodes={roadmapNodes}
                  relations={roadmapRelations}
                  scope={graphScope}
                  selectedId={selected.id}
                  onSelect={setSelectedId}
                />
              ) : null}
              {view === 'chains' ? (
                <ChainView nodes={visibleNodes} selectedId={selected.id} onSelect={setSelectedId} />
              ) : null}
              {view === 'pipeline' ? (
                <PipelineView nodes={visibleNodes} selectedId={selected.id} onSelect={setSelectedId} />
              ) : null}
              {view === 'tradeoff' ? (
                <TradeoffView nodes={visibleNodes} selectedId={selected.id} onSelect={setSelectedId} />
              ) : null}
              {view === 'scenarios' ? (
                <ScenarioView nodes={visibleNodes} selectedId={selected.id} onSelect={setSelectedId} />
              ) : null}
            </section>

            <DetailPanel selected={selected} laneColor={selectedLane.color} laneSoft={selectedLane.soft} onSelect={setSelectedId} />
          </div>

          {isRoadmapFullscreen && typeof document !== 'undefined'
            ? createPortal(
                <section className={cx(styles.mapSurface, styles.mapSurfaceFullscreen)} role="dialog" aria-modal="true">
                  <header className={styles.surfaceHeader}>
                    <div>
                      <span>{activeView.description}</span>
                      <h2>{activeView.label}</h2>
                    </div>
                    <div className={styles.surfaceHeaderActions}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRoadmapFullscreen(false)}
                        aria-label="退出全屏"
                        title="退出全屏"
                      >
                        <Minimize2 size={15} />
                        <span className={styles.fullscreenLabel}>退出全屏</span>
                      </Button>
                    </div>
                  </header>
                  <RoadmapView
                    nodes={roadmapNodes}
                    relations={roadmapRelations}
                    scope={graphScope}
                    selectedId={selected.id}
                    onSelect={setSelectedId}
                  />
                </section>,
                document.body,
              )
            : null}
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function RoadmapView({
  nodes,
  relations,
  scope,
  selectedId,
  onSelect,
}: {
  nodes: readonly EvolutionNode[];
  relations: readonly EvolutionRelation[];
  scope: GraphScope;
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const panState = React.useRef<{pointerId: number; x: number; y: number; left: number; top: number} | null>(null);
  const [availableWidth, setAvailableWidth] = useState(GRAPH_WIDTH);
  const [stretch, setStretch] = useState<GraphStretch>('fit');
  const [isPanning, setIsPanning] = useState(false);
  const graphWidth = useMemo(
    () => Math.max(GRAPH_WIDTH, Math.round(availableWidth * GRAPH_STRETCH[stretch])),
    [availableWidth, stretch],
  );

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const updateWidth = () => {
      setAvailableWidth(Math.max(GRAPH_WIDTH, Math.floor(scroller.clientWidth)));
    };

    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(scroller);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const positions = useMemo(() => {
    const map = new Map<string, GraphPoint>();
    for (const lane of evolutionLanes) {
      const laneNodes = nodes.filter((node) => node.lane === lane.id).sort((a, b) => a.year - b.year);
      const slotLastX = [-Infinity, -Infinity, -Infinity, -Infinity];
      for (const node of laneNodes) {
        const laneIndex = evolutionLanes.findIndex((item) => item.id === node.lane);
        const x = yearToX(node.year, graphWidth);
        let slot = slotLastX.findIndex((lastX) => x - lastX > NODE_WIDTH + 34);
        if (slot < 0) {
          slot = slotLastX.indexOf(Math.min(...slotLastX));
        }
        slotLastX[slot] = x;
        map.set(node.id, {
          x,
          y: GRAPH_TOP + laneIndex * GRAPH_ROW + 38 + slot * 30,
          lane: node.lane,
          stack: slot,
        });
      }
    }
    return map;
  }, [graphWidth, nodes]);

  const focusedIds = new Set<string>([selectedId]);
  for (const relation of relations) {
    if (relation.from === selectedId) focusedIds.add(relation.to);
    if (relation.to === selectedId) focusedIds.add(relation.from);
  }
  const lineageIds = collectLineageIds(selectedId, relations);

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const node = scroller.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(selectedId)}"]`);
    if (!node) return;
    const left = node.offsetLeft - scroller.clientWidth * 0.46;
    const top = node.offsetTop - scroller.clientHeight * 0.46;
    scroller.scrollTo({left: Math.max(0, left), top: Math.max(0, top), behavior: 'smooth'});
  }, [graphWidth, selectedId]);

  const startCanvasPan = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (!target.closest(`.${styles.roadmapCanvas}`) || target.closest('button, a, input, select, textarea')) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    panState.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: scroller.scrollLeft,
      top: scroller.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  const moveCanvasPan = (event: React.PointerEvent<HTMLDivElement>): void => {
    const pan = panState.current;
    const scroller = scrollerRef.current;
    if (!pan || pan.pointerId !== event.pointerId || !scroller) return;
    scroller.scrollLeft = pan.left - (event.clientX - pan.x);
    scroller.scrollTop = pan.top - (event.clientY - pan.y);
    event.preventDefault();
  };

  const endCanvasPan = (event: React.PointerEvent<HTMLDivElement>): void => {
    const pan = panState.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    panState.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className={styles.roadmapScroller}
      ref={scrollerRef}
      data-panning={isPanning}
      onPointerDown={startCanvasPan}
      onPointerMove={moveCanvasPan}
      onPointerUp={endCanvasPan}
      onPointerCancel={endCanvasPan}
    >
      <div className={styles.roadmapNote}>
        <strong>{scope === 'core' ? '核心主干视图' : '全部节点视图'}</strong>
        <span>
          点击算法聚焦完整上下游改进路径；按住空白拖动总图，其他节点自动降灰并以流线高亮路径。
        </span>
        <div className={styles.roadmapScaleControls} aria-label="历史主线宽度">
          {([
            ['fit', '适配'],
            ['wide', '展开'],
            ['max', '超宽'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cx(styles.scaleButton, stretch === id && styles.scaleButtonActive)}
              onClick={() => setStretch(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.roadmapCanvas} style={{width: graphWidth, height: GRAPH_HEIGHT}}>
        <div className={styles.roadmapLaneDock} aria-hidden="true">
          {evolutionLanes.map((lane, index) => (
            <div
              key={lane.id}
              className={styles.floatingLaneLabel}
              style={{
                top: GRAPH_TOP + index * GRAPH_ROW + 14,
                '--lane-color': lane.color,
                '--lane-soft': lane.soft,
              } as React.CSSProperties}
            >
              <span />
              <strong>{lane.label}</strong>
              <em>{lane.short}</em>
            </div>
          ))}
        </div>

        {evolutionEras.map((era, index) => {
          const eraWidth = (graphWidth - GRAPH_LEFT - GRAPH_RIGHT) / evolutionEras.length;
          return (
            <div
              key={era.id}
              className={styles.eraBand}
              style={{left: GRAPH_LEFT + index * eraWidth, width: eraWidth} as React.CSSProperties}
            >
              <span>{era.years}</span>
              <strong>{era.label}</strong>
            </div>
          );
        })}

        {evolutionLanes.map((lane, index) => (
          <div
            key={lane.id}
            className={styles.laneRow}
            style={{
              top: GRAPH_TOP + index * GRAPH_ROW,
              height: GRAPH_ROW,
              '--lane-color': lane.color,
              '--lane-soft': lane.soft,
            } as React.CSSProperties}
          />
        ))}

        <svg className={styles.relationLayer} viewBox={`0 0 ${graphWidth} ${GRAPH_HEIGHT}`} aria-hidden="true">
          <defs>
            {evolutionLanes.map((lane) => (
              <marker
                key={lane.id}
                id={`arrow-${lane.id}`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill={lane.color} />
              </marker>
            ))}
          </defs>
          {relations.map((relation) => {
            const from = positions.get(relation.from);
            const to = positions.get(relation.to);
            if (!from || !to) return null;
            const lane = getEvolutionLane(relation.route);
            const key = `${relation.from}-${relation.to}`;
            const focused = relation.from === selectedId || relation.to === selectedId;
            const inLineage = lineageIds.has(relation.from) && lineageIds.has(relation.to);
            const showLabel = focused || (scope === 'core' && CORE_RELATION_LABELS.has(key));
            const dx = Math.max(80, Math.abs(to.x - from.x));
            const c1 = from.x + dx * 0.42;
            const c2 = to.x - dx * 0.32;
            const path = `M ${from.x} ${from.y} C ${c1} ${from.y}, ${c2} ${to.y}, ${to.x} ${to.y}`;
            return (
              <g key={`${relation.from}-${relation.to}`}>
                <path
                  className={cx(
                    styles.relationPath,
                    inLineage && styles.relationPathLineage,
                    focused && styles.relationPathFocus,
                    !inLineage && styles.relationPathMuted,
                  )}
                  d={path}
                  stroke={lane.color}
                  markerEnd={`url(#arrow-${lane.id})`}
                />
                {showLabel ? (
                  <text
                    className={cx(styles.relationText, focused && styles.relationTextFocus)}
                    data-muted={!inLineage}
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 8}
                    textAnchor="middle"
                  >
                    {relation.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          const lane = getEvolutionLane(node.lane);
          const related = relations.some((relation) => relation.from === node.id || relation.to === node.id);
          const inLineage = lineageIds.has(node.id);
          return (
            <button
              key={node.id}
              type="button"
              className={cx(
                styles.roadmapNode,
                node.id === selectedId && styles.roadmapNodeActive,
                focusedIds.has(node.id) && styles.roadmapNodeFocus,
                inLineage && styles.roadmapNodeLineage,
                !inLineage && styles.roadmapNodeDim,
                related && styles.roadmapNodeLinked,
              )}
              data-node-id={node.id}
              data-kind={node.kind}
              onClick={() => onSelect(node.id)}
              style={{
                left: position.x,
                top: position.y,
                '--lane-color': lane.color,
                '--lane-soft': lane.soft,
                '--node-depth': KIND_DEPTH[node.kind],
              } as React.CSSProperties}
              title={`${node.title}: ${node.role}`}
            >
              <span>{node.year}</span>
              <strong>{node.title}</strong>
              <em>{lane.short}</em>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChainView({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: readonly EvolutionNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const visibleIds = new Set(nodes.map((node) => node.id));

  return (
    <div className={styles.chainGrid}>
      {evolutionBranches.map((branch) => {
        const branchNodes = branch.nodes
          .map((id) => getEvolutionNode(id))
          .filter((node): node is EvolutionNode => Boolean(node) && visibleIds.has(node.id));

        if (branchNodes.length === 0) return null;

        return (
          <article key={branch.id} className={styles.chainCard}>
            <header>
              <div>
                <span>Lineage Track</span>
                <h3>{branch.title}</h3>
              </div>
              <Badge variant="outline">{branchNodes.length} 节点</Badge>
            </header>
            <p>{branch.description}</p>
            <div className={styles.chainPath}>
              {branchNodes.map((node, index) => {
                const next = branchNodes[index + 1];
                const relation = next ? getRelation(node.id, next.id) : undefined;
                return (
                  <React.Fragment key={node.id}>
                    <ChainNode node={node} active={node.id === selectedId} onSelect={onSelect} />
                    {next ? (
                      <div className={styles.chainConnector}>
                        <ArrowRight size={14} />
                        <span>{relation?.label ?? '历史延续 / 工程组合'}</span>
                        <p>{relation?.driver ?? relation?.improvement ?? '同一技术问题下继续演化或被工程系统组合使用。'}</p>
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
            <div className={styles.takeaway}>
              <EvidenceBadge type="curated">历史动力</EvidenceBadge>
              <span>{branch.takeaway}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function PipelineView({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: readonly EvolutionNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <div className={styles.pipelineView}>
      <div className={styles.pipelineExplainer}>
        <strong>Compression Pipeline Placement</strong>
        <span>按系统职责定位算法节点：重复发现、可逆变换、概率估计、模型融合、比特流编码与格式封装。</span>
        <div>
          {['原始数据', '匹配/变换', '概率建模', '熵编码', '容器/协议'].map((item, index) => (
            <React.Fragment key={item}>
              <em>{item}</em>
              {index < 4 ? <ArrowRight size={13} /> : null}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className={styles.pipelineGrid}>
        {pipelineStages.map((stage) => {
          const stageNodes = nodes.filter((node) => node.stage === stage.id);
          return (
            <section key={stage.id} className={styles.stageColumn}>
              <header>
                <span>{stageNodes.length}</span>
                <strong>{stage.label}</strong>
                <p>{stage.description}</p>
              </header>
              <div className={styles.stageNodes}>
                {stageNodes.length > 0 ? (
                  stageNodes.map((node) => (
                    <SmallNodeButton
                      key={node.id}
                      node={node}
                      active={node.id === selectedId}
                      onClick={() => onSelect(node.id)}
                    />
                  ))
                ) : (
                  <div className={styles.emptyInline}>无节点</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TradeoffView({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: readonly EvolutionNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const activeNode = getEvolutionNode(selectedId) ?? nodes[0] ?? evolutionNodes[0];

  return (
    <div className={styles.tradeoffLayout}>
      <div className={styles.tradeoffPlot}>
        <span className={styles.axisY}>压缩率更强</span>
        <span className={styles.axisX}>速度更快</span>
        <span className={styles.axisHintTop}>研究/离线高压缩率</span>
        <span className={styles.axisHintRight}>系统/实时吞吐</span>
        {nodes.map((node, index) => {
          const lane = getEvolutionLane(node.lane);
          const jitterX = ((index % 5) - 2) * 1.4;
          const jitterY = (((index + 2) % 5) - 2) * 1.2;
          const left = Math.min(92, Math.max(8, 8 + (node.speed - 1) * 21 + jitterX));
          const top = Math.min(88, Math.max(10, 88 - (node.ratio - 1) * 19.5 + jitterY));
          const showLabel = node.id === selectedId || TRADEOFF_LANDMARKS.has(node.id);
          return (
            <button
              key={node.id}
              type="button"
              className={cx(styles.plotPoint, node.id === selectedId && styles.plotPointActive)}
              onClick={() => onSelect(node.id)}
              style={{
                '--lane-color': lane.color,
                '--lane-soft': lane.soft,
                '--x': `${left}%`,
                '--y': `${top}%`,
              } as React.CSSProperties}
              title={`${node.title}: ${node.scenarios.map((id) => getScenario(id).label).join(' / ')}`}
            >
              {showLabel ? <span>{node.title}</span> : null}
            </button>
          );
        })}
      </div>
      <div className={styles.tradeoffNotes}>
        <h3>Trade-off Positioning</h3>
        <p>
          该矩阵用于无损/通用压缩的定性定位：纵轴强调压缩率，横轴强调速度与系统吞吐。正式比较仍需绑定数据集、参数、实现版本与硬件环境。
        </p>
        <div className={styles.tradeoffCount}>
          当前视图包含 <strong>{nodes.length}</strong> 个节点，右侧索引保留完整算法入口。
        </div>
        <div className={styles.activeTradeoff}>
          <span>当前选中</span>
          <strong>{activeNode.title}</strong>
          <p>{activeNode.why}</p>
          <ScoreMeter label="速度" value={activeNode.speed} />
          <ScoreMeter label="压缩率" value={activeNode.ratio} />
          <div className={styles.tagRow}>
            {activeNode.scenarios.map((scenarioId) => {
              const scenario = getScenario(scenarioId);
              return <StatusPill key={scenario.id} tone="cyan">{scenario.label}</StatusPill>;
            })}
          </div>
        </div>
        <div className={styles.tradeoffCatalog}>
          <span>完整索引</span>
          {nodes.map((node) => (
            <TradeoffListItem
              key={node.id}
              node={node}
              active={node.id === selectedId}
              onClick={() => onSelect(node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScenarioView({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: readonly EvolutionNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <div className={styles.scenarioView}>
      <div className={styles.scenarioIntro}>
        <strong>Scenario Coverage Matrix</strong>
        <span>按数据结构与应用边界组织算法适用面：文本、Web、实时系统、图像、科学数组、归档与极限压缩率路线。</span>
      </div>
      <div className={styles.scenarioGrid}>
        {scenarioMeta.map((scenario) => {
          const scenarioNodes = nodes.filter((node) => node.scenarios.includes(scenario.id));
          return (
            <article key={scenario.id} className={styles.scenarioCard}>
              <header>
                <div>
                  <span>{scenarioNodes.length} 个相关节点</span>
                  <h3>{scenario.label}</h3>
                </div>
              </header>
              <p>{scenario.description}</p>
              <div className={styles.scenarioReason}>{SCENARIO_NOTES[scenario.id]}</div>
              <div className={styles.scenarioNodes}>
                {scenarioNodes.length > 0 ? (
                  scenarioNodes.slice(0, 10).map((node) => (
                    <SmallNodeButton
                      key={node.id}
                      node={node}
                      active={node.id === selectedId}
                      onClick={() => onSelect(node.id)}
                    />
                  ))
                ) : (
                  <div className={styles.emptyInline}>无节点</div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function DetailPanel({
  selected,
  laneColor,
  laneSoft,
  onSelect,
}: {
  selected: EvolutionNode;
  laneColor: string;
  laneSoft: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const stage = getPipelineStage(selected.stage);
  const outgoing = evolutionRelations.filter((relation) => relation.from === selected.id);
  const incoming = evolutionRelations.filter((relation) => relation.to === selected.id);
  const primaryIncoming = incoming[0];
  const predecessor = primaryIncoming ? getEvolutionNode(primaryIncoming.from) : undefined;
  const fallbackInfluences = knownInfluences(selected).filter(
    (node) => !outgoing.some((relation) => relation.to === node.id),
  );

  return (
    <aside
      className={styles.detailPanel}
      style={{'--lane-color': laneColor, '--lane-soft': laneSoft} as React.CSSProperties}
    >
      <div className={styles.detailTop}>
        <span className={styles.detailYear}>{selected.year}</span>
        <Badge variant="outline">{getEvolutionLane(selected.lane).label}</Badge>
        <Badge>{KIND_LABEL[selected.kind]}</Badge>
      </div>
      <h3>{selected.title}</h3>
      <p className={styles.detailSub}>{selected.subtitle}</p>

      {primaryIncoming && predecessor ? (
        <div className={styles.comparisonCard}>
          <span>相对上一代的改进</span>
          <strong>{predecessor.title} <ArrowRight size={13} /> {selected.title}</strong>
          <p>{primaryIncoming.improvement ?? primaryIncoming.label}</p>
          {primaryIncoming.driver ? <em>{primaryIncoming.driver}</em> : null}
        </div>
      ) : (
        <div className={styles.originCard}>
          <span>路线起点</span>
          <p>该节点作为当前技术路线的理论或工程起点，没有更早的直接前驱记录。</p>
        </div>
      )}

      <div className={styles.detailBlock}>
        <strong>Function</strong>
        <p>{selected.role}</p>
      </div>
      <div className={styles.detailBlock}>
        <strong>Strategic Relevance</strong>
        <p>{selected.why}</p>
      </div>

      {incoming.length > 0 ? (
        <div className={styles.detailBlock}>
          <strong>Lineage Source</strong>
          <RelationList relations={incoming} direction="incoming" onSelect={onSelect} />
        </div>
      ) : null}

      {outgoing.length > 0 ? (
        <div className={styles.detailBlock}>
          <strong>Downstream Influence</strong>
          <RelationList relations={outgoing} direction="outgoing" onSelect={onSelect} />
        </div>
      ) : null}

      <div className={styles.detailSplit}>
        <div>
          <span>Pipeline Stage</span>
          <strong>{stage.label}</strong>
          <p>{stage.description}</p>
        </div>
        <div>
          <span>Deployment Profile</span>
          <ScoreMeter label="速度" value={selected.speed} />
          <ScoreMeter label="压缩率" value={selected.ratio} />
        </div>
      </div>

      <div className={styles.detailBlock}>
        <strong>Data Domain</strong>
        <div className={styles.tagRow}>
          {selected.scenarios.map((scenarioId) => {
            const scenario = getScenario(scenarioId);
            return <StatusPill key={scenario.id} tone="cyan">{scenario.label}</StatusPill>;
          })}
        </div>
      </div>

      <div className={styles.detailBlock}>
        <strong>标签</strong>
        <div className={styles.tagRow}>
          {selected.tags.map((tag) => <StatusPill key={tag} tone="slate">{tag}</StatusPill>)}
        </div>
      </div>

      {fallbackInfluences.length > 0 ? (
        <div className={styles.detailBlock}>
          <strong>Additional Influence</strong>
          <div className={styles.linkedNodes}>
            {fallbackInfluences.map((node) => (
              <button key={node.id} type="button" onClick={() => onSelect(node.id)}>
                {node.year} · {node.title}
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selected.sourceUrl ? (
        <Button variant="outline" onClick={() => window.open(selected.sourceUrl, '_blank', 'noopener,noreferrer')}>
          <ExternalLink size={14} />
          {selected.sourceLabel ?? '查看来源'}
        </Button>
      ) : null}
    </aside>
  );
}

function RelationList({
  relations,
  direction,
  onSelect,
}: {
  relations: readonly EvolutionRelation[];
  direction: 'incoming' | 'outgoing';
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <div className={styles.relationList}>
      {relations.map((relation) => {
        const node = getEvolutionNode(direction === 'incoming' ? relation.from : relation.to);
        const lane = getEvolutionLane(relation.route);
        if (!node) return null;
        return (
          <button
            key={`${relation.from}-${relation.to}`}
            type="button"
            onClick={() => onSelect(node.id)}
            style={{'--lane-color': lane.color, '--lane-soft': lane.soft} as React.CSSProperties}
          >
            <span>{relation.label}</span>
            <strong>{node.year} · {node.title}</strong>
            <em>{relation.driver ?? relation.improvement}</em>
          </button>
        );
      })}
    </div>
  );
}

function ChainNode({
  node,
  active,
  onSelect,
}: {
  node: EvolutionNode;
  active: boolean;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const lane = getEvolutionLane(node.lane);
  return (
    <button
      type="button"
      className={cx(styles.chainNode, active && styles.chainNodeActive)}
      onClick={() => onSelect(node.id)}
      style={{'--lane-color': lane.color, '--lane-soft': lane.soft} as React.CSSProperties}
    >
      <span>{node.year}</span>
      <strong>{node.title}</strong>
      <em>{node.subtitle}</em>
    </button>
  );
}

function SmallNodeButton({
  node,
  active,
  onClick,
}: {
  node: EvolutionNode;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  const lane = getEvolutionLane(node.lane);

  return (
    <button
      type="button"
      className={cx(styles.smallNode, active && styles.smallNodeActive)}
      onClick={onClick}
      style={{'--lane-color': lane.color, '--lane-soft': lane.soft} as React.CSSProperties}
    >
      <span>{node.year}</span>
      <strong>{node.title}</strong>
    </button>
  );
}

function TradeoffListItem({
  node,
  active,
  onClick,
}: {
  node: EvolutionNode;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  const lane = getEvolutionLane(node.lane);
  return (
    <button
      type="button"
      className={cx(styles.tradeoffListItem, active && styles.tradeoffListItemActive)}
      onClick={onClick}
      style={{'--lane-color': lane.color, '--lane-soft': lane.soft} as React.CSSProperties}
    >
      <strong>{node.year} · {node.title}</strong>
      <span>{node.scenarios.map((scenarioId) => getScenario(scenarioId).label).join(' / ')}</span>
    </button>
  );
}

function ScoreMeter({label, value}: {label: string; value: number}): React.ReactElement {
  return (
    <div className={styles.scoreMeter}>
      <span>{label}</span>
      <div>
        {Array.from({length: 5}, (_, index) => (
          <i key={index} className={index < value ? styles.scoreOn : undefined} />
        ))}
      </div>
    </div>
  );
}
