import React from 'react';
import {useLocation} from '@docusaurus/router';
import AdminPage from '../../../components/admin/AdminPage';
import ArticleEditorScreen from '../../../components/articles/ArticleEditorScreen';

export default function EditArticlePage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id') ?? undefined;
  return <AdminPage active="articles" title="编辑文章" description="编辑 Markdown 正文、图片与发布状态。">{id ? <ArticleEditorScreen articleId={id} initialPreview={params.get('preview') === '1'} /> : <p>缺少文章 ID。</p>}</AdminPage>;
}
