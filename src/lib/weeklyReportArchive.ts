import type {FileRecord} from './adminApi';
import type {WeeklyReportPresenter} from '../data/weeklyReports';

export type WeeklyReportAssetKind = 'slides' | 'report' | 'minutes' | 'image' | 'other';

export interface WeeklyReportArchiveMetadata {
  version: 1;
  reportId: string;
  presenterId: string;
  presenterZh: string;
  presenterEn: string;
  assetKind: WeeklyReportAssetKind;
}

export interface WeeklyReportArchiveSubmission {
  presenterId: string;
  presenterZh: string;
  presenterEn: string;
  submittedAt: string;
  fileCount: number;
}

const ASSET_KINDS = new Set<WeeklyReportAssetKind>(['slides', 'report', 'minutes', 'image', 'other']);

export function weeklyReportPresenterId(presenter: WeeklyReportPresenter): string {
  return presenter.presenterEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseWeeklyReportArchiveMetadata(file: Pick<FileRecord, 'description'>): WeeklyReportArchiveMetadata | null {
  try {
    const value = JSON.parse(file.description) as Partial<WeeklyReportArchiveMetadata>;
    if (
      value.version !== 1
      || typeof value.reportId !== 'string'
      || typeof value.presenterId !== 'string'
      || typeof value.presenterZh !== 'string'
      || typeof value.presenterEn !== 'string'
      || typeof value.assetKind !== 'string'
      || !ASSET_KINDS.has(value.assetKind as WeeklyReportAssetKind)
    ) return null;
    return value as WeeklyReportArchiveMetadata;
  } catch {
    return null;
  }
}

function submissionDate(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : value.slice(0, 10);
}

export function getWeeklyReportArchiveSubmissions(
  files: readonly FileRecord[],
  reportId: string,
): WeeklyReportArchiveSubmission[] {
  const submissions = new Map<string, WeeklyReportArchiveSubmission>();

  for (const file of files) {
    const metadata = parseWeeklyReportArchiveMetadata(file);
    if (!metadata || metadata.reportId !== reportId || metadata.presenterId === 'shared') continue;

    const existing = submissions.get(metadata.presenterId);
    const submittedAt = submissionDate(file.created_at);
    if (existing) {
      existing.fileCount += 1;
      if (submittedAt < existing.submittedAt) existing.submittedAt = submittedAt;
      continue;
    }

    submissions.set(metadata.presenterId, {
      presenterId: metadata.presenterId,
      presenterZh: metadata.presenterZh,
      presenterEn: metadata.presenterEn,
      submittedAt,
      fileCount: 1,
    });
  }

  return Array.from(submissions.values());
}
