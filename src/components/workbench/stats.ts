// 全局统计:文献分布、章节进度、阅读路线进度、本周任务完成率
import {useMemo} from 'react';
import {literatureData} from '../../data/literatureData';
import {readingPaths} from '../../data/readingPaths';
import {useTasks} from '../../stores/workbench';
import {useNotes} from '../../stores/workbench';

export interface WorkbenchStats {
  totalLit: number;
  litByChapter: {id: string; label: string; count: number}[];
  litByYear: {year: string; count: number}[];
  litBySourceKind: {kind: string; count: number}[];
  litByDifficulty: {level: string; count: number}[];
  openTasks: number;
  doneTasks: number;
  overdueTasks: number;
  totalTasks: number;
  totalNotes: number;
  notesThisWeek: number;
  progressPercent: number;
  pathsProgress: {id: string; label: string; total: number; done: number; percent: number}[];
}

export function useWorkbenchStats(): WorkbenchStats {
  const tasks = useTasks((s) => s.tasks);
  const notes = useNotes((s) => s.notes);

  return useMemo(() => {
    const chapterMap = new Map<string, {id: string; label: string; count: number}>();
    const yearMap = new Map<string, number>();
    const kindMap = new Map<string, number>();
    const diffMap = new Map<string, number>();

    for (const l of literatureData) {
      const key = l.chapterId ?? '_';
      const cur = chapterMap.get(key) ?? {id: key, label: l.chapterTitleZh ?? l.chapterTitleEn ?? key, count: 0};
      cur.count++;
      chapterMap.set(key, cur);
      if (l.year) {
        yearMap.set(l.year, (yearMap.get(l.year) ?? 0) + 1);
      }
      if (l.sourceKind) {
        kindMap.set(l.sourceKind, (kindMap.get(l.sourceKind) ?? 0) + 1);
      }
      if (l.difficulty) {
        diffMap.set(l.difficulty, (diffMap.get(l.difficulty) ?? 0) + 1);
      }
    }

    const open = tasks.filter((t) => t.status === 'todo' || t.status === 'doing').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length;

    const weekAgo = Date.now() - 7 * 86400 * 1000;
    const notesThisWeek = notes.filter((n) => new Date(n.updatedAt).getTime() > weekAgo).length;

    const paths = readingPaths.map((p) => {
      const total = (p.readingPathIds ?? []).length;
      const linkedDone = tasks.filter(
        (t) => t.status === 'done' && t.refs.some((r) => r.kind === 'path' && r.refId === p.id),
      ).length;
      const percent = total > 0 ? Math.min(100, Math.round((linkedDone / total) * 100)) : 0;
      return {id: p.id, label: p.nameZh ?? p.name, total, done: linkedDone, percent};
    });

    const total = open + done;
    const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      totalLit: literatureData.length,
      litByChapter: Array.from(chapterMap.values()).sort((a, b) => a.id.localeCompare(b.id)),
      litByYear: Array.from(yearMap.entries())
        .map(([year, count]) => ({year, count}))
        .sort((a, b) => a.year.localeCompare(b.year)),
      litBySourceKind: Array.from(kindMap.entries()).map(([kind, count]) => ({kind, count})),
      litByDifficulty: Array.from(diffMap.entries()).map(([level, count]) => ({level, count})),
      openTasks: open,
      doneTasks: done,
      overdueTasks: overdue,
      totalTasks: total,
      totalNotes: notes.length,
      notesThisWeek,
      progressPercent,
      pathsProgress: paths,
    };
  }, [tasks, notes]);
}