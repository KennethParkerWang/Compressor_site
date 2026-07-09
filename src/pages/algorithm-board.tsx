// Algorithm Board - compression pipeline module taxonomy and implementation status.
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription} from '../components/ui/sheet';
import {MetricTile, ResearchPanel} from '../components/research-console/ResearchConsole';
import {algorithmModules, pipelineOrder, categoryLabels, moduleStatusLabels, type AlgorithmModule} from '../data/algorithmModules';
import {literatureData} from '../data/literatureData';
import {experimentAssets as experimentData} from '../data/experimentData';
import {useTasks} from '../stores/workbench';
import {Boxes, ExternalLink, Plus, ArrowRight, Cpu, Layers, Zap, Code2, Activity, Search, Filter} from 'lucide-react';
import styles from './algorithm-board.module.css';

const CN = {
  addToTask: '加入任务',
  alternatives: '替代方案',
  category: '分类',
  difficulty: '难度',
  expStatus: '实验状态',
  experiments: '实验',
  hint: '压缩器架构设计板,按模块职责组织输入识别、领域适配、字典匹配、概率建模、熵编码、容器和评测闭环。',
  impact: '影响',
  modules: '模块',
  pipeline: '流程',
  problem: '问题',
  papers: '文献',
  references: '参考文献',
  status: '状态',
  title: '算法模块 / Algorithm Board',
  input: '输入',
  output: '输出',
  notes: '笔记',
  viewInLibrary: '在文献库查看',
  runExperiment: '运行实验',
  risk: '风险',
  openLit: '打开文献',
  openExp: '打开实验',
  related: '相关',
  readPaper: '阅读文献',
  searchPh: '搜索关键词',
  all: '全部',
};

const STATUS_COLORS: Record<string, string> = {
  spec: '#94a3b8', prototype: '#f59e0b', runnable: '#3b82f6', verified: '#10b981', production: '#059669', deferred: '#6b7280',
};
const DIFF_LABEL: Record<string, string> = {intro: '入门', medium: '中级', hard: '困难'};
const RISK_LABEL: Record<string, string> = {low: '低', medium: '中', high: '高'};
const CATEGORY_ICON: Record<string, any> = {
  input: Boxes,
  orchestration: Activity,
  transform: Filter,
  probability: Cpu,
  neural: Zap,
  fusion: Layers,
  entropy: Code2,
  io: Activity,
};

