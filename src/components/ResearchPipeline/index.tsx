import React from 'react';
import Link from '@docusaurus/Link';
import type {ResearchTreeNode} from '@/src/data/treeData';
import styles from './styles.module.css';

interface PipelineStage {
  label: string;
  subLabel: string;
  chapters: string[];
  icon: string;
}

const STAGES: readonly PipelineStage[] = [
  {
    label: '数据类型识别',
    subLabel: 'Data Type Detection',
    chapters: ['02'],
    icon: '📁',
  },
  {
    label: '可逆预处理',
    subLabel: 'Reversible Transform',
    chapters: ['03', '10'],
    icon: '🔄',
  },
  {
    label: '概率建模',
    subLabel: 'Probability Modeling',
    chapters: ['05', '06'],
    icon: '🧮',
  },
  {
    label: '熵编�?,
    subLabel: 'Entropy Coding',
    chapters: ['03'],
    icon: '📊',
  },
  {
    label: 'Benchmark',
    subLabel: 'Evaluation & Benchmark',
    chapters: ['09'],
    icon: '🎯',
  },
  {
    label: '算法设计',
    subLabel: 'Algorithm Design',
    chapters: ['10'],
    icon: '⚙️',
  },
];

interface ResearchPipelineProps {
  chapters?: readonly ResearchTreeNode[];
  compact?: boolean;
}

export default function ResearchPipeline({
  chapters = [],
  compact = false,
}: ResearchPipelineProps): React.ReactElement {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>RESEARCH PIPELINE</div>
        <h2 className={styles.title}>压缩算法研究流程</h2>
        <p className={styles.desc}>
          核心技术主�?数据类型识别 �?可逆预处理 �?概率建模 �?熵编�?�?benchmark
          评测 �?模块化算法设计。每个阶段对应特定研究章节�?        </p>
      </div>

      <div className={styles.flow}>
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage.label}>
            <div className={styles.stage}>
              <div className={styles.stageIcon}>{stage.icon}</div>
              <div className={styles.stageLabel}>{stage.label}</div>
              <div className={styles.stageSubLabel}>{stage.subLabel}</div>
              <div className={styles.stageChapters}>
                {stage.chapters.map((ch) => (
                  <span key={ch} className={styles.chapterTag}>
                    Ch.{ch}
                  </span>
                ))}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div className={styles.connector}>�?/div>
            )}
          </React.Fragment>
        ))}
      </div>

      {!compact && chapters.length > 0 && (
        <div className={styles.chapterCards}>
          {chapters.slice(0, 11).map((ch) => (
            <div key={ch.id} className={styles.chapterCard}>
              <span className={styles.chapterNum}>{ch.id}</span>
              <div className={styles.chapterInfo}>
                <div className={styles.chapterTitle}>{ch.titleZh}</div>
                <div className={styles.chapterSubTitle}>{ch.titleEn}</div>
              </div>
              <span className={styles.chapterCount}>
                {ch.literatureCount} 文献
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
