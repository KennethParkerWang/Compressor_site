import type {LucideIcon} from 'lucide-react';
import {
  BarChart3,
  BookOpenCheck,
  Boxes,
  Cpu,
  FileCheck2,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  Layers3,
  PackageCheck,
  PenTool,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  Wrench,
} from 'lucide-react';

export type ProjectPlanTone =
  | 'research'
  | 'data'
  | 'model'
  | 'experiment'
  | 'achievement'
  | 'delivery'
  | 'risk';

export type AchievementType = 'review' | 'paper' | 'patent' | 'engineering';
export type MetricStatus = '未开始' | '进行中' | '已完成' | '风险中';

export interface ProjectMetricCard {
  label: string;
  value: string;
  detail: string;
  tone: ProjectPlanTone;
  icon: LucideIcon;
}

export interface AnnualPlanRow {
  month: string;
  position: string;
  mainTasks: string;
  achievementTasks: string;
  deliverables: string;
  tone: ProjectPlanTone;
}

export interface AchievementPlanRow {
  type: AchievementType;
  name: string;
  start: string;
  midNode: string;
  finish: string;
  approach: string;
  outputs: string;
}

export interface ContractMetricRow {
  metric: string;
  target: string;
  plannedTime: string;
  verification: string;
  evidence: string;
  status: MetricStatus;
  tone: ProjectPlanTone;
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  track: '技术研发' | '成果沉淀' | '验收交付';
  tone: ProjectPlanTone;
  deliverable: string;
}

export interface MilestoneRow {
  id: string;
  title: string;
  time: string;
  content: string;
  deliverables: string[];
  tone: ProjectPlanTone;
}

export interface RiskRow {
  risk: string;
  trigger: string;
  impact: string;
  buffer: string;
  owner: string;
  level: '高' | '中' | '低';
}

export const PROJECT_OVERVIEW = {
  title: '高压缩比无损数据压缩算法项目年度研发计划',
  subtitle:
    '面向 Silesia / 腾讯数据集，围绕 paq8px-1 基线对比、数据分类路由、压缩比优化、吞吐时延分析、demo 交付、论文综述与专利成果形成的一年期研发计划。',
  route:
    '文献调研与研究地图构建 → 数据集准备与代码复现 → baseline 与评价体系建设 → 数据预处理与分类路由 → 压缩算法原型设计 → 核心模型开发与系统实验 → 压缩比和吞吐优化 → demo 与工具链交付 → 论文专利成果固化与结题验收',
  period: '2026.07–2027.06',
  acceptance: '2027.06 结题验收',
};

export const PROJECT_METRICS: ProjectMetricCard[] = [
  {
    label: '项目周期',
    value: '2026.07–2027.06',
    detail: '一年期横向科研项目计划',
    tone: 'research',
    icon: Flag,
  },
  {
    label: '核心技术目标',
    value: '优于 paq8px-1',
    detail: '指定数据集平均压缩比对比基线',
    tone: 'model',
    icon: Trophy,
  },
  {
    label: '性能目标',
    value: 'GPU 8–10 MB/s',
    detail: '或 CPU 0.16–0.2 MB/s',
    tone: 'experiment',
    icon: Gauge,
  },
  {
    label: '成果目标',
    value: '综述 1 / 论文 1–2 / 专利 1–2',
    detail: '全过程持续沉淀，不集中后置',
    tone: 'achievement',
    icon: PenTool,
  },
  {
    label: '工程交付',
    value: '源码 / demo / 工具链',
    detail: '测试报告与环境说明同步交付',
    tone: 'delivery',
    icon: PackageCheck,
  },
  {
    label: '数据与基准',
    value: 'Silesia / 腾讯数据集',
    detail: '覆盖公开基准与客户数据评测',
    tone: 'data',
    icon: Layers3,
  },
];

