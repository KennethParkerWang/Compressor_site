import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {Download, Eye, FilePlus2, RefreshCw, Trash2, UploadCloud} from 'lucide-react';
import AdminConfirmDialog from '../admin/AdminConfirmDialog';
import {listFilesByContext, type FileRecord} from '../../lib/adminApi';
import {deleteAdminFile, formatFileSize, getAdminFilePublicUrl, uploadAdminFile} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {useSiteAdminAccess} from '../../lib/useSiteAdminAccess';
import styles from './PublicAssetPanel.module.css';

interface PublicAssetPanelProps {
  title: string;
  description?: string;
  relatedType: string;
  relatedKey: string;
  accept: string;
  allowedMimeTypes: readonly string[];
  compact?: boolean;
  embedded?: boolean;
}

function AssetPanelClient({title, description, relatedType, relatedKey, accept, allowedMimeTypes, compact = false, embedded = false}: PublicAssetPanelProps): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const {isAdmin, loading: accessLoading} = useSiteAdminAccess();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadingRef = React.useRef(false);
  const [files, setFiles] = React.useState<FileRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<FileRecord | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setFiles(await listFilesByContext(client, relatedType, relatedKey));
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setLoading(false);
    }
  }, [client, config, relatedKey, relatedType]);

  React.useEffect(() => { void load(); }, [isAdmin, load]);

  const upload = async (selected: File[]): Promise<void> => {
    if (!isAdmin || uploadingRef.current || selected.length === 0) return;
    const allowed = new Set(allowedMimeTypes);
    const invalid = selected.find((file) => !allowed.has(file.type));
    if (invalid) {
      setMessage({kind: 'error', text: `“${invalid.name}”不是此区域允许的文件类型。`});
      return;
    }

    uploadingRef.current = true;
    setUploading(true);
    setMessage(null);
    let completed = 0;
    try {
      for (const file of selected) {
        setProgress(0);
        await uploadAdminFile({
          client,
          config,
          file,
          relatedType: `${relatedType}:${relatedKey}`,
          published: true,
          onProgress: setProgress,
        });
        completed += 1;
      }
      await load();
      setMessage({kind: 'success', text: `${completed} 个附件上传成功。`});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (): Promise<void> => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setMessage(null);
    try {
      await deleteAdminFile(client, pendingDelete);
      setPendingDelete(null);
      await load();
      setMessage({kind: 'success', text: '附件已从 Storage 和文件记录中删除。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setDeleting(false);
    }
  };

  const download = async (file: FileRecord): Promise<void> => {
    setMessage(null);
    const {data, error} = await client.storage.from('site-assets').download(file.storage_path);
    if (error || !data) {
      setMessage({kind: 'error', text: safeSupabaseError(error ?? new Error('文件下载失败。'), config)});
      return;
    }
    const objectUrl = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <section className={styles.panel} data-compact={compact} data-embedded={embedded}>
      <header className={styles.header}>
        <div><span>FILES</span><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
        <button type="button" onClick={() => void load()} disabled={loading} title="刷新附件" aria-label="刷新附件"><RefreshCw size={15} /></button>
      </header>

      {message ? <p className={styles.message} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}

      {!accessLoading && isAdmin ? (
        <label className={styles.uploadControl}>
          <UploadCloud size={18} />
          <span>{uploading ? `上传中 ${progress}%` : '上传附件'}</span>
          <input ref={inputRef} type="file" accept={accept} multiple disabled={uploading} onChange={(event) => void upload(Array.from(event.target.files ?? []))} />
          {uploading ? <i style={{width: `${progress}%`}} /> : null}
        </label>
      ) : null}

      {loading ? <div className={styles.state}>正在加载附件...</div> : files.length === 0 ? (
        <div className={styles.state}><FilePlus2 size={20} /><span>暂无可查看附件</span></div>
      ) : (
        <div className={styles.list}>{files.map((file) => {
          const publicUrl = getAdminFilePublicUrl(client, file.storage_path);
          return (
            <article className={styles.file} key={file.id}>
              <div><strong>{file.name}</strong><span>{formatFileSize(file.file_size)} · {new Date(file.created_at).toLocaleDateString()}</span></div>
              <div className={styles.actions}>
                <a href={publicUrl} target="_blank" rel="noreferrer" title="查看" aria-label={`查看 ${file.name}`}><Eye size={15} /></a>
                <button type="button" onClick={() => void download(file)} title="下载" aria-label={`下载 ${file.name}`}><Download size={15} /></button>
                {isAdmin ? <button type="button" onClick={() => setPendingDelete(file)} title="删除" aria-label={`删除 ${file.name}`}><Trash2 size={15} /></button> : null}
              </div>
            </article>
          );
        })}</div>
      )}

      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除附件" description={pendingDelete ? `确定删除“${pendingDelete.name}”吗？Storage 对象和文件记录都会被删除。` : ''} confirming={deleting} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </section>
  );
}

export default function PublicAssetPanel(props: PublicAssetPanelProps): React.ReactElement {
  return (
    <BrowserOnly fallback={<section className={styles.panel} data-compact={props.compact} data-embedded={props.embedded}><div className={styles.state}>正在加载附件...</div></section>}>
      {() => <AssetPanelClient {...props} />}
    </BrowserOnly>
  );
}
