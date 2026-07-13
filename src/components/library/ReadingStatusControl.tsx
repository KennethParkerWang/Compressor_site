import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {BookOpen, Check, Circle} from 'lucide-react';
import {useReadingState} from '../../stores/workbench';
import type {UserReadingStatus} from '../../data/userReadingState';
import styles from './ReadingStatusControl.module.css';

const STATUS: Record<UserReadingStatus, {label: string; next: UserReadingStatus; icon: React.ComponentType<{size?: number}>}> = {
  unread: {label: '未读', next: 'reading', icon: Circle},
  reading: {label: '在读', next: 'finished', icon: BookOpen},
  finished: {label: '已读', next: 'unread', icon: Check},
  paused: {label: '暂停', next: 'reading', icon: Circle},
};

function ReadingStatusClient({literatureId}: {literatureId: string}): React.ReactElement | null {
  const state = useReadingState((store) => store.states[literatureId]);
  const setReadingStatus = useReadingState((store) => store.setReadingStatus);
  const [syncReady, setSyncReady] = React.useState(document.documentElement.dataset.crAccountSync === 'ready');

  React.useEffect(() => {
    const listener = (event: Event): void => setSyncReady((event as CustomEvent<string>).detail === 'ready');
    window.addEventListener('cr-account-sync-status', listener);
    return () => window.removeEventListener('cr-account-sync-status', listener);
  }, []);

  if (!syncReady) return null;
  const current = state?.status ?? 'unread';
  const meta = STATUS[current];
  const Icon = meta.icon;
  return <button type="button" className={styles.status} data-status={current} onClick={() => setReadingStatus(literatureId, meta.next)} title={`当前：${meta.label}，点击切换`}><Icon size={11} />{meta.label}</button>;
}

export default function ReadingStatusControl({literatureId}: {literatureId: string}): React.ReactElement {
  return <BrowserOnly fallback={null}>{() => <ReadingStatusClient literatureId={literatureId} />}</BrowserOnly>;
}
