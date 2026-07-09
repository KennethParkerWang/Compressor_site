// Reading Paths - 完整阅读路线时间轴 + 文献卡片 + 加入任务
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {readingPaths} from '../data/readingPaths';
import {literatureData} from '../data/literatureData';
import {experimentAssets as experimentData} from '../data/experimentData';
import {useTasks} from '../stores/workbench';
import {taskLaneMeta} from '../data/researchTasks';
import {useWorkbenchStats} from '../components/workbench/stats';
import {BookOpenCheck, CalendarDays, CheckCircle2, ChevronRight, Clock3, Layers3, Plus, Target} from 'lucide-react';
import styles from './reading-paths.module.css';

const CN = {
  addOne: "加入本周",
  all: "全部",
  audience: "读者",
  experiments: "实验",
  goal: "目标",
  hint: "按研究能力组织的论文阅读、实验复现与证据产出轨道。",
  joinPath: "整条入任务",
  order: "顺序",
  papers: "文献",
  progress: "进度",
  schedulePath: "排到日历",
  title: "阅读路线 / Reading Paths",
  weekLoad: "本周任务",
};;

export default function ReadingPathsPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focus = params.get('path');

  const stats = useWorkbenchStats();
  const {addTask} = useTasks();
  const [activeId, setActiveId] = useState<string>(focus ?? readingPaths[0]?.id ?? '');

  const active = useMemo(() => readingPaths.find((p) => p.id === activeId), [activeId]);
  const activeProgress = useMemo(() => stats.pathsProgress.find((p) => p.id === activeId), [stats, activeId]);

  const papersOfActive = useMemo(() => {
    if (!active) return [];
    const ids = active.readingPathIds ?? [];
    return ids.map((id: string) => literatureData.find((l) => l.id === id)).filter(Boolean);
  }, [active]);

  const experimentsOfActive = useMemo(() => {
    if (!active) return [];
    const ids = active.experimentIds ?? [];
    return ids.map((id: string) => experimentData.find((e) => e.id === id)).filter(Boolean);
  }, [active]);

  function joinPathToTasks(pathId: string, lane: 'this-week' | 'needs-note' | 'needs-experiment' = 'this-week') {
    const p = readingPaths.find((x) => x.id === pathId);
    if (!p) return;
    for (const litId of (p.readingPathIds ?? []).slice(0, 5)) {
      const lit = literatureData.find((l) => l.id === litId);
      if (!lit) continue;
      const due = new Date();
      due.setDate(due.getDate() + 7);
      addTask({
        title: `读 ${lit.title}`,
        description: `路线: ${p.nameZh ?? p.name}`,
        status: 'todo',
        lane,
        refs: [{kind: 'paper', refId: lit.id, label: lit.title}, {kind: 'path', refId: p.id, label: p.nameZh ?? p.name}],
        dueDate: due.toISOString().slice(0, 10),
        estimatedMinutes: 120,
        priority: 'normal',
      });
    }
  }

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title}>
        <section className={styles.routeHeader}>
          <div>
            <span className={styles.kicker}>Research Syllabus</span>
            <h2>专业学习路线</h2>
          </div>
          <div className={styles.routeStats}>
            <span><Layers3 size={14} /> {readingPaths.length} tracks</span>
            <span><BookOpenCheck size={14} /> {readingPaths.reduce((sum, path) => sum + path.readingPathIds.length, 0)} readings</span>
            <span><Clock3 size={14} /> {readingPaths.reduce((sum, path) => sum + (path.estimatedHours ?? 0), 0)} h</span>
          </div>
        </section>
        <div className={styles.layout}>
          <aside className={styles.list}>
            {readingPaths.map((p) => {
              const prog = stats.pathsProgress.find((x) => x.id === p.id);
              const isOn = activeId === p.id;
              return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={`${styles.listItem} ${isOn ? styles.listItemOn : ''}`}
              >
                <div className={styles.listItemHead}>
                  <span className={styles.listItemId}>{p.id}</span>
                  <span className={styles.listItemZh}>{p.nameZh ?? p.name}</span>
                </div>
                <div className={styles.listItemEn}>{p.name}</div>
                <div className={styles.listItemMeta}>{p.duration} · {p.estimatedHours ?? '-'} h</div>
                  <div className={styles.listItemBar}>
                    <div className={styles.listItemFill} style={{width: `${prog?.percent ?? 0}%`}} />
                  </div>
                  <div className={styles.listItemMeta}>{prog?.done ?? 0}/{prog?.total ?? 0} · {prog?.percent ?? 0}%</div>
                </button>
              );
            })}
          </aside>

          <div className={styles.detail}>
            {active ? (
              <>
                <header className={styles.detailHead}>
                  <div>
                    <span className={styles.detailId}>{active.id}</span>
                    <h2 className={styles.detailZh}>{active.nameZh}</h2>
                    <p className={styles.detailEn}>{active.name}</p>
                  </div>
                  <div className={styles.detailActions}>
                    <Button onClick={() => joinPathToTasks(active.id, 'this-week')}><Plus size={14} /> {CN.joinPath}</Button>
                    <Link to={`/tasks?path=${active.id}`}><Button variant="outline"><CalendarDays size={14} /> {CN.schedulePath}</Button></Link>
                  </div>
                </header>

                <div className={styles.goal}>
                  {active.goal ? <p><strong>研究目标</strong><span>{active.goal}</span></p> : null}
                  {active.audience ? <p><strong>适用对象</strong><span>{active.audience}</span></p> : null}
                  {active.outcome ? <p><strong>产出标准</strong><span>{active.outcome}</span></p> : null}
                </div>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>能力目标</h3>
                  <div className={styles.objectiveGrid}>
                    {active.objectives.map((objective) => (
                      <span key={objective}><Target size={13} /> {objective}</span>
                    ))}
                  </div>
                </section>

                {activeProgress ? (
                  <div className={styles.progress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{width: `${activeProgress.percent}%`}} />
                    </div>
                    <div className={styles.progressLabel}>已完成 {activeProgress.done} / {activeProgress.total} 篇 · {activeProgress.percent}%</div>
                  </div>
                ) : null}

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{CN.papers} ({papersOfActive.length})</h3>
                  <ol className={styles.timeline}>
                    {active.steps.map((step, i) => {
                      const p: any = step.litId ? literatureData.find((item) => item.id === step.litId) : null;
                      return (
                      <li key={`${step.ref}-${i}`} className={styles.timelineItem} data-stage={step.stage ?? 'intro'}>
                        <span className={styles.timelineNum}>{i + 1}</span>
                        <div className={styles.timelineBody}>
                          {p ? (
                            <Link to={`/library?lit=${p.id}`} className={styles.timelineTitle}>{p.title}</Link>
                          ) : (
                            <span className={styles.timelineTitle}>{step.ref}</span>
                          )}
                          <div className={styles.timelineMeta}>{p ? `${p.authors ?? '-'} · ${p.year ?? '-'}` : (step.stage ?? 'track')}</div>
                          {step.note ? <p className={styles.timelineSummary}>{step.note}</p> : null}
                          <div className={styles.timelineFoot}>
                            <Badge variant="outline">{step.stage ?? 'intro'}</Badge>
                            {p?.priority ? <Badge variant="outline">{p.priority}</Badge> : null}
                            {p ? <Button size="sm" variant="ghost" onClick={() => {
                              const due = new Date(); due.setDate(due.getDate() + 3 + i * 2);
                              addTask({
                                title: `读 ${p.title}`,
                                description: `路线: ${active.nameZh}`,
                                status: 'todo', lane: 'this-week',
                                refs: [{kind: 'paper', refId: p.id, label: p.title}, {kind: 'path', refId: active.id, label: active.nameZh}],
                                dueDate: due.toISOString().slice(0, 10),
                                estimatedMinutes: 90, priority: 'normal',
                              });
                            }}>
                              <Plus size={11} /> {CN.addOne}
                            </Button> : null}
                          </div>
                        </div>
                      </li>
                    );})}
                  </ol>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>实验与证据产出</h3>
                  <div className={styles.outputGrid}>
                    {active.nextExperiments.map((item) => (
                      <span key={item}><CheckCircle2 size={13} /> {item}</span>
                    ))}
                  </div>
                </section>

                {experimentsOfActive.length > 0 ? (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>{CN.experiments} ({experimentsOfActive.length})</h3>
                    <ul className={styles.expList}>
                      {experimentsOfActive.map((e: any) => (
                        <li key={e.id} className={styles.expItem}>
                          <FlaskConicalBadge />
                          <div>
                            <div className={styles.expName}>{e.name}</div>
                            <div className={styles.expDesc}>{e.description ?? ''}</div>
                          </div>
                          <Link to={`/experiments?exp=${e.id}`} className={styles.expLink}><ChevronRight size={14} /></Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : <div className={styles.empty}>选一条路线开始。</div>}
          </div>
        </div>
      </WorkbenchShell>
    </Layout>
  );
}

function FlaskConicalBadge() {
  return <span className={styles.expBadge}><CheckCircle2 size={12} /></span>;
}
