# SOTA 榜单与证据架构

## 收录原则

只有同时满足以下条件的结果才显示名次：

- 同一压缩任务：无损、近无损和率失真不混排。
- 同一数据集与版本：包含切分、预处理和文件格式。
- 同一指标：BPP、BPSP、ELO、压缩率和 BD-Rate 不互换。
- 来源可追溯：官方榜单或同一论文表格中的直接结果。

页面把资料分成四个证据等级：

- `official`：官方赛事或长期公开榜单。
- `paper`：同一论文协议和表格内的结果。
- `engineering`：可复现的开源工程 benchmark。
- `reference`：预印本、跨论文入口或仍待本地复现的资料。

`ranking` 可直接显示名次，`comparison` 只表示同协议顺位，`registry` 仅提供证据入口，不生成总排名。

## 自动快照

`.github/workflows/refresh-sota.yml` 每天 04:00 UTC 运行 `scripts/fetch-sota.mjs`，更新 `src/data/leaderboards.auto.json`：

- Mahoney LTCB：只按 enwik9 压缩数据与解压器总大小排序。
- Silesia：抓取同一混合语料的开源结果。
- Hutter Prize：只接收 100–250 MB 的 enwik9 记录，排除旧 enwik8 pre-prize 表。
- CLIC 2025：0.15bpp 与 0.075bpp 分榜，并只按各自赛道 ELO 排序。

解析结果必须通过数值范围检查。抓取或解析失败时保留上次成功快照，并在 `failures` 中记录错误。

## 静态证据

`src/data/leaderboards.ts` 保存已人工核对的官方快照、论文同表对比和工程证据矩阵。当前覆盖：

- 通用混合、文本、图像、视频、音频。
- 科学浮点、基因组、结构化数据与系统日志。
- CALLIC、L3TC、NeuralLVC、FCBench、SPRING、Genozip、PBC、Logzip 与 LogPrism 等来源。

没有统一公共榜单的领域会明确显示“证据矩阵”，不会使用跨数据集平均值或估计值冒充 SOTA。

## 本地校验

```bash
npm run fetch-sota
npm run typecheck
npm run build
```

## 维护文件

- `src/data/leaderboards.ts`：数据结构与人工核验静态证据。
- `src/data/leaderboards.auto.json`：自动抓取快照。
- `src/data/leaderboards.loader.ts`：静态数据与自动快照合并。
- `src/pages/sota.tsx`：页面筛选、证据等级与协议展示。
- `scripts/fetch-sota.mjs`：官方来源抓取、排序和范围校验。
- `.github/workflows/refresh-sota.yml`：每日更新任务。
