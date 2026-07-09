// Algorithm Board - lossless compressor system map.
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Badge} from '../components/ui/badge';
import {Button} from '../components/ui/button';
import {algorithmModules, type AlgorithmModule} from '../data/algorithmModules';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileArchive,
  FlaskConical,
  Layers3,
  Network,
  PackageCheck,
  Search,
  Shuffle,
  Sparkles,
  SplitSquareHorizontal,
} from 'lucide-react';
import styles from './algorithm-board.module.css';

type ViewMode = 'novice' | 'expert';
type RequirementLevel = '必选' | '可选' | '研究增强';

interface PipelineLayer {
  id: string;
  title: string;
  plain: string;
  moduleIds: readonly string[];
  tone: string;
  icon: React.ComponentType<{size?: number}>;
}

interface RouteCase {
  name: string;
  summary: string;
  tone: string;
  steps: readonly string[];
  modules: readonly string[];
}

const CN = {
  title: '压缩器模块 / Compressor System Map',
  hint: '把无损压缩器理解成一条可逆信息处理流水线,而不是 14 个孤立任务卡片。',
};

const PIPELINE_LAYERS: readonly PipelineLayer[] = [
  {
    id: 'input',
    title: '输入与分流',
    plain: '判断输入是什么类型,决定后面走哪条压缩路线。',
    moduleIds: ['M01', 'M09'],
    tone: 'blue',
    icon: SplitSquareHorizontal,
  },
  {
    id: 'preprocess',
    title: '可逆预处理',
    plain: '把数据变得更容易压缩,但必须能完全还原。',
    moduleIds: ['M02', 'M06', 'M08', 'M14'],
    tone: 'cyan',
    icon: Shuffle,
  },
  {
    id: 'modeling',
    title: '冗余发现 / 建模',
    plain: '寻找重复、规律或概率分布,这是压缩率的核心。',
    moduleIds: ['M10', 'M11', 'M03', 'M04'],
    tone: 'emerald',
    icon: Network,
  },
  {
    id: 'coding',
    title: '概率融合与熵编码',
    plain: '把模型判断转成真正的 bitstream。',
    moduleIds: ['M05', 'M07'],
    tone: 'violet',
    icon: Layers3,
  },
  {
    id: 'packaging',
    title: '工程封装',
    plain: '把压缩结果保存成可传输、可校验、可解压的文件格式。',
    moduleIds: ['M12'],
    tone: 'slate',
    icon: PackageCheck,
  },
  {
    id: 'evaluation',
    title: '评测闭环',
    plain: '持续测试压缩率、速度、内存、延迟和 bit-exact 解压正确性。',
    moduleIds: ['M13'],
    tone: 'amber',
    icon: FlaskConical,
  },
];

const ROUTE_CASES: readonly RouteCase[] = [
  {
    name: 'Zstd 路线',
    summary: '工程压缩器路线:用分块和 LZ 匹配拿到速度/压缩率平衡,再用 Huff0 / FSE 写成 zstd frame。',
    tone: 'blue',
    steps: ['原始数据', '分块 / 字典', 'LZ 匹配', 'Huff0 / FSE', 'zstd frame'],
    modules: ['M01', 'M08', 'M10', 'M11', 'M07', 'M12'],
  },
  {
    name: 'PAQ8px 路线',
    summary: '高压缩率路线:多个上下文模型同时预测,由 mixer 融合概率,再交给算术编码或 range coding。',
    tone: 'amber',
    steps: ['原始数据', '上下文模型', '概率混合', '算术编码 / Range Coding', '压缩文件'],
    modules: ['M03', 'M05', 'M07', 'M12'],
  },
  {
    name: 'NNCP 路线',
    summary: '神经预测路线:把文本或符号序列交给 Transformer 预测概率,用更准的概率换更短的 bitstream。',
    tone: 'violet',
    steps: ['文本输入', '符号化 / 可逆预处理', 'Transformer 预测下一个 symbol 概率', '算术编码', 'bitstream'],
    modules: ['M02', 'M04', 'M05', 'M07'],
  },
];

