// Terms - 压缩算法术语栏 / Glossary
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {BookOpen, ExternalLink, FileText, Search} from 'lucide-react';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {TERMS, TERM_CATEGORY_LABELS, type TermCategory} from '../data/terms';
import {literatureData} from '../data/literatureData';
import styles from './terms.module.css';

const CN = {
  title: '术语栏 / Glossary',
  hint: '压缩算法领域常用术语:解释 + 维基百科 + 关联论文。',
  searchPh: '搜索术语 / 关键词…',
  all: '全部',
  sortAlpha: '字母排序',
  sortCat: '按分类',
  sortHits: '热度排序',
  noResult: '未找到匹配的术语',
};

type Sort = 'alpha' | 'cat' | 'hits';

export default function Terms() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<TermCategory | 'all'>('all');
  const [sort, setSort] = useState<Sort>('alpha');

  const litById = useMemo(() => {
    const m: Record<string, typeof literatureData[number]> = {};
    for (const l of literatureData) m[l.id] = l;
    return m;
  }, []);

  const litCountByTerm = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of TERMS) {
      const c = (t.relatedLits ?? []).filter((id) => litById[id]).length;
      if (c > 0) m[t.name] = c;
    }
    return m;
  }, [litById]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = TERMS.filter((t) => {
      if (cat !== 'all' && t.category !== cat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.briefZh.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
    arr = arr.slice().sort((a, b) => {
      if (sort === 'alpha') return a.name.localeCompare(b.name);
      if (sort === 'hits') {
        const ha = litCountByTerm[a.name] ?? 0;
        const hb = litCountByTerm[b.name] ?? 0;
        if (hb !== ha) return hb - ha;
        return a.name.localeCompare(b.name);
      }
      // cat
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [query, cat, sort, litCountByTerm]);

  const catOptions: Array<{ k: TermCategory | 'all'; label: string; emoji: string; count: number }> = useMemo(() => {
    const map: Record<TermCategory, number> = {
      basic: 0, info: 0, entropy: 0, dictionary: 0, transform: 0,
      learned: 0, metric: 0, standard: 0, domain: 0,
    };
    for (const t of TERMS) map[t.category]++;
    const arr: Array<{ k: TermCategory | 'all'; label: string; emoji: string; count: number }> = [
      { k: 'all', label: CN.all, emoji: '🗂', count: TERMS.length },
    ];
    (Object.keys(map) as TermCategory[]).forEach((k) => {
      arr.push({ k, label: TERM_CATEGORY_LABELS[k].label, emoji: TERM_CATEGORY_LABELS[k].emoji, count: map[k] });
    });
    return arr;
  }, []);

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div className={styles.page}>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.headerTitle}>
                <BookOpen size={22} />
                <h1>{CN.title}</h1>
                <span className={styles.headerSub}>{CN.hint}</span>
              </div>
              <div className={styles.searchWrap}>
                <Search size={14} />
                <input
                  placeholder={CN.searchPh}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}>分类</div>
            <div className={styles.catList}>
              {catOptions.map((o) => (
                <button
                  key={o.k}
                  type="button"
                  className={`${styles.catBtn} ${cat === o.k ? styles.catBtnOn : ''}`}
                  onClick={() => setCat(o.k)}>
                  <span className={styles.catEmoji}>{o.emoji}</span>
                  <span className={styles.catLabel}>{o.label}</span>
                  <span className={styles.catCount}>{o.count}</span>
                </button>
              ))}
            </div>

            <div className={styles.sidebarTitle}>排序</div>
            <div className={styles.sortRow}>
              {([
                { k: 'alpha', label: CN.sortAlpha },
                { k: 'cat', label: CN.sortCat },
                { k: 'hits', label: CN.sortHits },
              ] as const).map((s) => (
                <button
                  key={s.k}
                  type="button"
                  className={`${styles.sortBtn} ${sort === s.k ? styles.sortBtnOn : ''}`}
                  onClick={() => setSort(s.k)}>
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          <main className={styles.main}>
            <div className={styles.resultBar}>
              <span><strong>{filtered.length}</strong> 个术语</span>
              {query ? <span className={styles.muted}>匹配 "{query}"</span> : null}
            </div>

            {filtered.length === 0 ? (
              <div className={styles.empty}>{CN.noResult}</div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((t) => {
                  const hits = litCountByTerm[t.name] ?? 0;
                  return (
                    <article key={t.name} className={styles.termCard}>
                      <header className={styles.termHeader}>
                        <span className={styles.termEmoji}>{t.emoji}</span>
                        <h3 className={styles.termName}>{t.name}</h3>
                        <span className={styles.termCat}>
                          {TERM_CATEGORY_LABELS[t.category].emoji} {TERM_CATEGORY_LABELS[t.category].label}
                        </span>
                      </header>
                      <p className={styles.termBrief}>{t.briefZh}</p>
                      <footer className={styles.termLinks}>
                        <a href={t.wikipedia} target="_blank" rel="noopener noreferrer" className={styles.termLink}>
                          <ExternalLink size={11} /> Wikipedia
                        </a>
                        {(t.relatedLits ?? []).length > 0 ? (
                          <Link to="/library" className={styles.termLink}>
                            <FileText size={11} /> 论文 {t.relatedLits!.length}
                          </Link>
                        ) : null}
                        {hits > 0 ? (
                          <span className={styles.termHits}>🔥 {hits} 文献引用</span>
                        ) : null}
                      </footer>
                      {(t.relatedLits ?? []).length > 0 ? (
                        <ul className={styles.termLits}>
                          {t.relatedLits!.slice(0, 3).map((id) => {
                            const l = litById[id];
                            if (!l) return null;
                            return (
                              <li key={id}>
                                <Link to="/library" className={styles.litLink}>
                                  {l.id} · {l.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}
