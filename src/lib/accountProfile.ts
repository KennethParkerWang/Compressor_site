import type {User} from '@supabase/supabase-js';

export function getAccountDisplayName(user?: User | null): string {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const candidates = [metadata?.display_name, metadata?.full_name, metadata?.name];
  const savedName = candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (savedName) return savedName.trim().slice(0, 40);
  const emailName = user?.email?.split('@')[0]?.trim();
  return emailName ? emailName.slice(0, 40) : '已登录用户';
}
