import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {Check, ImagePlus, Pencil, Save, Trash2, X} from 'lucide-react';
import {
  getFileById,
  getPageSection,
  savePageSection,
  type PageSectionRecord,
} from '../../lib/adminApi';
import {
  deleteAdminFile,
  getAdminFilePublicUrl,
  uploadAdminFile,
} from '../../lib/adminStorage';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {useSiteAdminAccess} from '../../lib/useSiteAdminAccess';
import styles from './managedPageSection.module.css';

export interface ManagedPageContent {
  title: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface ManagedPageSectionProps {
  pageKey: string;
  sectionKey: string;
  label: string;
  fallback: ManagedPageContent;
  children: (content: ManagedPageContent) => React.ReactNode;
}

export default function ManagedPageSection(props: ManagedPageSectionProps): React.ReactElement {
  return (
    <BrowserOnly fallback={<>{props.children(props.fallback)}</>}>
      {() => <ManagedPageSectionClient {...props} />}
    </BrowserOnly>
  );
}

function ManagedPageSectionClient({
  pageKey,
  sectionKey,
  label,
  fallback,
  children,
}: ManagedPageSectionProps): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const {isAdmin} = useSiteAdminAccess();
  const [record, setRecord] = React.useState<PageSectionRecord | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [title, setTitle] = React.useState(fallback.title);
  const [content, setContent] = React.useState(fallback.content);
  const [imageAlt, setImageAlt] = React.useState(fallback.imageAlt ?? '');
  const [published, setPublished] = React.useState(true);
  const [pendingImage, setPendingImage] = React.useState<File | null>(null);
  const [removeImage, setRemoveImage] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    try {
      setRecord(await getPageSection(client, pageKey, sectionKey));
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    }
  }, [client, config, pageKey, sectionKey]);

  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const storedImagePath = readConfigString(record?.config, 'imagePath');
  const storedImageAlt = readConfigString(record?.config, 'imageAlt');
  const imageUrl = storedImagePath ? getAdminFilePublicUrl(client, storedImagePath) : fallback.imageUrl;
  const value: ManagedPageContent = {
    title: record?.visible === false ? fallback.title : record?.title ?? fallback.title,
    content: record?.visible === false ? fallback.content : record?.content ?? fallback.content,
    imageUrl: record?.visible === false ? fallback.imageUrl : imageUrl,
    imageAlt: record?.visible === false ? fallback.imageAlt : storedImageAlt ?? fallback.imageAlt,
  };

  const openEditor = (): void => {
    setTitle(record?.title ?? fallback.title);
    setContent(record?.content ?? fallback.content);
    setImageAlt(storedImageAlt ?? fallback.imageAlt ?? '');
    setPublished(record?.published ?? true);
    setPendingImage(null);
    setRemoveImage(false);
    setProgress(0);
    setMessage(null);
    setEditorOpen(true);
  };

  const chooseImage = (file?: File): void => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({kind: 'error', text: '请选择 PNG、JPG、WEBP、GIF 或 SVG 图片。'});
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingImage(file);
    setRemoveImage(false);
    setMessage(null);
  };

  const save = async (): Promise<void> => {
    if (saving) return;
    if (!title.trim()) {
      setMessage({kind: 'error', text: '标题不能为空。'});
      return;
    }
    setSaving(true);
    setProgress(0);
    setMessage(null);
    let working = record;
    let uploadedFileId: string | null = null;
    let uploadedPath: string | null = null;
    const oldFileId = readConfigString(record?.config, 'imageFileId');

    try {
      if (pendingImage && !working) {
        working = await savePageSection(client, {
          id: '', page_key: pageKey, section_key: sectionKey,
          title: title.trim(), content, config: {}, sort_order: 0,
          visible: true, published: false,
        });
      }

      if (pendingImage && working) {
        const file = await uploadAdminFile({
          client,
          config,
          file: pendingImage,
          relatedType: 'page-section-image',
          relatedId: working.id,
          description: `${pageKey}/${sectionKey} 页面图片`,
          storagePathPrefix: `pages/${pageKey}/${sectionKey}`,
          published: true,
          onProgress: setProgress,
        });
        uploadedFileId = file.id;
        uploadedPath = file.storage_path;
      }

      const nextConfig: Record<string, unknown> = {...(working?.config ?? record?.config ?? {})};
      if (removeImage) {
        delete nextConfig.imagePath;
        delete nextConfig.imageFileId;
        delete nextConfig.imageAlt;
      } else {
        if (uploadedPath) nextConfig.imagePath = uploadedPath;
        if (uploadedFileId) nextConfig.imageFileId = uploadedFileId;
        nextConfig.imageAlt = imageAlt.trim();
      }

      const updated = await savePageSection(client, {
        id: working?.id ?? record?.id ?? '',
        page_key: pageKey,
        section_key: sectionKey,
        title: title.trim(),
        content,
        config: nextConfig,
        sort_order: working?.sort_order ?? record?.sort_order ?? 0,
        visible: true,
        published,
      });
      setRecord(updated);

      if (oldFileId && (removeImage || uploadedFileId)) {
        const oldFile = await getFileById(client, oldFileId);
        if (oldFile) await deleteAdminFile(client, oldFile);
      }

      setPendingImage(null);
      setRemoveImage(false);
      setMessage({kind: 'success', text: published ? '页面内容已保存并发布。' : '页面内容已保存为草稿。'});
      window.setTimeout(() => setEditorOpen(false), 650);
    } catch (error) {
      if (uploadedFileId) {
        const orphan = await getFileById(client, uploadedFileId).catch(() => null);
        if (orphan) await deleteAdminFile(client, orphan).catch(() => undefined);
      }
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {children(value)}
      {isAdmin ? <button type="button" className={styles.editTrigger} onClick={openEditor}><Pencil size={15} />编辑{label}</button> : null}
      {editorOpen ? (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditorOpen(false); }}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={`编辑${label}`}>
            <header><div><span>ADMIN · LIVE CONTENT</span><h2>编辑{label}</h2></div><button type="button" onClick={() => setEditorOpen(false)} disabled={saving} aria-label="关闭"><X size={18} /></button></header>
            <div className={styles.form}>
              <label><span>标题</span><input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} /></label>
              <label><span>正文</span><textarea value={content} rows={6} onChange={(event) => setContent(event.target.value)} /></label>
              <div className={styles.imageField}>
                <div className={styles.preview}>{removeImage ? <span>保存后恢复代码默认图片</span> : <img src={previewUrl ?? imageUrl} alt="页面图片预览" />}</div>
                <div><label className={styles.fileButton}><ImagePlus size={15} />选择替换图片<input hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" disabled={saving} onChange={(event) => chooseImage(event.target.files?.[0])} /></label><button type="button" className={styles.removeButton} disabled={saving || (!storedImagePath && !pendingImage)} onClick={() => { setPendingImage(null); setRemoveImage(true); setPreviewUrl(null); }}><Trash2 size={14} />恢复默认图片</button></div>
              </div>
              <label><span>图片替代文字</span><input value={imageAlt} maxLength={180} onChange={(event) => setImageAlt(event.target.value)} /></label>
              <label className={styles.publishToggle}><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /><Check size={14} /><span>保存后立即发布</span></label>
              {saving && pendingImage ? <div className={styles.progress}><span>图片上传 {progress}%</span><i><b style={{width: `${progress}%`}} /></i></div> : null}
              {message ? <p className={styles.message} data-kind={message.kind}>{message.text}</p> : null}
            </div>
            <footer><button type="button" onClick={() => setEditorOpen(false)} disabled={saving}>取消</button><button type="button" className={styles.saveButton} onClick={() => void save()} disabled={saving}><Save size={15} />{saving ? '保存中...' : '保存内容'}</button></footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

function readConfigString(config: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = config?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
