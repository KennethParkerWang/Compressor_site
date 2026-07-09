import type {EvolutionLane, EvolutionNode, PipelineStage, ScenarioKey} from './algorithmEvolution';
import {algorithmFigureImages} from './algorithmFigureImages';

export type AlgorithmSourceType =
  | 'paper'
  | 'standard'
  | 'official-doc'
  | 'official-repo'
  | 'benchmark'
  | 'tutorial'
  | 'secondary'
  | 'missing';

export type AlgorithmCompressionType = 'lossless' | 'lossy' | 'near-lossless' | 'hybrid' | 'format' | 'model';

export interface AlgorithmSource {
  type: AlgorithmSourceType;
  label: string;
  url?: string;
  note: string;
}

export interface AlgorithmPipelineStep {
  name: string;
  input: string;
  operation: string;
  output: string;
}

export interface AlgorithmBenchmarkRow {
  dataset: string;
  metric: string;
  value: string | number | null;
  unit: string;
  implementation: string;
  setting: string;
  sourceLabel: string;
  sourceUrl?: string;
  note: string;
}

export interface AlgorithmDiagramSlot {
  status: 'available' | 'placeholder';
  title: string;
  image?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  caption: string;
}

export interface AlgorithmStructureItem {
  title: string;
  detail: string;
}

export interface AlgorithmImplementationNote {
  title: string;
  detail: string;
}

export interface AlgorithmCatalogDetail {
  aliases: string[];
  compressionType: AlgorithmCompressionType;
  inputUnit: string;
  outputUnit: string;
  sourceNature: string;
  standardStatus: string;
  implementationStatus: string;
  cardHighlights: string[];
  sources: AlgorithmSource[];
  narratedFlow: string;
  structure: AlgorithmStructureItem[];
  implementationNotes: AlgorithmImplementationNote[];
  pipeline: AlgorithmPipelineStep[];
  diagram: AlgorithmDiagramSlot;
  benchmarks: AlgorithmBenchmarkRow[];
  limitations: string[];
}

export const sourceTypeLabels: Record<AlgorithmSourceType, string> = {
  paper: '论文',
  standard: '标准',
  'official-doc': '官方文档',
  'official-repo': '官方仓库',
  benchmark: 'Benchmark',
  tutorial: '教程',
  secondary: '二级资料',
  missing: '待核验',
};

export const compressionTypeLabels: Record<AlgorithmCompressionType, string> = {
  lossless: '无损',
  lossy: '有损',
  'near-lossless': '近无损',
  hybrid: '混合',
  format: '格式/容器',
  model: '模型',
};

const stageInput: Record<PipelineStage, string> = {
  foundation: '符号序列、概率分布或编码目标',
  match: '连续字节流和历史窗口',
  transform: '按块组织的字节、像素或数值数组',
  model: '符号流、上下文状态和历史统计',
  fusion: '多个预测器输出的概率估计',
  entropy: '符号序列及其概率或频率表',
  container: '已编码块、元数据和文件边界',
};

const stageOutput: Record<PipelineStage, string> = {
  foundation: '码长目标、概率约束或理论边界',
  match: 'literal 与 match token 序列',
  transform: '更易预测的残差、排序块或重排数组',
  model: '下一符号概率、上下文统计或残差分布',
  fusion: '融合后的符号概率',
  entropy: '紧凑 bitstream',
  container: '可交换文件、frame 或 archive',
};

const laneDefaultSource: Record<EvolutionLane, AlgorithmSource> = {
  theory: {
    type: 'secondary',
    label: 'Algorithm Evolution Atlas',
    note: '目录继承演化图谱中的理论定位，原始论文仍需逐条核验。',
  },
  entropy: {
    type: 'tutorial',
    label: 'Nayuki entropy coding references',
    url: 'https://www.nayuki.io/page/reference-arithmetic-coding',
    note: '用于补充熵编码实现说明；原始论文优先级高于教程。',
  },
  dictionary: {
    type: 'benchmark',
    label: 'lzbench compression benchmark',
    url: 'https://morotti.github.io/lzbench-web/',
    note: '用于定位 LZ 系列工程速度/压缩率区间，具体数值需绑定数据集、实现和参数。',
  },
  transform: {
    type: 'benchmark',
    label: 'Silesia Open Source Compression Benchmark',
    url: 'https://mattmahoney.net/dc/silesia.html',
    note: '用于通用无损压缩表现核对；领域图像/科学数据还需单独 benchmark。',
  },
  context: {
    type: 'benchmark',
    label: 'Large Text Compression Benchmark',
    url: 'https://mattmahoney.net/dc/text.html',
    note: '用于 PAQ/CMIX 等文本高压缩率路线核对。',
  },
  industrial: {
    type: 'official-doc',
    label: 'Format or implementation documentation',
    note: '工程格式优先使用 RFC、官方仓库或格式规范；缺失项显示待核验。',
  },
  neural: {
    type: 'paper',
    label: 'Learned compression paper trail',
    note: '学习式压缩需区分论文、代码、模型参数和传输 bitstream。',
  },
};

