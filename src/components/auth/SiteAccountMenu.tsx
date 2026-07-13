import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LogIn, LogOut, ShieldCheck, UserRound} from 'lucide-react';
import {useSiteAdminAccess} from '../../lib/useSiteAdminAccess';
import {useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {useLocalImageUrl} from '../../lib/localPersonalization';
import {getAccountDisplayName} from '../../lib/accountProfile';
import styles from './SiteAccountMenu.module.css';

function AccountClient({compact = false}: {compact?: boolean}): React.ReactElement {
  const {client} = useSupabaseBrowserClient();
  const {session, isAdmin, loading} = useSiteAdminAccess();
  const loginUrl = useBaseUrl('/login');
  const avatarUrl = useLocalImageUrl('avatar');
  const displayName = getAccountDisplayName(session?.user);
  const [signingOut, setSigningOut] = React.useState(false);

  if (loading) return <span className={styles.loading} aria-label="正在检查登录状态" />;

  if (!session) {
    return <Link className={styles.loginLink} to="/login"><LogIn size={15} /><span>登录</span></Link>;
  }

  const signOut = async (): Promise<void> => {
    if (signingOut) return;
    setSigningOut(true);
    await client.auth.signOut();
    window.location.assign(loginUrl);
  };

  return (
    <div className={styles.accountGroup} data-compact={compact}>
      {isAdmin ? (
        <Link className={styles.adminLink} to="/account" title="打开个人账户；当前账户具有管理员权限">{avatarUrl ? <img className={styles.avatar} src={avatarUrl} alt="" /> : <ShieldCheck size={15} />}<span>{displayName}</span></Link>
      ) : (
        <Link className={styles.userState} to="/account" title="打开个人账户">{avatarUrl ? <img className={styles.avatar} src={avatarUrl} alt="" /> : <UserRound size={15} />}<span>{displayName}</span></Link>
      )}
      <button type="button" className={styles.logoutButton} onClick={signOut} disabled={signingOut} title="退出登录" aria-label="退出登录"><LogOut size={15} /></button>
    </div>
  );
}

export default function SiteAccountMenu({compact = false}: {compact?: boolean}): React.ReactElement {
  return (
    <BrowserOnly fallback={<Link className={styles.loginLink} to="/login"><LogIn size={15} /><span>登录</span></Link>}>
      {() => <AccountClient compact={compact} />}
    </BrowserOnly>
  );
}
