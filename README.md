# 压缩算法研图

面向无损压缩算法学习、文献资源管理、算法复现、实验记录、项目计划和阶段汇报的科研工作台网站。

线上访问地址：

```text
https://KennethParkerWang.github.io/Compressor_site/
```

本项目使用 Docusaurus、React 和 TypeScript 构建，定位不是普通博客，而是一个可持续维护的压缩算法研究平台。网站围绕“数据理解、文献证据、算法结构、实验复现、项目管理、汇报展示”几条主线组织内容，适合研究生学习、课题组内部汇报、横向科研项目过程管理和后续成果沉淀。

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

项目入口和总览页，用于快速说明网站定位、当前研究价值、关键资源入口和工作进度。

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

用于管理双周汇报排期、汇报内容、待讨论问题和全屏展示。页面内置 Markdown 可编辑草稿、实时预览、复制草稿、保存草稿和图片拖拽插入功能。

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
