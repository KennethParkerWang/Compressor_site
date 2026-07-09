import type {LiteratureItem} from '../data/literatureData';

export type CitationFormat = 'gbt7714' | 'ieee' | 'apa' | 'bibtex' | 'ris' | 'csl' | 'markdown';

export interface CitationRecord {
  item: LiteratureItem;
  key: string;
  doi?: string;
  arxivId?: string;
  type: 'article' | 'inproceedings' | 'book' | 'phdthesis' | 'misc' | 'software' | 'standard' | 'dataset';
  citable: boolean;
  preprintLike: boolean;
  reason?: string;
  duplicateOf?: string;
}

export interface CitationAudit {
  total: number;
  citable: number;
  exportable: number;
  excluded: number;
  duplicates: number;
  unpublished: number;
  nonPapers: number;
}

const PAPER_TYPES = new Set(['paper', 'survey', 'thesis', 'book', 'report', 'preprint']);
const NON_PAPER_SOURCE = new Set(['sourceCode', 'benchmark', 'documentation', 'standard']);
const NON_PAPER_TYPE_RE = /(software|source|code|dataset|benchmark|standard|documentation|project|website|tool|manual|guide|competition|rule|official|源码|代码|数据集|语料|标准|文档|手册|官网|项目页|规则|工具|竞赛|说明)/i;
const PAPER_TYPE_RE = /(paper|survey|thesis|book|report|article|journal|conference|proceedings|论文|综述|专著|技术报告|报告|顶会|顶刊|经典|章节)/i;
const PREPRINT_RE = /(preprint|arxiv|预印本|未发表|需跟踪|under review|submission)/i;
const FORMAL_PROCEEDINGS_RE = /(iclr|icml|neurips|nips|cvpr|eccv|iccv|www|sigmod|vldb|pvldb|usenix|fast|atc|dcc|acm|ieee|pmlr|proceedings|transactions|journal|bioinformatics|pattern recognition)/i;
const FORMAL_URL_RE = /(doi\.org|proceedings\.mlr\.press|openaccess\.thecvf\.com|papers\.nips\.cc|proceedings\.neurips\.cc|proceedings\.iclr\.cc|openreview\.net\/forum|usenix\.org\/conference|usenix\.org\/legacy|dl\.acm\.org|ieeexplore\.ieee\.org|vldb\.org|academic\.oup\.com)/i;
const RESOURCE_VENUE_RE = /(github|repository|website|web site|project page|official release|source code|tool|documentation|benchmark website|benchmark tables|benchmark site|artifact|源码|项目页|工程实现|结果表|网站|文档|工具|手册)/i;
const RESOURCE_TITLE_RE = /(github repository|project page|official release|artifact|benchmark tables|metrics and benchmark tables|download|descriptions|source code|repository|源码|结果表)/i;

function normalizeText(value?: string): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function texEscape(value?: string): string {
  return (value ?? '')
    .replace(/[{}]/g, '')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .trim();
}

function cleanUrl(url?: string): string | undefined {
  const value = (url ?? '').trim();
  return value.length > 0 ? value : undefined;
}

export function extractDoi(item: LiteratureItem): string | undefined {
  const urls = [item.url, ...(item.attachments ?? []).map((a) => a.url)].filter(Boolean) as string[];
  for (const url of urls) {
    const match = url.match(/(?:doi\.org\/|doi:)(10\.\d{4,9}\/[^\s?#]+)/i) ?? url.match(/\b(10\.\d{4,9}\/[^\s?#]+)\b/i);
    if (match?.[1]) return decodeURIComponent(match[1]).replace(/[).,;]+$/, '');
  }
  return undefined;
}

export function extractArxivId(item: LiteratureItem): string | undefined {
  const urls = [item.url, ...(item.attachments ?? []).map((a) => a.url)].filter(Boolean) as string[];
  for (const url of urls) {
    const match = url.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?|[a-z-]+\/\d{7}(?:v\d+)?)/i);
    if (match?.[1]) return match[1].replace(/\.pdf$/i, '');
  }
  return undefined;
}

function firstAuthorLastName(authors?: string): string {
  const first = (authors ?? '').split(/[;,]/)[0]?.trim() ?? '';
  if (!first) return 'anon';
  const parts = first.replace(/\bet al\.?/i, '').split(/\s+/).filter(Boolean);
  return normalizeText(parts[parts.length - 1] || first).replace(/\s+/g, '') || 'anon';
}

export function makeCitationKey(item: LiteratureItem): string {
  const year = (item.year ?? 'nd').match(/\d{4}/)?.[0] ?? 'nd';
  const firstTitleWord = normalizeText(item.title).split(' ').find((word) => word.length > 3) ?? 'work';
  return `${firstAuthorLastName(item.authors)}${year}${firstTitleWord}`;
}

