import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {createClient, type SupabaseClient} from '@supabase/supabase-js';

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

let browserClient: SupabaseClient | null = null;

export function readSupabasePublicConfig(customFields: Record<string, unknown>): SupabasePublicConfig {
  const url = customFields.supabaseUrl;
  const publishableKey = customFields.supabasePublishableKey;

  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('Supabase Project URL is not configured in Docusaurus customFields.');
  }
  if (typeof publishableKey !== 'string' || publishableKey.length === 0) {
    throw new Error('Supabase publishable key is not configured in Docusaurus customFields.');
  }

  return {url, publishableKey};
}

export function getSupabaseBrowserClient(config: SupabasePublicConfig): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('Supabase Auth is only initialized in the browser.');
  }

  if (!browserClient) {
    browserClient = createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

export function useSupabaseBrowserClient(): {
  client: SupabaseClient;
  config: SupabasePublicConfig;
} {
  const {siteConfig} = useDocusaurusContext();
  const config = React.useMemo(
    () => readSupabasePublicConfig(siteConfig.customFields),
    [siteConfig.customFields],
  );
  const client = React.useMemo(() => getSupabaseBrowserClient(config), [config]);
  return {client, config};
}

export function safeSupabaseError(error: unknown, config?: SupabasePublicConfig): string {
  const structured = error && typeof error === 'object'
    ? error as {message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown; code?: unknown}
    : null;
  const candidates = [
    error instanceof Error ? error.message : null,
    structured?.message,
    structured?.error_description,
    structured?.details,
    structured?.hint,
  ];
  const detail = candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  let message = detail ?? 'Supabase request failed.';

  if (config) {
    message = message
      .replaceAll(config.url, '[Supabase URL]')
      .replaceAll(config.publishableKey, '[Publishable Key]');
  }

  return message
    .replace(/https?:\/\/[^\s]+/gi, '[Supabase endpoint]')
    .replace(/eyJ[A-Za-z0-9._-]{20,}/g, '[credential]')
    .slice(0, 320);
}
