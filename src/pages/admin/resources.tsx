import React from 'react';
import {ExternalLink, Pencil, Plus, RefreshCw, Trash2} from 'lucide-react';
import AdminPage from '../../components/admin/AdminPage';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import styles from '../../components/admin/adminCrud.module.css';
import {
  deleteResource,
  listResources,
  saveResource,
  type ResourceRecord,
  type ResourceType,
} from '../../lib/adminApi';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';

const RESOURCE_LABELS: Record<ResourceType, string> = {
  paper: '论文',
  dataset: '数据集',
  github: 'GitHub 代码',
  tutorial: '教程',
};

const EMPTY_FORM = {title: '', resourceType: 'paper' as ResourceType, description: '', externalUrl: '', tags: '', published: false};

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function ResourceManager(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const submittingRef = React.useRef(false);
  const [items, setItems] = React.useState<ResourceRecord[]>([]);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<ResourceRecord | null>(null);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setItems(await listResources(client));
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setLoading(false);
    }
  }, [client, config]);

  React.useEffect(() => { void load(); }, [load]);

  const reset = (): void => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); };

  const edit = (item: ResourceRecord): void => {
    setEditingId(item.id);
    setForm({title: item.title, resourceType: item.resource_type, description: item.description, externalUrl: item.external_url, tags: item.tags.join(', '), published: item.published});
    setShowForm(true);
    setMessage(null);
  };

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!form.title.trim() || !form.externalUrl.trim()) {
      setMessage({kind: 'error', text: '标题和外部链接为必填项。'});
      return;
    }
    if (!isValidHttpUrl(form.externalUrl.trim())) {
      setMessage({kind: 'error', text: '外部链接必须是有效的 http 或 https 地址。'});
      return;
    }
    const tags = Array.from(new Set(form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)));
    submittingRef.current = true;
    setSubmitting(true);
    setMessage(null);
    try {
      await saveResource(client, {
        id: editingId ?? '',
        title: form.title.trim(),
        resource_type: form.resourceType,
        description: form.description.trim(),
        external_url: form.externalUrl.trim(),
        tags,
        published: form.published,
      });
      await load();
      setMessage({kind: 'success', text: editingId ? '资源已更新。' : '资源已创建。'});
      reset();
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const togglePublished = async (item: ResourceRecord): Promise<void> => {
    setMessage(null);
    try {
      await saveResource(client, {...item, published: !item.published});
      await load();
      setMessage({kind: 'success', text: item.published ? '资源已隐藏。' : '资源已发布。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    }
  };

  const remove = async (): Promise<void> => {
    if (!pendingDelete || removing) return;
    setRemoving(true);
    setMessage(null);
    try {
      await deleteResource(client, pendingDelete.id);
      await load();
      setMessage({kind: 'success', text: '资源已删除。'});
      setPendingDelete(null);
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className={styles.toolbar}><div><h2>资源链接</h2><p>维护论文、数据集、代码和教程地址。</p></div><div className={styles.actions}><button className={styles.secondaryButton} type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} />刷新</button><button className={styles.button} type="button" onClick={() => { reset(); setShowForm(true); }}><Plus size={16} />添加资源</button></div></div>
      {message ? <p className={styles.notice} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}
      {showForm ? (
        <section className={styles.formPanel}>
          <header className={styles.formHeader}><h2>{editingId ? '编辑资源' : '添加资源'}</h2><button className={styles.textButton} type="button" onClick={reset}>取消</button></header>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.formGrid}>
              <div className={styles.wideField}><label htmlFor="resource-title">标题</label><input id="resource-title" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
              <div className={styles.field}><label htmlFor="resource-type">分类</label><select id="resource-type" value={form.resourceType} onChange={(e) => setForm({...form, resourceType: e.target.value as ResourceType})}>{Object.entries(RESOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div className={styles.wideField}><label htmlFor="resource-url">外部链接</label><input id="resource-url" type="url" required value={form.externalUrl} onChange={(e) => setForm({...form, externalUrl: e.target.value})} placeholder="https://" /></div>
              <div className={styles.wideField}><label htmlFor="resource-description">简介</label><textarea id="resource-description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div className={styles.wideField}><label htmlFor="resource-tags">标签</label><input id="resource-tags" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="多个标签使用英文逗号分隔" /></div>
            </div>
            <div className={styles.checkRow}><label><input type="checkbox" checked={form.published} onChange={(e) => setForm({...form, published: e.target.checked})} />发布</label></div>
            <div className={styles.actions}><button className={styles.button} type="submit" disabled={submitting}>{submitting ? '正在保存...' : '保存资源'}</button></div>
          </form>
        </section>
      ) : null}
      {loading ? <div className={styles.loading}>正在加载资源...</div> : items.length === 0 ? <div className={styles.empty}><strong>尚无资源链接</strong><span>添加第一条资源后会显示在这里。</span></div> : (
        <div className={styles.list}>{items.map((item) => <article className={styles.listItem} key={item.id}><div className={styles.itemTitle}><h3>{item.title}</h3><p>{item.description || item.external_url}</p><div className={styles.meta}><span className={styles.badge}>{RESOURCE_LABELS[item.resource_type]}</span>{item.tags.map((tag) => <span className={styles.badge} key={tag}>{tag}</span>)}<span className={styles.badge} data-positive={item.published}>{item.published ? '已发布' : '隐藏'}</span></div></div><div className={styles.rowActions}><a className={styles.textButton} href={item.external_url} target="_blank" rel="noreferrer"><ExternalLink size={14} />打开</a><button className={styles.textButton} type="button" onClick={() => edit(item)}><Pencil size={14} />编辑</button><button className={styles.textButton} type="button" onClick={() => void togglePublished(item)}>{item.published ? '隐藏' : '发布'}</button><button className={styles.dangerButton} type="button" onClick={() => setPendingDelete(item)}><Trash2 size={14} />删除</button></div></article>)}</div>
      )}
      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除资源链接" description={pendingDelete ? `确定删除“${pendingDelete.title}”吗？` : ''} confirming={removing} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

export default function AdminResourcesPage(): React.ReactElement {
  return <AdminPage active="resources" title="外部资源链接" description="外部资料地址的管理入口。"><ResourceManager /></AdminPage>;
}
