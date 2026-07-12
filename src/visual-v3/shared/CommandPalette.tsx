import React, {useEffect, useMemo, useState} from 'react';
import {Command} from 'cmdk';
import {BookOpen, Database, FlaskConical, Network, Search, X} from 'lucide-react';
import {researchIndex} from '../data/researchAdapter';
import {useV3Workspace} from './useV3Workspace';
import styles from './v3Shared.module.css';

const icons = {paper: BookOpen, algorithm: Network, compressor: Network, dataset: Database, report: BookOpen, experiment: FlaskConical};

export function CommandPalette({open, onOpenChange}: {open: boolean; onOpenChange: (open: boolean) => void}) {
  const [query, setQuery] = useState('');
  const visit = useV3Workspace((state) => state.visit);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const items = needle
      ? researchIndex.filter((item) => [item.title, item.summary, item.meta, ...item.tags].join(' ').toLowerCase().includes(needle))
      : researchIndex.slice(0, 9);
    return items.slice(0, 12);
  }, [query]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenChange, open]);

  if (!open) return null;
  return (
    <div className={styles.commandBackdrop} role="presentation" onMouseDown={() => onOpenChange(false)}>
      <Command className={styles.commandPanel} onMouseDown={(event) => event.stopPropagation()} label="全局搜索">
        <div className={styles.commandInput}>
          <Search size={19} />
          <Command.Input value={query} onValueChange={setQuery} placeholder="搜索论文、算法、数据集、实验或汇报" autoFocus />
          <button type="button" onClick={() => onOpenChange(false)} aria-label="关闭搜索"><X size={17} /></button>
        </div>
        <Command.List>
          <Command.Empty className={styles.commandEmpty}>没有匹配的研究记录</Command.Empty>
          <Command.Group heading={query ? '搜索结果' : '快速打开'}>
            {results.map((item) => {
              const Icon = icons[item.kind];
              return (
                <Command.Item key={item.id} value={`${item.title} ${item.meta}`} onSelect={() => {
                  visit(item.id);
                  window.location.assign(item.href);
                }}>
                  <Icon size={17} />
                  <span><b>{item.title}</b><small>{item.meta || item.kind}</small></span>
                  <em>{item.verification === 'verified' ? '已核验' : item.kind}</em>
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
        <footer><span>↑↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></footer>
      </Command>
    </div>
  );
}
