// Leaderboard 加载 helper:优先使用自动抓取的快照(leaderboards.auto.json),
// 若无则用 TS 静态文件。提供一致的类型给页面使用。

import {
  LEADERBOARDS as STATIC_LBS,
  type Leaderboard,
} from './leaderboards';

export type AutoSource = 'ltcb' | 'silesia' | 'hutter' | 'clic015' | 'clic0075';

export interface AutoSnapshot {
  refreshedAt: string;
  sources: Partial<Record<AutoSource, string | null>>;
  boardUpdatedAt?: Record<string, string>;
  boards: Record<string, Array<{
    method: string;
    year?: number;
    metric: string;
    metricShort?: string;
    lowerIsBetter?: boolean;
    sourceUrl: string;
  }>>;
}

type AutoBoardMeta = Pick<
  Leaderboard,
  'title' | 'domain' | 'mode' | 'task' | 'dataset' | 'datasetVersion' | 'metric' | 'protocol' | 'evidence' | 'presentation' | 'sourceName' | 'sourceUrl' | 'limitations'
> & {replaceId?: string};

const TITLES: Record<string, AutoBoardMeta> = {
  enwik9_mahoney: {
    title: 'enwik9 / Large Text Compression Benchmark',
    domain: 'text',
    mode: 'lossless',
    task: '1 GB Wikipedia XML 最大压缩率',
    dataset: 'enwik9（1,000,000,000 bytes）',
    datasetVersion: 'enwiki-20060303-pages-articles.xml prefix',
    metric: '压缩数据 + 解压器总字节数 ↓',
    protocol: 'Mahoney 主榜规则；enwik8 仅为辅助列，不能进入本榜排序。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'Large Text Compression Benchmark',
    sourceUrl: 'http://mattmahoney.net/dc/text.html',
    replaceId: 'lb-text-mahoney-enwik9',
  },
  silesia: {
    title: 'Silesia 开源无损压缩榜',
    domain: 'general',
    mode: 'lossless',
    task: '混合文件集合的最大压缩率',
    dataset: 'Silesia corpus（12 个文件，约 211 MB）',
    datasetVersion: 'Mahoney live snapshot',
    metric: '总压缩字节数 ↓',
    protocol: '同一语料；按官网记录的最优参数；只收录开放源代码实现。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'Silesia Open Source Compression Benchmark',
    sourceUrl: 'http://mattmahoney.net/dc/silesia.html',
    replaceId: 'lb-general-silesia',
  },
  hutter: {
    title: 'Hutter Prize enwik9 获奖记录',
    domain: 'text',
    mode: 'lossless',
    task: '满足赛事资源限制的 enwik9 压缩',
    dataset: 'enwik9（1 GB）',
    datasetVersion: 'Hutter Prize official records',
    metric: '压缩数据 + 解压器总字节数 ↓',
    protocol: '遵守赛事 RAM、时间和可复现规则；与 Mahoney 信息榜分开。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'Hutter Prize Official',
    sourceUrl: 'http://prize.hutter1.net/',
    replaceId: 'lb-text-hutter-enwik9',
    limitations: '官网同时保留旧 enwik8 pre-prize 记录；本榜只允许大于 100 MB 的 enwik9 成绩。',
  },
  clic_image_0_15: {
    title: 'CLIC 2025 image@0.15bpp',
    domain: 'image',
    mode: 'lossy',
    task: '固定码率主观图像压缩挑战',
    dataset: 'CLIC 2025 test（30 images）',
    datasetVersion: 'image_0_15/test',
    metric: 'ELO ↑；PSNR 与 MS-SSIM 仅作辅助',
    protocol: '只在 0.15bpp 官方赛道内部按 ELO 排名。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'CLIC 2025 Official Leaderboard',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_15/test/',
    replaceId: 'lb-image-clic-2025-015',
  },
  clic_image_0_075: {
    title: 'CLIC 2025 image@0.075bpp',
    domain: 'image',
    mode: 'lossy',
    task: '极低码率主观图像压缩挑战',
    dataset: 'CLIC 2025 test',
    datasetVersion: 'image_0_075/test',
    metric: 'ELO ↑；PSNR 与 MS-SSIM 仅作辅助',
    protocol: '只在 0.075bpp 官方赛道内部按 ELO 排名。',
    evidence: 'official',
    presentation: 'ranking',
    sourceName: 'CLIC 2025 Official Leaderboard',
    sourceUrl: 'https://clic2025.compression.cc/leaderboard/image_0_075/test/',
    replaceId: 'lb-image-clic-2025-0075',
  },
};

function sortedAutoEntries(key: string, entries: AutoSnapshot['boards'][string]): AutoSnapshot['boards'][string] {
  return entries
    .filter((entry) => entry.method.trim() !== '?' && !/\(Hutter,\s*You\?\)/i.test(entry.method))
    .filter((entry) => key !== 'hutter' || Number(entry.metricShort) >= 100_000_000)
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
    const normalizedEntries = sortedAutoEntries(key, entries);
    if (normalizedEntries.length === 0) continue;
    const board: Leaderboard = {
      id: meta.replaceId ?? `auto-${key}`,
      title: meta.title,
      domain: meta.domain,
      mode: meta.mode,
      task: meta.task,
      dataset: meta.dataset,
      datasetVersion: meta.datasetVersion,
      metric: meta.metric,
      protocol: meta.protocol,
      evidence: meta.evidence,
      presentation: meta.presentation,
      sourceName: meta.sourceName,
      sourceUrl: meta.sourceUrl,
      limitations: meta.limitations,
      updatedAt: auto.boardUpdatedAt?.[key] ?? auto.refreshedAt,
      entries: normalizedEntries.map((e, i) => ({
        rank: i > 0 && e.metricShort === normalizedEntries[i - 1].metricShort
          ? normalizedEntries.slice(0, i).findIndex((item) => item.metricShort === e.metricShort) + 1
          : i + 1,
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
