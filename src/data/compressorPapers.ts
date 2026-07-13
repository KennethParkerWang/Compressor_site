export type CompressionMetricKey =
  | 'compressionRatio'
  | 'bitsPerByte'
  | 'compressedSize'
  | 'compressionThroughput'
  | 'decompressionThroughput'
  | 'compressionLatency'
  | 'decompressionLatency'
  | 'peakMemory';

export type TermCategory =
  | '数据与输入单位'
  | '预处理'
  | '字典与匹配'
  | '上下文建模'
  | '概率预测'
  | '熵编码'
  | '训练与更新'
  | '评价指标';

export interface CompressorTerm {
  id: string;
  name: string;
  explanation: string;
  category: TermCategory;
  locations: string[];
  detailUrl: string;
}

export interface PaperFigure {
  id: string;
  title: string;
  src?: string;
  caption: string;
}

export interface PaperAnalysisSection {
  id: string;
  title: string;
  summary: string;
  body?: string[];
  termIds?: string[];
  figureId?: string;
  formula?: string;
  code?: string;
  table?: Array<Record<string, string>>;
  emptyReason?: string;
}

export interface CompressionMetrics {
  compressionRatio?: number;
  bitsPerByte?: number;
  compressedSize?: number;
  compressionThroughput?: number;
  decompressionThroughput?: number;
  compressionLatency?: number;
  decompressionLatency?: number;
  peakMemory?: number;
}

export interface CompressorExperiment {
  id: string;
  name: string;
  dataset: string;
  split?: string;
  baseline?: string;
  codeVersion?: string;
  parameters?: string;
  blockSize: string;
  hardware?: string;
  metrics: CompressionMetrics;
  verificationPassed?: boolean;
  status: 'paper' | 'planned' | 'running' | 'complete' | 'failed';
  note?: string;
}

export interface CompressorPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
  coverImage: string;
  pdfUrl: string;
  codeUrl?: string;
  readingStatus: '待精读' | '精读中' | '已完成';
  compressorName: string;
  compressorFamily: string;
  inputUnit: string;
  blockSizes: string[];
  preprocessing: string[];
  modelArchitecture: string[];
  contextModels: string[];
  probabilityPrediction: string[];
  entropyCoder: string[];
  trainingOrUpdate: string[];
  encoderDecoderSync: string[];
  datasets: string[];
  metrics: CompressionMetricKey[];
  baselines: string[];
  contributions: string[];
  limitations: string[];
  sections: PaperAnalysisSection[];
  figures: PaperFigure[];
  terms: CompressorTerm[];
  paperExperiments: CompressorExperiment[];
  reproductionExperiments: CompressorExperiment[];
}

const paqTerms: CompressorTerm[] = [
  {id: 'byte-input', name: 'Byte-wise input', explanation: '按字节顺序读取数据，并在内部把每个字节展开为比特预测任务。', category: '数据与输入单位', locations: ['flow', 'preprocessing'], detailUrl: '/terms?term=byte'},
  {id: 'context-model', name: 'Context model', explanation: '从历史比特、字节或文件类型中构造条件信息，用于预测下一比特。', category: '上下文建模', locations: ['model', 'prediction'], detailUrl: '/terms?term=context-model'},
  {id: 'context-mixing', name: 'Context mixing', explanation: '将多个上下文模型的预测按状态自适应加权，形成一个最终概率。', category: '概率预测', locations: ['model', 'prediction'], detailUrl: '/terms?term=context-mixing'},
  {id: 'sse', name: 'SSE', explanation: 'Secondary Symbol Estimation，对混合后的概率进行分段校准。', category: '概率预测', locations: ['prediction'], detailUrl: '/terms?term=sse'},
  {id: 'arithmetic-coding', name: 'Arithmetic coding', explanation: '根据逐比特概率不断缩小编码区间，把概率优势转换为更短码流。', category: '熵编码', locations: ['entropy'], detailUrl: '/terms?term=arithmetic-coding'},
  {id: 'online-update', name: 'Online update', explanation: '编码与解码两端按同一顺序更新模型参数，不传输完整模型状态。', category: '训练与更新', locations: ['sync'], detailUrl: '/terms?term=online-update'},
  {id: 'bpb', name: 'Bits per byte', explanation: '压缩后比特数除以原始字节数，越低通常表示无损压缩率越高。', category: '评价指标', locations: ['metrics', 'results'], detailUrl: '/terms?term=bits-per-byte'},
];

