import React from 'react';
import Link from '@docusaurus/Link';
import {BookOpen, FlaskConical, FolderKanban} from 'lucide-react';
import type {AreaId} from './types';
import styles from './v3Shared.module.css';

const areas = [
  {id: 'project' as const, label: '项目', hint: '汇报与成果', href: '/prototype/project', icon: FolderKanban},
  {id: 'resources' as const, label: '资源', hint: '论文与算法', href: '/prototype/resources', icon: BookOpen},
  {id: 'workbench' as const, label: '工作台', hint: '阅读与实验', href: '/prototype/workbench', icon: FlaskConical},
];

export function AreaSwitcher({active, compact = false}: {active: AreaId; compact?: boolean}) {
  return (
    <nav className={styles.areaSwitcher} data-compact={compact} aria-label="V3 区域切换">
      {areas.map((area) => {
        const Icon = area.icon;
        return (
          <Link key={area.id} to={area.href} data-active={area.id === active}>
            <Icon size={16} />
            <span><b>{area.label}</b>{compact ? null : <small>{area.hint}</small>}</span>
          </Link>
        );
      })}
    </nav>
  );
}
