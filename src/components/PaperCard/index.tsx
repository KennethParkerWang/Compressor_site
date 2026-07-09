import React from 'react';
import clsx from 'clsx';
import type {LiteratureItem} from '@/src/data/literatureData';
import styles from './styles.module.css';

interface PaperCardProps {
  paper: LiteratureItem;
}

export default function PaperCard({paper}: PaperCardProps): React.ReactElement {
  const hasUrl = Boolean(paper.url && paper.url.length > 0);
  return (
    <article className={clsx(styles.card)}>
      <div className={styles.head}>
        <span className={styles.id}>{paper.id}</span>
        {paper.priority ? (
          <span className={styles.priority}>{paper.priority}</span>
        ) : null}
      </div>
      <h3 className={styles.title}>{paper.title}</h3>
      <div className={styles.meta}>
        {paper.authors ? <span>{paper.authors}</span> : null}
        {paper.year ? <span> · {paper.year}</span> : null}
        {paper.venue ? <span> · {paper.venue}</span> : null}
      </div>
      {paper.summaryZh ? (
        <p className={styles.summary}>{paper.summaryZh}</p>
      ) : null}
      <div className={styles.tags}>
        {paper.chapterTitleZh ? (
          <span className={styles.tag}>{paper.chapterTitleZh}</span>
        ) : null}
        {paper.sectionTitleZh ? (
          <span className={styles.tag}>{paper.sectionTitleZh}</span>
        ) : null}
        {paper.tags?.slice(0, 3).map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
      </div>
      {hasUrl ? (
        <a
          className={styles.link}
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          查看原文 �?        </a>
      ) : null}
    </article>
  );
}