const implementationById: Record<string, AlgorithmSource[]> = {
  'shannon-fano': [
    {type: 'secondary', label: 'NIST DADS: Shannon-Fano coding', url: 'https://xlinux.nist.gov/dads/HTML/shannonFano.html', note: '算法词条级来源；用于术语核对，非原始论文。'},
  ],
  arithmetic: [
    {type: 'tutorial', label: 'Nayuki: Reference arithmetic coding', url: 'https://www.nayuki.io/page/reference-arithmetic-coding', note: '算术编码参考实现和工程解释入口。'},
  ],
  'range-coding': [
    {type: 'tutorial', label: 'Nayuki: Reference arithmetic coding', url: 'https://www.nayuki.io/page/reference-arithmetic-coding', note: '用于对照区间编码与算术编码的实现关系。'},
  ],
  lzss: [
    {type: 'secondary', label: 'LZSS overview', url: 'https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Storer%E2%80%93Szymanski', note: '用于补充 LZSS 历史定位；原始论文 DOI 后续继续核验。'},
  ],
  lzw: [
    {type: 'paper', label: 'A Technique for High-Performance Data Compression', url: 'https://doi.org/10.1109/MC.1984.1659158', note: 'LZW 论文入口。'},
  ],
  ppm: [
    {type: 'secondary', label: 'data-compression.info: PPM', url: 'https://www.data-compression.info/Algorithms/PPM/', note: 'PPM 算法资料入口；正式引用需再核对原始论文。'},
  ],
  zip: [
    {type: 'standard', label: 'PKWARE APPNOTE', url: 'https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT', note: 'ZIP 文件格式规范入口。'},
  ],
  rar: [
    {type: 'official-doc', label: 'RAR 5.0 archive format', url: 'https://www.rarlab.com/technote.htm', note: 'RARLAB 官方技术说明。'},
  ],
  deflate: [
    {type: 'official-repo', label: 'zlib', url: 'https://github.com/madler/zlib', note: '经典 DEFLATE/zlib 实现。'},
    {type: 'official-repo', label: 'libdeflate', url: 'https://github.com/ebiggers/libdeflate', note: '高性能 DEFLATE/zlib/gzip 库。'},
  ],
  gzip: [{type: 'official-doc', label: 'GNU gzip', url: 'https://www.gnu.org/software/gzip/', note: 'gzip 工具与文档入口。'}],
  ctw: [
    {type: 'paper', label: 'Context-tree weighting method', url: 'https://doi.org/10.1109/18.382012', note: 'CTW 代表性论文 DOI。'},
  ],
  lzx: [
    {type: 'secondary', label: 'LZX format overview', url: 'https://en.wikipedia.org/wiki/LZX_(algorithm)', note: '用于补充 Microsoft/CAB/CHM 生态定位；规范入口后续继续核验。'},
  ],
  bzip2: [{type: 'official-doc', label: 'bzip2', url: 'https://sourceware.org/bzip2/', note: 'bzip2 项目入口。'}],
  lzo: [{type: 'official-doc', label: 'LZO real-time data compression library', url: 'https://www.oberhumer.com/opensource/lzo/', note: 'LZO 官方项目入口。'}],
  dmc: [{type: 'secondary', label: 'data-compression.info: DMC', url: 'https://www.data-compression.info/Algorithms/DMC/', note: 'DMC 算法资料入口；原始论文信息后续核验。'}],
  lzma: [{type: 'official-doc', label: '7-Zip SDK', url: 'https://www.7-zip.org/sdk.html', note: 'LZMA/LZMA2 SDK 与格式实现入口。'}],
  ppmd: [{type: 'official-doc', label: '7-Zip SDK PPMd sources', url: 'https://www.7-zip.org/sdk.html', note: 'PPMd 工程实现入口。'}],
  xz: [{type: 'official-doc', label: 'Tukaani XZ Utils', url: 'https://tukaani.org/xz/', note: 'xz 文件格式与工具链入口。'}],
  lz4: [{type: 'official-repo', label: 'LZ4', url: 'https://github.com/lz4/lz4', note: 'LZ4 官方仓库。'}],
  zstd: [{type: 'official-repo', label: 'facebook/zstd', url: 'https://github.com/facebook/zstd', note: 'Zstandard 官方实现与文档。'}],
  brotli: [{type: 'official-repo', label: 'google/brotli', url: 'https://github.com/google/brotli', note: 'Brotli 官方实现。'}],
  snappy: [{type: 'official-repo', label: 'google/snappy', url: 'https://github.com/google/snappy', note: 'Snappy 官方实现。'}],
  'webp-lossless': [{type: 'standard', label: 'WebP lossless bitstream specification', url: 'https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification', note: 'Google WebP lossless bitstream 说明。'}],
  zopfli: [{type: 'official-repo', label: 'google/zopfli', url: 'https://github.com/google/zopfli', note: 'Zopfli 官方开源实现。'}],
  cmix: [{type: 'official-repo', label: 'byronknoll/cmix', url: 'https://github.com/byronknoll/cmix', note: 'CMIX 开源实现入口。'}],
  flif: [{type: 'official-repo', label: 'FLIF-hub/FLIF', url: 'https://github.com/FLIF-hub/FLIF', note: 'FLIF 项目仓库。'}],
  lzham: [{type: 'official-repo', label: 'richgel999/lzham_codec', url: 'https://github.com/richgel999/lzham_codec', note: 'LZHAM 开源实现。'}],
  lzfse: [{type: 'official-repo', label: 'lzfse/lzfse', url: 'https://github.com/lzfse/lzfse', note: 'Apple LZFSE 开源实现。'}],
  paq8px: [{type: 'official-repo', label: 'hxim/paq8px', url: 'https://github.com/hxim/paq8px', note: 'PAQ8PX 开源实现。'}],
  zpaq: [{type: 'official-doc', label: 'ZPAQ', url: 'https://mattmahoney.net/dc/zpaq.html', note: 'ZPAQ 项目说明。'}],
  bitshuffle: [{type: 'official-repo', label: 'kiyo-masui/bitshuffle', url: 'https://github.com/kiyo-masui/bitshuffle', note: 'Bitshuffle HDF5 filter / library。'}],
  zfp: [{type: 'official-doc', label: 'zfp documentation', url: 'https://zfp.readthedocs.io/', note: 'zfp 算法和 API 文档。'}],
  'neural-entropy': [{type: 'official-doc', label: 'CompressAI', url: 'https://interdigitalinc.github.io/CompressAI/', note: '学习式图像压缩 PyTorch 工具链。'}],
};

function isFormatKind(node: EvolutionNode): boolean {
  return node.kind === 'format' || node.kind === 'standard' || node.stage === 'container';
}

function inferCompressionType(node: EvolutionNode): AlgorithmCompressionType {
  if (node.id === 'zfp') return 'hybrid';
  if (node.id === 'jpeg-ls') return 'near-lossless';
  if (node.lane === 'neural') return 'model';
  if (isFormatKind(node)) return 'format';
  return 'lossless';
}

