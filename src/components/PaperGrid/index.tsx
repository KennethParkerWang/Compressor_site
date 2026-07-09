import React from 'react';
import type {LiteratureItem} from '@/src/data/literatureData';
import PaperCard from '@/src/components/PaperCard';
import styles from './styles.module.css';

interface PaperGridProps {
  papers: readonly LiteratureItem[];
  emptyText?: string;
}

export default function PaperGrid({
  papers,
  emptyText = '暂无文献',
}: PaperGridProps): React.ReactElement {
  if (papers.length === 0) {
    return <div className={styles.empty}>{emptyText}</div>;
  }
  return (
    <div className={styles.grid}>
      {papers.map((p) => (
        <PaperCard key={p.id} paper={p} />
      ))}
    </div>
  );
}