export const PROJECT_ROUTE_STEPS = [
  {label: '文献调研', detail: '研究地图与综述素材库', tone: 'research' as ProjectPlanTone},
  {label: '数据与复现', detail: 'Silesia / 腾讯数据集与开源算法复现', tone: 'data' as ProjectPlanTone},
  {label: '基线体系', detail: 'paq8px-1 与评价指标固化', tone: 'experiment' as ProjectPlanTone},
  {label: '分类路由', detail: '数据预处理与类型识别', tone: 'model' as ProjectPlanTone},
  {label: '核心模型', detail: '压缩算法原型与模型迭代', tone: 'model' as ProjectPlanTone},
  {label: '系统实验', detail: '块粒度、压缩比、吞吐与时延分析', tone: 'experiment' as ProjectPlanTone},
  {label: '成果固化', detail: '论文、专利、demo 与验收材料', tone: 'delivery' as ProjectPlanTone},
];

export const YEAR_MONTHS = [
  '2026.07',
  '2026.08',
  '2026.09',
  '2026.10',
  '2026.11',
  '2026.12',
  '2027.01',
  '2027.02',
  '2027.03',
  '2027.04',
  '2027.05',
  '2027.06',
];

export const ANNUAL_PLAN_ROWS: AnnualPlanRow[] = [
  {
    month: '2026.07',
    position: '文献调研启动与研究范围界定阶段',
    mainTasks:
      '围绕无损压缩、上下文建模、概率预测、熵编码、PAQ 系列、cmix、nncp、深度学习辅助压缩、混合数据压缩等方向开展系统文献检索；优先收集近年顶刊顶会论文和经典代表性算法论文；建立论文分类标签、阅读优先级和技术路线初步框架。',
    achievementTasks:
      '建立综述论文素材库，初步划分综述章节方向，包括传统压缩、上下文混合模型、神经压缩、熵编码、数据集与评价指标、工程实现与硬件友好性。',
    deliverables: '文献资源库、论文分类表、研究方向地图、重点论文候选清单、综述素材库 v0.1。',
    tone: 'research',
  },
  {
    month: '2026.08',
    position: '重点论文精读、阶段汇报、数据集准备与代码复现摸底阶段',
    mainTasks:
      '筛选最相关论文进行精读，分析算法思想、数据集、评价指标、可复现性和与本项目的关联；完成阶段性汇报材料；获取并整理 Silesia / 腾讯数据集；确认数据存储方案；尝试复现典型开源算法或重点论文代码；形成初步算法对比实验。',
    achievementTasks:
      '形成综述论文详细目录；整理重点论文精读笔记；建立论文方法对比矩阵；记录潜在创新点和可改进方向。',
    deliverables: '重点论文精读 PPT、论文方法对比表、数据集整理说明、代码复现记录、初步算法对比实验报告、综述目录 v0.1。',
    tone: 'data',
  },
  {
    month: '2026.09',
    position: '技术路线固化、评价体系建设与 baseline 建设阶段',
    mainTasks:
      '根据文献调研和初步实验结果明确项目技术路线；固化压缩比、吞吐、时延、解压正确性、内存占用等评价指标；建立 paq8px-1 和其他关键 baseline 的统一测试流程；设计数据预处理、数据段/文件分类和压缩模块路由方案。',
    achievementTasks:
      '开始撰写综述论文“研究背景、任务定义、数据集与评价指标”部分；整理 baseline 实验结果，为后续研究论文提供实验基础。',
    deliverables: '项目技术路线说明、评价体系文档、baseline 测试脚本、数据预处理方案、综述论文部分初稿。',
    tone: 'experiment',
  },
  {
    month: '2026.10',
    position: '压缩算法总体框架设计与原型闭环阶段',
    mainTasks:
      '设计完整压缩流程，包括输入、预处理、分类、建模、编码、解码、完整性校验和结果统计；完成第一版压缩/解压原型；确保算法流程在小规模数据上跑通闭环。',
    achievementTasks:
      '撰写综述论文“传统算法与上下文建模方法”部分；建立项目创新点台账，记录可能形成专利或论文创新点的技术方案。',
    deliverables: '算法总体方案、系统框架图、压缩/解压原型 v0.1、闭环测试记录、综述论文阶段稿、创新点台账 v0.1。',
    tone: 'model',
  },
  {
    month: '2026.11',
    position: '数据分类模块与核心压缩模型第一版开发阶段',
    mainTasks:
      '实现文件级和数据段级分类模块；针对文本、二进制、图像/医学类、结构化数据等不同类型数据设计差异化压缩策略；完成核心压缩模型 v1；在 Silesia 数据集上进行初步系统测试。',
    achievementTasks:
      '撰写综述论文“深度学习压缩与混合数据压缩方法”部分；筛选 1–2 个潜在研究论文方向；初步筛选可能申请专利的算法模块或系统流程。',
    deliverables: '数据分类模块、压缩模型 v1、Silesia 初步测试报告、综述论文主体初稿、论文选题候选清单、专利创新点候选清单。',
    tone: 'model',
  },
  {
    month: '2026.12',
    position: 'Silesia 系统实验、块粒度分析与综述初稿形成阶段',
    mainTasks:
      '在 Silesia 数据集上进行系统测试；与 paq8px-1 和其他可复现 baseline 进行对比；完成 32KB、64KB、128KB 粒度下的压缩比、吞吐和时延实验；分析不同块大小对压缩效果和工程性能的影响。',
    achievementTasks:
      '形成综述论文完整初稿；确定研究论文主线和实验设计；对潜在专利点进行新颖性和可实施性初筛。',
    deliverables: 'Silesia 对比实验报告、块粒度实验报告、性能瓶颈分析、综述论文完整初稿、研究论文实验方案、专利创新点筛选记录。',
    tone: 'experiment',
  },
  {
    month: '2027.01',
    position: '腾讯数据集适配、鲁棒性增强与综述修改阶段',
    mainTasks:
      '针对腾讯数据集进行格式适配和数据检查；完善数据分类与路由机制；处理混合数据、小文件、大文件、异常文件等情况；提高压缩和解压稳定性。',
    achievementTasks:
      '根据导师反馈修改综述论文；启动研究论文方法部分撰写；确定至少 1 个优先专利方向。',
    deliverables: '腾讯数据集适配报告、鲁棒性测试报告、压缩模型 v2、综述论文修改稿、研究论文方法框架、专利方向确认表。',
    tone: 'experiment',
  },
  {
    month: '2027.02',
    position: '压缩比专项优化与研究论文实验推进阶段',
    mainTasks:
      '针对低于 paq8px-1 的数据类型进行专项分析；优化上下文建模、概率预测、预处理变换和编码策略；形成高压缩比版本；评估不同数据类型下的收益和代价。',
    achievementTasks:
      '完善研究论文相关工作、方法和实验设置；形成专利交底书初稿；综述论文进入投稿或定稿准备。',
    deliverables: '压缩比优化报告、模型 v2.5、分类型对比实验结果、研究论文部分初稿、专利交底书初稿、综述论文定稿版。',
    tone: 'model',
  },
  {
    month: '2027.03',
    position: '吞吐时延优化、硬件友好改造与论文主实验阶段',
    mainTasks:
      '优化内存访问、批处理、并行计算和 GPU/CPU 执行流程；减少不必要计算；形成高压缩比版本和速度优化版本的对比；统计压缩与解压吞吐。',
    achievementTasks:
      '完成研究论文主要实验图表；完善专利交底书技术方案；根据投稿目标调整综述论文格式和参考文献。',
    deliverables: 'CPU/GPU 性能测试报告、硬件友好性分析、速度优化版本、研究论文主要实验图表、专利交底书修改稿。',
    tone: 'experiment',
  },
  {
    month: '2027.04',
    position: '综合指标冲刺、系统联调、demo 初版与论文初稿阶段',
    mainTasks:
      '完成压缩比、吞吐、时延、解压正确性综合测试；对未达标模块进行专项修正；开发模型调用 demo，实现一键压缩、一键解压、完整性校验和结果统计。',
    achievementTasks:
      '形成研究论文完整初稿；完成专利交底书内部评审稿；根据最终实验补充综述论文中项目相关分析。',
    deliverables: '完整系统 v3、综合测试报告、demo 初版、研究论文完整初稿、专利交底书评审稿。',
    tone: 'delivery',
  },
  {
    month: '2027.05',
    position: '工具链完善、技术文档成型与成果材料固化阶段',
    mainTasks:
      '整理源码、环境配置、工具链、模型调用说明、训练流程和测试流程；完善 demo；汇总最终实验图表和测试结果。',
    achievementTasks:
      '研究论文修改并形成投稿材料；专利交底书定稿或提交；综述论文根据反馈修改；若实验结果充分，启动第二篇研究论文或扩展论文的框架设计。',
    deliverables: '源码说明文档、工具链使用手册、最终实验图表、研究论文投稿稿、专利交底书定稿、综述论文修改稿。',
    tone: 'delivery',
  },
  {
    month: '2027.06',
    position: '结题验收、最终交付与成果提交阶段',
    mainTasks:
      '完成最终版本测试；修复 demo、代码和文档问题；整理最终交付包；准备验收 PPT；提交项目报告、测试报告、代码、demo 等验收材料。',
    achievementTasks:
      '完成论文和专利材料最终提交或归档；整理后续投稿、返修或扩展研究计划。',
    deliverables: '最终项目报告、最终测试报告、源码和工具链、demo、验收 PPT、论文投稿材料、专利材料、后续成果计划。',
    tone: 'delivery',
  },
];

