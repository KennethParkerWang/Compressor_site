// TutorialCard:教程列表卡片
import React from 'react';
import Link from '@docusaurus/Link';
import {BookOpen, ChevronRight} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '../ui/card';
import {TutorialBadge} from './TutorialBadge';
import type {Tutorial} from '../../data/tutorials';
import styles from './tutorial.module.css';

export interface TutorialCardProps {
  tutorial: Tutorial;
}

export function TutorialCard({tutorial}: TutorialCardProps): React.ReactElement {
  return (
    <Link to={`/tutorials?id=${tutorial.id}`} className={styles.cardLink}>
      <Card className={styles.card}>
        <CardHeader>
          <div className={styles.cardHeaderRow}>
            <TutorialBadge
              stage={tutorial.stage}
              difficulty={tutorial.difficulty}
              estimatedMinutes={tutorial.estimatedMinutes}
            />
            <span className={styles.tutId}>{tutorial.id}</span>
          </div>
          <CardTitle className={styles.cardTitle}>
            <BookOpen size={16} />
            {tutorial.title}
          </CardTitle>
          {tutorial.subtitle && <CardDescription>{tutorial.subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className={styles.summary}>{tutorial.summary}</p>
          {tutorial.tags.length > 0 && (
            <div className={styles.tagRow}>
              {tutorial.tags.slice(0, 4).map((t) => (
                <span key={t} className={styles.tag}>#{t}</span>
              ))}
            </div>
          )}
          <div className={styles.cardFooter}>
            <span className={styles.author}>{tutorial.author} · {tutorial.updatedAt}</span>
            <ChevronRight size={14} className={styles.chev} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default TutorialCard;