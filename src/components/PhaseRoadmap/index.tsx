import React from 'react';
import type {ResearchTreeNode} from '@/src/data/treeData';
import styles from './styles.module.css';

const PHASES: readonly {
  num: string;
  title: string;
  goal: string;
  chapters: readonly string[];
}[] = [
  {
    num: 'Phase 1',
    title: '理论与数据基础',
    goal: '建立无损压缩基本理论、数据类型和码流机制',
    chapters: ['01', '02', '03'],
  },
  {
    num: 'Phase 2',
    title: '传统与高压缩率系�?,
    goal: '建立工业 baseline，拆�?PAQ8PX/CMIX 高压缩率技术路�?,
    chapters: ['04', '05'],
  },
  {
    num: 'Phase 3',
    title: '神经与领域专用扩�?,
    goal: '研究神经概率模型、领域专用压缩和残差/近无损参考方�?,
    chapters: ['06', '07', '08'],
  },
  {
    num: 'Phase 4',
    title: '实验协议与算法设�?,
    goal: '建立 benchmark、复现协议和可迁移算法模块方�?,
    chapters: ['09', '10'],
  },
  {
    num: 'Phase 5',
    title: '项目总控与交�?,
    goal: '管理任务、数据、baseline、风险、周报、论文与专利',
    chapters: ['11'],
  },
];

interface PhaseRoadmapProps {
  chapters?: readonly ResearchTreeNode[];
}

export default function PhaseRoadmap({
  chapters = [],
}: PhaseRoadmapProps): React.ReactElement {
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Research Roadmap</div>
          <h2 className={styles.title}>五阶段研究路�?/h2>
          <p className={styles.desc}>
            从理论到交付的完整研究路�?涵盖基础认知、传统系统、神经扩展、实验验证与项目管理�?          </p>
        </div>

        <div className={styles.phasesGrid}>
          {PHASES.map((phase) => {
            const phaseChapters = phase.chapters
              .map((id) => chapterMap.get(id))
              .filter(Boolean) as readonly ResearchTreeNode[];

            const totalLit = phaseChapters.reduce(
              (sum, c) => sum + c.literatureCount,
              0,
            );
            const totalAssets = phaseChapters.reduce(
              (sum, c) => sum + c.projectAssetCount,
              0,
            );

            return (
              <div key={phase.num} className={styles.phase}>
                <div className={styles.phaseHeader}>
                  <div className={styles.phaseNum}>{phase.num}</div>
                  <div className={styles.phaseTitle}>{phase.title}</div>
                  <div className={styles.phaseGoal}>{phase.goal}</div>
                </div>
                <div className={styles.phaseChapters}>
                  {phaseChapters.map((c) => (
                    <div key={c.id} className={styles.chapterRow}>
                      <span className={styles.chapterId}>Ch.{c.id}</span>
                      <span className={styles.chapterTitle}>{c.titleZh}</span>
                      <div className={styles.chapterCounts}>
                        <span className={styles.countBadge}>
                          {c.literatureCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.phaseFooter}>
                  <span className={styles.phaseChapterList}>
                    Ch.{phase.chapters.join(' · ')}
                  </span>
                  <span className={styles.countBadge}>
                    {totalLit} lit · {totalAssets} asset
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}