import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowLeft, Braces, ExternalLink, FileText} from 'lucide-react';
import type {CompressorPaper} from '../../data/compressorPapers';
import styles from './paperWorkbench.module.css';

export function CompressorPaperHeader({paper, compact}: {paper: CompressorPaper; compact: boolean}): React.ReactElement {
  return (
    <header className={styles.paperHeader} data-compact={compact}>
      <Link to="/library" className={styles.headerBack}><ArrowLeft size={16} /><span>返回文献库</span></Link>
      <div className={styles.headerPaperIdentity}>
        <span>{paper.id}</span>
        <h1>{paper.title}</h1>
        <div className={styles.headerMeta}>
          <span>{paper.authors.join(', ')}</span><i />
          <span>{paper.year}</span><i />
          <span>{paper.venue}</span><i />
          <span>{paper.compressorFamily}</span>
        </div>
      </div>
      <div className={styles.headerLinks}>
        <span className={styles.readingStatus}>{paper.readingStatus}</span>
        <a href={paper.pdfUrl} target="_blank" rel="noreferrer"><FileText size={15} /><span>PDF</span><ExternalLink size={12} /></a>
        {paper.codeUrl ? <a href={paper.codeUrl} target="_blank" rel="noreferrer"><Braces size={15} /><span>代码</span><ExternalLink size={12} /></a> : null}
      </div>
    </header>
  );
}
