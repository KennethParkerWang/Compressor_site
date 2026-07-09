import React, {useMemo, useState} from 'react';
import {Download, ExternalLink, FileJson, FileText, RefreshCw, ShieldCheck, TriangleAlert} from 'lucide-react';
import {Button} from '../ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import type {LiteratureItem} from '../../data/literatureData';
import {
  citationFileName,
  classifyCitationItems,
  enrichCitationByDoi,
  serializeCitations,
  type CitationFormat,
} from '../../utils/citations';
import styles from './CitationExportDialog.module.css';

interface CitationExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly LiteratureItem[];
  title?: string;
}

const FORMAT_LABEL: Record<CitationFormat, string> = {
  gbt7714: 'GB/T 7714 顺序编码',
  ieee: 'IEEE 编号格式',
  apa: 'APA 7th',
  bibtex: 'BibTeX',
  ris: 'RIS',
  csl: 'CSL-JSON',
  markdown: 'Markdown 书目',
};

function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CitationExportDialog({
  open,
  onOpenChange,
  items,
  title = '导出参考文献',
}: CitationExportDialogProps): React.ReactElement {
  const [format, setFormat] = useState<CitationFormat>('gbt7714');
  const [includeNonPapers, setIncludeNonPapers] = useState(false);
  const [includePreprints, setIncludePreprints] = useState(false);
  const [dropDuplicates, setDropDuplicates] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [enrichedCount, setEnrichedCount] = useState(0);
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<LiteratureItem>>>({});

  const mergedItems = useMemo(() => items.map((item) => ({...item, ...(localOverrides[item.id] ?? {})})), [items, localOverrides]);
  const records = useMemo(() => classifyCitationItems(mergedItems, includeNonPapers, includePreprints), [mergedItems, includeNonPapers, includePreprints]);
  const exportRecords = useMemo(() => records.filter((record) => record.citable && (!dropDuplicates || !record.duplicateOf)), [records, dropDuplicates]);
  const excluded = records.filter((record) => !record.citable);
  const duplicates = records.filter((record) => record.duplicateOf);
  const preprints = records.filter((record) => record.preprintLike);
  const content = useMemo(() => serializeCitations(format, exportRecords), [format, exportRecords]);

  async function enrichMetadata(): Promise<void> {
    setEnriching(true);
    setEnrichedCount(0);
    const updates: Record<string, Partial<LiteratureItem>> = {};
    for (const record of records) {
      if (!record.doi) continue;
      const meta = await enrichCitationByDoi(record.doi);
      if (meta) {
        updates[record.item.id] = meta;
        setEnrichedCount((count) => count + 1);
      }
    }
    setLocalOverrides((prev) => ({...prev, ...updates}));
    setEnriching(false);
  }

  function handleDownload(): void {
    const mime = format === 'csl' ? 'application/json' : 'text/plain';
    downloadText(citationFileName(format), content, mime);
  }

  async function handleCopy(): Promise<void> {
    await navigator.clipboard?.writeText(content);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent} style={{maxWidth: 920, width: '92vw', maxHeight: '90vh', overflow: 'auto'}}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <section className={styles.summaryGrid}>
          <div>
            <span>候选条目</span>
            <strong>{records.length}</strong>
          </div>
          <div>
            <span>正式可导出</span>
            <strong>{exportRecords.length}</strong>
          </div>
          <div>
            <span>预印本</span>
            <strong>{preprints.length}</strong>
          </div>
          <div>
            <span>排除</span>
            <strong>{excluded.length}</strong>
          </div>
          <div>
            <span>重复候选</span>
            <strong>{duplicates.length}</strong>
          </div>
        </section>

        <section className={styles.controls}>
          <label>
            <span>引用格式</span>
            <Select value={format} onValueChange={(value) => setFormat(value as CitationFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(FORMAT_LABEL) as CitationFormat[]).map((key) => (
                  <SelectItem key={key} value={key}>{FORMAT_LABEL[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <button type="button" className={styles.checkRow} onClick={() => setDropDuplicates((value) => !value)}>
            <input type="checkbox" checked={dropDuplicates} readOnly />
            <span>按 DOI / arXiv / 标题去重</span>
          </button>
          <button type="button" className={styles.checkRow} onClick={() => setIncludePreprints((value) => !value)}>
            <input type="checkbox" checked={includePreprints} readOnly />
            <span>包含预印本和未发表条目</span>
          </button>
          <button type="button" className={styles.checkRow} onClick={() => setIncludeNonPapers((value) => !value)}>
            <input type="checkbox" checked={includeNonPapers} readOnly />
            <span>附录模式：包含标准、代码与 benchmark</span>
          </button>
          <Button variant="outline" onClick={enrichMetadata} disabled={enriching || records.every((record) => !record.doi)}>
            <RefreshCw size={13} className={enriching ? styles.spin : undefined} />
            {enriching ? `联网补全中 ${enrichedCount}` : 'Crossref / OpenAlex 补全'}
          </Button>
        </section>

        <section className={styles.notice}>
          <ShieldCheck size={15} />
          <span>
            默认只导出正式参考文献：期刊论文、正式会议论文、综述、专著、技术报告和学位论文。
            arXiv-only、未发表稿、代码仓库、数据集、标准网页和 benchmark 资源会进入排除清单，避免论文参考文献混入资源导航条目。
          </span>
        </section>

        {excluded.length > 0 ? (
          <details className={styles.details}>
            <summary><TriangleAlert size={14} /> 排除清单 ({excluded.length})</summary>
            <ul>
              {excluded.slice(0, 80).map((record) => (
                <li key={record.item.id}>
                  <strong title={record.item.title}>{record.item.title}</strong>
                  <span>{record.reason ?? '未进入默认引用口径'}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <section className={styles.preview}>
          <header>
            <span><FileText size={14} /> 导出预览</span>
            <span>{FORMAT_LABEL[format]} · {exportRecords.length} 条</span>
          </header>
          <pre>{content || '没有可导出的引用记录。'}</pre>
        </section>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>关闭</Button>
          <Button variant="outline" onClick={handleCopy} disabled={!content}>
            <FileJson size={13} /> 复制
          </Button>
          <Button onClick={handleDownload} disabled={!content}>
            <Download size={13} /> 下载
          </Button>
          <a className={styles.crossrefLink} href="https://www.crossref.org/documentation/retrieve-metadata/rest-api/" target="_blank" rel="noreferrer">
            元数据来源 <ExternalLink size={11} />
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
