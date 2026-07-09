// 纯 SVG/CSS 微型条形图,无外部依赖
import React from 'react';
import styles from './BarChart.module.css';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
  hint?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  showLabels?: boolean;
  max?: number;
}

export default function BarChart({data, height = 140, showLabels = true, max}: BarChartProps): React.ReactElement {
  const maxVal = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={styles.wrap} style={{minHeight: height}}>
      <div className={styles.row}>
        {data.map((d, i) => (
          <div key={i} className={styles.col} title={d.hint ?? `${d.label}: ${d.value}`}>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{
                  height: `${(d.value / maxVal) * 100}%`,
                  background: d.color ?? 'var(--cr-accent, #1f4ed8)',
                }}
              />
            </div>
            <div className={styles.value}>{d.value}</div>
            {showLabels ? <div className={styles.label}>{d.label}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}