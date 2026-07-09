export type TutorialStage = 'entry' | 'intermediate' | 'advanced';
export type TutorialDifficulty = 'intro' | 'intermediate' | 'advanced';

export type TutorialResourceCategory =
  | 'foundation'
  | 'dataset'
  | 'algorithm'
  | 'implementation'
  | 'frontier'
  | 'standards'
  | 'benchmark'
  | 'course';

export type TutorialResourceMedia =
  | 'article'
  | 'docs'
  | 'spec'
  | 'course'
  | 'video'
  | 'benchmark'
  | 'code'
  | 'paper-guide';

export type TutorialResourceLevel = 'intro' | 'intermediate' | 'advanced' | 'reference';

export type TutorialResourceQuality =
  | 'official'
  | 'university'
  | 'author'
  | 'standard'
  | 'community'
  | 'benchmark';

export interface TutorialResource {
  id: string;
  title: string;
  subtitle: string;
  category: TutorialResourceCategory;
  media: TutorialResourceMedia;
  quality: TutorialResourceQuality;
  level: TutorialResourceLevel;
  language: 'EN' | 'ZH' | 'Mixed';
  source: string;
  publisher: string;
  url: string;
  year?: string;
  duration?: string;
  coverTone: 'blue' | 'cyan' | 'green' | 'purple' | 'amber' | 'rose' | 'slate' | 'indigo';
  topics: string[];
  useFor: string[];
  prerequisites?: string[];
  verifiedOn: string;
}

export const TUTORIAL_CATEGORY_META: Record<TutorialResourceCategory, {
  label: string;
  shortLabel: string;
  description: string;
}> = {
  foundation: {
    label: '通用教程',
    shortLabel: '通用',
    description: '信息论、熵编码、字典压缩、压缩管线与基本评测方法。',
  },
  dataset: {
    label: '数据与基准说明',
    shortLabel: '数据',
    description: '常用 corpus、图像/视频/科学数据集、benchmark 入口与使用说明。',
  },
  algorithm: {
    label: '算法拆解',
    shortLabel: '算法',
    description: 'Huffman、LZ、DEFLATE、Brotli、Zstd、ANS、PAQ 等算法与格式拆解。',
  },
  implementation: {
    label: '工程实现',
    shortLabel: '实现',
    description: '官方仓库、库文档、复现实验与编码器实现入口。',
  },
  frontier: {
    label: '前沿教程',
    shortLabel: '前沿',
    description: '学习型图像/视频压缩、神经熵模型、CLIC、CompressAI 与 TensorFlow Compression。',
  },
  standards: {
    label: '格式与标准',
    shortLabel: '标准',
    description: 'RFC、JPEG/MPEG/HTS 等可引用的规范入口。',
  },
  benchmark: {
    label: '评测方法',
    shortLabel: '评测',
    description: '榜单、评测协议、可复现实验记录和压缩指标说明。',
  },
  course: {
    label: '课程与视频',
    shortLabel: '课程',
    description: '大学课程、公开课、会议视频、课程型资料入口。',
  },
};

export const TUTORIAL_MEDIA_LABELS: Record<TutorialResourceMedia, string> = {
  article: '文章',
  docs: '文档',
  spec: '规范',
  course: '课程',
  video: '视频',
  benchmark: 'Benchmark',
  code: '代码',
  'paper-guide': '论文导读',
};

export const TUTORIAL_LEVEL_LABELS: Record<TutorialResourceLevel, string> = {
  intro: '入门',
  intermediate: '进阶',
  advanced: '深入',
  reference: '参考',
};

export const TUTORIAL_QUALITY_LABELS: Record<TutorialResourceQuality, string> = {
  official: '官方',
  university: '课程',
  author: '作者',
  standard: '标准',
  community: '社区',
  benchmark: '基准',
};

