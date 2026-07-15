import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {Archive, Download, Eye, FilePlus2, FolderOpen, RefreshCw, Trash2, UploadCloud} from 'lucide-react';
import AdminConfirmDialog from '../admin/AdminConfirmDialog';
import {listFilesByContext, type FileRecord} from '../../lib/adminApi';
import {ALLOWED_ADMIN_FILE_TYPES, deleteAdminFile, formatFileSize, getAdminFilePublicUrl, uploadAdminFile} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {useSiteAdminAccess} from '../../lib/useSiteAdminAccess';
import type {WeeklyReportItem, WeeklyReportPresenter} from '../../data/weeklyReports';
import {
  parseWeeklyReportArchiveMetadata,
  weeklyReportPresenterId,
  type WeeklyReportArchiveMetadata,
  type WeeklyReportAssetKind,
} from '../../lib/weeklyReportArchive';
import styles from './WeeklyReportAssetManager.module.css';

type Lang = 'zh' | 'en';
type AssetKind = WeeklyReportAssetKind;

interface PresenterOption extends WeeklyReportPresenter {
  id: string;
  path: string;
}

const ASSET_KINDS: Record<AssetKind, {zh: string; en: string; accept: string; mimeTypes: readonly string[]}> = {
  slides: {
    zh: '汇报 PPT', en: 'Presentation slides', accept: '.ppt,.pptx',
    mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  },
  report: {zh: '报告 PDF', en: 'Report PDF', accept: '.pdf', mimeTypes: ['application/pdf']},
  minutes: {
    zh: '会议记录', en: 'Meeting notes', accept: '.doc,.docx,.txt,.md,.pdf',
    mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/pdf'],
  },
  image: {zh: '封面或图片', en: 'Cover or image', accept: '.jpg,.jpeg,.png,.webp,.gif', mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']},
  other: {zh: '其他附件', en: 'Other file', accept: '.pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.webp,.gif', mimeTypes: Array.from(ALLOWED_ADMIN_FILE_TYPES)},
};

function presenterId(presenter: WeeklyReportPresenter): string {
  return weeklyReportPresenterId(presenter);
}

function presenterOptions(report: WeeklyReportItem): PresenterOption[] {
  return [
    ...report.expectedPresenters.map((presenter) => ({...presenter, id: presenterId(presenter), path: presenterId(presenter)})),
    {id: 'shared', path: 'shared', presenterZh: '本期公共资料', presenterEn: 'Shared briefing files'},
  ];
}

function defaultPresenterId(report: WeeklyReportItem): string {
  const pending = report.expectedPresenters.find((presenter) => !report.submissions.some((item) => item.presenterZh === presenter.presenterZh));
  return pending ? presenterId(pending) : 'shared';
}

function AssetManagerClient({report, lang, onFilesChange}: {report: WeeklyReportItem; lang: Lang; onFilesChange?: (files: FileRecord[]) => void}): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const {isAdmin, loading: accessLoading} = useSiteAdminAccess();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadingRef = React.useRef(false);
  const loadRequestRef = React.useRef(0);
  const options = React.useMemo(() => presenterOptions(report), [report]);
  const [selectedPresenterId, setSelectedPresenterId] = React.useState(() => defaultPresenterId(report));
  const [assetKind, setAssetKind] = React.useState<AssetKind>('slides');
  const [files, setFiles] = React.useState<FileRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [pendingDelete, setPendingDelete] = React.useState<FileRecord | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  React.useEffect(() => {
    setSelectedPresenterId(defaultPresenterId(report));
    setAssetKind('slides');
  }, [report]);

  const load = React.useCallback(async (): Promise<void> => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    try {
      const nextFiles = await listFilesByContext(client, 'weekly-report', report.id);
      if (requestId !== loadRequestRef.current) return;
      setFiles(nextFiles);
      onFilesChange?.(nextFiles);
    } catch (error) {
      if (requestId === loadRequestRef.current) {
        setMessage({kind: 'error', text: safeSupabaseError(error, config)});
      }
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [client, config, onFilesChange, report.id]);

  React.useEffect(() => { void load(); }, [isAdmin, load]);

  const selectedPresenter = options.find((option) => option.id === selectedPresenterId) ?? options[0];
  const kind = ASSET_KINDS[assetKind];
  const displayPresenter = lang === 'zh' ? selectedPresenter.presenterZh : selectedPresenter.presenterEn;
  const displayKind = lang === 'zh' ? kind.zh : kind.en;
  const destination = `site-assets / weekly-reports / ${report.id} / ${selectedPresenter.path} / ${assetKind}`;

  const upload = async (selected: File[]): Promise<void> => {
    if (!isAdmin || uploadingRef.current || selected.length === 0) return;
    const allowed = new Set(kind.mimeTypes);
    const invalid = selected.find((file) => !allowed.has(file.type));
    if (invalid) {
      setMessage({kind: 'error', text: `“${invalid.name}”不符合“${displayKind}”的文件类型。`});
      return;
    }

    uploadingRef.current = true;
    setUploading(true);
    setMessage(null);
    let completed = 0;
    try {
      for (const file of selected) {
        setProgress(0);
        const metadata: WeeklyReportArchiveMetadata = {
          version: 1,
          reportId: report.id,
          presenterId: selectedPresenter.id,
          presenterZh: selectedPresenter.presenterZh,
          presenterEn: selectedPresenter.presenterEn,
          assetKind,
        };
        await uploadAdminFile({
          client,
          config,
          file,
          relatedType: `weekly-report:${report.id}`,
          description: JSON.stringify(metadata),
          storagePathPrefix: `weekly-reports/${report.id}/${selectedPresenter.path}/${assetKind}`,
          published: true,
          onProgress: setProgress,
        });
        completed += 1;
      }
      await load();
      setMessage({kind: 'success', text: `${completed} 个文件已归档到“${displayPresenter} / ${displayKind}”。`});
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
    <section className={styles.manager}>
      <header className={styles.header}>
        <div><span>REPORT ARCHIVE</span><h4>{lang === 'zh' ? '归档附件' : 'Archived attachments'}</h4></div>
        <button type="button" onClick={() => void load()} disabled={loading} title="刷新附件" aria-label="刷新附件"><RefreshCw size={15} /></button>
      </header>

      {!accessLoading && isAdmin ? (
        <div className={styles.uploadArea}>
          <div className={styles.destination}><FolderOpen size={17} /><div><span>{lang === 'zh' ? '上传后存放位置' : 'Upload destination'}</span><code>{destination}</code></div></div>
          <div className={styles.fields}>
            <label><span>{lang === 'zh' ? '汇报期' : 'Briefing'}</span><input value={`WR-${String(report.no).padStart(2, '0')} · ${report.date}`} readOnly /></label>
            <label><span>{lang === 'zh' ? '归属人' : 'Presenter'}</span><select value={selectedPresenterId} onChange={(event) => setSelectedPresenterId(event.target.value)}>{options.map((option) => <option key={option.id} value={option.id}>{lang === 'zh' ? option.presenterZh : option.presenterEn}</option>)}</select></label>
            <label><span>{lang === 'zh' ? '材料类型' : 'File category'}</span><select value={assetKind} onChange={(event) => setAssetKind(event.target.value as AssetKind)}>{(Object.keys(ASSET_KINDS) as AssetKind[]).map((key) => <option key={key} value={key}>{lang === 'zh' ? ASSET_KINDS[key].zh : ASSET_KINDS[key].en}</option>)}</select></label>
            <label className={styles.uploadButton} data-uploading={uploading}><UploadCloud size={17} /><span>{uploading ? `上传中 ${progress}%` : (lang === 'zh' ? '选择并上传' : 'Choose and upload')}</span><input ref={inputRef} type="file" accept={kind.accept} multiple disabled={uploading} onChange={(event) => void upload(Array.from(event.target.files ?? []))} />{uploading ? <i style={{width: `${progress}%`}} /> : null}</label>
          </div>
        </div>
      ) : null}

      {message ? <p className={styles.message} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}

      {loading ? <div className={styles.state}>正在加载归档附件...</div> : files.length === 0 ? (
        <div className={styles.state}><FilePlus2 size={20} /><span>{lang === 'zh' ? '本期暂无数据库归档附件' : 'No archived database files for this briefing'}</span></div>
      ) : (
        <div className={styles.list}>{files.map((file) => {
          const metadata = parseWeeklyReportArchiveMetadata(file);
          const presenter = metadata ? (lang === 'zh' ? metadata.presenterZh : metadata.presenterEn) : (lang === 'zh' ? '未指定归属人' : 'Unassigned');
          const fileKind = metadata ? (lang === 'zh' ? ASSET_KINDS[metadata.assetKind].zh : ASSET_KINDS[metadata.assetKind].en) : (lang === 'zh' ? '旧版附件' : 'Legacy attachment');
          const publicUrl = getAdminFilePublicUrl(client, file.storage_path);
          return (
            <article className={styles.file} key={file.id}>
              <span className={styles.fileIcon}><Archive size={16} /></span>
              <div><strong>{presenter} · {fileKind}</strong><span>{file.name} · {formatFileSize(file.file_size)} · {new Date(file.created_at).toLocaleDateString()}</span><code>{file.storage_path}</code></div>
              <div className={styles.actions}><a href={publicUrl} target="_blank" rel="noreferrer" title="查看"><Eye size={15} /></a><button type="button" onClick={() => void download(file)} title="下载"><Download size={15} /></button>{isAdmin ? <button type="button" onClick={() => setPendingDelete(file)} title="删除"><Trash2 size={15} /></button> : null}</div>
            </article>
          );
        })}</div>
      )}

      <AdminConfirmDialog open={Boolean(pendingDelete)} title="删除汇报附件" description={pendingDelete ? `确定删除“${pendingDelete.name}”吗？Storage 对象和文件记录都会被删除。` : ''} confirming={deleting} onCancel={() => setPendingDelete(null)} onConfirm={() => void remove()} />
    </section>
  );
}

export default function WeeklyReportAssetManager({report, lang, onFilesChange}: {report: WeeklyReportItem; lang: Lang; onFilesChange?: (files: FileRecord[]) => void}): React.ReactElement {
  return <BrowserOnly fallback={<section className={styles.manager}><div className={styles.state}>正在加载归档附件...</div></section>}>{() => <AssetManagerClient report={report} lang={lang} onFilesChange={onFilesChange} />}</BrowserOnly>;
}
