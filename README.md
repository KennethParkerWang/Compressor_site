# 王坤鹏 · 无损压缩研究

面向无损压缩算法学习、文献资源管理、算法复现、实验记录、项目计划和阶段汇报的科研工作台网站。

线上访问地址：

```text
https://KennethParkerWang.github.io/Compressor_site/
```

本项目使用 Docusaurus、React 和 TypeScript 构建，是一个可持续维护的个人科研工作台。网站围绕“文献证据、算法结构、数据基准、实验复现、阶段汇报”组织内容。

主导航只保留六个长期入口：研究总览、文献、算法、数据集、实验和双周汇报。阅读路线、笔记、算法档案、日程、任务和资源等辅助页面统一收进“全部研究页面”，避免所有功能同时争夺注意力。

本次界面重建参考的开源学术站点、组件库、图表库、流程图库和许可证记录见 [`docs/OPEN_SOURCE_DESIGN_REFERENCES.md`](docs/OPEN_SOURCE_DESIGN_REFERENCES.md)。

## 项目定位

网站服务于“高压缩比无损数据压缩算法”相关研究，主要回答几类问题：

1. 有哪些经典和前沿无损压缩算法，它们之间如何演化。
2. 论文、标准、代码、数据集和教程资源如何分类管理。
3. 不同算法的结构、压缩流程、实现细节和适用场景是什么。
4. Silesia、腾讯数据集等压缩数据应如何整理、画像、测试和对比。
5. 项目年度计划、任务进度、实验结果和阶段汇报如何沉淀。
6. 后续论文综述、研究论文、专利和 demo 交付如何持续推进。

## 核心模块

### 首页

个人研究概览页，用于查看当前研究问题、三条方法主线、压缩器系统流程、当前阅读集、实验记录和下一次双周汇报。

### 文献库

集中管理压缩算法相关论文、标准、代码仓库、项目主页和数据集资源。文献条目强调可引用性、资源来源、研究方向、阅读状态和复现价值，支持后续扩展到论文精读和综述写作。

### 研究图谱

以图谱方式展示论文、算法方向和技术脉络之间的关系，帮助从零散文献进入体系化理解。

### 算法演化

按照压缩算法历史脉络展示从 Shannon、Huffman、LZ、DEFLATE、BWT、LZMA、PAQ、zstd 到学习式压缩等方向的演进关系。

### 算法目录

按算法卡片管理具体压缩方法。每个算法条目包含基本信息、来源链接、结构说明、实现要点、压缩流程、适用场景、局限性和测试表现位置。页面已预留机制图字段，后续可继续填充每个算法的科研机制图。

### 算法模块

从压缩器流水线角度拆解输入解析、预处理、建模、概率预测、熵编码、校验和结果统计等模块。

### 数据集

整理基准数据集和项目数据集信息，包括 Silesia、Calgary、Canterbury、Large Text Compression Benchmark 等资源，以及后续腾讯数据集整理入口。

### 实验台

用于组织复现任务、baseline 测试、指标说明和实验流程。后续可继续沉淀压缩比、吞吐、时延、内存、解压正确性等实验结果。

### 年度研发计划

展示正式横向科研项目的一年期研发计划，包括技术研发主线、成果沉淀主线、成果产出推进表、合同考核指标、甘特图、阶段里程碑和风险缓冲安排。

### 任务看板

管理阅读、下载、笔记、实验、汇报等任务，适合把研究过程拆成可追踪的执行项。

### 双周汇报中心

用于管理双周汇报排期和每期材料。页面按 14 天周期自动生成期次，根据当前时间判断已汇报状态；每期展示日期、汇报人、PDF 预览和 PPTX 下载入口，未知议程和会议记录保持待补充状态。

#### 双周汇报 PPT 存放约定

每次双周汇报固定上传两份 PPT，分别来自两位同学。源文件建议放在 `static/reports/` 下，按汇报日期建目录：

```text
static/reports/
└── 2026-07-10/
    ├── WR-2026-07-10-student-a.pptx
    ├── WR-2026-07-10-student-b.pptx
    ├── WR-2026-07-10-student-a.pdf
    ├── WR-2026-07-10-student-b.pdf
    └── images/
        ├── student-a-01.png
        └── student-b-01.png
```

命名规则：

- 目录名使用汇报日期：`YYYY-MM-DD`，例如 `2026-07-10`。
- 文件名前缀使用汇报 ID：`WR-YYYY-MM-DD`，和 `src/data/weeklyReports.ts` 里的 `id` 保持一致。
- 两位同学用稳定代号区分：`student-a`、`student-b`；如果后续确定姓名，可以改成拼音或英文名，例如 `wang-xx`、`li-xx`。
- 原始可编辑文件保留 `.pptx`；网页展示优先使用导出的 `.pdf` 或逐页 `.png`。

网站展示方式建议：

- 最稳方案：在汇报页提供 `.pptx` 下载链接，同时嵌入 `.pdf` 预览或展示逐页 `.png`。这种方式不需要额外前端组件，Docusaurus 静态站点即可支持。
- 推荐方案：每份 PPT 同步导出一份 PDF，网页用 `<iframe>` 或链接打开 PDF，兼顾可看和可下载。
- 精细方案：把 PPT 每页导出为 PNG，页面做缩略图网格和全屏查看，适合汇报现场展示，但需要多维护一份图片。
- 不建议直接在浏览器解析 `.pptx`。如果必须在线预览 PPTX，需要额外引入 Office 在线预览、OnlyOffice、LibreOffice 转换服务，或构建时用脚本把 PPTX 转成 PDF/PNG；这会增加部署和维护复杂度。

