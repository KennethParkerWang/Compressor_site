export type WeeklyReportStatus =
  | 'not-started'
  | 'outline-ready'
  | 'drafting'
  | 'review'
  | 'ready'
  | 'done';

export type WeeklyReportTrack = 'project' | 'literature' | 'data' | 'experiment' | 'delivery';

export interface WeeklyReportMaterial {
  nameZh: string;
  nameEn: string;
  status: WeeklyReportStatus;
}

export interface WeeklyReportItem {
  id: string;
  no: number;
  date: string;
  weekdayZh: string;
  weekdayEn: string;
  time: string;
  durationMinutes: number;
  track: WeeklyReportTrack;
  status: WeeklyReportStatus;
  titleZh: string;
  titleEn: string;
  purposeZh: string;
  purposeEn: string;
  summaryZh: string;
  summaryEn: string;
  agendaZh: string[];
  agendaEn: string[];
  materials: WeeklyReportMaterial[];
  questionsZh: string[];
  questionsEn: string[];
  nextActionsZh: string[];
  nextActionsEn: string[];
  draftZh?: string;
  draftEn?: string;
}

export interface WeeklyReportPrinciple {
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
}

export const FIRST_WEEKLY_REPORT_DATE = '2026-07-10';

export const WEEKLY_REPORT_CADENCE = {
  zh: {
    fixedTime: '每两周周五 14:30-15:30',
    first: '第一次汇报：2026-07-10（周五）14:30-15:30',
    rule: '每次双周会控制在 1 小时内：先讲清楚本轮进展和证据，再集中抛出需要讨论的问题。',
  },
  en: {
    fixedTime: 'Every other Friday 14:30-15:30',
    first: 'First briefing: 2026-07-10 (Friday) 14:30-15:30',
    rule: 'Each biweekly meeting fits into one hour: show progress and evidence first, then focus discussion on open decisions.',
  },
} as const;

export const WEEKLY_REPORT_PRINCIPLES: readonly WeeklyReportPrinciple[] = [
  {
    titleZh: '会前准备',
    titleEn: 'Before the Meeting',
    descZh: '提前整理本周完成内容、页面截图、实验或文献证据、下周计划和需要老师确认的问题。',
    descEn: 'Prepare weekly progress, screenshots, evidence, next actions, and questions that need advisor confirmation.',
  },
  {
    titleZh: '会上展示',
    titleEn: 'During the Meeting',
    descZh: '用网页全屏展示主线内容，重点说明“为什么这样做、做到了什么、卡在哪里、下周怎么推进”。',
    descEn: 'Use fullscreen web presentation to explain why, what changed, blockers, and next-week execution.',
  },
  {
    titleZh: '会后沉淀',
    titleEn: 'After the Meeting',
    descZh: '把反馈沉淀为问题清单、任务项、材料修改点和下一次汇报的跟踪项。',
    descEn: 'Convert feedback into issue lists, tasks, material revisions, and follow-up items for the next briefing.',
  },
];

const defaultMaterials = (
  outline: WeeklyReportStatus = 'outline-ready',
  slides: WeeklyReportStatus = 'not-started',
  evidence: WeeklyReportStatus = 'not-started',
): WeeklyReportMaterial[] => [
  {nameZh: '汇报大纲', nameEn: 'Briefing outline', status: outline},
  {nameZh: '展示页面或截图', nameEn: 'Web page or screenshots', status: evidence},
  {nameZh: 'PPT / 演示稿', nameEn: 'Slides / presentation deck', status: slides},
  {nameZh: '问题与下周行动清单', nameEn: 'Questions and next-action list', status: outline},
];

