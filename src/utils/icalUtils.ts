// icalUtils.ts - 将 ResearchTask 导出为 iCalendar (.ics) 格式
// 用于订阅到 Google Calendar / Apple Calendar / Outlook 等

import type {ResearchTask} from '../stores/workbench';

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@compressor-research`;
}

/** 把 ResearchTask 数组生成 .ics 文本 */
export function tasksToIcs(tasks: ResearchTask[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Compressor Research Workbench//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:压缩算法研究任务',
  ];

  for (const task of tasks) {
    if (!task.dueDate && !task.startedAt) continue;
    const start = task.startedAt ? new Date(task.startedAt) : new Date(task.dueDate!);
    const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + task.estimatedMinutes * 60_000);

    const status = task.status === 'done' ? 'COMPLETED' : task.status === 'delayed' ? 'CANCELLED' : 'CONFIRMED';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid()}`);
    lines.push(`DTSTAMP:${formatIcsDate(new Date())}`);
    lines.push(`DTSTART:${formatIcsDate(start)}`);
    lines.push(`DTEND:${formatIcsDate(end)}`);
    lines.push(`SUMMARY:${escapeIcsText(task.title)}`);
    if (task.description) lines.push(`DESCRIPTION:${escapeIcsText(task.description)}`);
    if (task.priority === 'urgent') lines.push('PRIORITY:1');
    else if (task.priority === 'high') lines.push('PRIORITY:5');
    if (task.status === 'done') lines.push(`STATUS:${status}`);
    if (task.status === 'dropped') lines.push('STATUS:CANCELLED');
    lines.push(`URL:https://github.com/your-repo`); // placeholder
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** 触发浏览器下载 .ics 文件 */
export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], {type: 'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
