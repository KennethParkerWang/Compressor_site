declare module 'frappe-gantt' {
  interface GanttTask { id: string; name: string; start: string; end: string; progress: number; dependencies?: string; }
  interface GanttOptions { view_mode?: string; language?: string; }
  export default class Gantt { constructor(target: HTMLElement, tasks: GanttTask[], options?: GanttOptions); }
}
