export type WeeklyReportStatus = 'scheduled' | 'done' | 'pending';

export interface WeeklyReportSubmission {
  presenterZh: string;
  presenterEn: string;
  submittedAt: string;
  pdfPath: string;
  pptxPath: string;
}

export interface WeeklyReportItem {
  id: string;
  no: number;
  date: string;
  weekdayZh: string;
  weekdayEn: string;
  time: string;
  durationMinutes: number;
  status: WeeklyReportStatus;
  titleZh: string;
  titleEn: string;
  expectedSubmissionCount: number;
  submissions: readonly WeeklyReportSubmission[];
}

interface WeeklyReportOverride {
  expectedSubmissionCount?: number;
  submissions?: readonly WeeklyReportSubmission[];
}

export const FIRST_WEEKLY_REPORT_DATE = '2026-07-10';
export const WEEKLY_REPORT_INTERVAL_DAYS = 14;

export const WEEKLY_REPORT_CADENCE = {
  zh: {
    fixedTime: '每两周周五 14:30-15:30',
    first: '首次汇报：2026-07-10（周五）14:30-15:30',
    rule: '自首次汇报起，每 14 天自动生成一个汇报周期。',
  },
  en: {
    fixedTime: 'Every other Friday 14:30-15:30',
    first: 'First briefing: 2026-07-10 (Friday) 14:30-15:30',
    rule: 'A new briefing cycle is generated every 14 days from the first briefing.',
  },
} as const;

const REPORT_OVERRIDES: Readonly<Record<string, WeeklyReportOverride>> = {
  'WR-2026-07-10': {
    expectedSubmissionCount: 2,
    submissions: [
      {
        presenterZh: '王坤鹏',
        presenterEn: 'Wang Kunpeng',
        submittedAt: '2026-07-10',
        pdfPath: 'reports/2026-07-10/WR-2026-07-10-wang-kunpeng.pdf',
        pptxPath: 'reports/2026-07-10/WR-2026-07-10-wang-kunpeng.pptx',
      },
    ],
  },
};

const FIRST_REPORT_UTC = Date.UTC(2026, 6, 10);
const REPORT_END_TIME = '15:30:00+08:00';
const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function reportDateAt(index: number): Date {
  return new Date(FIRST_REPORT_UTC + index * WEEKLY_REPORT_INTERVAL_DAYS * 86400000);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function reportEndTimestamp(index: number): number {
  return Date.parse(`${formatDate(reportDateAt(index))}T${REPORT_END_TIME}`);
}

export function getNextWeeklyReportIndex(now = new Date()): number {
  const firstEnd = reportEndTimestamp(0);
  const interval = WEEKLY_REPORT_INTERVAL_DAYS * 86400000;
  const elapsed = now.getTime() - firstEnd;
  return elapsed <= 0 ? 0 : Math.ceil(elapsed / interval);
}

export function getWeeklyReportAt(index: number, now = new Date()): WeeklyReportItem {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Invalid biweekly report index: ${index}`);
  }

  const date = reportDateAt(index);
  const dateString = formatDate(date);
  const id = `WR-${dateString}`;
  const override = REPORT_OVERRIDES[id];
  const no = index + 1;

  return {
    id,
    no,
    date: dateString,
    weekdayZh: WEEKDAY_ZH[date.getUTCDay()],
    weekdayEn: WEEKDAY_EN[date.getUTCDay()],
    time: '14:30-15:30',
    durationMinutes: 60,
    status: now.getTime() > reportEndTimestamp(index) ? 'done' : 'scheduled',
    titleZh: `双周汇报 ${String(no).padStart(2, '0')}`,
    titleEn: `Biweekly Briefing ${String(no).padStart(2, '0')}`,
    expectedSubmissionCount: override?.expectedSubmissionCount ?? 2,
    submissions: override?.submissions ?? [],
  };
}

export function getWeeklyReportIndex(id: string | null): number | null {
  const match = /^WR-(\d{4}-\d{2}-\d{2})$/.exec(id ?? '');
  if (!match) return null;

  const timestamp = Date.parse(`${match[1]}T00:00:00Z`);
  const interval = WEEKLY_REPORT_INTERVAL_DAYS * 86400000;
  const delta = timestamp - FIRST_REPORT_UTC;

  if (!Number.isFinite(timestamp) || delta < 0 || delta % interval !== 0) return null;
  return delta / interval;
}

export function getWeeklyReportsAround(centerIndex: number, before = 7, after = 16, now = new Date()): WeeklyReportItem[] {
  const start = Math.max(0, centerIndex - before);
  return Array.from({length: before + after + 1}, (_, offset) => getWeeklyReportAt(start + offset, now));
}
