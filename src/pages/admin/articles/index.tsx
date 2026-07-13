import React from 'react';
import Link from '@docusaurus/Link';
import {Eye, Pencil, Plus, RefreshCw, Search, Trash2} from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import {deleteArticle, listArticles, saveArticle, type ArticleRecord} from '../../../lib/articleApi';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../../lib/supabaseClient';
import styles from './articles.module.css';

function ArticleList(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const [items, setItems] = React.useState<ArticleRecord[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [workingId, setWorkingId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ArticleRecord | null>(null);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try { setItems(await listArticles(client)); }
    catch (error) { setMessage({kind: 'error', text: safeSupabaseError(error, config)}); }
    finally { setLoading(false); }
  }, [client, config]);
  React.useEffect(() => { void load(); }, [load]);

  const toggleStatus = async (item: ArticleRecord): Promise<void> => {
    if (workingId) return;
    setWorkingId(item.id);
    setMessage(null);
    const publishing = !item.published;
    try {
      await saveArticle(client, {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        cover_path: item.cover_path,
        body_markdown: item.body_markdown,
        category: item.category,
        tags: item.tags,
        status: publishing ? 'published' : 'draft',
        published: publishing,
      });
      await load();
      setMessage({kind: 'success', text: publishing ? '文章已发布。' : '文章已转为草稿。'});
    } catch (error) { setMessage({kind: 'error', text: safeSupabaseError(error, config)}); }
    finally { setWorkingId(null); }
  };

  const remove = async (): Promise<void> => {
    if (!pendingDelete || workingId) return;
    setWorkingId(pendingDelete.id);
    setMessage(null);
    try {
      await deleteArticle(client, pendingDelete.id);
      setPendingDelete(null);
      await load();
      setMessage({kind: 'success', text: '文章及其文章目录下的图片已删除。'});
    } catch (error) { setMessage({kind: 'error', text: safeSupabaseError(error, config)}); }
    finally { setWorkingId(null); }
  };

  const query = search.trim().toLocaleLowerCase();
  const visible = query ? items.filter((item) => item.title.toLocaleLowerCase().includes(query)) : items;

  return (
    <>
      <div className={styles.toolbar}>
        <div><h2>文章</h2><p>使用 Markdown 编辑正文并管理草稿与发布状态。</p></div>
        <div className={styles.toolbarActions}><button type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} />刷新</button><Link to="/admin/articles/new"><Plus size={16} />新建文章</Link></div>
      </div>
      <label className={styles.search}><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="按标题搜索" /></label>
      {message ? <p className={styles.notice} data-kind={message.kind}>{message.text}</p> : null}
      {loading ? <div className={styles.state}>正在加载文章...</div> : visible.length === 0 ? <div className={styles.state}>{items.length === 0 ? '尚无文章。执行文章 SQL 后可创建第一篇文章。' : '没有匹配的文章。'}</div> : (
        <div className={styles.list}>{visible.map((item) => (
          <article key={item.id} className={styles.item}>
            <div><span>{item.category || '未分类'} · {new Date(item.updated_at).toLocaleString()}</span><h3>{item.title}</h3><p>{item.summary || '暂无摘要'}</p><div className={styles.meta}><span data-published={item.published}>{item.published ? '已发布' : '草稿'}</span><code>{item.slug}</code></div></div>
            <div className={styles.actions}>
              <Link to={`/admin/articles/edit?id=${encodeURIComponent(item.id)}&preview=1`} title="预览"><Eye size={15} /></Link>
              <Link to={`/admin/articles/edit?id=${encodeURIComponent(item.id)}`} title="编辑"><Pencil size={15} /></Link>
              <button type="button" onClick={() => void toggleStatus(item)} disabled={Boolean(workingId)}>{item.published ? '转为草稿' : '发布'}</button>
              <button type="button" data-danger="true" onClick={() => setPendingDelete(item)} disabled={Boolean(workingId)}><Trash2 size={14} />删除</button>
            </div>
          </article>
        ))}</div>
      )}
      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除文章" description={pendingDelete ? `确定删除“${pendingDelete.title}”吗？文章记录及文章目录下的图片都会被删除。` : ''} confirming={Boolean(workingId)} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

export default function AdminArticlesPage(): React.ReactElement {
  return <AdminPage active="articles" title="文章写作" description="管理 Markdown 文章、正文插图和发布状态。"><ArticleList /></AdminPage>;
}
