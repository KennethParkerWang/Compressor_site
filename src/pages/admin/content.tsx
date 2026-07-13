import React from 'react';
import {Pencil, Plus, RefreshCw, Trash2} from 'lucide-react';
import AdminPage from '../../components/admin/AdminPage';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import styles from '../../components/admin/adminCrud.module.css';
import {
  deletePageSection,
  listPageSections,
  savePageSection,
  updatePageSection,
  type PageSectionRecord,
} from '../../lib/adminApi';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';

const EMPTY_FORM = {
  pageKey: '',
  sectionKey: '',
  title: '',
  content: '',
  sortOrder: 0,
  visible: true,
  published: false,
};

function ContentManager(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const submittingRef = React.useRef(false);
  const [items, setItems] = React.useState<PageSectionRecord[]>([]);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<PageSectionRecord | null>(null);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setItems(await listPageSections(client));
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setLoading(false);
    }
  }, [client, config]);

  React.useEffect(() => { void load(); }, [load]);

  const resetForm = (): void => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const edit = (item: PageSectionRecord): void => {
    setEditingId(item.id);
    setForm({
      pageKey: item.page_key,
      sectionKey: item.section_key,
      title: item.title,
      content: item.content,
      sortOrder: item.sort_order,
      visible: item.visible,
      published: item.published,
    });
    setShowForm(true);
    setMessage(null);
  };

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!form.pageKey.trim() || !form.sectionKey.trim() || !form.title.trim()) {
      setMessage({kind: 'error', text: '页面标识、板块标识和标题均为必填项。'});
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setMessage(null);
    try {
      await savePageSection(client, {
        id: editingId ?? '',
        page_key: form.pageKey.trim(),
        section_key: form.sectionKey.trim(),
        title: form.title.trim(),
        content: form.content,
        config: {},
        sort_order: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
        visible: form.visible,
        published: form.published,
      });
      setMessage({kind: 'success', text: editingId ? '板块已更新。' : '板块已创建。'});
      resetForm();
      await load();
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const toggle = async (item: PageSectionRecord, field: 'visible' | 'published'): Promise<void> => {
    setMessage(null);
    try {
      await updatePageSection(client, item.id, {[field]: !item[field]});
      await load();
      setMessage({kind: 'success', text: field === 'visible'
        ? (item.visible ? '板块已隐藏。' : '板块已显示。')
        : (item.published ? '板块已转为草稿。' : '板块已发布。')});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    }
  };

  const remove = async (): Promise<void> => {
    if (!pendingDelete || removing) return;
    setRemoving(true);
    setMessage(null);
    try {
      await deletePageSection(client, pendingDelete.id);
      setMessage({kind: 'success', text: '板块已删除。'});
      setPendingDelete(null);
      await load();
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className={styles.toolbar}>
        <div><h2>内容板块</h2><p>按页面标识与板块标识维护内容记录。</p></div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} />刷新</button>
          <button className={styles.button} type="button" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} />新建板块</button>
        </div>
      </div>
      {message ? <p className={styles.notice} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}
      {showForm ? (
        <section className={styles.formPanel}>
          <header className={styles.formHeader}><h2>{editingId ? '编辑板块' : '新建板块'}</h2><button className={styles.textButton} type="button" onClick={resetForm}>取消</button></header>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label htmlFor="page-key">页面标识</label><input id="page-key" required value={form.pageKey} onChange={(e) => setForm({...form, pageKey: e.target.value})} placeholder="例如 home" /></div>
              <div className={styles.field}><label htmlFor="section-key">板块标识</label><input id="section-key" required value={form.sectionKey} onChange={(e) => setForm({...form, sectionKey: e.target.value})} placeholder="例如 overview" /></div>
              <div className={styles.wideField}><label htmlFor="section-title">标题</label><input id="section-title" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
              <div className={styles.wideField}><label htmlFor="section-content">正文</label><textarea id="section-content" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} /></div>
              <div className={styles.field}><label htmlFor="sort-order">排序值</label><input id="sort-order" type="number" value={form.sortOrder} onChange={(e) => setForm({...form, sortOrder: Number(e.target.value)})} /></div>
            </div>
            <div className={styles.checkRow}>
              <label><input type="checkbox" checked={form.visible} onChange={(e) => setForm({...form, visible: e.target.checked})} />显示</label>
              <label><input type="checkbox" checked={form.published} onChange={(e) => setForm({...form, published: e.target.checked})} />发布</label>
            </div>
            <div className={styles.actions}><button className={styles.button} type="submit" disabled={submitting}>{submitting ? '正在保存...' : '保存板块'}</button></div>
          </form>
        </section>
      ) : null}
      {loading ? <div className={styles.loading}>正在加载内容板块...</div> : items.length === 0 ? (
        <div className={styles.empty}><strong>尚无内容板块</strong><span>执行 SQL 并创建第一条记录后，内容会显示在这里。</span></div>
      ) : (
        <div className={styles.list}>{items.map((item) => (
          <article className={styles.listItem} key={item.id}>
            <div className={styles.itemTitle}><h3>{item.title}</h3><p>{item.page_key} / {item.section_key}</p><div className={styles.meta}><span className={styles.badge}>排序 {item.sort_order}</span><span className={styles.badge} data-positive={item.visible}>{item.visible ? '显示' : '隐藏'}</span><span className={styles.badge} data-positive={item.published}>{item.published ? '已发布' : '草稿'}</span></div></div>
            <div className={styles.rowActions}><button className={styles.textButton} type="button" onClick={() => edit(item)}><Pencil size={14} />编辑</button><button className={styles.textButton} type="button" onClick={() => void toggle(item, 'visible')}>{item.visible ? '隐藏' : '显示'}</button><button className={styles.textButton} type="button" onClick={() => void toggle(item, 'published')}>{item.published ? '转为草稿' : '发布'}</button><button className={styles.dangerButton} type="button" onClick={() => setPendingDelete(item)}><Trash2 size={14} />删除</button></div>
          </article>
        ))}</div>
      )}
      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除内容板块" description={pendingDelete ? `确定删除“${pendingDelete.title}”吗？此操作不可撤销。` : ''} confirming={removing} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

export default function AdminContentPage(): React.ReactElement {
  return <AdminPage active="content" title="页面内容管理" description="公开页面内容的管理入口。"><ContentManager /></AdminPage>;
}
