// Calendar events — 多源 merge
// 4 个来源 → 统一的 CalendarEvent 流:
//
//   1. researchTasks  (动态, 来自 zustand store)
//      → 关键字段: dueDate / startedAt / completedAt / status / lane / refs
//      → 类型映射: status=todo|doing|done → task-todo|task-doing|task-done
//   2. readingNotes  (动态, 来自 zustand store)
//      → 关键字段: updatedAt
//      → 类型: note-updated
//      → 仅保留最近 14 天内更新过的 (避免日历上太挤)
//   3. literatureData  (静态, 模块已 export)
//      → 关键字段: year + id → 当年那天作为"里程碑日"
//      → 类型: reading-milestone
//   4. 手动新建任务 (用户在 drag-create / 新建对话框中输入)
//      → 类型: task-todo

import type {ResearchTask, TaskRef, TaskLane} from './researchTasks';
import type {ReadingNote} from './readingNotes';
import {literatureData} from './literatureData';
import type {LiteratureItem} from './literatureData';
import {
  FIRST_WEEKLY_REPORT_DATE,
  WEEKLY_REPORT_INTERVAL_DAYS,
  getWeeklyReportsAround,
} from './weeklyReports';

export type CalendarEventType =
  | 'task-todo'      // 待办
  | 'task-doing'     // 进行中
  | 'task-done'      // 已完成
  | 'task-delayed'   // 延期
  | 'note-updated'   // 笔记更新
  | 'milestone'
  | 'weekly-report';     // Weekly report schedule

export interface CalendarEventRef {
  kind: string;      // 'paper' | 'chapter' | 'note' | 'task'
  refId: string;     // LIT-XXXX / chapterId / note-XXXX / t-XXXX
  label: string;
}

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  start: string;     // YYYY-MM-DD
  end?: string;      // YYYY-MM-DD (multi-day task 用)
  description?: string;
  time?: string;     // HH:mm, 一天的某个时间点
  meta: {
    lane?: TaskLane;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    minutes?: number;        // 任务预估时长
    wordCount?: number;      // 笔记字数
    refs?: CalendarEventRef[];
    noteId?: string;
    litId?: string;
    reportId?: string;
  };
}

// 把 TaskRef[] → CalendarEventRef[]
function taskRefToEventRef(refs: readonly TaskRef[]): CalendarEventRef[] {
  return refs.map((r) => ({kind: r.kind, refId: r.refId, label: r.label}));
}

// 任务来源合并
export function buildTaskEvents(tasks: readonly ResearchTask[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const t of tasks) {
    // dueDate (主日期)
    if (t.dueDate) {
      out.push({
        id: `task-${t.id}`,
        type: t.status === 'done' ? 'task-done' : t.status === 'doing' ? 'task-doing' : t.status === 'delayed' ? 'task-delayed' : 'task-todo',
        title: t.title,
        start: t.dueDate,
        end: t.startedAt && t.startedAt < t.dueDate ? t.dueDate : undefined,
        description: t.description,
        meta: {
          lane: t.lane,
          priority: t.priority,
          minutes: t.estimatedMinutes,
          refs: taskRefToEventRef(t.refs),
        },
      });
    }
    // startedAt 当作"今天开始做"的提示,只在 dueDate 没有时补一条
    else if (t.startedAt) {
      out.push({
        id: `task-started-${t.id}`,
        type: t.status === 'done' ? 'task-done' : 'task-doing',
        title: `[开展] ${t.title}`,
        start: t.startedAt,
        description: t.description,
        meta: { lane: t.lane, priority: t.priority, minutes: t.estimatedMinutes, refs: taskRefToEventRef(t.refs) },
      });
    }
    // completedAt 但没有 dueDate (罕见)
    else if (t.completedAt) {
      out.push({
        id: `task-completed-${t.id}`,
        type: 'task-done',
        title: `[完结] ${t.title}`,
        start: t.completedAt.slice(0, 10),
        description: t.description,
        meta: { lane: 'completed', refs: taskRefToEventRef(t.refs) },
      });
    }
  }
  return out;
}

