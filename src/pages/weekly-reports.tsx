import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Presentation,
  UserRound,
} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  WEEKLY_REPORT_CADENCE,
  WEEKLY_REPORT_INTERVAL_DAYS,
  getWeeklyReportAt,
  getWeeklyReportIndex,
  getWeeklyReportsAround,
  getNextWeeklyReportIndex,
  type WeeklyReportItem,
} from '../data/weeklyReports';
import styles from './weekly-reports.module.css';

type Lang = 'zh' | 'en';

const COPY = {
  zh: {
    title: '双周汇报',
    description: '按固定节奏沉淀每期汇报材料与会议记录。',
    eyebrow: 'Biweekly Report Portal',
    cadence: '汇报周期',
    cadenceValue: '每两周一次',
    firstReport: '首次汇报',
    timeline: '汇报时间线',
    timelineHint: '基于首次汇报日期自动延展',
    nextReport: '下次汇报',
    countdown: '距离开始',
    selectedReport: '当前汇报',
    reportCycle: '汇报期',
    reportDate: '汇报日期',
    reportTime: '汇报时间',
    duration: '汇报时长',
    location: '会议地点',
    locationPending: '待定',
    materials: '已上传报告文件',
    submitted: '已提交',
    pending: '待提交',
    presenter: '汇报人',
    submittedAt: '提交日期',
    previewPdf: '查看 PDF',
    downloadPptx: '下载 PPTX',
    expectedFiles: '本期预计 2 份汇报材料',
    pendingSubmission: '另一位同学材料待补充',
    meetingSummary: '汇报摘要',
    summaryPending: '尚未录入。',
    recording: '会议记录',
    recordingPending: '会议结束后补充。',
    agenda: '会议议程',
    agendaPending: '尚未设置。',
    loadEarlier: '显示更早期',
    loadLater: '显示更多后续',
    days: '天',
    hours: '小时',
    previous: '上一期',
    next: '下一期',
    minutes: '分钟',
  },
  en: {
    title: 'Biweekly Reports',
    description: 'A recurring record of report files and meeting notes.',
    eyebrow: 'Biweekly Report Portal',
    cadence: 'Cadence',
    cadenceValue: 'Every two weeks',
    firstReport: 'First briefing',
    timeline: 'Report Timeline',
    timelineHint: 'Extends automatically from the first briefing',
    nextReport: 'Next briefing',
    countdown: 'Starts in',
    selectedReport: 'Selected briefing',
    reportCycle: 'Cycle',
    reportDate: 'Date',
    reportTime: 'Time',
    duration: 'Duration',
    location: 'Location',
    locationPending: 'Pending',
    materials: 'Uploaded files',
    submitted: 'Submitted',
    pending: 'Pending',
    presenter: 'Presenter',
    submittedAt: 'Submitted',
    previewPdf: 'View PDF',
    downloadPptx: 'Download PPTX',
    expectedFiles: 'Two report files expected for this cycle',
    pendingSubmission: 'Second submission pending',
    meetingSummary: 'Report summary',
    summaryPending: 'Not recorded yet.',
    recording: 'Meeting record',
    recordingPending: 'Add after the meeting.',
    agenda: 'Meeting agenda',
    agendaPending: 'Not set yet.',
    loadEarlier: 'Show earlier',
    loadLater: 'Show more upcoming',
    days: 'd',
    hours: 'h',
    previous: 'Previous briefing',
    next: 'Next briefing',
    minutes: 'min',
  },
} as const;

function reportHref(report: WeeklyReportItem): string {
  return `/weekly-reports?report=${report.id}`;
}

function assetHref(path: string, baseUrl: string): string {
  const siteBase = baseUrl.replace(/\/en\/?$/, '/').replace(/\/+$/, '');
  return `${siteBase}/${path}`;
}

function formatReportDate(report: WeeklyReportItem, lang: Lang): string {
  const [year, month, day] = report.date.split('-').map(Number);
  if (lang === 'en') return `${report.weekdayEn}, ${month}/${day}/${year}`;
  return `${year}年${month}月${day}日 ${report.weekdayZh}`;
}

function formatCountdown(report: WeeklyReportItem, lang: Lang, now: Date): string {
  const start = Date.parse(`${report.date}T14:30:00+08:00`);
  const remaining = Math.max(0, start - now.getTime());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  return lang === 'zh' ? `${days}${COPY.zh.days} ${hours}${COPY.zh.hours}` : `${days}${COPY.en.days} ${hours}${COPY.en.hours}`;
}

function statusCopy(status: WeeklyReportItem['status'], lang: Lang): string {
  const labels = {
    zh: {scheduled: '待汇报', done: '已汇报', pending: '待归档'},
    en: {scheduled: 'Scheduled', done: 'Reported', pending: 'Pending archive'},
  } as const;
  return labels[lang][status];
}

