import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {ArrowLeft, LogIn, ShieldCheck} from 'lucide-react';
import {safeSupabaseError, useSupabaseBrowserClient} from '../lib/supabaseClient';
import styles from './account.module.css';

function safeNext(fallback: string): string {
  const candidate = new URLSearchParams(window.location.search).get('next');
  return candidate && candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : fallback;
}

function LoginClient(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const accountUrl = useBaseUrl('/account');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    void client.auth.getSession().then(({data, error: sessionError}) => {
      if (!active) return;
      if (sessionError) setError(safeSupabaseError(sessionError, config));
      else if (data.session) window.location.replace(safeNext(accountUrl));
      setChecking(false);
    });
    return () => { active = false; };
  }, [accountUrl, client.auth, config]);

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    const {error: signInError} = await client.auth.signInWithPassword({email: email.trim(), password});
    if (signInError) {
      setError(safeSupabaseError(signInError, config));
      setSubmitting(false);
      return;
    }
    window.location.replace(safeNext(accountUrl));
  };

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel}>
        <Link to="/" className={styles.backLink}><ArrowLeft size={15} />返回网站</Link>
        <div className={styles.loginIdentity}><span><LogIn size={20} /></span><div><small>Research Account</small><h1>登录个人工作区</h1></div></div>
        <p>登录后，阅读状态、任务和笔记只属于当前账户，并可在不同设备间同步。</p>
        <form onSubmit={submit}>
          <label htmlFor="user-email">邮箱</label>
          <input id="user-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={checking || submitting} />
          <label htmlFor="user-password">密码</label>
          <input id="user-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={checking || submitting} />
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="submit" disabled={checking || submitting}><LogIn size={16} />{checking ? '正在检查...' : submitting ? '正在登录...' : '登录'}</button>
        </form>
        <footer><ShieldCheck size={14} /><span>账户由项目负责人在 Supabase 中创建；当前未开放自助注册。</span></footer>
      </section>
    </main>
  );
}

export default function LoginPage(): React.ReactElement {
  return <Layout title="账户登录" description="登录个人研究工作区"><BrowserOnly fallback={<main className={styles.loginPage}>正在加载登录页...</main>}>{() => <LoginClient />}</BrowserOnly></Layout>;
}
