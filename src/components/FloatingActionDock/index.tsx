import React, {useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {ArrowUp, Globe2, Search} from 'lucide-react';
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

function openSearch(): void {
  const opener = (window as unknown as {__openCommandPalette__?: () => void}).__openCommandPalette__;
  opener?.();
}

function scrollToTop(): void {
  window.scrollTo({top: 0, behavior: 'smooth'});
}

export default function FloatingActionDock(): React.ReactElement {
  const location = useLocation();
  const {siteConfig, i18n} = useDocusaurusContext();
  const baseUrl = stripLocaleFromBaseUrl(siteConfig.baseUrl);
  const pathWithoutBase = stripBasePath(location.pathname, baseUrl);
  const lang: Lang = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const localeTarget = useMemo(() => {
    const normalized = stripLocalePrefix(pathWithoutBase);
    const targetPath = lang === 'en' ? normalized : addEnglishPrefix(normalized);
    return `${withBasePath(targetPath, baseUrl)}${location.search}${location.hash}`;
  }, [baseUrl, lang, location.hash, location.search, pathWithoutBase]);

  const copy = lang === 'zh'
    ? {
        search: '搜索',
        language: '切换到英文',
        top: '返回顶部',
        localeBadge: 'EN',
      }
    : {
        search: 'Search',
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
