import React from 'react';
import styles from './styles.module.css';

interface PaperThumbnailProps {
  chapterId: string;
  sourceKind?: string;
  priority?: string;
  year?: string;
  tags?: readonly string[];
  title?: string;
}

const CHAPTER_COLORS: Record<string, string> = {
  '01': '#3b82f6',
  '02': '#8b5cf6',
  '03': '#ec4899',
  '04': '#f97316',
  '05': '#10b981',
  '06': '#06b6d4',
  '07': '#f59e0b',
  '08': '#6366f1',
  '09': '#ef4444',
  '10': '#14b8a6',
  '11': '#a855f7',
};

const KIND_ICONS: Record<string, string> = {
  literature: '📄',
  paper: '📄',
  standard: '📜',
  benchmark: '🎯',
  sourceCode: '⚙️',
  documentation: '📃',
};

const PRIORITY_GRADIENTS: Record<string, string> = {
  '奠基': 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
  '经典': 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)',
  '核心': 'linear-gradient(135deg, #1e3a5f 0%, #059669 100%)',
  '标准': 'linear-gradient(135deg, #1e3a5f 0%, #dc2626 100%)',
  '顶级综述': 'linear-gradient(135deg, #1e3a5f 0%, #d97706 100%)',
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generatePattern(seed: number): string {
  const hue = (seed * 37) % 360;
  const patterns = [
    `repeating-linear-gradient(45deg, transparent, transparent 4px, hsla(${hue}, 60%, 50%, 0.08) 4px, hsla(${hue}, 60%, 50%, 0.08) 8px)`,
    `radial-gradient(circle at 25% 25%, hsla(${hue}, 60%, 60%, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsla(${hue + 120}, 60%, 50%, 0.1) 0%, transparent 50%)`,
    `conic-gradient(from 0deg at 50% 50%, hsla(${hue}, 60%, 50%, 0.1), hsla(${hue + 60}, 60%, 40%, 0.05), hsla(${hue + 120}, 60%, 50%, 0.1))`,
  ];
  return patterns[seed % patterns.length];
}

export default function PaperThumbnail({
  chapterId,
  sourceKind,
  priority,
  year,
  tags,
  title,
}: PaperThumbnailProps): React.ReactElement {
  const color = CHAPTER_COLORS[chapterId] ?? '#3b82f6';
  const icon = KIND_ICONS[sourceKind ?? 'paper'] ?? '📄';
  const gradient = priority && PRIORITY_GRADIENTS[priority]
    ? PRIORITY_GRADIENTS[priority]
    : `linear-gradient(135deg, #1e3a5f 0%, ${color} 100%)`;
  const seed = hashCode((title ?? chapterId) + (year ?? ''));
  const pattern = generatePattern(seed);
  const y = year ? parseInt(year) : 2020;
  const decadeLabel = y < 1970 ? '1940s' : y < 1980 ? '1950s' : y < 1990 ? '1960s' : y < 2000 ? '1970s' : y < 2010 ? '2000s' : y < 2015 ? '2010s' : y < 2020 ? '2015s' : '2020s';

  return (
    <div
      className={styles.thumbnail}
      style={{background: gradient, backgroundImage: `${gradient}, ${pattern}`}}
    >
      <div className={styles.topRow}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.chapter}>Ch.{chapterId}</span>
      </div>
      <div className={styles.middleRow}>
        <div className={styles.yearBadge}>{decadeLabel}</div>
        {priority && (
          <div className={styles.priorityDot} style={{background: color}} />
        )}
      </div>
      <div className={styles.bottomRow}>
        {tags && tags.slice(0, 2).map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
      <div className={styles.gridPattern} />
    </div>
  );
}