export const ACHIEVEMENT_PLAN_ROWS: AchievementPlanRow[] = [
  {
    type: 'review',
    name: '综述论文',
    start: '2026.07',
    midNode: '2026.12 形成完整初稿；2027.02 形成定稿或投稿版',
    finish: '2027.02–2027.04',
    approach: '从文献调研第一阶段开始同步积累素材，按研究地图组织章节，持续补充最新论文和项目实验认识。',
    outputs: '综述素材库、综述目录、完整初稿、修改稿、投稿版。',
  },
  {
    type: 'paper',
    name: '研究论文 1',
    start: '2026.11–2026.12',
    midNode: '2027.02 完成方法和实验设置；2027.04 形成完整初稿',
    finish: '2027.05–2027.06',
    approach: '以核心模型、压缩比优化、吞吐时延分析或混合数据压缩策略为主要贡献点，跟随系统实验同步形成图表和消融实验。',
    outputs: '论文选题、实验方案、主要实验图表、完整初稿、投稿材料。',
  },
  {
    type: 'paper',
    name: '研究论文 2 / 扩展论文',
    start: '2027.03–2027.04',
    midNode: '2027.05 判断是否具备独立成文条件',
    finish: '2027.06 后续推进或形成初稿框架',
    approach: '根据第一篇研究论文之外的额外创新点决定是否启动，例如硬件友好压缩、块粒度优化、特定类型数据压缩策略等。',
    outputs: '论文方向判断、实验补充计划、初稿框架或后续投稿计划。',
  },
  {
    type: 'patent',
    name: '专利 1',
    start: '2026.10',
    midNode: '2026.12 完成创新点筛选；2027.02 形成交底书初稿；2027.04 完成内部评审稿',
    finish: '2027.05–2027.06',
    approach: '从算法框架和数据分类路由设计阶段开始记录创新点，筛选具有工程可实施性和保护价值的技术方案。',
    outputs: '创新点台账、专利方向确认表、专利交底书初稿、专利交底书定稿。',
  },
  {
    type: 'patent',
    name: '专利 2',
    start: '2027.01–2027.03',
    midNode: '2027.04 判断是否具备申请价值',
    finish: '2027.06 或后续推进',
    approach: '根据模型优化、吞吐时延优化、硬件友好实现或 demo 工具链中的独立创新点决定是否启动。',
    outputs: '创新点评估记录、第二专利方向说明、交底书框架或后续计划。',
  },
  {
    type: 'engineering',
    name: 'demo 与工具链交付',
    start: '2027.04',
    midNode: '2027.05 完成 demo、源码说明、环境配置和工具链使用手册',
    finish: '2027.06 结题验收',
    approach: '跟随系统联调和综合测试同步固化工程资产，确保代码、demo、测试脚本、结果统计和验收材料能够相互对应。',
    outputs: 'demo 初版、源码说明文档、工具链使用手册、最终交付包、验收 PPT。',
  },
];

