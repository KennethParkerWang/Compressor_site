// Tasks - Kanban:待开始 / 进行中 / 等待材料 / 已完成 / 归档
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import UserGuard from '../components/account/UserGuard';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Textarea} from '../components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '../components/ui/dialog';
import {useTasks, type ResearchTask, type TaskLane, type TaskStatus, type TaskRef} from '../stores/workbench';
import {taskLaneMeta, taskStatusMeta} from '../data/researchTasks';
import {literatureData} from '../data/literatureData';
import {readingPaths} from '../data/readingPaths';
import {algorithmModules} from '../data/algorithmModules';
import {experimentAssets as experimentData} from '../data/experimentData';
import {BookOpen, Brain, CalendarDays, Clock, ExternalLink, Plus, Trash2, ArrowRight, Trophy, ClipboardList} from 'lucide-react';
import {formatRelative} from '../components/workbench/actions';
import {EmptyState, MetricTile, StatusPill} from '../components/research-console/ResearchConsole';
import styles from './tasks.module.css';

const CN = {
  addRef: "添加关联",
  all: "全部",
  archiveCol: "归档",
  cancel: "取消",
  create: "创建",
  descPh: "补充描述",
  detail: "任务详情",
  dialogEdit: "编辑任务",
  dialogNew: "新建任务",
  doneCol: "已完成",
  droppedCol: "已放弃",
  due: "截止日期",
  empty: "此列当前没有任务。",
  filter: "状态筛选",
  hint: "把阅读、下载、笔记、实验、汇报拆成可追踪任务。Kanban 5 列,拖卡片改状态。每张卡显示绑定文献、预计时间、截止日期、优先级、下一步动作。",
  lane: "任务类型",
  linkedPapers: "关联文献",
  minutes: "预计时长(分钟)",
  minutesShort: "分钟",
  newTask: "新建任务",
  nextAction: "下一步",
  openCol: "进行中",
  overdue: "已延期",
  priority: "优先级",
  remove: "删除",
  save: "保存",
  status: "当前状态",
  taskType: "任务类型",
  title: "研究任务 / Tasks",
  titlePh: "任务标题",
  todoCol: "待开始",
  total: "总计",
  waitingCol: "等待材料",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444',
};

const TYPE_LABELS: Record<TaskLane, string> = {
  'this-week': '阅读',
  'needs-note': '笔记',
  'needs-pdf': '下载',
  'needs-experiment': '实验',
  'needs-report': '汇报',
  'completed': '其他',
};

// 5 列 Kanban:待开始 / 进行中 / 等待材料 / 已完成 / 归档
const COLUMNS: {status: TaskStatus; label: string; hint: string; color: string}[] = [
  {status: 'todo', label: CN.todoCol, hint: '已新建,还没开始做', color: '#94a3b8'},
  {status: 'doing', label: CN.openCol, hint: '正在做', color: '#1f4ed8'},
  {status: 'delayed', label: CN.waitingCol, hint: '在等材料 / 延期 / 阻塞', color: '#f59e0b'},
  {status: 'done', label: CN.doneCol, hint: '已完成', color: '#10b981'},
  {status: 'dropped', label: CN.archiveCol, hint: '不再做 / 归档', color: '#9ca3af'},
];

