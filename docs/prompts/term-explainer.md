# 术语解释生成器

## 输入
- 术语英文名: `Entropy`
- 中文名: `熵`
- 术语分类: `basic` / `info` / `entropy` / `dictionary` / `transform` / `learned` / `metric` / `standard` / `domain`
- Wikipedia 链接 (可选)

## 输出 (写入 `src/data/terms.ts`)
```ts
{
  name: 'Entropy',
  emoji: '🌀',
  category: 'info',
  briefZh: '信息不确定度的度量,压缩极限的下界(Shannon 1948)。',
  wikipedia: 'https://en.wikipedia.org/wiki/Entropy_(information_theory)',
  relatedLits: ['LIT-0001']  // 必须从 literatureData.ts 查
}
```

## 校验
- `briefZh` 不超过 40 字
- 必须含中英文 (例如 "熵 (Entropy)")
- `relatedLits` 里的 ID 必须存在
- emoji 用单个常用表情,不要冷门

## 风格
- 第一句给直觉 (什么是它)
- 第二句给意义 (为啥要关心它)
- 第三句给历史/作者 (谁提的、哪一年)

## 反例
- ❌ briefZh: "数据压缩的核心概念"
- ✅ briefZh: "信息不确定度的度量,压缩极限的下界(Shannon 1948)。"