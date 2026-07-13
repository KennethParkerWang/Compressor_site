import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import ArticleMarkdown from '../components/articles/ArticleMarkdown';
import {articleAssetUrl, getPublishedArticle, type ArticleRecord} from '../lib/articleApi';
import {safeSupabaseError, useSupabaseBrowserClient} from '../lib/supabaseClient';
import styles from './article.module.css';

function ArticleReader(): React.ReactElement {
  const location = useLocation();
  const {client, config} = useSupabaseBrowserClient();
  const id = new URLSearchParams(location.search).get('id');
  const [article, setArticle] = React.useState<ArticleRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    if (!id) { setError('缺少文章 ID。'); setLoading(false); return; }
    setLoading(true);
    void getPublishedArticle(client, id).then((record) => {
      if (!active) return;
      if (!record) throw new Error('文章不存在、尚未发布或当前不可读取。');
      setArticle(record);
    }).catch((reason) => { if (active) setError(safeSupabaseError(reason, config)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client, config, id]);

  if (loading) return <main className={styles.state}>正在加载文章...</main>;
  if (error || !article) return <main className={styles.state} role="alert">{error || '文章不可读取。'}</main>;
  const coverUrl = articleAssetUrl(client, article.cover_path);
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <header>{article.category ? <span>{article.category}</span> : null}<h1>{article.title}</h1>{article.summary ? <p>{article.summary}</p> : null}<div><time>{new Date(article.updated_at).toLocaleDateString()}</time>{article.tags.map((tag) => <em key={tag}>{tag}</em>)}</div></header>
        {coverUrl ? <img className={styles.cover} src={coverUrl} alt="" /> : null}
        <ArticleMarkdown markdown={article.body_markdown} />
      </article>
    </main>
  );
}

export default function PublicArticlePage(): React.ReactElement {
  return <Layout title="文章" description="项目文章阅读页"><BrowserOnly fallback={<main className={styles.state}>正在加载文章...</main>}>{() => <ArticleReader />}</BrowserOnly></Layout>;
}
