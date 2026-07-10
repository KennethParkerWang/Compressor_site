'use client';

import React from 'react';
import {ErrorBoundary} from '@site/src/components/ErrorBoundary';
import ProgressBar from '@site/src/components/ProgressBar';

const THEME_STORAGE_KEY = 'cr-theme';
type CrTheme = 'light' | 'paper' | 'graph' | 'dark' | 'focus';

function applyInitialTheme(): void {
  if (typeof document === 'undefined') return;

  let theme: CrTheme = 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'paper' || stored === 'graph' || stored === 'dark' || stored === 'focus') {
      theme = stored;
    }
  } catch {
    // Local storage may be unavailable in restricted browsing modes.
  }

  document.documentElement.setAttribute('data-cr-theme', theme);
  document.documentElement.setAttribute('data-theme', theme === 'dark' || theme === 'focus' ? 'dark' : 'light');
}

export default function Root({children}: {children: React.ReactNode}): React.ReactElement {
  if (typeof document !== 'undefined') applyInitialTheme();

  return (
    <ErrorBoundary>
      {children}
      <ProgressBar />
    </ErrorBoundary>
  );
}
