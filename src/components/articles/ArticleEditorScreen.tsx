import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {ArrowLeft, Eye, ImagePlus, Save, Send, Trash2} from 'lucide-react';
import type {ImageUploadHandler} from '@mdxeditor/editor';
import ArticleMarkdown from './ArticleMarkdown';
import {
  articleAssetUrl,
  cleanupArticleAssets,
  createArticleSlug,
  deleteArticleAsset,
  getArticle,
  saveArticle,
  uploadArticleImage,
  type ArticleStatus,
} from '../../lib/articleApi';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import styles from './articleEditorScreen.module.css';

const MarkdownArticleEditor = React.lazy(() => import('./MarkdownArticleEditor'));

interface ArticleForm {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverPath: string | null;
  bodyMarkdown: string;
  category: string;
  tags: string;
}

function emptyForm(): ArticleForm {
  return {id: crypto.randomUUID(), title: '', slug: '', summary: '', coverPath: null, bodyMarkdown: '', category: '', tags: ''};
}

export default function ArticleEditorScreen({articleId, initialPreview = false}: {articleId?: string; initialPreview?: boolean}): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const editUrl = useBaseUrl('/admin/articles/edit');
  const coverInput = React.useRef<HTMLInputElement | null>(null);
  const submittingRef = React.useRef(false);
  const slugEditedRef = React.useRef(false);
  const [form, setForm] = React.useState<ArticleForm>(() => emptyForm());
  const [loading, setLoading] = React.useState(Boolean(articleId));
  const [mode, setMode] = React.useState<'edit' | 'preview'>(initialPreview ? 'preview' : 'edit');
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  React.useEffect(() => {
    if (!articleId) return;
    let active = true;
    setLoading(true);
    void getArticle(client, articleId).then((article) => {
      if (!active) return;
      if (!article) throw new Error('未找到文章，或当前账号没有读取权限。');
      setForm({id: article.id, title: article.title, slug: article.slug, summary: article.summary, coverPath: article.cover_path, bodyMarkdown: article.body_markdown, category: article.category, tags: article.tags.join(', ')});
      slugEditedRef.current = true;
      setDirty(false);
    }).catch((error) => {
      if (active) setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [articleId, client, config]);

  React.useEffect(() => {
    const warn = (event: BeforeUnloadEvent): void => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]): void => {
    setForm((current) => ({...current, [key]: value}));
    setDirty(true);
  };

  const changeTitle = (title: string): void => {
    setForm((current) => ({...current, title, slug: slugEditedRef.current ? current.slug : createArticleSlug(title)}));
    setDirty(true);
  };

  const imageUploadHandler = React.useCallback<ImageUploadHandler>(async (file) => {
    if (!file) throw new Error('未取得图片文件。');
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);
    try {
      const result = await uploadArticleImage({client, config, articleId: form.id, file, onProgress: setUploadProgress});
      setDirty(true);
      setMessage({kind: 'success', text: '正文图片已上传并插入当前光标位置。'});
      return result.publicUrl;
    } catch (error) {
      const text = safeSupabaseError(error, config);
      setMessage({kind: 'error', text});
      throw new Error(text);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [client, config, form.id]);

  const uploadCover = async (file?: File): Promise<void> => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);
    try {
      const previous = form.coverPath;
      const result = await uploadArticleImage({client, config, articleId: form.id, file, kind: 'cover', onProgress: setUploadProgress});
      update('coverPath', result.path);
      if (previous) await deleteArticleAsset(client, previous);
      setMessage({kind: 'success', text: '封面图片已上传。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (coverInput.current) coverInput.current.value = '';
    }
  };

  const removeCover = async (): Promise<void> => {
    if (!form.coverPath || uploading) return;
    setUploading(true);
    try {
      await deleteArticleAsset(client, form.coverPath);
      update('coverPath', null);
      setMessage({kind: 'success', text: '封面图片已删除。'});
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      setUploading(false);
    }
  };

  const persist = async (status: ArticleStatus): Promise<void> => {
    if (submittingRef.current || uploading) return;
    if (!form.title.trim() || !form.slug.trim()) {
      setMessage({kind: 'error', text: '标题和 slug 为必填项。'});
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      setMessage({kind: 'error', text: '正文不能为空。'});
      return;
    }
    submittingRef.current = true;
    setSaving(true);
    setMessage(null);
    try {
      await saveArticle(client, {
        id: form.id,
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim(),
        cover_path: form.coverPath,
        body_markdown: form.bodyMarkdown,
        category: form.category.trim(),
        tags: form.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
        status,
        published: status === 'published',
      });
      await cleanupArticleAssets(client, form.id, form.bodyMarkdown, form.coverPath);
      setDirty(false);
      setMessage({kind: 'success', text: status === 'published' ? '文章已发布。' : '草稿已保存。'});
      if (!articleId) window.history.replaceState(null, '', `${editUrl}?id=${encodeURIComponent(form.id)}`);
    } catch (error) {
      setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const coverUrl = articleAssetUrl(client, form.coverPath);
  if (loading) return <div className={styles.state}>正在加载文章...</div>;

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <Link to="/admin/articles"><ArrowLeft size={16} />返回文章列表</Link>
        <div className={styles.modeSwitch}><button type="button" data-active={mode === 'edit'} onClick={() => setMode('edit')}>编辑</button><button type="button" data-active={mode === 'preview'} onClick={() => setMode('preview')}><Eye size={14} />预览</button></div>
        <div className={styles.saveActions}><button type="button" onClick={() => void persist('draft')} disabled={saving || uploading}><Save size={15} />{saving ? '保存中...' : '保存草稿'}</button><button type="button" data-primary="true" onClick={() => void persist('published')} disabled={saving || uploading}><Send size={15} />发布</button></div>
      </header>
      {message ? <p className={styles.notice} data-kind={message.kind} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p> : null}
      {uploading ? <div className={styles.uploadState}><span>图片上传中 {uploadProgress}%</span><i><b style={{width: `${uploadProgress}%`}} /></i></div> : null}

      {mode === 'edit' ? (
        <div className={styles.editorLayout}>
          <aside className={styles.metadata}>
            <label><span>标题</span><input value={form.title} onChange={(event) => changeTitle(event.target.value)} /></label>
            <label><span>Slug</span><input value={form.slug} onChange={(event) => { slugEditedRef.current = true; update('slug', createArticleSlug(event.target.value)); }} /></label>
            <label><span>摘要</span><textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} /></label>
            <label><span>分类</span><input value={form.category} onChange={(event) => update('category', event.target.value)} /></label>
            <label><span>标签</span><input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="使用逗号分隔" /></label>
            <div className={styles.coverField}><span>封面图片</span>{coverUrl ? <img src={coverUrl} alt="文章封面预览" /> : <div>暂无封面</div>}<input ref={coverInput} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void uploadCover(event.target.files?.[0])} /><div><button type="button" onClick={() => coverInput.current?.click()} disabled={uploading}><ImagePlus size={14} />{coverUrl ? '更换' : '上传'}</button>{coverUrl ? <button type="button" onClick={() => void removeCover()} disabled={uploading}><Trash2 size={14} />删除</button> : null}</div></div>
          </aside>
          <main className={styles.editorMain}>
            <div className={styles.editorLabel}><span>正文 Markdown</span><em>支持点击、拖拽和粘贴图片</em></div>
            <BrowserOnly fallback={<div className={styles.state}>正在加载正文编辑器...</div>}>
              {() => <React.Suspense fallback={<div className={styles.state}>正在加载正文编辑器...</div>}><MarkdownArticleEditor markdown={form.bodyMarkdown} onChange={(value) => update('bodyMarkdown', value)} imageUploadHandler={imageUploadHandler} onError={(text) => setMessage({kind: 'error', text})} /></React.Suspense>}
            </BrowserOnly>
          </main>
        </div>
      ) : (
        <article className={styles.preview}>
          {coverUrl ? <img className={styles.previewCover} src={coverUrl} alt="" /> : null}
          <span>{form.category || '未分类'}</span><h1>{form.title || '未命名文章'}</h1>{form.summary ? <p>{form.summary}</p> : null}
          <div className={styles.previewTags}>{form.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <ArticleMarkdown markdown={form.bodyMarkdown || '*正文尚未填写*'} />
        </article>
      )}
      {dirty ? <div className={styles.unsaved}>有未保存更改</div> : null}
    </div>
  );
}