export const CONTRACT_METRIC_ROWS: ContractMetricRow[] = [
  {
    metric: '压缩比指标',
    target: '指定数据集平均压缩比优于 paq8px-1，对低收益数据类型形成专项分析报告。',
    plannedTime: '2027.02–2027.04',
    verification: 'Silesia / 腾讯数据集统一脚本复跑，记录参数、版本、硬件、数据哈希和结果表。',
    evidence: '分类型对比实验结果、压缩比优化报告、最终性能测试报告。',
    status: '未开始',
    tone: 'model',
  },
  {
    metric: '吞吐与时延指标',
    target: 'GPU 8–10 MB/s 或 CPU 0.16–0.2 MB/s，统计压缩与解压吞吐、时延和内存峰值。',
    plannedTime: '2027.03–2027.04',
    verification: 'CPU/GPU 同环境基准测试，输出吞吐曲线、时延分布和性能瓶颈分析。',
    evidence: 'CPU/GPU 性能测试报告、硬件友好性分析、速度优化版本。',
    status: '未开始',
    tone: 'experiment',
  },
  {
    metric: '数据集与评价体系',
    target: '完成 Silesia / 腾讯数据集获取、整理、存储方案、评价指标和 baseline 测试流程。',
    plannedTime: '2026.08–2026.10',
    verification: '统一数据入口、脚本、结果模板和异常记录；完成 paq8px-1 与关键 baseline 复现。',
    evidence: '数据集整理说明、评价体系文档、baseline 测试脚本、初步实验报告。',
    status: '进行中',
    tone: 'data',
  },
  {
    metric: '解压正确性',
    target: '所有正式实验样本完成 bit-exact 解压验证，异常文件必须单独记录并说明处理策略。',
    plannedTime: '2026.10–2027.04',
    verification: '压缩后解压逐字节比对，记录校验值、失败样本和修复结果。',
    evidence: '闭环测试记录、鲁棒性测试报告、综合测试报告。',
    status: '未开始',
    tone: 'experiment',
  },
  {
    metric: '工程交付',
    target: '交付源码、demo、工具链、模型调用说明、测试报告和验收 PPT。',
    plannedTime: '2027.04–2027.06',
    verification: 'demo 支持一键压缩、一键解压、完整性校验和结果统计；源码与环境说明可复现。',
    evidence: '完整系统 v3、demo 初版、源码说明文档、最终交付包。',
    status: '未开始',
    tone: 'delivery',
  },
  {
    metric: '成果产出',
    target: '形成综述 1 篇、研究论文 1–2 篇、专利 1–2 项，并完成投稿或归档材料。',
    plannedTime: '2026.07–2027.06',
    verification: '按成果推进表检查章节、图表、交底书、投稿稿和归档材料。',
    evidence: '综述投稿版、研究论文投稿材料、专利交底书定稿、后续成果计划。',
    status: '进行中',
    tone: 'achievement',
  },
];