function inferSourceNature(node: EvolutionNode): string {
  if (node.sourceUrl) return node.kind === 'standard' || node.stage === 'container' ? '标准/规范可追溯' : '原始论文或作者资料可追溯';
  const sources = implementationById[node.id] ?? [];
  if (sources.some((source) => source.type === 'official-repo' || source.type === 'official-doc' || source.type === 'standard')) {
    return '有官方实现、文档或规范入口，原始来源继续补强';
  }
  if (sources.length) return '已有参考资料入口，原始来源待核验';
  return '待补充原始论文、标准或官方实现链接';
}

function inferImplementationStatus(node: EvolutionNode): string {
  const sources = implementationById[node.id] ?? [];
  if (sources.some((source) => source.type === 'official-repo')) return '已有开源实现入口';
  if (sources.some((source) => source.type === 'official-doc' || source.type === 'standard')) return '已有官方文档/规范入口';
  if (sources.length) return '已有参考资料入口';
  return '实现入口待补充';
}

function genericNarratedFlow(node: EvolutionNode): string {
  const name = node.title;
  if (node.stage === 'match') {
    return `${name} 将输入视为连续字节流，并在编码过程中维护历史窗口或动态字典。编码器在当前位置搜索历史数据中的重复片段，比较“直接写 literal”和“写引用 token”的代价；只有引用能减少总码长时，才输出距离、长度或字典索引。生成的 token 通常还需要再交给 Huffman、range coding、ANS/FSE 或容器层封装。解码端不再执行搜索，而是按 token 顺序直接写出 literal，或从已恢复输出中复制历史片段，因此编码搜索复杂度和解码复杂度是分离的。`;
  }
  if (node.stage === 'transform') {
    return `${name} 的核心不是直接把字节写得更短，而是先把输入变成更容易压缩的表示。编码器通常按块处理数据，对块执行可逆重排、预测、差分、过滤、bit-plane 整理或数值变换，使局部相关性转化为更集中的残差、长 run、重复符号或更偏斜的概率分布。随后后端再使用 RLE、Huffman、range coding、ANS 或通用 LZ 编码。解码过程必须严格反向执行：先恢复变换域符号，再执行逆变换或逆过滤，才能保证无损场景下字节一致。`;
  }
  if (node.stage === 'model' || node.stage === 'fusion') {
    return `${name} 属于“先预测概率、再熵编码”的路线。模型在每个符号或 bit 编码前，根据上下文、历史统计、状态机、字典特征或多个专家预测器估计概率分布；概率越准确，后端熵编码越接近信息熵下界。编码器和解码器必须共享完全一致的模型更新顺序：编码一个符号后立即更新上下文状态，解码端也在恢复符号后做同样更新。复杂模型通常能提高压缩率，但会显著增加内存、分支、缓存压力和解码延迟。`;
  }
  if (node.stage === 'entropy') {
    return `${name} 接收符号序列及其频率或概率模型，并把概率差异转化为实际 bitstream。典型实现会构造前缀码表、区间状态、range 状态或 ANS 状态转移表，使高概率符号获得更短表示，低概率符号承担更长表示。工程实现必须处理码表传输、归一化、缓冲区刷新、字节对齐和解码同步。该类算法通常不直接发现数据冗余，而是作为 LZ、BWT、预测模型或神经模型之后的码流后端。`;
  }
  if (node.stage === 'container') {
    return `${name} 更接近工程格式或完整压缩器，而不是单一数学模块。编码流程通常先把输入划分为 frame、block、文件条目或数据块，再调用内部压缩核心生成压缩载荷，同时写入版本、窗口大小、字典信息、块边界、校验和、文件属性或兼容标志。解码端先解析容器头和块描述，再按块调用对应解码器，最后通过长度和 checksum 校验完整性。此类方案的价值在于可交换性、兼容性、部署生态和长期可读性。`;
  }
  return `${name} 主要提供压缩系统中的理论约束或编码原则。它把符号概率、平均码长、可压缩性边界或码字构造规则形式化，为后续的熵编码、字典匹配、变换预处理和概率建模提供判据。实际压缩器通常不会只由该理论模块构成，而是把这些原则落实到码表构造、模型训练、解析策略或 bitstream 设计中。`;
}

