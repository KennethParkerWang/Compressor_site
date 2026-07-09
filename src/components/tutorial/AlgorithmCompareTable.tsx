// AlgorithmCompareTable:算法对比表
import React from 'react';
import styles from './tutorial.module.css';

export interface CompareRow {
  dimension: string;
  values: Record<string, string>;
}

export interface AlgorithmCompareTableProps {
  title?: string;
  columns: string[];
  rows: CompareRow[];
  sourceUrl?: string;
}

export function AlgorithmCompareTable({title, columns, rows, sourceUrl}: AlgorithmCompareTableProps): React.ReactElement {
  return (
    <div>
      {title && <div style={{fontWeight: 600, fontSize: 14, marginBottom: 8}}>{title}</div>}
      <div style={{overflowX: 'auto'}}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th>维度</th>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{fontWeight: 600}}>{r.dimension}</td>
                {columns.map((c) => (
                  <td key={c}>{r.values[c] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sourceUrl && (
        <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)', marginTop: 4}}>
          来源:<a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{color: 'var(--ifm-color-primary)'}}>{sourceUrl}</a>
        </div>
      )}
    </div>
  );
}

export default AlgorithmCompareTable;