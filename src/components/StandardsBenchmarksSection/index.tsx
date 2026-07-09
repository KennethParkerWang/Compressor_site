import React from 'react';
import styles from './styles.module.css';

interface EntryItem {
  name: string;
  desc: string;
  icon: string;
}

interface EntryColumn {
  title: string;
  icon: string;
  count: number;
  iconBg: string;
  items: readonly EntryItem[];
}

const COLUMNS: readonly EntryColumn[] = [
  {
    title: 'Standards',
    icon: '📜',
    count: 5,
    iconBg: '#e0e7ff',
    items: [
      {
        name: 'RFC 1951 / DEFLATE',
        desc: '工业标准压缩算法',
        icon: '📄',
      },
      {
        name: 'RFC 1952 / GZIP',
        desc: 'GNU zip 压缩格式',
        icon: '📦',
      },
      {
        name: 'DICOM Part 5',
        desc: '医学影像数据编码',
        icon: '🏥',
      },
      {
        name: 'CCSDS 121.0',
        desc: '航天数据无损压缩标准',
        icon: '🛰️',
      },
      {
        name: 'FITS 3.0',
        desc: '天文科学数据格式',
        icon: '🔭',
      },
    ],
  },
  {
    title: 'Benchmarks',
    icon: '🎯',
    count: 5,
    iconBg: '#d1fae5',
    items: [
      {
        name: 'Calgary Corpus',
        desc: '经典压缩测试集',
        icon: '📊',
      },
      {
        name: 'Silesia Corpus',
        desc: '高压缩率评测语料',
        icon: '🗂️',
      },
      {
        name: 'Canterbury Corpus',
        desc: '通用压缩基准',
        icon: '📁',
      },
      {
        name: 'NNLCB Benchmark',
        desc: '神经压缩基线评测',
        icon: '🧠',
      },
      {
        name: 'enwik9',
        desc: 'Wikipedia 文本语料',
        icon: '📖',
      },
    ],
  },
  {
    title: 'Source Code',
    icon: '⚙️',
    count: 5,
    iconBg: '#fef3c7',
    items: [
      {
        name: 'PAQ8PX',
        desc: '最高压缩率开源实现',
        icon: '🔧',
      },
      {
        name: 'CMIX',
        desc: '神经上下文混合压缩',
        icon: '🧮',
      },
      {
        name: 'DeepZip',
        desc: '深度学习压缩基线',
        icon: '🌀',
      },
      {
        name: 'TRACE',
        desc: 'Transformer 字节压缩',
        icon: '⚡',
      },
      {
        name: 'ZFP',
        desc: '科学浮点数据压缩',
        icon: '🔢',
      },
    ],
  },
];

export default function StandardsBenchmarksSection(): React.ReactElement {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>STANDARDS & BENCHMARKS</div>
        <h2 className={styles.title}>标准与基准</h2>
        <p className={styles.desc}>
          国际标准、工业规范、基准数据集与开源参考实现的分类索引。
        </p>
      </div>

      <div className={styles.grid}>
        {COLUMNS.map((col) => (
          <div key={col.title} className={styles.column}>
            <div className={styles.columnHeader}>
              <div
                className={styles.columnIcon}
                style={{background: col.iconBg}}
              >
                {col.icon}
              </div>
              <div>
                <div className={styles.columnTitle}>{col.title}</div>
                <div className={styles.columnCount}>{col.count} 项</div>
              </div>
            </div>
            <div className={styles.items}>
              {col.items.map((item) => (
                <div key={item.name} className={styles.item}>
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <div className={styles.itemContent}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDesc}>{item.desc}</div>
                  </div>
                  <span className={styles.itemArrow}>→</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