function genericStructure(node: EvolutionNode): AlgorithmStructureItem[] {
  if (node.stage === 'match') {
    return [
      {title: '输入与历史区', detail: '输入按字节或符号顺序扫描，编码器维护一个历史窗口、短语表或字典，用于查询当前片段是否在过去出现。'},
      {title: '匹配搜索器', detail: '实现通常使用哈希表、链表、二叉树、后缀结构或分级索引寻找候选匹配，并通过最小长度、最大距离和解析策略筛选 token。'},
      {title: 'token 表示', detail: '输出由 literal、match length、distance、dictionary index 等组成，后端再对这些 token 单独统计或熵编码。'},
      {title: '解码状态', detail: '解码端只需要保存已恢复输出作为复制源，不需要重复编码端的搜索结构。'},
    ];
  }
  if (node.stage === 'transform') {
    return [
      {title: '块划分', detail: '输入先被切成固定或自适应块，块大小直接影响内存占用、局部性和随机访问能力。'},
      {title: '可逆变换层', detail: '通过排序、预测、差分、过滤或 bit-plane 重排改变符号分布，使后端面对更集中的残差或更长重复序列。'},
      {title: '后端编码层', detail: '变换结果通常继续接 RLE、MTF、Huffman、LZ、ANS 或专用码流格式。'},
      {title: '逆变换约束', detail: '每一步变换都必须有确定的逆过程，必要参数需要写入块头或由解码端可重复推导。'},
    ];
  }
  if (node.stage === 'model' || node.stage === 'fusion') {
    return [
      {title: '上下文状态', detail: '状态可来自前若干符号、bit history、局部邻域、字典命中、文件类型检测或神经网络 latent。'},
      {title: '概率估计器', detail: '模型输出符号概率或 bit 概率，可能是统计表、上下文树、状态机、多专家混合或神经熵模型。'},
      {title: '熵编码接口', detail: '概率输出通常接 arithmetic/range/ANS 等后端，模型精度决定码长，后端决定落地效率。'},
      {title: '同步更新规则', detail: '编码端和解码端必须在完全相同的时刻更新模型，否则 bitstream 无法正确反解。'},
    ];
  }
  if (node.stage === 'entropy') {
    return [
      {title: '概率输入', detail: '接收静态频率表、自适应频率表或上游模型给出的概率分布。'},
      {title: '码字/状态构造', detail: '根据概率构造前缀码、区间、range 状态或 ANS 状态表，将概率差异映射为 bit 长度差异。'},
      {title: '码流缓冲', detail: '工程实现需要处理 renormalization、字节输出、flush、对齐和错误检测。'},
      {title: '解码镜像', detail: '解码器必须获得同一套码表或状态转移规则，并按相同顺序消费 bitstream。'},
    ];
  }
  if (node.stage === 'container') {
    return [
      {title: '容器头', detail: '记录格式版本、压缩方法、窗口大小、字典标识、校验方式和兼容标志。'},
      {title: '块或文件条目', detail: '压缩载荷被组织为 block、frame 或 archive entry，便于流式处理、错误恢复或多文件封装。'},
      {title: '内部压缩核心', detail: '容器通常调用 LZ、Huffman、ANS、预测器或专用 codec，并不等同于单一算法。'},
      {title: '校验与元数据', detail: '长度、checksum、文件属性和可选索引决定格式的可靠性、可交换性和长期可读性。'},
    ];
  }
  return [
    {title: '理论对象', detail: '关注符号、概率、码长、熵或可压缩性边界，而不是某个固定文件格式。'},
    {title: '约束关系', detail: '给出概率分布与平均码长、模型能力与压缩极限之间的关系。'},
    {title: '工程落点', detail: '实际系统会把理论原则落实为码表构造、概率模型、解析策略或评价指标。'},
  ];
}

function genericImplementationNotes(node: EvolutionNode): AlgorithmImplementationNote[] {
  if (node.stage === 'match') {
    return [
      {title: '匹配查找', detail: '需要明确窗口大小、最小匹配长度、最大匹配距离、候选数量和哈希更新策略；这些参数决定压缩率和编码速度。'},
      {title: '解析策略', detail: '快速实现常用贪心解析，高压缩率实现会使用 lazy matching、动态规划或代价模型决定 literal 与 match 的取舍。'},
      {title: '解码复制', detail: '复制过程要处理 match 与输出区域重叠的情况，许多 LZ 解码器允许从正在写出的区域继续复制。'},
    ];
  }
  if (node.stage === 'transform') {
    return [
      {title: '块大小选择', detail: '大块通常提升统计稳定性和压缩率，但增加内存、延迟和错误影响范围；小块更适合流式与随机访问。'},
      {title: '参数记录', detail: '预测模式、排序索引、滤波器选择、bit-plane 数量等信息必须写入码流或由解码端确定推导。'},
      {title: '无损验证', detail: '实现时应对每个变换模块单独做 round-trip 测试，确保逆变换在边界值、空块和异常尺寸上正确。'},
    ];
  }
  if (node.stage === 'model' || node.stage === 'fusion') {
    return [
      {title: '状态管理', detail: '上下文表、模型权重和缓存需要严格定义初始化、更新和重置时机，避免编码/解码状态漂移。'},
      {title: '概率量化', detail: '实际熵编码通常需要整数频率或有限精度概率，概率量化会影响压缩率和速度。'},
      {title: '性能瓶颈', detail: '高阶上下文或神经模型容易受内存带宽、分支预测、缓存命中率和模型推理速度限制。'},
    ];
  }
  if (node.stage === 'entropy') {
    return [
      {title: '码表传输', detail: '静态表可写入 header，自适应表需要双方同步更新；码表本身也会产生额外开销。'},
      {title: '整数实现', detail: '工业实现通常使用整数区间、查表和位运算，避免浮点误差导致解码不同步。'},
      {title: '边界处理', detail: '需要处理 EOF、flush、renormalization、极低概率符号和损坏 bitstream 的错误检测。'},
    ];
  }
  if (node.stage === 'container') {
    return [
      {title: '格式解析', detail: '实现要先定义 header、块头、载荷、校验和可选字段的读取顺序，并处理未知扩展字段。'},
      {title: '块级调度', detail: '块大小和独立性决定能否并行压缩、流式解码、随机访问或快速跳过损坏区域。'},
      {title: '兼容性测试', detail: '正式实现需要与参考解码器互测，覆盖空文件、小文件、大文件、多块、损坏输入和不同压缩级别。'},
    ];
  }
  return [
    {title: '模型落地', detail: '需要把理论公式转成整数码长、码表构造、概率约束或评价指标。'},
    {title: '验证方式', detail: '通过小规模可手算样例验证码长、概率和解码一致性，再进入真实数据 benchmark。'},
  ];
}

function genericPipeline(node: EvolutionNode): AlgorithmPipelineStep[] {
  return [
    {
      name: '输入接收',
      input: stageInput[node.stage],
      operation: `读取 ${node.title} 所面向的数据单元，并准备对应的历史状态、块边界或概率上下文。`,
      output: '可被核心步骤消费的输入片段',
    },
    {
      name: '核心处理',
      input: '输入片段与内部状态',
      operation: node.role,
      output: stageOutput[node.stage],
    },
    {
      name: '写入压缩表示',
      input: stageOutput[node.stage],
      operation: '交给后端编码、容器封装或模型同步逻辑，记录解码所需的状态和参数。',
      output: node.stage === 'container' ? '文件、frame 或 archive' : '压缩 token / bitstream',
    },
    {
      name: '解码恢复',
      input: '压缩表示与必要元数据',
      operation: '按编码时相同的状态顺序执行逆过程，并验证无损场景下输出字节一致。',
      output: '恢复后的原始数据或可控误差重建数据',
    },
  ];
}