const REQUIRED_MODULES = new Set(['M01', 'M07', 'M12']);
const RESEARCH_MODULES = new Set(['M03', 'M04', 'M05', 'M06', 'M14']);

const MODULE_OVERRIDES: Record<string, {role: string; required: RequirementLevel; reps: string[]; risk: string}> = {
  M01: {
    role: '识别输入类型和基本元数据,给后续模块选择路线。',
    required: '必选',
    reps: ['libmagic', 'MIME sniffing', 'Zstd dictionary training'],
    risk: '误判类型会让后续预处理和模型选择全部偏掉。',
  },
  M09: {
    role: '把大文件或在线输入切成可处理的块流。',
    required: '可选',
    reps: ['streaming zstd', 'pipelined PAQ'],
    risk: '流式边界会影响上下文连续性和内存上限。',
  },
  M02: {
    role: '做可逆变换,让后面的模型看到更规则的数据。',
    required: '可选',
    reps: ['BWT', 'Delta coding', 'JPEG-LS residual'],
    risk: '必须保存逆变换信息,否则无法 bit-exact 解压。',
  },
  M06: {
    role: '把高位、低位或残差拆开,让规律更容易被模型捕捉。',
    required: '研究增强',
    reps: ['Bitshuffle', 'fpzip', 'ZFP', 'JPEG-LS residual'],
    risk: '低位噪声和浮点格式会让收益不稳定。',
  },
  M08: {
    role: '按块选择策略,避免整文件只用一套压缩路线。',
    required: '可选',
    reps: ['Zstd block design', 'Brotli meta-block'],
    risk: '块太小会损失上下文,块太大会增加内存和延迟。',
  },
  M14: {
    role: '针对图像、日志、科学数组等领域结构做可逆适配。',
    required: '研究增强',
    reps: ['CRAM', 'bitshuffle', 'JPEG-LS', 'LogHub'],
    risk: '格式依赖强,泛化和解码兼容性是主要难点。',
  },
  M10: {
    role: '从历史窗口里找重复片段,输出 literal 或 match token。',
    required: '可选',
    reps: ['LZ77', 'DEFLATE', 'Zstd', 'Brotli'],
    risk: '匹配搜索越强通常越慢,还会增加内存。',
  },
  M11: {
    role: '把 token 或符号转成频率表 / CDF / 概率估计。',
    required: '可选',
    reps: ['Huffman', 'ANS', 'Arithmetic Coding'],
    risk: '概率估计不稳会直接损失码长。',
  },
  M03: {
    role: '用多个上下文专家预测当前符号的概率。',
    required: '研究增强',
    reps: ['PPM', 'CTW', 'PAQ8px', 'cmix'],
    risk: '上下文越复杂,稀疏性、内存和解码延迟越难控。',
  },
  M04: {
    role: '用神经网络预测下一个 symbol 的概率。',
    required: '研究增强',
    reps: ['NNCP', 'TRACE', 'Language Modeling Is Compression'],
    risk: '压缩率可能高,但推理速度和复现成本很高。',
  },
  M05: {
    role: '融合多个模型的预测,得到最终概率。',
    required: '研究增强',
    reps: ['PAQ mixer', 'cmix mixer', 'SSE'],
    risk: '在线更新必须和解码端完全同步。',
  },
  M07: {
    role: '把符号和概率真正写成更短的 bitstream。',
    required: '必选',
    reps: ['ANS', 'FSE', 'Huffman', 'Arithmetic Coding', 'Range Coding'],
    risk: '编码精度、速度和解码同步都容易出错。',
  },
  M12: {
    role: '记录格式版本、参数、块索引、校验和和边信息。',
    required: '必选',
    reps: ['Zstandard frame', 'gzip header', 'xz container'],
    risk: '缺少元数据会导致无法解码、不可复现或不可校验。',
  },
  M13: {
    role: '验证压缩率、速度、内存、延迟和 bit-exact 正确性。',
    required: '必选',
    reps: ['lzbench', 'ACM Artifact Review', 'Silesia benchmark'],
    risk: '如果没有统一脚本,实验比较很容易不可复现。',
  },
};

