// Standards - 场景卡片:点开看每个标准的问题、什么时候用、适用数据、官方链接、关联文献
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '../components/ui/sheet';
import {Dialog, DialogContent, DialogHeader, DialogTitle as DTitle, DialogDescription} from '../components/ui/dialog';
import {standardScenarios, losslessLabels, type StandardScenario} from '../data/standardScenarios';
import {literatureData} from '../data/literatureData';
import {readingPaths} from '../data/readingPaths';
import {Filter, Search, ArrowRight, ExternalLink, ChevronRight, ShieldCheck, Table2} from 'lucide-react';
import styles from './standards.module.css';

const CN = {
  title: '标准与场景 / Standards',
  hint: '标准、格式、benchmark 与适用场景矩阵。',
  search: '搜索场景、标准名',
  applicable: '适用数据',
  isBenchmark: 'Benchmark 语料',
  whenToUse: '什么时候看',
  standard: '标准',
  officialLink: '官方链接',
  matchedRefs: '相关文献',
  allLossless: '全部',
  summary: '为什么这个场景重要',
  openCount: '个标准',
  empty: '没有匹配的场景。换一个关键词,或者在搜索框里输入标准名(如 "JPEG-LS")。',
  usecase: '使用场景',
};

const SCENARIO_ICONS: Record<string, string> = {
  'web-text': '🌐',
  'image': '🖼️',
  'medical': '🏥',
  'astronomy': '🛰️',
  'scientific': '🔬',
  'tabular': '📊',
  'benchmark': '🎯',
};

const SCENARIO_USAGE: Record<string, string> = {
  'web-text': '静态资源压缩、日志归档、备份',
  'image': '图像资产、UI 截图、Web 优化',
  'medical': 'PACS 归档、影像传输、远程会诊',
  'astronomy': '天文观测、卫星下行链路、对地观测',
  'scientific': '模拟输出、浮点数组、可视化前处理',
  'tabular': '数据仓库、日志流、时序数据库',
  'benchmark': '新算法评估、压缩器横向对比、论文复现',
};

export default function StandardsPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focus = params.get('scenario');

  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<StandardScenario | null>(null);

  React.useEffect(() => {
    if (focus) {
      const s = standardScenarios.find((x) => x.id === focus);
      if (s) setDetail(s);
    }
  }, [focus]);

  const filtered = useMemo(() => {
    let arr = standardScenarios;
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((s) =>
        s.scenario.toLowerCase().includes(q) ||
        s.why.toLowerCase().includes(q) ||
        s.dataShape.toLowerCase().includes(q) ||
        s.standards.some((st) => st.name.toLowerCase().includes(q)),
      );
    }
    return arr;
  }, [query]);

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title}>
        <section className={styles.standardHeader}>
          <div>
            <span className={styles.kicker}>Standards Matrix</span>
            <h2>标准与基准矩阵</h2>
          </div>
          <div className={styles.headerMetrics}>
            <span><Table2 size={14} /> {standardScenarios.length} scenarios</span>
            <span><ShieldCheck size={14} /> {standardScenarios.reduce((sum, item) => sum + item.standards.length, 0)} standards</span>
          </div>
        </section>

        <div className={styles.filterRow}>
          <Search size={14} />
          <Input
            placeholder={CN.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.count}>共 {filtered.length} / {standardScenarios.length} 个场景</span>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty} style={{padding: 60, textAlign: 'center', color: '#64748b'}}>
            <Filter size={32} style={{marginBottom: 12, opacity: 0.5}} />
            <div>{CN.empty}</div>
          </div>
        ) : (
          <div className={styles.cards}>
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.card}
                onClick={() => setDetail(s)}
                aria-label={`打开场景: ${s.scenario}`}
              >
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>{SCENARIO_ICONS[s.id] ?? '📦'}</span>
                  <span className={styles.cardTitle}>{s.scenario}</span>
                </div>
                <p className={styles.cardWhy}>{s.why}</p>
                <div className={styles.cardShape}>{s.dataShape}</div>
                <div className={styles.cardFoot}>
                  <span className={styles.standardCount}>
                    {s.standards.length} {CN.openCount}
                  </span>
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: 2}}>
                    查看标准 <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent style={{maxWidth: 720, width: '90vw', maxHeight: '90vh', overflowY: 'auto'}}>
            {detail ? <ScenarioDetail s={detail} /> : null}
          </DialogContent>
        </Dialog>
      </WorkbenchShell>
    </Layout>
  );
}

