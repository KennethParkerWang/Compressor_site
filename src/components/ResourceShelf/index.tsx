import React from 'react';
import clsx from 'clsx';
import {literatureData, type LiteratureItem} from '@/src/data/literatureData';
import styles from './styles.module.css';

interface ResourceShelfProps {
  kinds?: ReadonlyArray<NonNullable<LiteratureItem['sourceKind']>>;
  title?: string;
  emptyText?: string;
}

const KIND_LABEL: Record<NonNullable<LiteratureItem['sourceKind']>, string> = {
  literature: '文献 / Literature',
  standard: '标准 / Standard',
  sourceCode: '源码 / Source Code',
  benchmark: 'Benchmark',
  documentation: '文档 / Documentation',
};

export default function ResourceShelf({
  kinds = ['sourceCode', 'benchmark', 'documentation'],
  title = '可复现资�?,
  emptyText = '暂无相关资源',
}: ResourceShelfProps): React.ReactElement {
  const items = literatureData.filter(
    (d) => d.sourceKind && kinds.includes(d.sourceKind),
  );

  const groups = new Map<string, LiteratureItem[]>();
  items.forEach((it) => {
    const k = (it.sourceKind as string) ?? 'literature';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  });

  return (
    <div className={styles.shelf}>
      <h2 className={styles.title}>{title}</h2>
      {items.length === 0 ? (
        <div className={styles.empty}>{emptyText}</div>
      ) : (
        Array.from(groups.entries()).map(([k, list]) => (
          <section key={k} className={styles.group}>
            <h3 className={styles.groupTitle}>
              {KIND_LABEL[k as keyof typeof KIND_LABEL] ?? k} · {list.length}
            </h3>
            <ul className={styles.list}>
              {list.map((it) => (
                <li key={it.id} className={clsx(styles.row)}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>{it.title}</div>
                    <div className={styles.rowMeta}>
                      {it.chapterTitleZh ? `${it.chapterTitleZh} · ` : ''}
                      {it.sectionTitleZh ?? ''}
                    </div>
                  </div>
                  {it.url ? (
                    <a
                      className={styles.link}
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      访问 �?                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