function inferBibType(item: LiteratureItem): CitationRecord['type'] {
  const type = (item.type ?? '').toLowerCase();
  const venue = (item.venue ?? '').toLowerCase();
  if (type.includes('software') || item.sourceKind === 'sourceCode') return 'software';
  if (type.includes('standard') || item.sourceKind === 'standard') return 'standard';
  if (type.includes('dataset') || /数据集|语料/.test(item.type ?? '')) return 'dataset';
  if (type.includes('book') || /专著|book/i.test(item.type ?? '')) return 'book';
  if (type.includes('thesis') || /学位|thesis/i.test(item.venue ?? '')) return 'phdthesis';
  if (
    venue.includes('conference') ||
    venue.includes('proceedings') ||
    venue.includes('cvpr') ||
    venue.includes('icml') ||
    venue.includes('neurips') ||
    venue.includes('nips') ||
    venue.includes('iclr') ||
    venue.includes('dcc') ||
    venue.includes('sig') ||
    venue.includes('usenix') ||
    venue.includes('www') ||
    venue.includes('fast') ||
    venue.includes('atc') ||
    /顶会|会议/.test(item.type ?? '')
  ) return 'inproceedings';
  if (PAPER_TYPES.has(type)) return 'article';
  if (PAPER_TYPE_RE.test(item.type ?? '')) return 'article';
  return 'misc';
}

function isPaperLike(item: LiteratureItem): boolean {
  if (item.sourceKind !== 'literature') return false;
  const type = item.type ?? '';
  if (NON_PAPER_TYPE_RE.test(type)) return false;
  if (RESOURCE_VENUE_RE.test(item.venue ?? '') || RESOURCE_TITLE_RE.test(item.title ?? '')) return false;
  return PAPER_TYPES.has(type.toLowerCase()) || PAPER_TYPE_RE.test(type) || Boolean(item.authors && item.venue);
}

function isPreprintLike(item: LiteratureItem): boolean {
  const venue = item.venue ?? '';
  const urls = [item.url, ...(item.attachments ?? []).map((a) => a.url)].filter(Boolean).join(' ');
  const formallyPublished = FORMAL_PROCEEDINGS_RE.test(venue) && FORMAL_URL_RE.test(urls);
  if (formallyPublished && !item.unpublished && !PREPRINT_RE.test(item.unpublishedReason ?? '')) return false;
  if (/arxiv\.org/i.test(urls) && !formallyPublished) return true;
  return Boolean(item.unpublished || PREPRINT_RE.test(item.type ?? '') || PREPRINT_RE.test(venue) || PREPRINT_RE.test(item.unpublishedReason ?? ''));
}

function missingCitationCore(item: LiteratureItem): boolean {
  return !item.title?.trim() || !item.authors?.trim() || !String(item.year ?? '').match(/\d{4}/);
}

export function classifyCitationItems(items: readonly LiteratureItem[], includeNonPapers = false, includePreprints = false): CitationRecord[] {
  const seen = new Map<string, string>();
  return items.map((item) => {
    const doi = extractDoi(item);
    const arxivId = extractArxivId(item);
    const type = inferBibType(item);
    const paperLike = isPaperLike(item);
    const nonPaper = NON_PAPER_SOURCE.has(item.sourceKind ?? '') || NON_PAPER_TYPE_RE.test(item.type ?? '') || RESOURCE_VENUE_RE.test(item.venue ?? '') || RESOURCE_TITLE_RE.test(item.title ?? '');
    const preprintLike = isPreprintLike(item);
    const missingCore = missingCitationCore(item);
    const citable = includeNonPapers ? !missingCore : paperLike && !nonPaper && !missingCore && (includePreprints || !preprintLike);
    const keyBase = doi ? `doi:${doi.toLowerCase()}` : arxivId ? `arxiv:${arxivId.toLowerCase()}` : `title:${normalizeText(item.title)}:${item.year ?? ''}`;
    const duplicateOf = seen.get(keyBase);
    const key = makeCitationKey(item);
    if (!duplicateOf) seen.set(keyBase, key);
    let reason: string | undefined;
    if (!citable) {
      if (missingCore) reason = '缺少作者或年份';
      else if (preprintLike && !includePreprints) reason = '预印本或未正式发表';
      else if (nonPaper || !paperLike) reason = '非正式论文资源';
      else reason = '未进入默认引用口径';
    }
    return {
      item,
      key,
      doi,
      arxivId,
      type,
      citable,
      preprintLike,
      duplicateOf,
      reason,
    };
  });
}

function splitAuthors(authors?: string): string[] {
  return (authors ?? '')
    .split(/[;；]/)
    .flatMap((part) => part.split(/\s+and\s+/i))
    .map((author) => author.trim())
    .filter(Boolean);
}

