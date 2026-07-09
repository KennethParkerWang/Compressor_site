// Calendar v6 — Schedule-X + 4 源 merge
//
// 重构要点:
//  - 死信息源 → 动态联动 (tasks + notes + literature)
//  - 新建不显示 → 改用 Schedule-X eventsService.setEvents 同步注入
//  - 易读 + 高级感 → 侧边栏 + 顶 KPI + 自定义 event 组件

import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {useCalendarApp, ScheduleXCalendar} from '@schedule-x/react';
import {
  createViewDay,
  createViewWeek,
  createViewWeekAgenda,
  createViewMonthGrid,
  createViewMonthAgenda,
} from '@schedule-x/calendar';
import {createEventsServicePlugin} from '@schedule-x/events-service';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';

import {useTasks, useNotes} from '../stores/workbench';
import {taskLaneMeta, type ResearchTask, type TaskLane} from '../data/researchTasks';
import {literatureData} from '../data/literatureData';
import {
  buildAllEvents,
  type CalendarEvent,
  type CalendarEventType,
  eventTypeColor,
  eventTypeLabel,
  eventTypeEmoji,
  laneColor,
} from '../data/calendarEvents';
import {StatsStrip} from '../components/calendar/StatsStrip';
import {EventSidebar} from '../components/calendar/EventSidebar';
import {EventDetailDialog} from '../components/calendar/EventDetailDialog';
import {CalendarEventView} from '../components/calendar/CalendarEventView';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '../components/ui/dialog';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Textarea} from '../components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Calendar as CalIcon, Plus, Download, Sparkles} from 'lucide-react';
import {tasksToIcs, downloadIcs} from '../utils/icalUtils';
import styles from '../components/calendar/calendar.module.css';

const CALENDAR_TIME_ZONE = 'Asia/Shanghai';

function normalizeClockTime(value: string): string {
  const trimmed = value.trim();
  return /^\d{2}:\d{2}$/.test(trimmed) ? trimmed : '09:00';
}

function toScheduleRange(e: CalendarEvent): {
  start: Temporal.ZonedDateTime | Temporal.PlainDate;
  end: Temporal.ZonedDateTime | Temporal.PlainDate;
} {
  if (e.time) {
    const [rawStart, rawEnd] = e.time.split('-');
    const startTime = normalizeClockTime(rawStart ?? '');
    const endTime = normalizeClockTime(rawEnd ?? '');
    return {
      start: Temporal.ZonedDateTime.from(`${e.start}T${startTime}:00+08:00[${CALENDAR_TIME_ZONE}]`),
      end: Temporal.ZonedDateTime.from(`${e.start}T${endTime}:00+08:00[${CALENDAR_TIME_ZONE}]`),
    };
  }

  const start = Temporal.PlainDate.from(e.start);
  const end = e.end ? Temporal.PlainDate.from(e.end) : start;
  return {start, end};
}

const CN = {
  title: '日程 / Calendar',
  hint: '任务 · 笔记 · 文献里程碑 一站联动',
  newTask: '新建任务',
  google: '导出 ICS',
  legend: '图例',
  filter: '筛选',
  lanes: '泳道',
  types: '类型',
  total: '共',
  cancel: '取消',
  save: '保存',
  titleLabel: '标题',
  descLabel: '说明',
  dateLabel: '日期',
  duration: '时长(min)',
  laneLabel: '泳道',
  priority: '优先级',
};