function genericBenchmarks(node: EvolutionNode): AlgorithmBenchmarkRow[] {
  const benchmark =
    node.lane === 'context'
      ? {label: 'Large Text Compression Benchmark', url: 'https://mattmahoney.net/dc/text.html'}
      : node.lane === 'dictionary' || node.lane === 'industrial'
        ? {label: 'lzbench', url: 'https://morotti.github.io/lzbench-web/'}
        : {label: 'Silesia Open Source Compression Benchmark', url: 'https://mattmahoney.net/dc/silesia.html'};

  return [
    {
      dataset: node.lane === 'neural' ? 'CLIC / learned compression datasets' : 'Silesia / enwik8 / domain corpus',
      metric: '公开数值',
      value: null,
      unit: 'NaN',
      implementation: '待绑定实现',
      setting: 'NaN',
      sourceLabel: benchmark.label,
      sourceUrl: benchmark.url,
      note: '本目录尚未抽取该算法在该数据集上的可比数值；后续应绑定实现版本、参数、硬件和校验方式。',
    },
  ];
}

function defaultDetail(node: EvolutionNode): AlgorithmCatalogDetail {
  const sources: AlgorithmSource[] = [];
  if (node.sourceUrl) {
    sources.push({
      type: node.kind === 'standard' || node.stage === 'container' ? 'standard' : 'paper',
      label: node.sourceLabel ?? node.title,
      url: node.sourceUrl,
      note: '来自演化图谱中的主来源链接。',
    });
  }
  sources.push(...(implementationById[node.id] ?? []));
  if (sources.length === 0) sources.push(laneDefaultSource[node.lane]);
  const mechanismImage = algorithmFigureImages[node.id];

  return {
    aliases: [node.title, ...node.tags.slice(0, 2)],
    compressionType: inferCompressionType(node),
    inputUnit: stageInput[node.stage],
    outputUnit: stageOutput[node.stage],
    sourceNature: inferSourceNature(node),
    standardStatus: node.kind === 'standard' ? '已有标准/规范入口' : isFormatKind(node) ? '格式/容器需核对规范版本' : '非标准算法或研究模型',
    implementationStatus: inferImplementationStatus(node),
    cardHighlights: [node.role, node.why, `适用：${node.scenarios.join(' / ')}`],
    sources,
    narratedFlow: genericNarratedFlow(node),
    structure: genericStructure(node),
    implementationNotes: genericImplementationNotes(node),
    pipeline: genericPipeline(node),
    diagram: {
      status: mechanismImage ? 'available' : 'placeholder',
      title: mechanismImage ? `${node.title} 机制图` : `${node.title} 结构图位`,
      image: mechanismImage,
      sourceLabel: mechanismImage ? 'AI-generated mechanism figure' : undefined,
      caption: mechanismImage
        ? '根据算法目录中的结构、流程、实现要点和通用稳定机制生成的科研机制图；不包含未验证性能结论。'
        : '尚未绑定公开框架图。当前保留统一图位，后续可替换为论文图、官方文档图或自绘流程图。',
    },
    benchmarks: genericBenchmarks(node),
    limitations: [
      '公开表现必须绑定具体实现、版本、参数、数据集和硬件环境。',
      '该条目目前以可追溯来源和流程拆解为主，未实测的数据不作为性能结论。',
    ],
  };
}

type DetailOverride = Partial<Omit<AlgorithmCatalogDetail, 'sources' | 'pipeline' | 'benchmarks'>> & {
  aliases?: string[];
  sources?: AlgorithmSource[];
  pipeline?: AlgorithmPipelineStep[];
  benchmarks?: AlgorithmBenchmarkRow[];
};

