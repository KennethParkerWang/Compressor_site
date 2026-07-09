// 算法模块板 - 服务可迁移压缩器模块化设计
// 同时承载压缩器流水线节点 (fileType → blockPlan → transform → context → predict → fusion → entropy → stream)

export type ModuleStatus =
  | 'spec'
  | 'prototype'
  | 'runnable'
  | 'verified'
  | 'production'
  | 'deferred';

export type ModuleCategory =
  | 'input'
  | 'orchestration'
  | 'transform'
  | 'probability'
  | 'neural'
  | 'fusion'
  | 'entropy'
  | 'io';

export interface AlgorithmModule {
  id: string;
  name: string;
  nameZh: string;
  category: ModuleCategory;
  /** 它解决什么问题,人话 */
  problem: string;
  /** 为什么需要,放在流水线里的动机 */
  why: string;
  /** 输入 */
  input: string;
  /** 输出 */
  output: string;
  inputs: readonly string[];
  outputs: readonly string[];
  dependsOn: readonly string[];
  references: readonly string[];
  experiments?: readonly string[];
  status: ModuleStatus;
  experimentStatus: 'todo' | 'downloaded' | 'verified' | 'runnable' | 'failed';
  risk: 'low' | 'medium' | 'high';
  /** 影响指标:压缩率 / 速度 / 内存 */
  impact: readonly string[];
  /** 可替代方案 */
  alternatives: readonly string[];
  /** 实现难度 */
  difficulty: 'intro' | 'medium' | 'hard';
  notes: string;
}

