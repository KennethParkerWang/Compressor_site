// 研究任务 / 笔记 / Feed / 设置的本地持久化 (zustand + idb-keyval)
// 所�?API Key / 用户配置 走前端设置页,密钥本身不进 git

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type {ResearchTask, TaskStatus, TaskLane} from '../data/researchTasks';
import {readingNotes as seedNotes, type ReadingNote} from '../data/readingNotes';
import {researchFeedMock as seedFeed, type FeedItem, type FeedBucket, type FeedSource} from '../data/researchFeedMock';
import {dedupeFeedItems, feedItemKey, refreshFeed, type SourceRefreshStatus} from '../data/feedApi';
import type {CrTheme} from '../data/themePresets';

// ============== Settings Store ==============
export interface SourceConfig {
  id: string;
  enabled: boolean;
  /** 用户填的 API key,只保存在 localStorage(隐私提示已写�? */
  apiKey?: string;
  endpoint?: string;
}

export interface AppSettings {
  theme: CrTheme;
  density: 'comfortable' | 'compact';
  sources: Record<string, SourceConfig>;
  googleCalendar: {
    connected: boolean;
    syncToken?: string;
  };
  lastBackupAt?: string;
}

const defaultSources: SourceConfig[] = [
  { id: 'openalex', enabled: true },
  { id: 'semantic-scholar', enabled: true },
  { id: 'unpaywall', enabled: true, apiKey: '' },
  { id: 'arxiv', enabled: true },
  { id: 'github', enabled: true },
  { id: 'google-calendar', enabled: false },
];

interface SettingsStore {
  settings: AppSettings;
  setTheme: (t: CrTheme) => void;
  setDensity: (d: 'comfortable' | 'compact') => void;
  toggleSource: (id: string) => void;
  setSourceKey: (id: string, apiKey: string) => void;
  toggleGoogleCalendar: () => void;
  exportBackup: () => string;
  importBackup: (json: string) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: {
        theme: 'light',
        density: 'comfortable',
        sources: Object.fromEntries(defaultSources.map((s) => [s.id, s])),
        googleCalendar: { connected: false },
      },
      setTheme: (theme) => {
        const fixedTheme: CrTheme = 'light';
        try { window.localStorage.setItem('cr-theme', fixedTheme); } catch {}
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-cr-theme', fixedTheme);
          document.documentElement.setAttribute('data-theme', 'light');
        }
        set((s) => ({settings: {...s.settings, theme: fixedTheme}}));
      },
      setDensity: (density) => set((s) => ({settings: {...s.settings, density}})),
      toggleSource: (id) =>
        set((s) => {
          const cur = s.settings.sources[id] || { id, enabled: false };
          return {
            settings: {
              ...s.settings,
              sources: {...s.settings.sources, [id]: {...cur, enabled: !cur.enabled}},
            },
          };
        }),
      setSourceKey: (id, apiKey) =>
        set((s) => {
          const cur = s.settings.sources[id] || { id, enabled: false };
          return {
            settings: {
              ...s.settings,
              sources: {...s.settings.sources, [id]: {...cur, apiKey}},
            },
          };
        }),
      toggleGoogleCalendar: () =>
        set((s) => ({
          settings: {...s.settings, googleCalendar: {...s.settings.googleCalendar, connected: !s.settings.googleCalendar.connected}},
        })),
      exportBackup: () => {
        const payload = {
          v: 1,
          ts: new Date().toISOString(),
          tasks: get().settings,
        };
        return JSON.stringify(payload, null, 2);
      },
      importBackup: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (parsed?.settings) set({settings: parsed.settings});
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'cr-settings',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : ({getItem: () => null, setItem: () => {}, removeItem: () => {}} as Storage))),
    },
  ),
);

// ============== Tasks Store ==============
interface TasksStore {
  tasks: ResearchTask[];
  addTask: (t: Omit<ResearchTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, patch: Partial<ResearchTask>) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  setLane: (id: string, lane: TaskLane) => void;
  removeTask: (id: string) => void;
}

export const useTasks = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (t) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {...t, id: `t-${Date.now().toString(36)}`, createdAt: new Date().toISOString()},
          ],
        })),
      updateTask: (id, patch) =>
        set((s) => ({tasks: s.tasks.map((t) => (t.id === id ? {...t, ...patch} : t))})),
      setStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === 'done' ? new Date().toISOString() : t.completedAt,
                }
              : t,
          ),
        })),
      setLane: (id, lane) =>
        set((s) => ({tasks: s.tasks.map((t) => (t.id === id ? {...t, lane} : t))})),
      removeTask: (id) => set((s) => ({tasks: s.tasks.filter((t) => t.id !== id)})),
    }),
    {
      name: 'cr-tasks',
      version: 1,
      migrate: () => ({tasks: []}),
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : ({getItem: () => null, setItem: () => {}, removeItem: () => {}} as Storage))),
    },
  ),
);

