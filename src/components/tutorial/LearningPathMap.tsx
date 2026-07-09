// LearningPathMap:学习路径图 - 复用 readingPaths.ts
import React from 'react';
import Link from '@docusaurus/Link';
import {readingPaths} from '../../data/readingPaths';
import {TutorialBadge} from './TutorialBadge';
import styles from './tutorial.module.css';

export interface LearningPathMapProps {
  tutorialId?: string;
  highlightId?: string;
}

export function LearningPathMap({tutorialId, highlightId}: LearningPathMapProps): React.ReactElement {
  const path = readingPaths.find((p) => p.experimentIds?.includes(tutorialId ?? '')) ?? readingPaths[0];
  if (!path) return <div>未找到路径</div>;
  const isActive = (ref: string) => ref === highlightId;
  return (
    <div className={styles.pathMap}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
        <strong style={{fontSize: 14}}>{path.nameZh}</strong>
        <span style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)'}}>{path.duration} · {path.steps.length} 步</span>
      </div>
      {path.steps.map((step, i) => (
        <div
          key={i}
          className={`${styles.pathNode} ${isActive(step.ref) ? styles.pathNodeActive : ''}`}>
          <div className={styles.pathNodeId}>{step.litId ?? step.ref}</div>
          <div className={styles.pathNodeBody}>
            <div className={styles.pathNodeTitle}>{step.ref}</div>
            {step.note && <div className={styles.pathNodeNote}>{step.note}</div>}
            {step.stage && (
              <div style={{marginTop: 4}}>
                <span style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)'}}>
                  阶段: {step.stage}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default LearningPathMap;