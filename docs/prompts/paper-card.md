# 论文卡片生成器

## 输入
- 论文标题 / 作者 / 年份 / 会议 / arXiv ID (任选一或多个)
- 任务: "把这篇论文注册到 `literatureData.ts`"

## 联网核查清单 (必须)
1. 用 `WebSearch` / `WebFetch` 核实:
   - 标题 (区分大小写、空格)
   - 作者列表顺序
   - 会议 / 期刊全名
   - 出版年份
   - arXiv ID (若有)
   - 是否已撤回 / corrigendum
2. 拉取 PDF 链接,验证可访问

## 输出字段
```ts
{
  id: 'LIT-XXXX',                    // 下一个可用 ID
  chapterId: '...',                  // 根据主题归到对应章节
  chapterTitleZh: '...',
  chapterTitleEn: '...',
  sectionId: '...',
  sectionTitleZh: '...',
  sectionTitleEn: '...',
  title: '...',
  authors: '...',
  year: 'YYYY',
  venue: '...',
  type: 'paper',
  url: 'PDF URL 或 arXiv abstract',
  attachments: [
    { kind: 'pdf', url: '...' },
    { kind: 'code', url: '...' }     // 若有代码
  ],
  tags: ['L1', 'L2'],
  summaryZh: '...',
  isPublic: true,
  difficulty: 'intro' | 'intermediate' | 'advanced',
  recommendedAction: 'skim' | 'deep-read' | 'run-experiment' | 'read-source' | 'check-standard',
  coreReason: '...',
  readerBenefit: '...'
}
```

## `coreReason` 写作模板
"为什么这篇是核心: [一句话讲它在领域里的地位]"

## `readerBenefit` 写作模板
"读完这篇你能: [具体能力,例如"实现一个 PPM 编码器"]"

## 严禁
- ❌ 不联网核查就填字段
- ❌ 把 arXiv preprint 当正式发表 (`isPublic=false` + `unpublished=true`)
- ❌ 标题大小写不一致