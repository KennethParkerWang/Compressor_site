import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {Database, LogIn, ShieldAlert} from 'lucide-react';
import type {Session, SupabaseClient} from '@supabase/supabase-js';
import type {ReadingNote} from '../../data/readingNotes';
import type {ResearchTask} from '../../data/researchTasks';
import {
  deleteUserNote,
  deleteUserTask,
  importLocalWorkspace,
  isAccountSchemaMissing,
  loadAccountWorkspace,
  markLocalImportCompleted,
  upsertUserNote,
  upsertUserReadingState,
  upsertUserTask,
} from '../../lib/accountDataApi';
import {getAccountDisplayName} from '../../lib/accountProfile';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {registerPersonalDataAdapter, useNotes, useReadingState, useTasks, type PersonalDataAdapter} from '../../stores/workbench';
import styles from './AccountDataController.module.css';

type SyncPhase = 'loading' | 'guest' | 'ready' | 'import-prompt' | 'importing' | 'setup-required' | 'error';

interface LegacyWorkspaceBackup {
  tasks: ResearchTask[];
  notes: ReadingNote[];
  capturedAt: string;
  claimedBy?: string;
}

const LEGACY_BACKUP_KEY = 'cr-legacy-workspace-v1';

function readOrCreateLegacyBackup(): LegacyWorkspaceBackup {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LEGACY_BACKUP_KEY) ?? 'null') as LegacyWorkspaceBackup | null;
    if (stored && Array.isArray(stored.tasks) && Array.isArray(stored.notes)) return stored;
  } catch {
    // Create a clean backup below.
  }
  const backup: LegacyWorkspaceBackup = {
    tasks: useTasks.getState().tasks,
    notes: useNotes.getState().notes,
    capturedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(backup));
  return backup;
}

function claimLegacyBackup(userId: string): void {
  const backup = readOrCreateLegacyBackup();
  window.localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify({...backup, claimedBy: userId}));
}

function createSyncAdapter(client: SupabaseClient, userId: string, onError: (error: unknown) => void): {adapter: PersonalDataAdapter; dispose: () => void} {
  const pendingTasks = new Map<string, {timer: ReturnType<typeof setTimeout>; task: ResearchTask}>();
  const pendingNotes = new Map<string, {timer: ReturnType<typeof setTimeout>; note: ReadingNote}>();

  const adapter: PersonalDataAdapter = {
    upsertTask: (task) => {
      const current = pendingTasks.get(task.id);
      if (current) clearTimeout(current.timer);
      const timer = setTimeout(() => {
        pendingTasks.delete(task.id);
        void upsertUserTask(client, userId, task).catch(onError);
      }, 650);
      pendingTasks.set(task.id, {timer, task});
    },
    deleteTask: (taskId) => {
      const current = pendingTasks.get(taskId);
      if (current) clearTimeout(current.timer);
      pendingTasks.delete(taskId);
      void deleteUserTask(client, userId, taskId).catch(onError);
    },
    upsertNote: (note) => {
      const current = pendingNotes.get(note.id);
      if (current) clearTimeout(current.timer);
      const timer = setTimeout(() => {
        pendingNotes.delete(note.id);
        void upsertUserNote(client, userId, note).catch(onError);
      }, 800);
      pendingNotes.set(note.id, {timer, note});
    },
    deleteNote: (noteId) => {
      const current = pendingNotes.get(noteId);
      if (current) clearTimeout(current.timer);
      pendingNotes.delete(noteId);
      void deleteUserNote(client, userId, noteId).catch(onError);
    },
    upsertReadingState: (state) => {
      void upsertUserReadingState(client, userId, state).catch(onError);
    },
  };

  return {
    adapter,
    dispose: () => {
      pendingTasks.forEach(({timer, task}) => {
        clearTimeout(timer);
        void upsertUserTask(client, userId, task).catch(onError);
      });
      pendingNotes.forEach(({timer, note}) => {
        clearTimeout(timer);
        void upsertUserNote(client, userId, note).catch(onError);
      });
      pendingTasks.clear();
      pendingNotes.clear();
    },
  };
}

function setSyncPhase(phase: SyncPhase): void {
  document.documentElement.dataset.crAccountSync = phase;
  window.dispatchEvent(new CustomEvent('cr-account-sync-status', {detail: phase}));
}

