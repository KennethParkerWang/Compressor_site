import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {Session} from '@supabase/supabase-js';
import {ArrowLeft, FileText, Files, LayoutDashboard, Link2, LogOut, PenLine, Presentation, ShieldCheck, UserRound} from 'lucide-react';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {useLocalImageUrl} from '../../lib/localPersonalization';
import {getAccountDisplayName} from '../../lib/accountProfile';
import styles from './adminShell.module.css';

export type AdminSection = 'home' | 'content' | 'articles' | 'reports' | 'files' | 'resources';

const NAV_ITEMS = [
  {id: 'home', label: '后台首页', to: '/admin', icon: LayoutDashboard},
  {id: 'content', label: '页面内容管理', to: '/admin/content', icon: FileText},
  {id: 'articles', label: '文章写作', to: '/admin/articles', icon: PenLine},
  {id: 'reports', label: '汇报资料管理', to: '/admin/reports', icon: Presentation},
  {id: 'files', label: '文件管理', to: '/admin/files', icon: Files},
  {id: 'resources', label: '外部资源链接', to: '/admin/resources', icon: Link2},
] as const;

function maskEmail(email?: string): string {
  if (!email) return '已登录用户';
  const [name, domain] = email.split('@');
  if (!domain) return '已登录用户';
  return `${name.slice(0, Math.min(2, name.length))}***@${domain}`;
}

interface AdminShellProps {
  session: Session;
  active: AdminSection;
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AdminShell({session, active, title, description, children}: AdminShellProps): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const loginUrl = useBaseUrl('/admin/login');
  const avatarUrl = useLocalImageUrl('avatar');
  const displayName = getAccountDisplayName(session.user);
  const [signingOut, setSigningOut] = React.useState(false);
  const [error, setError] = React.useState('');

  const signOut = async (): Promise<void> => {
    setSigningOut(true);
    setError('');
    const {error: signOutError} = await client.auth.signOut();
    if (signOutError) {
      setError(safeSupabaseError(signOutError, config));
      setSigningOut(false);
      return;
    }
    window.location.replace(loginUrl);
  };

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="管理员后台导航">
        <Link className={styles.brand} to="/admin" aria-label="管理员后台首页">
          <span className={styles.brandMark}><ShieldCheck size={20} /></span>
          <span><strong>Research Admin</strong><small>内容管理工作区</small></span>
        </Link>

        <nav className={styles.navigation}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <Link key={item.id} to={item.to} className={styles.navItem} data-active={selected} aria-current={selected ? 'page' : undefined}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link className={styles.returnLink} to="/">
          <ArrowLeft size={17} />
          <span>返回公开网站</span>
        </Link>

        <div className={styles.account}>
          <div className={styles.accountIdentity}>
            <span className={styles.accountAvatar}>{avatarUrl ? <img src={avatarUrl} alt="" /> : <UserRound size={18} />}</span>
            <div><strong>{displayName}</strong><small>{maskEmail(session.user.email)}</small></div>
          </div>
          <button type="button" onClick={signOut} disabled={signingOut}>
            <LogOut size={17} />
            {signingOut ? '正在退出...' : '退出登录'}
          </button>
          {error ? <p role="alert">{error}</p> : null}
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div>
            <span>ADMIN WORKSPACE</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <span className={styles.sessionState}><i /> 已登录</span>
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

export function AdminEmptyState({title, description}: {title: string; description: string}): React.ReactElement {
  return (
    <section className={styles.emptyState} aria-live="polite">
      <span>EMPTY STATE</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

export function AdminModuleLinks(): React.ReactElement {
  return (
    <div className={styles.moduleList}>
      {NAV_ITEMS.filter((item) => item.id !== 'home').map((item, index) => {
        const Icon = item.icon;
        return (
          <Link key={item.id} to={item.to} className={styles.moduleLink}>
            <span className={styles.moduleIndex}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.moduleIcon}><Icon size={19} /></span>
            <strong>{item.label}</strong>
            <small>进入</small>
            <span className={styles.moduleArrow} aria-hidden="true">→</span>
          </Link>
        );
      })}
    </div>
  );
}
