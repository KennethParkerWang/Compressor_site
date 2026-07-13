import React from 'react';
import Link from '@docusaurus/Link';
import {BookMarked, Check, Circle, ExternalLink, Search} from 'lucide-react';
import type {CompressorTerm, TermCategory} from '../../data/compressorPapers';
import {CollapseButton} from './ResizablePaperLayout';
import styles from './paperWorkbench.module.css';

interface TerminologySidebarProps {
  terms: CompressorTerm[];
  activeTermId?: string;
  collapsed: boolean;
  mastered: Set<string>;
  onToggleCollapsed: () => void;
  onSelectTerm: (term: CompressorTerm) => void;
  onToggleMastered: (termId: string) => void;
}
export function TerminologySidebar({
  terms,
  activeTermId,
  collapsed,
  mastered,
  onToggleCollapsed,
  onSelectTerm,
  onToggleMastered,
}: TerminologySidebarProps): React.ReactElement {
  const [query, setQuery] = React.useState('');
  const filtered = terms.filter((term) => `${term.name} ${term.explanation} ${term.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const grouped = groupTerms(filtered);

  if (collapsed) {
    return (
      <div className={styles.collapsedRail}>
        <CollapseButton side="left" collapsed onClick={onToggleCollapsed} />
        <BookMarked size={19} />
        <span>{terms.length}</span>
      </div>
    );
  }

  return (
    <div className={styles.terminologySidebar}>
      <header className={styles.sidebarHeader}>
        <div><span>Terminology</span><strong>术语与前置知识</strong></div>
        <CollapseButton side="left" collapsed={false} onClick={onToggleCollapsed} />
      </header>
      <label className={styles.termSearch}>
        <Search size={15} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索当前论文术语" aria-label="搜索当前论文术语" />
      </label>
      <div className={styles.termProgress}><span>已掌握 {mastered.size}</span><span>共 {terms.length} 项</span></div>
      <div className={styles.termGroups}>
        {Array.from(grouped.entries()).map(([category, categoryTerms]) => (
          <section key={category}>
            <h2>{category}<span>{categoryTerms.length}</span></h2>
            {categoryTerms.map((term) => (
              <TermItem
                key={term.id}
                term={term}
                active={term.id === activeTermId}
                mastered={mastered.has(term.id)}
                onSelect={() => onSelectTerm(term)}
                onToggleMastered={() => onToggleMastered(term.id)}
              />
            ))}
          </section>
        ))}
        {filtered.length === 0 ? <div className={styles.sidebarEmpty}>没有匹配的术语</div> : null}
      </div>
    </div>
  );
}

export function TermItem({
  term,
  active,
  mastered,
  onSelect,
  onToggleMastered,
}: {
  term: CompressorTerm;
  active: boolean;
  mastered: boolean;
  onSelect: () => void;
  onToggleMastered: () => void;
}): React.ReactElement {
  return (
    <article className={styles.termItem} data-active={active} title={term.explanation}>
      <button type="button" className={styles.termMain} onClick={onSelect}>
        <span><strong>{term.name}</strong><small>{term.locations.map((location) => `§ ${location}`).join(' · ')}</small></span>
        <p>{term.explanation}</p>
      </button>
      <footer>
        <button type="button" className={styles.masteryButton} data-mastered={mastered} onClick={onToggleMastered}>
          {mastered ? <Check size={13} /> : <Circle size={12} />}{mastered ? '已掌握' : '待学习'}
        </button>
        <Link to={term.detailUrl}>查看详情<ExternalLink size={11} /></Link>
      </footer>
    </article>
  );
}

function groupTerms(terms: CompressorTerm[]): Map<TermCategory, CompressorTerm[]> {
  const groups = new Map<TermCategory, CompressorTerm[]>();
  for (const term of terms) groups.set(term.category, [...(groups.get(term.category) ?? []), term]);
  return groups;
}
