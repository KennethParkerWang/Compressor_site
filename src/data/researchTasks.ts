// 研究任务 - 绑定文献/章节/路线/实验/算法模块
// 状态:未开始 / 进行中 / 已完成 / 已延期 / 已放弃
// 分组:本周阅读 / 待做笔记 / 待下载 PDF / 待跑实验 / 待整理汇报 / 已完成

export type TaskStatus = 'todo' | 'doing' | 'done' | 'delayed' | 'dropped';

export type TaskLane =
  | 'this-week'
  | 'needs-note'
  | 'needs-pdf'
  | 'needs-experiment'
  | 'needs-report'
  | 'completed';

export type TaskRef =
  | { kind: 'paper'; refId: string; label: string }
  | { kind: 'chapter'; refId: string; label: string }
  | { kind: 'path'; refId: string; label: string }
  | { kind: 'experiment'; refId: string; label: string }
  | { kind: 'algo-module'; refId: string; label: string }
  ;

export interface ResearchTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  lane: TaskLane;
  refs: readonly TaskRef[];
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedMinutes: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
}

const daysFromNow = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const isoNow = (): string => new Date().toISOString();

export const researchTasks: ResearchTask[] = [
  {
    id: 't-0001',
    title: '把 Shannon 1948 第 1-3 节读透并写六问笔记',
    description: '重点是熵的下界证明与可达性证明',
    status: 'doing',
    lane: 'this-week',
    refs: [
      { kind: 'paper', refId: 'LIT-0001', label: 'Shannon 1948' },
      { kind: 'chapter', refId: '01', label: '信息论基础' },
    ],
    dueDate: daysFromNow(2),
    startedAt: daysFromNow(-3),
    estimatedMinutes: 240,
    priority: 'high',
    createdAt: isoNow(),
  },
  {
    id: 't-0002',
    title: '下载并阅读 PAQ8PX 源码',
    description: '拆解 SSE / CM / Mixer / WordModel 的输入输出',
    status: 'todo',
    lane: 'this-week',
    refs: [
      { kind: 'paper', refId: 'LIT-0018', label: 'PAQ8PX' },
      { kind: 'path', refId: 'path-paq-cmix', label: 'PAQ/CMIX 路线' },
    ],
    dueDate: daysFromNow(5),
    estimatedMinutes: 360,
    priority: 'normal',
    createdAt: isoNow(),
  },
  {
    id: 't-0003',
    title: '把 Huffman 编码写成可运行 toy',
    description: 'Python 30 行实现 + Calgary 跑一遍',
    status: 'done',
    lane: 'completed',
    refs: [
      { kind: 'paper', refId: 'LIT-0006', label: 'Huffman 1952' },
      { kind: 'experiment', refId: 'exp-toy-huffman', label: 'Toy Huffman' },
    ],
    dueDate: daysFromNow(-2),
    startedAt: daysFromNow(-7),
    completedAt: daysFromNow(-2),
    estimatedMinutes: 180,
    priority: 'high',
    createdAt: isoNow(),
  },
  {
    id: 't-0004',
    title: '在 Silesia 上跑 zstd / bzip3 / paq8px,记 BPB',
    status: 'todo',
    lane: 'needs-experiment',
    refs: [
      { kind: 'experiment', refId: 'exp-silesia-bpb', label: 'Silesia BPB' },
    ],
    dueDate: daysFromNow(7),
    estimatedMinutes: 240,
    priority: 'normal',
    createdAt: isoNow(),
  },
  {
    id: 't-0005',
    title: '下载 DeepZip / NNCP 论文 PDF',
    status: 'doing',
    lane: 'needs-pdf',
    refs: [
      { kind: 'paper', refId: 'LIT-0187', label: 'DeepZip' },    ],
    dueDate: daysFromNow(1),
    estimatedMinutes: 20,
    priority: 'high',
    createdAt: isoNow(),
  },
  {
    id: 't-0006',
    title: '整理本周组会汇报 PPT',
    status: 'todo',
    lane: 'needs-report',
    refs: [
      { kind: 'path', refId: 'path-fundamentals', label: '信息论与熵编码基础' },
    ],
    dueDate: daysFromNow(3),
    estimatedMinutes: 120,
    priority: 'urgent',
    createdAt: isoNow(),
  },
  {
    id: 't-0007',
    title: '把 PPM escape 概率估计的实验复现一遍',
    status: 'delayed',
    lane: 'this-week',
    refs: [
      { kind: 'paper', refId: 'LIT-0016', label: 'PPM' },
      { kind: 'algo-module', refId: 'mod-ppm', label: 'PPM 模块' },
    ],
    dueDate: daysFromNow(-1),
    estimatedMinutes: 300,
    priority: 'normal',
    createdAt: isoNow(),
  },
  {
    id: 't-0008',
    title: '读完 TRACE 2022 写六问',
    status: 'todo',
    lane: 'needs-note',
    refs: [
      { kind: 'paper', refId: 'LIT-0214', label: 'TRACE 2022' },
    ],
    dueDate: daysFromNow(10),
    estimatedMinutes: 360,
    priority: 'normal',
    createdAt: isoNow(),
  },

  // ============================================================
  // 客户项目:腾讯多源无损压缩算法研究 (2026.8 – 2027.2)
  // 受众: 甲方 PM/CTO, ★ = 阶段评审节点,★★ = 最终验收
  // ============================================================

  // === M1 调研 (8 月) ============================
  {
    id: 't-1001',
    title: '【M1】17 篇核心文献精读 (按章节分布 11 章)',
    description: '立项后第一周启动,17 篇覆盖全部 11 章节。',
    status: 'todo', lane: 'this-week',
    refs: [{kind: 'chapter', refId: '01', label: '信息论基础'}],
    dueDate: '2026-08-20', startedAt: '2026-08-03',
    estimatedMinutes: 7200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1002',
    title: '【M1】11 章文献综述 PDF (每章 1 份)',
    description: '按章节结构组织,每章一份 PDF。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-08-20',
    estimatedMinutes: 4800, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1003',
    title: '【M1】站点 v1 (检索版) 上线',
    description: '文献全文 < 10s 找到 + 章节导航 + 文献索引展示。',
    status: 'todo', lane: 'this-week', refs: [],
    dueDate: '2026-08-15', startedAt: '2026-08-01',
    estimatedMinutes: 4800, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1004',
    title: '★【M1 节点】立项书签字评审 8/31',
    description: '甲方 PM 签字。包含目标 / 甘特 / RACI / 风险 / 阶段状态卡模板。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-08-31',
    estimatedMinutes: 240, priority: 'urgent', createdAt: isoNow(),
  },

  // === M2 拆解 (9–11 月) ============================
  {
    id: 't-1101',
    title: '【M2】实验机 + Docker 环境 + Silesia 接入',
    description: '128GB RAM × 2 节点 + Docker 镜像,提前 1 月起预约。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2026-08-31',
    estimatedMinutes: 480, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1102',
    title: '【M2】zstd 全量复现',
    description: 'SOTA 工业 baseline,与 brotli 并行 (1 人 1 路)。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2026-09-30',
    estimatedMinutes: 2400, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1103',
    title: '【M2】brotli 全量复现',
    description: '工业 baseline,9 月底完成交叉评审。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2026-09-30',
    estimatedMinutes: 2400, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1104',
    title: '【M2】工业 baseline 交叉评审纪要 (zstd/brotli)',
    description: '9 月底会议纪要 PDF,甲方可索阅。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-09-30',
    estimatedMinutes: 240, priority: 'normal', createdAt: isoNow(),
  },
  {
    id: 't-1105',
    title: '【M2】PAQ8PX 源码通读 (主路径)',
    description: '架构师位一人只拆不写,2 人,优先编码链。风险等级 ★★★。',
    status: 'todo', lane: 'needs-experiment',
    refs: [{kind: 'chapter', refId: '05', label: 'PAQ8 拆解'}],
    dueDate: '2026-10-31',
    estimatedMinutes: 4800, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1106',
    title: '【M2】CMIX 架构图 + 拆解初稿',
    description: 'PAQ 之外并行,3 人。月度中期评审 (W23)。',
    status: 'todo', lane: 'needs-experiment',
    refs: [{kind: 'chapter', refId: '05', label: 'PAQ/CMIX'}],
    dueDate: '2026-11-15',
    estimatedMinutes: 4800, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1107',
    title: '【M2】TRACE 神经 baseline 复现',
    description: 'Ch06 Transformer 字节流模型,11/15 完成。',
    status: 'todo', lane: 'needs-experiment',
    refs: [{kind: 'paper', refId: 'LIT-0187', label: 'TRACE 2022'}],
    dueDate: '2026-11-15',
    estimatedMinutes: 2400, priority: 'normal', createdAt: isoNow(),
  },
  {
    id: 't-1108',
    title: '【M2】5 baseline 全量数据采集 + 显著性检验',
    description: 'Silesia / enwik8 / CLIC 2025 / 自有集。显著性 ≥ 95%。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2026-11-25',
    estimatedMinutes: 1200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1109',
    title: '【M2】数据基线表 CSV + 对比图表',
    description: '可独立分发,甲方评审必读。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-11-30',
    estimatedMinutes: 480, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1110',
    title: '★【M2 节点】拆解评审 11/30',
    description: '甲方 PM 签字。5 baseline 全量数据 + 拆解报告 + 数据基线表。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-11-30',
    estimatedMinutes: 240, priority: 'urgent', createdAt: isoNow(),
  },

  // === M3 设计 (12 月) ============================
  {
    id: 't-1201',
    title: '【M3】自研模块接口规范 PDF',
    description: '5 个候选模块接口冻结 + 接口契约文档。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-12-15',
    estimatedMinutes: 1200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1202',
    title: '【M3】3–5 个自研模块 MVP (各 ≤ 200 行)',
    description: '至少 1 个押工程落地,而非纯性能 SOTA。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2026-12-25',
    estimatedMinutes: 7200, priority: 'urgent', createdAt: isoNow(),
  },
  {
    id: 't-1203',
    title: '【M3】MVP 单元测试覆盖 ≥ 80%',
    description: 'CI 全绿,接口契约测试就绪。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2026-12-25',
    estimatedMinutes: 1200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1204',
    title: '★【M3 节点】设计评审 12/28',
    description: '甲方 PM 签字。MVP 跑通 + 接口冻结 + 单元测试覆盖达标。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2026-12-28',
    estimatedMinutes: 240, priority: 'urgent', createdAt: isoNow(),
  },

  // === M4 实验 (12 下–1 月) ============================
  {
    id: 't-1301',
    title: '【M4】自研模块全数据集实验 (Silesia / enwik8 / CLIC 2025 / 自有集)',
    description: '4 数据集 × 5 模块 = 20 组实验。分两批:小集 12/31 跑完,全集 1/25 跑完。',
    status: 'todo', lane: 'needs-experiment', refs: [],
    dueDate: '2027-01-25',
    estimatedMinutes: 4800, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1302',
    title: '【M4】单模块消融报告 PDF',
    description: '每个模块的消融对照,1/15 完稿。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-01-15',
    estimatedMinutes: 1200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1303',
    title: '【M4】实验对比报告 v2 (M4 ★ 节点)',
    description: '性能 + 速度双指标对照, SOTA + 工业 baseline + 自研同框。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-01-30',
    estimatedMinutes: 1200, priority: 'urgent', createdAt: isoNow(),
  },
  {
    id: 't-1304',
    title: '【M4】论文初稿 v1 (内部过审)',
    description: '投稿前内部评审,投稿目标 DCC / ICASSP。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-01-30',
    estimatedMinutes: 2400, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1305',
    title: '【M4】发明专利交底书 1–2 件',
    description: 'M4 末交 1–2 件,M5 再补 2–3 件。专利优先于论文提交。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-01-30',
    estimatedMinutes: 1200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1306',
    title: '★【M4 节点】实验评审 1/31',
    description: '甲方 PM/CTO 签字。全模块数据 + 显著性 + 论文初稿 + 专利交底。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-01-31',
    estimatedMinutes: 240, priority: 'urgent', createdAt: isoNow(),
  },

  // === M5 收尾 (2 月) ============================
  {
    id: 't-1401',
    title: '【M5】演示 demo (Web 可视化) + 录屏',
    description: '能让甲方亲自上手体验,2/15 上线。',
    status: 'todo', lane: 'this-week', refs: [],
    dueDate: '2027-02-15',
    estimatedMinutes: 3600, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1402',
    title: '【M5】项目白皮书 PDF',
    description: '可对外演讲用,含技术 / 数据 / 业务三层叙事。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-02-20',
    estimatedMinutes: 1200, priority: 'normal', createdAt: isoNow(),
  },
  {
    id: 't-1403',
    title: '【M5】项目知识库 1 套 (验收包)',
    description: '9 个目录结构 (见草稿 §8)。_meta 含地图/索引/README。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-02-27',
    estimatedMinutes: 1200, priority: 'urgent', createdAt: isoNow(),
  },
  {
    id: 't-1404',
    title: '【M5】专利 2–3 提交 + 论文 2 投稿',
    description: '优先专利 90 天后再投论文。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-02-25',
    estimatedMinutes: 1200, priority: 'high', createdAt: isoNow(),
  },
  {
    id: 't-1405',
    title: '【M5】5 问 1 试验收清单 (移交包)',
    description: '5 问:装 / 验 / 改 / 用 / 扩。1 试:2/27 下午 90 分钟现场走查。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-02-27',
    estimatedMinutes: 240, priority: 'urgent', createdAt: isoNow(),
  },
  {
    id: 't-1406',
    title: '★★【M5 最终节点】移交会议 + 验收 2/28',
    description: '甲方 CTO/部门负责人签字。现场演示 demo + 知识库走查。',
    status: 'todo', lane: 'needs-report', refs: [],
    dueDate: '2027-02-28',
    estimatedMinutes: 360, priority: 'urgent', createdAt: isoNow(),
  },
];

export const taskLaneMeta: Record<
  TaskLane,
  { label: string; hint: string; color: string }
> = {
  'this-week': { label: '本周阅读', hint: '本周要完成的阅读任务', color: 'blue' },
  'needs-note': { label: '待做笔记', hint: '读完还没写六问的', color: 'amber' },
  'needs-pdf': { label: '待下载 PDF', hint: '还没拿到原文 PDF 的', color: 'rose' },
  'needs-experiment': { label: '待跑实验', hint: '需要跑实验验证的', color: 'violet' },
  'needs-report': { label: '待整理汇报', hint: '要整理成 PPT / 笔记 / 群消息', color: 'cyan' },
  completed: { label: '已完成', hint: '已勾选完成的任务', color: 'emerald' },
};

export const taskStatusMeta: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  todo: { label: '未开始', color: 'slate' },
  doing: { label: '进行中', color: 'blue' },
  done: { label: '已完成', color: 'emerald' },
  delayed: { label: '已延期', color: 'rose' },
  dropped: { label: '已放弃', color: 'gray' },
};

export default researchTasks;
