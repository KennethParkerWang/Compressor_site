import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import styles from '../../components/admin/admin.module.css';

function LoginClient(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const connectionTestUrl = useBaseUrl('/admin/connection-test');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    void client.auth.getSession().then(({data, error: sessionError}) => {
      if (!active) return;
      if (sessionError) {
        setError(safeSupabaseError(sessionError, config));
        setChecking(false);
        return;
      }
      if (data.session) {
        window.location.replace(connectionTestUrl);
        return;
      }
      setChecking(false);
    });

    const {data: authListener} = client.auth.onAuthStateChange((_event, session) => {
      if (active && session) window.location.replace(connectionTestUrl);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [client, config, connectionTestUrl]);

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const {error: signInError} = await client.auth.signInWithPassword({email, password});
    if (signInError) {
      setError(safeSupabaseError(signInError, config));
      setSubmitting(false);
      return;
    }

    window.location.replace(connectionTestUrl);
  };

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h1>管理员登录测试</h1>
        <p>使用 Supabase 邮箱与密码会话。</p>
      </header>
      <form className={styles.body} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="admin-email">邮箱</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={checking || submitting} />
        </div>
        <div className={styles.field}>
          <label htmlFor="admin-password">密码</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={checking || submitting} />
        </div>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <button className={styles.button} type="submit" disabled={checking || submitting}>
          {checking ? '正在检查登录状态...' : submitting ? '正在登录...' : '登录'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage(): React.ReactElement {
  return (
    <Layout title="管理员登录测试" description="Supabase 管理员登录连接测试">
      <main className={styles.page}>
        <BrowserOnly fallback={<div className={styles.statePanel}>正在加载登录测试...</div>}>
          {() => <LoginClient />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
