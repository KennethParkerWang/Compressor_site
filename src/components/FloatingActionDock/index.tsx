import React, {useMemo} from 'react';
import {useLocation} from '@docusaurus/router';
import {ArrowUp, Globe2, Search} from 'lucide-react';
import ThemeSwitcher from '../ThemeSwitcher';
import styles from './styles.module.css';

type Lang = 'zh' | 'en';

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
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

function openSearch(): void {
  const opener = (window as unknown as {__openCommandPalette__?: () => void}).__openCommandPalette__;
  opener?.();
}

function scrollToTop(): void {
  window.scrollTo({top: 0, behavior: 'smooth'});
}

export default function FloatingActionDock(): React.ReactElement {
  const location = useLocation();
  const lang: Lang = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const localeTarget = useMemo(() => {
    const normalized = stripLocalePrefix(location.pathname);
    const targetPath = lang === 'en' ? normalized : addEnglishPrefix(normalized);
    return `${targetPath}${location.search}${location.hash}`;
  }, [lang, location.hash, location.pathname, location.search]);

  const copy = lang === 'zh'
    ? {
        search: '搜索',
        theme: '主题',
        language: '切换到英文',
        top: '返回顶部',
        localeBadge: 'EN',
      }
    : {
        search: 'Search',
        theme: 'Theme',
        language: 'Switch to Chinese',
        top: 'Back to top',
        localeBadge: 'ZH',
      };

  return (
    <div className={styles.dock} aria-label={lang === 'zh' ? '浮动操作' : 'Floating actions'}>
      <button type="button" className={styles.actionButton} onClick={openSearch} title={copy.search} aria-label={copy.search}>
        <Search size={18} />
        <span>{copy.search}</span>
      </button>

      <div className={styles.themeSlot} title={copy.theme} aria-label={copy.theme}>
        <ThemeSwitcher />
      </div>

      <a className={styles.actionButton} href={localeTarget} title={copy.language} aria-label={copy.language}>
        <Globe2 size={18} />
        <b>{copy.localeBadge}</b>
      </a>

      <button type="button" className={styles.actionButton} onClick={scrollToTop} title={copy.top} aria-label={copy.top}>
        <ArrowUp size={18} />
        <span>{copy.top}</span>
      </button>
    </div>
  );
}
