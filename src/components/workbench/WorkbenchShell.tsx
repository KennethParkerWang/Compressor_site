import React from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {
  BarChart3,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  GitBranch,
  Globe2,
  GraduationCap,
  Map as MapIcon,
  NotebookPen,
  Presentation,
  RadioTower,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import GlobalHelpButton from './GlobalHelpButton';
import {useWorkbenchStats} from './stats';
import {useTasks} from '../../stores/workbench';
import styles from './WorkbenchShell.module.css';

type NavGroup = 'console' | 'intelligence' | 'knowledge' | 'execution' | 'admin';

interface NavItem {
  to: string;
  label: string;
  zh: string;
  zhSub: string;
  en: string;
  icon: React.ComponentType<{size?: number}>;
  group: NavGroup;
  signal?: string;
  mock?: 'mock' | 'unconnected' | 'pending';
}

const NAV: NavItem[] = [
  {to: '/', label: 'Today', zh: '今日总览', zhSub: '科研驾驶舱', en: 'Research dashboard', icon: Sparkles, group: 'console'},
  {to: '/sota', label: 'SOTA', zh: 'SOTA榜单', zhSub: '榜单证据', en: 'Leaderboard evidence', icon: Trophy, group: 'console'},
  {to: '/datasets', label: 'Datasets', zh: '数据集', zhSub: '基准库', en: 'Benchmark registry', icon: Database, group: 'console'},
  {to: '/neural-hub', label: 'Learned', zh: '深度压缩器', zhSub: '学习式压缩', en: 'Learned compression', icon: Brain, group: 'console'},
  {to: '/tasks', label: 'Tasks', zh: '任务看板', zhSub: '执行推进', en: 'Execution board', icon: ClipboardList, group: 'console'},

  {to: '/library', label: 'Library', zh: '文献库', zhSub: '证据数据库', en: 'Evidence database', icon: BookOpen, group: 'intelligence'},
  {to: '/map', label: 'Map', zh: '研究图谱', zhSub: '文献关系', en: 'Research map', icon: MapIcon, group: 'intelligence'},
  {to: '/core', label: 'Core Papers', zh: '核心论文', zhSub: '精读入口', en: 'Essential papers', icon: FileText, group: 'intelligence'},
  {to: '/research-feed', label: 'Sources', zh: '来源监控', zhSub: '候选资料', en: 'Source monitor', icon: RadioTower, group: 'intelligence'},

  {to: '/reading-paths', label: 'Paths', zh: '阅读路线', zhSub: '学习顺序', en: 'Reading syllabus', icon: Target, group: 'knowledge'},
  {to: '/notes', label: 'Notes', zh: '研究笔记', zhSub: '精读沉淀', en: 'Research notes', icon: NotebookPen, group: 'knowledge'},
  {to: '/tutorials', label: 'Tutorials', zh: '教程资源', zhSub: '学习材料', en: 'Tutorial index', icon: GraduationCap, group: 'knowledge'},
  {to: '/terms', label: 'Terms', zh: '术语库', zhSub: '概念索引', en: 'Glossary', icon: BookOpen, group: 'knowledge'},
  {to: '/standards', label: 'Standards', zh: '标准矩阵', zhSub: '场景规范', en: 'Standards matrix', icon: Database, group: 'knowledge'},

  {to: '/experiments', label: 'Experiments', zh: '实验台', zhSub: '复现实验', en: 'Reproduction lab', icon: FlaskConical, group: 'execution'},
  {to: '/algorithm-board', label: 'Modules', zh: '算法模块', zhSub: '压缩流程', en: 'Codec modules', icon: Boxes, group: 'execution'},
  {to: '/algorithm-evolution', label: 'Evolution', zh: '演化天梯', zhSub: '历史脉络', en: 'Algorithm atlas', icon: GitBranch, group: 'execution'},
  {to: '/algorithm-catalog', label: 'Catalog', zh: '算法目录', zhSub: '方法档案', en: 'Algorithm dossiers', icon: Database, group: 'execution'},
  {to: '/calendar', label: 'Calendar', zh: '日程计划', zhSub: '项目节奏', en: 'Project schedule', icon: CalendarDays, group: 'execution'},
  {to: '/weekly-reports', label: 'Reports', zh: '双周汇报', zhSub: '材料展示', en: 'Biweekly briefings', icon: Presentation, group: 'execution'},

  {to: '/hub', label: 'Hub', zh: '资源库', zhSub: '工具课程', en: 'Resource library', icon: BarChart3, group: 'admin'},
  {to: '/project-overview', label: 'Project', zh: '项目计划', zhSub: '年度交付', en: 'Delivery plan', icon: Briefcase, group: 'admin'},
  {to: '/settings', label: 'Settings', zh: '设置', zhSub: '工作区配置', en: 'Workspace settings', icon: Settings, group: 'admin'},
];

const GROUP_LABEL: Record<'zh' | 'en', Record<NavGroup, string>> = {
  zh: {
    console: '研究控制台',
    intelligence: '证据与情报',
    knowledge: '知识库',
    execution: '执行层',
    admin: '系统',
  },
  en: {
    console: 'Research Console',
    intelligence: 'Evidence Intelligence',
    knowledge: 'Knowledge Base',
    execution: 'Execution Layer',
    admin: 'System',
  },
};

const SHELL_COPY = {
  zh: {
    brandTitle: '压缩算法研图',
    brandSub: '科研情报工作台',
    search: '搜索论文、榜单、任务',
    workspace: '工作区',
    workspaceAria: '工作区概览',
    literature: '文献',
    notes: '笔记',
    openTasks: '待办',
    sourceMode: '数据来源',
    sourceValue: '本地精选数据',
    localeAria: '切换到英文',
    localeTitle: '切换到英文',
    localeHint: '英文界面',
    localeBadge: 'EN',
    mock: '示例数据',
    unconnected: '未连接真实源',
    pending: '待配置',
  },
  en: {
    brandTitle: 'Compression Research Atlas',
    brandSub: 'Research Intelligence Console',
    search: 'Search papers, boards, tasks',
    workspace: 'Workspace',
    workspaceAria: 'Workspace snapshot',
    literature: 'Papers',
    notes: 'Notes',
    openTasks: 'Open',
    sourceMode: 'Source mode',
    sourceValue: 'Curated local data',
    localeAria: 'Switch to Chinese',
    localeTitle: 'Switch to Chinese',
    localeHint: 'Chinese interface',
    localeBadge: 'ZH',
    mock: 'Demo data',
    unconnected: 'Source pending',
    pending: 'Pending',
  },
};

const SIDEBAR_WIDTH_KEY = 'cr.sidebarWidth';
const DEFAULT_SIDEBAR_WIDTH = 444;
const MIN_SIDEBAR_WIDTH = 320;
const MAX_SIDEBAR_WIDTH = 640;

export interface WorkbenchShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageHint?: string;
  mockTag?: 'mock' | 'unconnected' | 'pending';
  fullBleed?: boolean;
}

