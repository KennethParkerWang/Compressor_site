'use client';

import React from 'react';
import {ErrorBoundary} from '@site/src/components/ErrorBoundary';
import ProgressBar from '@site/src/components/ProgressBar';

function applyInitialTheme(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-cr-theme', 'light');
  document.documentElement.setAttribute('data-theme', 'light');
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
