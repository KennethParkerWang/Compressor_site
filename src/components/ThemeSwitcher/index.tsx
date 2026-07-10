import React, {useEffect, useMemo, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Check, ChevronDown, Palette} from 'lucide-react';
import {themePresets, type CrTheme, type ThemePreset} from '@site/src/data/themePresets';
import styles from './styles.module.css';

const STORAGE_KEY = 'cr-theme';

function applyTheme(theme: CrTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-cr-theme', theme);
  document.documentElement.setAttribute(
    'data-theme',
    theme === 'dark' || theme === 'focus' ? 'dark' : 'light',
  );
}

function readStored(): CrTheme {
  if (typeof window === 'undefined') return 'light';
  const value = window.localStorage.getItem(STORAGE_KEY);
  return themePresets.some((preset) => preset.id === value) ? (value as CrTheme) : 'light';
}

function themeName(theme: ThemePreset, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? theme.nameZh : theme.nameEn;
}

function themeDesc(theme: ThemePreset, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? theme.descZh : theme.descEn;
}

function Swatch({theme}: {theme: ThemePreset}): React.ReactElement {
  return (
    <span
      className="cr-theme-swatch"
      style={{
        background: `linear-gradient(135deg, ${theme.swatch.from}, ${theme.swatch.via}, ${theme.swatch.to})`,
      }}
      aria-hidden
    />
  );
}

export default function ThemeSwitcher(): React.ReactElement {
  const {i18n} = useDocusaurusContext();
  const lang: 'zh' | 'en' = i18n.currentLocale === 'en' ? 'en' : 'zh';
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<CrTheme>('light');
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = readStored();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event: MouseEvent): void => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = useMemo(
    () => themePresets.find((preset) => preset.id === theme) ?? themePresets[0],
    [theme],
  );

  const onSelect = (nextTheme: CrTheme): void => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Local storage can be unavailable in restricted browsing modes.
    }
    window.dispatchEvent(new CustomEvent('cr:theme-change', {detail: {theme: nextTheme}}));
    setOpen(false);
  };

  const triggerText = lang === 'zh' ? `主题：${themeName(current, lang)}` : `Theme: ${themeName(current, lang)}`;
  const title = lang === 'zh' ? '切换主题方案' : 'Switch theme scheme';
  const menuTitle = lang === 'zh' ? '主题方案' : 'Theme Schemes';

  return (
    <div className="cr-theme-switcher" ref={wrapRef}>
      <button
        type="button"
        className="cr-theme-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={title}
      >
        <Palette size={14} />
        <Swatch theme={current} />
        <span className="cr-theme-trigger__label">{triggerText}</span>
        <ChevronDown size={13} className="cr-theme-trigger__chevron" />
      </button>
      {open ? (
        <div className="cr-theme-menu" role="menu" aria-label={menuTitle}>
          <div className="cr-theme-menu__title">{menuTitle}</div>
          {themePresets.map((preset) => {
            const active = preset.id === theme;
            return (
              <button
                key={preset.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`cr-theme-option${active ? ' active' : ''}`}
                onClick={() => onSelect(preset.id)}
              >
                <Swatch theme={preset} />
                <span className="cr-theme-option__body">
                  <span className="cr-theme-option__name">
                    {themeName(preset, lang)}
                    {active ? <Check size={13} /> : null}
                  </span>
                  <span className="cr-theme-option__desc">{themeDesc(preset, lang)}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      <span data-cr-theme-active={current.id} className={styles.hidden} />
    </div>
  );
}
