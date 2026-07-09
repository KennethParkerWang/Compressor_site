// DatasetCard:数据集卡片 - 消费 resources.ts category=dataset
import React from 'react';
import {Database} from 'lucide-react';
import {RESOURCES} from '../../data/resources';
import styles from './tutorial.module.css';

export interface DatasetCardProps {
  name: string;
}

export function DatasetCard({name}: DatasetCardProps): React.ReactElement | null {
  const ds = RESOURCES.find((r) => r.name === name && r.category === 'dataset');
  if (!ds) return null;
  return (
    <a href={ds.url} target="_blank" rel="noopener noreferrer" className={styles.datasetCard}
       style={{textDecoration: 'none', color: 'inherit'}}>
      <div className={styles.datasetName}>
        <Database size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: 6}} />
        {ds.emoji} {ds.name}
      </div>
      <div className={styles.datasetBrief}>{ds.briefZh}</div>
      {ds.tags && ds.tags.length > 0 && (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4}}>
          {ds.tags.slice(0, 4).map((t) => (
            <span key={t} style={{fontSize: 10, padding: '1px 6px', background: 'var(--ifm-color-emphasis-100)', borderRadius: 4}}>{t}</span>
          ))}
        </div>
      )}
    </a>
  );
}

export function DatasetCardList({names}: {names: string[]}): React.ReactElement {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, margin: '12px 0'}}>
      {names.map((n) => <DatasetCard key={n} name={n} />)}
    </div>
  );
}

export default DatasetCard;