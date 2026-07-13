import React from 'react';
import {Download, Eye, FileText, HardDrive, Trash2, UploadCloud} from 'lucide-react';
import {addLocalPapers, deleteLocalPaper, getLocalPapers, type LocalPaperRecord} from '../../lib/localPaperLibrary';
import styles from './LocalPaperShelf.module.css';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function LocalPaperShelf(): React.ReactElement {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [papers, setPapers] = React.useState<LocalPaperRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);

  const load = React.useCallback(async (): Promise<void> => {
    setPapers(await getLocalPapers());
    setLoading(false);
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const add = async (files: File[]): Promise<void> => {
    if (busy || files.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const added = await addLocalPapers(files);
      await load();
      setMessage({kind: 'success', text: `已将 ${added.length} 篇 PDF 保存到当前浏览器。`});
    } catch (error) {
      setMessage({kind: 'error', text: error instanceof Error ? error.message : '本地论文保存失败。'});
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openBlob = (paper: LocalPaperRecord, download: boolean): void => {
    const url = URL.createObjectURL(paper.blob);
    const link = document.createElement('a');
    link.href = url;
    if (download) link.download = paper.name;
    else {
      link.target = '_blank';
      link.rel = 'noreferrer';
    }
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const remove = async (paper: LocalPaperRecord): Promise<void> => {
    if (!window.confirm(`确定从当前浏览器删除“${paper.name}”吗？`)) return;
    setBusy(true);
    try {
      await deleteLocalPaper(paper.id);
      await load();
      setMessage({kind: 'success', text: '本地论文已删除。'});
    } catch (error) {
      setMessage({kind: 'error', text: error instanceof Error ? error.message : '本地论文删除失败。'});
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.shelf}>
      <div className={styles.shelfHead}>
        <div className={styles.identity}><HardDrive size={19} /><div><strong>本地论文资料架</strong><span>仅保存在当前浏览器，不上传服务器</span></div></div>
        <button type="button" className={styles.uploadButton} disabled={busy} onClick={() => inputRef.current?.click()}><UploadCloud size={16} />{busy ? '处理中' : '从本地添加 PDF'}</button>
        <input ref={inputRef} hidden type="file" accept=".pdf,application/pdf" multiple onChange={(event) => void add(Array.from(event.target.files ?? []))} />
      </div>

      <div
        className={styles.dropZone}
        data-dragging={dragging}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void add(Array.from(event.dataTransfer.files)); }}
      >
        {message ? <p className={styles.message} data-kind={message.kind}>{message.text}</p> : null}
        {loading ? <p className={styles.empty}>正在读取本地论文...</p> : papers.length === 0 ? (
          <button type="button" className={styles.empty} onClick={() => inputRef.current?.click()}><FileText size={18} />点击选择或拖入 PDF，之后可直接查看、下载和删除</button>
        ) : (
          <div className={styles.paperList}>
            {papers.map((paper) => (
              <article key={paper.id} className={styles.paperRow}>
                <FileText size={18} />
                <div><strong title={paper.name}>{paper.name}</strong><span>{formatSize(paper.size)} · {new Date(paper.addedAt).toLocaleDateString()}</span></div>
                <div className={styles.paperActions}>
                  <button type="button" title="查看 PDF" aria-label={`查看 ${paper.name}`} onClick={() => openBlob(paper, false)}><Eye size={15} /></button>
                  <button type="button" title="下载 PDF" aria-label={`下载 ${paper.name}`} onClick={() => openBlob(paper, true)}><Download size={15} /></button>
                  <button type="button" title="删除本地 PDF" aria-label={`删除 ${paper.name}`} disabled={busy} onClick={() => void remove(paper)}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
