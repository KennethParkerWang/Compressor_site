import React, {useEffect} from 'react';
import {X, ExternalLink, BookmarkPlus, FileText} from 'lucide-react';
import type {LiteratureItem} from '@/src/data/literatureData';
import styles from './styles.module.css';

interface PaperDetailDrawerProps {
  paper: LiteratureItem;
  onClose: () => void;
  onAddToQueue?: (paper: LiteratureItem) => void;
  related?: readonly LiteratureItem[];
}

const SOURCE_KIND_LABELS: Record<string, string> = {
  literature: '文献',
  standard: '标准',
  sourceCode: '源码',
  benchmark: 'Benchmark',
  documentation: '文档',
};

const PRIORITY_REASON: Record<string, string> = {
  '奠基': '该工作奠定了方向的理论或实践基础,后续研究普遍以它为出发点�?,
  '经典': '在工程与算法层面具有里程碑意�?被广泛用�?baseline 与比较对象�?,
  '核心': '与研究主线强相关,直接支撑算法模块设计与实验�?,
  '标准': '属于国际/行业标准规范,定义格式与协�?直接影响互操作�?,
  '顶级综述': '对特定方向提供全景视�?是快速建立认知的入口文献�?,
};

export default function PaperDetailDrawer({
  paper,
  onClose,
  onAddToQueue,
  related,
}: PaperDetailDrawerProps): React.ReactElement {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const priorityReason = paper.priority
    ? PRIORITY_REASON[paper.priority]
    : null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-label="文献详情">
        <div className={styles.header}>
          <span className={styles.headerChapter}>Ch.{paper.chapterId}</span>
          <span className={styles.headerId}>{paper.id}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>{paper.title}</h2>
          <div className={styles.metaRow}>
            {paper.priority && (
              <span className={styles.metaBadge}>{paper.priority}</span>
            )}
            {paper.sourceKind && (
              <span className={styles.metaBadge}>
                {SOURCE_KIND_LABELS[paper.sourceKind] ?? paper.sourceKind}
              </span>
            )}
            {paper.year && <span className={styles.metaBadge}>{paper.year}</span>}
          </div>

          {paper.authors && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>作�?/div>
              <div className={styles.sectionText}>{paper.authors}</div>
            </div>
          )}

          {paper.venue && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>发表</div>
              <div className={styles.sectionText}>{paper.venue}</div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>所属章�?/div>
            <div className={styles.sectionText}>
              <strong>{paper.chapterTitleZh}</strong>
              <div style={{fontSize: '0.78rem', color: 'var(--cr-text-muted)', marginTop: '0.2rem'}}>
                {paper.sectionId} · {paper.sectionTitleZh}
              </div>
            </div>
          </div>

          {paper.summaryZh && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>中文摘要</div>
              <div className={styles.sectionText}>{paper.summaryZh}</div>
            </div>
          )}

          {priorityReason && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>核心价�?/div>
              <div className={styles.valueBox}>{priorityReason}</div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>项目作用</div>
            <div className={styles.valueBox}>
              {paper.priority === '奠基' || paper.priority === '经典'
                ? '作为项目综述与入门材料的核心引用,支撑研究方向定位�?
                : paper.priority === '核心'
                ? '作为可迁移压缩器模块化设计的关键参�?直接指导实验与实现�?
                : paper.priority === '标准'
                ? '作为互操作与格式约束的权威依�?影响模块边界�?
                : paper.priority === '顶级综述'
                ? '作为团队建立方向认知的入�?帮助快速对齐术语与现状�?
                : '作为研究方向的一手参�?辅助问题定位与方案选择�?}
            </div>
          </div>

          {paper.tags && paper.tags.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>标签</div>
              <div className={styles.tags}>
                {paper.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {related && related.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>相关文献</div>
              <div className={styles.links}>
                {related.slice(0, 4).map((r) => (
                  <a
                    key={r.id}
                    className={styles.link}
                    href={r.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={14} />
                    {r.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {paper.url && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>外链</div>
              <div className={styles.links}>
                <a
                  className={styles.link}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} />
                  {paper.url}
                </a>
              </div>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          {onAddToQueue && (
            <button
              className={`${styles.footerBtn} ${styles.footerBtnQueue}`}
              onClick={() => onAddToQueue(paper)}
            >
              <BookmarkPlus size={14} />
              加入阅读队列
            </button>
          )}
          <button className={styles.footerBtn} onClick={onClose}>
            关闭
          </button>
          {paper.url && (
            <a
              className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              打开外链
            </a>
          )}
        </div>
      </aside>
    </>
  );
}