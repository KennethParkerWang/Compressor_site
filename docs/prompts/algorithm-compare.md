# 算法对比表生成器

## 输入
- 对比维度: 例如 "速度 / 压缩率 / 实现难度 / 内存占用"
- 对比算法: 例如 ["LZMA", "PAQ8px", "zstd", "NNCP"]

## 输出格式
返回给 `<AlgorithmCompareTable>` 组件的数据:

```ts
{
  columns: [
    { key: 'lzma', name: 'LZMA', emoji: '🗜️' },
    { key: 'paq8px', name: 'PAQ8px', emoji: '📦' }
  ],
  rows: [
    { dimension: '压缩率 (enwik9)', values: { lzma: '2.71 bpb', paq8px: '1.46 bpb' } },
    { dimension: '解压速度', values: { lzma: '50 MB/s', paq8px: '5 MB/s' } },
    { dimension: '压缩速度', values: { lzma: '5 MB/s', paq8px: '0.5 MB/s' } },
    { dimension: '内存占用', values: { lzma: '~64 MB', paq8px: '~1.5 GB' } },
    { dimension: '实现难度', values: { lzma: '⭐⭐', paq8px: '⭐⭐⭐⭐' } },
    { dimension: '最佳场景', values: { lzma: '通用文本', paq8px: '已知分布的归档' } }
  ]
}
```

## 数据来源
- 压缩率数字必须从 `leaderboards.ts` 引
- 速度/内存数字必须标来源 (论文/官方 README/实测)
- "实现难度" 是主观评级,作者经验

## 严禁
- ❌ 凭印象写 "PAQ8px 压缩率比 LZMA 高 30%"
- ❌ 不标数据来源
- ❌ 单一来源覆盖全部数字 (至少 2 个独立来源)

## 校验
写完后:
```
npm run lint:tutorial-refs
```
确保 `leaderboards` 字段与 `leaderboards.ts` 一致。