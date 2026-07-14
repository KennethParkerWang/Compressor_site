import React from 'react';
import {del, get, set} from 'idb-keyval';

export type LocalImageKind = 'wallpaper' | 'avatar';
export type WallpaperFit = 'cover' | 'contain' | 'auto';

export interface WallpaperSettings {
  enabled: boolean;
  activeWallpaperId: string | null;
  blur: number;
  opacity: number;
  brightness: number;
  fit: WallpaperFit;
  positionX: number;
  positionY: number;
}

export interface LocalWallpaperAsset {
  id: string;
  name: string;
  createdAt: string;
  blob: Blob;
}

interface LocalWallpaperMeta {
  id: string;
  name: string;
  createdAt: string;
}

export const DEFAULT_WALLPAPER_SETTINGS: WallpaperSettings = {
  enabled: false,
  activeWallpaperId: null,
  blur: 0,
  opacity: 0.55,
  brightness: 92,
  fit: 'cover',
  positionX: 50,
  positionY: 50,
};

const SETTINGS_KEY = 'cr-local-wallpaper-settings-v2';
const WALLPAPER_LIBRARY_KEY = 'cr-local-wallpaper-library-v1';
const WALLPAPER_INDEX_KEY = 'cr-local-wallpaper-index-v2';
const WALLPAPER_BLOB_PREFIX = 'cr-local-wallpaper-blob-v2:';
const LEGACY_WALLPAPER_KEY = 'cr-local-wallpaper-v1';
const AVATAR_KEY = 'cr-local-avatar-v1';
const CHANGE_EVENT = 'cr-local-personalization-change';
let wallpaperMutationQueue: Promise<void> = Promise.resolve();

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}

export function getWallpaperSettings(): WallpaperSettings {
  if (typeof window === 'undefined') return DEFAULT_WALLPAPER_SETTINGS;
  try {
    const saved = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<WallpaperSettings>;
    const fit: WallpaperFit = saved.fit === 'contain' || saved.fit === 'auto' ? saved.fit : 'cover';
    return {
      enabled: saved.enabled === true,
      activeWallpaperId: typeof saved.activeWallpaperId === 'string' ? saved.activeWallpaperId : null,
      blur: clamp(saved.blur, 0, 24, DEFAULT_WALLPAPER_SETTINGS.blur),
      opacity: clamp(saved.opacity, 0.08, 1, DEFAULT_WALLPAPER_SETTINGS.opacity),
      brightness: clamp(saved.brightness, 50, 130, DEFAULT_WALLPAPER_SETTINGS.brightness),
      fit,
      positionX: clamp(saved.positionX, 0, 100, DEFAULT_WALLPAPER_SETTINGS.positionX),
      positionY: clamp(saved.positionY, 0, 100, DEFAULT_WALLPAPER_SETTINGS.positionY),
    };
  } catch {
    return DEFAULT_WALLPAPER_SETTINGS;
  }
}

function emitChange(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveWallpaperSettings(settings: WallpaperSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  emitChange();
}

function validateImage(kind: LocalImageKind, file: File): void {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件。');
  const maxSize = kind === 'wallpaper' ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size <= 0) throw new Error('图片文件为空。');
  if (file.size > maxSize) throw new Error(kind === 'wallpaper' ? '壁纸不能超过 15MB。' : '头像不能超过 5MB。');
}

function isWallpaperAsset(value: unknown): value is LocalWallpaperAsset {
  if (!value || typeof value !== 'object') return false;
  const asset = value as Partial<LocalWallpaperAsset>;
  return typeof asset.id === 'string' && typeof asset.name === 'string' && typeof asset.createdAt === 'string' && asset.blob instanceof Blob;
}

function isWallpaperMeta(value: unknown): value is LocalWallpaperMeta {
  if (!value || typeof value !== 'object') return false;
  const meta = value as Partial<LocalWallpaperMeta>;
  return typeof meta.id === 'string' && typeof meta.name === 'string' && typeof meta.createdAt === 'string';
}

function wallpaperBlobKey(id: string): string {
  return `${WALLPAPER_BLOB_PREFIX}${id}`;
}

function queueWallpaperMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = wallpaperMutationQueue.then(operation, operation);
  wallpaperMutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function storeWallpaperLibrary(assets: LocalWallpaperAsset[]): Promise<void> {
  for (const asset of assets) await set(wallpaperBlobKey(asset.id), asset.blob);
  await set(WALLPAPER_INDEX_KEY, assets.map(({id, name, createdAt}) => ({id, name, createdAt})));
}

