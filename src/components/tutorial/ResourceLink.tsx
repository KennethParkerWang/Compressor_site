// ResourceLink:外部资源内链 - 引用 resources.ts
import React from 'react';
import {RESOURCES, type Resource} from '../../data/resources';

const RES_MAP: Record<string, Resource> = Object.fromEntries(RESOURCES.map((r) => [r.name, r]));

export interface ResourceLinkProps {
  name: string;
  display?: string;
}

export function ResourceLink({name, display}: ResourceLinkProps): React.ReactElement {
  const res = RES_MAP[name];
  if (!res) {
    return <span style={{color: 'var(--ifm-color-warning)', borderBottom: '1px dashed currentColor'}} title={`未注册资源 ${name}`}>[{name}]</span>;
  }
  return (
    <a
      href={res.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{color: 'var(--ifm-color-primary)', textDecoration: 'none', borderBottom: '1px solid currentColor'}}
      title={res.briefZh}>
      {display ?? `${res.emoji} ${res.name}`} ↗
    </a>
  );
}

export default ResourceLink;