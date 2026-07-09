import React from 'react';
import {ExternalLink, FileText, BookmarkPlus} from 'lucide-react';
import type {LiteratureItem} from '@/src/data/literatureData';
import PaperThumbnail from '@/src/components/PaperThumbnail';
import styles from './styles.module.css';

interface PaperCardV2Props {
  paper: LiteratureItem;
  onOpenDetail?: (paper: LiteratureItem) => void;
}

const PRIORITY_REASONS: Record<string, string> = {
  '奠基': '信息论源�?/ 熵极�?/ 后续研究共同起点',
  '经典': '领域里程�?广泛作为 baseline 与比较对�?,
  '核心': '与算法模块设�?/ 实验复现强相�?直接指导实现',
  '标准': '国际 / 行业标准规范,影响模块边界',
  '顶级综述': '提供方向全景视图,适合快速建立认�?,
};

const ACTION_LABELS: Record<string, string> = {
  'skim': '略读',
  'deep-read': '精读',
  'run-experiment': '跑实�?,
  'read-source': '看源�?,
  'check-standard': '查标�?,
};

const DIFFICULTY_LABELS: Record<string, string> = {
  'intro': '入门',
  'intermediate': '进阶',
  'advanced': '高级',
};

export default function PaperCardV2({paper, onOpenDetail}: PaperCardV2Props): React.ReactElement {
  const hasUrl = Boolean(paper.url && paper.url.length > 0);
  const reason = PRIORITY_REASONS[paper.priority ?? ''] ?? null;
  const actionLabel = paper.recommendedAction ? ACTION_LABELS[paper.recommendedAction] ?? paper.recommendedAction : null;
  const difficultyLabel = paper.difficulty ? DIFFICULTY_LABELS[paper.difficulty] ?? paper.difficulty : null;

  return (
    <article className={styles.card}>
      <PaperThumbnail
        chapterId={paper.chapterId}
        sourceKind={paper.sourceKind}
        priority={paper.priority}
        year={paper.year}
        tags={paper.tags}
        title={paper.title}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          {paper.priority && (
            <span className={styles.priorityBadge}>{paper.priority}</span>
          )}
          {paper.year && (
            <span className={styles.yearBadge}>{paper.year}</span>
          )}
          <span className={styles.chapterBadge}>Ch.{paper.chapterId}</span>
          {difficultyLabel && (
            <span className={`${styles.difficultyBadge} ${styles[`diff_${paper.difficulty}`]}`}>
              {difficultyLabel}
            </span>
          )}
        </div>

        <h3 className={styles.title}>{paper.title}</h3>

        <div className={styles.meta}>
          {paper.authors && (
            <span className={styles.authors}>{paper.authors}</span>
          )}
          {paper.venue && (
            <span className={styles.venue}>{paper.venue}</span>
          )}
        </div>

        {paper.summaryZh && (
          <p className={styles.summary}>{paper.summaryZh}</p>
        )}

        {paper.coreReason && (
          <div className={styles.reason}>
            <span className={styles.reasonLabel}>为什么核�?/span>
            <span className={styles.reasonText}>{paper.coreReason}</span>
          </div>
        )}

        {paper.readerBenefit && (
          <div className={styles.reason}>
            <span className={styles.reasonLabel}>读完能获�?/span>
            <span className={styles.reasonText}>{paper.readerBenefit}</span>
          </div>
        )}

        {!paper.coreReason && reason && (
          <div className={styles.reason}>
            <span className={styles.reasonLabel}>核心价�?/span>
            <span className={styles.reasonText}>{reason}</span>
          </div>
        )}

        {paper.tags && paper.tags.length > 0 && (
          <div className={styles.tags}>
            {paper.tags.slice(0, 4).map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {actionLabel && (
          <div className={styles.actionRow}>
            <span className={styles.actionLabel}>推荐动作</span>
            <span className={`${styles.actionPill} ${styles[`action_${paper.recommendedAction}`]}`}>
              {actionLabel}
            </span>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionLink}
            onClick={() => onOpenDetail?.(paper)}
          >
            <FileText size={12} />
            详情
          </button>
          {hasUrl ? (
            <a
              className={`${styles.actionLink} ${styles.actionPrimary}`}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={12} />
              原文
            </a>
          ) : (
            <span className={styles.actionLink} style={{opacity: 0.5}}>暂无外链</span>
          )}
          <button type="button" className={styles.actionLink} title="加入阅读路线">
            <BookmarkPlus size={12} />
            加入路线
          </button>
        </div>
      </div>
    </article>
  );
}