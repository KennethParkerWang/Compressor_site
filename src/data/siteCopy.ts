// 站点文案(Site Copy)集中维护
// 仅展示公开、可信、对外可见的叙事,不出现内部核查标记字段。

export interface SiteCopy {
  projectNameZh: string;
  projectNameEn: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  overviewHeading: string;
  overviewDescription: string;
  mapHeading: string;
  mapDescription: string;
  coreHeading: string;
  coreDescription: string;
  reproducibleHeading: string;
  reproducibleDescription: string;
  standardsHeading: string;
  standardsDescription: string;
  databaseHeading: string;
  databaseDescription: string;
  readingPathsHeading: string;
  readingPathsDescription: string;
  algorithmBoardHeading: string;
  algorithmBoardDescription: string;
  oneSentencePosition: string;
}

export const siteCopy: SiteCopy = {
  projectNameZh: '压缩算法研图',
  projectNameEn: 'Compression Research Atlas',
  heroTitle: '压缩算法研图',
  heroSubtitle: 'Compression Research Atlas',
  heroDescription:
    '一个面向无损压缩、神经压缩、领域专用压缩与实验复现的学术阅读地图。',
  overviewHeading: '总览',
  overviewDescription:
    '从理论到工业、从经典到神经,一站式展示多源数据无损压缩的研究地图、统计概览与核心叙事。',
  mapHeading: '思维导图',
  mapDescription:
    '可缩放、可拖拽的研究方向节点图,呈现章节、子方向与典型文献之间的关联。',
  coreHeading: '核心文献',
  coreDescription:
    '高优先级奠基文献与里程碑式工作的精选集合,适合按阅读路径和阶段挑选。',
  reproducibleHeading: '实验复现',
  reproducibleDescription:
    '开源实现、复现脚本、数据集与可运行 benchmark 的资源集合。',
  standardsHeading: '标准与基准',
  standardsDescription:
    '国际/行业标准、Benchmark、参考方法与基线测度。',
  databaseHeading: '文献检索',
  databaseDescription:
    '完整、可搜索、可筛选的文献列表,支持方向、来源、类型等多维检索。',
  readingPathsHeading: '阅读路线',
  readingPathsDescription:
    '为不同背景的读者梳理的 5 条可执行阅读路线,每条路线给出目标、节点、阶段与下一步实验。',
  algorithmBoardHeading: '压缩器流水线',
  algorithmBoardDescription:
    '把"一个压缩器"拆成可学习的流水线模块:文件类型识别、可逆预处理、上下文建模、概率预测、模型混合、概率校准、熵编码、块级优化。',
  oneSentencePosition:
    '一个面向无损压缩、神经压缩、领域专用压缩与实验复现的学术阅读地图。',
};

export default siteCopy;
