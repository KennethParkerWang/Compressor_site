import React from 'react';
import AdminPage from '../../components/admin/AdminPage';
import {AdminModuleLinks} from '../../components/admin/AdminShell';

export default function AdminHomePage(): React.ReactElement {
  return (
    <AdminPage active="home" title="管理员后台" description="管理公开站点的内容入口与资料索引。">
      <AdminModuleLinks />
    </AdminPage>
  );
}
