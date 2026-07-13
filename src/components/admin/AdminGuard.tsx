import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {Session} from '@supabase/supabase-js';
import {checkAdminAccess} from '../../lib/adminApi';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import styles from './admin.module.css';

interface AdminGuardProps {
  children: (session: Session) => React.ReactNode;
}

export default function AdminGuard({children}: AdminGuardProps): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const loginUrl = useBaseUrl('/admin/login');
  const [session, setSession] = React.useState<Session | null>(null);
  const [status, setStatus] = React.useState<'checking' | 'checking-role' | 'authenticated' | 'unauthorized' | 'redirecting' | 'error'>('checking');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    let redirectTimer: number | undefined;

    const verifyAdmin = async (nextSession: Session): Promise<void> => {
      setStatus('checking-role');
      try {
        const isAdmin = await checkAdminAccess(client, nextSession.user.id);
        if (!active) return;
        if (!isAdmin) {
          setSession(null);
          setError('无管理员权限。当前账号未加入 admin_users。');
          setStatus('unauthorized');
          redirectTimer = window.setTimeout(() => {
            void client.auth.signOut().finally(() => window.location.replace(loginUrl));
          }, 2500);
          return;
        }
        setSession(nextSession);
        setStatus('authenticated');
      } catch (adminError) {
        if (!active) return;
        setError(`管理员权限检查失败：${safeSupabaseError(adminError, config)}`);
        setStatus('error');
      }
    };

    const checkSession = async (): Promise<void> => {
      const {data, error: sessionError} = await client.auth.getSession();
      if (!active) return;

      if (sessionError) {
        setError(safeSupabaseError(sessionError, config));
        setStatus('error');
        return;
      }

      if (!data.session) {
        setStatus('redirecting');
        window.location.replace(loginUrl);
        return;
      }

      await verifyAdmin(data.session);
    };

    void checkSession();

    const {data: authListener} = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (!nextSession) {
        setSession(null);
        setStatus('redirecting');
        window.location.replace(loginUrl);
        return;
      }
      void verifyAdmin(nextSession);
    });

    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
      authListener.subscription.unsubscribe();
    };
  }, [client, config, loginUrl]);

  if (status === 'unauthorized') {
    return <div className={styles.statePanel} role="alert"><strong>无管理员权限</strong><span>{error}</span><small>正在退出并返回登录页...</small></div>;
  }

  if (status === 'error') {
    return <div className={styles.statePanel} role="alert"><strong>登录状态检查失败</strong><span>{error}</span></div>;
  }

  if (status !== 'authenticated' || !session) {
    const message = status === 'redirecting'
      ? '正在跳转登录页...'
      : status === 'checking-role'
        ? '正在检查管理员权限...'
        : '正在检查登录状态...';
    return <div className={styles.statePanel} aria-live="polite"><span>{message}</span></div>;
  }

  return <>{children(session)}</>;
}