export const algorithmModules: readonly AlgorithmModule[] = [
  {
    id: 'M01',
    name: 'FileTypeDetection',
    nameZh: '文件类型识别',
    category: 'input',
    problem: '输入是字节流,我需要先回答"这是文本、二进制、图像,还是科学数组?"',
    why: '不同数据类型的冗余结构差异极大,一份通用模型无法达到峰值;识别后才能选对预处理与上下文专家。',
    input: '原始字节流',
    output: '类型标签 + 元数据 (mime, size, sample)',
    inputs: ['原始字节流 (8KB-1MB head)'],
    outputs: ['类型标签', '元数据 (mime / sample / size)'],
    dependsOn: [],
    references: ['Libmagic', 'MIME Sniffing', '内容指纹'],
    status: 'prototype',
    experimentStatus: 'runnable',
    risk: 'low',
    impact: ['命中率', '压缩率 +5%~30%'],
    alternatives: ['magic bytes', '熵估计', '后缀启发'],
    difficulty: 'intro',
    notes: '基于 magic + 熵估计 + 文件后缀,产出路由标签',
  },
  {
    id: 'M02',
    name: 'ReversiblePreprocess',
    nameZh: '可逆预处理',
    category: 'transform',
    problem: '原始数据存在大量规则性结构(BWT 自然顺序、行列差分、字节对齐),不抽掉这些冗余后面的模型就吃亏。',
    why: '把数据"洗"成对概率模型更友好的形式,同时保留边信息供解码端逆向。',
    input: '原始字节流',
    output: '归一化字节流 + 边信息',
    inputs: ['字节流', '类型标签'],
    outputs: ['归一化流', '边信息'],
    dependsOn: ['M01', 'M08'],
    references: ['BWT', 'ECT', 'Delta / 色差变换', 'LZ77 preprocessor'],
    status: 'prototype',
    experimentStatus: 'downloaded',
    risk: 'medium',
    impact: ['压缩率 +10%~40%', '吞吐 -5%~15%'],
    alternatives: ['BWT', 'Delta', '色差变换', '不预处理'],
    difficulty: 'medium',
    notes: '按类型选预处理流水线,输出边信息用于解码端反向',
  },
  {
    id: 'M03',
    name: 'ContextExpert',
    nameZh: '上下文专家模型',
    category: 'probability',
    problem: '用一个上下文长度总是不够:短上下文猜不到重复模式,长上下文又太稀疏。',
    why: '保留稀疏与稠密的多阶/多特征上下文,每个专家各管一摊,后面由 mixer 汇总。',
    input: '当前字节 + 历史窗口',
    output: '各上下文的概率分布',
    inputs: ['窗口 N (默认 4-8)'],
    outputs: ['概率分布数组'],
    dependsOn: ['M02'],
    references: ['PAQ8', 'PAQ8PX', 'CTW', 'PPM'],
    status: 'spec',
    experimentStatus: 'downloaded',
    risk: 'medium',
    impact: ['压缩率 +20%~50%'],
    alternatives: ['PPM', 'CTW', '简单马尔可夫'],
    difficulty: 'medium',
    notes: '位级/字节级多阶上下文,管理稀疏 vs 稠密的平衡',
  },
  {
    id: 'M04',
    name: 'NeuralPredictor',
    nameZh: '神经预测器',
    category: 'neural',
    problem: '统计模型在大文本/图像上还有冗余,深度网络在长依赖上更强但部署慢。',
    why: '给 mixer 提供高质量 logits,显著提升大文件压缩率;通过截断窗口控制算力。',
    input: '字节流 + 历史窗口',
    output: '分布预测 (logits)',
    inputs: ['窗口 N', '上下文 embedding'],
    outputs: ['logits / 概率'],
    dependsOn: ['M03'],
    references: ['NNCP', 'TRACE', 'Language Modeling Is Compression'],
    status: 'spec',
    experimentStatus: 'todo',
    risk: 'high',
    impact: ['大文件压缩率 +5%~15%', '解码慢 1-2 数量级'],
    alternatives: ['TRACE', 'NNCP', 'LLM-based', '不使用神经'],
    difficulty: 'hard',
    notes: 'Transformer / RNN 子模块,做神经网络概率预测',
  },
  {
    id: 'M05',
    name: 'Mixer',
    nameZh: '概率混合',
    category: 'fusion',
    problem: '我有几十个专家和神经 logits,谁能加权得最好?',
    why: '按当前符号、上下文自适应地加权,等价于"在线学习哪个模型当前最准"。',
    input: '多个专家模型的概率输出',
    output: '混合后的最终概率',
    inputs: ['M03 上下文概率', 'M04 神经 logits', '辅助表特征'],
    outputs: ['最终概率'],
    dependsOn: ['M03', 'M04'],
    references: ['PAQ mixer', 'NNCP mixer', 'Adaptive Weighing'],
    status: 'spec',
    experimentStatus: 'downloaded',
    risk: 'medium',
    impact: ['压缩率 +5%~15%'],
    alternatives: ['SSE 动态加权', 'Logistic 回归', '简单平均'],
    difficulty: 'medium',
    notes: '按 SSE / 神经 / 辅助表做加权,可用神经网络 mixer',
  },
  {
    id: 'M06',
    name: 'BitPlaneResidual',
    nameZh: 'BitPlane / Residual',
    category: 'transform',
    problem: '高位深图像 / 浮点数组的低位基本是噪声,直接压它们会浪费概率建模能力。',
    why: '切到 BitPlane / Residual 视角,把高位与低位分开处理,大幅提升通用方法的领域表现。',
    input: '高位深图像 / 浮点',
    output: '低位残差流',
    inputs: ['图像或浮点数组'],
    outputs: ['高位保留 + 残差流'],
    dependsOn: ['M02'],
    references: ['fpzip', 'ZFP', 'JPEG-LS residual'],
    status: 'spec',
    experimentStatus: 'todo',
    risk: 'medium',
    impact: ['浮点 / 高位深 压缩率 +20%~80%'],
    alternatives: ['fpzip', 'ZFP', 'JPEG-LS'],
    difficulty: 'medium',
    notes: '用于高位深和浮点数据,作为通用压缩前的预处理',
  },
  {
    id: 'M07',
    name: 'EntropyBackend',
    nameZh: '熵编码后端',
    category: 'entropy',
    problem: '拿到概率后还要把它转成位流,且要保持熵下界、并且尽量快。',
    why: '编码器是带宽瓶颈点,rANS / tANS / AC 各自权衡速度与压缩比。',
    input: '最终概率 + 符号流',
    output: '压缩位流',
    inputs: ['符号', '概率'],
    outputs: ['压缩位流'],
    dependsOn: ['M05'],
    references: ['rANS', 'tANS (Zstd)', 'Arithmetic Coding', 'Asymmetric Numeral Systems'],
    status: 'prototype',
    experimentStatus: 'verified',
    risk: 'low',
    impact: ['吞吐 100MB/s - 数 GB/s'],
    alternatives: ['rANS', 'tANS', 'Arithmetic Coding', 'ANS'],
    difficulty: 'medium',
    notes: '当前默认 rANS,保留 tANS 作为吞吐优化路径',
  },
  {
    id: 'M08',
    name: 'BlockOptimizer',
    nameZh: '块级优化',
    category: 'orchestration',
    problem: '一段数据里多种类型混合,整文件用一套策略浪费。',
    why: '按块切分,每块独立选预处理/上下文/后端组合,放大整体压缩率。',
    input: '块大小 + 数据特征',
    output: '块级参数与策略',
    inputs: ['文件类型标签', '块大小 (32K/64K/128K)', '块特征'],
    outputs: ['块边界', '模块策略', '块级参数'],
    dependsOn: ['M01'],
    references: ['Zstd block design', 'PAQ8 block strategy'],
    status: 'spec',
    experimentStatus: 'todo',
    risk: 'medium',
    impact: ['压缩率 +3%~10%', '吞吐 -3%~-8%'],
    alternatives: ['单块策略', '固定分块', '动态分块'],
    difficulty: 'medium',
    notes: '决定每块使用哪个预处理 / 上下文 / 后端组合',
  },
  {
    id: 'M09',
    name: 'StreamingIO',
    nameZh: '流式 IO',
    category: 'io',
    problem: '实际数据可能是几十 GB,内存装不下,需要流式处理。',
    why: '设计内存受限下的流水线 / 块调度,让压缩器可以在线上跑。',
    input: '文件 / 流',
    output: '块流 / 压缩流',
    inputs: ['文件路径 / 字节流'],
    outputs: ['块流'],
    dependsOn: ['M07', 'M08'],
    references: ['streaming zstd', 'pipelined PAQ'],
    status: 'spec',
    experimentStatus: 'todo',
    risk: 'low',
    impact: ['内存 -50%', '吞吐 -5%'],
    alternatives: ['内存加载', 'map-reduce', '流式'],
    difficulty: 'medium',
    notes: '支持任意大小输入流,做内存受限的流水线设计',
  },
  {
    id: 'M10',
    name: 'DictionaryMatcher',
    nameZh: '字典匹配器',
    category: 'probability',
    problem: '重复片段是通用无损压缩最稳定的收益来源,需要在窗口、哈希链和匹配长度之间做工程权衡。',
    why: '作为 LZ77/LZSS/Zstd/Brotli 的核心组件,决定重复发现能力、速度和内存占用。',
    input: '字节窗口 + 当前指针',
    output: 'literal / match token',
    inputs: ['滑动窗口', 'hash table / binary tree', '当前字节位置'],
    outputs: ['literal token', 'match length', 'match distance'],
    dependsOn: ['M08'],
    references: ['LZ77', 'DEFLATE', 'Zstd', 'Brotli'],
    experiments: ['exp-silesia-bpb'],
    status: 'prototype',
    experimentStatus: 'runnable',
    risk: 'medium',
    impact: ['文本/日志压缩率', '编码速度', '内存'],
    alternatives: ['hash chain', 'binary tree', 'suffix array', 'lazy matching'],
    difficulty: 'medium',
    notes: '适合从 zstd/lz4/brotli 源码中拆解 match finder 的速度-压缩率取舍。',
  },
  {
    id: 'M11',
    name: 'SymbolModel',
    nameZh: '符号统计模型',
    category: 'probability',
    problem: '熵编码器需要稳定的符号概率,但真实数据分布会随文件类型、块位置和上下文变化。',
    why: '在 Huffman、range coding、ANS 前提供频率表或概率估计,是传统 codec 与神经 codec 的接口层。',
    input: 'token 序列 / symbol stream',
    output: '频率表 / 累积分布 / 概率',
    inputs: ['literal/match token', '上下文标签', '块统计'],
    outputs: ['CDF', 'frequency table', 'escape symbol'],
    dependsOn: ['M03', 'M10'],
    references: ['Huffman', 'Arithmetic Coding', 'ANS'],
    experiments: ['exp-calgary-baseline'],
    status: 'spec',
    experimentStatus: 'verified',
    risk: 'low',
    impact: ['压缩率稳定性', '编码复杂度'],
    alternatives: ['static table', 'adaptive table', 'context-conditioned CDF', 'neural entropy model'],
    difficulty: 'medium',
    notes: '后续可作为传统统计模型和神经熵模型的统一接口。',
  },
  {
    id: 'M12',
    name: 'ContainerMetadata',
    nameZh: '容器与元数据',
    category: 'io',
    problem: '压缩流必须保存版本、参数、块索引、校验和和可逆边信息,否则无法稳定解码和复现实验。',
    why: '正式交付不能只有压缩比,还要能解释 bitstream 结构、兼容性和随机访问能力。',
    input: '模块参数 + 块结果 + 边信息',
    output: '可解码容器头与块索引',
    inputs: ['codec version', 'block plan', 'side information', 'checksum'],
    outputs: ['header', 'index', 'decode manifest'],
    dependsOn: ['M02', 'M07', 'M09'],
    references: ['Zstandard RFC 8878', 'CRAM specs', 'PNG format'],
    status: 'spec',
    experimentStatus: 'todo',
    risk: 'medium',
    impact: ['可复现性', '兼容性', '随机访问'],
    alternatives: ['single stream', 'chunked container', 'seekable frame', 'external manifest'],
    difficulty: 'medium',
    notes: '项目验收时应输出 bitstream manifest 和解码参数清单。',
  },
  {
    id: 'M13',
    name: 'BenchmarkHarness',
    nameZh: '评测闭环',
    category: 'orchestration',
    problem: '压缩率、速度、内存和 bit-exact 如果不在同一脚本里记录,很容易得到不可复现的比较。',
    why: '把数据下载、SHA256、命令、参数、重复运行、结果矩阵和失败日志固化成实验协议。',
    input: '数据集清单 + 压缩器命令',
    output: '结果矩阵 + 日志 + 可复现报告',
    inputs: ['dataset manifest', 'codec command', 'hardware profile'],
    outputs: ['CSV/JSON result matrix', 'stdout/stderr logs', 'artifact report'],
    dependsOn: ['M09', 'M12'],
    references: ['ACM Artifact Review', 'lzbench', 'SDRBench'],
    experiments: ['exp-silesia-bpb', 'exp-domain-compare'],
    status: 'prototype',
    experimentStatus: 'runnable',
    risk: 'low',
    impact: ['可信度', '实验效率', '可交付性'],
    alternatives: ['manual spreadsheet', 'Jupyter harness', 'CI benchmark'],
    difficulty: 'intro',
    notes: '实验台应围绕该模块继续扩展,避免只生成命令不留证据。',
  },
  {
    id: 'M14',
    name: 'DomainAdapter',
    nameZh: '领域适配层',
    category: 'transform',
    problem: '图像、科学数组、基因组、日志和模型权重的冗余结构不同,通用字节流策略会错过大量结构信息。',
    why: '在进入通用后端前做可逆字段拆分、delta、bitshuffle、颜色变换、参考序列或模板抽取。',
    input: '领域对象 / 半结构化字节流',
    output: '更易预测的子流集合',
    inputs: ['file type', 'schema/header', 'domain metadata'],
    outputs: ['substreams', 'side information', 'inverse transform manifest'],
    dependsOn: ['M01', 'M02', 'M06'],
    references: ['bitshuffle', 'JPEG-LS', 'CRAM', 'LogHub'],
    experiments: ['exp-domain-compare'],
    status: 'spec',
    experimentStatus: 'todo',
    risk: 'high',
    impact: ['领域数据压缩率', '实现复杂度', '格式依赖'],
    alternatives: ['no adapter', 'format-specific codec', 'learned preprocessor'],
    difficulty: 'hard',
    notes: '这是后续真正做算法改进时最有价值的接口层之一。',
  },
];

export const moduleStatusLabels: Record<ModuleStatus, string> = {
  spec: '草案',
  prototype: '原型',
  runnable: '可运行',
  verified: '已验证',
  production: '生产可用',
  deferred: '暂缓',
};

export const experimentStatusLabels: Record<AlgorithmModule['experimentStatus'], string> = {
  todo: 'todo',
  downloaded: 'downloaded',
  verified: 'verified',
  runnable: 'runnable',
  failed: 'failed',
};

export const categoryLabels: Record<ModuleCategory, string> = {
  input: '输入识别',
  orchestration: '分块策略',
  transform: '可逆变换',
  probability: '统计建模',
  neural: '神经预测',
  fusion: '概率融合',
  entropy: '熵编码',
  io: '流式封装',
};

/** 顺序的流水线节点 id,用于渲染顶部 pipeline */
export const pipelineOrder: readonly string[] = [
  'M01', 'M08', 'M14', 'M02', 'M06', 'M10', 'M03', 'M04', 'M05', 'M11', 'M07', 'M12', 'M09', 'M13',
];

export default algorithmModules;
