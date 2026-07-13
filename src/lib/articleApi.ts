import type {SupabaseClient} from '@supabase/supabase-js';
import {SITE_ASSETS_BUCKET, uploadSiteAssetWithProgress} from './adminStorage';
import type {SupabasePublicConfig} from './supabaseClient';

export type ArticleStatus = 'draft' | 'published';

export interface ArticleRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover_path: string | null;
  body_markdown: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ArticleInput = Omit<ArticleRecord, 'created_at' | 'updated_at'>;

const ARTICLE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_ARTICLE_IMAGE_SIZE = 10 * 1024 * 1024;

export async function listArticles(client: SupabaseClient): Promise<ArticleRecord[]> {
  const {data, error} = await client.from('articles').select('*').order('updated_at', {ascending: false});
  if (error) throw error;
  return (data ?? []) as ArticleRecord[];
}

export async function getArticle(client: SupabaseClient, id: string): Promise<ArticleRecord | null> {
  const {data, error} = await client.from('articles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as ArticleRecord | null;
}

export async function getPublishedArticle(client: SupabaseClient, id: string): Promise<ArticleRecord | null> {
  const {data, error} = await client.from('articles').select('*').eq('id', id).eq('published', true).maybeSingle();
  if (error) throw error;
  return data as ArticleRecord | null;
}

export async function saveArticle(client: SupabaseClient, article: ArticleInput): Promise<ArticleRecord> {
  const {data, error} = await client.from('articles').upsert(article, {onConflict: 'id'}).select('*').single();
  if (error) throw error;
  return data as ArticleRecord;
}

export async function deleteArticle(client: SupabaseClient, articleId: string): Promise<void> {
  const prefix = `articles/${articleId}`;
  const {data: objects, error: listError} = await client.storage.from(SITE_ASSETS_BUCKET).list(prefix, {limit: 1000});
  if (listError) throw listError;
  const paths = (objects ?? []).filter((item) => item.id).map((item) => `${prefix}/${item.name}`);
  if (paths.length > 0) {
    const {error: storageError} = await client.storage.from(SITE_ASSETS_BUCKET).remove(paths);
    if (storageError) throw storageError;
  }
  const {error} = await client.from('articles').delete().eq('id', articleId);
  if (error) throw error;
}

export async function cleanupArticleAssets(client: SupabaseClient, articleId: string, markdown: string, coverPath: string | null): Promise<void> {
  const prefix = `articles/${articleId}`;
  const {data: objects, error: listError} = await client.storage.from(SITE_ASSETS_BUCKET).list(prefix, {limit: 1000});
  if (listError) throw listError;
  const unused = (objects ?? [])
    .filter((item) => item.id)
    .map((item) => `${prefix}/${item.name}`)
    .filter((path) => path !== coverPath && !markdown.includes(path.split('/').pop() ?? path));
  if (unused.length > 0) {
    const {error} = await client.storage.from(SITE_ASSETS_BUCKET).remove(unused);
    if (error) throw error;
  }
}

export async function uploadArticleImage({
  client,
  config,
  articleId,
  file,
  kind = 'body',
  onProgress,
}: {
  client: SupabaseClient;
  config: SupabasePublicConfig;
  articleId: string;
  file: File;
  kind?: 'body' | 'cover';
  onProgress?: (progress: number) => void;
}): Promise<{path: string; publicUrl: string}> {
  if (!ARTICLE_IMAGE_TYPES.has(file.type)) throw new Error('只允许 PNG、JPG、JPEG、WebP 或 GIF 图片。');
  if (file.size <= 0) throw new Error('图片文件为空。');
  if (file.size > MAX_ARTICLE_IMAGE_SIZE) throw new Error('单张图片不能超过 10MB。');
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.replace('image/', '');
  const filename = `${kind === 'cover' ? 'cover-' : ''}${crypto.randomUUID()}.${extension}`;
  const path = `articles/${articleId}/${filename}`;
  await uploadSiteAssetWithProgress({client, config, file, path, onProgress});
  return {path, publicUrl: client.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl};
}

export async function deleteArticleAsset(client: SupabaseClient, path: string | null): Promise<void> {
  if (!path) return;
  const {error} = await client.storage.from(SITE_ASSETS_BUCKET).remove([path]);
  if (error) throw error;
}

export function articleAssetUrl(client: SupabaseClient, path: string | null): string | null {
  return path ? client.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl : null;
}

export function createArticleSlug(title: string): string {
  return title
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
