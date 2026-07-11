import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {
  Archive,
  BarChart3,
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
  LayoutGrid,
  Library,
  Menu,
  Network,
  NotebookPen,
  Presentation,
  RadioTower,
  Search,
  Settings,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import ThemeSwitcher from '../ThemeSwitcher';
import CommandPalette from './CommandPalette';
import styles from './WorkbenchShell.module.css';

type Lang = 'zh' | 'en';

interface NavItem {
  to: string;
  zh: string;
  en: string;
  icon: React.ComponentType<{size?: number}>;
  matches?: readonly string[];
}

const PRIMARY_NAV: NavItem[] = [
  {to: '/', zh: '研究总览', en: 'Overview', icon: BarChart3},
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
    matches: ['/weekly-reports', '/calendar', '/tasks', '/project-overview'],
  },
];

const SECONDARY_NAV: Array<{zh: string; en: string; items: NavItem[]}> = [
  {
    zh: '阅读与证据',
    en: 'Reading & evidence',
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
    items: [
      {to: '/calendar', zh: '日程', en: 'Calendar', icon: CalendarDays},
      {to: '/tasks', zh: '任务', en: 'Tasks', icon: ClipboardList},
      {to: '/tutorials', zh: '教程资料', en: 'Tutorials', icon: GraduationCap},
      {to: '/hub', zh: '资源目录', en: 'Resources', icon: Library},
      {to: '/project-overview', zh: '项目说明', en: 'Project', icon: FileText},
      {to: '/settings', zh: '设置', en: 'Settings', icon: Settings},
    ],
  },
];

const COPY = {
  zh: {
    name: '无损压缩研究',
    field: '研究档案与实验记录',
    search: '搜索',
    searchLong: '搜索论文、算法与页面',
    directory: '研究索引',
    directoryDesc: '全部研究资料与项目页面',
    openMenu: '打开导航',
    closeMenu: '关闭导航',
    switchLocale: '切换到英文',
    primaryNav: '主要导航',
  },
  en: {
    name: 'Lossless Compression',
    field: 'Research Archive',
    search: 'Search',
    searchLong: 'Search papers, algorithms, and pages',
    directory: 'Research index',
    directoryDesc: 'All research material and project pages',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    switchLocale: 'Switch to Chinese',
    primaryNav: 'Primary navigation',
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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [directoryOpen, setDirectoryOpen] = React.useState(false);
  const directoryRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setDirectoryOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!directoryOpen) return undefined;

    const closeOnOutsideClick = (event: MouseEvent): void => {
      if (directoryRef.current && !directoryRef.current.contains(event.target as Node)) setDirectoryOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setDirectoryOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [directoryOpen]);

  const isActive = (item: NavItem): boolean => {
    if (item.to === '/') return normalizedPath === '/' || normalizedPath === '';
    const paths = item.matches ?? [item.to];
    return paths.some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`));
  };

  const localePath = lang === 'en' ? normalizedPath : addEnglishPrefix(normalizedPath);
  const localeTarget = `${withBasePath(localePath, baseUrl)}${location.search}${location.hash}`;

  return (
    <div className={styles.shell}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandMark}>LC</span>
            <span className={styles.brandText}>
              <strong>{copy.name}</strong>
              <span>{copy.field}</span>
            </span>
          </Link>

          <nav className={styles.desktopNav} aria-label={copy.primaryNav}>
            {PRIMARY_NAV.map((item) => (
              <Link key={item.to} to={item.to} data-active={isActive(item)}>
                {lang === 'zh' ? item.zh : item.en}
              </Link>
            ))}
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

            <div className={styles.directoryWrap} ref={directoryRef}>
              <button
                type="button"
                className={styles.directoryButton}
                onClick={() => setDirectoryOpen((value) => !value)}
                aria-expanded={directoryOpen}
                title={copy.directory}
              >
                <LayoutGrid size={17} />
                <span>{copy.directory}</span>
                <ChevronDown size={14} />
              </button>

              {directoryOpen ? (
                <div className={styles.directoryPanel}>
                  <header>
                    <div>
                      <strong>{copy.directory}</strong>
                      <span>{copy.directoryDesc}</span>
                    </div>
                    <span>{SECONDARY_NAV.reduce((sum, group) => sum + group.items.length, 0)}</span>
                  </header>
                  <div className={styles.directoryGrid}>
                    {SECONDARY_NAV.map((group) => (
                      <section key={group.zh}>
                        <h2>{lang === 'zh' ? group.zh : group.en}</h2>
                        <div>
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link key={item.to} to={item.to} data-active={isActive(item)}>
                                <Icon size={15} />
                                <span>{lang === 'zh' ? item.zh : item.en}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <ThemeSwitcher />
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

      {mobileOpen ? (
        <div className={styles.mobilePanel}>
          <nav aria-label={copy.primaryNav}>
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} data-active={isActive(item)}>
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
                {group.items.map((item) => (
                  <Link key={item.to} to={item.to}>{lang === 'zh' ? item.zh : item.en}</Link>
                ))}
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