export const TUTORIAL_RESOURCES: TutorialResource[] = [
  {
    id: 'TR-001',
    title: 'Stanford EE274 Data Compression Notes',
    subtitle: '大学课程级压缩基础，覆盖信息论、熵编码、字典方法与图像压缩。',
    category: 'foundation',
    media: 'course',
    quality: 'university',
    level: 'intro',
    language: 'EN',
    source: 'Stanford data compression class',
    publisher: 'Stanford',
    url: 'https://stanforddatacompressionclass.github.io/notes/',
    year: '2024',
    duration: '课程资料',
    coverTone: 'blue',
    topics: ['information theory', 'entropy coding', 'dictionary coding', 'image compression'],
    useFor: ['建立课程级知识框架', '制作学习路线', '复核基础术语'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-002',
    title: 'Compression 101',
    subtitle: '面向工程实现的无损压缩入门，适合快速理解编码器管线。',
    category: 'foundation',
    media: 'article',
    quality: 'author',
    level: 'intro',
    language: 'EN',
    source: 'Fabian Giesen / fab-jul resource index',
    publisher: 'GitHub',
    url: 'https://github.com/fab-jul/Compression-101',
    year: '2020+',
    duration: '约 45 分钟',
    coverTone: 'cyan',
    topics: ['lossless compression', 'codec pipeline', 'Huffman', 'LZ'],
    useFor: ['新成员导入', '编码器管线解释', '术语串联'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-003',
    title: 'History of Lossless Data Compression Algorithms',
    subtitle: '从 Shannon 到 LZ、BWT、PPM、PAQ 的历史脉络参考。',
    category: 'foundation',
    media: 'article',
    quality: 'community',
    level: 'reference',
    language: 'EN',
    source: 'Engineering and Technology History Wiki',
    publisher: 'IEEE / ETHW',
    url: 'https://ethw.org/History_of_Lossless_Data_Compression_Algorithms',
    year: 'updated',
    duration: '历史资料',
    coverTone: 'slate',
    topics: ['history', 'Shannon', 'LZ', 'BWT', 'PAQ'],
    useFor: ['算法演化页交叉核对', '写背景综述', '梳理历史节点'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-004',
    title: 'Nayuki: Huffman Coding',
    subtitle: '可读性强的 Huffman 算法说明与代码实现入口。',
    category: 'algorithm',
    media: 'article',
    quality: 'author',
    level: 'intro',
    language: 'EN',
    source: 'Nayuki',
    publisher: 'Nayuki project page',
    url: 'https://www.nayuki.io/page/huffman-coding',
    year: 'updated',
    duration: '约 30 分钟',
    coverTone: 'green',
    topics: ['Huffman coding', 'prefix code', 'entropy coding'],
    useFor: ['解释前缀码', '补充代码阅读', '复核熵编码基础'],
    prerequisites: ['概率分布', '二叉树'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-005',
    title: 'Nayuki: Arithmetic Coding',
    subtitle: '算术编码原理、整数实现和常见误差来源的清晰拆解。',
    category: 'algorithm',
    media: 'article',
    quality: 'author',
    level: 'intermediate',
    language: 'EN',
    source: 'Nayuki',
    publisher: 'Nayuki project page',
    url: 'https://www.nayuki.io/page/reference-arithmetic-coding',
    year: 'updated',
    duration: '约 45 分钟',
    coverTone: 'green',
    topics: ['arithmetic coding', 'range coding', 'integer precision'],
    useFor: ['实现 range coder 前置阅读', '解释概率到码长的关系'],
    prerequisites: ['熵编码', '概率模型'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-006',
    title: 'Interleaved Entropy Coders',
    subtitle: 'ANS 与现代高吞吐 entropy coder 的核心工程背景。',
    category: 'algorithm',
    media: 'article',
    quality: 'author',
    level: 'advanced',
    language: 'EN',
    source: 'Fabian Giesen',
    publisher: 'fgiesen.wordpress.com',
    url: 'https://fgiesen.wordpress.com/2015/12/21/interleaved-entropy-coders/',
    year: '2015',
    duration: '约 60 分钟',
    coverTone: 'purple',
    topics: ['ANS', 'rANS', 'entropy coder', 'throughput'],
    useFor: ['理解 Zstd/FSE 相关背景', '设计熵编码实验', '解释并行化瓶颈'],
    prerequisites: ['算术编码', '二进制流实现'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-007',
    title: 'The Zstandard Format',
    subtitle: '从格式结构、frame、block、literals 到 FSE/Huffman 的工程化解读。',
    category: 'algorithm',
    media: 'article',
    quality: 'author',
    level: 'advanced',
    language: 'EN',
    source: 'Nigel Tao',
    publisher: 'nigeltao.github.io',
    url: 'https://nigeltao.github.io/blog/2022/zstandard-part-1-concepts.html',
    year: '2022',
    duration: '系列文章',
    coverTone: 'indigo',
    topics: ['Zstandard', 'FSE', 'frame format', 'Huffman'],
    useFor: ['阅读 Zstd 格式', '实现解码器结构图', '拆解工业格式'],
    prerequisites: ['Huffman', 'ANS', 'LZ77'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-008',
    title: 'The PAQ Data Compression Programs',
    subtitle: 'PAQ 系列原作者页面，包含版本演进、论文索引与高压缩率路线。',
    category: 'algorithm',
    media: 'article',
    quality: 'author',
    level: 'advanced',
    language: 'EN',
    source: 'Matt Mahoney',
    publisher: 'mattmahoney.net',
    url: 'http://mattmahoney.net/dc/paq.html',
    year: 'updated',
    duration: '参考页',
    coverTone: 'rose',
    topics: ['PAQ', 'context mixing', 'CMIX', 'text compression'],
    useFor: ['补全 PAQ/CMIX 说明', '追踪高压缩率路线', '查找原始论文'],
    prerequisites: ['context modeling', 'arithmetic coding'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-009',
    title: 'RFC 1951: DEFLATE Compressed Data Format',
    subtitle: 'ZIP/gzip/PNG 背后的 DEFLATE 格式规范。',
    category: 'standards',
    media: 'spec',
    quality: 'standard',
    level: 'reference',
    language: 'EN',
    source: 'RFC Editor',
    publisher: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc1951.html',
    year: '1996',
    duration: '规范',
    coverTone: 'slate',
    topics: ['DEFLATE', 'LZ77', 'Huffman', 'format'],
    useFor: ['引用格式规范', '校验算法目录', '解释 zip/gzip 基础'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-010',
    title: 'RFC 1952: GZIP File Format',
    subtitle: 'gzip container、header、CRC 与兼容性的正式规范。',
    category: 'standards',
    media: 'spec',
    quality: 'standard',
    level: 'reference',
    language: 'EN',
    source: 'RFC Editor',
    publisher: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc1952.html',
    year: '1996',
    duration: '规范',
    coverTone: 'slate',
    topics: ['gzip', 'container', 'CRC', 'DEFLATE'],
    useFor: ['引用 gzip 标准', '区分算法与文件格式', '实现文件头解析'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-011',
    title: 'RFC 7932: Brotli Compressed Data Format',
    subtitle: 'Brotli 格式、静态字典和 Web 压缩标准参考。',
    category: 'standards',
    media: 'spec',
    quality: 'standard',
    level: 'reference',
    language: 'EN',
    source: 'RFC Editor',
    publisher: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc7932.html',
    year: '2016',
    duration: '规范',
    coverTone: 'cyan',
    topics: ['Brotli', 'static dictionary', 'web compression'],
    useFor: ['引用 Brotli 格式', '补全 Web 压缩路线', '解释静态字典机制'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-012',
    title: 'RFC 8878: Zstandard Compression and application/zstd',
    subtitle: 'Zstandard 格式与媒体类型的标准入口。',
    category: 'standards',
    media: 'spec',
    quality: 'standard',
    level: 'reference',
    language: 'EN',
    source: 'RFC Editor',
    publisher: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc8878.html',
    year: '2021',
    duration: '规范',
    coverTone: 'indigo',
    topics: ['Zstandard', 'zstd', 'format', 'media type'],
    useFor: ['引用 Zstd 标准', '核验格式字段', '补全工业压缩资料'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-013',
    title: 'Zstandard Documentation',
    subtitle: '官方仓库文档，覆盖格式、命令行、字典训练、压缩级别和 API。',
    category: 'implementation',
    media: 'docs',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'facebook/zstd',
    publisher: 'Meta / GitHub',
    url: 'https://github.com/facebook/zstd/tree/dev/doc',
    year: 'updated',
    duration: '文档集',
    coverTone: 'indigo',
    topics: ['Zstandard', 'dictionary training', 'CLI', 'API'],
    useFor: ['工程复现', '实验参数记录', '数据集字典训练'],
    prerequisites: ['LZ77', 'entropy coding'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-014',
    title: 'Google Brotli Repository',
    subtitle: 'Brotli 官方实现与说明，适合对照 RFC 阅读工程实现。',
    category: 'implementation',
    media: 'code',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'google/brotli',
    publisher: 'Google / GitHub',
    url: 'https://github.com/google/brotli',
    year: 'updated',
    duration: '代码库',
    coverTone: 'cyan',
    topics: ['Brotli', 'web compression', 'static dictionary'],
    useFor: ['工程代码对照', 'Web 压缩实验', '格式实现分析'],
    prerequisites: ['DEFLATE', 'Huffman'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-015',
    title: 'libdeflate',
    subtitle: '高性能 DEFLATE/zlib/gzip 库，可作为速度优化与实现对照。',
    category: 'implementation',
    media: 'code',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'ebiggers/libdeflate',
    publisher: 'GitHub',
    url: 'https://github.com/ebiggers/libdeflate',
    year: 'updated',
    duration: '代码库',
    coverTone: 'green',
    topics: ['DEFLATE', 'gzip', 'zlib', 'performance'],
    useFor: ['速度基线', '实现优化参考', '工程 benchmark'],
    prerequisites: ['DEFLATE', 'C API'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-016',
    title: 'Canterbury Corpus',
    subtitle: '经典文本/混合文件压缩评测 corpus，适合 legacy baseline 对照。',
    category: 'dataset',
    media: 'benchmark',
    quality: 'benchmark',
    level: 'reference',
    language: 'EN',
    source: 'Canterbury corpus',
    publisher: 'University of Canterbury',
    url: 'http://corpus.canterbury.ac.nz/',
    year: '1997+',
    duration: '数据入口',
    coverTone: 'amber',
    topics: ['Canterbury', 'Calgary', 'text benchmark'],
    useFor: ['通用无损压缩 baseline', '实验数据说明', '历史结果复核'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-017',
    title: 'Silesia Corpus',
    subtitle: '211 MB 混合类型 corpus，常用于通用无损压缩器评测。',
    category: 'dataset',
    media: 'benchmark',
    quality: 'benchmark',
    level: 'reference',
    language: 'EN',
    source: 'Silesia Corpus',
    publisher: 'Silesian University of Technology',
    url: 'https://sun.aei.polsl.pl/~sdeor/index.php?page=silesia',
    year: '2003',
    duration: '数据入口',
    coverTone: 'amber',
    topics: ['Silesia', 'mixed corpus', 'lossless benchmark'],
    useFor: ['通用压缩器评测', '速度/压缩率对照', '报告数据集说明'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-018',
    title: 'Large Text Compression Benchmark',
    subtitle: 'Matt Mahoney 维护的 enwik8/enwik9 长期榜单与文本压缩资料入口。',
    category: 'benchmark',
    media: 'benchmark',
    quality: 'benchmark',
    level: 'reference',
    language: 'EN',
    source: 'Matt Mahoney',
    publisher: 'mattmahoney.net',
    url: 'http://mattmahoney.net/dc/text.html',
    year: 'updated',
    duration: '榜单/数据',
    coverTone: 'rose',
    topics: ['enwik8', 'enwik9', 'Hutter Prize', 'text compression'],
    useFor: ['文本压缩 SOTA 对照', 'PAQ/CMIX 查证', '引用 benchmark 规则'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-019',
    title: 'Kodak Lossless True Color Image Suite',
    subtitle: '24 张经典图像测试集，适合图像无损/有损压缩历史对照。',
    category: 'dataset',
    media: 'benchmark',
    quality: 'benchmark',
    level: 'reference',
    language: 'EN',
    source: 'Kodak image suite mirror',
    publisher: 'r0k.us',
    url: 'http://r0k.us/graphics/kodak/',
    year: 'legacy',
    duration: '数据入口',
    coverTone: 'purple',
    topics: ['Kodak', 'image compression', 'legacy benchmark'],
    useFor: ['图像压缩历史 baseline', '可视化结果对照', '实验数据说明'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-020',
    title: 'CompressAI Documentation',
    subtitle: 'PyTorch 学习型图像压缩库，含模型、训练、评估与预训练模型文档。',
    category: 'frontier',
    media: 'docs',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'CompressAI',
    publisher: 'InterDigital',
    url: 'https://interdigitalinc.github.io/CompressAI/',
    year: 'updated',
    duration: '文档集',
    coverTone: 'purple',
    topics: ['learned image compression', 'PyTorch', 'entropy bottleneck', 'pretrained models'],
    useFor: ['学习型压缩复现', '训练脚本设计', '模型 zoo 对照'],
    prerequisites: ['PyTorch', 'rate-distortion'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-021',
    title: 'TensorFlow Compression',
    subtitle: 'Google 维护的 TensorFlow Compression 官方库和文档入口。',
    category: 'frontier',
    media: 'docs',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'tensorflow/compression',
    publisher: 'Google / GitHub',
    url: 'https://github.com/tensorflow/compression',
    year: 'updated',
    duration: '文档/代码',
    coverTone: 'blue',
    topics: ['learned compression', 'TensorFlow', 'entropy model'],
    useFor: ['复核经典学习型压缩实现', '查找 entropy model API', '对照 Ballé 系列实现'],
    prerequisites: ['TensorFlow', '概率模型'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-022',
    title: 'CLIC Challenge',
    subtitle: '学习型图像压缩挑战赛入口，包含任务、数据、评测和年份结果。',
    category: 'frontier',
    media: 'benchmark',
    quality: 'official',
    level: 'reference',
    language: 'EN',
    source: 'Challenge on Learned Image Compression',
    publisher: 'CLIC',
    url: 'https://clic2025.compression.cc/',
    year: '2025',
    duration: '挑战赛入口',
    coverTone: 'purple',
    topics: ['CLIC', 'learned image compression', 'subjective evaluation', 'benchmark'],
    useFor: ['前沿榜单核验', '学习型图像压缩数据说明', '汇报年度变化'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-023',
    title: 'Papers With Code: Image Compression',
    subtitle: '图像压缩任务与论文/代码入口，可用于补充检索但需二次核验。',
    category: 'frontier',
    media: 'paper-guide',
    quality: 'community',
    level: 'reference',
    language: 'EN',
    source: 'Papers With Code',
    publisher: 'Papers With Code',
    url: 'https://paperswithcode.com/task/image-compression',
    year: 'updated',
    duration: '索引',
    coverTone: 'slate',
    topics: ['image compression', 'papers', 'code', 'leaderboard'],
    useFor: ['检索论文入口', '查找代码实现', '作为 Library 补充线索'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-024',
    title: 'Data Compression Conference Proceedings',
    subtitle: 'DCC 会议论文入口，适合追踪传统压缩、图像/视频压缩与新模型。',
    category: 'frontier',
    media: 'paper-guide',
    quality: 'official',
    level: 'advanced',
    language: 'EN',
    source: 'IEEE Computer Society Digital Library',
    publisher: 'IEEE CS',
    url: 'https://www.computer.org/csdl/proceedings/dcc',
    year: 'annual',
    duration: '会议论文',
    coverTone: 'blue',
    topics: ['DCC', 'conference', 'compression research'],
    useFor: ['检索顶会论文', '补充 Library', '整理年度研究动态'],
    prerequisites: ['阅读论文能力'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-025',
    title: 'JPEG XL Reference Implementation',
    subtitle: 'JPEG XL 官方参考实现，适合图像压缩工程与标准化路线对照。',
    category: 'implementation',
    media: 'code',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'libjxl',
    publisher: 'JPEG XL / GitHub',
    url: 'https://github.com/libjxl/libjxl',
    year: 'updated',
    duration: '代码库',
    coverTone: 'purple',
    topics: ['JPEG XL', 'image codec', 'lossless', 'lossy'],
    useFor: ['图像 codec baseline', '标准化实现参考', '工程参数对照'],
    prerequisites: ['图像编码基础'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-026',
    title: 'HTS Specifications: SAM/BAM/CRAM',
    subtitle: '基因组测序数据压缩相关格式规范入口。',
    category: 'standards',
    media: 'spec',
    quality: 'standard',
    level: 'reference',
    language: 'EN',
    source: 'HTS specifications',
    publisher: 'SAMtools',
    url: 'https://samtools.github.io/hts-specs/',
    year: 'updated',
    duration: '规范集',
    coverTone: 'green',
    topics: ['CRAM', 'BAM', 'genomic compression', 'format'],
    useFor: ['领域数据压缩资料', '基因组场景补充', '标准链接引用'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-027',
    title: 'ZFP Documentation',
    subtitle: '浮点数组压缩器 ZFP 的官方文档和模式说明。',
    category: 'implementation',
    media: 'docs',
    quality: 'official',
    level: 'intermediate',
    language: 'EN',
    source: 'LLNL zfp',
    publisher: 'Lawrence Livermore National Laboratory',
    url: 'https://zfp.readthedocs.io/',
    year: 'updated',
    duration: '文档集',
    coverTone: 'amber',
    topics: ['scientific data', 'floating point', 'error bounded compression'],
    useFor: ['科学数据压缩入口', '实验台扩展', '领域算法分类'],
    prerequisites: ['数组数据', '误差界压缩'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-028',
    title: 'SZ3 Compressor',
    subtitle: '误差有界科学数据压缩器官方仓库，适合科学数据方向补充。',
    category: 'implementation',
    media: 'code',
    quality: 'official',
    level: 'advanced',
    language: 'EN',
    source: 'SZ compressor',
    publisher: 'GitHub',
    url: 'https://github.com/szcompressor/SZ3',
    year: 'updated',
    duration: '代码库',
    coverTone: 'amber',
    topics: ['scientific data', 'error bounded', 'SZ3'],
    useFor: ['科学数据压缩算法目录', '实验资源扩展', '领域 benchmark 对照'],
    prerequisites: ['科学数据压缩基础'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-029',
    title: 'Stanford EE274 Lecture Videos',
    subtitle: '与 EE274 课程配套的视频/课程入口，适合按章节补课。',
    category: 'course',
    media: 'video',
    quality: 'university',
    level: 'intro',
    language: 'EN',
    source: 'Stanford data compression class',
    publisher: 'Stanford',
    url: 'https://stanforddatacompressionclass.github.io/',
    year: '2024',
    duration: '课程入口',
    coverTone: 'blue',
    topics: ['course', 'lecture', 'data compression'],
    useFor: ['系统学习', '补充视频讲解', '训练阅读前置知识'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-030',
    title: 'Data Compression Conference Video / Program Entry',
    subtitle: 'DCC 年度会议入口，用于查找 tutorial、talk、program 与论文线索。',
    category: 'course',
    media: 'video',
    quality: 'official',
    level: 'advanced',
    language: 'EN',
    source: 'Data Compression Conference',
    publisher: 'DCC',
    url: 'https://www.data-compression.org/',
    year: 'annual',
    duration: '会议入口',
    coverTone: 'rose',
    topics: ['DCC', 'talks', 'tutorials', 'conference'],
    useFor: ['追踪年度报告', '查找会议视频', '补充研究动态来源'],
    prerequisites: ['压缩研究基础'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-031',
    title: 'quant67: Huffman 编码与 DEFLATE',
    subtitle: '中文工程拆解，覆盖信息熵、Huffman、规范化编码和 DEFLATE 相关实现。',
    category: 'algorithm',
    media: 'article',
    quality: 'community',
    level: 'intermediate',
    language: 'ZH',
    source: 'quant67.com',
    publisher: 'quant67',
    url: 'https://quant67.com/post/algorithms/80-huffman-deflate/huffman-deflate.html',
    year: 'updated',
    duration: '约 60 分钟',
    coverTone: 'green',
    topics: ['Huffman', 'DEFLATE', 'canonical Huffman', '中文教程'],
    useFor: ['中文解释材料', '代码级拆解', '辅助入门者阅读英文规范'],
    prerequisites: ['信息熵', 'C 语言基础'],
    verifiedOn: '2026-07-08',
  },
  {
    id: 'TR-032',
    title: 'Alvin Wan: How Lossless Compression Works',
    subtitle: '工程师视角的 LZ77、Huffman、arithmetic coding 与现代压缩概览。',
    category: 'foundation',
    media: 'article',
    quality: 'author',
    level: 'intro',
    language: 'EN',
    source: 'Alvin Wan',
    publisher: 'alvinwan.com',
    url: 'https://alvinwan.com/how-lossless-compression-works/',
    year: '2024',
    duration: '约 45 分钟',
    coverTone: 'cyan',
    topics: ['LZ77', 'Huffman', 'arithmetic coding', 'zstd'],
    useFor: ['快速建立直觉', '准备分享材料', '跨算法概览'],
    verifiedOn: '2026-07-08',
  },
];

export interface TutorialRef {
  kind: 'tutorial' | 'term' | 'paper' | 'resource' | 'asset';
  id: string;
}

export interface TutorialFigure {
  id: string;
  src: 'svg' | 'url';
  value: string;
  caption: string;
  alt?: string;
  position?: 'before' | 'after' | 'replace';
  source?: string;
  width?: string;
}

export interface TutorialSection {
  id: string;
  type: 'intro' | 'prerequisites' | 'body' | 'intuition' | 'formalization'
      | 'code' | 'comparison' | 'pitfalls' | 'callout' | 'next';
  title: string;
  body?: string;
  calloutType?: 'tip' | 'info' | 'warn' | 'danger' | 'compare';
  items?: Array<{kind: string; id: string; label?: string}>;
  subsections?: TutorialSection[];
  linkedRefs?: TutorialRef[];
  code?: {lang: string; title?: string; content: string};
  figures?: TutorialFigure[];
}

export interface Tutorial {
  id: string;
  title: string;
  subtitle?: string;
  stage: TutorialStage;
  difficulty: TutorialDifficulty;
  estimatedMinutes: number;
  summary: string;
  prerequisites: TutorialRef[];
  linkedTerms: string[];
  linkedPapers: string[];
  linkedResources: string[];
  linkedAssets: string[];
  sections: TutorialSection[];
  commonPitfalls: string[];
  prevId: string | null;
  nextId: string | null;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  codeExamples: Array<{lang: string; title?: string; code: string; note?: string}>;
  comparison?: {title: string; columns: string[]; rows: Array<Record<string, string>>};
}

// Compatibility for historical tutorial detail components. The public /tutorials page now uses
// TUTORIAL_RESOURCES as an external resource directory rather than internal article pages.
export const TUTORIALS: Tutorial[] = [];

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.id === id);
}

export const STAGE_LABELS: Record<TutorialStage, string> = {
  entry: 'Foundation',
  intermediate: 'Core Algorithms',
  advanced: 'Research Practice',
};

export const STAGE_COLORS: Record<TutorialStage, string> = {
  entry: '#059669',
  intermediate: '#2563eb',
  advanced: '#7c3aed',
};

export const DIFFICULTY_LABELS: Record<TutorialDifficulty, string> = {
  intro: 'Intro',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