const DATA_START_DRAFT_ZH = `# 第一次双周会汇报草稿：数据入手

## 0. 开场说明

本次汇报我先不从具体算法开始讲，而是从数据入手。原因是无损压缩最后压得好不好，往往不只取决于后端熵编码或者某一个模型，而是取决于数据里到底有什么冗余、这些冗余以什么尺度出现，以及压缩器能不能在输入阶段把这些结构暴露出来。

所以这次我主要讲三件事：第一，压缩数据可以分成哪些类别；第二，不同类别数据的特点和可压缩来源是什么；第三，数据进入压缩器时有哪些输入形式，各自的优缺点是什么。最后我会提出几个需要讨论确认的问题。

## 1. 为什么先讲数据

无损压缩的目标是精确恢复原始数据，但不同数据的冗余结构差别很大。如果直接把所有数据都当作普通字节流处理，就容易出现两个问题：一是某些数据的结构信息没有被利用，二是不同数据类型混在一起时，一个统一模型可能很难同时兼顾压缩比和速度。

因此我目前的理解是，项目后续可以按照“数据画像 -> 分类路由 -> 专用预处理/模型 -> 统一评价”的思路推进。数据画像不是为了做复杂分类器，而是先回答：这批数据主要由什么组成、哪些类型值得单独处理、哪些类型直接交给通用压缩器即可。

## 2. 压缩数据可以包含哪些类别

### 2.1 通用文本类

文本、源码、日志、配置文件、JSON、XML、CSV 等都属于比较典型的文本类数据。这类数据通常有明显的符号重复、词汇重复、语法结构重复和局部上下文规律。

它的特点是：字符分布不均匀，常见词和常见字段会反复出现；上下文建模通常比较有效；字典匹配、BWT、PPM、PAQ、Brotli 这类方法容易发挥作用。缺点是如果文本中混入大量随机 ID、哈希值、压缩后的 payload 或加密片段，局部可压缩性会下降。

### 2.2 二进制与可执行/对象数据

二进制数据包括可执行文件、库文件、对象文件、序列化对象、协议包、缓存文件等。这类数据不一定能直接用文本语义解释，但往往仍然包含重复结构，比如固定字段、对齐填充、指令模式、表结构、版本号和重复片段。

它的特点是：字节级重复可能存在，但语义边界不明显；整文件压缩可能有效，但盲目按固定块切分可能破坏跨块重复。对于这种数据，LZ 系列、Zstd、LZMA 这类带大窗口或字典机制的方法比较重要。

### 2.3 图像与类图像数据

图像数据的典型特点是二维局部相关性强，相邻像素或相邻通道之间往往有可预测关系。PNG、JPEG-LS、WebP Lossless、FLIF 等都不是只靠通用字节匹配，而是先做预测、过滤、颜色变换或上下文建模，再交给后端编码。

这说明图像类数据如果直接当作普通字节流，有时会漏掉空间相关性。后续如果腾讯数据里包含截图、医学图像、遥感图像或其他二维数组，就需要考虑图像预处理和预测残差，而不是只做通用压缩。

### 2.4 科学数组与数值数据

科学数据常见形式包括浮点数组、传感器序列、时序数据、矩阵、HDF5/NetCDF/FITS 等。它们的冗余不一定表现为字符串重复，而可能表现为数值平滑、相邻采样相关、位平面结构相似、低有效位噪声较多。

这类数据适合讨论 bitshuffle、delta、predictive coding、ZFP 等思路。无损场景下需要严格保证恢复一致；近无损或有损场景可以利用误差界限，但本项目如果强调无损，就要明确哪些变换是完全可逆的。

### 2.5 结构化表格与记录型数据

表格、数据库导出、CSV、Parquet-like 记录、键值日志等数据有明显字段结构。按行压缩和按列压缩会暴露完全不同的冗余：按行保留记录完整性，按列更容易看到同字段取值分布和重复模式。

这类数据的核心问题是：压缩器是否需要识别字段边界。如果能识别字段边界，可以做列重排、字典编码、delta 或类别编码；如果不能识别，就只能退化为通用字节流。

### 2.6 已压缩、加密或随机性强的数据

这类数据包括 ZIP、JPEG、MP4、加密文件、随机采样数据、哈希块等。它们已经接近高熵状态，继续无损压缩的收益通常有限，甚至可能因为 header 和 block 开销变大。

这类数据的重要性在于“识别并绕过”。如果分类路由能识别这类数据，就可以减少无效计算，把时间留给真正可压缩的数据。

## 3. 数据进入压缩器的几种输入形式

### 3.1 整文件输入

整文件输入最简单，压缩器可以利用文件内部的长距离重复，也容易保持元数据和文件边界。它适合归档文件、文本、源码、单个大对象等。

缺点是内存占用可能较高，无法很好支持流式处理；如果文件很大，压缩和解压延迟也会增加。

### 3.2 固定大小块输入

固定块输入是工程上最常见的做法之一，例如 32KB、64KB、128KB 或更大的块。优点是实现简单、便于并行、便于统计速度和延迟，也方便做块级实验。

缺点是块边界可能切断重复结构。如果重复跨块出现，压缩器可能看不到；块太小会降低压缩比，块太大又增加内存和延迟。因此后续需要专门做块大小实验。

### 3.3 可变大小块或内容定义分块

可变块不是按固定字节数切，而是根据内容边界、哈希指纹或结构边界切分。它的优点是更可能保持语义片段完整，适合重复文件、备份、日志和有边界结构的数据。

缺点是实现复杂，切块算法本身会带来开销；如果边界不稳定，也可能影响复现实验和编码/解码同步。

### 3.4 字节流输入

字节流输入适合实时系统和网络传输，数据可以边来边压。它的优点是延迟低，不需要等待完整文件，适合流式处理。

缺点是模型能看到的上下文可能受窗口限制；如果未来需要分类路由，流式场景下很难提前知道后面数据类型。

### 3.5 token、字段或特征序列输入

如果我们先解析数据，把文本切成 token，把表格拆成字段，把图像转成残差或块，把数组转成 bit-plane，那么压缩器接收的就不是原始字节，而是更有结构的中间表示。

优点是能暴露更强的统计规律；缺点是必须保证可逆，且解析器和预处理模块本身会增加复杂度。这个方向适合做项目创新点，但不能一开始做得太重。

## 4. 初步判断

我目前倾向于第一阶段不要直接做复杂模型，而是先建立数据画像和输入实验矩阵。比如同一批数据分别测试整文件、32KB、64KB、128KB、按文件类型分组后的块输入，以及是否做简单预处理。这样可以先回答：压缩收益到底来自数据类型、块大小、预处理，还是来自后端模型。

## 5. 需要讨论确认的问题

1. 数据分类应该按文件扩展名和 MIME 类型划分，还是按可压缩结构划分，例如文本重复、二进制重复、二维相关、数值平滑、高熵随机？
2. 腾讯数据集是否允许我们做文件级扫描和统计画像？是否有隐私、授权或不能保存中间统计的问题？
3. 第一版实验是否先统一使用 32KB、64KB、128KB 三种块粒度？
4. baseline 是否以 paq8px-1 为主，同时补充 Zstd、LZMA、Brotli、gzip 等工程压缩器？
5. 后续“分类路由”能否作为一个明确的技术路线推进：先判断数据类型，再选择不同预处理和压缩策略？

## 6. 会后计划

会后我准备先做三件事：第一，整理 Silesia 和腾讯数据集的数据类型清单；第二，设计数据画像字段，包括文件大小、类型、字节熵、重复率、块间差异、可解析元数据；第三，准备下一次汇报，重点转到数据集整理进度、baseline 运行环境和初步对比实验。`;

