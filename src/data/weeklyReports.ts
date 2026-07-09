export type WeeklyReportStatus = 'scheduled' | 'done';

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
  summaryZh: string;
  summaryEn: string;
}

export const FIRST_WEEKLY_REPORT_DATE = '2026-07-10';

export const WEEKLY_REPORT_CADENCE = {
  zh: {
    fixedTime: '每两周周五 14:30-15:30',
    first: '首次汇报：2026-07-10（周五）14:30-15:30',
    rule: '这里只保留汇报周期和每期入口，具体内容进入对应汇报后再整理。',
  },
  en: {
    fixedTime: 'Every other Friday 14:30-15:30',
    first: 'First briefing: 2026-07-10 (Friday) 14:30-15:30',
    rule: 'This page only keeps the cadence and entry points. Content is organized inside each briefing.',
  },
} as const;

export const weeklyReports: readonly WeeklyReportItem[] = [
  {
    id: 'WR-2026-07-10',
    no: 1,
    date: '2026-07-10',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 01',
    titleEn: 'Biweekly Briefing 01',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-07-24',
    no: 2,
    date: '2026-07-24',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 02',
    titleEn: 'Biweekly Briefing 02',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-08-07',
    no: 3,
    date: '2026-08-07',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 03',
    titleEn: 'Biweekly Briefing 03',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-08-21',
    no: 4,
    date: '2026-08-21',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 04',
    titleEn: 'Biweekly Briefing 04',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-09-04',
    no: 5,
    date: '2026-09-04',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 05',
    titleEn: 'Biweekly Briefing 05',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-09-18',
    no: 6,
    date: '2026-09-18',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 06',
    titleEn: 'Biweekly Briefing 06',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-10-09',
    no: 7,
    date: '2026-10-09',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 07',
    titleEn: 'Biweekly Briefing 07',
    summaryZh: '',
    summaryEn: '',
  },
  {
    id: 'WR-2026-10-23',
    no: 8,
    date: '2026-10-23',
    weekdayZh: '周五',
    weekdayEn: 'Friday',
    time: '14:30-15:30',
    durationMinutes: 60,
    status: 'scheduled',
    titleZh: '双周汇报 08',
    titleEn: 'Biweekly Briefing 08',
    summaryZh: '',
    summaryEn: '',
  },
];