export default function WeeklyReportsPage(): React.ReactElement {
  const location = useLocation();
  const {siteConfig, i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const initialIndex = getWeeklyReportIndex(new URLSearchParams(location.search).get('report')) ?? 0;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [pastCount, setPastCount] = useState(10);
  const [futureCount, setFutureCount] = useState(12);
  const now = useMemo(() => new Date(), []);
  const nextReportIndex = useMemo(() => getNextWeeklyReportIndex(now), [now]);

  useEffect(() => {
    const nextIndex = getWeeklyReportIndex(new URLSearchParams(location.search).get('report'));
    if (nextIndex !== null) setSelectedIndex(nextIndex);
  }, [location.search]);

  const selected = useMemo(() => getWeeklyReportAt(selectedIndex, now), [now, selectedIndex]);
  const timeline = useMemo(() => {
    const before = Math.max(pastCount, nextReportIndex - selectedIndex + 2);
    const after = Math.max(futureCount, selectedIndex - nextReportIndex + 2);
    const reports = getWeeklyReportsAround(nextReportIndex, before, after, now);
    const nextReport = reports.find((report) => report.no === nextReportIndex + 1);
    const earlierReports = reports
      .filter((report) => report.no < nextReportIndex + 1)
      .sort((a, b) => b.no - a.no);
    const laterReports = reports
      .filter((report) => report.no > nextReportIndex + 1)
      .sort((a, b) => a.no - b.no);
    return nextReport ? [nextReport, ...earlierReports, ...laterReports] : reports;
  }, [futureCount, nextReportIndex, now, pastCount, selectedIndex]);
  const nextReport = useMemo(() => getWeeklyReportAt(nextReportIndex, now), [nextReportIndex, now]);
  const submissions = selected.submissions;
  const pendingSubmissionCount = Math.max(0, selected.expectedSubmissionCount - submissions.length);

  return (
    <Layout title={copy.title} description={copy.description}>
      <WorkbenchShell pageTitle={copy.title}>
        <section className={styles.pageIntro}>
          <div>
            <span className={styles.eyebrow}>{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>
          <div className={styles.cadenceSummary}>
            <span>{copy.cadence}</span>
            <strong>{copy.cadenceValue}</strong>
            <em>{WEEKLY_REPORT_CADENCE[lang].fixedTime}</em>
          </div>
        </section>

        <div className={styles.workspace}>
          <aside className={styles.timelinePanel}>
            <div className={styles.panelHead}>
              <div>
                <span className={styles.eyebrow}>{copy.cadence}</span>
                <h2>{copy.timeline}</h2>
              </div>
              <span className={styles.intervalBadge}>{WEEKLY_REPORT_INTERVAL_DAYS}d</span>
            </div>
            <p className={styles.timelineHint}>{copy.timelineHint}</p>

            <div className={styles.timelineList}>
              {timeline.map((report) => {
                const active = report.id === selected.id;
                return (
                  <Link
                    key={report.id}
                    to={reportHref(report)}
                    onClick={() => setSelectedIndex(report.no - 1)}
                    className={styles.timelineItem}
                    data-active={active ? 'true' : 'false'}
                    data-status={report.status}
                  >
                    <span className={styles.timelineDot}>
                      {report.status === 'done' ? <Check size={13} /> : <CalendarDays size={13} />}
                    </span>
                    <span className={styles.timelineBody}>
                      <span className={styles.timelineTopline}>
                        <b>WR-{String(report.no).padStart(2, '0')}</b>
                        <em>{statusCopy(report.status, lang)}</em>
                      </span>
                      <strong>{getReportTitle(report, lang)}</strong>
                      <span>{report.date} · {lang === 'zh' ? report.weekdayZh : report.weekdayEn}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className={styles.timelineControls}>
              <button type="button" onClick={() => setPastCount((count) => count + 10)}>
                <ChevronUp size={14} />
                {copy.loadEarlier}
              </button>
              <button type="button" onClick={() => setFutureCount((count) => count + 10)}>
                <ChevronDown size={14} />
                {copy.loadLater}
              </button>
            </div>
          </aside>

          <main className={styles.detailPane}>
            <section className={styles.nextBanner}>
              <div className={styles.nextBannerMain}>
                <span>{copy.nextReport}</span>
                <h2>{getReportTitle(nextReport, lang)}</h2>
                <p>{formatReportDate(nextReport, lang)} · {nextReport.time}</p>
              </div>
              <div className={styles.nextBannerMeta}>
                <Clock3 size={19} />
                <div>
                  <span>{copy.countdown}</span>
                  <strong>{formatCountdown(nextReport, lang, now)}</strong>
                </div>
              </div>
            </section>

            <section className={styles.reportHeader}>
              <div>
                <div className={styles.reportTitleLine}>
                  <h2>{getReportTitle(selected, lang)}</h2>
                  <span data-status={selected.status}>{statusCopy(selected.status, lang)}</span>
                </div>
                <p>WR-{String(selected.no).padStart(2, '0')}</p>
              </div>
              <div className={styles.headerNav}>
                {selectedIndex > 0 ? (
                  <Link to={reportHref(getWeeklyReportAt(selectedIndex - 1))} className={styles.iconLink} title={copy.previous} aria-label={copy.previous}>
                    <ChevronLeft size={17} />
                  </Link>
                ) : <span className={styles.iconLink} data-disabled="true"><ChevronLeft size={17} /></span>}
                <Link to={reportHref(getWeeklyReportAt(selectedIndex + 1))} className={styles.iconLink} title={copy.next} aria-label={copy.next}>
                  <ChevronRight size={17} />
                </Link>
              </div>
            </section>

            <section className={styles.reportFacts}>
              <div>
                <span>{copy.reportCycle}</span>
                <strong>WR-{String(selected.no).padStart(2, '0')}</strong>
              </div>
              <div>
                <span>{copy.reportDate}</span>
                <strong>{formatReportDate(selected, lang)}</strong>
              </div>
              <div>
                <span>{copy.reportTime}</span>
                <strong><Clock3 size={14} /> {selected.time}</strong>
              </div>
              <div>
                <span>{copy.duration}</span>
                <strong>{selected.durationMinutes} {copy.minutes}</strong>
              </div>
              <div>
                <span>{copy.location}</span>
                <strong><MapPin size={14} /> {copy.locationPending}</strong>
              </div>
            </section>

            <div className={styles.contentGrid}>
              <section className={`${styles.infoPanel} ${styles.presenterPanel}`}>
                <div className={styles.sectionTitle}>
                  <h3>{copy.presenter}</h3>
                  <span>{submissions.length} / {selected.expectedSubmissionCount}</span>
                </div>
                <div className={styles.personList}>
                  {submissions.map((submission) => (
                    <div className={styles.personRow} key={submission.presenterZh}>
                      <span className={styles.personIcon}><UserRound size={17} /></span>
                      <div>
                        <strong>{lang === 'zh' ? submission.presenterZh : submission.presenterEn}</strong>
                        <span>{copy.submitted} · {submission.submittedAt}</span>
                      </div>
                    </div>
                  ))}
                  {Array.from({length: pendingSubmissionCount}).map((_, index) => (
                    <div className={`${styles.personRow} ${styles.pendingRow}`} key={`pending-${index}`}>
                      <span className={styles.personIcon}><UserRound size={17} /></span>
                      <div>
                        <strong>{copy.pendingSubmission}</strong>
                        <span>{copy.pending}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.infoPanel}>
                <div className={styles.sectionTitle}>
                  <h3>{copy.meetingSummary}</h3>
                </div>
                <p className={styles.emptyCopy}>{copy.summaryPending}</p>
              </section>

              <section className={styles.infoPanel}>
                <div className={styles.sectionTitle}>
                  <h3>{copy.agenda}</h3>
                </div>
                <p className={styles.emptyCopy}>{copy.agendaPending}</p>
              </section>

              <section className={styles.infoPanel}>
                <div className={styles.sectionTitle}>
                  <h3>{copy.recording}</h3>
                </div>
                <p className={styles.emptyCopy}>{copy.recordingPending}</p>
              </section>

              <section className={`${styles.infoPanel} ${styles.materialPanel}`}>
                <div className={styles.sectionTitle}>
                  <h3>{copy.materials}</h3>
                  <span>{copy.expectedFiles}</span>
                </div>
                <div className={styles.fileList}>
                  {submissions.map((submission) => (
                    <div className={styles.fileRow} key={submission.pdfPath}>
                      <span className={styles.fileIcon}><Presentation size={17} /></span>
                      <div className={styles.fileName}>
                        <strong>{lang === 'zh' ? `${submission.presenterZh} · 第一次汇报` : `${submission.presenterEn} · First briefing`}</strong>
                        <span>{copy.submittedAt} · {submission.submittedAt}</span>
                      </div>
                      <div className={styles.fileActions}>
                        <a href={assetHref(submission.pdfPath, siteConfig.baseUrl)} target="_blank" rel="noreferrer" title={copy.previewPdf} aria-label={copy.previewPdf}>
                          <ExternalLink size={16} />
                        </a>
                        <a href={assetHref(submission.pptxPath, siteConfig.baseUrl)} download title={copy.downloadPptx} aria-label={copy.downloadPptx}>
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                  {pendingSubmissionCount > 0 ? (
                    <div className={`${styles.fileRow} ${styles.pendingRow}`}>
                      <span className={styles.fileIcon}><FileText size={17} /></span>
                      <div className={styles.fileName}>
                        <strong>{copy.pendingSubmission}</strong>
                        <span>{copy.pending}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

            </div>
          </main>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function getReportTitle(report: WeeklyReportItem, lang: Lang): string {
  return lang === 'zh' ? report.titleZh : report.titleEn;
}
