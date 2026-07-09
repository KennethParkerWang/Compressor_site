import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {ArrowRight, CalendarCheck, Clock3} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {
  FIRST_WEEKLY_REPORT_DATE,
  WEEKLY_REPORT_CADENCE,
  weeklyReports,
  type WeeklyReportItem,
} from '../data/weeklyReports';
import styles from './weekly-reports.module.css';

type Lang = 'zh' | 'en';

const PAGE_COPY = {
  zh: {
    title: '双周汇报',
    layoutTitle: '双周汇报',
    hint: '只保留双周汇报周期和每期入口。',
    kicker: 'Biweekly Reports',
    heroTitle: '双周汇报入口',
    heroLead: '这里不预填汇报题目、规划、大纲和材料，只保留固定周期与每期入口。',
    firstDate: '首次汇报',
    cadence: '汇报周期',
    total: '汇报期数',
    reports: '期',
    schedule: '排期',
    timelineTitle: '汇报周期',
    timelineDesc: '每两周一次。点击入口后进入对应汇报页，再按当期实际进展整理内容。',
    openReport: '进入',
    selected: '当前入口',
  },
  en: {
    title: 'Biweekly Reports',
    layoutTitle: 'Biweekly Reports',
    hint: 'Only keep the biweekly cadence and entry points.',
    kicker: 'Biweekly Reports',
    heroTitle: 'Biweekly Report Entries',
    heroLead: 'No preset topics, plans, outlines, or materials. This page only keeps the cadence and per-briefing entries.',
    firstDate: 'First Briefing',
    cadence: 'Cadence',
    total: 'Entries',
    reports: 'briefings',
    schedule: 'Schedule',
    timelineTitle: 'Report Cadence',
    timelineDesc: 'One entry every two weeks. Open an entry and organize content there according to actual progress.',
    openReport: 'Open',
    selected: 'Selected',
  },
} as const;

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function localizePath(path: string, lang: Lang): string {
  return lang === 'en' ? `/en${path === '/' ? '' : path}` : path;
}

function getReportTitle(report: WeeklyReportItem, lang: Lang): string {
  return lang === 'zh' ? report.titleZh : report.titleEn;
}

function getReportHref(report: WeeklyReportItem, lang: Lang): string {
  return `${localizePath('/weekly-reports', lang)}?report=${report.id}`;
}

export default function WeeklyReportsPage(): React.ReactElement {
  const location = useLocation();
  const lang: Lang = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const copy = PAGE_COPY[lang];
  const [selectedId, setSelectedId] = useState(weeklyReports[0].id);

  const selected = useMemo(
    () => weeklyReports.find((report) => report.id === selectedId) ?? weeklyReports[0],
    [selectedId],
  );
  const firstReport = weeklyReports[0];

  useEffect(() => {
    const reportId = new URLSearchParams(location.search).get('report');
    if (reportId && weeklyReports.some((report) => report.id === reportId)) {
      setSelectedId(reportId);
    }
  }, [location.search]);

  return (
    <Layout title={copy.layoutTitle} description={copy.hint}>
      <WorkbenchShell pageTitle={copy.title}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{copy.kicker}</span>
            <h2>{copy.heroTitle}</h2>
            <p>{copy.heroLead}</p>
          </div>
          <div className={styles.heroPanel}>
            <div>
              <span>{copy.firstDate}</span>
              <strong>{FIRST_WEEKLY_REPORT_DATE}</strong>
              <em>{lang === 'zh' ? firstReport.weekdayZh : firstReport.weekdayEn} {firstReport.time}</em>
            </div>
            <div>
              <span>{copy.cadence}</span>
              <strong>{WEEKLY_REPORT_CADENCE[lang].fixedTime}</strong>
              <em>{WEEKLY_REPORT_CADENCE[lang].rule}</em>
            </div>
          </div>
        </section>

        <section className={styles.metrics} aria-label={copy.cadence}>
          <article>
            <CalendarCheck size={18} />
            <span>{copy.total}</span>
            <strong>{weeklyReports.length} {copy.reports}</strong>
          </article>
          <article>
            <Clock3 size={18} />
            <span>{copy.cadence}</span>
            <strong>{WEEKLY_REPORT_CADENCE[lang].fixedTime}</strong>
          </article>
        </section>

        <section className={styles.schedule}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>{copy.schedule}</span>
              <h2>{copy.timelineTitle}</h2>
              <p>{copy.timelineDesc}</p>
            </div>
          </div>

          <div className={styles.reportList}>
            {weeklyReports.map((report) => {
              const active = report.id === selected.id;
              return (
                <article
                  key={report.id}
                  className={styles.reportCard}
                  data-active={active ? 'true' : 'false'}
                >
                  <div className={styles.reportMain}>
                    <span className={styles.reportNo}>WR-{String(report.no).padStart(2, '0')}</span>
                    <strong>{getReportTitle(report, lang)}</strong>
                    <span className={styles.reportDate}>
                      {report.date} · {lang === 'zh' ? report.weekdayZh : report.weekdayEn} · {report.time}
                    </span>
                  </div>
                  <div className={styles.reportActions}>
                    {active ? <span className={styles.selectedBadge}>{copy.selected}</span> : null}
                    <Link
                      to={getReportHref(report, lang)}
                      className={styles.openLink}
                      onClick={() => setSelectedId(report.id)}
                    >
                      {copy.openReport}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </WorkbenchShell>
    </Layout>
  );
}
