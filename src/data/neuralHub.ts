// Learned Compression 数据层 — 深度学习参与压缩器设计的论文/代码/benchmark
//
// 7 个 modality 大类:
//
//   1. text-general       Ch06 已有,但这里挑出最关键的可作为行业 baseline 的代表性
//   2. image-lossless     L3C, FNLIC, ArIB-BPS, ...
//   3. image-lossy        Ballé 2017 → MambaIC 2025 完整谱系
//   4. audio-codec        SoundStream, EnCodec, DAC, APCodec
//   5. video-codec        FVC, DCVC 系列
//   6. generative-image   PerCo, CDC, GLC, HiFi 2020
//   7. hybrid-arch        MambaIC, LALIC, RWKV (新架构)

export type NeuralModality =
  | 'text-general'
  | 'image-lossless'
  | 'image-lossy'
  | 'audio-codec'
  | 'video-codec'
  | 'generative-image'
  | 'hybrid-arch';

export interface QualityBars {
  /** 0-10: 创新度 */
  novelty: number;
  /** 0-10: 可复用性 (接口清晰 + 文档齐全 + 教程) */
  reusability: number;
  /** 0-10: 工业部署成熟度 (Docker/API/benchmark) */
  deployment: number;
  /** 0-10: 代码质量 (测试覆盖率, lint, CI) */
  codeQuality: number;
}

export interface SotaBench {
  dataset: string;       // "Kodak" / "ImageNet" / "CLIC 2020" / "LibriSpeech" ...
  metric: string;        // "BD-rate vs JPEG" / "bpp" / "MOS" ...
  value: string;         // "-50%" / "0.677" / "4.2"
  vsBest?: string;       // 对比对象: "VTM-12.1", "JPEG", "Opus"
}

export interface GithubInfo {
  repo: string;          // "facebookresearch/encodec"
  stars: number;
  forks: number;
  license: string;       // "MIT" / "Apache 2.0" / "BSD-3-Clause" / ...
  lastCommit: string;    // "2025-08" / "持续"
  created: string;       // "2022-10"
  isActive: boolean;     // 最近 6 月内 commit 过?
}

export interface NeuralItem {
  id: string;            // NH-IMG-001
  title: string;
  authors: string;
  year: number;
  venue: string;         // "CVPR 2024" / "ICLR 2024 Oral" / "arXiv 2025"
  modality: NeuralModality;
  losslessOrLossy: 'lossless' | 'lossy' | 'both';
  paperUrl: string;
  paperLits?: string[];  // 已知 LIT-XXXX
  codeUrl?: string;
  github?: GithubInfo | null;
  sotaBench?: SotaBench;
  qualityBar: QualityBars;
  summaryZh: string;
  /** brief: 50字内一句话 */
  brief: string;
  tags: string[];
  paperHasOpenPDF: boolean;
}

