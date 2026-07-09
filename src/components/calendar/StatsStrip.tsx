// StatsStrip — 顶部 4 KPI 卡
import React from 'react';
import type {CalendarEvent} from '../../data/calendarEvents';
import {eventTypeColor, eventTypeEmoji, eventTypeLabel} from '../../data/calendarEvents';
import {Calendar as CalIcon, Clock, FileEdit, TrendingUp} from 'lucide-react';
import styles from './calendar.module.css';

interface Props {
  events: CalendarEvent[];
  monthDate: Date;
}

export function StatsStrip({events, monthDate}: Props): React.ReactElement {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const inMonth = (e: CalendarEvent): boolean => {
    const d = new Date(e.start);
    return d.getFullYear() === y && d.getMonth() === m;
  };
  const inMonthEvents = events.filter(inMonth);
  const taskTotal = inMonthEvents.filter((e) => e.type.startsWith('task-')).length;
  const hours = inMonthEvents
    .filter((e) => e.meta.minutes)
    .reduce((s, e) => s + (e.meta.minutes ?? 0), 0) / 60;
  const noteUpdates = inMonthEvents.filter((e) => e.type === 'note-updated').length;
  const milestones = inMonthEvents.filter((e) => e.type === 'milestone').length;
  const doneCount = inMonthEvents.filter((e) => e.type === 'task-done').length;
  const completionRate = taskTotal === 0 ? 0 : Math.round((doneCount / taskTotal) * 100);

  return (
    <div className={styles.statsStrip}>
      <Tile icon={<CalIcon size={14} />} accent="#1f4ed8" label="本月任务" value={String(taskTotal)} sub={`完成 ${doneCount} · 待办 ${taskTotal - doneCount}`} />
      <Tile icon={<Clock size={14} />} accent="#7c3aed" label="本月预计时长" value={`${hours.toFixed(1)}h`} sub={`平均 ${taskTotal === 0 ? '—' : (hours / taskTotal).toFixed(1)}h / 任务`} />
      <Tile icon={<FileEdit size={14} />} accent="#a855f7" label="本月笔记更新" value={String(noteUpdates)} sub={`总字数 ${inMonthEvents.filter((e) => e.type === 'note-updated').reduce((s, e) => s + (e.meta.wordCount ?? 0), 0).toLocaleString()}`} />
      <Tile icon={<TrendingUp size={14} />} accent="#059669" label="完成率" value={`${completionRate}%`} sub={`历史里程碑 ${milestones} 条`} />
    </div>
  );
}

interface TileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}

function Tile({icon, label, value, sub, accent}: TileProps): React.ReactElement {
  return (
    <div className={styles.statTile}>
      <div className={styles.statHead}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statIcon} style={{background: `${accent}1a`, color: accent}}>{icon}</span>
      </div>
      <div className={styles.statValue} style={{color: accent}}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}

export {eventTypeColor, eventTypeEmoji, eventTypeLabel};
