import React from 'react';
import {Download, Pencil, Plus, RefreshCw, Trash2} from 'lucide-react';
import AdminPage from '../../components/admin/AdminPage';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import styles from '../../components/admin/adminCrud.module.css';
import {
  deleteReport,
  listFilesByRelation,
  listReports,
  saveReport,
  type FileRecord,
  type ReportRecord,
} from '../../lib/adminApi';
import {
  deleteAdminFile,
  getAdminFilePublicUrl,
  uploadAdminFile,
} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';

const REPORT_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const COVER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EMPTY_FORM = {title: '', reportDate: '', description: '', published: false};

function ReportManager(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const submittingRef = React.useRef(false);
  const [items, setItems] = React.useState<ReportRecord[]>([]);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [reportFile, setReportFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [editing, setEditing] = React.useState<ReportRecord | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<ReportRecord | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setItems(await listReports(client));
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setLoading(false);
    }
  }, [client, config]);

  React.useEffect(() => { void load(); }, [load]);

  const reset = (): void => {
    setForm(EMPTY_FORM);
    setReportFile(null);
    setCoverFile(null);
    setEditing(null);
    setProgress(0);
    setShowForm(false);
  };

  const edit = (item: ReportRecord): void => {
    setEditing(item);
    setForm({title: item.title, reportDate: item.report_date, description: item.description, published: item.published});
    setReportFile(null);
    setCoverFile(null);
    setShowForm(true);
    setMessage(null);
  };

  const cleanupUploaded = async (uploaded: FileRecord[]): Promise<void> => {
    await Promise.allSettled(uploaded.map((file) => deleteAdminFile(client, file)));
  };

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!form.title.trim() || !form.reportDate) {
      setMessage({kind: 'error', text: '标题和汇报日期为必填项。'});
      return;
    }
    if (!editing && !reportFile && !coverFile) {
      setMessage({kind: 'error', text: '新建汇报必须选择汇报文件或封面图片。'});
      return;
    }
    if (reportFile && !REPORT_MIME_TYPES.has(reportFile.type)) {
      setMessage({kind: 'error', text: '汇报文件仅支持 PPT、PPTX 或 PDF。'});
      return;
    }
    if (coverFile && !COVER_MIME_TYPES.has(coverFile.type)) {
      setMessage({kind: 'error', text: '封面仅支持 JPG、PNG、WebP 或 GIF 图片。'});
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setProgress(0);
    setMessage(null);
    const reportId = editing?.id ?? crypto.randomUUID();
    const uploaded: FileRecord[] = [];
    try {
      let filePath = editing?.file_path ?? null;
      let coverPath = editing?.cover_path ?? null;
      if (reportFile) {
        const uploadedReport = await uploadAdminFile({client, config, file: reportFile, relatedType: 'report', relatedId: reportId, published: form.published, onProgress: setProgress});
        uploaded.push(uploadedReport);
        filePath = uploadedReport.storage_path;
      }
      if (coverFile) {
        const uploadedCover = await uploadAdminFile({client, config, file: coverFile, relatedType: 'report-cover', relatedId: reportId, published: form.published, onProgress: setProgress});
        uploaded.push(uploadedCover);
        coverPath = uploadedCover.storage_path;
      }

      await saveReport(client, {
        id: reportId,
        title: form.title.trim(),
        report_date: form.reportDate,
        description: form.description.trim(),
        file_path: filePath,
        cover_path: coverPath,
        published: form.published,
      });

      if (editing && (reportFile || coverFile)) {
        const oldFiles = await listFilesByRelation(client, 'report', reportId);
        const oldCovers = await listFilesByRelation(client, 'report-cover', reportId);
        const activePaths = new Set([filePath, coverPath]);
        await Promise.allSettled([...oldFiles, ...oldCovers].filter((file) => !activePaths.has(file.storage_path)).map((file) => deleteAdminFile(client, file)));
      }

      await load();
      setMessage({kind: 'success', text: editing ? '汇报已更新。' : '汇报已创建。'});
      reset();
    } catch (error) {
      await cleanupUploaded(uploaded);
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      setProgress(0);
    }
  };

  const togglePublished = async (item: ReportRecord): Promise<void> => {
    setMessage(null);
    try {
      await saveReport(client, {...item, published: !item.published});
      await load();
      setMessage({kind: 'success', text: item.published ? '汇报已隐藏。' : '汇报已发布。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    }
  };

  const remove = async (): Promise<void> => {
    if (!pendingDelete || removing) return;
    setRemoving(true);
    setMessage(null);
    try {
      const [files, covers] = await Promise.all([listFilesByRelation(client, 'report', pendingDelete.id), listFilesByRelation(client, 'report-cover', pendingDelete.id)]);
      for (const file of [...files, ...covers]) await deleteAdminFile(client, file);
      await deleteReport(client, pendingDelete.id);
      await load();
      setMessage({kind: 'success', text: '汇报及关联文件已删除。'});
      setPendingDelete(null);
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setRemoving(false);
    }
  };

  const download = (path: string | null): void => {
    if (!path) return;
    window.open(getAdminFilePublicUrl(client, path), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className={styles.toolbar}><div><h2>汇报资料</h2><p>维护汇报记录、主文件和封面。</p></div><div className={styles.actions}><button className={styles.secondaryButton} type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} />刷新</button><button className={styles.button} type="button" onClick={() => { reset(); setShowForm(true); }}><Plus size={16} />新建汇报</button></div></div>
      {message ? <p className={styles.notice} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}
      {showForm ? (
        <section className={styles.formPanel}>
          <header className={styles.formHeader}><h2>{editing ? '编辑汇报' : '新建汇报'}</h2><button className={styles.textButton} type="button" onClick={reset}>取消</button></header>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.formGrid}>
              <div className={styles.wideField}><label htmlFor="report-title">标题</label><input id="report-title" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
              <div className={styles.field}><label htmlFor="report-date">汇报日期</label><input id="report-date" type="date" required value={form.reportDate} onChange={(e) => setForm({...form, reportDate: e.target.value})} /></div>
              <div className={styles.wideField}><label htmlFor="report-description">简介</label><textarea id="report-description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div className={styles.field}><label htmlFor="report-file">汇报文件（PPT/PPTX/PDF）</label><input id="report-file" type="file" accept=".ppt,.pptx,.pdf" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} /></div>
              <div className={styles.field}><label htmlFor="report-cover">封面图片</label><input id="report-cover" type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} /></div>
            </div>
            <div className={styles.checkRow}><label><input type="checkbox" checked={form.published} onChange={(e) => setForm({...form, published: e.target.checked})} />发布</label></div>
            {submitting && (reportFile || coverFile) ? <div><div className={styles.progressTrack}><span style={{width: `${progress}%`}} /></div><p>上传进度 {progress}%</p></div> : null}
            <div className={styles.actions}><button className={styles.button} type="submit" disabled={submitting}>{submitting ? '正在保存...' : '保存汇报'}</button></div>
          </form>
        </section>
      ) : null}
      {loading ? <div className={styles.loading}>正在加载汇报...</div> : items.length === 0 ? <div className={styles.empty}><strong>尚无汇报资料</strong><span>新建第一条汇报后会显示在这里。</span></div> : (
        <div className={styles.list}>{items.map((item) => <article className={styles.listItem} key={item.id}><div className={styles.itemTitle}><h3>{item.title}</h3><p>{item.description || '未填写简介'}</p><div className={styles.meta}><span className={styles.badge}>{item.report_date}</span><span className={styles.badge} data-positive={item.published}>{item.published ? '已发布' : '隐藏'}</span><span className={styles.badge}>{item.file_path ? '已上传主文件' : '无主文件'}</span><span className={styles.badge}>{item.cover_path ? '已上传封面' : '无封面'}</span></div></div><div className={styles.rowActions}>{item.file_path ? <button className={styles.textButton} type="button" onClick={() => download(item.file_path)}><Download size={14} />下载</button> : null}<button className={styles.textButton} type="button" onClick={() => edit(item)}><Pencil size={14} />编辑</button><button className={styles.textButton} type="button" onClick={() => void togglePublished(item)}>{item.published ? '隐藏' : '发布'}</button><button className={styles.dangerButton} type="button" onClick={() => setPendingDelete(item)}><Trash2 size={14} />删除</button></div></article>)}</div>
      )}
      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除汇报" description={pendingDelete ? `确定删除“${pendingDelete.title}”吗？关联 Storage 文件和 files 表记录也会被删除。` : ''} confirming={removing} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

export default function AdminReportsPage(): React.ReactElement {
  return <AdminPage active="reports" title="汇报资料管理" description="汇报材料与记录的管理入口。"><ReportManager /></AdminPage>;
}
