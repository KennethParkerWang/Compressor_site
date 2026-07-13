import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {BookOpen, CheckCircle2, Database, FileText, ListTodo, LogOut, Save, Settings, ShieldCheck, UserRound} from 'lucide-react';
import {ensureUserProfile, isAccountSchemaMissing, loadAccountWorkspace, updateUserProfileName, type UserProfileRecord} from '../lib/accountDataApi';
import {getAccountDisplayName} from '../lib/accountProfile';
import {safeSupabaseError, useSupabaseBrowserClient} from '../lib/supabaseClient';
import {useSiteAdminAccess} from '../lib/useSiteAdminAccess';
import styles from './account.module.css';

function AccountClient(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const {session, isAdmin, loading: accessLoading} = useSiteAdminAccess();
  const loginUrl = useBaseUrl('/login');
  const [profile, setProfile] = React.useState<UserProfileRecord | null>(null);
  const [counts, setCounts] = React.useState({tasks: 0, notes: 0});
  const [displayName, setDisplayName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [schemaMissing, setSchemaMissing] = React.useState(false);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);
  const [syncPhase, setSyncPhaseState] = React.useState(() => document.documentElement.dataset.crAccountSync ?? 'loading');

  React.useEffect(() => {
    const listener = (event: Event): void => setSyncPhaseState((event as CustomEvent<string>).detail);
    window.addEventListener('cr-account-sync-status', listener);
    return () => window.removeEventListener('cr-account-sync-status', listener);
  }, []);

  React.useEffect(() => {
    if (accessLoading) return;
    if (!session) {
      window.location.replace(loginUrl);
      return;
    }
    let active = true;
    void Promise.all([ensureUserProfile(client, session.user), loadAccountWorkspace(client, session.user)])
      .then(([nextProfile, workspace]) => {
        if (!active) return;
        setProfile(nextProfile);
        setDisplayName(nextProfile.display_name || getAccountDisplayName(session.user));
        setCounts({tasks: workspace.tasks.length, notes: workspace.notes.length});
      })
      .catch((error) => {
        if (!active) return;
        if (isAccountSchemaMissing(error)) setSchemaMissing(true);
        else setMessage({kind: 'error', text: safeSupabaseError(error, config)});
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessLoading, client, config, loginUrl, session]);

  const saveName = async (): Promise<void> => {
    const name = displayName.trim();
    if (!session || !profile || !name || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfileName(client, session.user.id, name);
      const {error} = await client.auth.updateUser({data: {display_name: name}});
      if (error) throw error;
      setProfile({...profile, display_name: name});
      setMessage({kind: 'success', text: '账户名称已更新。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setSaving(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await client.auth.signOut();
    window.location.replace(loginUrl);
  };

  if (loading || accessLoading) return <main className={styles.accountLoading}><Database size={20} />正在加载账户...</main>;
  if (!session) return <main className={styles.accountLoading}>正在跳转登录...</main>;

  return (
    <main className={styles.accountPage}>
      <header className={styles.accountHeader}>
        <div className={styles.profileMark}><UserRound size={25} /></div>
        <div><span>PERSONAL WORKSPACE</span><h1>{profile?.display_name || getAccountDisplayName(session.user)}</h1><p>{session.user.email}</p></div>
        <button type="button" onClick={() => void signOut()}><LogOut size={15} />退出登录</button>
      </header>

      {schemaMissing ? <section className={styles.setupNotice}><ShieldCheck size={20} /><div><strong>需要执行账户隔离 SQL</strong><p>在 Supabase SQL Editor 中运行 <code>supabase/user-account-isolation.sql</code> 后刷新本页。</p></div></section> : null}
      {message ? <p className={styles.accountMessage} data-kind={message.kind}>{message.text}</p> : null}

      <section className={styles.accountStats}>
        <div><ListTodo size={18} /><span>个人任务</span><strong>{counts.tasks}</strong></div>
        <div><FileText size={18} /><span>个人笔记</span><strong>{counts.notes}</strong></div>
        <div><CheckCircle2 size={18} /><span>同步状态</span><strong>{syncPhase === 'ready' ? '已同步' : syncPhase === 'setup-required' ? '待配置' : '处理中'}</strong></div>
      </section>

      <div className={styles.accountColumns}>
        <section className={styles.profileSection}>
          <header><UserRound size={17} /><h2>账户资料</h2></header>
          <label htmlFor="profile-display-name">显示名称</label>
          <div><input id="profile-display-name" value={displayName} maxLength={40} disabled={saving || schemaMissing} onChange={(event) => setDisplayName(event.target.value)} /><button type="button" onClick={() => void saveName()} disabled={saving || schemaMissing || !displayName.trim()}><Save size={14} />{saving ? '保存中' : '保存'}</button></div>
          <small>该名称会显示在网站顶部账户入口中。</small>
        </section>

        <nav className={styles.accountLinks} aria-label="个人工作区入口">
          <Link to="/tasks"><ListTodo size={17} /><span><strong>我的任务</strong><small>只显示当前账户任务</small></span></Link>
          <Link to="/notes"><FileText size={17} /><span><strong>我的笔记</strong><small>只显示当前账户笔记</small></span></Link>
          <Link to="/library"><BookOpen size={17} /><span><strong>继续阅读</strong><small>返回公共文献库</small></span></Link>
          <Link to="/settings"><Settings size={17} /><span><strong>本地外观</strong><small>壁纸和本机头像设置</small></span></Link>
          {isAdmin ? <Link to="/admin"><ShieldCheck size={17} /><span><strong>管理后台</strong><small>管理员专属入口</small></span></Link> : null}
        </nav>
      </div>
    </main>
  );
}

export default function AccountPage(): React.ReactElement {
  return <Layout title="我的账户" description="个人研究工作区"><BrowserOnly fallback={<main className={styles.accountLoading}>正在加载账户...</main>}>{() => <AccountClient />}</BrowserOnly></Layout>;
}
