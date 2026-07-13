import React from 'react';
import {Copy, Download, FileUp, RefreshCw, Trash2} from 'lucide-react';
import AdminPage from '../../components/admin/AdminPage';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import styles from '../../components/admin/adminCrud.module.css';
import {listFiles, type FileRecord} from '../../lib/adminApi';
import {
  deleteAdminFile,
  formatFileSize,
  getAdminFilePublicUrl,
  uploadAdminFile,
} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';

function FileManager(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadingRef = React.useRef(false);
  const [files, setFiles] = React.useState<FileRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<FileRecord | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentName, setCurrentName] = React.useState('');
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setFiles(await listFiles(client));
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setLoading(false);
    }
  }, [client, config]);

  React.useEffect(() => { void load(); }, [load]);

  const upload = async (selected: File[]): Promise<void> => {
    if (uploadingRef.current || selected.length === 0) return;
    uploadingRef.current = true;
    setUploading(true);
    setMessage(null);
    let completed = 0;
    try {
      for (const file of selected) {
        setCurrentName(file.name);
        setProgress(0);
        await uploadAdminFile({
          client,
          config,
          file,
          published,
          onProgress: setProgress,
        });
        completed += 1;
      }
      await load();
      setMessage({kind: 'success', text: `${completed} 个文件上传成功。`});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      setCurrentName('');
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (): Promise<void> => {
    if (!pendingDelete || removing) return;
    setRemoving(true);
    setMessage(null);
    try {
      await deleteAdminFile(client, pendingDelete);
      await load();
      setMessage({kind: 'success', text: '文件已删除。'});
      setPendingDelete(null);
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setRemoving(false);
    }
  };

  const copyUrl = async (file: FileRecord): Promise<void> => {
    try {
      await navigator.clipboard.writeText(getAdminFilePublicUrl(client, file.storage_path));
      setMessage({kind: 'success', text: '公开文件地址已复制。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    }
  };

  const download = (file: FileRecord): void => {
    window.open(getAdminFilePublicUrl(client, file.storage_path), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className={styles.toolbar}>
        <div><h2>站点文件</h2><p>支持 PDF、PPT、Word、图片和文本文件，单文件最大 25MB。</p></div>
        <button className={styles.secondaryButton} type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} />刷新</button>
      </div>
      {message ? <p className={styles.notice} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}
      <section className={styles.formPanel}>
        <div className={styles.form}>
          <label
            className={styles.dropZone}
            data-dragging={dragging}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(Array.from(event.dataTransfer.files)); }}
          >
            <FileUp size={28} />
            <strong>{uploading ? `正在上传：${currentName}` : '拖拽文件到此处，或点击选择'}</strong>
            <span>允许 PDF / PPT / PPTX / DOC / DOCX / 图片 / TXT / Markdown</span>
            <input ref={inputRef} type="file" multiple disabled={uploading} onChange={(event) => void upload(Array.from(event.target.files ?? []))} accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.svg,.txt,.md" />
          </label>
          <div className={styles.checkRow}><label><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} disabled={uploading} />公开文件记录</label></div>
          {uploading ? <div><div className={styles.progressTrack}><span style={{width: `${progress}%`}} /></div><p>{progress}%</p></div> : null}
        </div>
      </section>
      {loading ? <div className={styles.loading}>正在加载文件列表...</div> : files.length === 0 ? (
        <div className={styles.empty}><strong>尚无文件</strong><span>上传成功后，文件记录会显示在这里。</span></div>
      ) : (
        <div className={styles.list}>{files.map((file) => (
          <article className={styles.listItem} key={file.id}>
            <div className={styles.itemTitle}><h3>{file.name}</h3><p>{file.storage_path}</p><div className={styles.meta}><span className={styles.badge}>{file.file_type}</span><span className={styles.badge}>{formatFileSize(file.file_size)}</span><span className={styles.badge}>{new Date(file.created_at).toLocaleString()}</span><span className={styles.badge} data-positive={file.published}>{file.published ? '公开记录' : '未发布'}</span></div></div>
            <div className={styles.rowActions}><button className={styles.textButton} type="button" onClick={() => void copyUrl(file)}><Copy size={14} />复制地址</button><button className={styles.textButton} type="button" onClick={() => download(file)}><Download size={14} />下载</button><button className={styles.dangerButton} type="button" onClick={() => setPendingDelete(file)}><Trash2 size={14} />删除</button></div>
          </article>
        ))}</div>
      )}
      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除文件" description={pendingDelete ? `确定删除“${pendingDelete.name}”吗？Storage 对象和 files 表记录都会被删除。` : ''} confirming={removing} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

export default function AdminFilesPage(): React.ReactElement {
  return <AdminPage active="files" title="文件管理" description="文件条目与 Storage 对象的管理入口。"><FileManager /></AdminPage>;
}
