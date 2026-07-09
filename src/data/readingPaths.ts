export interface ReadingStep {
  ref: string;
  note?: string;
  litId?: string;
  stage?: 'intro' | 'intermediate' | 'advanced';
}

export interface ReadingPath {
  id: string;
  name: string;
  nameZh: string;
  audience: string;
  goal: string;
  duration: string;
  estimatedHours?: number;
  chapters: readonly string[];
  steps: readonly ReadingStep[];
  nextExperiments: readonly string[];
  outcome: string;
  objectives: readonly string[];
  readingPathIds: readonly string[];
  experimentIds: readonly string[];
}

export const readingPaths: readonly ReadingPath[] = [
  {
    id: 'path-fundamentals',
    name: 'Foundations and Entropy Coding',
    nameZh: '信息论与熵编码基础',
    audience: '压缩算法研究、工程评估与论文写作的共同基础',
    goal: '建立从信息熵、码长约束到 Huffman、算术编码、LZ 字典方法的核心框架',
    duration: '2 周',
    estimatedHours: 24,
    chapters: ['01', '04'],
    objectives: [
      '解释熵下界、唯一可译码、前缀码与平均码长之间的关系',
      '区分 Huffman、算术编码、range coding 与 ANS 的工程定位',
      '掌握字典匹配与统计建模在现代 codec 中的分工',
    ],
    steps: [
      {ref: 'Shannon 1948', note: '信息熵与信源编码理论', stage: 'intro', litId: 'LIT-0001'},
      {ref: 'Kraft / McMillan', note: '码长约束与唯一可译性', stage: 'intro', litId: 'LIT-0003'},
      {ref: 'Huffman 1952', note: '最优前缀码构造', stage: 'intro', litId: 'LIT-0006'},
      {ref: 'Arithmetic Coding', note: '概率模型到码流的连续区间表示', stage: 'intermediate', litId: 'LIT-0007'},
      {ref: 'Ziv-Lempel 1977/1978', note: '滑动窗口与动态字典两条主线', stage: 'intro', litId: 'LIT-0009'},
      {ref: 'BWT / block sorting', note: '可逆变换与后端熵编码配合', stage: 'intermediate', litId: 'LIT-0012'},
    ],
    nextExperiments: [
      '在 Calgary / Canterbury 上对比 gzip、bzip2、zstd 的压缩率与速度',
      '实现一个 Huffman + range coder 的最小教学基线',
      '记录每个编码器的 bits per byte、编码时间与解码时间',
    ],
    outcome: '能够用正式术语解释无损压缩的理论边界与经典 codec 的基本结构。',
    readingPathIds: ['LIT-0001', 'LIT-0003', 'LIT-0006', 'LIT-0007', 'LIT-0009', 'LIT-0012'],
    experimentIds: ['exp-calgary-baseline'],
  },
  {
    id: 'path-paq-cmix',
    name: 'Context Mixing and High-Ratio Compression',
    nameZh: '上下文混合与高压缩率路线',
    audience: '关注 PAQ、CMIX、文本榜单和高压缩率研究的开发者',
    goal: '理解从 PPM、CTW 到 PAQ/CMIX 的概率建模、模型混合与高压缩率代价',
    duration: '4 周',
    estimatedHours: 50,
    chapters: ['01', '05'],
    objectives: [
      '掌握 PPM、CTW、context mixing 的建模动机',
      '拆解 PAQ/PAQ8PX 中上下文模型、SSE、mixer 与后端编码器的职责',
      '用速度、内存、压缩率三维评价高压缩率算法',
    ],
    steps: [
      {ref: 'PPM (Cleary-Witten 1984)', note: '多阶上下文与 escape 概率', stage: 'intermediate', litId: 'LIT-0016'},
      {ref: 'CTW (Willems 1995)', note: '上下文树加权的理论化表达', stage: 'advanced', litId: 'LIT-0017'},
      {ref: 'Mahoney PAQ report', note: '在线模型加权与神经式 mixer', stage: 'advanced', litId: 'LIT-0018'},
      {ref: 'PAQ8 / PAQ8PX', note: '面向文件类型的上下文专家与工程优化', stage: 'advanced'},
      {ref: 'CMIX', note: '更大模型集合与极限压缩率路线', stage: 'advanced'},
      {ref: 'Mahoney benchmarks', note: 'enwik、Silesia 与程序体积约束', stage: 'intermediate'},
    ],
    nextExperiments: [
      '在 Silesia 上跑 zstd、bzip2、paq8px、cmix 可获得版本',
      '记录压缩率、编码时间、解码时间、峰值内存与程序体积',
      '将 PAQ/CMIX 模块映射到 Algorithm Catalog 的结构字段',
    ],
    outcome: '能够把 PAQ/CMIX 看成概率建模系统，而不是孤立的压缩器名称。',
    readingPathIds: ['LIT-0016', 'LIT-0017', 'LIT-0018', 'LIT-0090'],
    experimentIds: ['exp-silesia-paq'],
  },
  {
    id: 'path-neural',
    name: 'Learned Lossless Compression',
    nameZh: '学习式无损压缩路线',
    audience: '深度学习、语言模型、学习式图像/文本压缩方向',
    goal: '理解神经概率模型如何与算术编码结合，以及当前方法的压缩率、吞吐和成本边界',
    duration: '3 周',
    estimatedHours: 36,
    chapters: ['01', '06'],
    objectives: [
      '解释神经模型输出概率分布后如何接入 entropy coder',
      '区分 RNN、Transformer、flow、bits-back、latent variable 等路线',
      '在同一 benchmark 上比较 learned codec 与经典 codec 的代价',
    ],
    steps: [
      {ref: 'DeepZip', note: 'RNN 概率模型与算术编码组合', stage: 'intermediate', litId: 'LIT-0187'},
      {ref: 'NNCP', note: '可复现神经压缩器集合', stage: 'intermediate', litId: 'LIT-0190'},
      {ref: 'TRACE', note: 'Transformer 通用无损压缩', stage: 'advanced', litId: 'LIT-0214'},
      {ref: 'Language Modeling Is Compression', note: '语言建模与压缩目标的联系', stage: 'advanced'},
      {ref: 'Integer Discrete Flows', note: '可逆流模型与无损压缩', stage: 'advanced', litId: 'LIT-0335'},
      {ref: 'Learned Compression 2024+', note: '深度学习压缩器论文、代码与 benchmark 证据', stage: 'advanced'},
    ],
    nextExperiments: [
      '在 enwik8 或小规模文本集上复现实验命令',
      '记录 BPB、吞吐、模型大小、显存/内存与训练成本',
      '对照 PAQ8PX、zstd、cmix 的工程可用性',
    ],
    outcome: '能够判断学习式压缩改进来自模型、上下文窗口、训练数据还是编码器接口。',
    readingPathIds: ['LIT-0187', 'LIT-0190', 'LIT-0214', 'LIT-0335'],
    experimentIds: ['exp-enwik8-neural'],
  },
  {
    id: 'path-domain',
    name: 'Domain Standards and Scientific Data Compression',
    nameZh: '领域标准与科学数据压缩',
    audience: '医学影像、遥感、天文、科学数组、时序与结构化数据方向',
    goal: '建立通用 codec、领域标准、近无损误差控制和 benchmark 之间的选择依据',
    duration: '3 周',
    estimatedHours: 36,
    chapters: ['07', '08'],
    objectives: [
      '区分严格无损、近无损、有损与下游任务可接受误差',
      '掌握 JPEG-LS、JPEG 2000、DICOM、FITS、CCSDS、ZFP/fpzip 等标准位置',
      '为领域数据选择可解释、可复现、可验收的 baseline',
    ],
    steps: [
      {ref: 'JPEG-LS / LOCO-I', note: '图像无损与近无损预测编码', stage: 'intro'},
      {ref: 'DICOM Part 5', note: '医学影像传输与归档中的压缩语义', stage: 'intermediate', litId: 'LIT-0090'},
      {ref: 'FITS / Rice / HCOMPRESS', note: '天文数据格式与压缩约束', stage: 'intermediate', litId: 'LIT-0089'},
      {ref: 'CCSDS 121/122/123', note: '航天链路与多光谱/高光谱数据压缩', stage: 'advanced', litId: 'LIT-0078'},
      {ref: 'ZFP / fpzip', note: '浮点数组压缩与误差约束', stage: 'advanced', litId: 'LIT-0312'},
      {ref: 'SDRBench / FCBench', note: '科学数据与高性能压缩 benchmark', stage: 'advanced'},
    ],
    nextExperiments: [
      '用同一批领域样本对比 zstd、lz4、JPEG-LS、ZFP/fpzip',
      '报告压缩率、误差界、吞吐、随机访问与标准兼容性',
      '将适用标准沉淀到 Standards 页面与项目验收包',
    ],
    outcome: '能够为具体数据形态给出标准、codec 与 benchmark 的选择理由。',
    readingPathIds: ['LIT-0032', 'LIT-0078', 'LIT-0089', 'LIT-0090', 'LIT-0312'],
    experimentIds: ['exp-domain-compare'],
  },
  {
    id: 'path-reproduction',
    name: 'Reproducible Benchmarking and Paper Evidence',
    nameZh: '可复现实验与论文证据路线',
    audience: '准备写论文、复现实验、做项目验收或技术评审的成员',
    goal: '把文献结论转化为可复跑 benchmark、可导出引用和可审计报告',
    duration: '持续',
    estimatedHours: 40,
    chapters: ['02', '04', '05', '09', '10'],
    objectives: [
      '从论文中抽取算法假设、数据集、baseline、指标与消融变量',
      '按硬件、版本、参数、随机性和数据预处理记录实验条件',
      '输出可复查的引用、表格、图、日志与结论边界',
    ],
    steps: [
      {ref: 'Paper screening', note: '区分论文、预印本、软件、标准与 benchmark 资源', stage: 'intro'},
      {ref: 'Baseline protocol', note: '选定强 baseline、版本和参数', stage: 'intermediate'},
      {ref: 'Dataset manifest', note: '记录数据来源、规模、license 与预处理', stage: 'intermediate'},
      {ref: 'Metric table', note: '压缩率、BPB、吞吐、内存、程序体积与误差', stage: 'advanced'},
      {ref: 'Artifact appendix', note: '命令、环境、日志、失败案例与复现说明', stage: 'advanced', litId: 'LIT-0304'},
      {ref: 'Citation export', note: '从 Library 导出 BibTeX/RIS/CSL 并去重', stage: 'advanced'},
    ],
    nextExperiments: [
      '从 Library 选择 10 篇论文导出 BibTeX 并检查重复',
      '在 Experiments 中建立一组基线命令和 CSV 结果表',
      '把实验摘要写入 Notes 并链接到 Project Overview',
    ],
    outcome: '能够把论文阅读、引用、实验与报告组织成可验收的研究证据链。',
    readingPathIds: ['LIT-0018', 'LIT-0090', 'LIT-0187', 'LIT-0214', 'LIT-0304'],
    experimentIds: ['exp-calgary-baseline'],
  },
];

export default readingPaths;
