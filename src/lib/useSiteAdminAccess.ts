import React from 'react';
import type {Session} from '@supabase/supabase-js';
import {checkAdminAccess} from './adminApi';
import {safeSupabaseError, useSupabaseBrowserClient} from './supabaseClient';

export interface SiteAdminAccess {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  error: string;
}

export function useSiteAdminAccess(): SiteAdminAccess {
  const {client, config} = useSupabaseBrowserClient();
  const [state, setState] = React.useState<SiteAdminAccess>({session: null, isAdmin: false, loading: true, error: ''});

  React.useEffect(() => {
    let active = true;

    const resolveAccess = async (session: Session | null): Promise<void> => {
      if (!active) return;
      if (!session) {
        setState({session: null, isAdmin: false, loading: false, error: ''});
        return;
      }
      try {
        const isAdmin = await checkAdminAccess(client, session.user.id);
        if (active) setState({session, isAdmin, loading: false, error: ''});
      } catch (error) {
        if (active) setState({session, isAdmin: false, loading: false, error: safeSupabaseError(error, config)});
      }
    };

    void client.auth.getSession().then(({data, error}) => {
      if (error && active) {
        setState({session: null, isAdmin: false, loading: false, error: safeSupabaseError(error, config)});
        return;
      }
      void resolveAccess(data.session);
    });

    const {data: listener} = client.auth.onAuthStateChange((_event, session) => {
      void resolveAccess(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client, config]);

  return state;
}