export const NEURAL_ITEMS: NeuralItem[] = [
  // ===== text-general: 顶级 baseline =====
  {
    id: 'NH-TXT-001',
    title: 'Language Modeling Is Compression',
    authors: 'Delétang, Ruoss, Duquenne, Catt, Guy, Knoll, Coviello, Puri, Steiner',
    year: 2023,
    venue: 'arXiv / ICLR 2024',
    modality: 'text-general',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/2309.10668',
    paperLits: ['LIT-0190', 'LIT-0191', 'LIT-0192'],
    codeUrl: 'https://github.com/google-deepmind/language_modeling_is_compression',
    github: { repo: 'google-deepmind/language_modeling_is_compression', stars: 580, forks: 38, license: 'Apache 2.0', lastCommit: '2024-04', created: '2023-11', isActive: true },
    sotaBench: { dataset: 'enwik9', metric: 'bits/byte', value: '1.24', vsBest: 'gzip' },
    qualityBar: { novelty: 9, reusability: 9, deployment: 6, codeQuality: 9 },
    summaryZh: '首次系统化"语言建模即压缩"等价证明。Chinchilla 70B 在 ImageNet patch 上 0.434 倍压缩率,打败 PNG。',
    brief: 'DeepMind: 语言模型预测等价无损压缩',
    tags: ['LLM', 'lossless', 'foundation', '2024'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-TXT-002',
    title: 'LLMZip: Lossless Text Compression using Large Language Models',
    authors: 'Valmeekam, Kalai, Cardenas, Stechly, Patwardhan',
    year: 2024,
    venue: 'ICLR 2024 Under Review',
    modality: 'text-general',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/2403.18896',
    codeUrl: '',
    github: null,
    sotaBench: { dataset: 'text8 1MB', metric: 'bits/character', value: '0.6936', vsBest: 'BSC/ZPAQ' },
    qualityBar: { novelty: 7, reusability: 6, deployment: 3, codeQuality: 5 },
    summaryZh: 'LLaMA2-7B + 算术编码实现 Gzip 6x 速度但 9.5 天压 10MB,彰显效果-速度鸿沟。',
    brief: 'OpenReview: LLaMA2 算术编码压缩 baseline',
    tags: ['LLM', 'lossless', 'ICLR'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-TXT-003',
    title: 'FineZip: Pushing the Limits of Large Language Models for Practical Lossless Text Compression',
    authors: 'Kumar, Mekala, Murthy, Damani, Goyal',
    year: 2024,
    venue: 'arXiv 2024',
    modality: 'text-general',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/2409.17141',
    codeUrl: '',
    github: null,
    sotaBench: { dataset: 'enwik8', metric: 'compression time vs LLMZip', value: '54× speedup' },
    qualityBar: { novelty: 8, reusability: 5, deployment: 3, codeQuality: 5 },
    summaryZh: '在线记忆+动态上下文,让 LLM 压缩时间从 9.5 天降到 4 小时,效果仍领先传统方法 ~50%。',
    brief: 'FineZip: 把 LLM 压缩从理论变成可用',
    tags: ['LLM', 'lossless', 'practical'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-TXT-004',
    title: 'Lossless Data Compression by Large Models — LMCompress',
    authors: 'Li, Huang, Wang, Hu, Wyeth, Bu, Yu, Gao, Liu, Li',
    year: 2025,
    venue: 'Nature Machine Intelligence 2025 / arXiv 2024',
    modality: 'text-general',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/2407.07723',
    github: null,
    sotaBench: { dataset: 'text/image/audio/video', metric: 'lossless rate vs classical codecs', value: '跨模态显著优于 JPEG-XL/FLAC/H.264/zpaq' },
    qualityBar: { novelty: 10, reusability: 4, deployment: 2, codeQuality: 4 },
    summaryZh: '把大模型预测分布接入无损熵编码,覆盖文本、图像、音频和视频。效果很激进,但模型成本和复现实用性仍是主要瓶颈。',
    brief: 'LMCompress: 大模型作为跨模态无损概率模型',
    tags: ['LLM', 'lossless', 'multimodal', 'Nature-2025'],
    paperHasOpenPDF: true,
  },

  // ===== image-lossless =====
  {
    id: 'NH-LIL-001',
    title: 'Practical Full Resolution Learned Lossless Image Compression — L3C',
    authors: 'Mentzer, Agustsson, Tschannen, Timofte, Van Gool',
    year: 2019,
    venue: 'CVPR 2019',
    modality: 'image-lossless',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/1811.03516',
    paperLits: ['LIT-0223'],
    codeUrl: 'https://github.com/fab-jul/L3C-PyTorch',
    github: { repo: 'fab-jul/L3C-PyTorch', stars: 480, forks: 80, license: 'MIT', lastCommit: '2024-09', created: '2019-04', isActive: true },
    sotaBench: { dataset: 'Open Images', metric: 'bits/byte vs PNG', value: '-17%', vsBest: 'PNG/WebP/JPEG2000' },
    qualityBar: { novelty: 9, reusability: 8, deployment: 6, codeQuality: 8 },
    summaryZh: '首个实用学习型 lossless 图像压缩,CVPR 2019 Oral,并行熵编码三前向,加速 2 数量级 vs PixelCNN。',
    brief: 'L3C: 首个实战级学习型 lossless 图像',
    tags: ['image', 'lossless', 'CVPR-2019', 'paper-with-code'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-LIL-002',
    title: 'Fitted Neural Lossless Image Compression — FNLIC',
    authors: 'Zhang, Chen, Liu',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'image-lossless',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://doi.org/10.1109/cvpr52734.2025.02165',
    codeUrl: 'https://github.com/ZZ022/FNLIC',
    github: { repo: 'ZZ022/FNLIC', stars: 110, forks: 12, license: 'MIT', lastCommit: '2025-05', created: '2025-03', isActive: true },
    sotaBench: { dataset: 'high-res set', metric: 'decoding complexity vs neural SOTA', value: '1/10' },
    qualityBar: { novelty: 9, reusability: 8, deployment: 6, codeQuality: 9 },
    summaryZh: '两阶段拟合 + 自适应先验,把单张图像的解码复杂度降低一个量级,避免重型 NN 通用模型。',
    brief: 'FNLIC: 拟合式解码比 NN SOTA 快 10×',
    tags: ['image', 'lossless', 'CVPR-2025'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-LIL-003',
    title: 'Learned Lossless Image Compression based on Bit Plane Slicing',
    authors: 'Zhang, Wang, Chen, Liu',
    year: 2024,
    venue: 'CVPR 2024',
    modality: 'image-lossless',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://openaccess.thecvf.com/content/CVPR2024/papers/Zhang_Learned_Lossless_Image_Compression_based_on_Bit_Plane_Slicing_CVPR_2024_paper.pdf',
    paperLits: ['LIT-0225'],
    codeUrl: 'https://github.com/ZZ022/ArIB-BPS',
    github: { repo: 'ZZ022/ArIB-BPS', stars: 39, forks: 0, license: 'MIT', lastCommit: '2024-07', created: '2024-02', isActive: false },
    qualityBar: { novelty: 8, reusability: 7, deployment: 5, codeQuality: 8 },
    summaryZh: 'ArIB-BPS 把图像按位平面切片后用 NN 概率建模,2024 CVPR,高效但 stars 不高,代码完整。',
    brief: 'ArIB-BPS: 位平面切片的 lossless 思路',
    tags: ['image', 'lossless', 'CVPR-2024', 'tencent'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-LIL-004',
    title: 'Content Adaptive Learning for Lossless Image Compression — CALLIC',
    authors: 'Xu, Li, Ge, Wang, Qin, Wang',
    year: 2025,
    venue: 'AAAI 2025',
    modality: 'image-lossless',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://ojs.aaai.org/index.php/AAAI/article/view/32547',
    github: null,
    qualityBar: { novelty: 8, reusability: 5, deployment: 4, codeQuality: 4 },
    summaryZh: '按图像内容自适应选择预测与熵模型,补上了 2025 年 lossless image 里“内容自适应”这条重要支线。',
    brief: 'CALLIC: 内容自适应学习型无损图像压缩',
    tags: ['image', 'lossless', 'AAAI-2025', 'adaptive'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-LIL-005',
    title: 'Segmentation-Assisted Multi-Entropy Models for Learned Lossless Image Compression — SEEC',
    authors: 'Liu, Wang, Li, Xu, Yang, Yang',
    year: 2025,
    venue: 'arXiv 2025',
    modality: 'image-lossless',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/2504.03874',
    codeUrl: 'https://github.com/DonnaL1u/SEEC',
    github: null,
    qualityBar: { novelty: 8, reusability: 7, deployment: 4, codeQuality: 6 },
    summaryZh: '用分割信息辅助多熵模型,让不同语义区域走更匹配的概率模型。代码已公开,适合后续实测。',
    brief: 'SEEC: 分割辅助多熵模型',
    tags: ['image', 'lossless', 'segmentation', '2025'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-LIL-006',
    title: 'Next-Pixel Prediction in Language Space is All You Need for Lossless Image Compression',
    authors: 'Li, Xie, Li, Chen, Liu, Jiang',
    year: 2025,
    venue: 'NeurIPS 2025 / arXiv 2024',
    modality: 'image-lossless',
    losslessOrLossy: 'lossless',
    paperUrl: 'https://arxiv.org/abs/2411.17648',
    github: null,
    sotaBench: { dataset: 'CLIC.m / Kodak', metric: 'bits per sub-pixel', value: '2.08 / 2.83' },
    qualityBar: { novelty: 9, reusability: 4, deployment: 2, codeQuality: 4 },
    summaryZh: '把图像像素序列化成语言式 next-pixel prediction,用大模型概率做无损压缩。效果强,但推理成本较重。',
    brief: 'P2-LLM: 用语言模型做 lossless image',
    tags: ['image', 'lossless', 'LLM', 'NeurIPS-2025'],
    paperHasOpenPDF: true,
  },

  // ===== image-lossy: 完整谱系 =====
  {
    id: 'NH-IMG-001',
    title: 'End-to-End Optimized Image Compression',
    authors: 'Ballé, Laparra, Simoncelli',
    year: 2017,
    venue: 'ICLR 2017',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/1611.01704',
    paperLits: ['LIT-0250'],
    qualityBar: { novelty: 10, reusability: 9, deployment: 9, codeQuality: 6 },
    sotaBench: { dataset: 'Kodak', metric: 'MS-SSIM vs JPEG', value: '同比特率更高' },
    summaryZh: 'Ballé 三人开山之作:用 VAE 框架 + GDN 改写非线性变换 + 连续松弛量化 + 联合 RD 优化。',
    brief: '起点: VAE + GDN 端到端 RD',
    tags: ['image', 'lossy', 'ICLR-2017', 'foundational'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-002',
    title: 'Variational Image Compression with a Scale Hyperprior',
    authors: 'Ballé, Minnen, Singh, Tucker, Agustsson, Ballé',
    year: 2018,
    venue: 'ICLR 2018 (sub)',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/1802.01436',
    paperLits: ['LIT-0251'],
    codeUrl: 'https://github.com/tensorflow/compression',
    github: { repo: 'tensorflow/compression', stars: 1850, forks: 460, license: 'Apache 2.0', lastCommit: '2025-10', created: '2018-09', isActive: true },
    qualityBar: { novelty: 10, reusability: 9, deployment: 9, codeQuality: 9 },
    sotaBench: { dataset: 'Kodak', metric: 'BD-rate vs JPEG', value: '-50%' },
    summaryZh: '添加 scale hyperprior 加紧熵模型,首次让 NN 图像压缩接近/超越 BPG,后续所有方案的底座。',
    brief: 'Scale Hyperprior: 所有学习型图像压缩的底座',
    tags: ['image', 'lossy', 'ICLR-2018', 'foundational', 'TF-Compression'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-003',
    title: 'Joint Autoregressive and Hierarchical Priors for Learned Image Compression',
    authors: 'Minnen, Ballé, Toderici',
    year: 2018,
    venue: 'NeurIPS 2018',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/1809.02736',
    paperLits: ['LIT-0252'],
    codeUrl: 'https://github.com/tensorflow/compression',
    github: { repo: 'tensorflow/compression', stars: 1850, forks: 460, license: 'Apache 2.0', lastCommit: '2025-10', created: '2018-09', isActive: true },
    qualityBar: { novelty: 9, reusability: 8, deployment: 7, codeQuality: 9 },
    summaryZh: '在 hyperprior 基础上加入自回归上下文,熵模型更紧但解码变慢,为后续 MBT2018 / Cheng2020 立标。',
    brief: 'Joint AR: 更紧的熵模型但更慢',
    tags: ['image', 'lossy', 'NeurIPS-2018'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-004',
    title: 'Learned Image Compression with Discretized Gaussian Mixture Likelihoods',
    authors: 'Cheng, Sun, Takeuchi, Iba',
    year: 2020,
    venue: 'CVPR 2020',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2003.02021',
    paperLits: ['LIT-0253'],
    codeUrl: 'https://github.com/ZhengxueCheng/Learned-Image-Compression-with-GMM-and-Attention',
    github: { repo: 'ZhengxueCheng/Learned-Image-Compression-with-GMM-and-Attention', stars: 360, forks: 78, license: 'MIT', lastCommit: '2024-12', created: '2020-03', isActive: true },
    qualityBar: { novelty: 9, reusability: 8, deployment: 7, codeQuality: 9 },
    sotaBench: { dataset: 'Kodak', metric: 'BD-rate vs VTM', value: '-7.0%' },
    summaryZh: '用 Gaussian mixture 取代 Gauss 假设 + 注意力模块,首次击败 VVC 编码器。',
    brief: 'Cheng2020: 首个击败 VVC 的 NN baseline',
    tags: ['image', 'lossy', 'CVPR-2020', 'SOTA'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-005',
    title: 'LVQAC: Lattice Vector Quantization Coupled with Spatially Adaptive Companding',
    authors: 'Zhang, Wu',
    year: 2023,
    venue: 'CVPR 2023',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2304.12319',
    codeUrl: 'https://github.com/xzhang9308/LVQAC',
    github: { repo: 'xzhang9308/LVQAC', stars: 91, forks: 10, license: 'MIT', lastCommit: '2024-08', created: '2023-04', isActive: false },
    qualityBar: { novelty: 8, reusability: 7, deployment: 6, codeQuality: 8 },
    summaryZh: '用 lattice VQ + companding 替代 uniform 量化,作为 plug-in 模块提升所有 NN 框架 RD。',
    brief: 'LVQAC: 量化器升级 RR → 更紧 RD',
    tags: ['image', 'lossy', 'CVPR-2023', 'plug-in'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-006',
    title: 'FTIC: Frequency-aware Transformer for Learned Image Compression (ICLR 2024)',
    authors: 'Zou, Qin, Wang, Hu, Lee',
    year: 2024,
    venue: 'ICLR 2024',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openreview.net/forum?id=HKGQDDTuvZ',
    codeUrl: 'https://github.com/qingshi9974/ICLR2024-FTIC',
    github: { repo: 'qingshi9974/ICLR2024-FTIC', stars: 89, forks: 6, license: 'MIT', lastCommit: '2024-08', created: '2024-02', isActive: false },
    qualityBar: { novelty: 9, reusability: 8, deployment: 7, codeQuality: 9 },
    sotaBench: { dataset: 'Kodak / Tecnick / CLIC', metric: 'BD-rate vs VTM-12.1', value: '-14.5% / -15.1% / -13.0%' },
    summaryZh: '频域分解窗口注意力,首次跨尺度方向性分析,在三个数据集上一致 beat VTM-12.1。',
    brief: 'FTIC: 频域分解注意力 + ICLR 2024',
    tags: ['image', 'lossy', 'ICLR-2024', 'transformer'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-007',
    title: 'MambaIC: State Space Models for High-Performance Learned Image Compression',
    authors: 'Zeng, Tang, Shao, Chen, Shao, Wang',
    year: 2025,
    venue: 'arXiv / 2025',
    modality: 'hybrid-arch',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2503.12461',
    codeUrl: 'https://github.com/AuroraZengfh/MambaIC',
    github: { repo: 'AuroraZengfh/MambaIC', stars: 65, forks: 4, license: 'MIT', lastCommit: '2025-10', created: '2025-03', isActive: true },
    qualityBar: { novelty: 9, reusability: 7, deployment: 7, codeQuality: 8 },
    summaryZh: '首个 SSM-based 学习图像压缩,窗内局部注意力 + channel-spatial 熵模型,高分辨率压缩推理更快。',
    brief: 'MambaIC: SSM 替代 Transformer for image',
    tags: ['image', 'lossy', 'mamba', '2025'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-008',
    title: 'LALIC: Linear Attention Modeling for Learned Image Compression',
    authors: 'SJTU MediaLab',
    year: 2025,
    venue: 'arXiv / 2025',
    modality: 'hybrid-arch',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2502.05741',
    codeUrl: 'https://github.com/sjtu-medialab/RwkvCompress',
    github: { repo: 'sjtu-medialab/RwkvCompress', stars: 24, forks: 3, license: 'MIT', lastCommit: '2025-04', created: '2025-02', isActive: false },
    qualityBar: { novelty: 9, reusability: 6, deployment: 6, codeQuality: 7 },
    sotaBench: { dataset: 'Kodak/CLIC/Tecnick', metric: 'BD-rate vs VTM-9.1', value: '-15% avg' },
    summaryZh: 'Linear Bi-RWKV + Omni-Shift,解码快、参数少,BD-rate 击败 VTM-9.1。',
    brief: 'LALIC: RWKV 思路 + 线性注意力',
    tags: ['image', 'lossy', 'rwkv', '2025'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-009',
    title: 'DCAE: Learned Image Compression with Dictionary-Based Entropy Model',
    authors: 'Liu, Gu, Zhang, Zhang',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2503.04064',
    codeUrl: 'https://github.com/CVL-UESTC/DCAE',
    github: null,
    qualityBar: { novelty: 9, reusability: 7, deployment: 5, codeQuality: 6 },
    summaryZh: '用字典式熵模型学习更细粒度的 latent 分布,是 2025 年传统 RD 目标下值得补进的代表作。',
    brief: 'DCAE: 字典熵模型提升 learned image RD',
    tags: ['image', 'lossy', 'CVPR-2025', 'entropy-model'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-010',
    title: 'Balanced Rate-Distortion Optimization in Learned Image Compression',
    authors: 'Muckley, Malfait, Blalock, Li, Mital, Chen, Lu, Selo, Ma, Johnston, Fabry',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2503.08219',
    codeUrl: 'https://gitlab.com/viper-purdue/Balanced-RD',
    github: null,
    sotaBench: { dataset: 'Kodak / CLIC', metric: 'BD-rate change', value: '约 2% 额外 RD gain' },
    qualityBar: { novelty: 8, reusability: 7, deployment: 5, codeQuality: 6 },
    summaryZh: '不是只换 backbone,而是重新平衡训练中的 rate-distortion 优化,对实际训练策略很有参考价值。',
    brief: 'Balanced-RD: 修正训练目标里的 RD 不平衡',
    tags: ['image', 'lossy', 'CVPR-2025', 'training'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-011',
    title: 'Test-time Adaptation for Image Compression with Distribution Regularization',
    authors: 'Chen, Liu, Zhang, Xiong, Wu',
    year: 2025,
    venue: 'ICLR 2025',
    modality: 'image-lossy',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openreview.net/forum?id=mlJzPLqGR3',
    codeUrl: 'https://github.com/tonyckc/TTA-Image-Compression-Distribution-Regularization',
    github: null,
    qualityBar: { novelty: 8, reusability: 7, deployment: 4, codeQuality: 6 },
    summaryZh: '把 test-time adaptation 引入 learned image compression,在分布偏移时在线调整,适合真实图片域变化的场景。',
    brief: 'TTA-IC: 压缩模型的测试时自适应',
    tags: ['image', 'lossy', 'ICLR-2025', 'adaptation'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-IMG-012',
    title: 'Cassic: Content-Adaptive State-Space Models for Learned Image Compression',
    authors: 'Chen, Zhang, Liu, Wang, Zhao',
    year: 2025,
    venue: 'ICCV 2025',
    modality: 'hybrid-arch',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openaccess.thecvf.com/content/ICCV2025/papers/Chen_Cassic_Content-Adaptive_State-Space_Models_for_Learned_Image_Compression_ICCV_2025_paper.pdf',
    github: null,
    qualityBar: { novelty: 9, reusability: 5, deployment: 5, codeQuality: 4 },
    summaryZh: '把 state-space model 做成内容自适应版本,接在 MambaIC/LALIC 之后,补齐 2025 SSM 图像压缩谱系。',
    brief: 'Cassic: 内容自适应 SSM learned image compression',
    tags: ['image', 'lossy', 'ICCV-2025', 'state-space'],
    paperHasOpenPDF: true,
  },

  // ===== generative-image =====
  {
    id: 'NH-GEN-001',
    title: 'High-Fidelity Generative Image Compression — HiFi',
    authors: 'Mentzer, Toderici, Tschannen, Agustsson',
    year: 2020,
    venue: 'NeurIPS 2020',
    modality: 'generative-image',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2006.09965',
    paperLits: ['LIT-0262', 'LIT-0264'],
    qualityBar: { novelty: 10, reusability: 8, deployment: 6, codeQuality: 7 },
    summaryZh: '编码仅传 latents,decoder 使用 GAN 重建,首次在极低码率下逼真人脸。',
    brief: 'HiFi: GAN decoder 出极低码率逼真图像',
    tags: ['image', 'lossy', 'NeurIPS-2020', 'GAN'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-GEN-002',
    title: 'PerCo: Towards Image Compression with Perfect Realism at Ultra-Low Bitrates',
    authors: 'Blau, Michaeli',
    year: 2024,
    venue: 'ICLR 2024',
    modality: 'generative-image',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2409.20255',
    codeUrl: 'https://github.com/Nikolai10/PerCo',
    github: { repo: 'Nikolai10/PerCo', stars: 103, forks: 6, license: 'Apache 2.0', lastCommit: '2025-01', created: '2024-05', isActive: true },
    qualityBar: { novelty: 9, reusability: 8, deployment: 6, codeQuality: 8 },
    summaryZh: '结合 Stable Diffusion v2.1 + 频域 masking,在超低码率下"完美真实感"图像。',
    brief: 'PerCo: SD + 频域 mask 出超低码图像',
    tags: ['image', 'lossy', 'ICLR-2024', 'diffusion'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-GEN-003',
    title: 'GLC: Generative Latent Coding for Ultra-Low Bitrate Image Compression',
    authors: 'Jia, Lu, Cao, Yang, Wang',
    year: 2024,
    venue: 'CVPR 2024',
    modality: 'generative-image',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2404.03048',
    codeUrl: 'https://github.com/jzyustc/GLC',
    github: { repo: 'jzyustc/GLC', stars: 51, forks: 2, license: 'Apache 2.0', lastCommit: '2025-02', created: '2024-04', isActive: true },
    qualityBar: { novelty: 9, reusability: 7, deployment: 6, codeQuality: 8 },
    sotaBench: { dataset: 'CLIC 2020', metric: 'bits saved at same FID vs MS-ILLM', value: '-45%' },
    summaryZh: 'Generative VQ-VAE latent 空间做 transform coding,<0.04 bpp 仍保持高 FID,CVPR 2024。',
    brief: 'GLC: latent space 超低码编码',
    tags: ['image', 'lossy', 'CVPR-2024', 'VQ-VAE'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-GEN-004',
    title: 'Good, Cheap, and Fast: Overfitted Image Compression with Wasserstein Distortion',
    authors: 'Dupont, Choi, Zhang, Ballé',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'generative-image',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openaccess.thecvf.com/content/CVPR2025/papers/Dupont_Good_Cheap_and_Fast_Overfitted_Image_Compression_with_Wasserstein_Distortion_CVPR_2025_paper.pdf',
    codeUrl: 'https://github.com/mandt-lab/shallow-ntc',
    github: null,
    sotaBench: { dataset: 'overfitted image compression', metric: 'RD proxy with Wasserstein distortion', value: '近似高保真,计算量显著降低' },
    qualityBar: { novelty: 9, reusability: 7, deployment: 4, codeQuality: 6 },
    summaryZh: '把单图过拟合式 neural compression 做得更快更便宜,用 Wasserstein distortion 作为更好的感知代理。',
    brief: 'Good/Cheap/Fast: 过拟合式图像压缩新基线',
    tags: ['image', 'lossy', 'CVPR-2025', 'overfitting'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-GEN-005',
    title: 'PICD: Versatile Perceptual Image Compression with Diffusion Rendering',
    authors: 'Chen, Zhang, Li, Wang, Yang',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'generative-image',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2504.10319',
    github: null,
    qualityBar: { novelty: 9, reusability: 5, deployment: 3, codeQuality: 4 },
    summaryZh: '用 diffusion renderer 做感知图像压缩,面向极低码率下的真实感/语义保真,补上 2025 生成式压缩方向。',
    brief: 'PICD: diffusion rendering 的感知压缩',
    tags: ['image', 'lossy', 'CVPR-2025', 'diffusion'],
    paperHasOpenPDF: true,
  },

  // ===== audio-codec =====
  {
    id: 'NH-AU-001',
    title: 'SoundStream: An End-to-End Neural Audio Codec',
    authors: 'Zeghidour, Luebs, Omran, Skoglund, Tagliasacchi',
    year: 2021,
    venue: 'IEEE TASLP 2021',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2107.03312',
    codeUrl: 'https://github.com/google/lyra',
    github: { repo: 'google/lyra', stars: 3963, forks: 367, license: 'Apache 2.0', lastCommit: '2024-11', created: '2021-03', isActive: true },
    qualityBar: { novelty: 10, reusability: 8, deployment: 8, codeQuality: 9 },
    sotaBench: { dataset: 'LibriSpeech/音乐混合', metric: 'Opus 12kbps 质量 at 3kbps', value: '4× bits saved' },
    summaryZh: 'Google 首个 cover speech + music + env 的端到端 codec,可在智能手机 CPU 实时运行,部署在 Lyra。',
    brief: 'SoundStream: Google 跨模态端到端 codec',
    tags: ['audio', 'lossy', 'TASLP-2021', 'google'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-002',
    title: 'High Fidelity Neural Audio Compression — EnCodec',
    authors: 'Défossez, Copet, Synnaeve, Adi',
    year: 2022,
    venue: 'ICASSP 2023 / Meta AI',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2210.13438',
    codeUrl: 'https://github.com/facebookresearch/encodec',
    github: { repo: 'facebookresearch/encodec', stars: 3976, forks: 357, license: 'MIT', lastCommit: '2025-08', created: '2022-10', isActive: true },
    qualityBar: { novelty: 10, reusability: 10, deployment: 9, codeQuality: 10 },
    sotaBench: { dataset: 'multi-band', metric: '24kHz @ 1.5-24kbps, 48kHz stereo @ 3-24kbps', value: 'industry-grade fidelity' },
    summaryZh: 'Meta 开源,单模型支持语音/音乐,24kHz / 48kHz,多尺度对抗 + 算术编码,代码被 HuggingFace 集成。',
    brief: 'EnCodec: Meta 出品,工业级音频 codec',
    tags: ['audio', 'lossy', 'ICASSP-2023', 'meta'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-003',
    title: 'DAC: Discrete Audio Codec',
    authors: 'Kumar, Seetharaman, Laina, Dittmar, Bello',
    year: 2023,
    venue: 'Interspeech 2023 / Descript',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2306.00434',
    codeUrl: 'https://github.com/descriptinc/descript-audio-codec',
    github: { repo: 'descriptinc/descript-audio-codec', stars: 410, forks: 42, license: 'MIT', lastCommit: '2024-12', created: '2023-06', isActive: true },
    qualityBar: { novelty: 9, reusability: 9, deployment: 9, codeQuality: 9 },
    summaryZh: 'Descript 出品的 24kHz@44.1kHz 通用 codec,带 mel-spectrogram 损失 + Snake 激活,声音质量优秀。',
    brief: 'DAC: Descript 高品质语音+音乐 codec',
    tags: ['audio', 'lossy', 'Interspeech-2023', 'descript'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-004',
    title: 'APCodec: A Neural Audio Codec with Parallel Amplitude-Phase Coding',
    authors: 'Xue, Yang, Cheng, Wang, Xie',
    year: 2024,
    venue: 'Interspeech 2024',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2402.17333',
    qualityBar: { novelty: 8, reusability: 6, deployment: 5, codeQuality: 6 },
    summaryZh: '分离幅度与相位,联合 RVQ 量化,在高频与瞬态上比传统 codec 提升明显。',
    brief: 'APCodec: 幅度-相位双路编码',
    tags: ['audio', 'lossy', 'Interspeech-2024'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-005',
    title: 'SpectroStream: Speech + Music + General Audio via Waveform-to-Mel',
    authors: 'Hwang, Yen, Lin, Yang',
    year: 2024,
    venue: 'Interspeech 2024',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2406.03538',
    qualityBar: { novelty: 7, reusability: 7, deployment: 6, codeQuality: 6 },
    summaryZh: '改输入到 mel 域,STFT 维度可调支持同一模型变码率,体积更紧凑。',
    brief: 'SpectroStream: 同一模型变码率',
    tags: ['audio', 'lossy', 'Interspeech-2024'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-006',
    title: 'WavTokenizer: an Efficient Acoustic Discrete Codec Tokenizer for Audio Language Modeling',
    authors: 'Ji, Jiang, Wang, Chen, Fang, Zuo, Li, Luo, Yang, Gao, Huang, Li, Wen, Wang',
    year: 2025,
    venue: 'ICLR 2025',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openreview.net/forum?id=yBlVlS2Fd9',
    codeUrl: 'https://github.com/jishengpeng/WavTokenizer',
    github: null,
    sotaBench: { dataset: 'speech/music/audio LM', metric: 'tokens per second', value: '约 40 tokens/s' },
    qualityBar: { novelty: 9, reusability: 8, deployment: 6, codeQuality: 7 },
    summaryZh: '把 codec/tokenizer 压到低帧率,直接服务 audio language model,比传统 codec 更强调 token 效率。',
    brief: 'WavTokenizer: 面向音频语言模型的低帧率 codec',
    tags: ['audio', 'lossy', 'ICLR-2025', 'tokenizer'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-007',
    title: 'Mimi Codec in Moshi: a Speech-Text Foundation Model for Real-Time Dialogue',
    authors: 'Kyutai',
    year: 2024,
    venue: 'arXiv 2024',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2410.00037',
    codeUrl: 'https://github.com/kyutai-labs/moshi',
    github: null,
    sotaBench: { dataset: 'real-time dialogue audio', metric: 'codec frame rate / bitrate', value: '12.5 Hz / 1.1 kbps' },
    qualityBar: { novelty: 9, reusability: 8, deployment: 7, codeQuality: 7 },
    summaryZh: 'Moshi 技术报告里的 Mimi codec 是实时语音对话系统的关键组件,在低延迟和离散 token 设计上很有代表性。',
    brief: 'Mimi: 实时对话模型里的低延迟音频 codec',
    tags: ['audio', 'lossy', 'codec-tokenizer', 'Kyutai'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-008',
    title: 'UniCodec: A Universal Audio Codec with Single Domain-Adaptive Codebook',
    authors: 'Yang, et al.',
    year: 2025,
    venue: 'ACL 2025',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2502.20067',
    codeUrl: 'https://github.com/Jiang-Yidi/UniCodec',
    github: null,
    qualityBar: { novelty: 8, reusability: 7, deployment: 5, codeQuality: 6 },
    summaryZh: '用单一 domain-adaptive codebook 同时覆盖语音、音乐和通用音频,是 2025 universal codec 的代表路线。',
    brief: 'UniCodec: 单 codebook 通用音频 codec',
    tags: ['audio', 'lossy', 'ACL-2025', 'universal'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-009',
    title: 'BigCodec: Pushing the Limits of Low-Bitrate Neural Speech Codec',
    authors: 'Xin, Jiang, et al.',
    year: 2024,
    venue: 'arXiv 2024',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2409.05377',
    codeUrl: 'https://github.com/Aria-K-Alethia/BigCodec',
    github: null,
    sotaBench: { dataset: 'speech codec', metric: 'low-bitrate speech quality', value: '1.04 kbps speech codec' },
    qualityBar: { novelty: 8, reusability: 7, deployment: 5, codeQuality: 6 },
    summaryZh: '聚焦 1kbps 量级低码率语音 codec,补上“极低码率 speech compression”这条和 EnCodec/DAC 不同的路线。',
    brief: 'BigCodec: 1kbps 级低码率语音 codec',
    tags: ['audio', 'lossy', 'speech', 'low-bitrate'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-AU-010',
    title: 'OmniCodec: Low Frame Rate Universal Audio Codec with Semantic-Acoustic Disentanglement',
    authors: 'Hu, Zhang, Guo, Zhan, Li, Chen, Ma, Xie, Wang, Xie, Zhang, Xie',
    year: 2026,
    venue: 'arXiv 2026',
    modality: 'audio-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2603.20638',
    codeUrl: 'https://github.com/ASLP-lab/OmniCodec',
    github: null,
    sotaBench: { dataset: 'universal audio codec', metric: 'frame rate / downstream semantic quality', value: '低帧率 + 语义/声学解耦' },
    qualityBar: { novelty: 9, reusability: 7, deployment: 5, codeQuality: 6 },
    summaryZh: '2026 新的低帧率通用音频 codec,强调语义-声学解耦,适合跟 Mimi/WavTokenizer/UniCodec 放在同一条线比较。',
    brief: 'OmniCodec: 2026 低帧率通用音频 codec',
    tags: ['audio', 'lossy', 'arXiv-2026', 'universal'],
    paperHasOpenPDF: true,
  },

  // ===== video-codec =====
  {
    id: 'NH-VID-001',
    title: 'FVC: A New Framework towards Frame-Wise Video Compression',
    authors: 'Hu, Lu, Ye, Gong, Xiao',
    year: 2022,
    venue: 'CVPR 2022',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2109.03686',
    qualityBar: { novelty: 9, reusability: 7, deployment: 6, codeQuality: 7 },
    summaryZh: 'Frame-wise 端到端学习视频压缩,pixel 空间 + 残差 + 帧间信息流,接近 HEVC。',
    brief: 'FVC: 端到端 帧级视频压缩',
    tags: ['video', 'lossy', 'CVPR-2022', 'google-area'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-002',
    title: 'DCVC: Deep Contextual Video Compression',
    authors: 'Li, Cai, Lu, Pan, Chen, Zhang, Wang, Li, Liu, Sun',
    year: 2021,
    venue: 'NeurIPS 2021',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2108.09465',
    qualityBar: { novelty: 9, reusability: 8, deployment: 8, codeQuality: 8 },
    summaryZh: 'contextual 条件化 I-帧/P-帧,通过上下文模型提高熵模型,在 UVG 上首次击败 HEVC-x265。',
    brief: 'DCVC: 上下文条件视频压缩',
    tags: ['video', 'lossy', 'NeurIPS-2021'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-003',
    title: 'DCVC-DC: Diverse Conditional for Learned Video Compression',
    authors: 'Li, Jia, Wu, Guo, Zhang, Sun',
    year: 2023,
    venue: 'CVPR 2023',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2304.06962',
    qualityBar: { novelty: 9, reusability: 7, deployment: 7, codeQuality: 8 },
    summaryZh: '多样化条件提升熵模型精度,在 HEVC UVG 上 RD 提升 8-12%,2023 CVPR。',
    brief: 'DCVC-DC: 多样条件化',
    tags: ['video', 'lossy', 'CVPR-2023'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-004',
    title: 'Emerging Advances in Learned Video Compression: Models, Systems and Beyond (Survey)',
    authors: 'Jia, Ye, Ma, Gao, Sun, Chiariglione',
    year: 2024,
    venue: 'IJCAI 2024',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://www.ijcai.org/proceedings/2025/1165.pdf',
    qualityBar: { novelty: 8, reusability: 9, deployment: 6, codeQuality: 6 },
    summaryZh: 'IJCAI 2024 系统综述,覆盖 uni/bi-directional LVC 完整技术栈 + 边缘部署 + 标准化。',
    brief: 'LVC Survey IJCAI 2024: 模型+系统+落地',
    tags: ['video', 'lossy', 'IJCAI-2024', 'survey'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-005',
    title: 'Neural Video Compression with Feature Modulation — DCVC-FM',
    authors: 'Li, Li, Lu, Guo, Jiang, Wang',
    year: 2024,
    venue: 'CVPR 2024',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openaccess.thecvf.com/content/CVPR2024/papers/Li_Neural_Video_Compression_with_Feature_Modulation_CVPR_2024_paper.pdf',
    codeUrl: 'https://github.com/microsoft/DCVC',
    github: null,
    sotaBench: { dataset: 'HEVC / UVG / MCL-JCV', metric: 'BD-rate vs VTM / prior SOTA', value: '-25.5% / -29.7%' },
    qualityBar: { novelty: 9, reusability: 8, deployment: 7, codeQuality: 7 },
    summaryZh: 'DCVC 系列的 2024 关键升级,用 feature modulation 强化时空条件,是当前页面缺失最明显的视频代表作。',
    brief: 'DCVC-FM: feature modulation 视频压缩',
    tags: ['video', 'lossy', 'CVPR-2024', 'DCVC'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-006',
    title: 'DCVC-RT: Towards Real-Time Neural Video Codec',
    authors: 'Li, Li, Lu',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://openaccess.thecvf.com/content/CVPR2025/papers/Li_DCVC-RT_Towards_Real-Time_Neural_Video_Codec_CVPR_2025_paper.pdf',
    codeUrl: 'https://github.com/microsoft/DCVC',
    github: null,
    sotaBench: { dataset: '1080p video', metric: 'decode / encode fps', value: '125.2 / 112.8 fps' },
    qualityBar: { novelty: 9, reusability: 8, deployment: 8, codeQuality: 7 },
    summaryZh: '把 learned video codec 推向实时,在高分辨率下强调编码/解码速度,比单纯 RD 曲线更接近落地问题。',
    brief: 'DCVC-RT: 实时神经视频 codec',
    tags: ['video', 'lossy', 'CVPR-2025', 'real-time'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-007',
    title: 'Neural Video Compression with Context Modulation',
    authors: 'Fu, Li, Liang, Wang, Ren, Zhang',
    year: 2025,
    venue: 'CVPR 2025',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2505.14541',
    codeUrl: 'https://github.com/Austin4USTC/DCMVC',
    github: null,
    qualityBar: { novelty: 9, reusability: 7, deployment: 6, codeQuality: 6 },
    summaryZh: '用 context modulation 统一增强运动、残差和熵建模条件,是 2025 年 learned video compression 的重要变体。',
    brief: 'Context Modulation: 条件调制视频压缩',
    tags: ['video', 'lossy', 'CVPR-2025', 'context'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-008',
    title: 'Generalizable Implicit Motion Modeling for Video Compression — GIViC',
    authors: 'Zhu, Yang, Yin, Mandt',
    year: 2025,
    venue: 'arXiv 2025',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2503.19604',
    github: null,
    sotaBench: { dataset: 'MCL-JCV / UVG / HEVC-B', metric: 'BD-rate vs VTM/DCVC-FM/NVRC', value: 'outperforms on reported RGB benchmarks' },
    qualityBar: { novelty: 9, reusability: 4, deployment: 4, codeQuality: 4 },
    summaryZh: '用隐式运动建模替代部分显式 motion pipeline,主打跨数据集泛化,适合作为视频压缩新研究路线观察项。',
    brief: 'GIViC: 隐式运动模型视频压缩',
    tags: ['video', 'lossy', 'implicit', '2025'],
    paperHasOpenPDF: true,
  },
  {
    id: 'NH-VID-009',
    title: 'Towards Learned Intra and Inter Video Compression with the Same Neural Codec',
    authors: 'Lin, Chen, Wen',
    year: 2025,
    venue: 'arXiv 2025',
    modality: 'video-codec',
    losslessOrLossy: 'lossy',
    paperUrl: 'https://arxiv.org/abs/2510.14431',
    github: null,
    qualityBar: { novelty: 8, reusability: 4, deployment: 4, codeQuality: 4 },
    summaryZh: '尝试用同一个神经 codec 统一 intra/inter 视频压缩,方向上很重要,但仍偏研究候选项。',
    brief: '统一 intra/inter 的神经视频 codec',
    tags: ['video', 'lossy', 'intra-inter', '2025'],
    paperHasOpenPDF: true,
  },
];

// ============ 工具函数 ============

export interface ModalityMeta {
  id: NeuralModality;
  emoji: string;
  label: string;
  labelZh: string;
  color: string;
  brief: string;
}

export const MODALITY_META: Record<NeuralModality, ModalityMeta> = {
  'text-general':     { id: 'text-general',     emoji: '📝', label: 'LLM / Text Lossless', labelZh: 'LLM 无损压缩', color: '#1f4ed8', brief: '语言模型概率分布接入无损熵编码' },
  'image-lossless':   { id: 'image-lossless',   emoji: '🖼️', label: 'Learned Image Lossless', labelZh: '神经图像无损', color: '#059669', brief: '像素/latent 概率模型与无损图像 codec' },
  'image-lossy':      { id: 'image-lossy',      emoji: '🎨', label: 'Learned Image Lossy', labelZh: '神经图像有损', color: '#e11d48', brief: '可学习变换、超先验、上下文熵模型与 RD 优化' },
  'audio-codec':      { id: 'audio-codec',      emoji: '🎵', label: 'Neural Audio Codec', labelZh: '神经音频 codec', color: '#7c3aed', brief: 'SoundStream / EnCodec / DAC / APCodec 等 RVQ codec' },
  'video-codec':      { id: 'video-codec',      emoji: '🎬', label: 'Neural Video Codec', labelZh: '神经视频 codec', color: '#0891b2', brief: '运动补偿、时域上下文与端到端视频压缩' },
  'generative-image': { id: 'generative-image', emoji: '✨', label: 'Generative Low Bitrate', labelZh: '生成式低码率', color: '#a855f7', brief: 'GAN/Diffusion decoder 参与极低码率重建' },
  'hybrid-arch':      { id: 'hybrid-arch',      emoji: '🧬', label: 'New Backbone / Entropy Model', labelZh: '新架构熵模型', color: '#f59e0b', brief: 'Mamba/RWKV/Transformer 作为 codec backbone 或熵模型' },
};

export type SortMode = 'sota' | 'recent' | 'stars' | 'quality' | 'deployment';
export const SORT_MODES: Array<{id: SortMode; label: string; brief: string}> = [
  { id: 'sota', label: 'Benchmark', brief: '按 benchmark 证据排序' },
  { id: 'recent', label: '最新', brief: '按发布时间倒序' },
  { id: 'stars', label: '代码', brief: 'GitHub stars × 0.6 + 代码质量 × 0.4' },
  { id: 'quality', label: '质量', brief: '代码质量 + 可复用性加权' },
  { id: 'deployment', label: '工业', brief: '工业部署成熟度优先' },
];

export const LICENSE_OPTIONS = ['any', 'MIT', 'Apache 2.0', 'BSD-3-Clause', 'only-paper'] as const;
export type LicenseFilter = typeof LICENSE_OPTIONS[number];

/**
 * 计算综合得分:5 种排序模式共享一个 0-100 标准分值
 *
 * @param sort 排序模式
 * @param item 待评项
 */
export function scoreItem(sort: SortMode, item: NeuralItem): number {
  switch (sort) {
    case 'sota': {
      // 有 SOTA benchmark + 创新分高 → 优先级
      const hasSota = item.sotaBench ? 10 : 5;
      return hasSota * 4 + item.qualityBar.novelty * 4 + item.qualityBar.deployment * 2;
    }
    case 'recent': {
      return item.year * 10 + (item.qualityBar.novelty / 10);
    }
    case 'stars': {
      const stars = item.github ? Math.log10(Math.max(item.github.stars, 1)) : 0;
      return stars * 30 + item.qualityBar.codeQuality * 4 + item.qualityBar.reusability * 2;
    }
    case 'quality': {
      return item.qualityBar.codeQuality * 6 + item.qualityBar.reusability * 3 + item.qualityBar.novelty * 1;
    }
    case 'deployment': {
      return item.qualityBar.deployment * 8 + (item.github ? 10 : 0) + item.qualityBar.codeQuality * 2;
    }
  }
}

export function filterAndSort(
  items: NeuralItem[],
  modality: Set<NeuralModality>,
  yearRange: [number, number],
  onlyOpenSource: boolean,
  hasSota: 'any' | 'yes' | 'no',
  license: LicenseFilter,
  maturity: 'all' | 'paper-only' | 'code-only' | 'mature',
  lang: 'any' | 'python' | 'cpp' | 'rust',
  sort: SortMode,
): NeuralItem[] {
  let out = items.filter((it) => modality.has(it.modality));
  out = out.filter((it) => it.year >= yearRange[0] && it.year <= yearRange[1]);

  if (onlyOpenSource) out = out.filter((it) => !!it.github || !!it.codeUrl);

  if (hasSota === 'yes') out = out.filter((it) => !!it.sotaBench);
  if (hasSota === 'no') out = out.filter((it) => !it.sotaBench);

  if (license !== 'any') {
    if (license === 'only-paper') {
      out = out.filter((it) => !it.github && !it.codeUrl);
    } else {
      out = out.filter((it) => it.github && it.github.license === license);
    }
  }

  if (maturity === 'paper-only') out = out.filter((it) => !it.codeUrl);
  if (maturity === 'code-only') out = out.filter((it) => !!it.codeUrl || !!it.github);
  if (maturity === 'mature') out = out.filter((it) => !!it.github && it.github.isActive && it.github.stars > 100);

  // 语言筛选 (粗粒度:只 Python / C++ / Rust)
  if (lang !== 'any') {
    out = out.filter((it) => {
      const txt = `${it.title} ${(it.tags || []).join(' ')}`.toLowerCase();
      if (lang === 'python') return /(python|pytorch|compre|deep)/.test(txt) || true; // 默认大多 python
      if (lang === 'cpp') return /(c\+\+|cpp|tvm)/.test(txt);
      if (lang === 'rust') return /(rust|burn)/.test(txt);
      return true;
    });
  }

  return [...out].sort((a, b) => scoreItem(sort, b) - scoreItem(sort, a));
}

export function getKpis(items: NeuralItem[]): {modalities: number; mature: number; open: number; recent4y: number; total: number} {
  const total = items.length;
  const modalities = new Set(items.map((i) => i.modality)).size;
  const mature = items.filter((i) => i.github && i.github.isActive && i.github.stars > 100).length;
  const open = items.filter((i) => !!i.github || !!i.codeUrl).length;
  const recent4y = items.filter((i) => i.year >= 2024).length;
  return {modalities, mature, open, recent4y, total};
}
