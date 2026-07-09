export interface ProjectContent {
  projectNameZh: string;
  projectNameEn: string;
  oneSentence: string;
  projectIntro: readonly string[];
  researchRoute: readonly { phase: string; chapters: readonly string[]; goal: string }[];
  coreLiteratureExplanation: readonly { id: string; title: string; reason: string }[];
  statistics: {
    chapterCount: number;
    sectionCount: number;
    publicLiteratureCount: number;
    projectAssetCount: number;
    totalItemCount: number;
  };
}

export const projectContent = {
  "projectNameZh": "压缩算法研图",
  "projectNameEn": "Compression Research Atlas",
  "oneSentence": "围绕多源数据通用无损压缩,建立从理论基础、数据冗余、熵编码、PAQ/CMIX、神经压缩、领域专用压缩到实验复现和算法模块设计的完整研究地图。",
  "projectIntro": [
    "本研图不是单纯收集论文,而是构建一个面向压缩算法调研、实验复现和算法模块设计的研究资料库。",
    "核心技术主线是:数据类型识别 → 可逆预处理 → 概率建模 → 熵编码 → benchmark 评测 → 模块化算法设计。",
    "最终目标是支持文献综述、baseline 实验、PAQ8PX/CMIX 技术拆解、神经压缩评测、可迁移算法模块设计、论文/专利/demo 产出。"
  ],
  "researchRoute": [
    {
      "phase": "阶段1:理论与数据认知",
      "chapters": [
        "01",
        "02",
        "03"
      ],
      "goal": "建立无损压缩基本理论、数据类型和码流机制。"
    },
    {
      "phase": "阶段2:传统与高压缩率系统",
      "chapters": [
        "04",
        "05"
      ],
      "goal": "建立工业 baseline,并拆解 PAQ8PX/CMIX 的高压缩率技术路线。"
    },
    {
      "phase": "阶段3:神经与领域专用扩展",
      "chapters": [
        "06",
        "07",
        "08"
      ],
      "goal": "研究神经概率模型、领域专用压缩和残差/近无损参考方法。"
    },
    {
      "phase": "阶段4:实验可信度与算法模块设计",
      "chapters": [
        "09",
        "10"
      ],
      "goal": "建立 benchmark、复现协议和可迁移算法模块方案。"
    },
    {
      "phase": "阶段5:研究整合与输出",
      "chapters": [
        "11"
      ],
      "goal": "管理任务、数据、baseline、风险、周报、论文、专利和 demo。"
    }
  ],
  "coreLiteratureExplanation": [
    {"id": "LIT-0001", "title": "A Mathematical Theory of Communication", "reason": "信息论奠基:理解熵、码长与最优压缩比。"},
    {"id": "LIT-0006", "title": "A Method for the Construction of Minimum-Redundancy Codes", "reason": "Huffman 编码:经典最优前缀码,几乎所有熵编码的起点。"},
    {"id": "LIT-0007", "title": "Arithmetic Coding for Data Compression", "reason": "算术编码:把概率映射到实数区间,接近熵下界。"},
    {"id": "LIT-0009", "title": "A Universal Algorithm for Sequential Data Compression", "reason": "LZ77:字典压缩的开山之作,所有 LZ 系列祖先。"},
    {"id": "LIT-0012", "title": "A Block-sorting Lossless Data Compression Algorithm", "reason": "BWT:bzip2 等高压缩比系统的核心变换。"},
    {"id": "LIT-0016", "title": "Data Compression Using Adaptive Coding and Partial String Matching", "reason": "PPM:上下文统计建模的经典代表,PAQ/CMIX 的思想前身。"},
    {"id": "LIT-0017", "title": "The Context-Tree Weighting Method: Basic Properties", "reason": "CTW:理论优雅的上下文树加权方法,通向 PAQ 系列。"},
    {"id": "LIT-0018", "title": "Adaptive Weighing of Context Models for Lossless Data Compression", "reason": "PAQ 系列奠基:用神经网络把多个模型混合起来。"},
    {"id": "LIT-0026", "title": "Brotli: A General-Purpose Data Compressor", "reason": "Brotli:现代工业级字典+熵编码组合,文本压缩必看 baseline。"},
    {"id": "LIT-0030", "title": "Zstandard Compression and the application/zstd Media Type", "reason": "Zstd:速度/压缩比平衡的代表,工业最常见 baseline。"},
    {"id": "LIT-0187", "title": "TRACE: A Fast Transformer-based General-Purpose Lossless Compressor", "reason": "TRACE:Transformer 通用无损压缩,神经压缩必读。"},
    {"id": "LIT-0190", "title": "Language Modeling Is Compression", "reason": "LLM 即压缩:连接语言模型与无损压缩的里程碑。"},
    {"id": "LIT-0223", "title": "Practical Full Resolution Learned Lossless Image Compression", "reason": "L3C:实用学习无损图像压缩,图像领域必读。"},
    {"id": "LIT-0033", "title": "Learning Better Lossless Compression Using Lossy Compression", "reason": "用有损先验提升无损:神经压缩的实用思想。"},
    {"id": "LIT-0032", "title": "The LOCO-I Lossless Image Compression Algorithm", "reason": "LOCO-I/JPEG-LS:领域无损图像压缩的代表。"},
    {"id": "LIT-0090", "title": "Silesia Compression Corpus", "reason": "Silesia:现代通用压缩事实标准 benchmark。"},
    {"id": "LIT-0214", "title": "NNLCB: Neural-Network-Based Lossless Compressors Benchmark", "reason": "NNLCB:神经通用压缩评测平台与方法学。"}

  ],
  "statistics": {
    "chapterCount": 11,
    "sectionCount": 88,
    "publicLiteratureCount": 338,
    "projectAssetCount": 62,
    "totalItemCount": 400
  }
} as const;
