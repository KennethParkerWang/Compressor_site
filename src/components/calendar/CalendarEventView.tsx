// CalendarEventView — 自定义事件块 (注入 Schedule-X customComponents)
import React from 'react';
import type {CalendarEvent} from '../../data/calendarEvents';
import {eventTypeColor, eventTypeEmoji} from '../../data/calendarEvents';
import {laneColor} from '../../data/calendarEvents';
import styles from './calendar.module.css';

interface Props {
  calendarEvent: {id: string; title?: string; start: string; end?: string; description?: string; [k: string]: unknown};
  events: Record<string, CalendarEvent>; // id → CalendarEvent
  onClick?: (e: CalendarEvent) => void;
}

export function CalendarEventView({calendarEvent, events, onClick}: Props): React.ReactElement {
  const ev = events[calendarEvent.id];
  if (!ev) return <DefaultEvent calendarEvent={calendarEvent} />;

  const color = ev.type.startsWith('task-') && ev.meta.lane ? laneColor(ev.meta.lane) : eventTypeColor(ev.type);
  const refText = ev.meta.refs?.[0]?.label ?? '';

  return (
    <div
      className={styles.cxEvent}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(ev);
      }}
      style={{
        borderLeft: `3px solid ${color}`,
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.55)',
      }}
      title={ev.description ?? ev.title}
    >
      <div className={styles.cxEventHead} style={{color}}>
        <span className={styles.cxEmoji}>{eventTypeEmoji(ev.type)}</span>
        <span className={styles.cxEventTitle}>{ev.title}</span>
      </div>
      {refText && (
        <div className={styles.cxEventRef}>📄 {refText}</div>
      )}
    </div>
  );
}

function DefaultEvent({calendarEvent}: {calendarEvent: {title?: string}}): React.ReactElement {
  return (
    <div style={{padding: '2px 6px', fontSize: 11.5, fontWeight: 600, color: '#0f172a'}}>
      {calendarEvent.title ?? ''}
    </div>
  );
}
