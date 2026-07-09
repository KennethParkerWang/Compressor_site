// LitLink:论文内链 - 引用 literatureData.ts
import React from 'react';
import Link from '@docusaurus/Link';
import {literatureData, type LiteratureItem} from '../../data/literatureData';

const LIT_MAP: Record<string, LiteratureItem> = Object.fromEntries(literatureData.map((l) => [l.id, l]));

export interface LitLinkProps {
  litId: string;
  display?: string;
  showTitle?: boolean;
}

export function LitLink({litId, display, showTitle = true}: LitLinkProps): React.ReactElement {
  const lit = LIT_MAP[litId];
  if (!lit) {
    return <span style={{color: 'var(--ifm-color-warning)', borderBottom: '1px dashed currentColor'}} title={`未找到论文 ${litId}`}>[{litId}]</span>;
  }
  const text = display ?? (showTitle ? `${lit.title} (${litId})` : litId);
  return (
    <Link to={`/core?focus=${lit.id}`} style={{
      color: 'var(--ifm-color-primary)',
      textDecoration: 'none',
      borderBottom: '1px solid currentColor',
    }}
      title={lit.summaryZh}>
      {text}
    </Link>
  );
}

export default LitLink;