import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {FileCheck2, UploadCloud} from 'lucide-react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {checkAdminAccess, type FileRecord} from '../../lib/adminApi';
import {getAdminFilePublicUrl, uploadAdminFile} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import styles from './PaperPdfControl.module.css';

let paperFilesCache: FileRecord[] | null = null;
let paperFilesRequest: Promise<FileRecord[]> | null = null;
let adminAccessRequest: Promise<boolean> | null = null;

async function loadPaperFiles(client: SupabaseClient): Promise<FileRecord[]> {
  if (paperFilesCache) return paperFilesCache;
  if (!paperFilesRequest) {
    paperFilesRequest = client
      .from('files')
      .select('*')
      .like('related_type', 'paper-pdf:%')
      .eq('published', true)
      .order('created_at', {ascending: false})
      .then(({data, error}) => {
        if (error) throw error;
        paperFilesCache = (data ?? []) as FileRecord[];
        return paperFilesCache;
      })
      .finally(() => { paperFilesRequest = null; });
  }
  return paperFilesRequest;
}

function addPaperFileToCache(file: FileRecord): void {
  paperFilesCache = [file, ...(paperFilesCache ?? []).filter((item) => item.id !== file.id)];
}

async function loadAdminAccess(client: SupabaseClient): Promise<boolean> {
  if (!adminAccessRequest) {
    adminAccessRequest = client.auth.getSession()
      .then(async ({data, error}) => {
        if (error) throw error;
        return data.session ? checkAdminAccess(client, data.session.user.id) : false;
      })
      .finally(() => { adminAccessRequest = null; });
  }
  return adminAccessRequest;
}

function PaperPdfControlClient({paperId, paperTitle}: {paperId: string; paperTitle: string}): React.ReactElement | null {
  const {client, config} = useSupabaseBrowserClient();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadingRef = React.useRef(false);
  const [files, setFiles] = React.useState<FileRecord[]>([]);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [accessLoading, setAccessLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    void loadPaperFiles(client)
      .then((records) => {
        if (active) setFiles(records.filter((file) => file.related_type === `paper-pdf:${paperId}`));
      })
      .catch((loadError) => {
        if (active) setError(safeSupabaseError(loadError, config));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client, config, paperId]);

  React.useEffect(() => {
    let active = true;
    void loadAdminAccess(client)
      .then((allowed) => { if (active) setIsAdmin(allowed); })
      .catch((accessError) => { if (active) setError(safeSupabaseError(accessError, config)); })
      .finally(() => { if (active) setAccessLoading(false); });
    return () => { active = false; };
  }, [client, config]);

  const upload = async (file?: File): Promise<void> => {
    if (!file || !isAdmin || uploadingRef.current) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('这里只能上传 PDF 论文。');
      return;
    }

    uploadingRef.current = true;
    setProgress(0);
    setError('');
    try {
      const record = await uploadAdminFile({
        client,
        config,
        file,
        relatedType: `paper-pdf:${paperId}`,
        storagePathPrefix: `papers/${paperId}`,
        description: JSON.stringify({paperId, paperTitle}),
        published: true,
        onProgress: setProgress,
      });
      addPaperFileToCache(record);
      setFiles((current) => [record, ...current]);
    } catch (uploadError) {
      setError(safeSupabaseError(uploadError, config));
    } finally {
      uploadingRef.current = false;
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const latestFile = files[0];
  if (loading && accessLoading) return null;
  if (!latestFile && !isAdmin && !error) return null;

  return (
    <span className={styles.control} title={error || undefined}>
      {latestFile ? (
        <a
          href={getAdminFilePublicUrl(client, latestFile.storage_path)}
          target="_blank"
          rel="noreferrer"
          title={`查看 ${paperTitle} 的 PDF${files.length > 1 ? `（共 ${files.length} 个版本）` : ''}`}
          aria-label={`查看 ${paperTitle} 的 PDF`}
        >
          <FileCheck2 size={13} />PDF{files.length > 1 ? ` · ${files.length}` : ''}
        </a>
      ) : null}
      {!accessLoading && isAdmin ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadingRef.current}
          title={`${latestFile ? '追加' : '上传'}论文 PDF，最大 25MB`}
          aria-label={`${latestFile ? '追加' : '上传'} ${paperTitle} 的论文 PDF`}
        >
          <UploadCloud size={13} />{progress > 0 ? `${progress}%` : latestFile ? '追加' : '上传PDF'}
        </button>
      ) : null}
      <input ref={inputRef} hidden type="file" accept=".pdf,application/pdf" onChange={(event) => void upload(event.target.files?.[0])} />
      {error ? <i aria-label={error}>!</i> : null}
    </span>
  );
}

export default function PaperPdfControl(props: {paperId: string; paperTitle: string}): React.ReactElement {
  return (
    <BrowserOnly fallback={<span />}>
      {() => <PaperPdfControlClient {...props} />}
    </BrowserOnly>
  );
}