export async function getLocalWallpapers(): Promise<LocalWallpaperAsset[]> {
  const indexed = await get<unknown>(WALLPAPER_INDEX_KEY);
  if (Array.isArray(indexed)) {
    const metas = indexed.filter(isWallpaperMeta);
    const resolved = await Promise.all(metas.map(async (meta): Promise<LocalWallpaperAsset | null> => {
      const blob = await get<unknown>(wallpaperBlobKey(meta.id));
      return blob instanceof Blob ? {...meta, blob} : null;
    }));
    return resolved.filter((asset): asset is LocalWallpaperAsset => asset !== null);
  }

  const stored = await get<unknown>(WALLPAPER_LIBRARY_KEY);
  const assets = Array.isArray(stored) ? stored.filter(isWallpaperAsset) : [];
  if (assets.length > 0) {
    await storeWallpaperLibrary(assets);
    await del(WALLPAPER_LIBRARY_KEY);
    return assets;
  }

  const legacy = await get<unknown>(LEGACY_WALLPAPER_KEY);
  if (!(legacy instanceof Blob)) {
    await set(WALLPAPER_INDEX_KEY, []);
    return [];
  }
  const migrated: LocalWallpaperAsset = {
    id: 'legacy-wallpaper',
    name: '原有壁纸',
    createdAt: new Date().toISOString(),
    blob: legacy,
  };
  await storeWallpaperLibrary([migrated]);
  await del(LEGACY_WALLPAPER_KEY);
  return [migrated];
}

export async function addLocalWallpaper(file: File): Promise<string> {
  validateImage('wallpaper', file);
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `wallpaper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return queueWallpaperMutation(async () => {
    const asset: LocalWallpaperAsset = {id, name: file.name, createdAt: new Date().toISOString(), blob: file};
    const assets = await getLocalWallpapers();
    await set(wallpaperBlobKey(id), file);
    try {
      await set(WALLPAPER_INDEX_KEY, [asset, ...assets].map(({id: assetId, name, createdAt}) => ({id: assetId, name, createdAt})));
    } catch (error) {
      await del(wallpaperBlobKey(id));
      throw error;
    }
    const settings = getWallpaperSettings();
    saveWallpaperSettings({...settings, enabled: true, activeWallpaperId: id});
    return id;
  });
}

export function selectLocalWallpaper(id: string): void {
  saveWallpaperSettings({...getWallpaperSettings(), enabled: true, activeWallpaperId: id});
}

export function selectDefaultTheme(): void {
  saveWallpaperSettings({...getWallpaperSettings(), enabled: false});
}

export async function deleteLocalWallpaper(id: string): Promise<void> {
  await queueWallpaperMutation(async () => {
    const remaining = (await getLocalWallpapers()).filter((asset) => asset.id !== id);
    await set(WALLPAPER_INDEX_KEY, remaining.map(({id: assetId, name, createdAt}) => ({id: assetId, name, createdAt})));
    await del(wallpaperBlobKey(id));
    const settings = getWallpaperSettings();
    if (settings.activeWallpaperId === id || (settings.activeWallpaperId === null && remaining.length === 0)) {
      saveWallpaperSettings({
        ...settings,
        enabled: remaining.length > 0,
        activeWallpaperId: remaining[0]?.id ?? null,
      });
    } else {
      emitChange();
    }
  });
}

export async function getLocalImage(kind: LocalImageKind): Promise<Blob | null> {
  if (kind === 'avatar') {
    const value = await get<unknown>(AVATAR_KEY);
    return value instanceof Blob ? value : null;
  }
  const assets = await getLocalWallpapers();
  const activeId = getWallpaperSettings().activeWallpaperId;
  return (assets.find((asset) => asset.id === activeId) ?? assets[0])?.blob ?? null;
}

export async function saveLocalImage(kind: LocalImageKind, file: File): Promise<void> {
  validateImage(kind, file);
  if (kind === 'wallpaper') {
    await addLocalWallpaper(file);
    return;
  }
  await set(AVATAR_KEY, file);
  emitChange();
}

export async function deleteLocalImage(kind: LocalImageKind): Promise<void> {
  if (kind === 'wallpaper') {
    const assets = await getLocalWallpapers();
    const activeId = getWallpaperSettings().activeWallpaperId ?? assets[0]?.id;
    if (activeId) await deleteLocalWallpaper(activeId);
    return;
  }
  await del(AVATAR_KEY);
  emitChange();
}

export interface LocalImageUrlState {
  url: string | null;
  ready: boolean;
}

export function useLocalImageState(kind: LocalImageKind): LocalImageUrlState {
  const [state, setState] = React.useState<LocalImageUrlState>({url: null, ready: false});

  React.useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    const load = async (): Promise<void> => {
      try {
        const blob = await getLocalImage(kind);
        const nextUrl = blob ? URL.createObjectURL(blob) : null;
        if (!active) {
          if (nextUrl) URL.revokeObjectURL(nextUrl);
          return;
        }
        const previousUrl = objectUrl;
        objectUrl = nextUrl;
        setState({url: nextUrl, ready: true});
        if (previousUrl) URL.revokeObjectURL(previousUrl);
      } catch {
        if (active) setState({url: objectUrl, ready: true});
      }
    };
    const onChange = (): void => { void load(); };
    void load();
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      active = false;
      window.removeEventListener(CHANGE_EVENT, onChange);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kind]);

  return state;
}

export function useLocalImageUrl(kind: LocalImageKind): string | null {
  return useLocalImageState(kind).url;
}

export function useLocalWallpaperSettings(): WallpaperSettings {
  const [settings, setSettings] = React.useState<WallpaperSettings>(DEFAULT_WALLPAPER_SETTINGS);

  React.useEffect(() => {
    const refresh = (): void => setSettings(getWallpaperSettings());
    refresh();
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return settings;
}