// ============== Notes Store ==============
interface NotesStore {
  notes: ReadingNote[];
  updateNote: (id: string, patch: Partial<ReadingNote>) => void;
  addNote: (litId: string, title: string) => string;
  removeNote: (id: string) => void;
}

export const useNotes = create<NotesStore>()(
  persist(
    (set) => ({
      notes: seedNotes,
      updateNote: (id, patch) =>
        set((s) => ({notes: s.notes.map((n) => (n.id === id ? {...n, ...patch, updatedAt: new Date().toISOString()} : n))})),
      addNote: (litId, title) => {
        const id = `note-${Date.now().toString(36)}`;
        set((s) => ({
          notes: [
            {
              id,
              litId,
              title,
              author: '',
              year: new Date().getFullYear(),
              tags: [],
              status: 'draft',
              sixQuestions: {problem: '', method: '', experiment: '', conclusion: '', limitation: '', takeaway: ''},
              highlights: [],
              freeform: '',
              updatedAt: new Date().toISOString(),
              wordCount: 0,
            },
            ...s.notes,
          ],
        }));
        return id;
      },
      removeNote: (id) => set((s) => ({notes: s.notes.filter((note) => note.id !== id)})),
    }),
    {
      name: 'cr-notes',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : ({getItem: () => null, setItem: () => {}, removeItem: () => {}} as Storage))),
    },
  ),
);

// ============== Feed Store ==============
interface FeedStore {
  items: FeedItem[];
  isRefreshing: boolean;
  refreshError: string | null;
  lastRefreshAt: string | null;
  lastRefreshAdded: number;
  lastRefreshSeen: number;
  sourceStatus: Partial<Record<FeedSource, SourceRefreshStatus>>;
  accept: (id: string) => void;
  reject: (id: string) => void;
  moveToBucket: (id: string, b: FeedBucket) => void;
  refresh: (sources: Record<string, SourceConfig>) => Promise<void>;
}

export const useFeed = create<FeedStore>()(
  persist(
    (set) => ({
      items: seedFeed,
      isRefreshing: false,
      refreshError: null,
      lastRefreshAt: null,
      lastRefreshAdded: 0,
      lastRefreshSeen: 0,
      sourceStatus: {},
      accept: (id) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? {...it, bucket: 'related'} : it)),
        })),
      reject: (id) => set((s) => ({items: s.items.filter((it) => it.id !== id)})),
      moveToBucket: (id, b) =>
        set((s) => ({items: s.items.map((it) => (it.id === id ? {...it, bucket: b} : it))})),
      refresh: async (sources) => {
        set({isRefreshing: true, refreshError: null});
        try {
          const {items, errors, sourceStatus} = await refreshFeed({sources});
          set((s) => {
            const cleanedExisting = dedupeFeedItems(s.items);
            const knownKeys = new Set(cleanedExisting.map(feedItemKey));
            const fresh = items.filter((item) => {
              const key = feedItemKey(item);
              if (knownKeys.has(key)) return false;
              knownKeys.add(key);
              return true;
            });
            const errMsg = errors.length ? `部分来源同步受限：${errors.join('；')}` : null;
            return {
              items: dedupeFeedItems([...fresh, ...cleanedExisting]),
              isRefreshing: false,
              refreshError: errMsg,
              lastRefreshAt: new Date().toISOString(),
              lastRefreshAdded: fresh.length,
              lastRefreshSeen: items.length,
              sourceStatus,
            };
          });
        } catch (e: any) {
          set({
            isRefreshing: false,
            refreshError: e?.message ?? '刷新失败',
            lastRefreshAt: new Date().toISOString(),
            lastRefreshAdded: 0,
            lastRefreshSeen: 0,
            sourceStatus: {},
          });
        }
      },
    }),
    {
      name: 'cr-feed',
      version: 3,
      migrate: (persisted: any) => ({
        items: dedupeFeedItems((persisted?.items ?? []).filter((item: FeedItem) => !String(item.id).startsWith('F-'))),
        lastRefreshAt: persisted?.lastRefreshAt ?? null,
        lastRefreshAdded: persisted?.lastRefreshAdded ?? 0,
        lastRefreshSeen: persisted?.lastRefreshSeen ?? 0,
        sourceStatus: persisted?.sourceStatus ?? {},
      }),
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : ({getItem: () => null, setItem: () => {}, removeItem: () => {}} as Storage))),
      partialize: (s) => ({
        items: s.items,
        lastRefreshAt: s.lastRefreshAt,
        lastRefreshAdded: s.lastRefreshAdded,
        lastRefreshSeen: s.lastRefreshSeen,
        sourceStatus: s.sourceStatus,
      }), // 只持久化候选与最近一次同步摘要,不持久化 isRefreshing/refreshError
    },
  ),
);