const DATA_START_DRAFT_EN = `# First Biweekly Briefing Draft: Starting from Data

This briefing starts from the data side rather than algorithm implementation. The main goal is to clarify data categories, redundancy sources, compressor input forms, and the decisions that need advisor confirmation.

## One-hour structure

1. 5 min: objective and agenda.
2. 15 min: data categories and properties.
3. 15 min: compressor input forms.
4. 15 min: tradeoffs and applicable scenarios.
5. 10 min: discussion points and next actions.

## Main message

Lossless compression performance depends not only on the final entropy coder or model, but also on what redundancy exists in the data, at what scale it appears, and whether the input representation exposes that structure.

## Data categories

- Text, source code, logs, JSON, XML, and CSV: strong token, field, and context repetition.
- Binary and executable-like data: repeated byte patterns, aligned fields, instruction patterns, and structured payloads.
- Image-like data: two-dimensional local correlation, predictable neighboring pixels, color-channel structure, and residual patterns.
- Scientific arrays and numeric data: smoothness, bit-plane regularity, temporal or spatial correlation, and reversible transform opportunities.
- Structured tables and records: column-wise repetition, categorical fields, timestamps, IDs, and schema-level redundancy.
- Already compressed, encrypted, or high-entropy data: limited gain, best handled through detection and bypass.

## Compressor input forms

- Whole-file input: preserves long-range repetition but increases memory and latency.
- Fixed-size blocks: simple, measurable, and parallel-friendly, but may cut useful repeated structures.
- Variable or content-defined chunks: better structural boundaries, but more complex and potentially unstable.
- Byte-stream input: low latency and streaming-friendly, but harder for early classification.
- Token, field, or feature sequence input: exposes stronger statistical structure, but requires reversible preprocessing and careful synchronization.

## Discussion points

1. Should data classification follow file types or redundancy structures?
2. Should Tencent data be profiled at file level first and then routed at block/segment level?
3. Should the first experiment use 32KB, 64KB, and 128KB block sizes?
4. Should baseline comparison include ratio, compression speed, decompression speed, memory, and round-trip correctness?
5. Can classification-routing become a clear technical route for the project?`;

