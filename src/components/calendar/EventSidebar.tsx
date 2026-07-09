// EventSidebar — 左侧 4 源切换 + 阶段筛选 + 图例
import React from 'react';
import type {CalendarEvent, CalendarEventType} from '../../data/calendarEvents';
import {eventTypeColor, eventTypeEmoji, eventTypeLabel} from '../../data/calendarEvents';
import {taskLaneMeta, type TaskLane} from '../../data/researchTasks';
import {laneColor} from '../../data/calendarEvents';
import {CalendarDays, FileEdit, Landmark, Filter, Zap, Presentation} from 'lucide-react';
import styles from './calendar.module.css';

const SOURCES: Array<{id: CalendarEventType; icon: React.ReactNode}> = [
  {id: 'task-todo',     icon: <span>{eventTypeEmoji('task-todo')}</span>},
  {id: 'task-doing',    icon: <span>{eventTypeEmoji('task-doing')}</span>},
  {id: 'task-done',     icon: <span>{eventTypeEmoji('task-done')}</span>},
  {id: 'task-delayed',  icon: <span>{eventTypeEmoji('task-delayed')}</span>},
  {id: 'note-updated',  icon: <FileEdit size={12} />},
  {id: 'milestone',     icon: <Landmark size={12} />},
  {id: 'weekly-report', icon: <Presentation size={12} />},
];

interface Props {
  events: CalendarEvent[];
  activeSources: Set<CalendarEventType>;
  setActiveSources: (next: Set<CalendarEventType>) => void;
  activeLanes: Set<TaskLane | 'all'>;
  setActiveLanes: (next: Set<TaskLane | 'all'>) => void;
}

export function EventSidebar({events, activeSources, setActiveSources, activeLanes, setActiveLanes}: Props): React.ReactElement {
  const total = events.length;
  const countByType = new Map<CalendarEventType, number>();
  for (const e of events) countByType.set(e.type, (countByType.get(e.type) ?? 0) + 1);

  // 月内激活任务数
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  const activeTaskCount = events.filter((e) => {
    const d = new Date(e.start);
    const inMonth = d.getFullYear() === y && d.getMonth() === m;
    return inMonth && (e.type === 'task-doing' || e.type === 'task-todo');
  }).length;

  function toggleSource(id: CalendarEventType): void {
    const next = new Set(activeSources);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setActiveSources(next);
  }

  function toggleLane(id: TaskLane | 'all'): void {
    const next = new Set(activeLanes);
    if (next.has(id)) {
      if (id !== 'all') next.delete(id);
    } else {
      next.add(id);
    }
    setActiveLanes(next);
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.kpiCard}>
        <div className={styles.kpiTop}>
          <span className={styles.kpiLabel}>本月工作流</span>
          <Zap size={14} />
        </div>
        <div className={styles.kpiValue}>{activeTaskCount}</div>
        <div className={styles.kpiSub}>活跃任务 · 共 {total} 条事件</div>
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.sideTitle}><Filter size={12} /> 数据源</h4>
        {SOURCES.map((s) => {
          const cnt = countByType.get(s.id) ?? 0;
          const active = activeSources.has(s.id);
          return (
            <button key={s.id} className={styles.sourceRow} data-active={active ? 1 : 0} onClick={() => toggleSource(s.id)}>
              <span className={styles.sourceDot} style={{background: eventTypeColor(s.id)}} />
              <span className={styles.sourceName}>{eventTypeEmoji(s.id)} {eventTypeLabel(s.id)}</span>
              <span className={styles.sourceCount}>{cnt}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.sideTitle}><Filter size={12} /> 阶段(泳道)</h4>
        <button className={styles.sourceRow} data-active={activeLanes.has('all') ? 1 : 0} onClick={() => setActiveLanes(new Set(['all']))}>
          <span className={styles.sourceDot} style={{background: '#64748b'}} />
          <span className={styles.sourceName}>全部阶段</span>
        </button>
        {(Object.keys(taskLaneMeta) as TaskLane[]).map((l) => (
          <button key={l} className={styles.sourceRow} data-active={activeLanes.has(l) ? 1 : 0} onClick={() => toggleLane(l)}>
            <span className={styles.sourceDot} style={{background: laneColor(l)}} />
            <span className={styles.sourceName}>{taskLaneMeta[l].label}</span>
          </button>
        ))}
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.sideTitle}><CalendarDays size={12} /> 图例</h4>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: laneColor('this-week')}} />
          本周在做
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: laneColor('needs-note')}} />
          要写笔记
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: laneColor('needs-pdf')}} />
          要找 PDF
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: laneColor('needs-experiment')}} />
          要做实验
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: laneColor('needs-report')}} />
          要写报告
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: laneColor('completed')}} />
          完成
        </div>
        <div className={styles.legendRow} style={{marginTop: 6, borderTop: '1px dashed var(--cr-line)', paddingTop: 8}}>
          <span className={styles.legendDot} style={{background: eventTypeColor('note-updated')}} />
          笔记更新
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: eventTypeColor('milestone')}} />
          历史里程碑
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{background: eventTypeColor('weekly-report')}} />
          双周汇报
        </div>
      </div>
    </div>
  );
}
