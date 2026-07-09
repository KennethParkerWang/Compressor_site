import React from 'react';
import Link from '@docusaurus/Link';
import type {LiteratureItem} from '@/src/data/literatureData';
import styles from './styles.module.css';

const PRIORITY_ORDER = ['奠基', '经典', '核心', '标准', '顶级综述'] as const;

interface CorePapersSectionProps {
  papers: readonly LiteratureItem[];
  maxDisplay?: number;
}

export default function CorePapersSection({
  papers,
  maxDisplay = 12,
}: CorePapersSectionProps): React.ReactElement {
  const sorted = [...papers].sort((a, b) => {
    const ia = PRIORITY_ORDER.indexOf(a.priority as typeof PRIORITY_ORDER[number]);
    const ib = PRIORITY_ORDER.indexOf(b.priority as typeof PRIORITY_ORDER[number]);
    const aIdx = ia === -1 ? 99 : ia;
    const bIdx = ib === -1 ? 99 : ib;
    if (aIdx !== bIdx) return aIdx - bIdx;
    if (a.year && b.year) return parseInt(b.year) - parseInt(a.year);
    return 0;
  });

  const display = sorted.slice(0, maxDisplay);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>CORE LITERATURE</span>
          <h2 className={styles.title}>核心文献</h2>
        </div>
        <Link className={styles.viewAll} to="/core">
          查看全部文献 �?        </Link>
      </div>

      <div className={styles.grid}>
        {display.map((paper) => {
          const hasUrl = Boolean(paper.url && paper.url.length > 0);
          return (
            <article key={paper.id} className={styles.card}>
              <div className={styles.cardHeader}>
                {paper.priority ? (
                  <span className={styles.priorityBadge}>{paper.priority}</span>
                ) : null}
                {paper.year ? (
                  <span className={styles.yearBadge}>{paper.year}</span>
                ) : null}
                <span className={styles.chapterBadge}>
                  Ch.{paper.chapterId}
                </span>
              </div>
              <h3 className={styles.titleText}>{paper.title}</h3>
              <div className={styles.meta}>
                {paper.authors && (
                  <span className={styles.authors}>{paper.authors}</span>
                )}
                {paper.venue && (
                  <span className={styles.venue}>{paper.venue}</span>
                )}
              </div>
              {paper.summaryZh && (
                <p className={styles.summary}>{paper.summaryZh}</p>
              )}
              {paper.tags && paper.tags.length > 0 && (
                <div className={styles.tags}>
                  {paper.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {hasUrl && (
                <div className={styles.actions}>
                  <a
                    className={styles.actionLink}
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看原文 �?                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
