import React from 'react';
import clsx from 'clsx';
import type {ResearchTreeNode} from '@/src/data/treeData';
import styles from './styles.module.css';

interface DirectionCardProps {
  chapter: ResearchTreeNode;
}

export default function DirectionCard({
  chapter,
}: DirectionCardProps): React.ReactElement {
  return (
    <article className={clsx(styles.card)}>
      <div className={styles.head}>
        <span className={styles.chapterId}>{chapter.id}</span>
        <span className={styles.litCount}>
          文献 {chapter.literatureCount} · 资产 {chapter.projectAssetCount}
        </span>
      </div>
      <h3 className={styles.title}>{chapter.titleZh}</h3>
      <p className={styles.titleEn}>{chapter.titleEn}</p>
      {chapter.children && chapter.children.length > 0 ? (
        <ul className={styles.children}>
          {chapter.children.slice(0, 6).map((c) => (
            <li key={c.id}>
              <span className={styles.childId}>{c.id}</span>
              <span>{c.titleZh}</span>
            </li>
          ))}
          {chapter.children.length > 6 ? (
            <li className={styles.more}>
              +{chapter.children.length - 6} 个子方向�?            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}
