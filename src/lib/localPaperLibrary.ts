import {get, set} from 'idb-keyval';

export interface LocalPaperRecord {
  id: string;
  name: string;
  size: number;
  addedAt: string;
  blob: Blob;
}

const LOCAL_PAPERS_KEY = 'cr-local-paper-library-v1';
const MAX_LOCAL_PAPER_SIZE = 100 * 1024 * 1024;

function isLocalPaperRecord(value: unknown): value is LocalPaperRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<LocalPaperRecord>;
  return typeof record.id === 'string'
    && typeof record.name === 'string'
    && typeof record.size === 'number'
    && typeof record.addedAt === 'string'
    && record.blob instanceof Blob;
}

export async function getLocalPapers(): Promise<LocalPaperRecord[]> {
  const value = await get<unknown>(LOCAL_PAPERS_KEY);
  return Array.isArray(value) ? value.filter(isLocalPaperRecord) : [];
}

export async function addLocalPapers(files: File[]): Promise<LocalPaperRecord[]> {
  if (files.length === 0) throw new Error('请先选择 PDF 文件。');
  for (const file of files) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error(`“${file.name}”不是 PDF 文件。`);
    }
    if (file.size <= 0) throw new Error(`“${file.name}”是空文件。`);
    if (file.size > MAX_LOCAL_PAPER_SIZE) throw new Error(`“${file.name}”超过 100MB 本地限制。`);
  }

  const existing = await getLocalPapers();
  const added = files.map((file, index): LocalPaperRecord => ({
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `paper-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    addedAt: new Date().toISOString(),
    blob: file,
  }));
  await set(LOCAL_PAPERS_KEY, [...added, ...existing]);
  return added;
}

export async function deleteLocalPaper(id: string): Promise<void> {
  await set(LOCAL_PAPERS_KEY, (await getLocalPapers()).filter((paper) => paper.id !== id));
}
