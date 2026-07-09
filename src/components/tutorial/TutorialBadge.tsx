// TutorialBadge:难度/时长/阶段徽章
import React from 'react';
import {Clock, Star} from 'lucide-react';
import {Badge} from '../ui/badge';
import {DIFFICULTY_LABELS, STAGE_LABELS, type TutorialDifficulty, type TutorialStage} from '../../data/tutorials';

const STAGE_BG: Record<TutorialStage, string> = {
  entry: '#dcfce7',
  intermediate: '#dbeafe',
  advanced: '#f3e8ff',
};
const STAGE_FG: Record<TutorialStage, string> = {
  entry: '#166534',
  intermediate: '#1e40af',
  advanced: '#6b21a8',
};

export interface TutorialBadgeProps {
  stage?: TutorialStage;
  difficulty?: TutorialDifficulty;
  estimatedMinutes?: number;
  className?: string;
}

export function TutorialBadge({stage, difficulty, estimatedMinutes, className}: TutorialBadgeProps): React.ReactElement {
  return (
    <span className={className} style={{display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap'}}>
      {stage && (
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 6,
            background: STAGE_BG[stage],
            color: STAGE_FG[stage],
            fontWeight: 600,
          }}>
          {STAGE_LABELS[stage]}
        </span>
      )}
      {difficulty && (
        <Badge variant="outline" style={{gap: 4, display: 'inline-flex', alignItems: 'center', fontSize: 11}}>
          <Star size={10} />
          {DIFFICULTY_LABELS[difficulty]}
          {difficulty === 'intro' ? ' ⭐' : difficulty === 'intermediate' ? ' ⭐⭐' : ' ⭐⭐⭐'}
        </Badge>
      )}
      {estimatedMinutes != null && (
        <Badge variant="secondary" style={{gap: 4, display: 'inline-flex', alignItems: 'center', fontSize: 11}}>
          <Clock size={10} />
          {estimatedMinutes} min
        </Badge>
      )}
    </span>
  );
}

export default TutorialBadge;