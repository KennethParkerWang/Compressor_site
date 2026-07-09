# PPT 制作说明：无损压缩算法阶段性学习成果汇报

## 生成前自检

- 总页数：20 页
- 风格：科研组会汇报，简洁、专业、清晰，不做商业路演风格。
- 内容主线：资源网站介绍 -> 无损压缩任务理解 -> 数据类型与冗余特点 -> 压缩器核心框架 -> 算法演进谱系 -> 代表压缩器选择 -> Silesia baseline 实验 -> 多维评估 -> 后续研发方向。
- 图片策略：优先使用当前项目网站截图；外部图找不到高质量、可追溯来源时使用 TODO 占位。
- 实验数据策略：当前未发现真实 Silesia 本地实验结果，实验页只做设计页和结果表模板，标注“待补充真实实验结果”。

## 页面结构方案

| 页码 | 页标题 | 核心观点 | 布局类型 | 需要图片 | 图片状态 | 占位策略 |
|---:|---|---|---|---|---|---|
| 1 | 无损压缩算法阶段性学习成果汇报 | 本次汇报是从零散学习进入系统化研究准备 | 总结路线图 | 无 | 不需要 | 使用简洁文本路线 |
| 2 | 这次汇报的定位 | 不是百科、不是 SOTA，而是研究坐标系和实验框架 | 对比表 | 无 | 不需要 | 左右对照 |
| 3 | 我做的资源网站 | Compression Research Atlas 是研究工作台 | 网站截图展示 | website_home.png | 已找到 | 使用当前项目网站截图 |
| 4 | 网站里的真实内容 | 网站已覆盖资源、算法、实验、模块四类能力 | 网站截图展示 | website_hub.png, website_library.png, website_algorithm_board.png, website_experiments.png | 已找到 | 使用当前项目网站截图 |
| 5 | 网站如何支撑复现 | 从资料入口走向 baseline 和可复查记录 | 左文右图 | website_experiments.png | 已找到 | 使用当前项目网站截图 |
| 6 | 无损压缩任务本质 | 完全可逆前提下用更少 bit 表示原始数据 | 上图下文 | 无外部复杂图 | 不需要 | 使用轻量三段式文本 |
| 7 | 压缩器输入不是字符 | 输入应理解为 bit/byte/symbol sequence | 对比表 | 无 | 不需要 | 使用三列表 |
| 8 | 数据类型与冗余特点 | 不同数据的冗余结构决定压缩难度 | 对比表 | 无 | 不需要 | 使用数据类型表 |
| 9 | 为什么选择 Silesia | Silesia 是混合数据 baseline，不是最终业务结论 | 左文右图 | external_silesia_benchmark.png | 已找到 | 使用 Matt Mahoney Silesia benchmark 页面截图 |
| 10 | 压缩器核心框架 | 压缩器由表示、建模、熵编码、还原约束组成 | 总结路线图 | pipeline_placeholder | 缺失 | TODO：补高质量 pipeline 图；仅用轻量链路 |
| 11 | 算法演进谱系 | 从频率统计到神经概率建模 | 网站截图展示 | website_algorithm_evolution.png | 已找到 | 使用当前项目网站截图 |
| 12 | 经典算法节点 | Huffman、LZ、BWT、PPM 分别解决不同冗余问题 | 算法卡片页 | algorithm_classic_placeholder | 缺失 | TODO：后续补经典算法原图 |
| 13 | 代表压缩器选择 | 精读对象与扩展调研对象分层 | 对比表 | 无 | 不需要 | 使用两列表 |
| 14 | PAQ8PX / cmix 的定位 | 高压缩率研究对象，不是默认业务部署 | 算法卡片页 | external_paq8px_github.png, website_algorithm_board.png | 已找到 | 使用 GitHub 仓库截图和当前项目网站截图 |
| 15 | 工程压缩器定位 | gzip、zstd、xz 对应不同工程场景 | 评估矩阵 | 无 | 不需要 | 使用定位矩阵，不填真实速度数据 |
| 16 | 神经网络压缩方向 | 神经网络作为更强概率预测器，但工程代价高 | 算法卡片页 | external_nncp_official.png, external_language_modeling_compression.png | 已找到 | 使用官方页面/论文页面截图 |
| 17 | Silesia baseline 实验设计 | 统一数据、统一版本、统一指标、可复查 | 实验结果表 | 无 | 不需要 | 使用设计表 |
| 18 | 结果表模板 | 当前不编造数据，只保留待补结果表 | 实验结果表 | 无 | 不需要 | 表格中统一写“待测” |
| 19 | 多维评估框架 | 不能只看压缩率，要看五个维度 | 评估矩阵 | 无 | 不需要 | 五维矩阵 |
| 20 | 后续研发路线 | 从 baseline 到 PAQ8PX 拆解，再到神经预测模块 | 总结路线图 | 无 | 不需要 | 简洁路线图 |

## 可能需要人工优化的页面

- 第 3-5 页：本地网站截图如果页面首屏信息太密，需要人工选择更合适滚动位置。
- 第 9 页：Silesia 页面截图已使用公开 benchmark 页面，但截图中文字较细，后续可替换为更清晰的数据集文件列表图。
- 第 10 页：压缩器核心框架不强行画复杂流程图，后续可补高质量论文/教材图。
- 第 12 页：经典算法图不强行拼凑，后续可补 Huffman tree、LZ77 sliding window、BWT example 等可靠图。
- 第 14 页：PAQ8PX/cmix 当前使用 GitHub 截图和网站截图，若后续找到来源明确的架构图可替换。
- 第 16 页：神经压缩当前使用 NNCP 官方页面和 DeepMind 论文页面截图，后续可替换为更聚焦的论文图。

## 生成后自检

- PPT 文件已生成：`compression_stage_report.pptx`。
- 实际页数：20 页，已用 PowerPoint COM 打开并确认页数为 20。
- 已用 PowerPoint 临时导出每页 PNG 并生成总览图进行人工视觉检查；检查完成后已清理临时渲染图片，避免交付图片散落到 `assets/ppt_images/` 之外。
- PptxGenJS 生成脚本内置 `warnIfSlideHasOverlaps` 和 `warnIfSlideElementsOutOfBounds` 检查；最终生成时未输出重叠或越界警告。
- `slides_test.py` 未能运行：当前 Python 环境缺少 `pdf2image`，且系统 PATH 未发现 LibreOffice；已改用 PowerPoint COM 渲染检查。
- 未发现空白页。
- 未发现明显文字溢出或元素重叠。
- 图片均来自 `assets/ppt_images/`，使用图片均已记录在 `assets/ppt_images/image_sources.md`。
- 未使用来源不明图片。
- 未使用自行绘制的复杂流程图或低质量伪科研图。
- 第 10 页和第 12 页按要求保留 TODO 占位，并已写入 `assets/ppt_images/missing_images.md`。
- 第 18 页没有编造实验数据，所有结果字段均为“待测”或“待确认”。
- 页面整体风格为简洁科研汇报风格，未采用商业路演式大面积装饰。

## 后续重点检查页

- 第 3-5 页：确认网站截图是否展示了你最想让老师看到的首屏内容。
- 第 9 页：Silesia benchmark 截图文字较细，可后续替换为更清晰的数据集说明图。
- 第 10 页：需要补充高质量 lossless compression pipeline 图。
- 第 12 页：需要补充 Huffman / LZ77 / BWT / PPM 的高质量原图。
- 第 16 页：当前神经压缩截图是页面级截图，后续可替换为更聚焦的论文图。
- 第 18 页：真实实验完成后，需要把“待测”替换为实际 Silesia baseline 结果。