新增某一期汇报时，至少需要改两处：

1. 把文件放入 `static/reports/YYYY-MM-DD/`。
2. 在 `src/data/weeklyReports.ts` 中确认对应 `id`、日期、周几和入口存在；后续如果页面要显示附件，再给数据结构增加 `attachments` 字段。

### 教程资源

面向压缩算法学习过程整理通用教程、数据说明教程、算法拆解教程、前沿教程、视频资源和说明贴。

### 研究笔记

用于沉淀论文阅读笔记、摘录、名词解释、写作想法和阶段性研究记录。

### 设置

提供主题、外观和工作区相关配置入口。

## 技术栈

- Docusaurus 3
- React 19
- TypeScript
- CSS Modules
- Tailwind CSS
- lucide-react
- React Markdown
- FullCalendar / Schedule-X
- TanStack Table / Virtual
- D3 / ELK / Dagre

## 本地运行

首次运行需要安装依赖：

```powershell
cd F:\Compressor_site
npm ci
```

启动本地开发服务器：

```powershell
npm run start
```

默认地址通常是：

```text
http://127.0.0.1:3000/
```

如果端口被占用，可以指定端口：

```powershell
npm run start -- --host 127.0.0.1 --port 3010
```

## 构建网站

```powershell
npm run build
```

构建产物会生成到：

```text
build/
```

如果只是部署静态网站，上传 `build/` 目录即可，不需要上传源码、`.git`、`node_modules` 或 `.docusaurus`。

## GitHub Pages 部署

本仓库已配置 GitHub Pages 自动部署 workflow：

```text
.github/workflows/deploy-pages.yml
```

推送到 `main` 分支后，GitHub Actions 会自动执行：

```text
npm ci
npm run build
```

并将 `build/` 发布到 GitHub Pages。

当前 Docusaurus 部署配置：

```ts
url: 'https://KennethParkerWang.github.io'
baseUrl: '/Compressor_site/'
organizationName: 'KennethParkerWang'
projectName: 'Compressor_site'
```

如果将来换仓库名或自定义域名，需要同步修改 `docusaurus.config.ts`。

## 目录结构

```text
.
├── assets/                  # 汇报、PPT、截图等辅助资源
├── docs/                    # 文档、提示词、说明材料
├── feedback_reports/        # 五轮审查意见、整改总结和页面截图
├── i18n/                    # 英文界面翻译资源
├── scripts/                 # 数据检查、资源维护和生成脚本
├── src/
│   ├── components/          # 页面组件和通用 UI 组件
│   ├── css/                 # 全局样式
│   ├── data/                # 文献、算法、计划、任务、教程等核心数据
│   ├── pages/               # Docusaurus 页面
│   ├── stores/              # 前端状态管理
│   ├── theme/               # Docusaurus 主题扩展
│   └── utils/               # 工具函数
├── static/                  # 静态图片和站点公共资源
├── package.json             # 项目脚本和依赖声明
├── package-lock.json        # 依赖锁定文件
└── docusaurus.config.ts     # Docusaurus 配置
```

## 主要数据维护位置

常见内容修改可以优先看这些文件：

| 内容 | 主要文件 |
| --- | --- |
| 文献库 | `src/data/literatureData.ts` / `src/data/literatureData.json` |
| 算法演化 | `src/data/algorithmEvolution.ts` |
| 算法目录详情 | `src/data/algorithmCatalogDetails.ts` |
| 算法机制图映射 | `src/data/algorithmFigureImages.ts` |
| 年度研发计划 | `src/data/projectAnnualPlan.ts` |
| 任务看板 | `src/data/researchTasks.ts` |
| 数据集 | `src/data/datasets.ts` |
| 教程资源 | `src/data/tutorials.ts` |
| 双周汇报 | `src/data/weeklyReports.ts` |
| 术语库 | `src/data/terms.ts` |
| 主题配置 | `src/data/themePresets.ts` |

## 开发注意事项

1. 不要提交 `node_modules/`、`build/`、`.docusaurus/`。
2. 修改页面后建议先运行 `npm run build` 检查构建是否通过。
3. 文献、算法和教程资源不要编造来源；没有确认 DOI、会议或期刊信息时应明确标注待核验。
4. 压缩算法实验结果需要写清楚数据集、版本、参数、指标和 SHA-256 无损校验情况。
5. GitHub Pages 部署到子路径 `/Compressor_site/`，内部链接和资源路径需要保持 Docusaurus 的 `baseUrl` 配置。

## 后续可扩展方向

- 为算法目录补齐每个算法的高质量机制图。
- 为文献库增加 Zotero / BibTeX / RIS 导入导出流程。
- 将实验台扩展为可筛选的 benchmark 结果矩阵。
- 将双周汇报稿与项目任务、实验结果、截图证据联动。
- 增加论文写作版本，用于管理写作思路、图表模板、引用、摘抄和术语库。
- 为腾讯数据集增加数据画像、类型分布和压缩路由实验记录。

## 当前维护约定

当前正式项目目录：

```text
F:\Compressor_site
```

线上站点：

```text
https://KennethParkerWang.github.io/Compressor_site/
```

主分支：

```text
main
```
