export type LeaderboardDomain =
  | 'general'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'timeseries'
  | 'scientific'
  | 'genomic'
  | 'pointcloud'
  | 'structured';

export type LeaderboardMode = 'lossless' | 'lossy' | 'mixed';
export type LeaderboardEvidence = 'official' | 'paper' | 'engineering' | 'reference';
export type LeaderboardPresentation = 'ranking' | 'comparison' | 'registry';

export interface LeaderboardEntry {
  rank?: number;
  method: string;
  year?: number;
  metric: string;
  metricShort?: string;
  lowerIsBetter?: boolean;
  sourceUrl: string;
  paperUrl?: string;
  codeUrl?: string;
  config?: string;
  notes?: string;
  comparable?: boolean;
}

export interface Leaderboard {
  id: string;
  title: string;
  domain: LeaderboardDomain;
  mode: LeaderboardMode;
  task: string;
  dataset: string;
  datasetVersion?: string;
  metric: string;
  protocol: string;
  evidence: LeaderboardEvidence;
  presentation: LeaderboardPresentation;
  sourceName: string;
  sourceUrl: string;
  entries: LeaderboardEntry[];
  updatedAt: string;
  limitations?: string;
}

const VERIFIED_AT = '2026-07-17';

export const LEADERBOARDS: Leaderboard[] = [
  {
    id: 'lb-general-silesia',
    title: 'Silesia 开源无损压缩榜',
    domain: 'general',
    mode: 'lossless',
    task: '混合文件集合的最大压缩率',
    dataset: 'Silesia corpus（12 个文件，约 211 MB）',
    datasetVersion: 'Mahoney snapshot 2026-05-20',
    metric: '总压缩字节数 ↓',
    protocol: '同一语料；按官网记录的最优参数；只收录开放源代码实现。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'Silesia Open Source Compression Benchmark',
    sourceUrl: 'http://mattmahoney.net/dc/silesia.html',
    updatedAt: VERIFIED_AT,
    entries: [
      {rank: 1, method: 'paq8px_v215', config: '-12L', metric: '27,825,511 B', metricShort: '27825511', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/silesia.html', codeUrl: 'https://github.com/hxim/paq8px'},
      {rank: 2, method: 'paq8px_v210', config: '-12L', metric: '27,987,907 B', metricShort: '27987907', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/silesia.html', codeUrl: 'https://github.com/hxim/paq8px'},
      {rank: 3, method: 'paq8px_v209', config: '-12L', metric: '28,025,541 B', metricShort: '28025541', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/silesia.html', codeUrl: 'https://github.com/hxim/paq8px'},
      {rank: 4, method: 'paq8px_v206', config: '-12TL', metric: '28,241,197 B', metricShort: '28241197', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/silesia.html', codeUrl: 'https://github.com/hxim/paq8px'},
      {rank: 5, method: 'precomp v0.4.7 + cmix v21', config: '-cn', metric: '28,261,094 B', metricShort: '28261094', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/silesia.html'},
      {rank: 6, method: 'paq8px_v206', config: '-12TR', metric: '28,280,021 B', metricShort: '28280021', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/silesia.html', codeUrl: 'https://github.com/hxim/paq8px'},
    ],
  },
  {
    id: 'lb-general-engineering-tools',
    title: '通用压缩工程评测入口',
    domain: 'general',
    mode: 'lossless',
    task: '压缩率、编码吞吐和解码吞吐的本机复现',
    dataset: '用户指定语料或工具内置语料',
    metric: '压缩率 + 编码/解码 MB/s',
    protocol: '必须固定 CPU、线程数、编译器、版本、参数和语料后再比较。',
    evidence: 'engineering',
    presentation: 'registry',
    sourceName: '开源工程 benchmark 集合',
    sourceUrl: 'https://github.com/inikep/lzbench',
    updatedAt: VERIFIED_AT,
    limitations: '这些工具没有共享的实时硬件环境，因此这里只提供可复现实验入口，不生成跨机器总排名。',
    entries: [
      {method: 'lzbench', metric: '同一可执行文件集成多种开源压缩器', sourceUrl: 'https://github.com/inikep/lzbench', codeUrl: 'https://github.com/inikep/lzbench', notes: '适合构建速度—压缩率 Pareto 前沿。'},
      {method: 'TurboBench', metric: '70+ 压缩器；支持内存峰值和图表输出', sourceUrl: 'https://github.com/powturbo/TurboBench', codeUrl: 'https://github.com/powturbo/TurboBench'},
      {method: 'Squash Compression Benchmark', metric: '历史统一测试与交互式结果入口', sourceUrl: 'https://quixdb.github.io/squash-benchmark/'},
      {method: 'Compression Ratings', metric: '公开工程结果参考', sourceUrl: 'https://compressionratings.com/', notes: '需要核对测试机器和语料后再引用数值。'},
    ],
  },
  {
    id: 'lb-text-mahoney-enwik9',
    title: 'enwik9 / Large Text Compression Benchmark',
    domain: 'text',
    mode: 'lossless',
    task: '1 GB Wikipedia XML 最大压缩率',
    dataset: 'enwik9（1,000,000,000 bytes）',
    datasetVersion: 'enwiki-20060303-pages-articles.xml prefix',
    metric: '压缩数据 + 解压器总字节数 ↓',
    protocol: 'Mahoney 主榜规则；enwik8 仅为辅助列，不能进入本榜排序。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'Large Text Compression Benchmark',
    sourceUrl: 'http://mattmahoney.net/dc/text.html',
    updatedAt: VERIFIED_AT,
    entries: [
      {rank: 1, method: 'nncp v3.2', metric: '107,261,318 B', metricShort: '107261318', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/text.html', codeUrl: 'https://bellard.org/nncp/'},
      {rank: 2, method: 'cmix v21', config: '-t', metric: '108,244,767 B', metricShort: '108244767', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/text.html'},
      {rank: 3, method: 'cmix-lex', metric: '109,190,109 B', metricShort: '109190109', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/text.html'},
      {rank: 4, method: 'fx2-cmix', metric: '110,351,665 B', metricShort: '110351665', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/text.html'},
      {rank: 5, method: 'jax-compress', metric: '113,393,442 B', metricShort: '113393442', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/text.html'},
      {rank: 6, method: 'tensorflow-compress v4', metric: '113,597,696 B', metricShort: '113597696', lowerIsBetter: true, sourceUrl: 'http://mattmahoney.net/dc/text.html'},
    ],
  },
  {
    id: 'lb-text-hutter-enwik9',
    title: 'Hutter Prize enwik9 获奖记录',
    domain: 'text',
    mode: 'lossless',
    task: '满足赛事资源限制的 enwik9 压缩',
    dataset: 'enwik9（1 GB）',
    datasetVersion: 'Hutter Prize official records',
    metric: '压缩数据 + 解压器总字节数 ↓',
    protocol: '遵守赛事 RAM、时间和可复现规则；与 Mahoney 信息榜分开。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'Hutter Prize Official',
    sourceUrl: 'http://prize.hutter1.net/',
    updatedAt: VERIFIED_AT,
    limitations: '官网同时保留旧 enwik8 pre-prize 记录；本榜只允许大于 100 MB 的 enwik9 成绩。',
    entries: [
      {rank: 1, method: 'fx2-cmix', year: 2024, metric: '110,793,128 B', metricShort: '110793128', lowerIsBetter: true, sourceUrl: 'http://prize.hutter1.net/'},
      {rank: 2, method: 'fx-cmix', year: 2024, metric: '112,578,322 B', metricShort: '112578322', lowerIsBetter: true, sourceUrl: 'http://prize.hutter1.net/'},
      {rank: 3, method: 'fast cmix', year: 2023, metric: '114,156,155 B', metricShort: '114156155', lowerIsBetter: true, sourceUrl: 'http://prize.hutter1.net/'},
      {rank: 4, method: 'starlit', year: 2021, metric: '115,352,938 B', metricShort: '115352938', lowerIsBetter: true, sourceUrl: 'http://prize.hutter1.net/'},
      {rank: 5, method: 'phda9 v1.8', year: 2019, metric: '116,673,681 B', metricShort: '116673681', lowerIsBetter: true, sourceUrl: 'http://prize.hutter1.net/'},
    ],
  },
  {
    id: 'lb-text-l3tc-enwik9-acr',
    title: 'L3TC 学习型文本压缩论文对比',
    domain: 'text',
    mode: 'lossless',
    task: '低复杂度学习型文本压缩',
    dataset: 'enwik9 测试；enwik8 训练',
    datasetVersion: 'AAAI 2025 paper protocol',
    metric: 'ACR（含模型大小）% ↓',
    protocol: '2048-byte chunks；字符/词元器按论文设置；以包含模型开销的 ACR 排序。',
    evidence: 'paper',
    presentation: 'comparison',
    sourceName: 'L3TC, AAAI 2025, Table 3',
    sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446',
    updatedAt: VERIFIED_AT,
    limitations: '该表用于比较论文协议下的模型效率，不能替代 Mahoney 或 Hutter 官方榜。',
    entries: [
      {rank: 1, method: 'L3TC-3.2M', year: 2025, metric: '16.87% ACR', metricShort: '16.87', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446', paperUrl: 'https://doi.org/10.1609/aaai.v39i12.33446', codeUrl: 'https://github.com/alipay/L3TC-leveraging-rwkv-for-learned-lossless-low-complexity-text-compression'},
      {rank: 2, method: 'L3TC-800K', year: 2025, metric: '17.72% ACR', metricShort: '17.72', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446', codeUrl: 'https://github.com/alipay/L3TC-leveraging-rwkv-for-learned-lossless-low-complexity-text-compression'},
      {rank: 3, method: 'L3TC-12M', year: 2025, metric: '18.40% ACR', metricShort: '18.40', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446'},
      {rank: 4, method: 'L3TC-200K', year: 2025, metric: '18.48% ACR', metricShort: '18.48', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446'},
      {rank: 5, method: 'gzip', metric: '32.26% ACR', metricShort: '32.26', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446'},
      {rank: 6, method: 'tszip', year: 2023, metric: '47.34% ACR', metricShort: '47.34', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33446'},
    ],
  },
  {
    id: 'lb-image-callic-kodak',
    title: '学习型图像无损压缩论文对比',
    domain: 'image',
    mode: 'lossless',
    task: 'RGB 自然图像无损编码',
    dataset: 'Kodak（24 张 768×512 RGB 图像）',
    datasetVersion: 'CALLIC paper evaluation set',
    metric: 'bits per sub-pixel（bpsp）↓',
    protocol: 'CALLIC 论文 Table 1；同一 Kodak 集合；传统与学习型方法共同列示。',
    evidence: 'paper',
    presentation: 'comparison',
    sourceName: 'CALLIC, AAAI 2025, Table 1',
    sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494',
    updatedAt: VERIFIED_AT,
    limitations: 'bpsp、整像素 BPP 和 BPD 不可直接混用；本榜不再加入未经同表验证的近似值。',
    entries: [
      {rank: 1, method: 'CALLIC', year: 2025, metric: '2.54 bpsp', metricShort: '2.54', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494', paperUrl: 'https://doi.org/10.1609/aaai.v39i5.32494', notes: '论文报告包含逐图微调开销；未登记可访问的官方代码仓库。'},
      {rank: 2, method: 'MGCF', year: 2025, metric: '2.77 bpsp', metricShort: '2.77', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494'},
      {rank: 3, method: 'ArIB-BPS', year: 2024, metric: '2.78 bpsp', metricShort: '2.78', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494'},
      {rank: 4, method: 'DLPR', year: 2024, metric: '2.86 bpsp', metricShort: '2.86', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494'},
      {rank: 5, method: 'JPEG XL', metric: '2.87 bpsp', metricShort: '2.87', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494', codeUrl: 'https://github.com/libjxl/libjxl'},
      {rank: 6, method: 'LC-FDNet', year: 2022, metric: '2.98 bpsp', metricShort: '2.98', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1609/aaai.v39i5.32494'},
    ],
  },
  {
    id: 'lb-image-clic-2025-015',
    title: 'CLIC 2025 image@0.15bpp',
    domain: 'image',
    mode: 'lossy',
    task: '固定码率主观图像压缩挑战',
    dataset: 'CLIC 2025 test（30 images）',
    datasetVersion: 'image_0_15/test',
    metric: 'ELO ↑；PSNR 与 MS-SSIM 仅作辅助',
    protocol: '只在 0.15bpp 官方赛道内部按 ELO 排名。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'CLIC 2025 Official Leaderboard',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/',
    updatedAt: VERIFIED_AT,
    entries: [
      {rank: 1, method: 'Vcoder', year: 2025, metric: 'ELO 2127 · PSNR 26.269 · MS-SSIM 0.946', metricShort: '2127', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/'},
      {rank: 2, method: 'Evolve', year: 2025, metric: 'ELO 2119 · PSNR 27.364 · MS-SSIM 0.952', metricShort: '2119', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/'},
      {rank: 3, method: 'PKUSZ-AliMerlin', year: 2025, metric: 'ELO 2116 · PSNR 26.059 · MS-SSIM 0.941', metricShort: '2116', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/'},
      {rank: 4, method: 'IronMan', year: 2025, metric: 'ELO 2106 · PSNR 27.820 · MS-SSIM 0.952', metricShort: '2106', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/'},
      {rank: 4, method: 'Thanos', year: 2025, metric: 'ELO 2106 · PSNR 28.010 · MS-SSIM 0.953', metricShort: '2106', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/'},
      {rank: 6, method: 'TestC', year: 2025, metric: 'ELO 2053 · PSNR 27.985 · MS-SSIM 0.953', metricShort: '2053', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/'},
    ],
  },
  {
    id: 'lb-image-clic-2025-0075',
    title: 'CLIC 2025 image@0.075bpp',
    domain: 'image',
    mode: 'lossy',
    task: '极低码率主观图像压缩挑战',
    dataset: 'CLIC 2025 test',
    datasetVersion: 'image_0_075/test',
    metric: 'ELO ↑；PSNR 与 MS-SSIM 仅作辅助',
    protocol: '只在 0.075bpp 官方赛道内部按 ELO 排名。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'CLIC 2025 Official Leaderboard',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/',
    updatedAt: VERIFIED_AT,
    entries: [
      {rank: 1, method: 'Vcoder', year: 2025, metric: 'ELO 1929 · PSNR 23.987 · MS-SSIM 0.900', metricShort: '1929', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/'},
      {rank: 2, method: 'Evolve', year: 2025, metric: 'ELO 1903 · PSNR 24.645 · MS-SSIM 0.915', metricShort: '1903', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/'},
      {rank: 3, method: 'IronMan', year: 2025, metric: 'ELO 1890 · PSNR 25.581 · MS-SSIM 0.915', metricShort: '1890', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/'},
      {rank: 4, method: 'Thanos', year: 2025, metric: 'ELO 1888 · PSNR 25.257 · MS-SSIM 0.914', metricShort: '1888', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/'},
      {rank: 5, method: 'PKUSZ-AliMerlin', year: 2025, metric: 'ELO 1792 · PSNR 24.128 · MS-SSIM 0.901', metricShort: '1792', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/'},
      {rank: 6, method: 'RunRun', year: 2025, metric: 'ELO 1776 · PSNR 25.517 · MS-SSIM 0.918', metricShort: '1776', lowerIsBetter: false, sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/'},
    ],
  },
  {
    id: 'lb-video-neurallvc-xiph-cif',
    title: '无损视频论文对比（Xiph CIF）',
    domain: 'video',
    mode: 'lossless',
    task: 'YUV420 视频逐像素无损编码',
    dataset: 'Xiph CIF（9 sequences，2,300 frames）',
    datasetVersion: 'NeuralLVC paper Table 1',
    metric: '压缩后大小 / 原始大小 % ↓',
    protocol: '所有帧；原生 YUV420；传统 codec 使用论文配置；解码后逐像素校验。',
    evidence: 'reference',
    presentation: 'comparison',
    sourceName: 'NeuralLVC preprint, Table 1',
    sourceUrl: 'https://arxiv.org/abs/2604.03353',
    updatedAt: VERIFIED_AT,
    limitations: '这是 2026 预印本自报结果，尚无公开实现；VVC QP=0 会产生量化误差，因此排除在真正无损名次之外。',
    entries: [
      {rank: 1, method: 'NeuralLVC', year: 2026, metric: '29.71%', metricShort: '29.71', lowerIsBetter: true, sourceUrl: 'https://arxiv.org/abs/2604.03353', paperUrl: 'https://arxiv.org/abs/2604.03353'},
      {rank: 2, method: 'H.265 lossless inter', metric: '36.37%', metricShort: '36.37', lowerIsBetter: true, sourceUrl: 'https://arxiv.org/abs/2604.03353'},
      {rank: 3, method: 'H.264 lossless', metric: '36.77%', metricShort: '36.77', lowerIsBetter: true, sourceUrl: 'https://arxiv.org/abs/2604.03353'},
      {rank: 4, method: 'FFV1', metric: '45.97%', metricShort: '45.97', lowerIsBetter: true, sourceUrl: 'https://arxiv.org/abs/2604.03353', codeUrl: 'https://ffmpeg.org/'},
      {rank: 5, method: 'PNG frame-by-frame', metric: '51.69%', metricShort: '51.69', lowerIsBetter: true, sourceUrl: 'https://arxiv.org/abs/2604.03353'},
      {rank: 6, method: 'H.265 intra-only', metric: '55.34%', metricShort: '55.34', lowerIsBetter: true, sourceUrl: 'https://arxiv.org/abs/2604.03353'},
      {method: 'VVC QP=0', metric: '27.24%（近无损）', metricShort: '27.24', lowerIsBetter: true, comparable: false, sourceUrl: 'https://arxiv.org/abs/2604.03353', notes: '论文验证存在量化误差，不参与无损排名。'},
    ],
  },
  {
    id: 'lb-audio-lossless-evidence',
    title: '无损音频证据与复现入口',
    domain: 'audio',
    mode: 'lossless',
    task: '完整波形无损压缩',
    dataset: '音乐、语音、生物声学与音效集合',
    metric: '压缩率 + 编码/解码时间',
    protocol: '必须固定采样率、位深、声道、曲目集合和 codec 级别；验证解码 PCM 完全一致。',
    evidence: 'engineering',
    presentation: 'registry',
    sourceName: '公开音频 benchmark 与 codec 实现',
    sourceUrl: 'https://github.com/cmpute/audio-codec-benchmark',
    updatedAt: VERIFIED_AT,
    limitations: '目前没有跨全部音频分布的权威总榜；不同曲目上的压缩率差异很大。',
    entries: [
      {method: 'FLAC', metric: '强生产基线；2026 跨领域研究中通常优于所测 LLM 方法', sourceUrl: 'https://github.com/xiph/flac', codeUrl: 'https://github.com/xiph/flac'},
      {method: 'WavPack', metric: '开源无损与混合模式基线', sourceUrl: 'https://github.com/dbry/WavPack', codeUrl: 'https://github.com/dbry/WavPack'},
      {method: 'Audio Codec Benchmark', metric: '逐曲目压缩率、编码时间、解码时间和哈希校验', sourceUrl: 'https://github.com/cmpute/audio-codec-benchmark', codeUrl: 'https://github.com/cmpute/audio-codec-benchmark'},
      {method: 'Full-Fidelity Audio LM Benchmark', year: 2026, metric: '跨音乐、语音和生物声学的论文比较', sourceUrl: 'https://arxiv.org/abs/2603.08683', paperUrl: 'https://arxiv.org/abs/2603.08683'},
    ],
  },
  {
    id: 'lb-scientific-lossless-fp-evidence',
    title: '科学浮点无损压缩证据矩阵',
    domain: 'scientific',
    mode: 'lossless',
    task: 'IEEE 754 浮点数组无损压缩',
    dataset: 'FCBench：33 个科学仿真、时序、观测和数据库数据集',
    datasetVersion: 'FCBench paper/repository',
    metric: '压缩率 + 压缩/解压吞吐 + 端到端时间',
    protocol: 'CPU 与 GPU 分开；单/双精度分开；固定硬件、线程、编译器和数据布局。',
    evidence: 'paper',
    presentation: 'registry',
    sourceName: 'FCBench + ALP + ndzip',
    sourceUrl: 'https://github.com/hpdps-group/FCBench',
    updatedAt: VERIFIED_AT,
    limitations: '不同数据集上的 Pareto 前沿不同，不能用跨数据集平均值宣布唯一 SOTA；SDRBench 的误差有界有损结果另行处理。',
    entries: [
      {method: 'FCBench', year: 2024, metric: '8 个 CPU 方法 + 5 个 GPU 方法 / 33 datasets', sourceUrl: 'https://doi.org/10.14778/3648160.3648180', paperUrl: 'https://doi.org/10.14778/3648160.3648180', codeUrl: 'https://github.com/hpdps-group/FCBench'},
      {method: 'ALP', year: 2024, metric: '自适应无损浮点编码与公开 benchmark', sourceUrl: 'https://doi.org/10.1145/3626717', paperUrl: 'https://doi.org/10.1145/3626717', codeUrl: 'https://github.com/cwida/ALP'},
      {method: 'ndzip CPU/GPU', year: 2021, metric: '高吞吐并行科学数据无损压缩', sourceUrl: 'https://doi.org/10.1109/DCC50243.2021.00018', paperUrl: 'https://doi.org/10.1109/DCC50243.2021.00018', codeUrl: 'https://github.com/celerity/ndzip'},
      {method: 'SDRBench', year: 2020, metric: '误差有界有损科学压缩的独立基准入口', sourceUrl: 'https://doi.org/10.1109/BigData50022.2020.9378449', paperUrl: 'https://doi.org/10.1109/BigData50022.2020.9378449', codeUrl: 'https://github.com/SDRBench/sdrbench.github.io', comparable: false, notes: '任务不是严格无损，不参与本榜排名。'},
    ],
  },
  {
    id: 'lb-timeseries-float-evidence',
    title: '时序浮点无损压缩证据矩阵',
    domain: 'timeseries',
    mode: 'lossless',
    task: '浮点时间序列的流式存储、扫描与访问',
    dataset: '论文各自公开的工业、传感器与科学时序集合',
    metric: 'bytes/value + 写入吞吐 + 扫描/点查延迟',
    protocol: '只有同一数据、数据布局、块大小、硬件和访问模式下的结果可以直接排序。',
    evidence: 'reference',
    presentation: 'registry',
    sourceName: 'Gorilla / Chimp / Elf / ALP primary papers',
    sourceUrl: 'https://doi.org/10.14778/3551793.3551852',
    updatedAt: '2026-07-23',
    limitations: '各论文数据集和系统集成方式不同，本页只登记证据，不把跨论文数字拼成总榜。',
    entries: [
      {method: 'Gorilla', year: 2015, metric: '时间戳差分 + 浮点 XOR 流式基线', sourceUrl: 'https://doi.org/10.14778/2824032.2824078', paperUrl: 'https://doi.org/10.14778/2824032.2824078'},
      {method: 'Chimp', year: 2022, metric: '现代浮点 XOR 编码与快速访问基线', sourceUrl: 'https://doi.org/10.14778/3551793.3551852', paperUrl: 'https://doi.org/10.14778/3551793.3551852'},
      {method: 'Elf', year: 2023, metric: '擦除可恢复尾数冗余的浮点编码', sourceUrl: 'https://doi.org/10.14778/3587136.3587149', paperUrl: 'https://doi.org/10.14778/3587136.3587149'},
      {method: 'ALP', year: 2023, metric: '十进制转整数 + 向量化前缀位编码', sourceUrl: 'https://doi.org/10.1145/3626717', paperUrl: 'https://doi.org/10.1145/3626717', codeUrl: 'https://github.com/cwida/ALP'},
    ],
  },
  {
    id: 'lb-pointcloud-codec-evidence',
    title: '点云几何压缩证据矩阵',
    domain: 'pointcloud',
    mode: 'mixed',
    task: '静态点云几何与属性压缩',
    dataset: 'MPEG Cat1/Cat3、8iVFB、Owlii 等；以具体论文或 CTC 为准',
    metric: '无损 bpov/字节；有损 bpp + D1/D2 或任务质量',
    protocol: '几何与属性、有损与无损、坐标精度和 MPEG CTC 必须分别记录。',
    evidence: 'reference',
    presentation: 'registry',
    sourceName: 'MPEG point cloud standards and public implementations',
    sourceUrl: 'https://doi.org/10.1017/ATSIP.2020.12',
    updatedAt: '2026-07-23',
    limitations: '不同坐标量化、属性设置和数据集不可直接排名；当前先登记标准、工程和学习式基线。',
    entries: [
      {method: 'Draco', year: 2017, metric: '开源网格与点云工程基线', sourceUrl: 'https://github.com/google/draco', codeUrl: 'https://github.com/google/draco'},
      {method: 'MPEG G-PCC', year: 2020, metric: '几何点云标准与 CTC 基线', sourceUrl: 'https://doi.org/10.1017/ATSIP.2020.12', paperUrl: 'https://doi.org/10.1017/ATSIP.2020.12'},
      {method: 'UniPCGC', year: 2025, metric: '统一有损/无损、可变码率与复杂度', sourceUrl: 'https://doi.org/10.1609/aaai.v39i12.33387', paperUrl: 'https://doi.org/10.1609/aaai.v39i12.33387', codeUrl: 'https://github.com/Wangkkklll/UniPCGC'},
    ],
  },
  {
    id: 'lb-genomic-spring-novaseq-25x',
    title: 'FASTQ 无损压缩论文对比（NovaSeq 25×）',
    domain: 'genomic',
    mode: 'lossless',
    task: 'Illumina paired FASTQ 无损压缩',
    dataset: 'Homo sapiens NovaSeq 25×',
    datasetVersion: 'SPRING paper Table 1',
    metric: '压缩后大小（MB）↓',
    protocol: '同一原始数据；lossless mode；论文推荐配置。',
    evidence: 'paper',
    presentation: 'comparison',
    sourceName: 'SPRING, Bioinformatics 2019, Table 1',
    sourceUrl: 'https://doi.org/10.1093/bioinformatics/bty1015',
    updatedAt: VERIFIED_AT,
    limitations: 'FASTQ、FASTA、BAM/CRAM、VCF 以及参考/非参考压缩必须分榜。',
    entries: [
      {rank: 1, method: 'SPRING', year: 2019, metric: '6,971 MB', metricShort: '6971', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1093/bioinformatics/bty1015', paperUrl: 'https://doi.org/10.1093/bioinformatics/bty1015', codeUrl: 'https://github.com/shubhamchandak94/Spring'},
      {rank: 2, method: 'FaStore', metric: '11,101 MB', metricShort: '11101', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1093/bioinformatics/bty1015'},
      {rank: 3, method: 'pigz', metric: '36,131 MB', metricShort: '36131', lowerIsBetter: true, sourceUrl: 'https://doi.org/10.1093/bioinformatics/bty1015'},
    ],
  },
  {
    id: 'lb-genomic-genozip-fastq',
    title: '基因组格式压缩论文对比（FASTQ）',
    domain: 'genomic',
    mode: 'lossless',
    task: '配对 FASTQ 原始文件归档',
    dataset: 'Genozip paper FASTQ R1+R2 test file（原压缩文件 3.6 GB）',
    datasetVersion: 'Genozip paper Tables 1–2',
    metric: '原始大小 / 压缩大小（ratio）↑',
    protocol: '同一论文测试文件；不纳入可能改变质量值的 optimise 模式。',
    evidence: 'paper',
    presentation: 'comparison',
    sourceName: 'Genozip, Bioinformatics 2021, Table 2',
    sourceUrl: 'https://doi.org/10.1093/bioinformatics/btab102',
    updatedAt: VERIFIED_AT,
    entries: [
      {rank: 1, method: 'Genozip', year: 2021, metric: '6.8×', metricShort: '6.8', lowerIsBetter: false, sourceUrl: 'https://doi.org/10.1093/bioinformatics/btab102', paperUrl: 'https://doi.org/10.1093/bioinformatics/btab102', codeUrl: 'https://github.com/divonlan/genozip', notes: '仓库源码受商业许可证约束，不等同于 OSI 开源。'},
      {rank: 2, method: 'bwa → CRAM', metric: '5.4×', metricShort: '5.4', lowerIsBetter: false, sourceUrl: 'https://doi.org/10.1093/bioinformatics/btab102', codeUrl: 'https://github.com/samtools/htslib'},
      {rank: 3, method: 'pigz', metric: '4.2×', metricShort: '4.2', lowerIsBetter: false, sourceUrl: 'https://doi.org/10.1093/bioinformatics/btab102'},
    ],
  },
  {
    id: 'lb-structured-pbc-apache',
    title: '机器生成日志压缩论文对比（Apache）',
    domain: 'structured',
    mode: 'lossless',
    task: '按记录随机访问的机器生成日志压缩',
    dataset: 'PBC repository Apache log dataset',
    datasetVersion: 'SIGMOD 2024 paper/repository benchmark',
    metric: '压缩后大小 / 原始大小 ↓',
    protocol: 'Intel Xeon Platinum 8369B；同一数据；README 公布配置。',
    evidence: 'paper',
    presentation: 'comparison',
    sourceName: 'PBC, SIGMOD 2024 benchmark',
    sourceUrl: 'https://github.com/antgroup/pbc',
    updatedAt: VERIFIED_AT,
    entries: [
      {rank: 1, method: 'PBC_FSST', year: 2024, metric: '0.104 · 43.32 MB/s encode · 1909.66 MB/s decode', metricShort: '0.104', lowerIsBetter: true, sourceUrl: 'https://github.com/antgroup/pbc', paperUrl: 'https://doi.org/10.1145/3626732', codeUrl: 'https://github.com/antgroup/pbc'},
      {rank: 2, method: 'PBC', year: 2024, metric: '0.151 · 48.85 MB/s encode · 3140.39 MB/s decode', metricShort: '0.151', lowerIsBetter: true, sourceUrl: 'https://github.com/antgroup/pbc', codeUrl: 'https://github.com/antgroup/pbc'},
      {rank: 3, method: 'FSST', metric: '0.322 · 320.72 MB/s encode · 3039.89 MB/s decode', metricShort: '0.322', lowerIsBetter: true, sourceUrl: 'https://github.com/antgroup/pbc'},
      {rank: 4, method: 'LZ4', metric: '0.349 · 31.31 MB/s encode · 1773.38 MB/s decode', metricShort: '0.349', lowerIsBetter: true, sourceUrl: 'https://github.com/antgroup/pbc'},
      {rank: 5, method: 'Zstd', metric: '0.411 · 12.07 MB/s encode · 343.56 MB/s decode', metricShort: '0.411', lowerIsBetter: true, sourceUrl: 'https://github.com/antgroup/pbc'},
    ],
  },
  {
    id: 'lb-structured-loghub-evidence',
    title: '系统日志压缩证据矩阵（LogHub）',
    domain: 'structured',
    mode: 'lossless',
    task: '模板与变量感知的系统日志压缩',
    dataset: 'LogHub：HDFS、Spark、BGL、Windows 等系统日志',
    datasetVersion: 'LogHub public datasets',
    metric: '压缩比 + 压缩速度',
    protocol: '必须使用相同 LogHub 文件、解析器、分块方式、线程数和后端压缩器。',
    evidence: 'reference',
    presentation: 'registry',
    sourceName: 'LogHub + Logzip + LogPrism',
    sourceUrl: 'https://github.com/logpai/loghub',
    updatedAt: VERIFIED_AT,
    limitations: '解析器和是否分块会显著改变结果；LogPrism 当前为预印本，不能与旧论文摘要数字直接拼成总榜。',
    entries: [
      {method: 'Logzip', year: 2019, metric: '5 个 LogHub 数据集；论文报告 CR 16.2–813.2', sourceUrl: 'https://doi.org/10.1109/ASE.2019.00085', paperUrl: 'https://doi.org/10.1109/ASE.2019.00085', codeUrl: 'https://github.com/logpai/logzip'},
      {method: 'LogPrism', year: 2026, metric: '16 个 LogHub 数据集；需按分块模式复现', sourceUrl: 'https://arxiv.org/abs/2601.17482', paperUrl: 'https://arxiv.org/abs/2601.17482', codeUrl: 'https://github.com/Lycc42/LogPrism'},
      {method: 'PBC', year: 2024, metric: '机器生成记录压缩；包含 Android 与 Apache 日志', sourceUrl: 'https://doi.org/10.1145/3626732', paperUrl: 'https://doi.org/10.1145/3626732', codeUrl: 'https://github.com/antgroup/pbc'},
      {method: 'LeCo', year: 2024, metric: '整数列与序列相关性压缩', sourceUrl: 'https://doi.org/10.1145/3639320', paperUrl: 'https://doi.org/10.1145/3639320', codeUrl: 'https://github.com/yhliu918/Learn-to-Compress', comparable: false, notes: '属于结构化数值列，不与日志文本直接排名。'},
    ],
  },
];

export const LB_DOMAIN_LABELS: Record<LeaderboardDomain, {label: string; emoji: string; datasets: string; description: string}> = {
  general: {label: '通用混合数据', emoji: '🧩', datasets: 'Silesia / lzbench / TurboBench', description: '混合文件集合与通用开源压缩器的无损评测。'},
  text: {label: '文本数据', emoji: '📝', datasets: 'enwik8 / enwik9', description: '官方大文本榜与学习型文本论文协议分开呈现。'},
  image: {label: '图像数据', emoji: '🖼️', datasets: 'Kodak / CLIC', description: '无损 bpsp 与有损固定码率竞赛分别比较。'},
  video: {label: '视频数据', emoji: '🎬', datasets: 'Xiph CIF / JVET CTC / UVG', description: '严格无损、近无损和率失真视频任务严格分离。'},
  audio: {label: '音频数据', emoji: '🎵', datasets: 'MUSDB18 / LibriSpeech / VCTK', description: '以 PCM 完全一致为前提的无损音频评测入口。'},
  scientific: {label: '科学浮点数据', emoji: '🔬', datasets: 'FCBench / SDRBench', description: 'IEEE 754 无损与误差有界有损科学数组分开核验。'},
  timeseries: {label: '时序浮点数据', emoji: 'TS', datasets: 'Gorilla / Chimp / Elf / ALP', description: '流式写入、压缩大小与扫描/点查性能共同评测。'},
  genomic: {label: '基因组数据', emoji: '🧬', datasets: 'FASTQ / FASTA / BAM / CRAM / VCF', description: '按文件格式、测序技术和参考依赖拆分榜单。'},
  pointcloud: {label: '点云与三维几何', emoji: '3D', datasets: 'MPEG CTC / 8iVFB / Owlii', description: '几何与属性、有损与无损、坐标精度分别核验。'},
  structured: {label: '结构化与日志', emoji: '🗃️', datasets: 'LogHub / Apache / Android', description: '日志、机器生成记录与数值列采用不同协议。'},
};

export const LB_MODE_LABELS: Record<LeaderboardMode, string> = {
  lossless: '无损',
  lossy: '有损 / 率失真',
  mixed: '混合口径',
};

export const LB_EVIDENCE_LABELS: Record<LeaderboardEvidence, string> = {
  official: '官方榜单',
  paper: '论文同表',
  engineering: '工程实测',
  reference: '参考 / 待复现',
};

export const LB_PRESENTATION_LABELS: Record<LeaderboardPresentation, string> = {
  ranking: '可直接排名',
  comparison: '同协议对比',
  registry: '证据矩阵',
};
