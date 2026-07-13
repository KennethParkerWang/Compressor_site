import React from 'react';
import AdminPage from '../../../components/admin/AdminPage';
import ArticleEditorScreen from '../../../components/articles/ArticleEditorScreen';

export default function NewArticlePage(): React.ReactElement {
  return <AdminPage active="articles" title="新建文章" description="编辑 Markdown 正文并上传文章插图。"><ArticleEditorScreen /></AdminPage>;
}