export default function WorkbenchShell({
  children,
  mockTag,
  fullBleed = false,
}: WorkbenchShellProps): React.ReactElement {
  const location = useLocation();
  const stats = useWorkbenchStats();
  const tasks = useTasks((s) => s.tasks);
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH);
  const openTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'doing').length;
  const normalizedPath = stripLocalePrefix(location.pathname);
  const isEnglishLocale = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const lang: 'zh' | 'en' = isEnglishLocale ? 'en' : 'zh';
  const copy = isEnglishLocale ? SHELL_COPY.en : SHELL_COPY.zh;
  const localeTarget = `${isEnglishLocale ? normalizedPath : addEnglishPrefix(normalizedPath)}${location.search}${location.hash}`;

  React.useEffect(() => {
    const savedWidth = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const parsedWidth = savedWidth ? Number(savedWidth) : Number.NaN;
    if (Number.isFinite(parsedWidth)) {
      setSidebarWidth(clampSidebarWidth(parsedWidth));
    }
  }, []);

  const shellStyle = React.useMemo(
    () => ({'--rail-w': `${sidebarWidth}px`} as React.CSSProperties),
    [sidebarWidth],
  );

  const commitSidebarWidth = React.useCallback((nextWidth: number) => {
    const width = clampSidebarWidth(nextWidth);
    setSidebarWidth(width);
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
  }, []);

  const beginSidebarResize = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();

      const startX = event.clientX;
      const startWidth = sidebarWidth;
      let latestWidth = startWidth;

      document.body.classList.add('cr-sidebar-resizing');

      const handleMove = (moveEvent: PointerEvent) => {
        latestWidth = clampSidebarWidth(startWidth + moveEvent.clientX - startX);
        setSidebarWidth(latestWidth);
      };

      const stopResize = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', stopResize);
        document.removeEventListener('pointercancel', stopResize);
        document.body.classList.remove('cr-sidebar-resizing');
        window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(latestWidth));
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', stopResize);
      document.addEventListener('pointercancel', stopResize);
    },
    [sidebarWidth],
  );

  const resizeSidebarWithKeyboard = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      commitSidebarWidth(sidebarWidth + (event.key === 'ArrowRight' ? 24 : -24));
    },
    [commitSidebarWidth, sidebarWidth],
  );

  const groups = (['console', 'intelligence', 'knowledge', 'execution', 'admin'] as const).map((key) => ({
    key,
    items: NAV.filter((n) => n.group === key),
  }));

  function isActive(to: string): boolean {
    if (to === '/') return normalizedPath === '/' || normalizedPath === '';
    if (to === '/sota') return normalizedPath === '/sota';
    return normalizedPath === to || normalizedPath.startsWith(`${to}/`);
  }

  return (
    <div className={styles.shell} style={shellStyle}>
      <aside className={styles.sidebar}>
        <Link to={lang === 'en' ? '/en/' : '/'} className={styles.brand}>
          <span className={styles.brandMark}>CR</span>
          <span className={styles.brandText}>
            <strong>{copy.brandTitle}</strong>
            <span>{copy.brandSub}</span>
          </span>
        </Link>

        <button
          type="button"
          className={styles.searchBtn}
          onClick={() => (window as any).__openCommandPalette__?.()}
        >
          <Search size={15} />
          <span>{copy.search}</span>
          <kbd>⌘K</kbd>
        </button>

        <a href={localeTarget} className={styles.localeSwitch} aria-label={copy.localeAria}>
          <Globe2 size={15} />
          <span className={styles.localeText}>
            <strong>{copy.localeTitle}</strong>
            <em>{copy.localeHint}</em>
          </span>
          <b>{copy.localeBadge}</b>
        </a>

        <section className={styles.snapshot} aria-label={copy.workspaceAria}>
          <div className={styles.snapshotTop}>
            <span>{copy.workspace}</span>
            <strong>{stats.progressPercent}%</strong>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{width: `${stats.progressPercent}%`}} />
          </div>
          <div className={styles.snapshotGrid}>
            <span>
              <strong>{stats.totalLit}</strong>
              {copy.literature}
            </span>
            <span>
              <strong>{stats.totalNotes}</strong>
              {copy.notes}
            </span>
            <span>
              <strong>{openTasks}</strong>
              {copy.openTasks}
            </span>
          </div>
        </section>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <section key={group.key} className={styles.group}>
              <div className={styles.groupLabel}>{GROUP_LABEL[lang][group.key]}</div>
              <ul className={styles.navList}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  const navTo = lang === 'en' ? addEnglishPrefix(item.to) : item.to;
                  const navLabel = lang === 'zh' ? item.zh : item.label;
                  const navSub = lang === 'zh' ? item.zhSub : item.en;
                  return (
                    <li key={item.to}>
                      <Link
                        to={navTo}
                        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon size={16} />
                          <span className={styles.navMain}>
                            <span className={styles.navLabel}>{navLabel}</span>
                          <span className={styles.navZh}>{navSub}</span>
                        </span>
                        {item.mock ? <span className={styles.mockDot}>M</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className={styles.foot}>
          <span className={styles.footLabel}>{copy.sourceMode}</span>
          <strong>{copy.sourceValue}</strong>
        </div>
      </aside>

      <div
        className={styles.resizeHandle}
        role="separator"
        aria-label={lang === 'zh' ? '调整侧栏宽度' : 'Resize sidebar'}
        aria-orientation="vertical"
        aria-valuemin={MIN_SIDEBAR_WIDTH}
        aria-valuemax={MAX_SIDEBAR_WIDTH}
        aria-valuenow={sidebarWidth}
        tabIndex={0}
        onPointerDown={beginSidebarResize}
        onKeyDown={resizeSidebarWithKeyboard}
      />

      <main className={styles.main}>
        {mockTag ? (
          <header className={styles.pageHead}>
            {mockTag ? (
              <span className={styles.pageBadge} data-kind={mockTag}>
                {mockTag === 'mock' ? copy.mock : null}
                {mockTag === 'unconnected' ? copy.unconnected : null}
                {mockTag === 'pending' ? copy.pending : null}
              </span>
            ) : null}
          </header>
        ) : null}
        <div className={`${styles.content} ${fullBleed ? styles.contentFull : ''}`}>{children}</div>
      </main>

      <CommandPalette />
      <GlobalHelpButton />
    </div>
  );
}

function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

function addEnglishPrefix(pathname: string): string {
  const normalized = stripLocalePrefix(pathname);
  return normalized === '/' ? '/en/' : `/en${normalized}`;
}

function clampSidebarWidth(value: number): number {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(value)));
}
