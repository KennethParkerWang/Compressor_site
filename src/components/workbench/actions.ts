// 全局跨页操作小工具:批量把文献加入笔记/任务/路线
import {literatureData} from '../../data/literatureData';
import {readingPaths} from '../../data/readingPaths';
import {useNotes} from '../../stores/workbench';
import {useTasks} from '../../stores/workbench';
import type {TaskRef} from '../../data/researchTasks';

export interface LitRef {
  id: string;
  title: string;
  authors?: string;
  year?: string;
}

/**
 * 把一篇文献转成 TaskRef(用于创建/绑定任务)。
 */
export function litToRef(l: {id: string; title: string; authors?: string}): TaskRef {
  return {kind: 'paper', refId: l.id, label: l.authors ? `${l.authors.split(',')[0].trim()} - ${l.title}` : l.title};
}

export function pathToRef(p: {id: string; name: string; nameZh?: string}): TaskRef {
  return {kind: 'path', refId: p.id, label: p.nameZh ? `${p.nameZh} / ${p.name}` : p.name};
}

export function findLit(id: string): LitRef | undefined {
  const l = literatureData.find((x) => x.id === id);
  if (!l) return undefined;
  return {id: l.id, title: l.title, authors: l.authors, year: l.year};
}

export function findPath(id: string) {
  return readingPaths.find((p) => p.id === id);
}

/**
 * 创建一批「读 + 写笔记」任务(给选中的多篇文献用)。
 * 返回新建任务的 id 列表。
 */
export function createReadTasks(litIds: string[], opts: {lane: 'this-week' | 'needs-note' | 'needs-pdf'; dueIn: number; minutes: number; priority: 'low' | 'normal' | 'high' | 'urgent'}) {
  const addTask = useTasks.getState().addTask;
  const ids: string[] = [];
  for (const id of litIds) {
    const lit = findLit(id);
    if (!lit) continue;
    const ref: TaskRef = litToRef(lit);
    const due = new Date();
    due.setDate(due.getDate() + opts.dueIn);
    const newTaskId = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    addTask({
      title: opts.lane === 'needs-note' ? `写 ${lit.title} 的六问笔记` : `阅读 ${lit.title}`,
      description: opts.lane === 'needs-note' ? '在 Notes 页里完成六问模板' : '在 Library 里打开文献并标注重点',
      status: 'todo',
      lane: opts.lane,
      refs: [ref],
      dueDate: due.toISOString().slice(0, 10),
      estimatedMinutes: opts.minutes,
      priority: opts.priority,
    });
    ids.push(newTaskId);
  }
  return ids;
}

/**
 * 给选中文献批量创建空笔记草稿。
 */
export function bulkAddNotes(litIds: string[]) {
  const addNote = useNotes.getState().addNote;
  const newIds: string[] = [];
  for (const id of litIds) {
    const lit = findLit(id);
    if (!lit) continue;
    addNote(id, lit.title);
    newIds.push(id);
  }
  return newIds;
}

export function progressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function formatRelative(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return d.toISOString().slice(0, 10);
}