import {literatureData} from '../../data/literatureData';
import {evolutionNodes} from '../../data/algorithmEvolution';
import {compressionDatasets} from '../../data/datasets';
import {experimentAssets} from '../../data/experimentData';
import {getWeeklyReportAt} from '../../data/weeklyReports';
import type {V3ResearchItem} from '../shared/types';

const featuredPaperIds = ['LIT-0018', 'LIT-0030', 'LIT-0187', 'LIT-0190', 'LIT-0223', 'LIT-0001'];

export const featuredPapers = featuredPaperIds
  .map((id) => literatureData.find((paper) => paper.id === id))
  .filter((paper): paper is (typeof literatureData)[number] => Boolean(paper));

export const recentPapers = [...literatureData]
  .filter((paper) => paper.isPublic)
  .sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0))
  .slice(0, 8);

export const lineageNodes = evolutionNodes.filter((node) =>
  ['shannon', 'huffman', 'lz77', 'gzip', 'bwt', 'paq', 'zstd', 'cmix', 'nncp'].some((key) =>
    node.id.toLowerCase().includes(key) || node.title.toLowerCase().includes(key),
  ),
);

export const primaryDatasets = compressionDatasets.filter((item) =>
  ['Silesia Compression Corpus', 'enwik8', 'Calgary Corpus', 'Canterbury Corpus'].includes(item.name),
);

export const firstReport = getWeeklyReportAt(0, new Date('2026-07-12T10:00:00+08:00'));

export const researchIndex: V3ResearchItem[] = [
  ...literatureData.filter((paper) => paper.isPublic).map((paper): V3ResearchItem => ({
    id: paper.id,
    kind: 'paper',
    title: paper.title,
    summary: paper.summaryZh ?? paper.coreReason ?? '暂无摘要记录',
    meta: [paper.year, paper.venue].filter(Boolean).join(' / '),
    href: `/paper-reading?lit=${paper.id}`,
    tags: paper.tags ?? [],
    sourceId: paper.id,
    verification: paper.unpublished ? 'pending' : 'recorded',
  })),
  ...evolutionNodes.map((node): V3ResearchItem => ({
    id: `ALG-${node.id}`,
    kind: node.kind === 'codec' || node.kind === 'format' ? 'compressor' : 'algorithm',
    title: node.title,
    summary: node.role,
    meta: `${node.year} / ${node.lane}`,
    href: `/algorithm-evolution?focus=${node.id}`,
    tags: node.tags,
    sourceId: node.id,
    verification: node.sourceUrl ? 'verified' : 'recorded',
  })),
  ...compressionDatasets.map((dataset): V3ResearchItem => ({
    id: dataset.id,
    kind: 'dataset',
    title: dataset.name,
    summary: dataset.benchmarkUse,
    meta: `${dataset.scale} / ${dataset.domain}`,
    href: `/datasets?focus=${dataset.id}`,
    tags: dataset.tags,
    sourceId: dataset.id,
    verification: dataset.citationStatus === 'official' ? 'verified' : 'recorded',
  })),
  ...experimentAssets.map((experiment): V3ResearchItem => ({
    id: experiment.id,
    kind: 'experiment',
    title: experiment.name,
    summary: experiment.description,
    meta: experiment.status,
    href: `/experiments?focus=${experiment.id}`,
    tags: [experiment.category],
    sourceId: experiment.id,
    verification: experiment.status === 'verified' ? 'verified' : 'pending',
  })),
  {
    id: firstReport.id,
    kind: 'report',
    title: '第一次双周汇报',
    summary: '2026 年 7 月 10 日项目阶段汇报，当前已收录王坤鹏的 PDF 与 PPTX。',
    meta: '2026-07-10 / 王坤鹏',
    href: `/weekly-reports?report=${firstReport.id}`,
    tags: ['双周汇报', '项目记录'],
    sourceId: firstReport.id,
    verification: 'verified',
  },
];

export const researchCounts = {
  papers: literatureData.filter((paper) => paper.isPublic).length,
  algorithms: evolutionNodes.length,
  datasets: compressionDatasets.length,
  experiments: experimentAssets.length,
};