function byId(id: string): AlgorithmModule {
  const module = algorithmModules.find((item) => item.id === id);
  if (!module) throw new Error(`Missing algorithm module ${id}`);
  return module;
}

function getModuleMeta(module: AlgorithmModule) {
  return MODULE_OVERRIDES[module.id] ?? {
    role: module.why || module.problem,
    required: REQUIRED_MODULES.has(module.id) ? '必选' : RESEARCH_MODULES.has(module.id) ? '研究增强' : '可选',
    reps: [...(module.alternatives ?? []), ...(module.references ?? [])].slice(0, 5),
    risk: module.notes || module.problem,
  };
}

export default function AlgorithmBoardPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focus = params.get('module');
  const [mode, setMode] = useState<ViewMode>('novice');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(focus ? [focus] : []));

  const layerModules = useMemo(() => {
    return PIPELINE_LAYERS.map((layer) => ({
      ...layer,
      modules: layer.moduleIds.map(byId),
    }));
  }, []);

  function toggleModule(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <section className={styles.heroMap}>
          <div>
            <span className={styles.kicker}>Lossless Compressor System Map</span>
            <h2>无损压缩器系统地图</h2>
            <p>
              无损压缩器可以理解为一条可逆的信息处理流水线：先识别和整理输入，再发现数据冗余，随后通过熵编码生成更短的 bitstream，最后封装成可校验、可解压的工程格式。
            </p>
          </div>
          <div className={styles.modeSwitch} role="tablist" aria-label="视图切换">
            <Button variant={mode === 'novice' ? 'default' : 'outline'} onClick={() => setMode('novice')}>
              <Search size={14} /> 新手视图
            </Button>
            <Button variant={mode === 'expert' ? 'default' : 'outline'} onClick={() => setMode('expert')}>
              <Boxes size={14} /> 专家视图
            </Button>
          </div>
        </section>

        <section className={styles.pipelineShell} aria-label="无损压缩器主流程">
          <div className={styles.streamEndpoint} data-side="input">
            <FileArchive size={22} />
            <span>原始数据</span>
          </div>
          <div className={styles.pipelineTrack}>
            {layerModules.slice(0, 5).map((layer, index) => (
              <React.Fragment key={layer.id}>
                <LayerNode layer={layer} mode={mode} expanded={expanded} onToggle={toggleModule} />
                {index < 4 ? <ArrowRight className={styles.flowConnector} size={20} /> : null}
              </React.Fragment>
            ))}
          </div>
          <div className={styles.streamEndpoint} data-side="output">
            <CheckCircle2 size={22} />
            <span>压缩文件</span>
          </div>
          <EvaluationRing layer={layerModules[5]} mode={mode} expanded={expanded} onToggle={toggleModule} />
        </section>

        <section className={styles.readingGuide}>
          <div>
            <strong>怎么看这张图</strong>
            <span>主线表示数据流；外环表示研发评测闭环。模块不是全部必选，不同压缩器会在同一张地图上选择不同组合。</span>
          </div>
          <div>
            <strong>科研改进入口</strong>
            <span>压缩率通常改建模、预处理和概率融合；速度通常改匹配搜索、熵编码和分块；可交付性看容器和评测闭环。</span>
          </div>
        </section>

        <section className={styles.routesSection}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Route Comparison</span>
            <h3>真实压缩器路线对照</h3>
            <p>不同压缩器不是完全不同的东西，而是在同一张系统地图上选择了不同模块组合。</p>
          </div>
          <div className={styles.routeGrid}>
            {ROUTE_CASES.map((route) => (
              <RouteCard key={route.name} route={route} />
            ))}
          </div>
        </section>
      </WorkbenchShell>
    </Layout>
  );
}