function bibAuthors(authors?: string): string {
  const list = splitAuthors(authors);
  return list.length > 0 ? list.join(' and ') : 'Unknown';
}

function bibEntryType(type: CitationRecord['type']): string {
  if (type === 'book') return 'book';
  if (type === 'phdthesis') return 'phdthesis';
  if (type === 'inproceedings') return 'inproceedings';
  return type === 'misc' || type === 'software' || type === 'standard' || type === 'dataset' ? 'misc' : 'article';
}

function plainAuthors(authors?: string, max = 6): string {
  const list = splitAuthors(authors);
  if (list.length === 0) return 'Unknown author';
  if (list.length > max) return `${list.slice(0, max).join(', ')}, et al.`;
  return list.join(', ');
}

function cleanReferenceVenue(venue?: string): string {
  const raw = (venue ?? '').trim();
  if (!raw) return '';
  const first = raw.split(/\s+\/\s+/)[0]?.trim() ?? raw;
  return first
    .replace(/\s*\([^)]*(预印本|未发表|源码|项目页|官网|benchmark)[^)]*\)\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanReferenceYear(year?: string): string {
  return year?.match(/\d{4}/)?.[0] ?? 'n.d.';
}

function referenceTail(record: CitationRecord): string {
  const item = record.item;
  const parts = [
    record.doi ? `DOI: ${record.doi}` : '',
    !record.doi && item.url ? `Available: ${item.url}` : '',
    record.preprintLike ? 'Preprint or unpublished item' : '',
  ].filter(Boolean);
  return parts.length ? ` ${parts.join('. ')}.` : '';
}

export function auditCitationRecords(records: readonly CitationRecord[], dropDuplicates = true): CitationAudit {
  const exportable = records.filter((record) => record.citable && (!dropDuplicates || !record.duplicateOf));
  return {
    total: records.length,
    citable: records.filter((record) => record.citable).length,
    exportable: exportable.length,
    excluded: records.filter((record) => !record.citable).length,
    duplicates: records.filter((record) => record.duplicateOf).length,
    unpublished: records.filter((record) => record.preprintLike).length,
    nonPapers: records.filter((record) => !PAPER_TYPES.has((record.item.type ?? '').toLowerCase())).length,
  };
}

export function toGBT7714(records: readonly CitationRecord[]): string {
  return records.map((record, index) => {
    const item = record.item;
    const typeMark = record.type === 'book' ? 'M' : record.type === 'phdthesis' ? 'D' : record.type === 'inproceedings' ? 'C' : 'J';
    const venue = cleanReferenceVenue(item.venue);
    const venueText = venue ? ` ${venue},` : '';
    const year = ` ${cleanReferenceYear(item.year)}`;
    return `[${index + 1}] ${plainAuthors(item.authors)}. ${item.title}[${typeMark}].${venueText}${year}.${referenceTail(record)}`;
  }).join('\n');
}

export function toIEEE(records: readonly CitationRecord[]): string {
  return records.map((record, index) => {
    const item = record.item;
    const venue = cleanReferenceVenue(item.venue);
    const venueText = venue ? `, ${venue}` : '';
    const year = `, ${cleanReferenceYear(item.year)}`;
    return `[${index + 1}] ${plainAuthors(item.authors)}, "${item.title}"${venueText}${year}.${referenceTail(record)}`;
  }).join('\n');
}

export function toAPA(records: readonly CitationRecord[]): string {
  return records.map((record) => {
    const item = record.item;
    const year = cleanReferenceYear(item.year);
    const venue = cleanReferenceVenue(item.venue);
    const venueText = venue ? ` ${venue}.` : '';
    return `${plainAuthors(item.authors)}. (${year}). ${item.title}.${venueText}${referenceTail(record)}`;
  }).join('\n');
}

export function toBibTeX(records: readonly CitationRecord[]): string {
  return records.map((record) => {
    const item = record.item;
    const fields = [
      ['title', item.title],
      ['author', bibAuthors(item.authors)],
      ['year', (item.year ?? '').match(/\d{4}/)?.[0] ?? item.year],
      [record.type === 'inproceedings' ? 'booktitle' : 'journal', item.venue],
      ['doi', record.doi],
      ['url', cleanUrl(item.url)],
      ['note', item.unpublished ? `Unpublished/preprint. ${item.unpublishedReason ?? ''}`.trim() : undefined],
    ].filter(([, value]) => value && String(value).trim());
    return `@${bibEntryType(record.type)}{${record.key},\n${fields.map(([name, value]) => `  ${name} = {${texEscape(String(value))}}`).join(',\n')}\n}`;
  }).join('\n\n');
}

