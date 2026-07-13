import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import type {Session} from '@supabase/supabase-js';
import AdminGuard from './AdminGuard';
import AdminShell, {type AdminSection} from './AdminShell';
import loginStyles from './admin.module.css';

interface AdminPageProps {
  active: AdminSection;
  title: string;
  description: string;
  children: React.ReactNode | ((session: Session) => React.ReactNode);
}

export default function AdminPage({active, title, description, children}: AdminPageProps): React.ReactElement {
  return (
    <Layout title={title} description={description} noFooter>
      <BrowserOnly fallback={<main className={loginStyles.page}><div className={loginStyles.statePanel}>正在加载管理员后台...</div></main>}>
        {() => (
          <AdminGuard>
            {(session) => (
              <AdminShell session={session} active={active} title={title} description={description}>
                {typeof children === 'function' ? children(session) : children}
              </AdminShell>
            )}
          </AdminGuard>
        )}
      </BrowserOnly>
    </Layout>
  );
}
