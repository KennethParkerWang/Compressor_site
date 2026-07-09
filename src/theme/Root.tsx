'use client';

import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {useHistory} from '@docusaurus/router';
import {literatureData} from '@site/src/data/literatureData';
import FloatingActionDock from '@site/src/components/FloatingActionDock';
import {ErrorBoundary} from '@site/src/components/ErrorBoundary';
import ProgressBar from '@site/src/components/ProgressBar';
import styles from './styles.module.css';
import '@site/src/css/animations.css';

const THEME_STORAGE_KEY = 'cr-theme';
type CrTheme = 'light' | 'paper' | 'graph' | 'dark' | 'focus';

function applyInitialTheme(): void {
  if (typeof document === 'undefined') return;
  let t: CrTheme = 'light';
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'paper' || v === 'graph' || v === 'dark' || v === 'focus') t = v;
  } catch {
    // ignore
  }
  document.documentElement.setAttribute('data-cr-theme', t);
  document.documentElement.setAttribute('data-theme', t === 'dark' || t === 'focus' ? 'dark' : 'light');
}

type ResultKind = 'paper' | 'literature' | 'standard' | 'benchmark' | 'sourceCode' | 'documentation';

interface SearchResult {
  id: string;
  kind: ResultKind;
  title: string;
  meta: string;
  url?: string;
  chapter?: string;
  tags?: string;
}

const KIND_META: Record<ResultKind, {label: string; icon: string}> = {
  paper: {label: '文献 / Papers', icon: '📄'},
  literature: {label: '文献 / Papers', icon: '📄'},
  standard: {label: '标准 / Standards', icon: '📜'},
  benchmark: {label: '基准 / Benchmarks', icon: '🎯'},
  sourceCode: {label: '源码 / Source Code', icon: '⚙️'},
  documentation: {label: '文档 / Documentation', icon: '📃'},
};

export default function Root({children}: {children: React.ReactNode}): React.ReactElement {
  if (typeof document !== 'undefined') {
    applyInitialTheme();
  }
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const allResults = useMemo<SearchResult[]>(() => {
    return literatureData
      .filter((d) => d.isPublic)
      .map((d) => ({
        id: d.id,
        kind: (d.sourceKind as ResultKind) || 'literature',
        title: d.title,
        meta: [d.authors, d.year, d.venue].filter(Boolean).join(' · '),
        url: d.url,
        chapter: d.chapterTitleZh,
        tags: d.tags?.join(', '),
      }));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allResults
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.meta.toLowerCase().includes(q) ||
          (r.chapter ?? '').toLowerCase().includes(q) ||
          (r.tags ?? '').toLowerCase().includes(q),
      )
      .slice(0, 80);
  }, [allResults, query]);

  const flatResults = useMemo(() => filtered.slice(0, 20), [filtered]);

  const grouped = useMemo(() => {
    const map = new Map<ResultKind, SearchResult[]>();
    filtered.forEach((r) => {
      if (!map.has(r.kind)) map.set(r.kind, []);
      map.get(r.kind)!.push(r);
    });
    return map;
  }, [filtered]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
    setActiveIdx(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const handleSelect = useCallback(
    (r: SearchResult) => {
      if (r.url) {
        window.open(r.url, '_blank', 'noopener,noreferrer');
      } else {
        history.push(`/database?q=${encodeURIComponent(r.title)}`);
      }
      handleClose();
    },
    [history, handleClose],
  );

  // Listen for clicks on floating/search buttons and expose a global opener.
  useEffect(() => {
    const handler = () => handleOpen();
    const btn = document.querySelector('.navbar-search-btn');
    btn?.addEventListener('click', handler);
    // Also expose globally
    (window as unknown as Record<string, unknown>).__openCommandPalette__ = handleOpen;
    return () => {
      btn?.removeEventListener('click', handler);
      delete (window as unknown as Record<string, unknown>).__openCommandPalette__;
    };
  }, [handleOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? handleClose() : handleOpen();
      }
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleOpen, handleClose]);

  // 路由变化 → 派发进度条事件
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let prevLocation: string = window.location.pathname;
    const interval = setInterval(() => {
      const cur = window.location.pathname;
      if (cur !== prevLocation) {
        window.dispatchEvent(new Event('cr:route-start'));
        prevLocation = cur;
        setTimeout(() => window.dispatchEvent(new Event('cr:route-end')), 220);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [history]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = flatResults[activeIdx];
      if (item) handleSelect(item);
    }
  };

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      <ProgressBar />
      <FloatingActionDock />
      <div className="cr-aurora cr-aurora-1" aria-hidden />
      <div className="cr-aurora cr-aurora-2" aria-hidden />
      <div className="cr-aurora cr-aurora-3" aria-hidden />

      {open && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                ref={inputRef}
                className={styles.searchInput}
                placeholder="搜索文献、作者、章节、标签…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <kbd className={styles.escKey}>ESC</kbd>
            </div>

            <div className={styles.results}>
              {query.trim() === '' ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <div className={styles.emptyTitle}>搜索文献资料库</div>
                  <div className={styles.emptyDesc}>
                    输入关键词搜索 {literatureData.length} 条文献记录
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>😕</div>
                  <div className={styles.emptyTitle}>未找到 "{query}"</div>
                  <div className={styles.emptyDesc}>尝试其他关键词</div>
                </div>
              ) : (
                <>
                  {Array.from(grouped.entries()).map(([kind, items]) => {
                    const meta = KIND_META[kind] ?? {label: kind, icon: '📄'};
                    return (
                      <div key={kind} className={styles.group}>
                        <div className={styles.groupLabel}>
                          {meta.icon} {meta.label}
                          <span className={styles.groupCount}>{items.length}</span>
                        </div>
                        <div className={styles.groupItems}>
                          {items.slice(0, 6).map((item) => {
                            const gi = flatResults.indexOf(item);
                            return (
                              <div
                                key={item.id}
                                className={styles.resultItem}
                                data-active={gi === activeIdx}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setActiveIdx(gi)}
                              >
                                <div className={styles.resultIcon}>{meta.icon}</div>
                                <div className={styles.resultContent}>
                                  <div className={styles.resultTitle}>{item.title}</div>
                                  <div className={styles.resultMeta}>
                                    {item.meta}
                                    {item.chapter ? ` · ${item.chapter}` : ''}
                                  </div>
                                </div>
                                <span className={styles.resultArrow}>↗</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className={styles.footer}>
              <div className={styles.footerHint}>
                <kbd>↑↓</kbd> 导航
              </div>
              <div className={styles.footerHint}>
                <kbd>↵</kbd> 打开
              </div>
              <div className={styles.footerHint}>
                <kbd>ESC</kbd> 关闭
              </div>
              {filtered.length > 0 && (
                <span className={styles.footerCount}>
                  {filtered.length} 条结果
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
