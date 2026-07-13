import type {SupabaseClient, User} from '@supabase/supabase-js';
import type {ReadingNote} from '../data/readingNotes';
import type {ResearchTask} from '../data/researchTasks';
import type {UserReadingState} from '../data/userReadingState';

export interface UserProfileRecord {
  user_id: string;
  display_name: string;
  avatar_path: string | null;
  local_import_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountWorkspace {
  profile: UserProfileRecord;
  tasks: ResearchTask[];
  notes: ReadingNote[];
  readingState: UserReadingState[];
}

function displayNameFromUser(user: User): string {
  const metadata = user.user_metadata ?? {};
  const name = metadata.display_name ?? metadata.full_name ?? metadata.name;
  return typeof name === 'string' && name.trim() ? name.trim() : (user.email?.split('@')[0] ?? '用户');
}

export function isAccountSchemaMissing(error: unknown): boolean {
  const value = error as {code?: string; message?: string} | null;
  return value?.code === '42P01'
    || value?.code === 'PGRST205'
    || Boolean(value?.message?.includes('user_tasks') || value?.message?.includes('profiles'));
}

export async function ensureUserProfile(client: SupabaseClient, user: User): Promise<UserProfileRecord> {
  const {data: existing, error: selectError} = await client.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing as UserProfileRecord;

  const {data, error} = await client.from('profiles').insert({
    user_id: user.id,
    display_name: displayNameFromUser(user),
  }).select('*').single();
  if (error) throw error;
  return data as UserProfileRecord;
}

export async function loadAccountWorkspace(client: SupabaseClient, user: User): Promise<AccountWorkspace> {
  const profile = await ensureUserProfile(client, user);
  const [tasksResult, notesResult, readingResult] = await Promise.all([
    client.from('user_tasks').select('data').eq('user_id', user.id).order('updated_at', {ascending: false}),
    client.from('user_notes').select('data').eq('user_id', user.id).order('updated_at', {ascending: false}),
    client.from('user_reading_state').select('*').eq('user_id', user.id).order('updated_at', {ascending: false}),
  ]);
  if (tasksResult.error) throw tasksResult.error;
  if (notesResult.error) throw notesResult.error;
  if (readingResult.error) throw readingResult.error;
  return {
    profile,
    tasks: (tasksResult.data ?? []).map((row) => row.data as ResearchTask),
    notes: (notesResult.data ?? []).map((row) => row.data as ReadingNote),
    readingState: (readingResult.data ?? []).map((row): UserReadingState => ({
      literatureId: row.literature_id,
      status: row.status,
      progress: row.progress,
      lastReadAt: row.last_read_at ?? undefined,
      data: row.data ?? {},
    })),
  };
}

export async function upsertUserTask(client: SupabaseClient, userId: string, task: ResearchTask): Promise<void> {
  const {error} = await client.from('user_tasks').upsert({user_id: userId, task_id: task.id, data: task}, {onConflict: 'user_id,task_id'});
  if (error) throw error;
}

export async function deleteUserTask(client: SupabaseClient, userId: string, taskId: string): Promise<void> {
  const {error} = await client.from('user_tasks').delete().eq('user_id', userId).eq('task_id', taskId);
  if (error) throw error;
}

export async function upsertUserNote(client: SupabaseClient, userId: string, note: ReadingNote): Promise<void> {
  const {error} = await client.from('user_notes').upsert({user_id: userId, note_id: note.id, data: note}, {onConflict: 'user_id,note_id'});
  if (error) throw error;
}

export async function deleteUserNote(client: SupabaseClient, userId: string, noteId: string): Promise<void> {
  const {error} = await client.from('user_notes').delete().eq('user_id', userId).eq('note_id', noteId);
  if (error) throw error;
}

export async function upsertUserReadingState(client: SupabaseClient, userId: string, state: UserReadingState): Promise<void> {
  const {error} = await client.from('user_reading_state').upsert({
    user_id: userId,
    literature_id: state.literatureId,
    status: state.status,
    progress: state.progress,
    last_read_at: state.lastReadAt ?? null,
    data: state.data ?? {},
  }, {onConflict: 'user_id,literature_id'});
  if (error) throw error;
}

export async function importLocalWorkspace(client: SupabaseClient, userId: string, tasks: ResearchTask[], notes: ReadingNote[]): Promise<void> {
  if (tasks.length > 0) {
    const {error} = await client.from('user_tasks').upsert(tasks.map((task) => ({user_id: userId, task_id: task.id, data: task})), {onConflict: 'user_id,task_id'});
    if (error) throw error;
  }
  if (notes.length > 0) {
    const {error} = await client.from('user_notes').upsert(notes.map((note) => ({user_id: userId, note_id: note.id, data: note})), {onConflict: 'user_id,note_id'});
    if (error) throw error;
  }
  await markLocalImportCompleted(client, userId);
}

export async function markLocalImportCompleted(client: SupabaseClient, userId: string): Promise<void> {
  const {error} = await client.from('profiles').update({local_import_completed: true}).eq('user_id', userId);
  if (error) throw error;
}

export async function updateUserProfileName(client: SupabaseClient, userId: string, displayName: string): Promise<void> {
  const {error} = await client.from('profiles').update({display_name: displayName}).eq('user_id', userId);
  if (error) throw error;
}