function ScenarioDetail({s}: {s: StandardScenario}) {
  const refs = useMemo(() => {
    return literatureData.filter((l) => {
      const ch = l.chapterTitleZh ?? '';
      return ch.includes(s.scenario.slice(2)) || (l.tags ?? []).some((t) => t.toLowerCase().includes(s.id));
    }).slice(0, 8);
  }, [s]);

  const paths = useMemo(() => {
    const sId = s.id;
    return readingPaths.filter((p) => p.chapters.includes(sId) || (p.readingPathIds ?? []).some((id) => literatureData.find((l) => l.id === id && (l.tags ?? []).some((t) => t.toLowerCase().includes(sId))))).slice(0, 3);
  }, [s]);

  return (
    <div className={styles.detail}>
      <DialogHeader>
        <span className={styles.detailId}>{SCENARIO_ICONS[s.id] ?? '📦'} · {s.id}</span>
        <DTitle className={styles.detailTitle}>{s.scenario}</DTitle>
        <span className={styles.detailMeta}>{s.dataShape}</span>
      </DialogHeader>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}><ShieldCheck size={11} /> {CN.summary}</h4>
        <p style={{fontSize: 14, lineHeight: 1.6, color: 'var(--cr-ink-2, #334155)', margin: 0}}>{s.why}</p>
      </section>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}>{CN.applicable}</h4>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8}}>
          {s.dataShape.split(/[,/·]/).filter(Boolean).map((p) => (
            <span className={styles.dataShape} key={p.trim()}>{p.trim()}</span>
          ))}
        </div>
        <p style={{fontSize: 12.5, color: 'var(--cr-ink-3, #64748b)', margin: 0}}>
          <strong style={{color: 'var(--cr-ink, #0f172a)'}}>{CN.usecase}:</strong> {SCENARIO_USAGE[s.id] ?? '通用数据压缩'}
        </p>
      </section>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}>{CN.standard} ({s.standards.length})</h4>
        <ul className={styles.standardList}>
          {s.standards.map((st) => (
            <li key={st.id} className={styles.standardItem}>
              <div className={styles.standardHead}>
                <span className={styles.standardName}>{st.name}</span>
                <span className={styles.standardLoss}>{losslessLabels[st.lossless]}</span>
                {st.isBenchmark ? <Badge variant="outline" style={{background: '#fef3c7', color: '#92400e'}}>Benchmark</Badge> : null}
              </div>
              <p className={styles.standardProblem}>{st.problem}</p>
              <p className={styles.standardWhen}><strong>什么时候看:</strong> {st.whenToUse}</p>
              <p className={styles.standardApplicable}><strong>适用数据:</strong> {st.applicable}</p>
              {st.url ? (
                <a
                  href={st.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.standardLinkBtn}
                  onClick={(e) => { e.stopPropagation(); window.open(st.url, '_blank', 'noopener,noreferrer'); }}
                >
                  <ExternalLink size={12} /> 打开官方链接
                  <span className={styles.standardLinkHost}>{st.url}</span>
                </a>
              ) : (
                <span className={styles.standardLinkBtn} style={{background: '#f1f5f9', color: '#94a3b8', cursor: 'default'}}>
                  {CN.officialLink}: 未提供
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {refs.length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.matchedRefs}</h4>
          <ul className={styles.refList}>
            {refs.map((l) => (
              <li key={l.id}>
                <a href={`/library?lit=${l.id}`}>
                  <ChevronRight size={11} /> {l.title} <span className={styles.refMeta}>{l.year}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {paths.length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>推荐阅读路线</h4>
          <ul className={styles.refList}>
            {paths.map((p) => (
              <li key={p.id}>
                <a href={`/reading-paths?path=${p.id}`}>
                  <ChevronRight size={11} /> {p.nameZh ?? p.name} <span className={styles.refMeta}>{p.duration}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.sheetActions}>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          ← 返回
        </Button>
        <a href={`/library?chapter=${s.id}`}><Button size="sm">查看相关文献 <ChevronRight size={11} /></Button></a>
      </div>
    </div>
  );
}
