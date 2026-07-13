import React from 'react';
import type {Session} from '@supabase/supabase-js';
import AdminPage from '../../components/admin/AdminPage';
import styles from '../../components/admin/admin.module.css';
import {useSupabaseBrowserClient} from '../../lib/supabaseClient';

function ConnectionDetails({session}: {session: Session}): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h1>Supabase 连接测试</h1>
        <p>仅显示配置和会话状态，不展示凭据或令牌。</p>
      </header>
      <div className={styles.body}>
        <dl className={styles.statusList}>
          <div className={styles.statusRow}><dt>Supabase URL</dt><dd className={styles.success}>{config.url ? '已配置' : '未配置'}</dd></div>
          <div className={styles.statusRow}><dt>Publishable Key</dt><dd className={styles.success}>{config.publishableKey ? '已配置' : '未配置'}</dd></div>
          <div className={styles.statusRow}><dt>Supabase 客户端</dt><dd className={styles.success}>{client ? '初始化成功' : '初始化失败'}</dd></div>
          <div className={styles.statusRow}><dt>登录状态</dt><dd className={styles.success}>已登录</dd></div>
          <div className={styles.statusRow}><dt>当前用户邮箱</dt><dd>{session.user.email ?? 'Supabase 未返回邮箱'}</dd></div>
        </dl>
        <p className={styles.notice}>此页面仅提供静态站点中的界面登录拦截。后续数据库和文件安全必须使用 Supabase RLS 与 Storage Policy。</p>
      </div>
    </div>
  );
}

export default function AdminConnectionTestPage(): React.ReactElement {
  return (
    <AdminPage active="home" title="Supabase 连接测试" description="Supabase 客户端与登录状态测试。">
      {(session) => <ConnectionDetails session={session} />}
    </AdminPage>
  );
}
