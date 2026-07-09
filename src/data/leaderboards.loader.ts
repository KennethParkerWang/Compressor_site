// Leaderboard 加载 helper:优先使用自动抓取的快照(leaderboards.auto.json),
// 若无则用 TS 静态文件。提供一致的类型给页面使用。

import {LEADERBOARDS as STATIC_LBS, type Leaderboard, type LeaderboardDomain} from './leaderboards';

export type AutoSource = 'ltcb' | 'silesia' | 'hutter' | 'clic015' | 'clic0075';

export interface AutoSnapshot {
  refreshedAt: string;
  sources: Partial<Record<AutoSource, string>>;
  boards: Record<string, Array<{
    method: string;
    year: number;
    metric: string;
    metricShort?: string;
    lowerIsBetter?: boolean;
    sourceUrl: string;
  }>>;
}

const TITLES: Record<string, { title: string; domain: LeaderboardDomain; dataset: string; metric: string; sourceName: string; sourceUrl: string }> = {
  enwik9_mahoney: {
    title: '🔥 enwik9 / Large Text Compression Benchmark (自动)',
    domain: 'text-mixed',
    dataset: 'enwik9 (1 GB Wikipedia)',
    metric: 'Total compressed size (含 decompressor, ↓)',
    sourceName: 'Mahoney LTCB',
    sourceUrl: 'http://mattmahoney.net/dc/text.html',
  },
  silesia: {
    title: '🔥 Silesia 混合数据 (自动)',
    domain: 'text-mixed',
    dataset: 'Silesia corpus (12 文件 211 MB)',
    metric: 'Total compressed size (↓)',
    sourceName: 'Silesia Open Source',
    sourceUrl: 'http://mattmahoney.net/dc/silesia.html',
  },
  hutter: {
    title: '🔥 Hutter Prize enwik9 历届 (自动)',
    domain: 'competition',
    dataset: 'enwik9 1 GB',
    metric: 'Total compressed size (↓)',
    sourceName: 'Hutter Prize',
    sourceUrl: 'http://prize.hutter1.net/',
  },
  clic_image_0_15: {
    title: '🔥 CLIC 2025 image@0.15bpp (自动)',
    domain: 'competition',
    dataset: 'CLIC 2025 test (30 images)',
    metric: 'ELO + PSNR + MS-SSIM',
    sourceName: 'CLIC 2025',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/',
  },
  clic_image_0_075: {
    title: '🔥 CLIC 2025 image@0.075bpp (自动)',
    domain: 'competition',
    dataset: 'CLIC 2025 test',
    metric: 'ELO + PSNR + MS-SSIM',
    sourceName: 'CLIC 2025',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/',
  },
};

let cached: Leaderboard[] | null = null;

export async function loadLeaderboards(): Promise<Leaderboard[]> {
  if (cached) return cached;
  const staticBoards = STATIC_LBS;
  let auto: AutoSnapshot | null = null;
  try {
    // 动态 import JSON,失败则忽略
    const mod = await import('./leaderboards.auto.json');
    auto = mod.default ?? mod;
  } catch {
    // 文件不存在,纯静态
  }

  if (!auto) {
    cached = staticBoards;
    return cached;
  }

  // 把 auto boards 转成 Leaderboard 格式,排在最前(标 🔥)
  const autoBoards: Leaderboard[] = [];
  for (const [key, entries] of Object.entries(auto.boards ?? {})) {
    const meta = TITLES[key];
    if (!meta || !entries || entries.length === 0) continue;
    autoBoards.push({
      id: `auto-${key}`,
      title: meta.title,
      domain: meta.domain,
      dataset: meta.dataset,
      metric: meta.metric,
      sourceName: meta.sourceName,
      sourceUrl: meta.sourceUrl,
      updatedAt: auto.refreshedAt,
      entries: entries.map((e, i) => ({
        rank: i + 1,
        method: e.method,
        year: e.year,
        metric: e.metric,
        metricShort: e.metricShort,
        lowerIsBetter: e.lowerIsBetter,
        sourceUrl: e.sourceUrl,
      })),
    });
  }

  cached = [...autoBoards, ...staticBoards];
  return cached;
}