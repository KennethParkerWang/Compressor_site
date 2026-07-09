// TutorialNav:上一篇/下一篇导航
import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import {getTutorialById} from '../../data/tutorials';
import styles from './tutorial.module.css';

export interface TutorialNavProps {
  prevId: string | null;
  nextId: string | null;
}

export function TutorialNav({prevId, nextId}: TutorialNavProps): React.ReactElement | null {
  const prev = prevId ? getTutorialById(prevId) : null;
  const next = nextId ? getTutorialById(nextId) : null;
  if (!prev && !next) return null;
  return (
    <nav className={styles.navRow}>
      {prev ? (
        <Link to={`/tutorials?id=${prev.id}`} className={styles.navBtn}>
          <div className={styles.navLabel}><ArrowLeft size={11} style={{display: 'inline', verticalAlign: 'middle'}} /> 上一篇</div>
          <div className={styles.navTitle}>{prev.title}</div>
          <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)'}}>{prev.id}</div>
        </Link>
      ) : (
        <div className={styles.navBtnPlaceholder} />
      )}
      {next ? (
        <Link to={`/tutorials?id=${next.id}`} className={`${styles.navBtn} ${styles.navNext}`}>
          <div className={styles.navLabel}>下一篇 <ArrowRight size={11} style={{display: 'inline', verticalAlign: 'middle'}} /></div>
          <div className={styles.navTitle}>{next.title}</div>
          <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)'}}>{next.id}</div>
        </Link>
      ) : (
        <div className={styles.navBtnPlaceholder} />
      )}
    </nav>
  );
}

export default TutorialNav;