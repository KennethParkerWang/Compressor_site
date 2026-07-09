// TutorialHeader:详情页头部 - 标题 + 副标题 + 徽章 + 元信息
import React from 'react';
import {Calendar, User} from 'lucide-react';
import {TutorialBadge} from './TutorialBadge';
import type {Tutorial} from '../../data/tutorials';
import styles from './tutorial.module.css';

export interface TutorialHeaderProps {
  tutorial: Tutorial;
}

export function TutorialHeader({tutorial}: TutorialHeaderProps): React.ReactElement {
  return (
    <header className={styles.detailHeader}>
      <TutorialBadge stage={tutorial.stage} difficulty={tutorial.difficulty} estimatedMinutes={tutorial.estimatedMinutes} />
      <h1 className={styles.detailTitle}>{tutorial.title}</h1>
      {tutorial.subtitle && <p className={styles.detailSubtitle}>{tutorial.subtitle}</p>}
      <div className={styles.detailMeta}>
        <span><User size={11} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}} />{tutorial.author}</span>
        <span style={{fontFamily: 'var(--ifm-font-family-monospace)'}}>{tutorial.id}</span>
        <span><Calendar size={11} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}} />更新于 {tutorial.updatedAt}</span>
        {tutorial.tags.length > 0 && (
          <span>
            {tutorial.tags.map((t) => (
              <span key={t} style={{marginRight: 6, color: 'var(--ifm-color-emphasis-600)'}}>#{t}</span>
            ))}
          </span>
        )}
      </div>
    </header>
  );
}

export default TutorialHeader;