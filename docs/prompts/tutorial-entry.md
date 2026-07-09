# 教程生成 — 入口指引模板

## 输入
- 教程 ID: `TUT-XXXX` (来自 `src/data/tutorials.ts`)
- 教程类型: `entry` (入门) | `algorithm` (原理) | `practice` (实操) | `paper` (论文精读)
- 阶段: `entry` (入门,P0) | `intermediate` (原理,P1) | `advanced` (专题,P2)
- 字数: 800-1500 (entry) / 1500-3000 (intermediate) / 3000-5000 (advanced)

## 必须引用
- 站内术语: 第一次出现术语必须用 `<Term id="..." />`
- 站内论文: 提到论文必须用 `<LitLink id="LIT-XXXX" />`
- 站内资源: 外部链接必须从 `src/data/resources.ts` 引用
- 站内教程: 链到 `TUT-XXXX`

## 教程结构 (5 段)
1. **为什么读这个** — 一句话,读者拿走什么
2. **前置知识** — 列出需要的术语/教程 (自动从 linkedTerms / prerequisites 渲染)
3. **正文** — 3-5 节,每节小标题
4. **常见坑** — 至少 3 条 "我当年踩过的"
5. **下一步** — 链到下一篇 (从 `tutorials.ts` 的 `nextId` 读)

## 风格
- 工程师博客风,第一人称
- 类比 > 公式
- 每节结尾有"动手环节" (代码 / 实验 / 命令)
- 失败案例 + 调试过程,不要只讲成功

## 输出格式
返回 JSON:
```json
{
  "id": "TUT-XXXX",
  "sections": [
    { "type": "intro", "title": "...", "body": "..." },
    { "type": "prerequisites", "items": ["TUT-XXXX", "term:Entropy"] },
    { "type": "body", "sections": [{ "title": "...", "body": "...", "callout": "tip|warn|info" }] },
    { "type": "pitfalls", "items": ["...", "...", "..."] },
    { "type": "next", "nextId": "TUT-XXXX" }
  ]
}
```

## 校验
写完后必须:
```
npm run lint:tutorial-refs
npm run verify-urls
```