// 笔记来源 — 仅最近 14 天
export function buildNoteEvents(notes: readonly ReadingNote[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  for (const n of notes) {
    const d = new Date(n.updatedAt);
    if (Number.isNaN(d.getTime()) || d < cutoff) continue;
    const dateStr = d.toISOString().slice(0, 10);
    out.push({
      id: `note-${n.id}`,
      type: 'note-updated',
      title: n.title,
      start: dateStr,
      description: n.freeform.slice(0, 120) || undefined,
      meta: {
        wordCount: n.wordCount,
        litId: n.litId,
        noteId: n.id,
        refs: [{kind: 'note', refId: n.id, label: n.title}, {kind: 'paper', refId: n.litId, label: `${n.author} ${n.year}`}],
      },
    });
  }
  return out;
}

// 文献里程碑 — 同一年多篇文献合并成一条
export function buildMilestoneEvents(): CalendarEvent[] {
  // 按 year 分组,但只标注里程碑日 (1月1日 或 历史同一天)
  // 显示历史年份 = 该年首篇文献纪念日 → 7 月 1 日 (营造"年度复盘"感)
  const yearMap = new Map<number, LiteratureItem[]>();
  for (const lit of literatureData) {
    if (!lit.year) continue;
    const y = Number(lit.year);
    if (Number.isNaN(y) || y < 1948) continue;
    const arr = yearMap.get(y) ?? [];
    arr.push(lit);
    yearMap.set(y, arr);
  }
  const out: CalendarEvent[] = [];
  for (const [year, lits] of yearMap.entries()) {
    const first = lits[0];
    out.push({
      id: `milestone-${year}`,
      type: 'milestone',
      title: `${year} · ${lits.length} 篇奠基论文`,
      // 用"今年纪念"日: 当年同月同日 (没有就用 07-01)
      start: `${new Date().getFullYear()}-07-01`,
      description: lits.slice(0, 3).map((l) => `· ${l.title} (${l.authors})`).join('\n'),
      meta: {
        refs: lits.slice(0, 3).map((l) => ({kind: 'paper', refId: l.id, label: `${l.year} ${l.title}`})),
      },
    });
  }
  return out;
}

// 一次 merge
export function buildWeeklyReportEvents(): CalendarEvent[] {
  const firstTimestamp = Date.parse(`${FIRST_WEEKLY_REPORT_DATE}T00:00:00Z`);
  const interval = WEEKLY_REPORT_INTERVAL_DAYS * 86400000;
  const currentIndex = Math.max(0, Math.floor((Date.now() - firstTimestamp) / interval));
  const centerIndex = Math.max(7, currentIndex);
  const reports = getWeeklyReportsAround(centerIndex, centerIndex, 18);

  return reports.map((report) => ({
    id: `weekly-report-${report.id}`,
    type: 'weekly-report',
    title: `\u5468\u6c47\u62a5 ${String(report.no).padStart(2, '0')} \u00b7 ${report.titleZh}`,
    start: report.date,
    description: report.submissions.length > 0
      ? `\u5df2\u6536\u5230 ${report.submissions.length} / ${report.expectedSubmissionCount} \u4efd\u6c47\u62a5\u6750\u6599`
      : undefined,
    time: report.time,
    meta: {
      minutes: report.durationMinutes,
      reportId: report.id,
      refs: [{kind: 'weekly-report', refId: report.id, label: report.titleZh}],
    },
  }));
}

export function buildAllEvents(
  tasks: readonly ResearchTask[],
  notes: readonly ReadingNote[],
): CalendarEvent[] {
  const all = [
    ...buildTaskEvents(tasks),
    ...buildNoteEvents(notes),
    ...buildMilestoneEvents(),
    ...buildWeeklyReportEvents(),
  ];
  // 按 start 升序
  return [...all].sort((a, b) => a.start.localeCompare(b.start));
}

// Lane 颜色
export function laneColor(lane: TaskLane): string {
  switch (lane) {
    case 'this-week': return '#1f4ed8';      // 蓝
    case 'needs-note': return '#b45309';     // 琥珀
    case 'needs-pdf': return '#e11d48';      // 红
    case 'needs-experiment': return '#7c3aed'; // 紫
    case 'needs-report': return '#0891b2';   // 青
    case 'completed': return '#059669';      // 翠绿
  }
}

// 类型颜色
export function eventTypeColor(type: CalendarEventType): string {
  switch (type) {
    case 'task-todo': return '#64748b';          // slate
    case 'task-doing': return '#1f4ed8';         // 蓝
    case 'task-done': return '#059669';          // 翠绿
    case 'task-delayed': return '#b45309';       // 琥珀
    case 'note-updated': return '#a855f7';       // 紫
    case 'milestone': return '#f59e0b';
    case 'weekly-report': return '#0ea5e9';          // 金黄
  }
}

export function eventTypeLabel(type: CalendarEventType): string {
  switch (type) {
    case 'task-todo': return '待办';
    case 'task-doing': return '进行中';
    case 'task-done': return '已完成';
    case 'task-delayed': return '延期';
    case 'note-updated': return '笔记更新';
    case 'milestone': return '里程碑';
    case 'weekly-report': return '\u5468\u6c47\u62a5';
  }
}

export function eventTypeEmoji(type: CalendarEventType): string {
  switch (type) {
    case 'task-todo': return '⏳';
    case 'task-doing': return '🔨';
    case 'task-done': return '✅';
    case 'task-delayed': return '⚠️';
    case 'note-updated': return '📝';
    case 'milestone': return '🏛️';
    case 'weekly-report': return '\u6c47';
  }
}
