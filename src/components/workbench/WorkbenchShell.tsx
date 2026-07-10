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
  Library,
  Menu,
  Network,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
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
}

const PRIMARY_NAV: NavItem[] = [
  {to: '/', zh: '研究总览', en: 'Overview', icon: BarChart3},
  {to: '/library', zh: '文献', en: 'Literature', icon: BookOpen},
  {to: '/algorithm-board', zh: '算法', en: 'Algorithms', icon: Network},
  {to: '/datasets', zh: '数据集', en: 'Datasets', icon: Database},
  {to: '/experiments', zh: '实验', en: 'Experiments', icon: FlaskConical},
  {to: '/weekly-reports', zh: '双周汇报', en: 'Briefings', icon: Presentation},
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
      {to: '/algorithm-evolution', zh: '算法脉络', en: 'Algorithm history', icon: GitBranch},
      {to: '/algorithm-catalog', zh: '算法档案', en: 'Algorithm dossiers', icon: Archive},
      {to: '/neural-hub', zh: '神经压缩', en: 'Neural compression', icon: Brain},
      {to: '/sota', zh: '结果对照', en: 'Results', icon: Trophy},
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

const PAGE_LABELS = [...PRIMARY_NAV, ...SECONDARY_NAV.flatMap((group) => group.items)];

const COPY = {
  zh: {
    name: '王坤鹏',
    field: '无损压缩研究',
    search: '搜索文献与页面',
    allPages: '全部研究页面',
    collapse: '收起侧栏',
    expand: '展开侧栏',
    openMenu: '打开导航',
    closeMenu: '关闭导航',
    switchLocale: '切换到英文',
    current: '当前方向',
    currentValue: '通用无损压缩',
  },
  en: {
    name: 'Kunpeng Wang',
    field: 'Lossless Compression Research',
    search: 'Search literature and pages',
    allPages: 'All research pages',
    collapse: 'Collapse sidebar',
    expand: 'Expand sidebar',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    switchLocale: 'Switch to Chinese',
    current: 'Current field',
    currentValue: 'General-purpose lossless compression',
  },
} as const;

export interface WorkbenchShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageHint?: string;
  mockTag?: 'mock' | 'unconnected' | 'pending';
  fullBleed?: boolean;
}

export default function WorkbenchShell({
  children,
  pageTitle,
  fullBleed = false,
}: WorkbenchShellProps): React.ReactElement {
  const location = useLocation();
  const {siteConfig, i18n} = useDocusaurusContext();
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const copy = COPY[lang];
  const baseUrl = stripLocaleFromBaseUrl(siteConfig.baseUrl);
  const pathWithoutBase = stripBasePath(location.pathname, baseUrl);
  const normalizedPath = stripLocalePrefix(pathWithoutBase);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [directoryOpen, setDirectoryOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('cr.sidebarCollapsed') === 'true');
    } catch {
      // Ignore unavailable local storage.
    }
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setDirectoryOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = (): void => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem('cr.sidebarCollapsed', String(next));
      } catch {
        // Ignore unavailable local storage.
      }
      return next;
    });
  };

  const isActive = (to: string): boolean => {
    if (to === '/') return normalizedPath === '/' || normalizedPath === '';
    return normalizedPath === to || normalizedPath.startsWith(`${to}/`);
  };

  const activeMeta = PAGE_LABELS.find((item) => isActive(item.to));
  const displayTitle = activeMeta ? (lang === 'zh' ? activeMeta.zh : activeMeta.en) : pageTitle ?? copy.field;
  const localePath = lang === 'en' ? normalizedPath : addEnglishPrefix(normalizedPath);
  const localeTarget = `${withBasePath(localePath, baseUrl)}${location.search}${location.hash}`;
  const today = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date());

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      <header className={styles.mobileHeader}>
        <Link to="/" className={styles.mobileBrand}>
          <span>KW</span>
          <strong>{copy.field}</strong>
        </Link>
        <button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? copy.closeMenu : copy.openMenu}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {mobileOpen ? <button type="button" className={styles.mobileScrim} onClick={() => setMobileOpen(false)} aria-label={copy.closeMenu} /> : null}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.brandRow}>
          <Link to="/" className={styles.brand} title={`${copy.name} · ${copy.field}`}>
            <span className={styles.brandMark}>KW</span>
            <span className={styles.brandText}>
              <strong>{copy.name}</strong>
              <span>{copy.field}</span>
            </span>
          </Link>
          <button type="button" className={styles.collapseButton} onClick={toggleCollapsed} aria-label={collapsed ? copy.expand : copy.collapse} title={collapsed ? copy.expand : copy.collapse}>
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        <button type="button" className={styles.searchButton} onClick={() => (window as {__openCommandPalette__?: () => void}).__openCommandPalette__?.()}>
          <Search size={16} />
          <span>{copy.search}</span>
          <kbd>Ctrl K</kbd>
        </button>

        <nav className={styles.primaryNav} aria-label={lang === 'zh' ? '主要导航' : 'Primary navigation'}>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={styles.navItem} data-active={isActive(item.to)} title={lang === 'zh' ? item.zh : item.en}>
                <Icon size={18} />
                <span>{lang === 'zh' ? item.zh : item.en}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.directoryWrap}>
          <button type="button" className={styles.directoryButton} onClick={() => setDirectoryOpen((value) => !value)} aria-expanded={directoryOpen} title={copy.allPages}>
            <Archive size={17} />
            <span>{copy.allPages}</span>
            <ChevronDown size={15} />
          </button>

          {directoryOpen ? (
            <div className={styles.directoryPanel}>
              {SECONDARY_NAV.map((group) => (
                <section key={group.zh}>
                  <h2>{lang === 'zh' ? group.zh : group.en}</h2>
                  <div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.to} to={item.to} data-active={isActive(item.to)}>
                          <Icon size={15} />
                          <span>{lang === 'zh' ? item.zh : item.en}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.sidebarFooter}>
          <span>{copy.current}</span>
          <strong>{copy.currentValue}</strong>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.pageContext}>
            <span>{copy.field}</span>
            <strong>{displayTitle}</strong>
          </div>
          <div className={styles.topActions}>
            <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
            <button type="button" className={styles.iconButton} onClick={() => (window as {__openCommandPalette__?: () => void}).__openCommandPalette__?.()} title={copy.search} aria-label={copy.search}>
              <Search size={17} />
            </button>
            <ThemeSwitcher />
            <a href={localeTarget} className={styles.localeButton} title={copy.switchLocale} aria-label={copy.switchLocale}>
              <Globe2 size={16} />
              <span>{lang === 'zh' ? 'EN' : '中'}</span>
            </a>
          </div>
        </header>
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