const nncpTerms: CompressorTerm[] = [
  {id: 'byte-token', name: 'Byte token', explanation: '把 0-255 的字节值作为离散 token，由模型预测下一个字节分布。', category: '数据与输入单位', locations: ['flow', 'preprocessing'], detailUrl: '/terms?term=byte-token'},
  {id: 'transformer', name: 'Transformer', explanation: '利用自注意力聚合长距离上下文，为下一 token 输出条件分布。', category: '上下文建模', locations: ['model'], detailUrl: '/terms?term=transformer'},
  {id: 'softmax', name: 'Softmax distribution', explanation: '把模型 logits 归一化为 256 个字节值的概率分布。', category: '概率预测', locations: ['prediction'], detailUrl: '/terms?term=softmax'},
  {id: 'quantized-probability', name: 'Probability quantization', explanation: '将浮点概率转换为编码器可用的整数频数，同时保持两端一致。', category: '熵编码', locations: ['entropy', 'sync'], detailUrl: '/terms?term=probability-quantization'},
  {id: 'arithmetic-coder', name: 'Arithmetic coder', explanation: '使用模型给出的离散分布对字节序列进行无损熵编码。', category: '熵编码', locations: ['entropy'], detailUrl: '/terms?term=arithmetic-coding'},
  {id: 'deterministic-inference', name: 'Deterministic inference', explanation: '编码端和解码端必须得到一致的概率表，否则后续码流无法继续解析。', category: '训练与更新', locations: ['sync'], detailUrl: '/terms?term=deterministic-inference'},
  {id: 'model-cost', name: 'Model cost', explanation: '公平比较时需要说明模型参数和程序体积是否计入总压缩成本。', category: '评价指标', locations: ['metrics', 'limitations'], detailUrl: '/terms?term=model-cost'},
];

const commonSectionTitles = [
  ['background', '研究背景'],
  ['problem', '解决的问题'],
  ['flow', '压缩器总体流程'],
  ['preprocessing', '数据预处理'],
  ['model', '核心建模方法'],
  ['prediction', '概率预测方式'],
  ['entropy', '熵编码方式'],
  ['sync', '编码端与解码端同步'],
  ['datasets', '数据集'],
  ['metrics', '评价指标'],
  ['results', '实验结果'],
  ['advantages', '优点'],
  ['limitations', '局限'],
  ['project-value', '对当前项目的价值'],
] as const;

function section(id: string, summary: string, body?: string[], extras: Partial<PaperAnalysisSection> = {}): PaperAnalysisSection {
  const title = commonSectionTitles.find(([key]) => key === id)?.[1] ?? id;
  return {id, title, summary, body, ...extras};
}