export default function CalendarPage(): React.ReactElement {
  const {tasks, addTask, updateTask, removeTask} = useTasks();
  const {notes} = useNotes();

  // === 多源 merge ===
  const allEvents = useMemo(() => buildAllEvents(tasks, notes), [tasks, notes]);
  const eventsById = useMemo(() => {
    const m = new Map<string, CalendarEvent>();
    for (const e of allEvents) m.set(e.id, e);
    return m;
  }, [allEvents]);

  // === 筛选 ===
  const [activeSources, setActiveSources] = useState<Set<CalendarEventType>>(
    () => new Set<CalendarEventType>(['task-todo', 'task-doing', 'task-done', 'task-delayed', 'note-updated', 'milestone', 'weekly-report']),
  );
  const [activeLanes, setActiveLanes] = useState<Set<TaskLane | 'all'>>(() => new Set<TaskLane | 'all'>(['all']));

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (!activeSources.has(e.type)) return false;
      if (e.type.startsWith('task-')) {
        if (!activeLanes.has('all') && e.meta.lane && !activeLanes.has(e.meta.lane)) return false;
      }
      return true;
    });
  }, [allEvents, activeSources, activeLanes]);

  // === Schedule-X events ===
  const sxEvents = useMemo(() => filteredEvents.map((e) => {
    // Schedule-X v4.x requires Temporal objects. Timed events need ZonedDateTime.
    const {start, end} = toScheduleRange(e);
    return {
      id: e.id,
      title: e.title,
      start,
      end,
      description: e.description ?? '',
    };
  }), [filteredEvents]);

  // === eventsService 用于热更新 ===
  const eventsService = useState(() => createEventsServicePlugin())[0];

  const today = Temporal.Now.plainDateISO();
  const calendar = useCalendarApp({
    views: [
      createViewMonthGrid(),
      createViewMonthAgenda(),
      createViewWeek(),
      createViewWeekAgenda(),
      createViewDay(),
    ],
    defaultView: 'week-agenda',
    events: sxEvents,
    plugins: [eventsService],
    selectedDate: today,
    locale: 'zh-CN',
    timezone: CALENDAR_TIME_ZONE,
    firstDayOfWeek: 1,
    dayBoundaries: {start: '08:00', end: '22:00'},
    weekOptions: {
      gridHeight: 680,
      nDays: 7,
      eventWidth: 92,
      eventOverlap: true,
      gridStep: 60,
    },
    monthGridOptions: {nEventsPerDay: 4},
    monthAgendaOptions: {nEventIndicatorsPerDay: 4},
    skipAnimations: true,
    isDarkMode: typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
    callbacks: {
      onEventClick(event) {
        const ev = eventsById.get(event.id);
        if (ev) setDetailEvent(ev);
      },
    },
  });

  // 同步 eventsService (新建/筛选后热更新)
  React.useEffect(() => {
    eventsService.set(sxEvents as any);
  }, [sxEvents, eventsService]);

  // === 对话框状态 ===
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [creating, setCreating] = useState<{date: string} | null>(null);

  const handleNewTask = (t: Omit<ResearchTask, 'id' | 'createdAt'>): void => {
    addTask(t);
    setCreating(null);
  };

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div className={styles.layout}>
          {/* === Sidebar === */}
          <EventSidebar
            events={allEvents}
            activeSources={activeSources}
            setActiveSources={setActiveSources}
            activeLanes={activeLanes}
            setActiveLanes={setActiveLanes}
          />

          {/* === Main === */}
          <div className={styles.mainCol}>
            {/* 顶部 KPI */}
            <StatsStrip events={allEvents} monthDate={new Date()} />

            {/* 工具栏 */}
            <div className={styles.calHeader}>
              <span className={styles.calHeaderTitle}>
                <CalIcon size={16} style={{marginRight: 6, verticalAlign: '-3px'}} />
                {CN.total} <b>{filteredEvents.length}</b> / {allEvents.length} 条
              </span>
              <span className={styles.calHeaderTitle} style={{fontSize: 12, fontWeight: 400, color: '#64748b'}}>
                <Sparkles size={11} style={{marginRight: 3, verticalAlign: '-1px'}} />
                {(Object.keys(taskLaneMeta) as TaskLane[]).filter((l) => activeLanes.has(l)).map((l) => l).slice(0, 3).join(' · ') || '全部阶段'}
              </span>
              <div className={styles.calSpacer} />
              <Button onClick={() => setCreating({date: new Date().toISOString().slice(0, 10)})} variant="default">
                <Plus size={14} /> {CN.newTask}
              </Button>
              <Button onClick={() => {
                const ics = tasksToIcs(tasks);
                downloadIcs(`research-tasks-${new Date().toISOString().slice(0, 10)}.ics`, ics);
              }} variant="outline">
                <Download size={14} /> {CN.google}
              </Button>
            </div>

            {/* 日历主体 */}
            <div className={styles.calCard}>
              <div className={styles.calendarFrame}>
                <ScheduleXCalendar
                  calendarApp={calendar}
                  customComponents={{
                    eventView: (props: any) => (
                      <CalendarEventView
                        calendarEvent={props.calendarEvent}
                        events={Object.fromEntries(eventsById)}
                        onClick={(ev) => setDetailEvent(ev)}
                      />
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {detailEvent && (
          <EventDetailDialog
            event={detailEvent}
            onClose={() => setDetailEvent(null)}
            onEdit={(t) => {
              const task = tasks.find((x) => x.id === t.id);
              if (task) {
                updateTask(task.id, task);
                setDetailEvent(null);
              }
            }}
            onDelete={(ev) => {
              const id = ev.id.replace(/^task-(started-|completed-)?/, '');
              if (confirm(`确定删除任务 ${id}?`)) {
                removeTask(id);
                setDetailEvent(null);
              }
            }}
            onOpenNote={(noteId) => {
              window.location.href = `/reading-notes?focus=${noteId}`;
            }}
          />
        )}

        {creating && (
          <CreateTaskDialog
            date={creating.date}
            onClose={() => setCreating(null)}
            onCreate={handleNewTask}
          />
        )}
      </WorkbenchShell>
    </Layout>
  );
}

function CreateTaskDialog({
  date, onClose, onCreate,
}: {
  date: string;
  onClose: () => void;
  onCreate: (t: Omit<ResearchTask, 'id' | 'createdAt'>) => void;
}): React.ReactElement {
  const [draft, setDraft] = useState<Omit<ResearchTask, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    status: 'todo',
    lane: 'this-week',
    refs: [],
    dueDate: date,
    estimatedMinutes: 60,
    priority: 'normal',
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{CN.newTask}</DialogTitle></DialogHeader>
        <div className={styles.dlgSection}>
          <label className={styles.dlgLabel}>{CN.titleLabel}</label>
          <Input
            value={draft.title}
            onChange={(e) => setDraft({...draft, title: e.target.value})}
            placeholder="如:实现 LZ77 + Huffman 完整 pipeline"
            style={{marginBottom: 12}}
          />

          <label className={styles.dlgLabel}>{CN.descLabel}</label>
          <Textarea
            rows={2}
            value={draft.description ?? ''}
            onChange={(e) => setDraft({...draft, description: e.target.value})}
            placeholder="可选,记录目标/关联论文"
            style={{marginBottom: 12, resize: 'vertical'}}
          />

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
            <div>
              <label className={styles.dlgLabel}>{CN.dateLabel}</label>
              <Input type="date" value={draft.dueDate ?? ''} onChange={(e) => setDraft({...draft, dueDate: e.target.value})} />
            </div>
            <div>
              <label className={styles.dlgLabel}>{CN.duration}</label>
              <Input type="number" value={draft.estimatedMinutes} onChange={(e) => setDraft({...draft, estimatedMinutes: Number(e.target.value) || 0})} />
            </div>
            <div>
              <label className={styles.dlgLabel}>{CN.laneLabel}</label>
              <Select value={draft.lane} onValueChange={(v) => setDraft({...draft, lane: v as TaskLane})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(taskLaneMeta) as TaskLane[]).filter((l) => l !== 'completed').map((l) => (
                    <SelectItem key={l} value={l}>{taskLaneMeta[l].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div style={{marginTop: 12}}>
            <label className={styles.dlgLabel}>{CN.priority}</label>
            <Select value={draft.priority} onValueChange={(v) => setDraft({...draft, priority: v as any})}>
              <SelectTrigger style={{width: '100%'}}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">low</SelectItem>
                <SelectItem value="normal">normal</SelectItem>
                <SelectItem value="high">high</SelectItem>
                <SelectItem value="urgent">urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{CN.cancel}</Button>
          <Button onClick={() => onCreate(draft)} disabled={!draft.title.trim()}>{CN.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