export function toRIS(records: readonly CitationRecord[]): string {
  const typeMap: Record<CitationRecord['type'], string> = {
    article: 'JOUR',
    inproceedings: 'CONF',
    book: 'BOOK',
    phdthesis: 'THES',
    misc: 'GEN',
    software: 'COMP',
    standard: 'STAND',
    dataset: 'DATA',
  };
  return records.map((record) => {
    const item = record.item;
    const lines = [
      `TY  - ${typeMap[record.type]}`,
      `TI  - ${item.title}`,
      ...splitAuthors(item.authors).map((author) => `AU  - ${author}`),
      item.year ? `PY  - ${item.year}` : '',
      item.venue ? `T2  - ${item.venue}` : '',
      record.doi ? `DO  - ${record.doi}` : '',
      item.url ? `UR  - ${item.url}` : '',
      item.unpublished ? `N1  - Unpublished/preprint. ${item.unpublishedReason ?? ''}` : '',
      'ER  -',
    ].filter(Boolean);
    return lines.join('\n');
  }).join('\n\n');
}

export function toCSL(records: readonly CitationRecord[]): string {
  const csl = records.map((record) => {
    const item = record.item;
    return {
      id: record.key,
      type: record.type === 'inproceedings' ? 'paper-conference' : record.type === 'book' ? 'book' : record.type === 'phdthesis' ? 'thesis' : 'article-journal',
      title: item.title,
      author: splitAuthors(item.authors).map((name) => ({literal: name})),
      issued: item.year ? {'date-parts': [[Number((item.year.match(/\d{4}/) ?? [item.year])[0]) || item.year]]} : undefined,
      'container-title': item.venue || undefined,
      DOI: record.doi,
      URL: item.url || undefined,
      note: item.unpublished ? `Unpublished/preprint. ${item.unpublishedReason ?? ''}`.trim() : undefined,
    };
  });
  return JSON.stringify(csl, null, 2);
}

export function toMarkdownBibliography(records: readonly CitationRecord[]): string {
  return records.map((record, index) => {
    const item = record.item;
    const author = item.authors || 'Unknown author';
    const year = item.year || 'n.d.';
    const venue = item.venue ? ` ${item.venue}.` : '';
    const url = item.url ? ` ${item.url}` : '';
    const doi = record.doi ? ` DOI: ${record.doi}.` : '';
    const note = item.unpublished ? ` [Preprint/unpublished: ${item.unpublishedReason ?? 'status not verified'}]` : '';
    return `${index + 1}. ${author} (${year}). **${item.title}.**${venue}${doi}${url}${note}`;
  }).join('\n');
}

export function serializeCitations(format: CitationFormat, records: readonly CitationRecord[]): string {
  if (format === 'gbt7714') return toGBT7714(records);
  if (format === 'ieee') return toIEEE(records);
  if (format === 'apa') return toAPA(records);
  if (format === 'ris') return toRIS(records);
  if (format === 'csl') return toCSL(records);
  if (format === 'markdown') return toMarkdownBibliography(records);
  return toBibTeX(records);
}

export function citationFileName(format: CitationFormat): string {
  const ext: Record<CitationFormat, string> = {
    gbt7714: 'txt',
    ieee: 'txt',
    apa: 'txt',
    bibtex: 'bib',
    ris: 'ris',
    csl: 'json',
    markdown: 'md',
  };
  return `compression-references.${ext[format]}`;
}

export async function enrichCitationByDoi(doi: string): Promise<Partial<LiteratureItem> | null> {
  const normalized = doi.trim();
  if (!normalized) return null;
  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(normalized)}`);
    if (!response.ok) throw new Error('Crossref failed');
    const json = await response.json();
    const msg = json.message;
    const authors = Array.isArray(msg.author)
      ? msg.author.map((a: any) => [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean).join('; ')
      : undefined;
    const year = msg.issued?.['date-parts']?.[0]?.[0]?.toString();
    return {
      title: Array.isArray(msg.title) ? msg.title[0] : undefined,
      authors,
      year,
      venue: Array.isArray(msg['container-title']) ? msg['container-title'][0] : undefined,
      url: msg.URL,
    } as Partial<LiteratureItem>;
  } catch {
    try {
      const response = await fetch(`https://api.openalex.org/works/doi:${encodeURIComponent(normalized)}`);
      if (!response.ok) return null;
      const work = await response.json();
      return {
        title: work.title,
        authors: Array.isArray(work.authorships) ? work.authorships.map((a: any) => a.author?.display_name).filter(Boolean).join('; ') : undefined,
        year: work.publication_year?.toString(),
        venue: work.primary_location?.source?.display_name,
        url: work.doi ?? work.id,
      } as Partial<LiteratureItem>;
    } catch {
      return null;
    }
  }
}