const overrides: Record<string, DetailOverride> = {
  huffman: {
    aliases: ['Huffman Coding', 'Huffman code', '最优前缀码'],
    narratedFlow:
      'Huffman 编码先统计符号频率，并把每个符号初始化为带权叶子节点。构造阶段反复合并权重最小的两个节点，直到形成一棵二叉树；从根到叶子的路径就是该符号码字，高频符号通常更靠近根节点，因此获得更短码长。实际文件格式很少直接保存整棵树，通常保存规范 Huffman 码长，再由解码端重建码表。编码时逐符号查表写 bit，解码时按前缀性质逐位匹配，遇到叶子即输出符号。',
    sources: [
      {type: 'paper', label: 'Minimum-Redundancy Codes', url: 'https://doi.org/10.1109/JRPROC.1952.273898', note: 'Huffman 原始论文 DOI。'},
      {type: 'tutorial', label: 'Nayuki: Huffman Coding', url: 'https://www.nayuki.io/page/huffman-coding', note: '代码级说明与实现参考。'},
    ],
    pipeline: [
      {name: '频率统计', input: '符号序列', operation: '统计每个符号频率或接收外部频率表。', output: '符号权重表'},
      {name: '构造树/码长', input: '符号权重表', operation: '反复合并最小权重节点，得到前缀码树或规范化码长。', output: 'Huffman 码表'},
      {name: '写码流', input: '原始符号与码表', operation: '将每个符号替换为变长码字，并保存解码所需码表。', output: '变长 bitstream'},
      {name: '前缀解码', input: 'bitstream 与码表', operation: '逐 bit 匹配前缀码，遇到叶子输出符号。', output: '原始符号序列'},
    ],
  },
  deflate: {
    aliases: ['DEFLATE', 'RFC 1951', 'LZ77 + Huffman'],
    narratedFlow:
      'DEFLATE 将输入划分为 block，每个 block 可选择 stored、fixed Huffman 或 dynamic Huffman 方式。压缩核心先用 LZ77 在 32 KiB 历史窗口内寻找重复片段，输出 literal 或 length-distance pair；随后 literal/length 字母表和 distance 字母表分别用 Huffman 编码。dynamic block 会先写入码长码表，再写入两组 Huffman 码表，最后写 token 流。解码端按 block 头恢复码表，literal 直接输出，length-distance pair 从已恢复窗口复制，直到 end-of-block 符号结束。',
    sources: [
      {type: 'standard', label: 'RFC 1951: DEFLATE Compressed Data Format', url: 'https://www.rfc-editor.org/rfc/rfc1951.html', note: 'DEFLATE 格式规范。'},
      {type: 'official-repo', label: 'zlib', url: 'https://github.com/madler/zlib', note: '经典 DEFLATE 实现。'},
      {type: 'official-repo', label: 'libdeflate', url: 'https://github.com/ebiggers/libdeflate', note: '高性能 DEFLATE 实现。'},
    ],
    pipeline: [
      {name: '分块', input: '字节流', operation: '选择 stored/fixed/dynamic block，并维护 32 KiB 级历史窗口。', output: 'block 与历史窗口状态'},
      {name: 'LZ77 token 化', input: '当前位置和历史窗口', operation: '查找重复片段，输出 literal 或 length-distance pair。', output: 'literal/length/distance token'},
      {name: 'Huffman 后端', input: 'token 频率', operation: '构造 fixed 或 dynamic Huffman 码表并编码 token。', output: 'DEFLATE token bitstream'},
      {name: '解码复制', input: 'Huffman 表与 token', operation: 'literal 直接输出，match 从已恢复窗口复制。', output: '原始字节流'},
    ],
    benchmarks: [
      {dataset: 'Silesia Corpus', metric: 'compressed size', value: null, unit: 'NaN', implementation: 'zlib / libdeflate / gzip variants', setting: 'level varies', sourceLabel: 'lzbench', sourceUrl: 'https://morotti.github.io/lzbench-web/', note: 'DEFLATE 有多个实现；需要指定 zlib、libdeflate 或 gzip 参数后再填数值。'},
    ],
  },
  gzip: {
    aliases: ['gzip', 'RFC 1952', 'GNU zip'],
    narratedFlow:
      'gzip 是 DEFLATE 的单文件封装格式。文件头记录压缩方法、时间戳、标志位、可选文件名和扩展字段；中间载荷通常是 DEFLATE bitstream，即 LZ77 token 加 Huffman 后端；尾部保存 CRC32 和原始输入大小。解码流程先解析 header，再调用 DEFLATE 解码载荷，最后用 CRC32 和长度字段验证恢复字节流是否完整。gzip 的重点不是提出新的压缩核心，而是把 DEFLATE 变成可交换、可校验、适合 UNIX/Web 生态的文件格式。',
    sources: [
      {type: 'standard', label: 'RFC 1952: GZIP File Format', url: 'https://www.rfc-editor.org/rfc/rfc1952.html', note: 'gzip 文件格式规范。'},
      {type: 'official-doc', label: 'GNU gzip', url: 'https://www.gnu.org/software/gzip/', note: 'gzip 工具入口。'},
    ],
  },
  lz77: {
    aliases: ['LZ77', 'Sliding-window Lempel-Ziv'],
    narratedFlow:
      'LZ77 从输入头部顺序扫描，编码器维护一个滑动历史窗口。当前位置会在窗口中寻找最长或代价最优的重复片段；若匹配收益超过 token 开销，则输出 distance 和 length，否则输出 literal。窗口随后前移，新输出的数据也成为后续匹配历史。解码端不需要重做搜索，只要按 token 顺序写 literal 或从已写输出中复制指定长度即可恢复数据。LZ77 的关键取舍是搜索深度、窗口大小、匹配长度阈值和解析策略。',
    sources: [
      {type: 'paper', label: 'A Universal Algorithm for Sequential Data Compression', url: 'https://doi.org/10.1109/TIT.1977.1055714', note: 'LZ77 原始论文。'},
      {type: 'benchmark', label: 'lzbench', url: 'https://morotti.github.io/lzbench-web/', note: 'LZ 家族工程实现对比入口。'},
    ],
  },
  lz78: {
    aliases: ['LZ78', 'Incremental dictionary'],
    narratedFlow:
      'LZ78 使用增量短语字典，而不是固定滑动窗口。编码器在当前输入前缀中查找字典已有的最长短语，输出该短语索引和后续新符号，然后把“旧短语 + 新符号”加入字典。字典随着输入逐步扩大，重复短语会被索引替代。解码端按相同顺序重建字典：读取索引和新符号后输出短语，并把新组合插入自己的字典。该路线影响了 LZW 等工程化字典编码。',
    sources: [
      {type: 'paper', label: 'Compression of Individual Sequences via Variable-Rate Coding', url: 'https://doi.org/10.1109/TIT.1978.1055934', note: 'LZ78 原始论文。'},
    ],
  },
  lzw: {
    aliases: ['LZW', 'Lempel-Ziv-Welch'],
    narratedFlow:
      'LZW 在 LZ78 基础上去掉了显式“新符号”输出，初始字典通常包含所有单字节符号。编码器尽可能延长当前短语；当“当前短语 + 下一个符号”不在字典中时，输出当前短语索引，并把新组合加入字典。解码端通过已输出短语和前一个短语恢复同样的字典，遇到特殊的“尚未加入但可推导”索引时需要按 LZW 规则处理。LZW 的优势是实现相对简单，历史上用于 GIF 与 UNIX compress。',
  },
  bwt: {
    aliases: ['BWT', 'Burrows-Wheeler Transform', 'Block sorting'],
    narratedFlow:
      'BWT 是可逆块排序变换。对一个输入块，算法等价于对所有循环旋转排序，并取排序矩阵最后一列作为输出，同时记录原始行索引；工程实现不会真的构造完整矩阵，而是通过后缀数组或相关排序结构完成。BWT 输出通常把相似上下文的字符聚集在一起，形成更长的局部重复和更偏斜的符号分布，后续再接 MTF、RLE 和熵编码。逆变换利用第一列和最后一列的 LF-mapping 关系从索引重建原始块。',
    sources: [
      {type: 'paper', label: 'A Block-sorting Lossless Data Compression Algorithm', url: 'https://www.cs.jhu.edu/~langmea/resources/burrows_wheeler.pdf', note: 'Burrows 与 Wheeler 技术报告副本。'},
    ],
  },
  bzip2: {
    aliases: ['bzip2', 'BWT + MTF + Huffman'],
    narratedFlow:
      'bzip2 是 BWT 路线的工程化压缩器。输入先被分块，每块执行 BWT，使相似上下文聚集；随后 move-to-front 将近期重复字符转换为小整数，run-length coding 处理连续重复，再用多组 Huffman 码编码符号。解码按相反顺序执行 Huffman 解码、RLE 还原、MTF 还原和逆 BWT。它通常比 gzip 在文本上有更好压缩率，但编码/解码速度和内存开销更高。',
    sources: [
      {type: 'official-doc', label: 'bzip2 project', url: 'https://sourceware.org/bzip2/', note: 'bzip2 项目入口。'},
      {type: 'benchmark', label: 'Large Text Compression Benchmark bzip2 notes', url: 'https://mattmahoney.net/dc/text.html', note: '包含 bzip2 在文本压缩榜单中的说明。'},
    ],
  },
  ans: {
    aliases: ['ANS', 'rANS', 'tANS', 'FSE'],
    narratedFlow:
      'ANS 将编码状态表示为一个整数，并把不同符号映射到状态空间中的不同子集，子集密度对应符号概率。编码符号时，状态被推进到属于该符号的新状态；当状态超出范围时输出低位做归一化。解码时从当前状态反推出符号，再把状态退回前一状态并从 bitstream 补位。rANS 偏向寄存器状态和反向编码，tANS/FSE 偏向查表状态机；它们在接近算术编码压缩率的同时，能提供更高吞吐和更好的工程可实现性。',
    sources: [
      {type: 'paper', label: 'Asymmetric numeral systems', url: 'https://arxiv.org/abs/1311.2540', note: 'Duda ANS 论文。'},
      {type: 'tutorial', label: 'Interleaved Entropy Coders', url: 'https://fgiesen.wordpress.com/2015/12/21/interleaved-entropy-coders/', note: '工程实现背景说明。'},
    ],
  },
  paq8px: {
    aliases: ['PAQ8PX', 'PAQ8 high-ratio branch'],
    benchmarks: [
      {dataset: 'Silesia Corpus', metric: 'total compressed size', value: 27825511, unit: 'bytes', implementation: 'paq8px_v215', setting: '-12L', sourceLabel: 'Silesia Open Source Compression Benchmark', sourceUrl: 'https://mattmahoney.net/dc/silesia.html', note: 'Mahoney Silesia benchmark line item；只代表该实现和参数。'},
      {dataset: 'enwik9', metric: 'compressed size', value: null, unit: 'NaN', implementation: 'PAQ family', setting: 'varies', sourceLabel: 'Large Text Compression Benchmark', sourceUrl: 'https://mattmahoney.net/dc/text.html', note: '需进一步抽取 PAQ8PX 对应版本行。'},
    ],
  },
  cmix: {
    aliases: ['CMIX', 'context mixing high-ratio compressor'],
    benchmarks: [
      {dataset: 'Silesia Corpus', metric: 'total compressed size', value: 28261094, unit: 'bytes', implementation: 'precomp v0.4.7 -cn | cmix v21', setting: 'pipeline', sourceLabel: 'Silesia Open Source Compression Benchmark', sourceUrl: 'https://mattmahoney.net/dc/silesia.html', note: '该行包含 precomp 与 cmix 组合，不应解释为纯 CMIX 单体结果。'},
      {dataset: 'enwik9', metric: 'compressed size', value: null, unit: 'NaN', implementation: 'cmix versions', setting: 'varies', sourceLabel: 'Large Text Compression Benchmark', sourceUrl: 'https://mattmahoney.net/dc/text.html', note: '需绑定具体 cmix 版本后抽取。'},
    ],
  },
  brotli: {
    aliases: ['Brotli', 'RFC 7932'],
    narratedFlow:
      'Brotli 是面向 Web 内容的 LZ77 + Huffman 压缩格式。输入被切成 meta-block，每个 meta-block 可以是压缩块、未压缩块或元数据块。压缩块内部先通过 LZ77 匹配生成“插入 literal + 复制长度 + 距离”的命令流；匹配来源既可以是滑动窗口，也可以是内置静态字典及其大小写、后缀等变换。随后 Brotli 按 block type 和上下文为 literal、command、distance 构造 Huffman 编码，并利用最近距离缓存减少重复 distance 的表示成本。解码端读取窗口大小和 meta-block 描述，恢复 Huffman 表，按命令流插入 literal 或从历史窗口/静态字典复制，逐块重建原始字节流。',
    structure: [
      {title: 'meta-block 层', detail: 'Brotli 码流由多个 meta-block 组成，每个块携带压缩/未压缩/元数据标志、长度和 block type 描述，便于流式解码。'},
      {title: 'LZ77 命令流', detail: '核心 token 不是单纯 literal 或 match，而是 insert length、copy length 和 distance 组合，表示先插入若干字面量，再复制一段历史或字典内容。'},
      {title: '静态字典', detail: '格式内置面向 Web 文本的词典，匹配可引用词典单词并应用大小写、前后缀等变换，适合 HTML/CSS/JS 等资源。'},
      {title: '上下文 Huffman', detail: 'literal、command、distance 有不同 Huffman 树，并可按 block type 与上下文切换，提升文本局部建模能力。'},
      {title: '距离缓存', detail: '最近使用的 distance 会被缓存，重复距离可以用短码表示，降低相邻重复结构的编码开销。'},
    ],
    implementationNotes: [
      {title: '匹配与解析', detail: '编码器需要同时评估窗口匹配、静态字典匹配和 literal 成本；高压缩级别会做更深搜索和更复杂的代价解析。'},
      {title: 'Huffman 表生成', detail: '实现要为 literal、command、distance 分别统计频率，并处理 block type 切换、上下文映射和码长编码。'},
      {title: 'bitstream 解析', detail: 'Brotli 是细粒度 bitstream 格式，解码器必须严格按 RFC 读取窗口大小、meta-block header、Huffman tree 和 command。'},
      {title: 'Web 部署取舍', detail: '高等级 Brotli 编码较慢，常用于静态资源预压缩；解码端设计目标是浏览器快速、低内存、稳定恢复。'},
    ],
    sources: [
      {type: 'standard', label: 'RFC 7932: Brotli Compressed Data Format', url: 'https://www.rfc-editor.org/rfc/rfc7932.html', note: 'Brotli 格式规范。'},
      {type: 'official-repo', label: 'google/brotli', url: 'https://github.com/google/brotli', note: '官方开源实现。'},
    ],
  },
  zstd: {
    aliases: ['Zstandard', 'zstd', 'RFC 8878'],
    narratedFlow:
      'Zstandard 将输入组织为 frame 和 block，并根据压缩级别选择不同的 LZ77 匹配搜索与解析策略。block 内部会生成 literals、match lengths、offsets 等序列；literals 常用 Huffman，序列元数据常用 FSE/ANS 风格表编码。frame header 记录窗口大小、内容大小、checksum 和可选字典信息。解码端解析 frame 与 block 表描述，恢复 literal 流和 match 序列，再按 offset 从历史窗口复制。Zstd 的核心价值是把压缩级别、字典训练、快速解码和较高压缩率放在同一个工业格式中平衡。',
    sources: [
      {type: 'standard', label: 'RFC 8878: Zstandard Compression', url: 'https://www.rfc-editor.org/rfc/rfc8878.html', note: 'Zstandard 格式与媒体类型规范。'},
      {type: 'official-repo', label: 'facebook/zstd', url: 'https://github.com/facebook/zstd', note: '官方实现和文档。'},
      {type: 'tutorial', label: 'The Zstandard Format', url: 'https://nigeltao.github.io/blog/2022/zstandard-part-1-concepts.html', note: '工程化格式解读。'},
    ],
    structure: [
      {title: 'frame 层', detail: 'frame header 描述窗口大小、内容大小、字典 ID 和 checksum，多个 block 组成一个可解码单元。'},
      {title: 'LZ 序列层', detail: 'block 内部解析为 literals、match lengths、offsets 和 repeat offsets，支持快速解码和压缩级别扩展。'},
      {title: '熵编码层', detail: 'literal 可使用 Huffman，序列部分使用 FSE 表编码，将 LZ token 分布转成紧凑 bitstream。'},
      {title: '字典机制', detail: '支持训练字典和外部字典 ID，适合小文件、日志、协议包等同分布数据。'},
    ],
    implementationNotes: [
      {title: '压缩级别', detail: '低等级偏向快速哈希链和浅搜索，高等级会增加搜索深度、解析优化和熵表优化。'},
      {title: 'repeat offset', detail: '最近 offset 可被复用，减少连续相似匹配的距离编码成本，是 Zstd 高速解码的重要组成。'},
      {title: '并行与流式', detail: 'frame/block 结构支持流式解码，工程实现可在大文件上做块级并行和多线程压缩。'},
    ],
  },
  'jpeg-ls': {
    aliases: ['JPEG-LS', 'LOCO-I'],
    narratedFlow:
      'JPEG-LS/LOCO-I 按扫描线处理图像像素，通过左、上、左上等邻域估计局部边缘方向并生成预测值。编码器写出真实像素与预测值之间的残差，并根据局部上下文对残差分布进行自适应建模。残差通常比原像素更集中，因此适合 Golomb/Rice 类编码。解码端使用相同扫描顺序和同样邻域预测，读出残差后加回预测值，逐像素恢复图像；近无损模式还会引入受控误差边界。',
    sources: [
      {type: 'paper', label: 'The LOCO-I lossless image compression algorithm', url: 'https://doi.org/10.1109/83.855427', note: 'JPEG-LS 核心算法论文。'},
      {type: 'paper', label: 'LOCO-I principles and JPEG-LS standardization', url: 'https://collaborate.princeton.edu/en/publications/the-loco-i-lossless-image-compression-algorithm-principles-and-st/', note: '论文信息页。'},
    ],
  },
  zfp: {
    aliases: ['ZFP', 'floating-point array compressor'],
    narratedFlow:
      'ZFP 面向多维浮点或整数数组，先把数组切成小块，再根据 fixed-rate、fixed-precision、fixed-accuracy 或 lossless 模式确定码率与误差目标。有损模式通常执行块级可逆/近似变换、指数对齐和 bit-plane 编码，优先写出高重要性的位平面；无损模式保留足够信息以严格恢复。码流需要记录块结构、模式参数和精度约束。解码端按块恢复 bit-plane，执行逆变换并重建数组值。',
    sources: [
      {type: 'official-doc', label: 'zfp algorithm documentation', url: 'https://zfp.readthedocs.io/en/release0.5.5/algorithm.html', note: 'zfp 算法文档。'},
      {type: 'official-repo', label: 'LLNL/zfp', url: 'https://github.com/LLNL/zfp', note: 'zfp 官方仓库。'},
    ],
  },
};

export function getAlgorithmCatalogDetail(node: EvolutionNode): AlgorithmCatalogDetail {
  const base = defaultDetail(node);
  const override = overrides[node.id];
  if (!override) return base;

  return {
    ...base,
    ...override,
    aliases: override.aliases ?? base.aliases,
    sources: override.sources ?? base.sources,
    pipeline: override.pipeline ?? base.pipeline,
    benchmarks: override.benchmarks ?? base.benchmarks,
    diagram: override.diagram ?? base.diagram,
    limitations: override.limitations ?? base.limitations,
    cardHighlights: override.cardHighlights ?? base.cardHighlights,
  };
}

export function getCatalogCoverage(detail: AlgorithmCatalogDetail): {
  sourceCount: number;
  benchmarkCount: number;
  hasRealBenchmark: boolean;
  hasDiagram: boolean;
} {
  return {
    sourceCount: detail.sources.filter((source) => source.type !== 'missing' && Boolean(source.url)).length,
    benchmarkCount: detail.benchmarks.length,
    hasRealBenchmark: detail.benchmarks.some((row) => row.value !== null && row.value !== 'NaN'),
    hasDiagram: detail.diagram.status === 'available',
  };
}
