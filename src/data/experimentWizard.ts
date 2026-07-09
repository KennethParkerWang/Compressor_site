// 实验向导 - "我想跑一次压缩实验" 的 6 步向导 + 工具栏
import {compressionDatasets, type DatasetDomain} from './datasets';

export interface DatasetEntry {
  id: string;
  name: string;
  category: DatasetDomain;
  sizeHint: string;
  useCase: string;
  source: string;
  description?: string;
  notes?: string;
}

export interface BaselineEntry {
  id: string;
  name: string;
  family: 'gzip' | 'bzip' | 'zstd' | 'xz' | 'paq' | 'zpaq' | 'cmix' | 'nn' | 'specialized';
  compressionLevel: number; // 1-10, 1 最快 10 最压缩
  speedHint: string;
  ratioHint: string;
  notes: string;
  examples?: readonly string[];
}

export interface MetricEntry {
  id: string;
  name: string;
  zh: string;
  description: string;
  formula: string;
  why: string;
}

export interface BlockSize {
  id: string;
  name: string;
  size: string;
  description: string;
  useCase: string;
}

export interface BlockMetricMatrix {
  blockSize: string;
  compressors: readonly { id: string; bpb: number; encodeSpeed: number; decodeSpeed: number; memory: number }[];
}

export const datasets: readonly DatasetEntry[] = [
  ...compressionDatasets.map((dataset) => ({
    id: dataset.id,
    name: dataset.name,
    category: dataset.domain,
    sizeHint: dataset.scale,
    useCase: dataset.benchmarkUse,
    source: dataset.sourceUrl.replace(/^https?:\/\//, ''),
    description: dataset.notes,
    notes: `${dataset.subdomain} · ${dataset.tags.slice(0, 3).join(' / ')}`,
  })),
];

export const baselines: readonly BaselineEntry[] = [
  {id: 'B-LZ4', name: 'LZ4', family: 'specialized', compressionLevel: 2, speedHint: '极快', ratioHint: '低', notes: '实时日志、缓存、内存块 baseline', examples: ['lz4 -9 file file.lz4']},
  {id: 'B-GZIP', name: 'gzip', family: 'gzip', compressionLevel: 6, speedHint: '~250 MB/s', ratioHint: '中', notes: 'DEFLATE 的工业最广实现', examples: ['gzip -6 file']},
  {id: 'B-BROTLI', name: 'Brotli', family: 'specialized', compressionLevel: 7, speedHint: '中', ratioHint: '中高(Web)', notes: 'Web 静态资源和字体压缩 baseline', examples: ['brotli -q 7 file']},
  {id: 'B-BZIP2', name: 'bzip2', family: 'bzip', compressionLevel: 9, speedHint: '~30 MB/s', ratioHint: '中高', notes: 'BWT + Huffman', examples: ['bzip2 -9 file']},
  {id: 'B-BZIP3', name: 'bzip3', family: 'bzip', compressionLevel: 8, speedHint: '中', ratioHint: '中高', notes: '现代 BWT 路线补充 baseline', examples: ['bzip3 -e file']},
  {id: 'B-ZSTD', name: 'zstd', family: 'zstd', compressionLevel: 6, speedHint: '~500 MB/s', ratioHint: '中高', notes: '现代默认选择', examples: ['zstd -6 file']},
  {id: 'B-XZ', name: 'xz', family: 'xz', compressionLevel: 6, speedHint: '~15 MB/s', ratioHint: '高', notes: 'LZMA2 默认', examples: ['xz -6 file']},
  {id: 'B-ZPAQ', name: 'ZPAQ', family: 'zpaq', compressionLevel: 8, speedHint: '慢', ratioHint: '高', notes: '可增量归档 + 上下文混合路线', examples: ['zpaq add archive.zpaq file -method 5']},
  {id: 'B-PAQ8PX', name: 'PAQ8PX', family: 'paq', compressionLevel: 8, speedHint: '~1 MB/s', ratioHint: '极高', notes: '经典 PAQ 系列 SOTA', examples: ['./paq8px file']},
  {id: 'B-CMIX', name: 'CMIX', family: 'cmix', compressionLevel: 9, speedHint: '~0.3 MB/s', ratioHint: '接近熵', notes: '近熵极限实验集大成', examples: ['./cmix file']},
  {id: 'B-NNCP', name: 'NNCP', family: 'nn', compressionLevel: 7, speedHint: '~0.05 MB/s', ratioHint: '极高(大文件)', notes: '可复现神经压缩器', examples: ['./nncp c file out.nncp']},
  {id: 'B-TRACE', name: 'TRACE', family: 'nn', compressionLevel: 6, speedHint: '~0.1 MB/s', ratioHint: '极高', notes: 'Transformer 通用无损', examples: ['trace -i file -o out.trace']},
  {id: 'B-JXL', name: 'JPEG XL lossless', family: 'specialized', compressionLevel: 7, speedHint: '中', ratioHint: '高(图像)', notes: '现代图像无损/有损统一 codec', examples: ['cjxl input.png output.jxl -d 0']},
  {id: 'B-JPEGLS', name: 'JPEG-LS', family: 'specialized', compressionLevel: 5, speedHint: '~80 MB/s', ratioHint: '高(图像)', notes: '医学/卫星常用', examples: ['locop -c file.pgm out.jls']},
  {id: 'B-FLAC', name: 'FLAC', family: 'specialized', compressionLevel: 5, speedHint: '快', ratioHint: '高(音频)', notes: '音频无损 baseline', examples: ['flac -8 file.wav']},
  {id: 'B-FPZIP', name: 'fpzip', family: 'specialized', compressionLevel: 5, speedHint: '~120 MB/s', ratioHint: '高(浮点)', notes: '浮点数组', examples: ['fpzip file.dat']},
  {id: 'B-ZFP', name: 'ZFP', family: 'specialized', compressionLevel: 5, speedHint: '快', ratioHint: '科学数据', notes: '浮点数组无损/近无损/误差有界压缩', examples: ['zfp -i file.dat -z file.zfp']},
  {id: 'B-SZ3', name: 'SZ3', family: 'specialized', compressionLevel: 5, speedHint: '中', ratioHint: '科学数据', notes: '误差有界科学数据压缩 baseline', examples: ['sz3 -f -i input.dat -z output.sz']},
  {id: 'B-CRAM', name: 'CRAM', family: 'specialized', compressionLevel: 6, speedHint: '中', ratioHint: '测序数据', notes: '参考基因组依赖的测序压缩标准', examples: ['samtools view -C -T ref.fa input.bam -o output.cram']},
];

export const blockSizes: readonly BlockSize[] = [
  {id: 'BLK-FULL', name: '整文件', size: 'whole', description: '一次读完全部文件,极限压缩', useCase: '中/小文件、低内存压缩'},
  {id: 'BLK-32K', name: '32 KB', size: '32768', description: '通用压缩默认,延迟友好', useCase: '流式、低延迟'},
  {id: 'BLK-64K', name: '64 KB', size: '65536', description: '中庸选择,大部分场景够用', useCase: '通用默认'},
  {id: 'BLK-128K', name: '128 KB', size: '131072', description: '更大上下文,压缩率更高', useCase: '大文件、离线压缩'},
];

export const metrics: readonly MetricEntry[] = [
  {
    id: 'M-BPB',
    name: 'BPB (Bits per Byte)',
    zh: '比特/字节',
    description: '每字节消耗多少比特。BPB 越低,压缩率越高。',
    formula: 'BPB = compressed_bits / original_bytes',
    why: '不同压缩器在不同语料上的对比,统一用 BPB 比压缩比更稳定。',
  },
  {
    id: 'M-RATIO',
    name: 'Compression Ratio',
    zh: '压缩比',
    description: '原始大小与压缩大小的比值。2.0x 表示压后是原来一半。',
    formula: 'ratio = original_size / compressed_size',
    why: '更直观的"省了多少"指标,与 BPB 等价: BPB = 8 / ratio。',
  },
  {
    id: 'M-ENCSPEED',
    name: 'Encode Speed',
    zh: '编码速度',
    description: '每秒编码多少 MB 输入。数值越高吞吐越好。',
    formula: 'encode_speed = original_MB / encode_seconds',
    why: '工业部署关心吞吐,神经压缩通常编码慢、解码快。',
  },
  {
    id: 'M-DECSPEED',
    name: 'Decode Speed',
    zh: '解码速度',
    description: '每秒解码多少 MB 压缩流。',
    formula: 'decode_speed = original_MB / decode_seconds',
    why: '用户场景对解码更敏感(打开一次 vs 压缩一次)。',
  },
  {
    id: 'M-MEM',
    name: 'Peak Memory',
    zh: '内存峰值',
    description: '压缩或解压过程中的最大内存占用。',
    formula: 'peak_memory = RSS_max(rss)',
    why: '流式场景下内存峰值决定能否处理大文件。',
  },
  {
    id: 'M-BITEXACT',
    name: 'Bit-exact',
    zh: '比特一致性',
    description: '解压结果与原文件逐字节相同。',
    formula: 'bit_exact = sha256(decode(input)) == sha256(original)',
    why: '神经压缩或近似无损场景需要明确这点,不能拍脑袋说"无损"。',
  },
];

/** 块大小 × 压缩器 的示意结果矩阵(BPB) - 示例数据,非真实评测 */
export const blockMatrixDemo: readonly BlockMetricMatrix[] = [
  {
    blockSize: '32K',
    compressors: [
      {id: 'B-GZIP', bpb: 3.21, encodeSpeed: 250, decodeSpeed: 320, memory: 0.5},
      {id: 'B-ZSTD', bpb: 2.61, encodeSpeed: 500, decodeSpeed: 850, memory: 1.2},
      {id: 'B-PAQ8PX', bpb: 1.78, encodeSpeed: 1.0, decodeSpeed: 1.4, memory: 18},
      {id: 'B-CMIX', bpb: 1.62, encodeSpeed: 0.3, decodeSpeed: 0.4, memory: 38},
    ],
  },
  {
    blockSize: '64K',
    compressors: [
      {id: 'B-GZIP', bpb: 3.15, encodeSpeed: 250, decodeSpeed: 320, memory: 0.5},
      {id: 'B-ZSTD', bpb: 2.55, encodeSpeed: 480, decodeSpeed: 820, memory: 1.6},
      {id: 'B-PAQ8PX', bpb: 1.71, encodeSpeed: 1.0, decodeSpeed: 1.4, memory: 18},
      {id: 'B-CMIX', bpb: 1.55, encodeSpeed: 0.3, decodeSpeed: 0.4, memory: 38},
    ],
  },
  {
    blockSize: '128K',
    compressors: [
      {id: 'B-GZIP', bpb: 3.10, encodeSpeed: 240, decodeSpeed: 310, memory: 0.6},
      {id: 'B-ZSTD', bpb: 2.49, encodeSpeed: 450, decodeSpeed: 800, memory: 2.1},
      {id: 'B-PAQ8PX', bpb: 1.66, encodeSpeed: 0.9, decodeSpeed: 1.3, memory: 19},
      {id: 'B-CMIX', bpb: 1.50, encodeSpeed: 0.28, decodeSpeed: 0.38, memory: 39},
    ],
  },
];

export interface ReproducibilityChecklistItem {
  id: string;
  text: string;
  description: string;
}

export const reproducibilityChecklist: readonly ReproducibilityChecklistItem[] = [
  {id: 'RC-1', text: '固定数据集 SHA256', description: '记录每个评测语料的 SHA256,确保数据没换过。'},
  {id: 'RC-2', text: '固定压缩器版本', description: '记录压缩器版本号 (gzip 1.12, paq8px v43)。'},
  {id: 'RC-3', text: '记录硬件 + OS', description: 'CPU 型号、内存大小、操作系统、内核版本。'},
  {id: 'RC-4', text: '记录压缩参数', description: '压缩级别、字典大小、上下文窗口、块大小。'},
  {id: 'RC-5', text: '保存输出日志', description: '保存 encode/decode 的 stdout / stderr,作为附件。'},
  {id: 'RC-6', text: '校验 bit-exact', description: '解出来的文件必须 sha256 一致,这是无损压缩的硬约束。'},
  {id: 'RC-7', text: '跑 3 次取中位数', description: '吞吐/内存波动很大,3 次中位数更稳定。'},
  {id: 'RC-8', text: '写结果到 Result Matrix', description: '结构化记录到 Result Matrix,与历史数据对比。'},
];

export const experimentWizardSteps = [
  {id: 1, title: '选择数据集', help: '你要压什么文件?不同语料对不同压缩器影响巨大。'},
  {id: 2, title: '选择压缩器', help: '通用 / PAQ / 神经 / 领域专用,按目标吞吐和压缩率权衡。'},
  {id: 3, title: '选择块大小', help: '整文件压缩率最高但内存大,分块则吞吐好。32K/64K/128K 通用。'},
  {id: 4, title: '选择指标', help: 'BPB 必选,吞吐、内存视场景加,bit-exact 是无损底线。'},
  {id: 5, title: '生成命令', help: '按前面选择生成可执行命令,直接复制运行。'},
  {id: 6, title: '记录结果', help: '把 BPB/吞吐/内存填进 Result Matrix,便于长期对比。'},
] as const;

export default {
  datasets,
  baselines,
  blockSizes,
  metrics,
  blockMatrixDemo,
  reproducibilityChecklist,
  experimentWizardSteps,
};