export const GANTT_TASKS: GanttTask[] = [
  {id: 'g1', name: '文献调研与研究地图', start: '2026.07', end: '2026.08', track: '技术研发', tone: 'research', deliverable: '文献资源库、研究方向地图、重点论文候选清单。'},
  {id: 'g2', name: '综述素材库与综述论文', start: '2026.07', end: '2027.04', track: '成果沉淀', tone: 'achievement', deliverable: '综述素材库、完整初稿、修改稿、投稿版。'},
  {id: 'g3', name: '重点论文精读与阶段汇报', start: '2026.07', end: '2026.08', track: '成果沉淀', tone: 'research', deliverable: '重点论文精读 PPT、论文方法对比表。'},
  {id: 'g4', name: '数据集获取与整理', start: '2026.08', end: '2026.09', track: '技术研发', tone: 'data', deliverable: '数据集整理说明、存储方案、数据检查记录。'},
  {id: 'g5', name: '代码复现与初步算法对比', start: '2026.08', end: '2026.09', track: '技术研发', tone: 'data', deliverable: '代码复现记录、初步算法对比实验报告。'},
  {id: 'g6', name: '评价体系与 baseline 建设', start: '2026.09', end: '2026.10', track: '技术研发', tone: 'experiment', deliverable: '评价体系文档、baseline 测试脚本。'},
  {id: 'g7', name: '数据预处理与分类路由', start: '2026.09', end: '2026.11', track: '技术研发', tone: 'model', deliverable: '数据预处理方案、分类路由模块。'},
  {id: 'g8', name: '压缩算法框架设计', start: '2026.10', end: '2026.10', track: '技术研发', tone: 'model', deliverable: '算法总体方案、系统框架图、原型 v0.1。'},
  {id: 'g9', name: '核心压缩模型开发', start: '2026.10', end: '2027.01', track: '技术研发', tone: 'model', deliverable: '压缩模型 v1/v2、鲁棒性测试报告。'},
  {id: 'g10', name: 'Silesia / 腾讯数据集系统实验', start: '2026.12', end: '2027.02', track: '技术研发', tone: 'experiment', deliverable: 'Silesia 对比实验报告、腾讯数据集适配报告。'},
  {id: 'g11', name: '32KB/64KB/128KB 粒度实验', start: '2026.12', end: '2027.01', track: '技术研发', tone: 'experiment', deliverable: '块粒度实验报告、性能瓶颈分析。'},
  {id: 'g12', name: '压缩比优化', start: '2027.01', end: '2027.04', track: '技术研发', tone: 'model', deliverable: '压缩比优化报告、综合测试报告。'},
  {id: 'g13', name: '吞吐和时延优化', start: '2027.02', end: '2027.04', track: '技术研发', tone: 'experiment', deliverable: 'CPU/GPU 性能测试报告、速度优化版本。'},
  {id: 'g14', name: '研究论文 1', start: '2026.12', end: '2027.06', track: '成果沉淀', tone: 'achievement', deliverable: '实验方案、主要实验图表、完整初稿、投稿材料。'},
  {id: 'g15', name: '专利 1', start: '2026.10', end: '2027.06', track: '成果沉淀', tone: 'achievement', deliverable: '创新点台账、交底书初稿、交底书定稿。'},
  {id: 'g16', name: '专利 2 / 扩展成果', start: '2027.03', end: '2027.06', track: '成果沉淀', tone: 'achievement', deliverable: '第二专利方向说明、初稿框架或后续计划。'},
  {id: 'g17', name: 'demo 与工具链', start: '2027.04', end: '2027.05', track: '验收交付', tone: 'delivery', deliverable: 'demo 初版、源码说明文档、工具链使用手册。'},
  {id: 'g18', name: '文档、报告、验收材料', start: '2027.05', end: '2027.06', track: '验收交付', tone: 'delivery', deliverable: '最终项目报告、测试报告、验收 PPT、最终交付包。'},
];

