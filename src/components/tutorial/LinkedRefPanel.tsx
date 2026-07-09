// LinkedRefPanel:侧边栏 - 涉及的术语/论文/资源/资产
import React from 'react';
import Link from '@docusaurus/Link';
import {literatureData} from '../../data/literatureData';
import {TERMS} from '../../data/terms';
import {RESOURCES} from '../../data/resources';
import projectAssets from '../../data/projectAssets.json';
import styles from './tutorial.module.css';

export interface LinkedRefPanelProps {
  terms?: string[];
  papers?: string[];
  resources?: string[];
  assets?: string[];
}

export function LinkedRefPanel({terms, papers, resources, assets}: LinkedRefPanelProps): React.ReactElement {
  return (
    <aside>
      {terms && terms.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>涉及术语 ({terms.length})</div>
          <div className={styles.panelList}>
            {terms.map((t) => {
              const term = TERMS.find((x) => x.name === t);
              return (
                <Link key={t} to={`/terms#${t}`} className={styles.panelLink}>
                  {term?.emoji ?? '·'} {t}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {papers && papers.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>涉及论文 ({papers.length})</div>
          <div className={styles.panelList}>
            {papers.map((id) => {
              const lit = literatureData.find((x) => x.id === id);
              return (
                <Link key={id} to={`/core?focus=${id}`} className={styles.panelLink}>
                  {lit?.title ?? id}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {resources && resources.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>外部资源 ({resources.length})</div>
          <div className={styles.panelList}>
            {resources.map((name) => {
              const r = RESOURCES.find((x) => x.name === name);
              return (
                <a key={name} href={r?.url} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
                  {r?.emoji ?? '·'} {name} ↗
                </a>
              );
            })}
          </div>
        </div>
      )}
      {assets && assets.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>项目资产 ({assets.length})</div>
          <div className={styles.panelList}>
            {assets.map((id) => {
              const a = projectAssets.find((x) => x.id === id);
              return (
                <div key={id} style={{fontSize: 12, marginBottom: 4}}>
                  <strong style={{fontFamily: 'var(--ifm-font-family-monospace)'}}>{id}</strong>
                  {' · '}{a?.title ?? ''}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

export default LinkedRefPanel;