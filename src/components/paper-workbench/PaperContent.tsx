import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {ArrowLeft, ArrowRight, BookOpen, Database, FileText, Gauge, Layers3, Network, Sparkles} from 'lucide-react';
import type {CompressorPaper, PaperAnalysisSection} from '../../data/compressorPapers';
import styles from './paperWorkbench.module.css';

export function PaperCover({
  paper,
  papers,
  onSelectPaper,
  onEnterAnalysis,
}: {
  paper: CompressorPaper;
  papers: CompressorPaper[];
  onSelectPaper: (paperId: string) => void;
  onEnterAnalysis: () => void;
}): React.ReactElement {
  const coverSrc = useBaseUrl(paper.coverImage);
  return (
    <article className={styles.paperCoverPage}>
      <div className={styles.prototypePaperSwitch} role="tablist" aria-label="原型测试论文">
        <span>原型数据</span>
        {papers.map((item) => <button key={item.id} type="button" role="tab" aria-selected={item.id === paper.id} onClick={() => onSelectPaper(item.id)}>{item.compressorFamily}</button>)}
      </div>

      <section className={styles.coverHero}>
        <div className={styles.coverImage}><img src={coverSrc} alt={`${paper.title} 论文封面`} /></div>
        <div className={styles.coverIdentity}>
          <span>{paper.compressorFamily}</span>
          <h2>{paper.title}</h2>
          <p className={styles.coverAuthors}>{paper.authors.join(', ')} · {paper.year} · {paper.venue}</p>
          <p className={styles.coverAbstract}>{paper.abstract}</p>
          <div className={styles.coverMetaStrip}>
            <div><small>压缩器</small><strong>{paper.compressorName}</strong></div>
            <div><small>输入单位</small><strong>{paper.inputUnit}</strong></div>
            <div><small>数据集</small><strong>{paper.datasets.join(' / ')}</strong></div>
          </div>
        </div>
      </section>

      <section className={styles.coverSection}>
        <header><Sparkles size={18} /><div><span>Contribution</span><h3>核心贡献</h3></div></header>
        <ol className={styles.contributionList}>{paper.contributions.map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, '0')}</b><span>{item}</span></li>)}</ol>
      </section>

      <section className={styles.coverSection}>
        <header><Network size={18} /><div><span>Compressor architecture</span><h3>压缩器总体结构</h3></div></header>
        <CompressionFlow paper={paper} />
      </section>

      <div className={styles.coverEvidenceGrid}>
        <section>
          <header><Database size={17} /><strong>数据与评价</strong></header>
          <dl>
            <div><dt>数据集</dt><dd>{paper.datasets.join('、')}</dd></div>
            <div><dt>块大小</dt><dd>{paper.blockSizes.join('、')}</dd></div>
            <div><dt>指标</dt><dd>{paper.metrics.join('、')}</dd></div>
            <div><dt>对比基线</dt><dd>{paper.baselines.join('、')}</dd></div>
          </dl>
        </section>
        <section>
          <header><Gauge size={17} /><strong>主要结果状态</strong></header>
          <div className={styles.resultStatus}>
            <strong>{paper.paperExperiments.filter((item) => Object.keys(item.metrics).length > 0).length}</strong>
            <span>条已录入结果</span>
          </div>
          <p>所有原型数值均带来源状态；未核验的数据保持空状态，不作为论文结论。</p>
        </section>
      </div>

      <button type="button" className={styles.enterAnalysisButton} onClick={onEnterAnalysis}>进入论文解析<ArrowRight size={18} /></button>
    </article>
  );
}
export function PaperAnalysis({
  paper,
  activeTermId,
  requestedSection,
  onBackToCover,
}: {
  paper: CompressorPaper;
  activeTermId?: string;
  requestedSection?: string;
  onBackToCover: () => void;
}): React.ReactElement {
  const [activeSection, setActiveSection] = React.useState(paper.sections[0]?.id ?? 'background');

  React.useEffect(() => {
    if (!requestedSection) return;
    const target = document.getElementById(`paper-section-${requestedSection}`);
    if (!target) return;
    setActiveSection(requestedSection);
    target.scrollIntoView({behavior: 'smooth', block: 'start'});
  }, [paper.id, requestedSection]);

  React.useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-paper-center]');
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection((visible.target as HTMLElement).dataset.sectionId ?? activeSection);
    }, {root, rootMargin: '-15% 0px -68% 0px', threshold: [0.05, .25, .6]});
    root.querySelectorAll<HTMLElement>('[data-section-id]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [paper.id]);

  return (
    <article className={styles.paperAnalysisPage}>
      <header className={styles.analysisToolbar}>
        <button type="button" onClick={onBackToCover}><ArrowLeft size={15} />返回论文档案</button>
        <div><span>Structured analysis</span><strong>{paper.compressorName}</strong></div>
      </header>
      <nav className={styles.analysisToc} aria-label="解析章节目录">
        {paper.sections.map((item, index) => (
          <a key={item.id} href={`#paper-section-${item.id}`} data-active={item.id === activeSection} onClick={() => setActiveSection(item.id)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{item.title}
          </a>
        ))}
      </nav>
      <div className={styles.analysisDocument}>
        <header className={styles.documentLead}>
          <span>{paper.id} · {paper.compressorFamily}</span>
          <h2>{paper.title}</h2>
          <p>{paper.abstract}</p>
        </header>
        {paper.sections.map((analysisSection, index) => (
          <AnalysisSection
            key={analysisSection.id}
            paper={paper}
            section={analysisSection}
            index={index}
            termHighlighted={Boolean(activeTermId && analysisSection.termIds?.includes(activeTermId))}
          />
        ))}
      </div>
    </article>
  );
}

export function AnalysisSection({paper, section, index, termHighlighted}: {paper: CompressorPaper; section: PaperAnalysisSection; index: number; termHighlighted: boolean}): React.ReactElement {
  const figure = paper.figures.find((item) => item.id === section.figureId);
  return (
    <section id={`paper-section-${section.id}`} data-section-id={section.id} className={styles.analysisSection} data-term-highlighted={termHighlighted}>
      <div className={styles.sectionIndex}>{String(index + 1).padStart(2, '0')}</div>
      <div className={styles.sectionBody}>
        <header><h3>{section.title}</h3>{termHighlighted ? <span>术语定位</span> : null}</header>
        <p className={styles.sectionSummary}>{section.summary}</p>
        {section.emptyReason ? <EmptyState title="当前资料未提供可靠内容" description={section.emptyReason} /> : null}
        {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {figure ? <figure className={styles.analysisFigure}><CompressionFlow paper={paper} /><figcaption><strong>{figure.title}</strong>{figure.caption}</figcaption></figure> : null}
        {section.formula ? <div className={styles.formulaBlock}><span>Formula</span><code>{section.formula}</code></div> : null}
        {section.code ? <pre className={styles.codeBlock}><code>{section.code}</code></pre> : null}
        {section.table ? <div className={styles.analysisTableWrap}><table><thead><tr>{Object.keys(section.table[0] ?? {}).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{section.table.map((row, rowIndex) => <tr key={rowIndex}>{Object.values(row).map((value, cellIndex) => <td key={cellIndex}>{value}</td>)}</tr>)}</tbody></table></div> : null}
        {section.termIds?.length ? <div className={styles.sectionTerms}>{section.termIds.map((termId) => <span key={termId}>{paper.terms.find((term) => term.id === termId)?.name ?? termId}</span>)}</div> : null}
      </div>
    </section>
  );
}

export function EmptyState({title, description}: {title: string; description: string}): React.ReactElement {
  return <div className={styles.emptyState}><FileText size={20} /><div><strong>{title}</strong><p>{description}</p></div></div>;
}

function CompressionFlow({paper}: {paper: CompressorPaper}): React.ReactElement {
  const steps = [
    {label: '输入', value: paper.inputUnit, icon: BookOpen},
    {label: '预处理', value: paper.preprocessing[0] ?? '无', icon: Layers3},
    {label: '建模', value: paper.modelArchitecture[0] ?? '待补充', icon: Network},
    {label: '概率', value: paper.probabilityPrediction[0] ?? '待补充', icon: Gauge},
    {label: '熵编码', value: paper.entropyCoder[0] ?? '待补充', icon: FileText},
  ];
  return <div className={styles.compressionFlow}>{steps.map((step, index) => { const Icon = step.icon; return <React.Fragment key={step.label}><div><Icon size={18} /><span>{step.label}</span><strong>{step.value}</strong></div>{index < steps.length - 1 ? <ArrowRight size={16} /> : null}</React.Fragment>; })}</div>;
}