export const compressorPapers: CompressorPaper[] = [
  {
    id: 'LIT-0101',
    title: 'A Machine Learning Perspective on Predictive Coding with PAQ',
    authors: ['Byron Knoll', 'Nando de Freitas'],
    year: 2011,
    venue: 'arXiv:1108.3298',
    abstract: '论文从统计机器学习角度解释 PAQ8 的预测编码机制，重点讨论多模型预测、上下文混合、自适应更新以及这些模块如何共同服务于无损压缩。',
    coverImage: '/img/literature-covers/lit-0101.png',
    pdfUrl: 'https://arxiv.org/pdf/1108.3298',
    codeUrl: 'https://github.com/hxim/paq8px',
    readingStatus: '精读中',
    compressorName: 'PAQ8 family',
    compressorFamily: '上下文混合压缩器',
    inputUnit: 'Byte stream / bit prediction',
    blockSizes: ['Whole file', '1 MiB logical segment'],
    preprocessing: ['文件类型检测', '可逆预处理（依实现配置）'],
    modelArchitecture: ['多上下文专家', 'Mixer', 'SSE 概率校准'],
    contextModels: ['n-gram contexts', 'match model', 'specialized file models'],
    probabilityPrediction: ['逐比特概率', '自适应加权', 'SSE 校准'],
    entropyCoder: ['Arithmetic-family coder'],
    trainingOrUpdate: ['逐符号在线更新', '编码/解码同步更新'],
    encoderDecoderSync: ['相同初始状态', '相同模型更新顺序', '相同预处理逆过程'],
    datasets: ['Calgary Corpus', 'Canterbury Corpus', 'enwik8'],
    metrics: ['bitsPerByte', 'compressionThroughput', 'decompressionThroughput', 'peakMemory'],
    baselines: ['gzip', 'bzip2', 'PPMd'],
    contributions: ['把 PAQ 模块放入统一的概率学习视角', '解释上下文混合与在线适应的关系', '给出可迁移到其他序列建模任务的讨论'],
    limitations: ['计算量和内存开销较高', '部分工程启发式模块难以由统一理论完全解释', '不同 PAQ 分支实现差异较大'],
    figures: [
      {id: 'paq-flow', title: 'PAQ 概率编码流程', caption: '多个上下文模型输出概率，经 Mixer 与 SSE 校准后交给算术类编码器。'},
    ],
    terms: paqTerms,
    sections: [
      section('background', '通用无损压缩需要同时利用重复结构和统计依赖。PAQ 路线把重点放在高精度下一比特预测。', ['传统字典方法擅长重复片段；上下文模型擅长条件统计。', 'PAQ 将多个专用预测器组合到同一概率编码框架中。'], {termIds: ['context-model']}),
      section('problem', '单一上下文很难覆盖文本、图像、可执行文件等异构数据，需要一种能按当前状态选择和融合专家的方法。'),
      section('flow', '输入按比特展开，多个上下文模型并行预测，Mixer 与 SSE 生成最终概率，随后由算术类编码器写入码流。', undefined, {figureId: 'paq-flow', termIds: ['byte-input', 'context-mixing', 'arithmetic-coding']}),
      section('preprocessing', '实现可以按文件类型执行可逆变换，但论文分析的核心是变换后的概率建模。', ['所有预处理都必须在解码端可逆执行。'], {termIds: ['byte-input']}),
      section('model', '不同专家利用不同长度、数据类型和匹配状态的上下文；Mixer 学习当前状态下的组合权重。', ['短上下文提供稳定统计。', '长上下文和匹配模型捕获更具体的重复。'], {termIds: ['context-model', 'context-mixing']}),
      section('prediction', '模型输出经过混合与二次概率校准，得到下一比特为 1 的最终概率。', undefined, {formula: 'p(y=1 | x) = SSE(σ(Σᵢ wᵢ(x) · logit(pᵢ)))', termIds: ['context-mixing', 'sse']}),
      section('entropy', '使用算术类编码器把逐比特概率转成码流；概率越准确，平均码长越接近信息量。', undefined, {termIds: ['arithmetic-coding']}),
      section('sync', '解码端用已经恢复的历史比特重建相同上下文，并以完全相同的顺序更新模型。', undefined, {termIds: ['online-update']}),
      section('datasets', '原型以 Calgary、Canterbury 与 enwik8 作为不同规模和数据类型的观察入口。', undefined, {table: [{dataset: 'Calgary', role: '小规模通用语料'}, {dataset: 'Canterbury', role: '经典混合语料'}, {dataset: 'enwik8', role: '大规模文本'}]}),
      section('metrics', '主要关注 bits per byte，同时单独记录编码/解码吞吐与峰值内存。', undefined, {termIds: ['bpb']}),
      section('results', '论文与实现结果需要绑定具体 PAQ 版本、配置和语料。本原型只展示交互结构，不把示例值当作论文结论。'),
      section('advantages', '上下文覆盖广、概率建模能力强，适合探索高压缩率上限。'),
      section('limitations', '速度慢、内存高、实现复杂，且不同配置之间难以只用一个“PAQ8”标签公平比较。'),
      section('project-value', '可作为高压缩率参考上界，并提供上下文专家、混合器、在线更新与概率校准的可拆分研究对象。'),
    ],
    paperExperiments: [
      {id: 'paq-paper-enwik8', name: '论文结果占位记录', dataset: 'enwik8', split: '100 MB', baseline: 'PPMd', blockSize: 'Whole file', metrics: {bitsPerByte: 1.75}, status: 'paper', note: '交互原型占位值，正式页需回到论文表格逐项核验。'},
      {id: 'paq-paper-calgary', name: '论文结果占位记录', dataset: 'Calgary Corpus', blockSize: 'Whole file', metrics: {bitsPerByte: 2.05}, status: 'paper', note: '交互原型占位值。'},
    ],
    reproductionExperiments: [
      {id: 'paq-repro-enwik8', name: 'PAQ8px 本地复现样例', dataset: 'enwik8', codeVersion: 'prototype-locked', parameters: '-8', blockSize: 'Whole file', hardware: 'CPU reference host', metrics: {bitsPerByte: 1.82, compressionThroughput: 0.08, decompressionThroughput: 0.11, peakMemory: 1850}, verificationPassed: true, status: 'complete', note: '仅用于验证原型对齐与图表切换。'},
    ],
  },
  {
    id: 'LIT-0186',
    title: 'NNCP v2: Lossless Data Compression with Transformer',
    authors: ['Fabrice Bellard'],
    year: 2021,
    venue: 'Technical report',
    abstract: 'NNCP v2 使用 Transformer 自回归模型预测下一字节分布，再通过算术编码生成可逆码流。该路线以更高计算和模型成本换取强上下文建模能力。',
    coverImage: '/img/literature-covers/lit-0186.png',
    pdfUrl: 'https://bellard.org/nncp/nncp_v2.pdf',
    codeUrl: 'https://bellard.org/nncp/',
    readingStatus: '待精读',
    compressorName: 'NNCP v2',
    compressorFamily: '神经网络无损压缩器',
    inputUnit: 'Byte token',
    blockSizes: ['Model context window', 'Dataset-defined stream'],
    preprocessing: ['字节 token 化'],
    modelArchitecture: ['Transformer', 'Autoregressive byte model'],
    contextModels: ['Self-attention context'],
    probabilityPrediction: ['256-way next-byte distribution'],
    entropyCoder: ['Arithmetic coding'],
    trainingOrUpdate: ['离线训练模型', '推理阶段固定参数'],
    encoderDecoderSync: ['相同模型权重', '确定性推理', '相同整数概率表'],
    datasets: ['enwik8', 'enwik9'],
    metrics: ['bitsPerByte', 'compressedSize', 'compressionThroughput', 'decompressionThroughput', 'peakMemory'],
    baselines: ['cmix', 'PAQ family', 'classical text compressors'],
    contributions: ['以 Transformer 替代传统手工上下文组合', '直接输出下一字节分布并连接算术编码', '展示长上下文神经模型在文本无损压缩中的潜力'],
    limitations: ['训练和推理计算成本高', '模型与程序成本影响公平比较', '跨硬件确定性和解码速度需要专门验证'],
    figures: [{id: 'nncp-flow', title: 'NNCP v2 自回归流程', caption: '已解码字节形成上下文，Transformer 输出下一字节概率，算术编码器同步推进。'}],
    terms: nncpTerms,
    sections: [
      section('background', '传统上下文混合依赖大量手工专家；Transformer 提供统一的长依赖建模器。', undefined, {termIds: ['transformer']}),
      section('problem', '目标是在严格可逆条件下利用更长上下文改进文本概率估计，同时保持编码与解码状态一致。'),
      section('flow', '已知字节输入 Transformer，模型输出 256 类概率分布，算术编码器据此编码当前字节。', undefined, {figureId: 'nncp-flow', termIds: ['byte-token', 'transformer', 'arithmetic-coder']}),
      section('preprocessing', '数据以字节 token 进入模型，没有依赖有损量化。', undefined, {termIds: ['byte-token']}),
      section('model', '自回归 Transformer 根据已知前缀计算下一字节条件分布。', ['注意力负责聚合历史位置。', '输出头映射到 256 个字节类别。'], {termIds: ['transformer']}),
      section('prediction', 'Softmax 分布需要转换为双方一致的编码频数。', undefined, {formula: 'p(xₜ | x<ₜ) = softmax(fθ(x<ₜ))', termIds: ['softmax']}),
      section('entropy', '算术编码器消费离散化后的概率表并产生可逆码流。', undefined, {termIds: ['quantized-probability', 'arithmetic-coder']}),
      section('sync', '编码端和解码端必须加载完全相同的模型并执行确定性推理。', undefined, {termIds: ['deterministic-inference', 'quantized-probability']}),
      section('datasets', '报告主要围绕 enwik8 / enwik9 文本压缩场景。', undefined, {table: [{dataset: 'enwik8', role: '100 MB Wikipedia text'}, {dataset: 'enwik9', role: '1 GB Wikipedia text'}]}),
      section('metrics', '除压缩大小外，公平报告还应计入模型/程序成本、推理时间和峰值内存。', undefined, {termIds: ['model-cost']}),
      section('results', '原型未录入经过逐表核验的论文结果。', undefined, {emptyReason: '待从原始报告表格抽取并绑定页码。'}),
      section('advantages', '统一建模长距离依赖，减少手工上下文专家设计。'),
      section('limitations', '计算开销高，模型成本和确定性推理会显著影响可部署性。', undefined, {termIds: ['model-cost']}),
      section('project-value', '适合与 PAQ/cmix 形成“手工上下文混合 vs 神经自回归模型”的对照实验。'),
    ],
    paperExperiments: [
      {id: 'nncp-paper-enwik9', name: '论文表格待抽取', dataset: 'enwik9', blockSize: 'Full stream', metrics: {}, status: 'paper', note: '尚未逐表核验，不显示数值。'},
    ],
    reproductionExperiments: [],
  },
];

export const defaultCompressorPaper = compressorPapers[0];
