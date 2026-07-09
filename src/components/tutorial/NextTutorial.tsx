// NextTutorial:推荐下篇 - 自动按 nextId / 同 stage 取下一篇
import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight} from 'lucide-react';
import {getTutorialById, TUTORIALS} from '../../data/tutorials';
import {TutorialBadge} from './TutorialBadge';

export interface NextTutorialProps {
  tutorialId: string;
  fallback?: string;
}

export function NextTutorial({tutorialId, fallback}: NextTutorialProps): React.ReactElement | null {
  const cur = getTutorialById(tutorialId);
  if (!cur) return null;
  const next = (cur.nextId ? getTutorialById(cur.nextId) : null)
    ?? getTutorialById(fallback ?? '')
    ?? TUTORIALS.find((t) => t.stage === cur.stage && t.id !== cur.id);
  if (!next) return null;
  return (
    <Link to={`/tutorials?id=${next.id}`} style={{
      display: 'block',
      padding: 16,
      marginTop: 24,
      borderRadius: 12,
      background: 'linear-gradient(135deg, var(--ifm-color-primary-contrast-background), transparent)',
      border: '1px solid var(--ifm-color-primary)',
      textDecoration: 'none',
      color: 'inherit',
    }}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
        <span style={{fontSize: 11, fontWeight: 600, color: 'var(--ifm-color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          <ArrowRight size={11} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}} />
          推荐下篇
        </span>
        <TutorialBadge stage={next.stage} difficulty={next.difficulty} estimatedMinutes={next.estimatedMinutes} />
      </div>
      <div style={{fontWeight: 600, fontSize: 16, marginBottom: 4}}>{next.title}</div>
      <div style={{fontSize: 12, color: 'var(--ifm-color-emphasis-700)'}}>{next.summary}</div>
      <div style={{fontSize: 10, color: 'var(--ifm-color-emphasis-600)', marginTop: 6, fontFamily: 'var(--ifm-font-family-monospace)'}}>{next.id}</div>
    </Link>
  );
}

export default NextTutorial;