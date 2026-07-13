import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {
  Archive,
  BookOpen,
  Boxes,
  Brain,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  GitBranch,
  Globe2,
  GraduationCap,
  GripVertical,
  Library,
  Menu,
  Network,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  RadioTower,
  RotateCcw,
  Search,
  Settings,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import SiteAccountMenu from '../auth/SiteAccountMenu';
import styles from './WorkbenchShell.module.css';

type Lang = 'zh' | 'en';

interface NavItem {
  to: string;
  zh: string;
  en: string;
  icon: React.ComponentType<{size?: number}>;
  matches?: readonly string[];
}

interface NavGroup {
  zh: string;
  en: string;
  icon: React.ComponentType<{size?: number}>;
  items: NavItem[];
}

const PRIMARY_NAV: NavItem[] = [
  {to: '/', zh: '项目说明', en: 'Project', icon: FileText},
  {
    to: '/library',
    zh: '文献库',
    en: 'Literature',
    icon: BookOpen,
    matches: ['/library', '/map', '/core', '/reading-paths', '/notes', '/terms', '/research-feed'],
  },
  {
    to: '/algorithm-board',
    zh: '压缩器',
    en: 'Codec',
    icon: Network,
    matches: ['/algorithm-board', '/algorithm-evolution', '/algorithm-catalog', '/neural-hub'],
  },
  {
    to: '/sota',
    zh: '基准结果',
    en: 'Benchmarks',
    icon: Trophy,
    matches: ['/sota', '/datasets', '/standards'],
  },
  {to: '/experiments', zh: '实验', en: 'Experiments', icon: FlaskConical},
  {
    to: '/weekly-reports',
    zh: '汇报',
    en: 'Briefings',
    icon: Presentation,
    matches: ['/weekly-reports', '/calendar', '/tasks', '/project-overview', '/project-files'],
  },
];

const SECONDARY_NAV: NavGroup[] = [
  {
    zh: '阅读与证据',
    en: 'Reading & evidence',
    icon: BookOpen,
    items: [
      {to: '/map', zh: '研究图谱', en: 'Research map', icon: Network},
      {to: '/core', zh: '核心论文', en: 'Core papers', icon: FileText},
      {to: '/reading-paths', zh: '阅读路线', en: 'Reading paths', icon: Target},
      {to: '/notes', zh: '研究笔记', en: 'Notes', icon: NotebookPen},
      {to: '/terms', zh: '术语索引', en: 'Glossary', icon: Library},
      {to: '/research-feed', zh: '来源记录', en: 'Source log', icon: RadioTower},
    ],
  },
  {
    zh: '方法与评测',
    en: 'Methods & evaluation',
    icon: GitBranch,
    items: [
      {to: '/datasets', zh: '数据集', en: 'Datasets', icon: Database},
      {to: '/algorithm-evolution', zh: '算法脉络', en: 'Algorithm history', icon: GitBranch},
      {to: '/algorithm-catalog', zh: '算法档案', en: 'Algorithm dossiers', icon: Archive},
      {to: '/neural-hub', zh: '神经压缩', en: 'Neural compression', icon: Brain},
      {to: '/sota', zh: '榜单结果', en: 'Leaderboard results', icon: Trophy},
      {to: '/standards', zh: '标准与场景', en: 'Standards', icon: Boxes},
    ],
  },
  {
    zh: '项目记录',
    en: 'Project records',
    icon: ClipboardList,
    items: [
      {to: '/calendar', zh: '日程', en: 'Calendar', icon: CalendarDays},
      {to: '/tasks', zh: '任务', en: 'Tasks', icon: ClipboardList},
      {to: '/tutorials', zh: '教程资料', en: 'Tutorials', icon: GraduationCap},
      {to: '/hub', zh: '资源目录', en: 'Resources', icon: Library},
      {to: '/project-overview', zh: '年度计划', en: 'Annual plan', icon: FileText},
      {to: '/project-files', zh: '项目文件', en: 'Project files', icon: Archive},
      {to: '/settings', zh: '设置', en: 'Settings', icon: Settings},
    ],
  },
];

const COPY = {
  zh: {
    name: '无损压缩研究',
    search: '搜索',
    searchLong: '搜索论文、算法与页面',
    directory: '研究索引',
    collapseDirectory: '收起研究索引',
    expandDirectory: '展开研究索引',
    openMenu: '打开导航',
    closeMenu: '关闭导航',
    switchLocale: '切换到英文',
    primaryNav: '主要导航',
    dragDirectory: '拖动研究索引',
    resetDirectory: '还原索引位置',
  },
  en: {
    name: 'Lossless Compression',
    search: 'Search',
    searchLong: 'Search papers, algorithms, and pages',
    directory: 'Research index',
    collapseDirectory: 'Collapse research index',
    expandDirectory: 'Expand research index',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    switchLocale: 'Switch to Chinese',
    primaryNav: 'Primary navigation',
    dragDirectory: 'Drag research index',
    resetDirectory: 'Reset index position',
  },
} as const;

export interface WorkbenchShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageHint?: string;
  mockTag?: 'mock' | 'unconnected' | 'pending';
  fullBleed?: boolean;
}