function AccountDataClient(): React.ReactElement | null {
  const {client, config} = useSupabaseBrowserClient();
  const initialBackupRef = React.useRef<LegacyWorkspaceBackup | null>(null);
  const runtimeRef = React.useRef<{dispose: () => void} | null>(null);
  const generationRef = React.useRef(0);
  const [phase, setPhase] = React.useState<SyncPhase>('loading');
  const [message, setMessage] = React.useState('正在确认账户工作区...');
  const [pendingSession, setPendingSession] = React.useState<Session | null>(null);

  const updatePhase = React.useCallback((next: SyncPhase, nextMessage = ''): void => {
    setPhase(next);
    setMessage(nextMessage);
    setSyncPhase(next);
  }, []);

  const stopCurrentSync = React.useCallback((): void => {
    registerPersonalDataAdapter(null);
    runtimeRef.current?.dispose();
    runtimeRef.current = null;
  }, []);

  const startSync = React.useCallback((session: Session): void => {
    const runtime = createSyncAdapter(client, session.user.id, (error) => {
      updatePhase('error', safeSupabaseError(error, config));
    });
    runtimeRef.current = runtime;
    registerPersonalDataAdapter(runtime.adapter);
  }, [client, config, updatePhase]);

  const applySession = React.useCallback(async (session: Session | null): Promise<void> => {
    const generation = ++generationRef.current;
    stopCurrentSync();
    updatePhase('loading', session ? '正在载入你的任务和笔记...' : '正在清理账户工作区...');

    if (!session) {
      useTasks.getState().replaceTasks([]);
      useNotes.getState().replaceNotes([]);
      useReadingState.getState().replaceReadingState([]);
      setPendingSession(null);
      updatePhase('guest');
      return;
    }

    try {
      const workspace = await loadAccountWorkspace(client, session.user);
      if (generation !== generationRef.current) return;
      const backup = initialBackupRef.current ?? readOrCreateLegacyBackup();
      const canOfferImport = !workspace.profile.local_import_completed
        && !backup.claimedBy
        && (backup.tasks.length > 0 || backup.notes.length > 0)
        && workspace.tasks.length === 0
        && workspace.notes.length === 0;

      useTasks.getState().replaceTasks(workspace.tasks);
      useNotes.getState().replaceNotes(workspace.notes);
      useReadingState.getState().replaceReadingState(workspace.readingState);

      if (canOfferImport) {
        setPendingSession(session);
        updatePhase('import-prompt');
        return;
      }
      if (!workspace.profile.local_import_completed) await markLocalImportCompleted(client, session.user.id);
      if (generation !== generationRef.current) return;
      setPendingSession(null);
      startSync(session);
      updatePhase('ready');
    } catch (error) {
      if (generation !== generationRef.current) return;
      if (isAccountSchemaMissing(error)) {
        updatePhase('setup-required', '账户隔离 SQL 尚未执行。现有本地资料保持不变。');
        return;
      }
      useTasks.getState().replaceTasks([]);
      useNotes.getState().replaceNotes([]);
      useReadingState.getState().replaceReadingState([]);
      updatePhase('error', safeSupabaseError(error, config));
    }
  }, [client, config, startSync, stopCurrentSync, updatePhase]);

  React.useEffect(() => {
    initialBackupRef.current = readOrCreateLegacyBackup();
    void client.auth.getSession().then(({data, error}) => {
      if (error) updatePhase('error', safeSupabaseError(error, config));
      else void applySession(data.session);
    });
    const {data: listener} = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void applySession(session), 0);
    });
    return () => {
      generationRef.current += 1;
      listener.subscription.unsubscribe();
      stopCurrentSync();
    };
  }, [applySession, client.auth, config, stopCurrentSync, updatePhase]);

  const importLegacy = async (): Promise<void> => {
    if (!pendingSession || phase === 'importing') return;
    updatePhase('importing', '正在导入本机任务和笔记...');
    const backup = initialBackupRef.current ?? readOrCreateLegacyBackup();
    try {
      await importLocalWorkspace(client, pendingSession.user.id, backup.tasks, backup.notes);
      claimLegacyBackup(pendingSession.user.id);
      useTasks.getState().replaceTasks(backup.tasks);
      useNotes.getState().replaceNotes(backup.notes);
      startSync(pendingSession);
      setPendingSession(null);
      updatePhase('ready');
    } catch (error) {
      updatePhase('error', safeSupabaseError(error, config));
    }
  };

  const skipLegacy = async (): Promise<void> => {
    if (!pendingSession || phase === 'importing') return;
    updatePhase('importing', '正在创建空白个人工作区...');
    try {
      await markLocalImportCompleted(client, pendingSession.user.id);
      claimLegacyBackup(pendingSession.user.id);
      useTasks.getState().replaceTasks([]);
      useNotes.getState().replaceNotes([]);
      startSync(pendingSession);
      setPendingSession(null);
      updatePhase('ready');
    } catch (error) {
      updatePhase('error', safeSupabaseError(error, config));
    }
  };

  if (phase === 'loading' || phase === 'importing') {
    return <div className={styles.loadingCover}><Database size={22} /><strong>{message}</strong></div>;
  }
  if (phase === 'import-prompt' && pendingSession) {
    const backup = initialBackupRef.current ?? {tasks: [], notes: []};
    return (
      <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="account-import-title">
        <section className={styles.importDialog}>
          <LogIn size={25} />
          <div><span>首次绑定账户</span><h2 id="account-import-title">导入本机研究资料？</h2></div>
          <p>检测到本机保存了 <strong>{backup.tasks.length}</strong> 条任务和 <strong>{backup.notes.length}</strong> 篇笔记。是否归入账户“{getAccountDisplayName(pendingSession.user)}”？</p>
          <small>系统不会自动归属数据。选择“不导入”会为该账户创建空白工作区。</small>
          <div className={styles.dialogActions}>
            <button type="button" onClick={() => void skipLegacy()}>不导入</button>
            <button type="button" data-primary="true" onClick={() => void importLegacy()}>导入到当前账户</button>
          </div>
        </section>
      </div>
    );
  }
  if (phase === 'setup-required' || phase === 'error') {
    return <div className={styles.statusBanner} data-kind={phase}><ShieldAlert size={16} /><span>{message}</span><a href="/Compressor_site/account">查看账户状态</a></div>;
  }
  return null;
}

export default function AccountDataController(): React.ReactElement {
  return <BrowserOnly fallback={null}>{() => <AccountDataClient />}</BrowserOnly>;
}
