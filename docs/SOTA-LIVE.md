# SOTA 实时榜架构

## 双层设计

### Layer 1: 即时外链(已上线)
- 每个 LeaderboardCard 顶部一个红色"打开实时榜单"按钮,直接跳到 CLIC/Hutter/Mahoney 官方原网站
- 顶栏的"🔥 实时跳转"区有 7 个核心榜的快速入口
- 无延迟,永远最新

### Layer 2: 自动抓取(GitHub Action 每日跑)
- 工作流:`.github/workflows/refresh-sota.yml`,每天 04:00 UTC 自动触发
- 脚本:`scripts/fetch-sota.mjs`,抓 5 个源写到 `src/data/leaderboards.auto.json`
- 抓源:
  - `mattmahoney.net/dc/text.html` → LTCB enwik9 (8 entries)
  - `mattmahoney.net/dc/silesia.html` → Silesia (6 entries)
  - `prize.hutter1.net/` → Hutter Prize (5 entries)
  - `clic2025.compression.cc/leaderboard/image_0_15/test/` → CLIC 0.15bpp (8 entries)
  - `clic2025.compression.cc/leaderboard/image_0_075/test/` → CLIC 0.075bpp (8 entries)

## 本地运行

```bash
npm run fetch-sota   # 手动跑抓取脚本
npm run build        # 重新构建 docusaurus
```

## 文件
- `src/data/leaderboards.ts` — 静态手工整理数据(基线/补充)
- `src/data/leaderboards.auto.json` — 每天自动抓取的快照(优先显示,标 🔥)
- `src/data/leaderboards.loader.ts` — 合并两层 loader
- `src/pages/hub.tsx` — 页面 UI
- `scripts/fetch-sota.mjs` — 抓取脚本
- `.github/workflows/refresh-sota.yml` — GitHub Action

## 优先级
`auto boards(🔥) → 静态 boards`,auto 永远排前面。

## 如何扩 source
1. 在 `fetch-sota.mjs` 加一个 `parseXxx` 函数
2. main() 加抓取 + 写入 `out.boards.xxx`
3. 在 `leaderboards.loader.ts` 的 `TITLES` 加 meta 信息
4. push 后 GitHub Action 会自动每日跑

## 已知限制
- 部分表格 HTML 结构易变,parser regex 需要站点改版时同步更新
- CLIC 表头每行不固定(数据列数变化),parser 取前几列
- Silesia:parser 把 compressor+options 整段塞 method 名