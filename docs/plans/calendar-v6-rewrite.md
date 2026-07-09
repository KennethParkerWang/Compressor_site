# 规划:日程页 v6.0 重构

## 用户痛点
1. **日程"死的"** — 只显示任务,不同步笔记更新、文献阅读里程碑
2. **新建的东西不显示** — eventClick 后 events 数组没及时同步
3. **更易读 + 高级感**

## 技术方案

### 引入:Schedule-X (MIT, TypeScript 原生, 15KB)
- `npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/events-service temporal-polyfill`
- 5 个视图: Day / Week / WeekAgenda / MonthGrid / MonthAgenda
- `useCalendarApp` hook + `<ScheduleXCalendar>` 组件
- `customComponents` 注入自定义 React 组件 (event、modal 都可)
- 自带 dark mode,响应式

### 数据流 (多模块联动)
日历事件统一封装成 `CalendarEvent`:
```ts
type CalendarEventType = 'task-todo' | 'task-doing' | 'task-done' | 'note-updated' | 'reading-milestone';
interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  start: string;        // YYYY-MM-DD
  end?: string;         // YYYY-MM-DD (multi-day task)
  description?: string;
  meta: {
    lane?: TaskLane;
    priority?: string;
    refs?: TaskRef[];
    litId?: string;
    noteId?: string;
  };
}
```

事件源 (4 条):
| 来源 | 类型 | 触发字段 |
|---|---|---|
| `researchTasks` (zustand) | task-todo / task-doing / task-done | `dueDate` + `startedAt` + `completedAt` |
| `readingNotes` (zustand) | note-updated | `updatedAt` (今日/最近7天) |
| `literatureData` (静态) | reading-milestone | `year` (按年份显示,提示性) |
| 用户新建 (manual) | task-todo | 用户在日历上 drag-create |

### 视觉设计 (高级感 + 易读)
**布局**: 三段式
1. **顶部** — Stats Strip (4 卡: 本月任务/本月小时/笔记更新数/活跃任务),迷你 KPI
2. **左侧 Sidebar (280px)** — 多模块联动源切换 + 图例 + 筛选
3. **主区** — Schedule-X Calendar, 占满

**色彩**:
- Task: 6 lane 用色 (同当前 calendar)
- Note: 琥珀色 (#f59e0b)
- Milestone: 紫色 (#a855f7)
- 已过期: 红色描边 + 灰底

**Event card**: 自定义 `customComponents`,显示
- 左色条 (按 type/lane)
- 标题 (粗)
- 副标题 (refs 中关联的论文/笔记)
- 右侧:状态图标 + 时长/字数
- hover 展开详情 tooltip

### 文件改动
**新增**:
- `src/components/calendar/StatStrip.tsx` — 顶部 KPI 条
- `src/components/calendar/EventSidebar.tsx` — 左侧源切换
- `src/components/calendar/CalendarEvent.tsx` — 自定义 event 渲染
- `src/components/calendar/CalendarLegend.tsx` — 图例
- `src/components/calendar/calendar.module.css` — 样式
- `src/data/calendarEvents.ts` — 4 源 merge 逻辑 + CalendarEvent 类型

**修改**:
- `src/pages/calendar.tsx` — 重写, 使用 Schedule-X
- `package.json` — 加依赖

### 工作流
1. 装包
2. 写 calendarEvents.ts (核心: 多源 merge)
3. 写 5 个组件 + CSS
4. 重写 calendar.tsx
5. 验证 build + 截图

### 实施时间
- 安装 + 数据层: 10 min
- 组件 + 重写: 25 min
- 调试 + build: 10 min
- 总计 ~45 min

### 风险
- Schedule-X v4 vs v3 API 可能差异 (查文档)
- FullCalendar 已装,需卸载
- calendar.tsx 是 396 行大文件,需要完整重写,确保新建/编辑/拖拽/删除全部 work