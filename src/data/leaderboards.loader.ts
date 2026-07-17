// Leaderboard 加载 helper:优先使用自动抓取的快照(leaderboards.auto.json),
// 若无则用 TS 静态文件。提供一致的类型给页面使用。

import {
  LEADERBOARDS as STATIC_LBS,
  type Leaderboard,
  type LeaderboardDomain,
  type LeaderboardMode,
} from './leaderboards';

export type AutoSource = 'ltcb' | 'silesia' | 'hutter' | 'clic015' | 'clic0075';

export interface AutoSnapshot {
  refreshedAt: string;
  sources: Partial<Record<AutoSource, string | null>>;
  boardUpdatedAt?: Record<string, string>;
  boards: Record<string, Array<{
    method: string;
    year: number;
    metric: string;
    metricShort?: string;
    lowerIsBetter?: boolean;
    sourceUrl: string;
  }>>;
}

const TITLES: Record<string, {title: string; domain: LeaderboardDomain; mode: LeaderboardMode; dataset: string; metric: string; sourceName: string; sourceUrl: string; replaceId?: string}> = {
  enwik9_mahoney: {
    title: 'enwik9 / Large Text Compression Benchmark',
    domain: 'text',
    mode: 'lossless',
    dataset: 'enwik9 (1 GB Wikipedia)',
    metric: 'Total compressed size (含 decompressor, ↓)',
    sourceName: 'Mahoney LTCB',
    sourceUrl: 'http://mattmahoney.net/dc/text.html',
    replaceId: 'lb-enwik9-hutter-prize-2026',
  },
  silesia: {
    title: 'Silesia Open Source Compression Benchmark',
    domain: 'general',
    mode: 'lossless',
    dataset: 'Silesia corpus (12 文件 211 MB)',
    metric: 'Total compressed size (↓)',
    sourceName: 'Silesia Open Source',
    sourceUrl: 'http://mattmahoney.net/dc/silesia.html',
    replaceId: 'lb-silesia-2026',
  },
  hutter: {
    title: 'Hutter Prize enwik9 历届获奖榜',
    domain: 'text',
    mode: 'lossless',
    dataset: 'enwik9 1 GB',
    metric: 'Total compressed size (↓)',
    sourceName: 'Hutter Prize',
    sourceUrl: 'http://prize.hutter1.net/',
    replaceId: 'lb-hutter-prize-winners',
  },
  clic_image_0_15: {
    title: 'CLIC 2025 image@0.15bpp',
    domain: 'image',
    mode: 'lossy',
    dataset: 'CLIC 2025 test (30 images)',
    metric: 'ELO + PSNR + MS-SSIM',
    sourceName: 'CLIC 2025',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/',
    replaceId: 'lb-clic2025-leaderboard-0-15',
  },
  clic_image_0_075: {
    title: 'CLIC 2025 image@0.075bpp',
    domain: 'image',
    mode: 'lossy',
    dataset: 'CLIC 2025 test',
    metric: 'ELO + PSNR + MS-SSIM',
    sourceName: 'CLIC 2025',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/',
    replaceId: 'lb-clic2025-leaderboard-0-075',
  },
};

function sortedAutoEntries(entries: AutoSnapshot['boards'][string]): AutoSnapshot['boards'][string] {
  return entries
    .filter((entry) => entry.method.trim() !== '?' && !/\(Hutter,\s*You\?\)/i.test(entry.method))
    .sort((left, right) => {
      const leftValue = Number(left.metricShort);
      const rightValue = Number(right.metricShort);
      if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return 0;
      return left.lowerIsBetter === false ? rightValue - leftValue : leftValue - rightValue;
    });
}

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

  const replacements = new Map<string, Leaderboard>();
  const additionalBoards: Leaderboard[] = [];
  for (const [key, entries] of Object.entries(auto.boards ?? {})) {
    const meta = TITLES[key];
    if (!meta || !entries || entries.length === 0) continue;
    const normalizedEntries = sortedAutoEntries(entries);
    if (normalizedEntries.length === 0) continue;
    const board: Leaderboard = {
      id: meta.replaceId ?? `auto-${key}`,
      title: meta.title,
      domain: meta.domain,
      mode: meta.mode,
      dataset: meta.dataset,
      metric: meta.metric,
      sourceName: meta.sourceName,
      sourceUrl: meta.sourceUrl,
      updatedAt: auto.boardUpdatedAt?.[key] ?? auto.refreshedAt,
      entries: normalizedEntries.map((e, i) => ({
        rank: i + 1,
        method: e.method,
        year: e.year,
        metric: e.metric,
        metricShort: e.metricShort,
        lowerIsBetter: e.lowerIsBetter,
        sourceUrl: e.sourceUrl,
      })),
    };
    if (meta.replaceId) replacements.set(meta.replaceId, board);
    else additionalBoards.push(board);
  }

  cached = [
    ...staticBoards.map((board) => replacements.get(board.id) ?? board),
    ...additionalBoards,
  ];
  return cached;
}
