import React from 'react';
import clsx from 'clsx';
import {roadmapData} from '@/src/data/roadmapData';
import styles from './styles.module.css';

export default function RoadmapTimeline(): React.ReactElement {
  return (
    <ol className={styles.timeline}>
      {roadmapData.map((p) => (
        <li key={p.id} className={styles.item}>
          <div className={styles.marker}>
            <span className={styles.dot} />
          </div>
          <div className={styles.body}>
            <div className={styles.phaseRow}>
              <h3 className={styles.phase}>{p.phaseZh}</h3>
              <span className={styles.phaseEn}>{p.phaseEn}</span>
            </div>
            <p className={styles.goal}>{p.goalZh}</p>
            <div className={styles.chapters}>
              章节:{p.chapters.join(' · ')}
            </div>

            {p.milestones && p.milestones.length > 0 ? (
              <Section title="关键里程�? items={p.milestones} />
            ) : null}
            {p.keyQuestions && p.keyQuestions.length > 0 ? (
              <Section title="关键问题" items={p.keyQuestions} />
            ) : null}
            {p.deliverables && p.deliverables.length > 0 ? (
              <Section title="交付�? items={p.deliverables} />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}): React.ReactElement {
  return (
    <div className={clsx(styles.section)}>
      <div className={styles.sectionTitle}>{title}</div>
      <ul className={styles.sectionList}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