export const weeklyReports: readonly WeeklyReportItem[] = [
  {
    id: 'WR-2026-07-10',
    no: 1,
    date: '2026-07-10',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'data',
    status: 'drafting',
    titleZh: '数据入手：压缩数据分类、输入形式与讨论点',
    titleEn: 'Starting from Data: Compression Data Types, Input Forms, and Discussion Points',
    purposeZh: '从数据侧切入无损压缩项目，说明压缩对象包含哪些类别、不同数据的统计特征与冗余来源，以及压缩器输入形式的优缺点。',
    purposeEn: 'Start the lossless-compression project from the data side: classify data types, explain statistical properties and redundancy sources, and compare compressor input forms.',
    summaryZh: '第一期不急着讲算法实现，而是先把“数据长什么样、为什么能压、以什么形式进压缩器、哪些问题需要老师确认”讲清楚。',
    summaryEn: 'The first briefing does not start from implementation. It clarifies what the data looks like, why it is compressible, how it enters compressors, and what decisions need confirmation.',
    agendaZh: ['5 分钟：本次汇报目标和一小时安排', '15 分钟：压缩数据分类与各类数据特点', '15 分钟：数据进入压缩器的输入形式', '15 分钟：不同输入形式的优缺点和适用场景', '10 分钟：需要讨论确认的问题和下步计划'],
    agendaEn: ['5 min: objective and one-hour agenda', '15 min: data categories and properties', '15 min: compressor input forms', '15 min: tradeoffs and applicable scenarios', '10 min: decisions and next steps'],
    materials: defaultMaterials('drafting', 'not-started', 'outline-ready'),
    questionsZh: ['项目数据分类是否按“通用文件类型”划分，还是按“冗余结构/可压缩特征”划分更合适？', '腾讯数据集是否需要先做文件级分类，再做块级或片段级路由？', '压缩器输入优先采用整文件、固定块、可变块、字节流还是 token/特征序列？', '后续 baseline 对比是否必须同时记录压缩比、压缩速度、解压速度、内存和正确性校验？'],
    questionsEn: ['Should project data be classified by file type or by redundancy/compressibility structure?', 'Should the Tencent dataset use file-level classification first and then block/segment routing?', 'Should compressor input be whole files, fixed blocks, variable blocks, byte streams, or token/feature sequences?', 'Should baseline comparison include ratio, compression speed, decompression speed, memory, and correctness checks?'],
    nextActionsZh: ['整理 Silesia / 腾讯数据集的数据类型清单', '设计数据画像字段：大小、类型、熵、重复率、块级差异、可解析元数据', '确定第一版输入切块与分类路由方案', '为下一次汇报准备数据集整理和 baseline 摸底材料'],
    nextActionsEn: ['Create a data-type inventory for Silesia and Tencent datasets', 'Design data-profiling fields: size, type, entropy, repetition, block differences, parseable metadata', 'Decide the first input chunking and classification-routing plan', 'Prepare dataset organization and baseline scoping for the next briefing'],
    draftZh: DATA_START_DRAFT_ZH,
    draftEn: DATA_START_DRAFT_EN,
  },
  {
    id: 'WR-2026-07-24',
    no: 2,
    date: '2026-07-24',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'literature',
    status: 'not-started',
    titleZh: '文献检索范围与分类体系汇报',
    titleEn: 'Literature Scope and Taxonomy Briefing',
    purposeZh: '汇报无损压缩、上下文建模、熵编码、学习式压缩等方向的检索范围和文献分类方式。',
    purposeEn: 'Report the search scope and taxonomy for lossless compression, context modeling, entropy coding, and learned compression.',
    summaryZh: '重点展示文献库分类逻辑、可引用文献筛选标准、顶刊顶会与经典论文优先级。',
    summaryEn: 'Focus on literature taxonomy, citable-paper screening rules, and priority of top-tier/classic papers.',
    agendaZh: ['文献来源与检索关键词', '文献库分类字段说明', '可引用文献筛选标准', '待精读论文候选清单', '下一周精读计划'],
    agendaEn: ['Search sources and keywords', 'Library fields and taxonomy', 'Citable-paper screening rules', 'Candidate close-reading list', 'Next-week reading plan'],
    materials: defaultMaterials(),
    questionsZh: ['分类是否需要单独区分传统压缩、混合模型和神经压缩？', '综述论文的章节结构是否按算法路线还是应用场景展开？'],
    questionsEn: ['Should taxonomy separate traditional, hybrid, and neural compression?', 'Should the survey be organized by method lineage or application scenario?'],
    nextActionsZh: ['补全重点论文候选表', '整理 5-8 篇优先精读论文', '更新文献导出字段'],
    nextActionsEn: ['Complete candidate paper table', 'Prepare 5-8 priority papers for close reading', 'Update citation export fields'],
  },
  {
    id: 'WR-2026-08-07',
    no: 3,
    date: '2026-08-07',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'literature',
    status: 'not-started',
    titleZh: '重点论文精读与研究地图 v0.1',
    titleEn: 'Close Reading and Research Map v0.1',
    purposeZh: '展示首批重点论文的技术脉络、方法差异和与项目目标的关系。',
    purposeEn: 'Show the first close-reading batch, method differences, and relevance to project goals.',
    summaryZh: '建议重点讲“论文为什么重要、贡献是什么、能不能复现、对项目有什么启发”。',
    summaryEn: 'Explain why each paper matters, its contribution, reproducibility, and project implications.',
    agendaZh: ['首批精读论文列表', '研究地图节点和关系', '方法对比矩阵', '可复现性判断', '潜在创新点记录'],
    agendaEn: ['Close-reading paper list', 'Research-map nodes and relations', 'Method comparison matrix', 'Reproducibility judgment', 'Potential innovation log'],
    materials: defaultMaterials(),
    questionsZh: ['哪些论文应该作为综述主线？', '是否需要把研究地图改成导师汇报专用视图？'],
    questionsEn: ['Which papers should define the survey backbone?', 'Should the research map have a dedicated advisor-briefing view?'],
    nextActionsZh: ['完善研究地图', '输出论文方法对比表', '形成综述目录 v0.1'],
    nextActionsEn: ['Refine the research map', 'Export method comparison matrix', 'Create survey outline v0.1'],
  },
  {
    id: 'WR-2026-08-21',
    no: 4,
    date: '2026-08-21',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'data',
    status: 'not-started',
    titleZh: '数据集准备与 baseline 摸底汇报',
    titleEn: 'Dataset Preparation and Baseline Scoping',
    purposeZh: '汇报 Silesia / 腾讯数据集准备、存储方案、数据检查和 paq8px-1 baseline 摸底计划。',
    purposeEn: 'Report Silesia/Tencent dataset preparation, storage plan, data checks, and paq8px-1 baseline scoping.',
    summaryZh: '重点讲清楚数据从哪里来、怎么存、怎么校验、怎么和 baseline 做同口径对比。',
    summaryEn: 'Clarify data source, storage, validation, and fair baseline comparison protocol.',
    agendaZh: ['数据集来源与状态', '数据存储和版本管理', '数据检查字段', 'baseline 运行环境', '初步实验风险'],
    agendaEn: ['Dataset sources and status', 'Storage and versioning', 'Data-check fields', 'Baseline runtime environment', 'Initial experiment risks'],
    materials: defaultMaterials(),
    questionsZh: ['腾讯数据集是否有固定版本和授权边界？', 'baseline 对比是否只看压缩比，还是同时看速度和内存？'],
    questionsEn: ['Does the Tencent dataset have a fixed version and authorization scope?', 'Should baseline comparison include speed and memory, not only ratio?'],
    nextActionsZh: ['完成数据集整理说明', '建立 baseline 测试脚本清单', '记录硬件与参数配置'],
    nextActionsEn: ['Complete dataset organization note', 'Create baseline script checklist', 'Record hardware and parameters'],
  },
  {
    id: 'WR-2026-09-04',
    no: 5,
    date: '2026-09-04',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'experiment',
    status: 'not-started',
    titleZh: '开源代码复现与初步算法对比',
    titleEn: 'Open-Source Reproduction and Initial Comparison',
    purposeZh: '汇报典型算法代码复现状态、运行问题、初步对比表和后续实验脚本计划。',
    purposeEn: 'Report reproduction status, runtime issues, initial comparison table, and experiment scripting plan.',
    summaryZh: '重点避免只讲“跑了什么”，要讲“结果是否可信、差异来自哪里、下一步怎么统一口径”。',
    summaryEn: 'Go beyond what was run: explain credibility, result differences, and how to unify protocol.',
    agendaZh: ['已尝试复现的算法', '环境与依赖问题', '初步对比结果', '失败案例与原因', '统一测试脚本计划'],
    agendaEn: ['Algorithms attempted', 'Environment and dependency issues', 'Initial comparison results', 'Failure cases and causes', 'Unified testing-script plan'],
    materials: defaultMaterials(),
    questionsZh: ['是否保留失败复现记录作为汇报材料？', '统一评测脚本先覆盖哪些算法？'],
    questionsEn: ['Should failed reproduction records be kept as briefing material?', 'Which algorithms should the unified script cover first?'],
    nextActionsZh: ['整理复现记录', '补齐初步对比实验报告', '确定 baseline 优先级'],
    nextActionsEn: ['Organize reproduction records', 'Complete preliminary comparison report', 'Confirm baseline priority'],
  },
  {
    id: 'WR-2026-09-18',
    no: 6,
    date: '2026-09-18',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'data',
    status: 'not-started',
    titleZh: '数据整理、阶段材料与问题清单',
    titleEn: 'Data Organization, Stage Materials, and Issue List',
    purposeZh: '汇报数据集整理进度、阶段材料结构、当前阻塞问题和 9 月评价体系准备。',
    purposeEn: 'Report dataset organization, stage-material structure, current blockers, and preparation for September evaluation framework.',
    summaryZh: '重点把本阶段所有材料收束成“能验收、能复查、能继续做实验”的形态。',
    summaryEn: 'Consolidate materials into a form that can be accepted, reviewed, and used for experiments.',
    agendaZh: ['数据整理状态', '阶段材料目录', '阻塞问题清单', '9 月评价指标准备', '需要确认的资源'],
    agendaEn: ['Data organization status', 'Stage-material directory', 'Blocker list', 'September metric preparation', 'Resources to confirm'],
    materials: defaultMaterials(),
    questionsZh: ['哪些材料需要在阶段汇报 PPT 中重点展示？', '是否需要提前准备实验结果表格模板？'],
    questionsEn: ['Which materials should be emphasized in the stage deck?', 'Should experiment-result table templates be prepared early?'],
    nextActionsZh: ['固化阶段材料目录', '准备评价指标文档', '把阻塞问题转成任务'],
    nextActionsEn: ['Freeze stage-material directory', 'Prepare metric document', 'Convert blockers into tasks'],
  },
  {
    id: 'WR-2026-10-09',
    no: 7,
    date: '2026-10-09',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'project',
    status: 'not-started',
    titleZh: '技术路线固化前检查',
    titleEn: 'Pre-Freeze Check for Technical Route',
    purposeZh: '对文献、数据、复现和评价指标进行汇总检查，为下一阶段技术路线固化做准备。',
    purposeEn: 'Summarize literature, data, reproduction, and metrics before freezing the next-stage technical route.',
    summaryZh: '重点回答“为什么选择这条路线、还有哪些证据不足、后续要固化什么”。',
    summaryEn: 'Answer why this route is chosen, what evidence is missing, and what must be frozen next.',
    agendaZh: ['研究路线候选', '证据充分性检查', 'baseline 风险', '分类路由初步想法', '后续固化清单'],
    agendaEn: ['Candidate research routes', 'Evidence sufficiency check', 'Baseline risks', 'Initial routing ideas', 'Next-stage freeze list'],
    materials: defaultMaterials(),
    questionsZh: ['技术路线是否更偏传统增强、混合模型还是学习式辅助？', '分类路由是否作为核心创新点推进？'],
    questionsEn: ['Should the route lean toward traditional enhancement, hybrid modeling, or learned assistance?', 'Should classification routing become a core contribution?'],
    nextActionsZh: ['形成技术路线说明 v0.1', '整理 baseline 风险表', '准备阶段评审材料'],
    nextActionsEn: ['Create technical-route note v0.1', 'Organize baseline risk table', 'Prepare stage-review materials'],
  },
  {
    id: 'WR-2026-10-23',
    no: 8,
    date: '2026-10-23',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    track: 'delivery',
    status: 'not-started',
    titleZh: '阶段复盘与 baseline 建设计划',
    titleEn: 'Stage Review and Baseline Construction Plan',
    purposeZh: '复盘前期工作，明确后续评价体系、baseline 脚本和预处理方案建设节奏。',
    purposeEn: 'Review prior work and define the next evaluation framework, baseline scripts, and preprocessing plan.',
    summaryZh: '这一期建议形成一次较正式阶段材料，用于承接后续项目路线固化。',
    summaryEn: 'Prepare a more formal stage package that leads into the next route-finalization phase.',
    agendaZh: ['前期完成情况', '未完成项与原因', 'baseline 建设计划', '评价指标和脚本清单', '下一阶段里程碑'],
    agendaEn: ['Prior completion review', 'Unfinished items and reasons', 'Baseline construction plan', 'Metric and script checklist', 'Next-stage milestones'],
    materials: defaultMaterials(),
    questionsZh: ['阶段材料是否满足导师/甲方展示要求？', 'baseline 建设是否需要拆成单独双周专题持续汇报？'],
    questionsEn: ['Are stage materials ready for advisor/client review?', 'Should baseline construction become a dedicated biweekly briefing thread?'],
    nextActionsZh: ['输出阶段复盘文档', '更新年度计划状态', '确认下一次双周汇报主题'],
    nextActionsEn: ['Produce stage review document', 'Update annual plan status', 'Confirm the next biweekly briefing topic'],
  },
];
