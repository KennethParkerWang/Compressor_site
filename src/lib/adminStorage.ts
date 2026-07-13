import type {SupabaseClient} from '@supabase/supabase-js';
import {createFileRecord, deleteFileRow, type FileRecord} from './adminApi';
import {safeSupabaseError, type SupabasePublicConfig} from './supabaseClient';

export const SITE_ASSETS_BUCKET = 'site-assets';
export const MAX_ADMIN_FILE_SIZE = 25 * 1024 * 1024;

export const ALLOWED_ADMIN_FILE_TYPES = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'text/plain',
  'text/markdown',
]);

interface UploadAdminFileOptions {
  client: SupabaseClient;
  config: SupabasePublicConfig;
  file: File;
  relatedType?: string;
  relatedId?: string;
  description?: string;
  storagePathPrefix?: string;
  published?: boolean;
  onProgress?: (progress: number) => void;
}

function safeExtension(name: string): string {
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : '';
  return extension?.replace(/[^a-z0-9]/g, '').slice(0, 10) ?? '';
}

function encodeStoragePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function validateAdminFile(file: File): void {
  if (file.size <= 0) throw new Error('文件为空，无法上传。');
  if (file.size > MAX_ADMIN_FILE_SIZE) throw new Error('单个文件不能超过 25MB。');
  if (!ALLOWED_ADMIN_FILE_TYPES.has(file.type)) throw new Error(`不支持的文件类型：${file.type || '未知类型'}。`);
}

function safeStoragePrefix(prefix: string): string {
  return prefix
    .split('/')
    .map((segment) => segment.trim().replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-'))
    .filter(Boolean)
    .join('/');
}

export function createStoragePath(file: File, prefix?: string): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const extension = safeExtension(file.name);
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension ? `.${extension}` : ''}`;
  const folder = prefix ? safeStoragePrefix(prefix) : `uploads/${now.getFullYear()}/${month}`;
  return `${folder}/${filename}`;
}

export async function uploadSiteAssetWithProgress({
  client,
  config,
  file,
  path,
  onProgress,
}: {
  client: SupabaseClient;
  config: SupabasePublicConfig;
  file: File;
  path: string;
  onProgress?: (progress: number) => void;
}): Promise<void> {
  const {data: sessionData, error: sessionError} = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session?.access_token) throw new Error('登录会话已失效，请重新登录。');

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const endpoint = `${config.url}/storage/v1/object/${SITE_ASSETS_BUCKET}/${encodeStoragePath(path)}`;
    request.open('POST', endpoint);
    request.setRequestHeader('Authorization', `Bearer ${sessionData.session.access_token}`);
    request.setRequestHeader('apikey', config.publishableKey);
    request.setRequestHeader('Content-Type', file.type);
    request.setRequestHeader('x-upsert', 'false');

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error('上传请求失败，请检查网络连接。'));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      let message = `上传失败（HTTP ${request.status}）。`;
      try {
        const payload = JSON.parse(request.responseText) as {message?: string; error?: string};
        message = payload.message ?? payload.error ?? message;
      } catch {
        // Keep the safe status-only message.
      }
      reject(new Error(safeSupabaseError(new Error(message), config)));
    };
    request.send(file);
  });
}

export async function uploadAdminFile(options: UploadAdminFileOptions): Promise<FileRecord> {
  validateAdminFile(options.file);
  const storagePath = createStoragePath(options.file, options.storagePathPrefix);
  await uploadSiteAssetWithProgress({...options, path: storagePath});

  try {
    return await createFileRecord(options.client, {
      name: options.file.name,
      storage_path: storagePath,
      file_type: options.file.type,
      file_size: options.file.size,
      related_type: options.relatedType ?? null,
      related_id: options.relatedId ?? null,
      description: options.description ?? '',
      published: options.published ?? false,
    });
  } catch (error) {
    await options.client.storage.from(SITE_ASSETS_BUCKET).remove([storagePath]);
    throw error;
  }
}

export async function deleteAdminFile(client: SupabaseClient, file: FileRecord): Promise<void> {
  const {error: storageError} = await client.storage.from(SITE_ASSETS_BUCKET).remove([file.storage_path]);
  if (storageError) throw storageError;
  await deleteFileRow(client, file.id);
}

export function getAdminFilePublicUrl(client: SupabaseClient, path: string): string {
  return client.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