export default function WorkbenchShell({children, fullBleed = false}: WorkbenchShellProps): React.ReactElement {
  const location = useLocation();
  const {siteConfig, i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const baseUrl = stripLocaleFromBaseUrl(siteConfig.baseUrl);
  const pathWithoutBase = stripBasePath(location.pathname, baseUrl);
  const normalizedPath = stripLocalePrefix(pathWithoutBase);

  const isActive = (item: NavItem): boolean => {
    if (item.to === '/') return normalizedPath === '/' || normalizedPath === '';
    const paths = item.matches ?? [item.to];
    return paths.some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`));
  };

  const isPrimaryActive = (item: NavItem): boolean => {
    if (item.to === '/') return normalizedPath === '/' || normalizedPath === '';
    return normalizedPath === item.to;
  };

  const activeIndexGroup = SECONDARY_NAV.find((group) => group.items.some(isActive));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [indexCollapsed, setIndexCollapsed] = React.useState(false);
  const [openIndexGroup, setOpenIndexGroup] = React.useState(activeIndexGroup?.zh ?? SECONDARY_NAV[0].zh);
  const [indexPosition, setIndexPosition] = React.useState({x: 16, y: 92});
  const [indexDragging, setIndexDragging] = React.useState(false);
  const indexRef = React.useRef<HTMLElement | null>(null);
  const indexPositionRef = React.useRef(indexPosition);
  const dragState = React.useRef<{pointerId: number; offsetX: number; offsetY: number} | null>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    if (activeIndexGroup) setOpenIndexGroup(activeIndexGroup.zh);
  }, [activeIndexGroup?.zh, location.pathname]);

  React.useEffect(() => {
    setIndexCollapsed(window.localStorage.getItem('cr-research-index-collapsed') === 'true');
    const storedPosition = window.localStorage.getItem('cr-research-index-position');
    if (storedPosition) {
      try {
        const parsed = JSON.parse(storedPosition) as {x?: number; y?: number};
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
          const next = {x: Math.max(8, parsed.x as number), y: Math.max(76, parsed.y as number)};
          indexPositionRef.current = next;
          setIndexPosition(next);
        }
      } catch {
        window.localStorage.removeItem('cr-research-index-position');
      }
    }
  }, []);

  React.useEffect(() => {
    const keepIndexInViewport = (): void => {
      const width = indexRef.current?.offsetWidth ?? (indexCollapsed ? 62 : 252);
      setIndexPosition((position) => {
        const next = {
          x: Math.min(position.x, Math.max(8, window.innerWidth - width - 8)),
          y: Math.min(position.y, Math.max(76, window.innerHeight - 180)),
        };
        indexPositionRef.current = next;
        return next;
      });
    };
    window.addEventListener('resize', keepIndexInViewport);
    keepIndexInViewport();
    return () => window.removeEventListener('resize', keepIndexInViewport);
  }, [indexCollapsed]);

  const toggleIndex = (): void => {
    setIndexCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem('cr-research-index-collapsed', String(next));
      return next;
    });
  };

  const resetIndexPosition = (): void => {
    const next = {x: 16, y: 92};
    indexPositionRef.current = next;
    setIndexPosition(next);
    window.localStorage.removeItem('cr-research-index-position');
  };

  const handleIndexPointerDown = (event: React.PointerEvent<HTMLElement>): void => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    const bounds = indexRef.current?.getBoundingClientRect();
    if (!bounds) return;
    dragState.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIndexDragging(true);
  };

  const handleIndexPointerMove = (event: React.PointerEvent<HTMLElement>): void => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const width = indexRef.current?.offsetWidth ?? (indexCollapsed ? 62 : 252);
    const height = indexRef.current?.offsetHeight ?? 180;
    const next = {
      x: Math.min(Math.max(8, event.clientX - drag.offsetX), Math.max(8, window.innerWidth - width - 8)),
      y: Math.min(Math.max(76, event.clientY - drag.offsetY), Math.max(76, window.innerHeight - Math.min(height, 180))),
    };
    indexPositionRef.current = next;
    setIndexPosition(next);
  };

  const handleIndexPointerUp = (event: React.PointerEvent<HTMLElement>): void => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragState.current = null;
    setIndexDragging(false);
    window.localStorage.setItem('cr-research-index-position', JSON.stringify(indexPositionRef.current));
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const localePath = lang === 'en' ? normalizedPath : addEnglishPrefix(normalizedPath);
  const localeTarget = `${withBasePath(localePath, baseUrl)}${location.search}${location.hash}`;

  return (
    <div className={styles.shell} data-index-collapsed={indexCollapsed} data-index-moved={indexPosition.x !== 16 || indexPosition.y !== 92}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandMark}>LC</span>
            <span className={styles.brandText}>
              <strong>{copy.name}</strong>
            </span>
          </Link>

          <nav className={styles.desktopNav} aria-label={copy.primaryNav}>
            {PRIMARY_NAV.map((item) => {
              const active = isPrimaryActive(item);
              return (
                <Link key={item.to} to={item.to} data-active={active} aria-current={active ? 'page' : undefined}>
                  {lang === 'zh' ? item.zh : item.en}
                </Link>
              );
            })}
          </nav>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.searchButton}
              onClick={() => (window as {__openCommandPalette__?: () => void}).__openCommandPalette__?.()}
              aria-label={copy.searchLong}
              title={copy.searchLong}
            >
              <Search size={16} />
              <span>{copy.search}</span>
              <kbd>Ctrl K</kbd>
            </button>

            <SiteAccountMenu compact />

            <a href={localeTarget} className={styles.localeButton} title={copy.switchLocale} aria-label={copy.switchLocale}>
              <Globe2 size={16} />
              <span>{lang === 'zh' ? 'EN' : '中'}</span>
            </a>
            <button type="button" className={styles.mobileMenuButton} onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? copy.closeMenu : copy.openMenu}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <aside
        ref={indexRef}
        className={styles.researchIndex}
        aria-label={copy.directory}
        data-dragging={indexDragging}
        style={{left: indexPosition.x, top: indexPosition.y, bottom: 'auto', height: `calc(100vh - ${indexPosition.y + 16}px)`}}
      >
        <header
          onPointerDown={handleIndexPointerDown}
          onPointerMove={handleIndexPointerMove}
          onPointerUp={handleIndexPointerUp}
          onPointerCancel={handleIndexPointerUp}
          title={copy.dragDirectory}
        >
          <div className={styles.indexIdentity}>
            <span className={styles.indexMark}><Network size={14} /></span>
            <span className={styles.indexIdentityCopy}>
              <strong>{copy.directory}</strong>
              <small>{copy.dragDirectory}</small>
            </span>
          </div>
          <GripVertical className={styles.dragGrip} size={16} aria-hidden="true" />
          <button type="button" onClick={toggleIndex} aria-label={indexCollapsed ? copy.expandDirectory : copy.collapseDirectory} title={indexCollapsed ? copy.expandDirectory : copy.collapseDirectory}>
            {indexCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </header>
        {indexCollapsed ? (
          <div className={styles.compactGroups}>
            {SECONDARY_NAV.map((group, groupIndex) => {
              const GroupIcon = group.icon;
              const label = lang === 'zh' ? group.zh : group.en;
              const active = group.items.some(isActive);
              return (
                <button
                  type="button"
                  key={group.zh}
                  data-group={groupIndex}
                  data-active={active}
                  onClick={() => {
                    setOpenIndexGroup(group.zh);
                    setIndexCollapsed(false);
                    window.localStorage.setItem('cr-research-index-collapsed', 'false');
                  }}
                  aria-label={label}
                  title={label}
                >
                  <GroupIcon size={18} />
                  <span>{String(groupIndex + 1).padStart(2, '0')}</span>
                </button>
              );
            })}
            <button type="button" className={styles.resetIndexButton} onClick={resetIndexPosition} aria-label={copy.resetDirectory} title={copy.resetDirectory}>
              <RotateCcw size={17} />
            </button>
          </div>
        ) : (
          <div className={styles.indexGroups}>
          {SECONDARY_NAV.map((group, groupIndex) => {
            const groupActive = group.items.some(isActive);
            const groupOpen = openIndexGroup === group.zh;
            const GroupIcon = group.icon;
            return (
              <section key={group.zh} data-active={groupActive} data-group={groupIndex}>
                <button
                  type="button"
                  className={styles.groupTrigger}
                  aria-expanded={groupOpen}
                  onClick={() => setOpenIndexGroup((current) => current === group.zh ? '' : group.zh)}
                >
                  <span><GroupIcon size={16} />{lang === 'zh' ? group.zh : group.en}</span>
                  <ChevronDown size={14} />
                </button>
                <div className={styles.groupItems} data-open={groupOpen} aria-hidden={!groupOpen}>
                  <div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const label = lang === 'zh' ? item.zh : item.en;
                      const active = isActive(item);
                      return (
                        <Link key={item.to} to={item.to} data-active={active} aria-current={active ? 'page' : undefined} title={label} tabIndex={groupOpen ? undefined : -1}>
                          <Icon size={16} />
                          <span>{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
          {indexPosition.x !== 16 || indexPosition.y !== 92 ? (
            <button type="button" className={styles.resetPositionBar} onClick={resetIndexPosition}>
              <RotateCcw size={14} /> {copy.resetDirectory}
            </button>
          ) : null}
          </div>
        )}
      </aside>

      {mobileOpen ? (
        <div className={styles.mobilePanel}>
          <nav aria-label={copy.primaryNav}>
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isPrimaryActive(item);
              return (
                <Link key={item.to} to={item.to} data-active={active} aria-current={active ? 'page' : undefined}>
                  <Icon size={17} />
                  <span>{lang === 'zh' ? item.zh : item.en}</span>
                </Link>
              );
            })}
          </nav>
          <div className={styles.mobileDirectory}>
            {SECONDARY_NAV.map((group) => (
              <section key={group.zh}>
                <h2>{lang === 'zh' ? group.zh : group.en}</h2>
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link key={item.to} to={item.to} data-active={active} aria-current={active ? 'page' : undefined}>
                      {lang === 'zh' ? item.zh : item.en}
                    </Link>
                  );
                })}
              </section>
            ))}
          </div>
        </div>
      ) : null}

      <main className={styles.main}>
        <div className={`${styles.content} ${fullBleed ? styles.contentFull : ''}`}>{children}</div>
      </main>

      <CommandPalette />
    </div>
  );
}

function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

function stripBasePath(pathname: string, baseUrl: string): string {
  const basePath = baseUrl.replace(/\/+$/, '');
  if (!basePath) return pathname || '/';
  if (pathname === basePath) return '/';
  if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length) || '/';
  return pathname || '/';
}

function withBasePath(pathname: string, baseUrl: string): string {
  const basePath = baseUrl.replace(/\/+$/, '');
  if (!basePath) return pathname;
  return pathname === '/' ? `${basePath}/` : `${basePath}${pathname}`;
}

function stripLocaleFromBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/en\/?$/, '/');
}

function addEnglishPrefix(pathname: string): string {
  const normalized = stripLocalePrefix(pathname);
  return normalized === '/' ? '/en/' : `/en${normalized}`;
}