export default function AlgorithmBoardPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focus = params.get('module');

  const {addTask} = useTasks();
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<AlgorithmModule | null>(null);

  React.useEffect(() => {
    if (focus) {
      const m = algorithmModules.find((x) => x.id === focus);
      if (m) setDetail(m);
    }
  }, [focus]);

  const ordered = useMemo(() => pipelineOrder.map((id) => algorithmModules.find((m) => m.id === id)).filter(Boolean) as AlgorithmModule[], []);

  const filtered = useMemo(() => {
    let arr = ordered;
    if (filter !== 'all') arr = arr.filter((m) => m.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((m) => m.id.includes(q) || (m.nameZh ?? '').toLowerCase().includes(q) || (m.problem ?? '').toLowerCase().includes(q));
    }
    return arr;
  }, [ordered, filter, query]);

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <section className={styles.boardHero}>
          <div>
              <span className={styles.kicker}>Codec Architecture Board</span>
              <h2>压缩器架构模块板</h2>
              <p>
              将算法族、论文方法和工程实现映射到压缩器可替换组件，明确每个模块的输入、输出、依赖、风险和指标影响。
              </p>
            </div>
          <div className={styles.boardHeroMeta}>
            <span>传统算法族</span>
            <strong>字典匹配 / 变换预测 / 概率建模 / 熵编码 / 学习式压缩 / 领域专用压缩</strong>
          </div>
        </section>

        <section className={styles.moduleMetrics}>
          <MetricTile label="Modules" value={ordered.length} hint="当前实现地图" icon={Boxes} tone="blue" />
          <MetricTile label="Categories" value={Object.keys(categoryLabels).length} hint="流水线职责" icon={Layers} tone="purple" />
          <MetricTile label="Runnable" value={ordered.filter((m) => m.status === 'runnable' || m.status === 'verified' || m.status === 'production').length} hint="可进入实验" icon={Activity} tone="green" />
          <MetricTile label="Papers" value={new Set(ordered.flatMap((m) => m.references ?? [])).size} hint="关联证据" icon={ExternalLink} tone="cyan" />
        </section>

        <ResearchPanel
          eyebrow="Operating Model"
          title="模块页的定位"
            description="模块板服务算法方案设计和复现实验拆解；历史关系进入 Evolution，性能名次进入 SOTA，算法条目进入 Catalog。"
        >
          <div className={styles.readingModel}>
            <div><strong>设计视角</strong><span>把完整压缩器拆成可替换组件。</span></div>
            <div><strong>工程视角</strong><span>定位实现风险、接口输入输出和复现实验入口。</span></div>
            <div><strong>研究视角</strong><span>连接模块背后的论文、算法族与评估指标。</span></div>
          </div>
        </ResearchPanel>

        {/* 流程图 */}
        <Card className={styles.flowCard}>
          <CardContent>
            <h3 className={styles.flowTitle}><Boxes size={16} /> {CN.pipeline}</h3>
            <div className={styles.flowRow}>
              {ordered.map((m, i) => (
                <React.Fragment key={m.id}>
                  <button type="button" className={styles.flowNode} onClick={() => setDetail(m)}>
                    <span className={styles.flowNodeId}>{m.id}</span>
                    <span className={styles.flowNodeName}>{m.nameZh ?? m.id}</span>
                    <span className={styles.flowNodeCat}>{categoryLabels[m.category]}</span>
                    <span className={styles.flowNodeStatus} style={{background: STATUS_COLORS[m.status]}}>{moduleStatusLabels[m.status]}</span>
                  </button>
                  {i < ordered.length - 1 ? <ArrowRight size={14} className={styles.flowArrow} /> : null}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className={styles.filterRow}>
          <div className={styles.searchWrap}>
            <Search size={13} />
            <Input placeholder={CN.searchPh} value={query} onChange={(e) => setQuery(e.target.value)} className={styles.searchInput} />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.select}>
            <option value="all">{CN.category} · {CN.all}</option>
            {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <Card className={styles.gridCard}>
          <CardContent>
            <h3 className={styles.gridTitle}>{CN.modules} <span style={{color: '#64748b', fontWeight: 400, fontSize: 12, marginLeft: 8}}>· {filtered.length} / {ordered.length} 个模块</span></h3>
            <div className={styles.grid}>
              {filtered.map((m) => (
                <ModuleCard key={m.id} m={m} onOpen={() => setDetail(m)} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <SheetContent side="right" className={styles.sheet}>
            {detail ? <ModuleDetail m={detail} onAdd={(title) => addTask({
              title: `[算法 ${detail.id}] ${title}`,
              status: 'todo',
              lane: 'this-week',
              refs: [{kind: 'algo-module', refId: detail.id, label: detail.nameZh}],
              estimatedMinutes: 120,
              priority: 'normal',
            })} /> : null}
          </SheetContent>
        </Sheet>
      </WorkbenchShell>
    </Layout>
  );
}

function ModuleCard({m, onOpen}: {m: AlgorithmModule; onOpen: () => void}) {
  const Icon = CATEGORY_ICON[m.category] ?? Cpu;
  return (
    <article className={styles.modCard}>
      <header className={styles.modHead}>
        <div className={styles.modIdGroup}>
          <span className={styles.modIcon} style={{background: STATUS_COLORS[m.status] + '22', color: STATUS_COLORS[m.status]}}>
            <Icon size={14} />
          </span>
          <span className={styles.modId}>{m.id}</span>
        </div>
        <Badge variant="outline" className={styles.modCategoryBadge}>{categoryLabels[m.category]}</Badge>
      </header>
      <h4 className={styles.modName} onClick={onOpen}>{m.nameZh ?? m.id}</h4>
      <p className={styles.modProblem}><span className={styles.modProblemLabel}>问题</span>{m.problem}</p>
      <div className={styles.modIOTags}>
        <span className={styles.modIOTag} data-io="in">入 {(m.inputs ?? [m.input])[0]}</span>
        <span className={styles.modIOTag} data-io="out">出 {(m.outputs ?? [m.output])[0]}</span>
      </div>
      <div className={styles.modTags}>
        {(m.impact ?? []).slice(0, 3).map((t) => <Badge key={t} variant="outline" className={styles.modImpactBadge}>{t}</Badge>)}
      </div>
      <footer className={styles.modFoot}>
        <span className={styles.modDiff} data-level={m.difficulty}>{DIFF_LABEL[m.difficulty]}</span>
        <span className={styles.modRisk}>风险 {RISK_LABEL[m.risk]}</span>
        <span className={styles.modStatus} style={{background: STATUS_COLORS[m.status]}}>{moduleStatusLabels[m.status]}</span>
      </footer>
      <button type="button" onClick={onOpen} className={styles.modOpenBtn}>展开 →</button>
    </article>
  );
}

function ModuleDetail({m, onAdd}: {m: AlgorithmModule; onAdd: (title: string) => void}) {
  const refs = (m.references ?? []).map((id) => literatureData.find((l) => l.id === id)).filter(Boolean);
  const exp = (m.experiments ?? []).map((id) => experimentData.find((e) => e.id === id)).filter(Boolean);
  return (
    <div className={styles.detail}>
      <SheetHeader>
        <span className={styles.detailId}>{m.id} · {categoryLabels[m.category]}</span>
        <SheetTitle className={styles.detailTitle}>{m.nameZh ?? m.id}</SheetTitle>
        <SheetDescription className={styles.detailMeta}>{m.name}</SheetDescription>
      </SheetHeader>

      <div className={styles.detailHeadBadges}>
        <span className={styles.modStatus} style={{background: STATUS_COLORS[m.status]}}>{moduleStatusLabels[m.status]}</span>
        <Badge variant="outline">难度 {DIFF_LABEL[m.difficulty]}</Badge>
        <Badge variant="outline">风险 {RISK_LABEL[m.risk]}</Badge>
      </div>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}>{CN.problem}</h4>
        <p>{m.problem}</p>
        {m.why ? <p style={{marginTop: 8, fontSize: 13, color: '#64748b'}}>{m.why}</p> : null}
      </section>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}>输入 / 输出</h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
          <div>
            <div style={{fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{CN.input}</div>
            <ul style={{margin: '6px 0 0', paddingLeft: 16}}>
              {(m.inputs ?? [m.input]).map((s, i) => <li key={i} style={{fontSize: 13}}>{s}</li>)}
            </ul>
          </div>
          <div>
            <div style={{fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{CN.output}</div>
            <ul style={{margin: '6px 0 0', paddingLeft: 16}}>
              {(m.outputs ?? [m.output]).map((s, i) => <li key={i} style={{fontSize: 13}}>{s}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}>{CN.alternatives}</h4>
        <div className={styles.altRow}>
          {(m.alternatives ?? []).map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
        </div>
      </section>

      <section className={styles.detailSection}>
        <h4 className={styles.detailH4}>{CN.impact}</h4>
        <div className={styles.altRow}>
          {(m.impact ?? []).map((a) => <Badge key={a}>{a}</Badge>)}
        </div>
      </section>

      {refs.length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.papers}</h4>
          <ul className={styles.refList}>
            {refs.map((l: any) => (
              <li key={l.id}>
                <a
                  href={`/library?lit=${l.id}`}
                  className={styles.refLinkBtn}
                  onClick={(e) => { e.preventDefault(); window.location.assign(`/library?lit=${l.id}`); }}
                >
                  <ExternalLink size={11} /> {l.title} <span className={styles.refMeta}>{l.year}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {exp.length > 0 ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.experiments}</h4>
          <ul className={styles.refList}>
            {exp.map((e: any) => (
              <li key={e.id}>
                <a
                  href={`/experiments?exp=${e.id}`}
                  className={styles.refLinkBtn}
                  onClick={(e2) => { e2.preventDefault(); window.location.assign(`/experiments?exp=${e.id}`); }}
                >
                  <ExternalLink size={11} /> {e.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {m.notes ? (
        <section className={styles.detailSection}>
          <h4 className={styles.detailH4}>{CN.notes}</h4>
          <p style={{fontSize: 13}}>{m.notes}</p>
        </section>
      ) : null}

      <div className={styles.detailActions}>
        <Button onClick={() => onAdd(`阅读 / 笔记 ${m.nameZh ?? m.id} 模块`)}>
          <Plus size={14} /> {CN.addToTask}
        </Button>
        {refs[0] ? (
          <Button variant="outline" onClick={() => window.location.assign(`/library?lit=${(refs[0] as any).id}`)}>
            <ExternalLink size={14} /> {CN.openLit}
          </Button>
        ) : null}
        {exp[0] ? (
          <Button variant="outline" onClick={() => window.location.assign(`/experiments?exp=${(exp[0] as any).id}`)}>
            <Zap size={14} /> {CN.openExp}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
