import React from 'react';
import styles from './styles.module.css';

interface StatEntry {
  value: number;
  labelZh: string;
  labelEn: string;
  desc: string;
  icon: string;
}

const STATS: readonly StatEntry[] = [
  {
    value: 11,
    labelZh: '研究章节',
    labelEn: 'Chapters',
    desc: '覆盖理论、数据、算法、实验、总控',
    icon: '📚',
  },
  {
    value: 88,
    labelZh: '技术方向',
    labelEn: 'Research Directions',
    desc: '细分到每个子领域的研究方向',
    icon: '🔍',
  },
  {
    value: 338,
    labelZh: '公开文献',
    labelEn: 'Public Sources',
    desc: '论文、标准、源码、数据集、benchmark',
    icon: '📄',
  },
  {
    value: 62,
    labelZh: '项目资产',
    labelEn: 'Project Assets',
    desc: '模板、脚本、任务表、实验协议',
    icon: '🗂️',
  },
  {
    value: 5,
    labelZh: '阅读路线',
    labelEn: 'Reading Paths',
    desc: '5 条已组织好的阅读路线,带目标和实验',
    icon: '🛣️',
  },
];

export default function ProjectStats(): React.ReactElement {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {STATS.map((s) => (
            <div key={s.labelEn} className={styles.card}>
              <div className={styles.icon}>{s.icon}</div>
              <div className={styles.value}>{s.value}</div>
              <div className={styles.labelZh}>{s.labelZh}</div>
              <div className={styles.labelEn}>{s.labelEn}</div>
              <div className={styles.desc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}