export default function TasksPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focusTask = params.get('task');

  const {tasks, addTask, updateTask, setStatus, removeTask} = useTasks();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ResearchTask | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  React.useEffect(() => {
    if (focusTask) {
      const t = tasks.find((x) => x.id === focusTask);
      if (t) setEditing(t);
    }
  }, [focusTask, tasks]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.refs.some((r) => r.label.toLowerCase().includes(q)),
    );
  }, [tasks, search]);

  const byCol = useMemo(() => {
    const m: Record<TaskStatus, ResearchTask[]> = {
      todo: [], doing: [], delayed: [], done: [], dropped: [],
    };
    for (const t of filtered) m[t.status].push(t);
    return m;
  }, [filtered]);

  const totals = useMemo(() => {
    const open = tasks.filter((t) => t.status === 'todo' || t.status === 'doing').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString())).length;
    return {open, done, overdue};
  }, [tasks]);

  function handleDropCol(status: TaskStatus) {
    if (!dragId) return;
    setStatus(dragId, status);
    setDragId(null);
  }

  return (
    <Layout title={CN.title} description={CN.hint}>
      <UserGuard>
      <WorkbenchShell pageTitle={CN.title}>
        <section className={styles.executionHero}>
          <div>
            <span className={styles.kicker}>Execution Layer</span>
            <h2>研究任务看板</h2>
          </div>
        </section>

        <section className={styles.taskMetrics}>
          <MetricTile label={CN.total} value={tasks.length} hint="当前任务总数" icon={ClipboardList} tone="slate" />
          <MetricTile label="Open" value={totals.open} hint="待开始 + 进行中" icon={Clock} tone="blue" />
          <MetricTile label="Done" value={totals.done} hint="已完成记录" icon={CalendarDays} tone="green" />
          <MetricTile label="Overdue" value={totals.overdue} hint="延期或阻塞" icon={Trash2} tone="red" />
        </section>

        <div className={styles.summary}>
          <Stat label={CN.total} value={tasks.length} />
          <Stat label="待开始 + 进行中" value={totals.open} accent="#1f4ed8" />
          <Stat label={CN.doneCol} value={totals.done} accent="#059669" />
          <Stat label={CN.overdue} value={totals.overdue} accent="#ef4444" />
          <div className={styles.summarySpacer} />
          <Input
            placeholder="搜索任务标题 / 描述 / 关联..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <Button onClick={() => setCreating(true)}><Plus size={14} /> {CN.newTask}</Button>
        </div>

        {tasks.length === 0 ? (
          <section className={styles.emptyBoard}>
            <EmptyState
              icon={ClipboardList}
              title="研究任务栏已清空"
              actions={(
                <>
                  <Link to="/library" className={styles.emptyLink}><BookOpen size={14} /> Library <ArrowRight size={13} /></Link>
                  <Link to="/sota" className={styles.emptyLink}><Trophy size={14} /> SOTA <ArrowRight size={13} /></Link>
                  <Link to="/neural-hub" className={styles.emptyLink}><Brain size={14} /> Learned Compression <ArrowRight size={13} /></Link>
                  <button type="button" className={styles.emptyLink} onClick={() => setCreating(true)}><Plus size={14} /> 手动新建 <ArrowRight size={13} /></button>
                </>
              )}
            />
            <div className={styles.emptyChecklist}>
              <StatusPill tone="blue">阅读任务：从文献库选论文</StatusPill>
              <StatusPill tone="amber">核验任务：从 SOTA 榜单确认来源</StatusPill>
              <StatusPill tone="purple">深度学习压缩器：跟踪论文、代码与 benchmark</StatusPill>
              <StatusPill tone="green">实验任务：从 Experiments 配 benchmark</StatusPill>
            </div>
          </section>
        ) : null}

        <div className={styles.kanban}>
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              className={styles.column}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropCol(col.status)}
            >
              <header className={styles.columnHead}>
                <span className={styles.columnDot} style={{background: col.color}} />
                <span className={styles.columnTitle}>{col.label}</span>
                <span className={styles.columnCount}>{byCol[col.status].length}</span>
              </header>
              <p className={styles.columnHint}>{col.hint}</p>

              <div className={styles.columnBody}>
                {byCol[col.status].length === 0 ? (
                  <div className={styles.columnEmpty}>{CN.empty}</div>
                ) : (
                  byCol[col.status].map((t) => (
                    <article
                      key={t.id}
                      className={`${styles.card} ${dragId === t.id ? styles.cardDragging : ''}`}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setEditing(t)}
                    >
                      <header className={styles.cardHead}>
                        <span className={styles.typeTag} data-type={t.lane}>{TYPE_LABELS[t.lane]}</span>
                        {t.dueDate ? (
                          <span className={`${styles.cardDue} ${new Date(t.dueDate) < new Date(new Date().toDateString()) && t.status !== 'done' ? styles.cardDueOver : ''}`}>
                            <CalendarDays size={11} /> {t.dueDate}
                          </span>
                        ) : null}
                      </header>
                      <h3 className={styles.cardTitle}>{t.title}</h3>
                      {t.description ? <p className={styles.cardDesc}>{t.description}</p> : null}
                      {t.refs.length > 0 ? (
                        <ul className={styles.cardRefs}>
                          {t.refs.slice(0, 2).map((r, i) => (
                            <li key={i}>
                              <span className={styles.refKind}>{r.kind}</span>
                              <span className={styles.refLabel}>{r.label}</span>
                            </li>
                          ))}
                          {t.refs.length > 2 ? <li className={styles.refMore}>+{t.refs.length - 2}</li> : null}
                        </ul>
                      ) : null}
                      <footer className={styles.cardFoot}>
                        <span className={styles.cardTime}><Clock size={11} /> {t.estimatedMinutes} {CN.minutesShort}</span>
                        <span className={styles.cardPriority} style={{background: PRIORITY_COLORS[t.priority] ?? '#64748b'}}>{t.priority}</span>
                      </footer>
                    </article>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {editing ? (
          <EditDialog task={editing} onClose={() => setEditing(null)} onSave={(patch) => {
            updateTask(editing.id, patch);
            setEditing(null);
          }} onRemove={() => {
            removeTask(editing.id);
            setEditing(null);
          }} />
        ) : null}
        {creating ? (
          <CreateDialog onClose={() => setCreating(false)} onCreate={(t) => {
            addTask(t);
            setCreating(false);
          }} />
        ) : null}
      </WorkbenchShell>
      </UserGuard>
    </Layout>
  );
}

function Stat({label, value, accent}: {label: string; value: number; accent?: string}) {
  return (
    <div className={styles.stat}>
      <span className={styles.statNum} style={accent ? {color: accent} : undefined}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function EditDialog({task, onClose, onSave, onRemove}: {task: ResearchTask; onClose: () => void; onSave: (patch: Partial<ResearchTask>) => void; onRemove: () => void}) {
  const [draft, setDraft] = useState(task);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{CN.dialogEdit}</DialogTitle></DialogHeader>
        <TaskForm draft={draft} setDraft={setDraft} />
        <DialogFooter>
          <Button variant="ghost" onClick={onRemove}><Trash2 size={14} /> {CN.remove}</Button>
          <Button variant="outline" onClick={onClose}>{CN.cancel}</Button>
          <Button onClick={() => onSave(draft)}>{CN.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateDialog({onClose, onCreate}: {onClose: () => void; onCreate: (t: Omit<ResearchTask, 'id' | 'createdAt'>) => void}) {
  const [draft, setDraft] = useState<Omit<ResearchTask, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    status: 'todo',
    lane: 'this-week',
    refs: [],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    estimatedMinutes: 60,
    priority: 'normal',
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{CN.dialogNew}</DialogTitle></DialogHeader>
        <TaskForm draft={draft} setDraft={setDraft} isCreate />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{CN.cancel}</Button>
          <Button onClick={() => onCreate(draft)}>{CN.create}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({draft, setDraft, isCreate}: {draft: any; setDraft: (d: any) => void; isCreate?: boolean}) {
  return (
    <div className={styles.form}>
      <label className={styles.formLabel}>标题
        <Input value={draft.title} onChange={(e) => setDraft({...draft, title: e.target.value})} placeholder={CN.titlePh} />
      </label>
      <label className={styles.formLabel}>下一步动作 / 描述
        <Textarea rows={3} value={draft.description ?? ''} onChange={(e) => setDraft({...draft, description: e.target.value})} placeholder="写清楚:这一卡的下一步要做什么 / 阻塞在哪" />
      </label>
      <div className={styles.formRow3}>
        <label className={styles.formLabel}>{CN.taskType}
          <Select value={draft.lane} onValueChange={(v) => setDraft({...draft, lane: v as TaskLane})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABELS) as TaskLane[]).map((l) => <SelectItem key={l} value={l}>{TYPE_LABELS[l]}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className={styles.formLabel}>{CN.status}
          <Select value={draft.status} onValueChange={(v) => setDraft({...draft, status: v as TaskStatus})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COLUMNS.map((c) => <SelectItem key={c.status} value={c.status}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className={styles.formLabel}>{CN.priority}
          <Select value={draft.priority} onValueChange={(v) => setDraft({...draft, priority: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">low</SelectItem>
              <SelectItem value="normal">normal</SelectItem>
              <SelectItem value="high">high</SelectItem>
              <SelectItem value="urgent">urgent</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      <div className={styles.formRow3}>
        <label className={styles.formLabel}>{CN.due}
          <Input type="date" value={draft.dueDate ?? ''} onChange={(e) => setDraft({...draft, dueDate: e.target.value})} />
        </label>
        <label className={styles.formLabel}>{CN.minutes}
          <Input type="number" value={draft.estimatedMinutes} onChange={(e) => setDraft({...draft, estimatedMinutes: Number(e.target.value) || 0})} />
        </label>
        <RefPicker refs={draft.refs} onChange={(refs) => setDraft({...draft, refs})} />
      </div>
    </div>
  );
}

function RefPicker({refs, onChange}: {refs: TaskRef[]; onChange: (refs: TaskRef[]) => void}) {
  const [tab, setTab] = useState<'paper' | 'path' | 'module' | 'experiment'>('paper');
  const [query, setQuery] = useState('');

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (tab === 'paper') return literatureData.filter((l) => !q || l.title.toLowerCase().includes(q) || (l.authors ?? '').toLowerCase().includes(q)).slice(0, 30).map((l) => ({kind: 'paper' as const, refId: l.id, label: l.title}));
    if (tab === 'path') return readingPaths.filter((p) => !q || p.nameZh?.includes(q) || p.name.includes(q)).slice(0, 30).map((p) => ({kind: 'path' as const, refId: p.id, label: p.nameZh ?? p.name}));
    if (tab === 'module') return algorithmModules.filter((m) => !q || m.id.includes(q) || (m.nameZh ?? '').includes(q)).slice(0, 30).map((m) => ({kind: 'algo-module' as const, refId: m.id, label: m.nameZh ?? m.id}));
    return experimentData.filter((e) => !q || e.id.includes(q) || e.name.includes(q)).slice(0, 30).map((e) => ({kind: 'experiment' as const, refId: e.id, label: e.name}));
  }, [tab, query]);

  return (
    <div className={styles.refPicker}>
      <div className={styles.formLabel}>{CN.addRef}</div>
      <div className={styles.refTabs}>
        {(['paper', 'path', 'module', 'experiment'] as const).map((t) => (
          <button key={t} type="button" className={`${styles.refTab} ${tab === t ? styles.refTabOn : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <Input placeholder="搜索关联..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className={styles.refList}>
        {candidates.slice(0, 8).map((c) => (
          <li key={c.refId}>
            <button
              type="button"
              className={styles.refRow}
              onClick={() => {
                if (refs.some((r) => r.kind === c.kind && r.refId === c.refId)) return;
                onChange([...refs, c]);
              }}
            >
              <Plus size={12} /> {c.label}
            </button>
          </li>
        ))}
      </ul>
      {refs.length > 0 ? (
        <ul className={styles.refChips}>
          {refs.map((r, i) => (
            <li key={i} className={styles.refChip}>
              <span>{r.kind}: {r.label}</span>
              <button type="button" onClick={() => onChange(refs.filter((_, j) => j !== i))}>×</button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
