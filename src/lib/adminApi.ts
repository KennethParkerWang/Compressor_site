import type {SupabaseClient} from '@supabase/supabase-js';

export interface PageSectionRecord {
  id: string;
  page_key: string;
  section_key: string;
  title: string;
  content: string;
  config: Record<string, unknown>;
  sort_order: number;
  visible: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  report_date: string;
  description: string;
  file_path: string | null;
  cover_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ResourceType = 'paper' | 'dataset' | 'github' | 'tutorial';

export interface ResourceRecord {
  id: string;
  title: string;
  resource_type: ResourceType;
  description: string;
  external_url: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  related_type: string | null;
  related_id: string | null;
  description: string;
  published: boolean;
  created_at: string;
}

export async function checkAdminAccess(client: SupabaseClient, userId: string): Promise<boolean> {
  const {data, error} = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.user_id);
}

export async function listPageSections(client: SupabaseClient): Promise<PageSectionRecord[]> {
  const {data, error} = await client.from('page_sections').select('*').order('page_key').order('sort_order');
  if (error) throw error;
  return (data ?? []) as PageSectionRecord[];
}

export async function getPageSection(
  client: SupabaseClient,
  pageKey: string,
  sectionKey: string,
): Promise<PageSectionRecord | null> {
  const {data, error} = await client
    .from('page_sections')
    .select('*')
    .eq('page_key', pageKey)
    .eq('section_key', sectionKey)
    .maybeSingle();
  if (error) throw error;
  return data as PageSectionRecord | null;
}

export async function savePageSection(
  client: SupabaseClient,
  values: Omit<PageSectionRecord, 'created_at' | 'updated_at'>,
): Promise<PageSectionRecord> {
  const {id, ...payload} = values;
  const query = id
    ? client.from('page_sections').update(payload).eq('id', id)
    : client.from('page_sections').insert(payload);
  const {data, error} = await query.select('*').single();
  if (error) throw error;
  return data as PageSectionRecord;
}

export async function updatePageSection(
  client: SupabaseClient,
  id: string,
  patch: Partial<Pick<PageSectionRecord, 'sort_order' | 'visible' | 'published'>>,
): Promise<void> {
  const {error} = await client.from('page_sections').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deletePageSection(client: SupabaseClient, id: string): Promise<void> {
  const {error} = await client.from('page_sections').delete().eq('id', id);
  if (error) throw error;
}

export async function listReports(client: SupabaseClient): Promise<ReportRecord[]> {
  const {data, error} = await client.from('reports').select('*').order('report_date', {ascending: false});
  if (error) throw error;
  return (data ?? []) as ReportRecord[];
}

export async function saveReport(
  client: SupabaseClient,
  values: Omit<ReportRecord, 'created_at' | 'updated_at'>,
): Promise<ReportRecord> {
  const {id, title, report_date, description, file_path, cover_path, published} = values;
  const payload = {title, report_date, description, file_path, cover_path, published};
  const query = id
    ? client.from('reports').update(payload).eq('id', id)
    : client.from('reports').insert({id, ...payload});
  const {data, error} = await query.select('*').single();
  if (error) throw error;
  return data as ReportRecord;
}

export async function deleteReport(client: SupabaseClient, id: string): Promise<void> {
  const {error} = await client.from('reports').delete().eq('id', id);
  if (error) throw error;
}

export async function listResources(client: SupabaseClient): Promise<ResourceRecord[]> {
  const {data, error} = await client.from('resources').select('*').order('created_at', {ascending: false});
  if (error) throw error;
  return (data ?? []) as ResourceRecord[];
}

export async function saveResource(
  client: SupabaseClient,
  values: Omit<ResourceRecord, 'created_at' | 'updated_at'>,
): Promise<ResourceRecord> {
  const {id, title, resource_type, description, external_url, tags, published} = values;
  const payload = {title, resource_type, description, external_url, tags, published};
  const query = id
    ? client.from('resources').update(payload).eq('id', id)
    : client.from('resources').insert(payload);
  const {data, error} = await query.select('*').single();
  if (error) throw error;
  return data as ResourceRecord;
}

export async function deleteResource(client: SupabaseClient, id: string): Promise<void> {
  const {error} = await client.from('resources').delete().eq('id', id);
  if (error) throw error;
}

export async function listFiles(client: SupabaseClient): Promise<FileRecord[]> {
  const {data, error} = await client.from('files').select('*').order('created_at', {ascending: false});
  if (error) throw error;
  return (data ?? []) as FileRecord[];
}

export async function getFileById(client: SupabaseClient, id: string): Promise<FileRecord | null> {
  const {data, error} = await client.from('files').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as FileRecord | null;
}

export async function listFilesByRelation(client: SupabaseClient, relatedType: string, relatedId: string): Promise<FileRecord[]> {
  const {data, error} = await client
    .from('files')
    .select('*')
    .eq('related_type', relatedType)
    .eq('related_id', relatedId);
  if (error) throw error;
  return (data ?? []) as FileRecord[];
}

export async function listFilesByContext(client: SupabaseClient, relatedType: string, relatedKey: string): Promise<FileRecord[]> {
  const {data, error} = await client
    .from('files')
    .select('*')
    .eq('related_type', `${relatedType}:${relatedKey}`)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return (data ?? []) as FileRecord[];
}

export async function createFileRecord(
  client: SupabaseClient,
  values: Omit<FileRecord, 'id' | 'created_at'>,
): Promise<FileRecord> {
  const {data, error} = await client.from('files').insert(values).select('*').single();
  if (error) throw error;
  return data as FileRecord;
}

export async function deleteFileRow(client: SupabaseClient, id: string): Promise<void> {
  const {error} = await client.from('files').delete().eq('id', id);
  if (error) throw error;
}