function LayerNode({
  layer,
  mode,
  expanded,
  onToggle,
}: {
  layer: PipelineLayer & {modules: AlgorithmModule[]};
  mode: ViewMode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const Icon = layer.icon;
  return (
    <article className={styles.layerNode} data-tone={layer.tone}>
      <header className={styles.layerHeader}>
        <span className={styles.layerIcon}><Icon size={18} /></span>
        <div>
          <h3>{layer.title}</h3>
          <p>{layer.plain}</p>
        </div>
      </header>
      {mode === 'novice' ? (
        <div className={styles.layerSummary}>
          <span>{layer.modules.length} 个可用模块</span>
          <em>{layer.moduleIds.join(' / ')}</em>
        </div>
      ) : (
        <div className={styles.moduleStack}>
          {layer.modules.map((module) => (
            <ExpertModuleCard
              key={module.id}
              module={module}
              isOpen={expanded.has(module.id)}
              onToggle={() => onToggle(module.id)}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function EvaluationRing({
  layer,
  mode,
  expanded,
  onToggle,
}: {
  layer: PipelineLayer & {modules: AlgorithmModule[]};
  mode: ViewMode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const module = layer.modules[0];
  return (
    <aside className={styles.evaluationRing} data-tone={layer.tone}>
      <div className={styles.loopLine}><ArrowDown size={18} /></div>
      <div className={styles.evaluationCard}>
        <header className={styles.layerHeader}>
          <span className={styles.layerIcon}><FlaskConical size={18} /></span>
          <div>
            <h3>{layer.title}</h3>
            <p>{layer.plain}</p>
          </div>
        </header>
        <div className={styles.evalMetrics}>
          {['压缩率', '速度', '内存', '延迟', 'bit-exact'].map((item) => <span key={item}>{item}</span>)}
        </div>
        {mode === 'expert' ? (
          <ExpertModuleCard module={module} isOpen={expanded.has(module.id)} onToggle={() => onToggle(module.id)} compact />
        ) : null}
      </div>
    </aside>
  );
}

function ExpertModuleCard({
  module,
  isOpen,
  onToggle,
  compact = false,
}: {
  module: AlgorithmModule;
  isOpen: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const meta = getModuleMeta(module);
  return (
    <article className={styles.expertCard} data-open={isOpen} data-compact={compact}>
      <button type="button" className={styles.expertCardMain} onClick={onToggle}>
        <span className={styles.smallId}>{module.id}</span>
        <span className={styles.moduleTitle}>{module.nameZh}</span>
        <Badge variant="outline" className={styles.requirementBadge}>{meta.required}</Badge>
        {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>
      <p>{meta.role}</p>
      {isOpen ? (
        <div className={styles.expertDetails}>
          <InfoPair label="输入" value={(module.inputs ?? [module.input]).join(' / ')} />
          <InfoPair label="输出" value={(module.outputs ?? [module.output]).join(' / ')} />
          <InfoPair label="代表算法或系统" value={meta.reps.join(' / ')} />
          <InfoPair label="风险或难点" value={meta.risk} />
        </div>
      ) : null}
    </article>
  );
}

function InfoPair({label, value}: {label: string; value: string}) {
  return (
    <div className={styles.infoPair}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RouteCard({route}: {route: RouteCase}) {
  return (
    <article className={styles.routeCard} data-tone={route.tone}>
      <header>
        <h4>{route.name}</h4>
        <p>{route.summary}</p>
      </header>
      <div className={styles.routeSteps}>
        {route.steps.map((step, index) => (
          <React.Fragment key={step}>
            <span>{step}</span>
            {index < route.steps.length - 1 ? <ArrowRight size={14} /> : null}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.routeModules}>
        {route.modules.map((id) => {
          const module = byId(id);
          return <Badge key={id} variant="outline">{id} · {module.nameZh}</Badge>;
        })}
      </div>
    </article>
  );
}
