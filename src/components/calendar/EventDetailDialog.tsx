// EventDetailDialog — Schedule-X 点击事件后的详情弹窗
import React from 'react';
import Link from '@docusaurus/Link';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '../ui/dialog';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import type {CalendarEvent} from '../../data/calendarEvents';
import {eventTypeColor, eventTypeEmoji, eventTypeLabel} from '../../data/calendarEvents';
import {taskLaneMeta, type ResearchTask} from '../../data/researchTasks';
import {literatureData} from '../../data/literatureData';
import {ExternalLink, Edit3, Trash2, FileDown, FlaskConical} from 'lucide-react';
import styles from './calendar.module.css';

const CN = {
  edit: '编辑任务',
  openNote: '打开笔记',
  openLit: '查看文献',
  delete: '删除',
  close: '关闭',
  refs: '关联引用',
  noRefs: '无关联',
  hours: '小时',
  minutes: '分钟',
  words: '字',
};

interface Props {
  event: CalendarEvent;
  onClose: () => void;
  onEdit?: (task: ResearchTask) => void;
  onDelete?: (event: CalendarEvent) => void;
  onOpenNote?: (noteId: string) => void;
}

export function EventDetailDialog({event, onClose, onEdit, onDelete, onOpenNote}: Props): React.ReactElement {
  const color = eventTypeColor(event.type);
  const isTask = event.type.startsWith('task-');
  const isNote = event.type === 'note-updated';
  const lane = event.meta.lane;
  const lit = event.meta.litId ? literatureData.find((l) => l.id === event.meta.litId) : null;

  // 任务 → 在 researchTasks 中找
  const task = isTask && event.id.startsWith('task-') && event.id.length > 5
    ? event.id.replace(/^task-(started-|completed-)?/, '')
    : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{maxWidth: 540}}>
        <DialogHeader>
          <DialogTitle style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 22}}>{eventTypeEmoji(event.type)}</span>
            <span>{event.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className={styles.dlgSection}>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12}}>
            <Badge style={{background: color, color: '#fff', border: 0}}>{eventTypeLabel(event.type)}</Badge>
            {lane && (
              <Badge style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0'}}>
                {taskLaneMeta[lane]?.label}
              </Badge>
            )}
            {event.meta.priority && (
              <Badge variant={event.meta.priority === 'urgent' ? 'destructive' : 'outline'}>
                {event.meta.priority}
              </Badge>
            )}
            {event.meta.minutes && (
              <Badge variant="outline">
                <FlaskConical size={11} style={{marginRight: 3}} />
                {(event.meta.minutes / 60).toFixed(1)} {CN.hours}
              </Badge>
            )}
            {event.meta.wordCount != null && (
              <Badge variant="outline">📝 {event.meta.wordCount.toLocaleString()} {CN.words}</Badge>
            )}
          </div>

          <div className={styles.dlgLabel}>日期</div>
          <div className={styles.dlgTitle}>{event.start}{event.end && event.end !== event.start ? ` → ${event.end}` : ''}</div>

          {event.description && (
            <>
              <div className={styles.dlgLabel} style={{marginTop: 12}}>说明</div>
              <div className={styles.dlgDesc}>{event.description}</div>
            </>
          )}

          {event.meta.refs && event.meta.refs.length > 0 && (
            <>
              <div className={styles.dlgLabel} style={{marginTop: 12}}>{CN.refs}</div>
              <div className={styles.dlgRefs}>
                {event.meta.refs.map((r, i) => (
                  <RefTag key={i} ref_={r} />
                ))}
              </div>
            </>
          )}

          {lit && (
            <div style={{marginTop: 10, padding: '8px 12px', background: '#fef3c7', borderRadius: 8, fontSize: 12.5, color: '#78350f'}}>
              🏛️ <b>{lit.year}</b> · <i>{lit.title}</i> · {lit.authors}
            </div>
          )}

          <div className={styles.dlgActions}>
            {isNote && event.meta.noteId && (
              <Button onClick={() => onOpenNote?.(event.meta.noteId!)} variant="default">
                <Edit3 size={14} /> {CN.openNote}
              </Button>
            )}
            {lit && (
              <Button onClick={() => window.open(lit.url, '_blank')} variant="outline">
                <FileDown size={14} /> {CN.openLit} <ExternalLink size={11} />
              </Button>
            )}
            {isTask && task && onEdit && (
              <Button onClick={() => onEdit({id: task} as ResearchTask)} variant="outline">
                <Edit3 size={14} /> {CN.edit}
              </Button>
            )}
            {isTask && task && onDelete && (
              <Button onClick={() => onDelete(event)} variant="ghost" style={{color: '#dc2626'}}>
                <Trash2 size={14} /> {CN.delete}
              </Button>
            )}
            <div style={{flex: 1}} />
            <Button variant="outline" onClick={onClose}>{CN.close}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RefTag({ref_}: {ref_: {kind: string; refId: string; label: string}}): React.ReactElement {
  // paper → literature page anchor
  if (ref_.kind === 'paper') {
    return (
      <Link to={`/literature?focus=${ref_.refId}`} className={styles.dlgRefTag}>
        📄 {ref_.label}
      </Link>
    );
  }
  if (ref_.kind === 'note') {
    return (
      <Link to={`/reading-notes?focus=${ref_.refId}`} className={styles.dlgRefTag}>
        📝 {ref_.label}
      </Link>
    );
  }
  if (ref_.kind === 'weekly-report') {
    return (
      <Link to={`/weekly-reports?report=${ref_.refId}`} className={styles.dlgRefTag}>
        汇 {ref_.label}
      </Link>
    );
  }
  return <span className={styles.dlgRefTag}>📌 {ref_.label}</span>;
}
