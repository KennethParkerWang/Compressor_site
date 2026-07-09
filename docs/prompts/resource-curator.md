# 资源整理 Skill — 联网搜索 → 结构化数据

## 任务
围绕一个主题 (例如 "PAQ / Context Mixing"),联网搜索高质量资源,整理成结构化列表。

## 搜索范围 (中英双语)
1. **arXiv**: 综述、关键论文
2. **GitHub**: 实现项目、star > 100 的工具
3. **官方网站**: 例如 Matt Mahoney 主页
4. **Wikipedia**: 概念入门
5. **博客 / 教程**: 工程师写的实战文 (例如 fabiensanglard.net、知乎专栏)
6. **会议 / 期刊**: DCC、SIGCOMM、IEEE 等

## 必填字段 (每条资源)
```ts
{
  name: 'PAQ8px',
  category: 'tool',                  // dataset/tool/framework/pretrained/tutorial/leaderboard
  emoji: '📦',
  briefZh: 'Matt Mahoney 设计的上下文混合压缩器,GitHub 高 star 实现',
  url: 'https://github.com/...',      // 必须 HEAD 校验通过
  tags: ['PAQ', 'context-mixing', 'archive'],
  relatedLits: ['LIT-0018'],          // 关联论文 (若有)
  verifiedAt: '2026-07-05'            // 联网核查日期
}
```

## 适合阶段
每条资源标 `difficulty`:
- `intro`: 入门者友好
- `intermediate`: 需要基础
- `advanced`: 进阶/前沿

## 是否加入网站
每条候选标 `shouldAddToSite`:
- ✅ true: 教程/工具/数据集值得永久收录
- ⏸ false: 备用,暂不收录
- ❌ false: 质量不足,不收录

## 放在哪个栏目
根据类型选:
- `dataset` → `database.tsx`
- `tutorial` → `tutorials.tsx` (推荐)
- `tool` / `framework` → `library.tsx`
- `paper` (关联) → `literatureData.ts`

## 联网核查流程
1. `WebSearch`: 搜索主题 + "tutorial" / "github" / "arxiv"
2. 取 Top 10 结果
3. `WebFetch` 每个候选 URL
4. 过滤: 404 / 内容不相关 / 重复
5. 写入 `resources.ts` 或 `literatureData.ts`
6. 跑 `npm run verify-urls` 校验

## 严禁
- ❌ 不联网就写资源
- ❌ 引用低质 SEO 农场文
- ❌ 收录 Wikipedia 主条目 (直接用 wikipedia 链接即可,不算独立资源)
- ❌ 收录需要付费的论文/教程