export const MILESTONE_ROWS: MilestoneRow[] = [
  {
    id: 'M1',
    title: '文献调研与研究地图完成',
    time: '2026.07–2026.08',
    content: '完成项目相关论文系统收集、分类、重点论文筛选、精读汇报和综述素材库建设。',
    deliverables: ['文献资源库', '研究地图', '精读 PPT', '综述素材表'],
    tone: 'research',
  },
  {
    id: 'M2',
    title: '数据集与初步基线完成',
    time: '2026.08–2026.09',
    content: '完成 Silesia / 腾讯数据集获取、存储整理、初步数据检查、典型代码复现和初步算法对比。',
    deliverables: ['数据集整理说明', '代码复现记录', '初步实验报告'],
    tone: 'data',
  },
  {
    id: 'M3',
    title: '评价体系与算法原型完成',
    time: '2026.09–2026.10',
    content: '完成评价指标、baseline 测试流程、数据预处理方案和压缩/解压原型闭环。',
    deliverables: ['评价体系文档', 'baseline 脚本', '算法原型', '综述部分初稿'],
    tone: 'model',
  },
  {
    id: 'M4',
    title: '核心模型与系统实验完成',
    time: '2026.11–2027.02',
    content: '完成数据分类模块、核心压缩模型、Silesia / 腾讯数据集系统实验、块粒度分析和综述论文完整初稿。',
    deliverables: ['压缩模型 v2', '系统实验报告', '块粒度实验报告', '综述论文初稿'],
    tone: 'experiment',
  },
  {
    id: 'M5',
    title: '压缩比与性能指标冲刺完成',
    time: '2027.02–2027.04',
    content: '完成压缩比优化、CPU/GPU 吞吐优化、解压正确性验证、综合指标测试、研究论文初稿和专利交底书评审稿。',
    deliverables: ['最终性能测试报告', '综合测试报告', '研究论文初稿', '专利交底书评审稿'],
    tone: 'achievement',
  },
  {
    id: 'M6',
    title: 'demo、文档与结题材料完成',
    time: '2027.04–2027.06',
    content: '完成模型调用 demo、源码工具链、测试报告、论文投稿材料、专利材料和验收 PPT。',
    deliverables: ['最终交付包', 'demo', '验收 PPT', '论文投稿材料', '专利交底书'],
    tone: 'delivery',
  },
];

