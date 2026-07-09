// 研究路线图(Research Roadmap)数据
// 数据基于 projectContent.researchRoute,可在此基础上扩展里程碑、关键问题、产出物等。

export interface RoadmapPhase {
  id: string;
  phaseZh: string;
  phaseEn: string;
  chapters: readonly string[];
  goalZh: string;
  milestones?: readonly string[];
  keyQuestions?: readonly string[];
  deliverables?: readonly string[];
}

export const roadmapData: readonly RoadmapPhase[] = [
  {
    id: 'P1',
    phaseZh: '阶段1:理论与数据认知',
    phaseEn: 'Phase 1: Theory and Data Foundations',
    chapters: ['01', '02', '03'],
    goalZh: '建立无损压缩基本理论、数据类型和码流机制。',
    milestones: [
      '梳理信息论、熵编码、字典/变换、统计建模与上下文建模谱系',
      '建立多源数据(文本/二进制/图像/科学)的冗余模式认知',
      '明确数据类型识别与可逆预处理边界',
    ],
    keyQuestions: [
      '无损压缩的熵极限在哪里?',
      '不同数据类型的冗余模式如何被利用?',
      '上下文建模能带来多大压缩收益?',
    ],
    deliverables: [
      '章节 01–03 文献综述笔记',
      '数据类型识别与可逆预处理候选方案',
    ],
  },
  {
    id: 'P2',
    phaseZh: '阶段2:传统与高压缩率系统',
    phaseEn: 'Phase 2: Classical and High-Ratio Systems',
    chapters: ['04', '05'],
    goalZh: '建立工业 baseline,并拆解 PAQ8PX/CMIX 的高压缩率技术路线。',
    milestones: [
      '完成工业级压缩器(bzip2、zstd、7-zip 等)baseline',
      '拆解 PAQ8PX/CMIX 的混合上下文模型、SE 神经网络、辅助表',
      '对比 SOTA,定位技术差距',
    ],
    keyQuestions: [
      'CMIX 为何能压到接近熵极限?',
      'SE/SSE/RLC 等辅助模块的边际收益如何?',
      '时间-内存-压缩率的最优折中点在哪?',
    ],
    deliverables: [
      'PAQ8PX/CMIX 模块拆解表',
      '传统高压缩率算法 baseline 报告',
    ],
  },
  {
    id: 'P3',
    phaseZh: '阶段3:神经与领域专用扩展',
    phaseEn: 'Phase 3: Neural and Domain-Specific',
    chapters: ['06', '07', '08'],
    goalZh: '研究神经概率模型、领域专用压缩和残差/近无损参考方法。',
    milestones: [
      '调研 NNCP / L3C / DZIP / CompressAI 等神经通用压缩',
      '梳理图像/高位深/医学/科学数据专用压缩管线',
      '评估近无损与残差方法的参考价值',
    ],
    keyQuestions: [
      '神经概率模型 vs 经典混合上下文模型?',
      '领域专用压缩的工程收益是否优于通用方法?',
      '如何利用残差/近无损作为后处理参考?',
    ],
    deliverables: [
      '神经压缩 SOTA 对比表',
      '领域专用压缩候选方案清单',
    ],
  },
  {
    id: 'P4',
    phaseZh: '阶段4:实验可信度与算法设计',
    phaseEn: 'Phase 4: Reproducibility and Algorithm Design',
    chapters: ['09', '10'],
    goalZh: '建立 benchmark、复现协议和可迁移算法模块方案。',
    milestones: [
      '建立 benchmark、复现协议、误差分析流程',
      '输出可迁移压缩器模块化设计草案',
    ],
    keyQuestions: [
      '如何保证不同 baseline 的公平对比?',
      '可迁移模块应优先突破哪个瓶颈?',
    ],
    deliverables: [
      'Benchmark 评测协议 v1',
      '可迁移模块化设计草案',
    ],
  },
  {
    id: 'P5',
    phaseZh: '阶段5:项目总控与交付',
    phaseEn: 'Phase 5: Project Management and Delivery',
    chapters: ['11'],
    goalZh: '管理任务、数据、baseline、风险、周报、论文、专利和 demo。',
    milestones: [
      '建立任务/风险/周报机制',
      '规划论文、专利、demo 产出节奏',
    ],
    deliverables: [
      '周报与风险表',
      '论文/专利/demo 路线图',
    ],
  },
];

export default roadmapData;
