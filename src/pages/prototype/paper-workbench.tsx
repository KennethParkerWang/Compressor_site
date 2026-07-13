import React from 'react';
import Layout from '@theme/Layout';
import {CompressorPaperHeader} from '../../components/paper-workbench/CompressorPaperHeader';
import {ResizablePaperLayout} from '../../components/paper-workbench/ResizablePaperLayout';
import {TerminologySidebar} from '../../components/paper-workbench/TerminologySidebar';
import {PaperAnalysis, PaperCover} from '../../components/paper-workbench/PaperContent';
import {ExperimentSidebar} from '../../components/paper-workbench/ExperimentSidebar';
import {compressorPapers, defaultCompressorPaper, type CompressorTerm} from '../../data/compressorPapers';
import styles from '../../components/paper-workbench/paperWorkbench.module.css';

type PaperView = 'cover' | 'analysis';

export default function PaperWorkbenchPrototypePage(): React.ReactElement {
  const [paperId, setPaperId] = React.useState(defaultCompressorPaper.id);
  const [view, setView] = React.useState<PaperView>('cover');
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);
  const [headerCompact, setHeaderCompact] = React.useState(false);
  const [activeTermId, setActiveTermId] = React.useState<string>();
  const [requestedSection, setRequestedSection] = React.useState<string>();
  const [masteredTerms, setMasteredTerms] = React.useState<Set<string>>(new Set());
  const paper = compressorPapers.find((item) => item.id === paperId) ?? defaultCompressorPaper;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPaper = params.get('paper');
    if (requestedPaper && compressorPapers.some((item) => item.id === requestedPaper)) setPaperId(requestedPaper);
    setLeftCollapsed(window.localStorage.getItem('cr-paper-prototype-left-collapsed') === 'true');
    setRightCollapsed(window.localStorage.getItem('cr-paper-prototype-right-collapsed') === 'true');
  }, []);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(`cr-paper-mastered-${paper.id}`);
    setMasteredTerms(new Set(stored ? JSON.parse(stored) as string[] : []));
    setActiveTermId(undefined);
    setRequestedSection(undefined);
  }, [paper.id]);

  const selectPaper = (nextPaperId: string): void => {
    setPaperId(nextPaperId);
    setView('cover');
    const url = new URL(window.location.href);
    url.searchParams.set('paper', nextPaperId);
    window.history.replaceState({}, '', url);
  };

  const selectTerm = (term: CompressorTerm): void => {
    setView('analysis');
    setActiveTermId(term.id);
    setRequestedSection(term.locations[0]);
  };

  const toggleMastered = (termId: string): void => {
    setMasteredTerms((current) => {
      const next = new Set(current);
      if (next.has(termId)) next.delete(termId);
      else next.add(termId);
      window.localStorage.setItem(`cr-paper-mastered-${paper.id}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleLeft = (): void => {
    setLeftCollapsed((current) => {
      window.localStorage.setItem('cr-paper-prototype-left-collapsed', String(!current));
      return !current;
    });
  };

  const toggleRight = (): void => {
    setRightCollapsed((current) => {
      window.localStorage.setItem('cr-paper-prototype-right-collapsed', String(!current));
      return !current;
    });
  };

  return (
    <Layout title={`论文精读原型 · ${paper.compressorName}`} description="通用压缩器论文精读三栏工作台原型" noFooter>
      <div className={styles.paperPrototype}>
        <CompressorPaperHeader paper={paper} compact={headerCompact} />
        <ResizablePaperLayout
          left={<TerminologySidebar terms={paper.terms} activeTermId={activeTermId} collapsed={leftCollapsed} mastered={masteredTerms} onToggleCollapsed={toggleLeft} onSelectTerm={selectTerm} onToggleMastered={toggleMastered} />}
          center={view === 'cover'
            ? <PaperCover paper={paper} papers={compressorPapers} onSelectPaper={selectPaper} onEnterAnalysis={() => setView('analysis')} />
            : <PaperAnalysis paper={paper} activeTermId={activeTermId} requestedSection={requestedSection} onBackToCover={() => setView('cover')} />}
          right={<ExperimentSidebar paper={paper} collapsed={rightCollapsed} onToggleCollapsed={toggleRight} />}
          leftCollapsed={leftCollapsed}
          rightCollapsed={rightCollapsed}
          onToggleLeft={toggleLeft}
          onToggleRight={toggleRight}
          onCenterScroll={(scrollTop) => setHeaderCompact(scrollTop > 40)}
        />
      </div>
    </Layout>
  );
}
