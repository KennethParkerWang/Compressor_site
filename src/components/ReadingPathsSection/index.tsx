import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight, BookOpen} from 'lucide-react';
import {readingPaths} from '@/src/data/readingPaths';
import styles from './styles.module.css';

export default function ReadingPathsSection(): React.ReactElement {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>Reading Paths</span>
            <h2 className={styles.title}>5 条阅读路�?/h2>
            <p className={styles.desc}>
              从理论入门到算法模块设计,提供面向不同受众的系统化阅读路径�?            </p>
          </div>
          <Link className={styles.viewAll} to="/reading-paths">
            查看全部路线
            <ArrowRight size={14} style={{marginLeft: '0.3rem', verticalAlign: 'middle'}} />
          </Link>
        </div>

        <div className={styles.grid}>
          {readingPaths.map((path) => (
            <Link
              key={path.id}
              className={styles.pathCard}
              to="/reading-paths"
            >
              <div className={styles.pathHeader}>
                <div className={styles.pathName}>{path.name}</div>
                <span className={styles.pathDuration}>{path.duration}</span>
              </div>
              <div className={styles.pathAudience}>{path.audience}</div>
              <div className={styles.pathGoal}>{path.goal}</div>
              <div className={styles.steps}>
                {path.steps.slice(0, 4).map((s, i) => (
                  <React.Fragment key={s.ref}>
                    <span className={styles.stepChip}>{s.ref.split(' ')[0]}</span>
                    {i < Math.min(path.steps.length, 4) - 1 && (
                      <span className={styles.stepArrow}>�?/span>
                    )}
                  </React.Fragment>
                ))}
                {path.steps.length > 4 && (
                  <span className={styles.stepArrow}>+{path.steps.length - 4}</span>
                )}
              </div>
              <div className={styles.chapters}>
                {path.chapters.map((c) => (
                  <span key={c} className={styles.chapterTag}>Ch.{c}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}