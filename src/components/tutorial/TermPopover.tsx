// TermPopover:术语悬浮卡片 - 消费 terms.ts 的数据
import React from 'react';
import Link from '@docusaurus/Link';
import {TERMS, type Term} from '../../data/terms';
import {literatureData} from '../../data/literatureData';

const TERM_MAP: Record<string, Term> = Object.fromEntries(TERMS.map((t) => [t.name, t]));

export interface TermPopoverProps {
  termId: string;
  children?: React.ReactNode;
}

export function TermPopover({termId, children}: TermPopoverProps): React.ReactElement {
  const term = TERM_MAP[termId];
  if (!term) {
    // 找不到时降级为纯文本,不阻断渲染
    return <span style={{textDecorationStyle: 'dashed', textDecorationLine: 'underline', textDecorationColor: 'var(--ifm-color-warning)'}}>{children ?? termId}</span>;
  }
  const related = (term.relatedLits ?? [])
    .map((id) => literatureData.find((l) => l.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <span
      className="term-popover-trigger"
      style={{position: 'relative', display: 'inline-block'}}
      tabIndex={0}
      title={`${term.name} — ${term.briefZh}`}>
      <span style={{
        borderBottom: '1px dashed var(--ifm-color-primary)',
        cursor: 'help',
        color: 'inherit',
      }}>
        {children ?? term.name}
      </span>
      <span
        role="tooltip"
        style={{
          position: 'absolute',
          left: 0,
          top: '120%',
          minWidth: 240,
          maxWidth: 320,
          background: 'var(--ifm-background-color)',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 8,
          padding: 12,
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.18)',
          fontSize: 13,
          lineHeight: 1.5,
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.15s ease',
          zIndex: 100,
        }}
        className="term-popover-body">
        <div style={{fontWeight: 600, marginBottom: 4}}>{term.emoji} {term.name}</div>
        <div style={{color: 'var(--ifm-color-emphasis-800)', marginBottom: 6}}>{term.briefZh}</div>
        <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase'}}>{term.category}</div>
        {related.length > 0 && (
          <div style={{marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ifm-color-emphasis-200)'}}>
            <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)', marginBottom: 4}}>关联论文:</div>
            {related.slice(0, 3).map((r) => (
              <div key={r.id} style={{fontSize: 12}}>
                <Link to={`/core?focus=${r.id}`} style={{color: 'var(--ifm-color-primary)'}}>{r.title}</Link>
              </div>
            ))}
          </div>
        )}
        <div style={{marginTop: 8}}>
          <a href={term.wikipedia} target="_blank" rel="noopener noreferrer" style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)'}}>
            Wikipedia ↗
          </a>
        </div>
      </span>
      <style>{`
        .term-popover-trigger:hover .term-popover-body,
        .term-popover-trigger:focus .term-popover-body {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </span>
  );
}

export default TermPopover;