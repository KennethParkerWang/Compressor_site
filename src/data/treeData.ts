export interface ResearchTreeNode {
  id: string;
  titleZh: string;
  titleEn: string;
  type: "chapter" | "section";
  literatureCount: number;
  projectAssetCount: number;
  children?: readonly ResearchTreeNode[];
}

export const treeData = [
  {
    "id": "01",
    "titleZh": "理论基础与历史脉络",
    "titleEn": "Foundations and Historical Lineage",
    "type": "chapter",
    "literatureCount": 24,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "01.1",
        "titleZh": "信息论基础",
        "titleEn": "Information Theory Foundations",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "01.2",
        "titleZh": "熵编码经典",
        "titleEn": "Classical Entropy Coding",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "01.3",
        "titleZh": "字典与变换方法",
        "titleEn": "Dictionary and Transform Methods",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "01.4",
        "titleZh": "统计建模与预测编码",
        "titleEn": "Statistical Modeling and Predictive Coding",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "01.5",
        "titleZh": "上下文建模谱系",
        "titleEn": "Context Modeling Lineage",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "01.6",
        "titleZh": "经典综述与教材",
        "titleEn": "Surveys and Textbooks",
        "type": "section",
        "literatureCount": 6,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "02",
    "titleZh": "数据类型与冗余结构",
    "titleEn": "Data Types and Redundancy Structures",
    "type": "chapter",
    "literatureCount": 42,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "02.1",
        "titleZh": "文本代码与网页数据",
        "titleEn": "Text, Code and Web Data",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "02.2",
        "titleZh": "通用二进制与可执行文件",
        "titleEn": "Generic Binary and Executables",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "02.3",
        "titleZh": "自然图像与RAW图像",
        "titleEn": "Natural Images and RAW Images",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "02.4",
        "titleZh": "高位深与医学影像数据",
        "titleEn": "High Bit-Depth and Medical Images",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "02.5",
        "titleZh": "体数据与多维科学数组",
        "titleEn": "Volumetric Data and Multidimensional Scientific Arrays",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "02.6",
        "titleZh": "天文遥感与科学观测数据",
        "titleEn": "Astronomical, Remote-Sensing and Scientific Observations",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "02.7",
        "titleZh": "表格时序与结构化数据",
        "titleEn": "Tabular, Time-Series and Structured Data",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "02.8",
        "titleZh": "数据诊断与可压缩性分析",
        "titleEn": "Data Diagnostics and Compressibility Analysis",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "02.9",
        "titleZh": "音频与视频信号数据",
        "titleEn": "Audio and Video Signal Data",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "02.10",
        "titleZh": "基因组与生物序列数据",
        "titleEn": "Genomic and Biological Sequence Data",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "02.11",
        "titleZh": "图结构点云与三维几何数据",
        "titleEn": "Graphs, Point Clouds and 3D Geometry",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "02.12",
        "titleZh": "日志数据库与列式存储数据",
        "titleEn": "Logs, Databases and Columnar Storage",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "03",
    "titleZh": "熵编码与码流机制",
    "titleEn": "Entropy Coding and Bitstream Mechanisms",
    "type": "chapter",
    "literatureCount": 17,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "03.1",
        "titleZh": "算术编码与范围编码",
        "titleEn": "Arithmetic Coding and Range Coding",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "03.2",
        "titleZh": "ANS与现代熵编码器",
        "titleEn": "ANS and Modern Entropy Coders",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "03.3",
        "titleZh": "Huffman、Golomb与Rice编码",
        "titleEn": "Huffman, Golomb and Rice Coding",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "03.4",
        "titleZh": "码流格式与解码同步",
        "titleEn": "Bitstream Format and Decoder Synchronization",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "03.5",
        "titleZh": "编码器工程与吞吐优化",
        "titleEn": "Coder Engineering and Throughput Optimization",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "04",
    "titleZh": "通用无损压缩基线",
    "titleEn": "General-Purpose Lossless Compression Baselines",
    "type": "chapter",
    "literatureCount": 11,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "04.1",
        "titleZh": "工业高速压缩器",
        "titleEn": "Industrial High-Speed Compressors",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 0
      },
      {
        "id": "04.2",
        "titleZh": "传统高压缩率压缩器",
        "titleEn": "Classical High-Ratio Compressors",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "04.3",
        "titleZh": "归档格式与容器规范",
        "titleEn": "Archive Formats and Container Specifications",
        "type": "section",
        "literatureCount": 1,
        "projectAssetCount": 0
      },
      {
        "id": "04.4",
        "titleZh": "基准语料与排行榜",
        "titleEn": "Benchmark Corpora and Rankings",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 0
      },
      {
        "id": "04.5",
        "titleZh": "块级流式与去重分块压缩",
        "titleEn": "Block, Streaming and Deduplication-Oriented Compression",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "05",
    "titleZh": "PAQ8PX与上下文混合压缩技术拆解",
    "titleEn": "PAQ8PX and Context-Mixing Compression Dissection",
    "type": "chapter",
    "literatureCount": 83,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "05.1",
        "titleZh": "PAQ总体架构与压缩流程",
        "titleEn": "PAQ Architecture and Compression Pipeline",
        "type": "section",
        "literatureCount": 8,
        "projectAssetCount": 0
      },
      {
        "id": "05.2",
        "titleZh": "位级预测与概率建模",
        "titleEn": "Bit-Level Prediction and Probability Modeling",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "05.3",
        "titleZh": "上下文构造机制",
        "titleEn": "Context Construction Mechanisms",
        "type": "section",
        "literatureCount": 8,
        "projectAssetCount": 0
      },
      {
        "id": "05.4",
        "titleZh": "专家模型库",
        "titleEn": "Expert Model Library",
        "type": "section",
        "literatureCount": 10,
        "projectAssetCount": 0
      },
      {
        "id": "05.5",
        "titleZh": "模型混合器与自适应加权",
        "titleEn": "Model Mixer and Adaptive Weighting",
        "type": "section",
        "literatureCount": 9,
        "projectAssetCount": 0
      },
      {
        "id": "05.6",
        "titleZh": "SSE概率校准与后处理",
        "titleEn": "SSE Probability Calibration and Post-Processing",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "05.7",
        "titleZh": "熵编码与码流输出",
        "titleEn": "Entropy Coding and Bitstream Output",
        "type": "section",
        "literatureCount": 8,
        "projectAssetCount": 0
      },
      {
        "id": "05.8",
        "titleZh": "数据类型专用模型与预处理",
        "titleEn": "Data-Type-Specific Models and Preprocessing",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "05.9",
        "titleZh": "源码实现与模块注释",
        "titleEn": "Source Implementation and Module Annotation",
        "type": "section",
        "literatureCount": 10,
        "projectAssetCount": 0
      },
      {
        "id": "05.10",
        "titleZh": "Benchmark与消融实验",
        "titleEn": "Benchmarks and Ablation Experiments",
        "type": "section",
        "literatureCount": 9,
        "projectAssetCount": 0
      },
      {
        "id": "05.11",
        "titleZh": "可迁移算法模块",
        "titleEn": "Transferable Algorithm Modules",
        "type": "section",
        "literatureCount": 7,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "06",
    "titleZh": "神经通用无损压缩",
    "titleEn": "Neural General-Purpose Lossless Compression",
    "type": "chapter",
    "literatureCount": 41,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "06.1",
        "titleZh": "RNN与早期神经压缩器",
        "titleEn": "RNN and Early Neural Compressors",
        "type": "section",
        "literatureCount": 7,
        "projectAssetCount": 0
      },
      {
        "id": "06.2",
        "titleZh": "Transformer字节流压缩器",
        "titleEn": "Transformer Byte-Stream Compressors",
        "type": "section",
        "literatureCount": 7,
        "projectAssetCount": 0
      },
      {
        "id": "06.3",
        "titleZh": "预训练模型与基础模型压缩",
        "titleEn": "Pretrained and Foundation-Model Compression",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "06.4",
        "titleZh": "概率电路与替代生成模型",
        "titleEn": "Probabilistic Circuits and Alternative Generative Models",
        "type": "section",
        "literatureCount": 7,
        "projectAssetCount": 0
      },
      {
        "id": "06.5",
        "titleZh": "吞吐加速与并行化",
        "titleEn": "Throughput Acceleration and Parallelization",
        "type": "section",
        "literatureCount": 6,
        "projectAssetCount": 0
      },
      {
        "id": "06.6",
        "titleZh": "模型成本与净压缩收益",
        "titleEn": "Model Cost and Net Compression Gain",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "06.7",
        "titleZh": "可复现神经基线",
        "titleEn": "Reproducible Neural Baselines",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "07",
    "titleZh": "领域专用无损压缩",
    "titleEn": "Domain-Specific Lossless Compression",
    "type": "chapter",
    "literatureCount": 27,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "07.1",
        "titleZh": "经典图像无损压缩",
        "titleEn": "Classical Lossless Image Compression",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "07.2",
        "titleZh": "学习式图像无损压缩",
        "titleEn": "Learned Lossless Image Compression",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "07.3",
        "titleZh": "高位深RAW与BitPlane压缩",
        "titleEn": "High Bit-Depth RAW and Bit-Plane Compression",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "07.4",
        "titleZh": "医学图像与DICOM压缩",
        "titleEn": "Medical Images and DICOM Compression",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 0
      },
      {
        "id": "07.5",
        "titleZh": "医学体数据压缩",
        "titleEn": "Medical Volumetric Data Compression",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 0
      },
      {
        "id": "07.6",
        "titleZh": "天文FITS与Rice压缩",
        "titleEn": "Astronomical FITS and Rice Compression",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 0
      },
      {
        "id": "07.7",
        "titleZh": "遥感与高光谱压缩",
        "titleEn": "Remote Sensing and Hyperspectral Compression",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "07.8",
        "titleZh": "科学浮点数据压缩",
        "titleEn": "Scientific Floating-Point Data Compression",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "07.9",
        "titleZh": "结构化二进制表格与时序压缩",
        "titleEn": "Structured Binary, Tables and Time-Series Compression",
        "type": "section",
        "literatureCount": 1,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "08",
    "titleZh": "有损近无损与残差参考",
    "titleEn": "Lossy, Near-Lossless and Residual References",
    "type": "chapter",
    "literatureCount": 21,
    "projectAssetCount": 0,
    "children": [
      {
        "id": "08.1",
        "titleZh": "有损变换先验",
        "titleEn": "Lossy Transform Priors",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "08.2",
        "titleZh": "有损压缩中的熵模型",
        "titleEn": "Entropy Models in Lossy Compression",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "08.3",
        "titleZh": "有损加残差无损框架",
        "titleEn": "Lossy-Plus-Residual Lossless Frameworks",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 0
      },
      {
        "id": "08.4",
        "titleZh": "近无损压缩与误差界",
        "titleEn": "Near-Lossless Compression and Error Bounds",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "08.5",
        "titleZh": "非核心参考方法",
        "titleEn": "Non-Core Reference Methods",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      }
    ]
  },
  {
    "id": "09",
    "titleZh": "数据集评测与复现协议",
    "titleEn": "Datasets, Evaluation and Reproducibility Protocols",
    "type": "chapter",
    "literatureCount": 38,
    "projectAssetCount": 5,
    "children": [
      {
        "id": "09.1",
        "titleZh": "通用压缩语料库",
        "titleEn": "General Compression Corpora",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "09.1.1",
        "titleZh": "Calgary与Canterbury经典语料",
        "titleEn": "Calgary and Canterbury Classical Corpora",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "09.1.2",
        "titleZh": "Silesia语料",
        "titleEn": "Silesia Corpus",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 1
      },
      {
        "id": "09.1.3",
        "titleZh": "大规模混合语料",
        "titleEn": "Large-Scale Mixed Corpora",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 0
      },
      {
        "id": "09.2",
        "titleZh": "图像与医学基准",
        "titleEn": "Image and Medical Benchmarks",
        "type": "section",
        "literatureCount": 7,
        "projectAssetCount": 0
      },
      {
        "id": "09.3",
        "titleZh": "科学与天文基准",
        "titleEn": "Scientific and Astronomical Benchmarks",
        "type": "section",
        "literatureCount": 6,
        "projectAssetCount": 0
      },
      {
        "id": "09.4",
        "titleZh": "神经压缩基准",
        "titleEn": "Neural Compression Benchmarks",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 0
      },
      {
        "id": "09.5",
        "titleZh": "压缩率BPB与吞吐评价指标",
        "titleEn": "Compression Ratio, BPB and Throughput Metrics",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 0
      },
      {
        "id": "09.6",
        "titleZh": "32K_64K_128K块粒度评测",
        "titleEn": "32K/64K/128K Block-Granularity Evaluation",
        "type": "section",
        "literatureCount": 1,
        "projectAssetCount": 2
      },
      {
        "id": "09.7",
        "titleZh": "复现检查表",
        "titleEn": "Reproducibility Checklist",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 1
      },
      {
        "id": "09.8",
        "titleZh": "实验报告模板",
        "titleEn": "Experiment Report Template",
        "type": "section",
        "literatureCount": 4,
        "projectAssetCount": 1
      }
    ]
  },
  {
    "id": "10",
    "titleZh": "算法模块设计与研究假设",
    "titleEn": "Algorithm Module Design and Research Hypotheses",
    "type": "chapter",
    "literatureCount": 34,
    "projectAssetCount": 17,
    "children": [
      {
        "id": "10.1",
        "titleZh": "文件类型识别与路由",
        "titleEn": "File-Type Detection and Routing",
        "type": "section",
        "literatureCount": 7,
        "projectAssetCount": 2
      },
      {
        "id": "10.2",
        "titleZh": "预处理与变换设计",
        "titleEn": "Preprocessing and Transform Design",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 1
      },
      {
        "id": "10.3",
        "titleZh": "上下文专家模型库",
        "titleEn": "Context Expert Model Library",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 2
      },
      {
        "id": "10.4",
        "titleZh": "神经预测器融合",
        "titleEn": "Neural Predictor Fusion",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 2
      },
      {
        "id": "10.5",
        "titleZh": "PAQ式异构数据混合器",
        "titleEn": "PAQ-Style Heterogeneous Data Mixer",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 2
      },
      {
        "id": "10.6",
        "titleZh": "BitPlane与残差模块",
        "titleEn": "Bit-Plane and Residual Modules",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 2
      },
      {
        "id": "10.7",
        "titleZh": "熵编码后端选择",
        "titleEn": "Entropy-Coding Backend Selection",
        "type": "section",
        "literatureCount": 2,
        "projectAssetCount": 1
      },
      {
        "id": "10.8",
        "titleZh": "硬件友好与块级优化",
        "titleEn": "Hardware-Friendly and Block-Level Optimization",
        "type": "section",
        "literatureCount": 5,
        "projectAssetCount": 2
      },
      {
        "id": "10.9",
        "titleZh": "论文专利与Demo想法",
        "titleEn": "Papers, Patents and Demo Ideas",
        "type": "section",
        "literatureCount": 3,
        "projectAssetCount": 3
      }
    ]
  },
  {
    "id": "11",
    "titleZh": "项目需求与研究总控",
    "titleEn": "Project Requirements and Research Master Control",
    "type": "chapter",
    "literatureCount": 0,
    "projectAssetCount": 40,
    "children": [
      {
        "id": "11.1",
        "titleZh": "项目目标与需求边界",
        "titleEn": "Project Goals and Requirement Boundaries",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.2",
        "titleZh": "总体路线图与里程碑",
        "titleEn": "Roadmap and Milestones",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.3",
        "titleZh": "文献库与导入管理",
        "titleEn": "Literature Library and Import Manager",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.4",
        "titleZh": "数据资产与实验环境总控",
        "titleEn": "Data Assets and Experimental Environment Control",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.5",
        "titleZh": "Baseline与算法模块总控",
        "titleEn": "Baseline and Algorithm Module Control",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.6",
        "titleZh": "会议纪要周报与汇报材料",
        "titleEn": "Meeting Notes, Weekly Reports and Presentation Materials",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.7",
        "titleZh": "风险问题与决策记录",
        "titleEn": "Risks, Issues and Decision Records",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      },
      {
        "id": "11.8",
        "titleZh": "论文专利Demo与最终交付物",
        "titleEn": "Papers, Patents, Demo and Final Deliverables",
        "type": "section",
        "literatureCount": 0,
        "projectAssetCount": 5
      }
    ]
  }
] as const;
