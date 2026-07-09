# 教程栏目工作流 (Tutorial Workflow)

> 适用版本: 当前项目 `compressor-research`
> 维护人: 站主
> 最后更新: 2026-07-05

本目录包含"教程 / 学习路线 / 入门指南"栏目的全部基础设施与流程说明。

---

## 目录结构

```
docs/
├── README.md                          ← 你正在看的文件
├── prompts/                           ← AI 生成教程的 prompt 模板
│   ├── tutorial-entry.md
│   ├── tutorial-algorithm.md
│   ├── tutorial-practice.md
│   ├── tutorial-paper-review.md
│   ├── term-explainer.md
│   ├── paper-card.md
│   ├── algorithm-compare.md
│   ├── resource-curator.md
│   ├── tutorial-paq.md
│   └── tutorial-neural.md
├── schemas/                           ← 数据 schema
│   ├── tutorial.schema.yaml           ← 教程主结构
│   ├── tutorial-section.schema.yaml   ← 单节结构
│   └── linked-ref.schema.yaml         ← 引用结构
└── benchmarks/                        ← 自定义 benchmark 数据 (非 SOTA)
```

```
.cursor/rules/
├── tutorial-style.mdc                 ← 教程写作风格
├── term-usage.mdc                     ← 术语使用规范
├── paper-linking.mdc                  ← 论文引用规范
├── resource-citation.mdc              ← 资源引用规范
├── component-naming.mdc               ← 组件命名规范
├── page-structure.mdc                 ← 页面结构规范
└── no-fabrication.mdc                 ← 真实性规范
```

```
scripts/
├── verify-urls.mjs                    ← 校验所有 URL 可访问
├── lint-tutorial-refs.mjs             ← 校验教程引用合法
├── new-tutorial.mjs                   ← 一键新建教程
├── audit-no-fabrication.mjs           ← 反胡编审查
└── tutorial-progress.mjs              ← 教程进度统计
```

---

## 教程 ID 体系

| 前缀 | 阶段 | 字数 | 计划 |
|---|---|---|---|
| `TUT-01xx` | P0 入门 (项目导向) | 800-1500 | 8 篇 |
| `TUT-02xx` | P1 原理 (算法解读) | 1500-3000 | 5 篇 |
| `TUT-03xx` | P2 专题 (前沿/论文精读) | 3000-5000 | 3 篇 |

**计划 16 篇,目前 0 篇。**

---

## 完整工作流

### Step 1 — 立项
```bash
npm run new-tutorial TUT-0101 entry
```
- 在 `src/data/tutorials.ts` 创建占位记录
- 填好 title / subtitle / summary / linkedTerms / linkedPapers / linkedResources

### Step 2 — 联网核查 (P0 也需要)
按 `docs/prompts/resource-curator.md` 流程:
1. `WebSearch` 搜主题相关论文/工具/数据集
2. `WebFetch` 校验每个 URL
3. 写入 `src/data/resources.ts` 或 `src/data/literatureData.ts`

### Step 3 — 写教程正文
按 `docs/prompts/tutorial-entry.md` 模板 (或 algorithm / practice / paper-review):
- 5 段结构: 为什么读 / 前置 / 正文 / 常见坑 / 下一步
- 工程师博客风,第一人称
- 引用站内术语/论文/资源/资产

### Step 4 — 自检
```bash
npm run lint:tutorial-refs
npm run verify-urls
npm run audit:no-fab
```
- `lint:tutorial-refs`: 教程里的 LIT-XXXX / 术语 / 资源 / 资产引用都必须存在
- `verify-urls`: 所有外部链接 HEAD 校验
- `audit:no-fab`: SOTA 数字必须有来源

### Step 5 — 注册导航
- 顶栏 nav: `docusaurus.config.ts` 加 "教程" 链接
- 主页 `<StartHere />`: 加 "第一次访问从这里开始" → TUT-0101
- `<Hub />`: 加 "教程" tile
- `/tutorials` 列表页: 自动从 `tutorials.ts` 渲染

### Step 6 — 进度跟踪
```bash
npm run tutorial:progress
```
显示 P0/P1/P2 覆盖进度。

---

## 教程数据源 (已存在的可复用资源)

| 数据 | 文件 | 字段 |
|---|---|---|
| 论文 | `src/data/literatureData.ts` | `id`, `title`, `difficulty`, `recommendedAction`, `coreReason` |
| 术语 | `src/data/terms.ts` | `name`, `briefZh`, `wikipedia`, `relatedLits` |
| 资源 | `src/data/resources.ts` | `name`, `category`, `url`, `tags`, `relatedLits` |
| 阅读路线 | `src/data/readingPaths.ts` | `id`, `steps`, `experimentIds` |
| 项目资产 | `src/data/projectAssets.json` | `id`, `action`, `why` |
| SOTA / baseline | `src/data/leaderboards.ts` | algorithm / corpus / metric |

---

## 教程与站内其他模块的联动

```
教程 TUT-XXXX
  ├─ linkedTerms        → 悬浮显示 terms.ts 里的定义
  ├─ linkedPapers       → 跳到 core.tsx 论文详情
  ├─ linkedResources    → 跳到 library.tsx 资源详情
  ├─ linkedAssets       → 显示 projectAssets.json 自建内容
  ├─ prerequisites      → 显示依赖的其他教程/术语/论文
  └─ commonPitfalls     → 来自实操经验 (不可编造)
```

---

## 禁止清单

- ❌ 写教程不带 LIT-XXXX / 术语 ID
- ❌ 引用外部资源不在 `resources.ts` 注册
- ❌ 编一个不存在的 SOTA 数字
- ❌ 把未发表论文标为已发表
- ❌ 教程正文不带难度/时长徽章
- ❌ 教程详情页没有上/下篇导航
- ❌ 教程挂 GitHub 链接不联网校验

---

## 下一步

1. **现在**: 完成规则/模板/schemas/脚本搭建 (本轮 commit)
2. **下一轮**: 创建 12 个组件 (C1-C12)
3. **再下一轮**: 写 TUT-0101~0108 P0 全部 8 篇教程
4. **再后**: TUT-0201~0205 P1 原理 5 篇
5. **最后**: TUT-0301~0303 P2 专题 3 篇

任何教程内容生产前,**必须先读**:
- `.cursor/rules/no-fabrication.mdc`
- `docs/prompts/` 里对应类型的模板