export const RISK_ROWS: RiskRow[] = [
  {
    risk: '客户数据集获取或授权节奏延迟',
    trigger: '2026.08 末仍未完成数据入口、版本和存储方案确认。',
    impact: '影响腾讯数据集适配、系统实验和结题测试覆盖。',
    buffer: '先以 Silesia 和公开混合数据集完成脚本、指标和 baseline 流程，客户数据到位后进行同口径迁移。',
    owner: '数据与实验负责人',
    level: '高',
  },
  {
    risk: 'paq8px-1 及关键 baseline 复现结果波动',
    trigger: '不同硬件或参数下压缩比、速度和内存结果差异显著。',
    impact: '影响合同指标判断和研究论文对比可信度。',
    buffer: '固定版本、参数、编译选项和硬件配置，保留复跑日志与数据哈希，必要时加入置信区间或多次运行统计。',
    owner: '实验负责人',
    level: '高',
  },
  {
    risk: '压缩比优势不稳定',
    trigger: '部分数据类型持续低于 paq8px-1 或收益不足以支撑研究论文主结论。',
    impact: '影响核心技术指标、论文贡献和验收材料说服力。',
    buffer: '按数据类型拆分瓶颈，分别优化预处理、上下文建模、概率预测和编码策略，保留高压缩比版本与速度优化版本两套路径。',
    owner: '算法负责人',
    level: '高',
  },
  {
    risk: '吞吐时延优化与压缩比优化冲突',
    trigger: '高压缩比版本计算开销过高，无法达到 GPU/CPU 性能目标。',
    impact: '影响工程交付和 demo 可用性。',
    buffer: '建立压缩比优先版、平衡版和速度优先版，分场景报告性能取舍，避免单一模型承担所有指标。',
    owner: '系统负责人',
    level: '中',
  },
  {
    risk: '论文与专利公开顺序冲突',
    trigger: '研究论文投稿材料先于专利交底书完成且包含可保护技术细节。',
    impact: '影响专利新颖性和成果转化路径。',
    buffer: '从 2026.10 起维护创新点台账，论文投稿前进行专利交底检查，公开材料按可公开、待保护、内部三类管理。',
    owner: '成果负责人',
    level: '中',
  },
  {
    risk: '最终验收材料碎片化',
    trigger: '2027.05 前源码、测试报告、demo、论文和专利材料未形成统一索引。',
    impact: '影响结题验收效率和后续移交维护。',
    buffer: '从 2027.04 起按交付清单冻结目录结构，所有材料绑定版本号、责任人、验收证据和维护说明。',
    owner: '项目负责人',
    level: '中',
  },
];

export const QUICK_ANCHORS = [
  {id: 'annual-plan', label: '年度计划', icon: BookOpenCheck},
  {id: 'achievements', label: '成果推进', icon: PenTool},
  {id: 'contract-metrics', label: '指标验收', icon: Scale},
  {id: 'gantt', label: '甘特图', icon: BarChart3},
  {id: 'milestones', label: '里程碑', icon: GitBranch},
  {id: 'risks', label: '风险应对', icon: ShieldCheck},
];

export const SECTION_ICONS = {
  annual: BookOpenCheck,
  achievements: PenTool,
  metrics: Scale,
  gantt: BarChart3,
  milestones: GitBranch,
  risks: ShieldCheck,
  route: Wrench,
  demo: Boxes,
  performance: Timer,
  model: Cpu,
  acceptance: FileCheck2,
  document: FileText,
  spark: Sparkles,
};
