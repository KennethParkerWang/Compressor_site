import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight} from 'lucide-react';
import {experimentAssets} from '@/src/data/experimentData';
import styles from './styles.module.css';

const STATUS_LABEL: Record<string, string> = {
  todo: 'todo',
  downloaded: 'downloaded',
  verified: 'verified',
  runnable: 'runnable',
  failed: 'failed',
};

const BASELINES = [
  {name: 'gzip', chapter: 'Ch.04', type: '经典', size: '-', speed: '★★', ratio: '�?},
  {name: 'bzip2', chapter: 'Ch.04', type: '经典', size: '-', speed: '�?, ratio: '★★'},
  {name: 'zstd', chapter: 'Ch.04', type: '工业', size: '3-level', speed: '★★★★�?, ratio: '★★'},
  {name: 'brotli', chapter: 'Ch.04', type: 'Web', size: '11-level', speed: '★★★★', ratio: '★★�?},
  {name: 'PAQ8PX', chapter: 'Ch.05', type: '高压缩率', size: '-', speed: '�?, ratio: '★★★★'},
  {name: 'CMIX', chapter: 'Ch.05', type: '近熵', size: '-', speed: '�?, ratio: '★★★★�?},
  {name: 'NNCP', chapter: 'Ch.06', type: '神经', size: '-', speed: '★★', ratio: '★★�?},
  {name: 'TRACE', chapter: 'Ch.06', type: '神经', size: '-', speed: '★★', ratio: '★★�?},
];

export default function BenchmarkMatrixSection(): React.ReactElement {
  const resources = experimentAssets
    .filter((a) => a.category === 'baseline' || a.category === 'dataset' || a.category === 'tool')
    .slice(0, 6);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>Benchmark Matrix</span>
            <h2 className={styles.title}>基准矩阵</h2>
            <p className={styles.desc}>
              主流压缩器在速度-压缩率谱系上的位�?以及关联的实验资源状态�?            </p>
          </div>
          <Link className={styles.viewAll} to="/experiments">
            进入实验�?            <ArrowRight size={14} style={{marginLeft: '0.3rem', verticalAlign: 'middle'}} />
          </Link>
        </div>

        <div className={styles.layout}>
          <div className={styles.matrixCard}>
            <div className={styles.matrixHeader}>
              <span className={styles.matrixTitle}>Baselines & Trade-off</span>
              <span className={styles.matrixMeta}>8 baselines · 5 categories</span>
            </div>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Baseline</th>
                  <th>类型</th>
                  <th>章节</th>
                  <th>Speed</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {BASELINES.map((b) => (
                  <tr key={b.name}>
                    <td><strong>{b.name}</strong></td>
                    <td>{b.type}</td>
                    <td className="mono">{b.chapter}</td>
                    <td className={b.speed.length >= 5 ? styles.cellFaster : ''}>{b.speed}</td>
                    <td className={b.ratio.length >= 5 ? styles.cellFaster : ''}>{b.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.sideList}>
            {resources.map((r) => (
              <Link
                key={r.id}
                className={styles.resourceItem}
                to="/experiments"
              >
                <div className={styles.resourceIcon}>
                  {r.category === 'dataset' ? '💾' : r.category === 'baseline' ? '⚙️' : '🔧'}
                </div>
                <div className={styles.resourceContent}>
                  <div className={styles.resourceName}>{r.name}</div>
                  <div className={styles.resourceMeta}>
                    {r.id} · {r.size ?? '-'}
                  </div>
                </div>
                <span
                  className={`${styles.resourceStatus} ${
                    styles[`status${STATUS_LABEL[r.status].charAt(0).toUpperCase() + STATUS_LABEL[r.status].slice(1)}`]
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}