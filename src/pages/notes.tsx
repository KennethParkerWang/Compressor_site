import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import UserGuard from '../components/account/UserGuard';
import PageHero from '../components/PageHero';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {ScrollArea} from '../components/ui/scroll-area';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../components/ui/dialog';
import {useNotes, useTasks, type NoteStatus} from '../stores/workbench';
import {literatureData} from '../data/literatureData';
import type {ReadingNote, SixQuestions} from '../data/readingNotes';
import {
  AlertTriangle,
  ArrowDownToLine,
  Bold,
  BookOpen,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Download,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Search,
  StickyNote,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';
import styles from './notes.module.css';

type Lang = 'zh' | 'en';
type SixKey = keyof SixQuestions;
type SixPrompt = {key: SixKey; label: string; prompt: string};
type CopyText = typeof COPY.zh;

const EMPTY_Q: SixQuestions = {
  problem: '',
  method: '',
  experiment: '',
  conclusion: '',
  limitation: '',
  takeaway: '',
};

const COPY = {
  zh: {
    title: '阅读笔记',
    heroTitle: '文献笔记工作台',
    kicker: 'Research Notes',
    hint: '按文献、项目任务和自由主题组织阅读笔记，支持六问模板、摘录、自由写作、版本快照和本地导出。',
    all: '全部',
    authors: '作者',
    created: '创建时间',
    draft: '草稿',
    empty: '还没有笔记。点击“新建笔记”或从文献库关联一篇。',
    finished: '已完成',
    freeform: '自由写作',
    inProgress: '在写',
    list: '笔记列表',
    newNote: '新建笔记',
    q1: '这篇工作要解决什么问题？',
    q2: '它用了什么方法？',
    q3: '实验是怎样设计的？',
    q4: '主要结论是什么？',
    q5: '局限性是什么？',
    q6: '对我的启发是什么？',
    problem: '问题',
    method: '方法',
    experiment: '实验',
    conclusion: '结论',
    limitation: '局限',
    takeaway: '启发',
    relatedPaper: '关联文献',
    search: '搜索标题 / 作者 / 标签',
    status: '状态',
    tags: '标签',
    titlePlaceholder: '标题',
    wordCount: '字数',
    wordSuffix: '字',
    year: '年份',
    exportMd: '导出 Markdown',
    exportTxt: '导出纯文本',
    copyAll: '复制全部',
    summary: '结构化摘要',
    outline: '大纲',
    outlineEmpty: '还没有 H2 标题，可以在自由写作里添加二级标题。',
    keywords: '关键词',
    highlights: '摘录 / 高亮',
    sixQuestions: '六问模板',
    freeformEditor: '自由编辑',
    versions: '历史版本',
    restore: '恢复',
    saveSnapshot: '保存快照',
    addTagPlaceholder: '添加标签',
    hlPlaceholder: '输入摘录，回车添加',
    deleteNote: '删除笔记',
    deleteTitle: '删除当前笔记？',
    deleteDesc: '删除后会从本地笔记库移除，不能撤销。',
    cancel: '取消',
    confirmDelete: '确认删除',
    savedAt: '保存于',
    unsaved: '未保存',
    addTag: '加标签',
    addHighlight: '加摘录',
    noRelatedPaper: '未关联文献',
    openPaper: '打开文献',
    create: '创建',
    newNoteDialog: '新建笔记 - 选择关联对象',
    fromLibrary: '从文献库选择',
    fromProject: '从项目任务选择',
    freeWriting: '自由写作',
    literatureSearch: '搜索文献标题 / 作者',
    taskSearch: '搜索任务标题',
    projectTask: '项目任务',
    noTasks: '暂无任务，可以先到任务页创建。',
    freeHint: '给这篇自由笔记起一个标题，例如“阶段汇报灵感”。',
    defaultFreeTitle: '自由笔记',
    selectOrCreate: '请选择或新建一篇笔记。',
    nothingSelected: '未选择笔记',
    noteUnit: '篇笔记',
    finalUnit: '已完成',
    draftUnit: '草稿',
    deletePreview: '将删除',
    authorLine: '作者',
    tagLine: '标签',
    highlightsTitle: '摘录 / 高亮',
    freeformTitle: '自由写作',
    noKeywords: '暂无关键词',
    toolbarH2: '二级标题',
    toolbarBold: '加粗',
    toolbarItalic: '斜体',
    toolbarBullet: '无序列表',
    toolbarOrdered: '有序列表',
    toolbarQuote: '引用',
    toolbarCode: '代码块',
    etAl: '等',
  },
  en: {
    title: 'Research Notes',
    heroTitle: 'Research Notes Workspace',
    kicker: 'Research Notes',
    hint: 'Organize paper notes, project notes, and free-form writing with prompts, highlights, snapshots, and local exports.',
    all: 'All',
    authors: 'Authors',
    created: 'Created',
    draft: 'Draft',
    empty: 'No notes yet. Click "New Note" or link a paper from the Library.',
    finished: 'Final',
    freeform: 'Free Writing',
    inProgress: 'In Progress',
    list: 'Note List',
    newNote: 'New Note',
    q1: 'What problem does this work address?',
    q2: 'What method does it use?',
    q3: 'How are the experiments designed?',
    q4: 'What is the main conclusion?',
    q5: 'What are the limitations?',
    q6: 'What can I reuse or learn?',
    problem: 'Problem',
    method: 'Method',
    experiment: 'Experiments',
    conclusion: 'Conclusion',
    limitation: 'Limitations',
    takeaway: 'Takeaways',
    relatedPaper: 'Related Paper',
    search: 'Search title / author / tag',
    status: 'Status',
    tags: 'Tags',
    titlePlaceholder: 'Title',
    wordCount: 'Words',
    wordSuffix: 'words',
    year: 'Year',
    exportMd: 'Export Markdown',
    exportTxt: 'Export Text',
    copyAll: 'Copy All',
    summary: 'Structured Summary',
    outline: 'Outline',
    outlineEmpty: 'No H2 headings yet. Add section headings in the editor.',
    keywords: 'Keywords',
    highlights: 'Highlights / Excerpts',
    sixQuestions: 'Six Prompts',
    freeformEditor: 'Free Editor',
    versions: 'Versions',
    restore: 'Restore',
    saveSnapshot: 'Save Snapshot',
    addTagPlaceholder: 'Add tag',
    hlPlaceholder: 'Type a highlight, then press Enter',
    deleteNote: 'Delete Note',
    deleteTitle: 'Delete this note?',
    deleteDesc: 'This removes the note from local storage. This action cannot be undone.',
    cancel: 'Cancel',
    confirmDelete: 'Delete',
    savedAt: 'Saved at',
    unsaved: 'Not saved',
    addTag: 'Add Tag',
    addHighlight: 'Add Highlight',
    noRelatedPaper: 'No related paper',
    openPaper: 'Open Paper',
    create: 'Create',
    newNoteDialog: 'New Note - Choose Source',
    fromLibrary: 'From Library',
    fromProject: 'From Project Task',
    freeWriting: 'Free Writing',
    literatureSearch: 'Search paper title / author',
    taskSearch: 'Search task title',
    projectTask: 'Project Task',
    noTasks: 'No tasks yet. Create one in the Tasks page first.',
    freeHint: 'Give this free note a title, for example "Research ideas".',
    defaultFreeTitle: 'Free Note',
    selectOrCreate: 'Select or create a note.',
    nothingSelected: 'No note selected',
    noteUnit: 'notes',
    finalUnit: 'final',
    draftUnit: 'draft',
    deletePreview: 'This will delete',
    authorLine: 'Author',
    tagLine: 'Tags',
    highlightsTitle: 'Highlights / Excerpts',
    freeformTitle: 'Free Writing',
    noKeywords: 'No keywords',
    toolbarH2: 'Heading 2',
    toolbarBold: 'Bold',
    toolbarItalic: 'Italic',
    toolbarBullet: 'Bullet list',
    toolbarOrdered: 'Ordered list',
    toolbarQuote: 'Quote',
    toolbarCode: 'Code block',
    etAl: 'et al.',
  },
};

function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function makeStatusLabel(copy: CopyText): Record<NoteStatus, string> {
  return {
    draft: copy.draft,
    'in-review': copy.inProgress,
    final: copy.finished,
  };
}

function makeSixQ(copy: CopyText): SixPrompt[] {
  return [
    {key: 'problem', label: copy.problem, prompt: copy.q1},
    {key: 'method', label: copy.method, prompt: copy.q2},
    {key: 'experiment', label: copy.experiment, prompt: copy.q3},
    {key: 'conclusion', label: copy.conclusion, prompt: copy.q4},
    {key: 'limitation', label: copy.limitation, prompt: copy.q5},
    {key: 'takeaway', label: copy.takeaway, prompt: copy.q6},
  ];
}

function hasCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function visibleTags(tags: readonly string[] = [], lang: Lang): string[] {
  return lang === 'en' ? tags.filter((tag) => !hasCjk(tag)) : [...tags];
}

function localSummary(note: ReadingNote, sixQ: SixPrompt[], copy: CopyText, lang: Lang): string {
  if ((note as any).summary) return (note as any).summary;
  const tagPart = visibleTags(note.tags, lang).slice(0, 4).join(lang === 'en' ? ', ' : '、');
  const q = note.sixQuestions ?? EMPTY_Q;
  const filled = Object.entries(q)
    .filter(([, value]) => String(value ?? '').trim())
    .slice(0, 3)
    .map(([key]) => sixQ.find((item) => item.key === key)?.label)
    .filter(Boolean)
    .join(lang === 'en' ? ' / ' : ' / ');

  if (lang === 'en') {
    const author = note.author || 'unknown author';
    const year = note.year || 'unknown year';
    const scope = tagPart ? ` Topics: ${tagPart}.` : '';
    return `"${note.title}" is a research note related to ${author} (${year}).${scope} Filled prompts: ${filled || 'none yet'}.`;
  }

  const author = note.author || '未知作者';
  const year = note.year || '未知年份';
  return tagPart
    ? `这篇笔记《${note.title}》关联 ${author}（${year}），主题包括 ${tagPart}。目前已填写：${filled || '暂无六问内容'}。`
    : `《${note.title}》是 ${author} ${year} 年相关工作的阅读笔记。`;
}

function extractKeywords(note: ReadingNote, lang: Lang): string[] {
  const tags = visibleTags(note.tags, lang);
  const text = [note.title, note.author, ...tags].filter(Boolean).join(' ');
  const stop = new Set(['the', 'a', 'an', 'of', 'on', 'in', 'and', 'or', 'to', 'for', 'with', 'is', 'are']);
  const tokens = text
    .toLowerCase()
    .split(/[\s,;.()[\]:/]+/)
    .filter((token) => token.length > 2 && !stop.has(token) && (lang === 'zh' || !hasCjk(token)));
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([token]) => token);
}

function insertTemplate(key: SixKey) {
  const event = new CustomEvent('cr:insert-template', {detail: key});
  if (typeof window !== 'undefined') window.dispatchEvent(event);
}

export default function NotesPage(): React.ReactElement {
  const location = useLocation();
  const lang: Lang = isEnglishPath(location.pathname) ? 'en' : 'zh';
  const copy = COPY[lang];
  const statusLabel = useMemo(() => makeStatusLabel(copy), [copy]);
  const sixQ = useMemo(() => makeSixQ(copy), [copy]);
  const params = new URLSearchParams(location.search);
  const focusNote = params.get('note');

  const {notes, updateNote, addNote, removeNote} = useNotes();
  const tasks = useTasks((state) => state.tasks);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string>(focusNote ?? notes[0]?.id ?? '');
  const [filter, setFilter] = useState<'all' | NoteStatus>('all');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMode, setPickerMode] = useState<'lit' | 'project' | 'free'>('lit');
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    if (focusNote) setActiveId(focusNote);
  }, [focusNote]);

  useEffect(() => {
    if (!notes.length) {
      setActiveId('');
      return;
    }
    if (!activeId || !notes.some((note) => note.id === activeId)) {
      setActiveId(notes[0].id);
    }
  }, [activeId, notes]);

  const filtered = useMemo(() => {
    let arr = notes;
    if (filter !== 'all') arr = arr.filter((note) => note.status === filter);
    if (search.trim()) {
      const query = search.toLowerCase();
      arr = arr.filter((note) =>
        note.title.toLowerCase().includes(query) ||
        (note.author ?? '').toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }
    return arr;
  }, [notes, filter, search]);

  const active = useMemo(() => notes.find((note) => note.id === activeId), [notes, activeId]);

  function openPicker(mode: 'lit' | 'project' | 'free' = 'lit') {
    setPickerOpen(true);
    setPickerMode(mode);
    setPickerSearch('');
    setProjectTitle('');
  }

  function createFromLiterature(litId: string, title: string) {
    const lit = literatureData.find((item) => item.id === litId);
    const id = addNote(litId, title);
    if (lit) {
      updateNote(id, {
        author: lit.authors ?? '',
        year: Number(lit.year) || new Date().getFullYear(),
        tags: visibleTags(lit.tags ?? [], 'zh'),
      });
    }
    setPickerOpen(false);
    setActiveId(id);
  }

  function createFromTask(taskId: string, title: string) {
    const id = addNote(`task-${taskId}`, lang === 'en' ? `[Project] ${title}` : `[项目] ${title}`);
    updateNote(id, {author: copy.projectTask, tags: ['project']});
    setPickerOpen(false);
    setActiveId(id);
  }

  function createFreeNote() {
    const title = projectTitle.trim() || copy.defaultFreeTitle;
    const id = addNote(`free-${Date.now().toString(36)}`, title);
    updateNote(id, {author: copy.freeWriting, tags: ['freeform']});
    setPickerOpen(false);
    setActiveId(id);
  }

  function deleteActiveNote() {
    if (!active) return;
    const next = notes.find((note) => note.id !== active.id)?.id ?? '';
    removeNote(active.id);
    setActiveId(next);
    setDeleteOpen(false);
  }

  return (
    <Layout title={copy.title} description={copy.hint}>
      <UserGuard>
      <WorkbenchShell pageTitle={copy.title}>
        <PageHero
          kicker={copy.kicker}
          title={copy.heroTitle}
          meta={(
            <>
              <span>{notes.length} {copy.noteUnit}</span>
              <span>{notes.filter((note) => note.status === 'final').length} {copy.finalUnit}</span>
              <span>{notes.filter((note) => note.status === 'draft').length} {copy.draftUnit}</span>
            </>
          )}
          actions={(
            <>
              <Button onClick={() => openPicker('lit')}>
                <StickyNote size={14} /> {copy.newNote}
              </Button>
              <Button variant="outline" disabled={!active} onClick={() => setDeleteOpen(true)}>
                <Trash2 size={14} /> {copy.deleteNote}
              </Button>
            </>
          )}
        />

        <div className={styles.layout}>
          <aside className={styles.left}>
            <div className={styles.leftHead}>
              <div style={{position: 'relative'}}>
                <Search size={12} style={{position: 'absolute', left: 10, top: 12, color: '#94a3b8'}} />
                <Input
                  placeholder={copy.search}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{paddingLeft: 28}}
                />
              </div>
              <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | NoteStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{copy.all}</SelectItem>
                  <SelectItem value="draft">{copy.draft}</SelectItem>
                  <SelectItem value="in-review">{copy.inProgress}</SelectItem>
                  <SelectItem value="final">{copy.finished}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className={styles.noteList}>
              {filtered.length === 0 ? (
                <div className={styles.empty}>{copy.empty}</div>
              ) : (
                filtered.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    className={`${styles.noteItem} ${note.id === activeId ? styles.noteItemActive : ''}`}
                    onClick={() => setActiveId(note.id)}
                  >
                    <span className={styles.noteItemTitle}>{note.title}</span>
                    <span className={styles.noteItemMeta}>
                      {note.author?.split(',')[0] || '-'} · {note.year || '-'}
                    </span>
                    <span className={styles.noteItemFooter}>
                      <Badge variant="outline" className={styles.statusBadge}>{statusLabel[note.status]}</Badge>
                      <span className={styles.noteItemTags}>
                        {visibleTags(note.tags, lang).slice(0, 2).map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </ScrollArea>
          </aside>

          <section className={styles.center}>
            {active ? (
              <NoteEditor
                key={active.id}
                note={active}
                onChange={(patch) => updateNote(active.id, patch)}
                copy={copy}
                statusLabel={statusLabel}
                sixQ={sixQ}
                lang={lang}
              />
            ) : (
              <div className={styles.empty}>{copy.selectOrCreate}</div>
            )}
          </section>

          <aside className={styles.right}>
            {active ? (
              <NoteInspector note={active} copy={copy} sixQ={sixQ} lang={lang} />
            ) : (
              <div className={styles.empty}>{copy.nothingSelected}</div>
            )}
          </aside>
        </div>

        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent style={{maxWidth: 580}}>
            <DialogHeader>
              <DialogTitle>{copy.newNoteDialog}</DialogTitle>
            </DialogHeader>
            <div style={{display: 'flex', gap: 6, margin: '8px 0 12px'}}>
              {([
                {key: 'lit', label: copy.fromLibrary},
                {key: 'project', label: copy.fromProject},
                {key: 'free', label: copy.freeWriting},
              ] as const).map((button) => (
                <button
                  key={button.key}
                  type="button"
                  onClick={() => setPickerMode(button.key)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${pickerMode === button.key ? '#1d4ed8' : '#e2e8f0'}`,
                    background: pickerMode === button.key ? '#eff6ff' : '#fff',
                    color: pickerMode === button.key ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: pickerMode === button.key ? 650 : 500,
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>

            {pickerMode === 'lit' ? (
              <>
                <Input
                  placeholder={copy.literatureSearch}
                  value={pickerSearch}
                  onChange={(event) => setPickerSearch(event.target.value)}
                  style={{marginBottom: 8}}
                />
                <div style={{maxHeight: 320, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6}}>
                  {literatureData
                    .filter((lit) => !pickerSearch.trim() || `${lit.title} ${lit.authors ?? ''}`.toLowerCase().includes(pickerSearch.toLowerCase()))
                    .slice(0, 30)
                    .map((lit) => {
                      const firstAuthor = (lit.authors ?? '').split(',')[0];
                      const moreAuthors = (lit.authors ?? '').includes(',') ? ` ${copy.etAl}` : '';
                      return (
                        <button
                          key={lit.id}
                          type="button"
                          onClick={() => createFromLiterature(lit.id, lit.title)}
                          style={{display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 0, borderBottom: '1px solid #f1f5f9', background: 'transparent', cursor: 'pointer', fontSize: 13}}
                        >
                          <div style={{fontWeight: 600, color: '#0f172a'}}>{lit.title}</div>
                          <div style={{fontSize: 11, color: '#64748b', marginTop: 2}}>
                            {firstAuthor || '-'}{moreAuthors} · {lit.year ?? '-'} · {lang === 'en' ? lit.chapterTitleEn : lit.chapterTitleZh}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </>
            ) : pickerMode === 'project' ? (
              <>
                <Input
                  placeholder={copy.taskSearch}
                  value={pickerSearch}
                  onChange={(event) => setPickerSearch(event.target.value)}
                  style={{marginBottom: 8}}
                />
                <div style={{maxHeight: 320, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6}}>
                  {tasks
                    .filter((task) => !pickerSearch.trim() || task.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                    .slice(0, 30)
                    .map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => createFromTask(task.id, task.title)}
                        style={{display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 0, borderBottom: '1px solid #f1f5f9', background: 'transparent', cursor: 'pointer', fontSize: 13}}
                      >
                        <div style={{fontWeight: 600, color: '#0f172a'}}>{task.title}</div>
                        <div style={{fontSize: 11, color: '#64748b', marginTop: 2}}>
                          {copy.projectTask} · {task.lane} · {task.status}
                        </div>
                      </button>
                    ))}
                  {tasks.length === 0 ? (
                    <p style={{padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12}}>{copy.noTasks}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <p style={{fontSize: 12.5, color: '#64748b', margin: '4px 0 8px'}}>{copy.freeHint}</p>
                <Input placeholder={copy.titlePlaceholder} value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
              </>
            )}

            <DialogFooter style={{marginTop: 14}}>
              <Button variant="ghost" onClick={() => setPickerOpen(false)}>{copy.cancel}</Button>
              {pickerMode === 'free' ? (
                <Button onClick={createFreeNote}>{copy.create}</Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <AlertTriangle size={18} /> {copy.deleteTitle}
              </DialogTitle>
              <DialogDescription>{copy.deleteDesc}</DialogDescription>
            </DialogHeader>
            {active ? (
              <div style={{padding: 12, border: '1px solid #fee2e2', borderRadius: 8, background: '#fef2f2', color: '#991b1b', fontSize: 13}}>
                {copy.deletePreview}: <strong>{active.title}</strong>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>{copy.cancel}</Button>
              <Button variant="destructive" onClick={deleteActiveNote}>
                <Trash2 size={14} /> {copy.confirmDelete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </WorkbenchShell>
      </UserGuard>
    </Layout>
  );
}

function RelatedPaper({litId, copy, lang}: {litId: string; copy: CopyText; lang: Lang}) {
  const lit = useMemo(() => literatureData.find((item) => item.id === litId), [litId]);
  if (!lit || litId.startsWith('task-') || litId.startsWith('free-')) return <p className={styles.empty}>{copy.noRelatedPaper}</p>;

  const tags = visibleTags(lit.tags ?? [], lang);
  return (
    <div className={styles.relPaper}>
      <div className={styles.relMeta}>{lit.chapterId} · {lang === 'en' ? lit.chapterTitleEn : lit.chapterTitleZh}</div>
      <div className={styles.relTitle}>{lit.title}</div>
      <div className={styles.relMeta}>{lit.authors ?? '-'} · {lit.year ?? '-'}</div>
      {lang === 'zh' && lit.summaryZh ? <p className={styles.relSummary}>{lit.summaryZh}</p> : null}
      {tags.length > 0 ? (
        <div className={styles.relTags}>
          {tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
        </div>
      ) : null}
      {lit.url ? (
        <a href={lit.url} target="_blank" rel="noreferrer" className={styles.relLink}>
          <ChevronRight size={12} /> {copy.openPaper}
        </a>
      ) : null}
    </div>
  );
}

function NoteInspector({note, copy, sixQ, lang}: {note: ReadingNote; copy: CopyText; sixQ: SixPrompt[]; lang: Lang}) {
  const keywords = extractKeywords(note, lang);
  return (
    <div className={styles.inspector}>
      <section className={styles.inspectorSection}>
        <h3 className={styles.rightTitle}>{copy.relatedPaper}</h3>
        <RelatedPaper litId={note.litId ?? ''} copy={copy} lang={lang} />
      </section>

      <section className={styles.inspectorSection}>
        <h3 className={styles.rightTitle}>{copy.summary}</h3>
        <p className={styles.rightHint}>{localSummary(note, sixQ, copy, lang)}</p>
      </section>

      <section className={styles.inspectorSection}>
        <h3 className={styles.rightTitle}>{copy.keywords}</h3>
        <div className={styles.keywordRow}>
          {keywords.length > 0 ? keywords.map((keyword) => <span key={keyword}>{keyword}</span>) : <span>{copy.noKeywords}</span>}
        </div>
      </section>

      <section className={styles.inspectorSection}>
        <h3 className={styles.rightTitle}>{copy.sixQuestions}</h3>
        <div className={styles.templateList}>
          {sixQ.map((item) => (
            <button key={item.key} type="button" className={styles.templateBtn} onClick={() => insertTemplate(item.key)}>
              <span className={styles.templateLabel}>{item.label}</span>
              <span className={styles.templatePrompt}>{item.prompt}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function NoteEditor({
  note,
  onChange,
  copy,
  statusLabel,
  sixQ,
  lang,
}: {
  note: ReadingNote;
  onChange: (patch: Partial<ReadingNote>) => void;
  copy: CopyText;
  statusLabel: Record<NoteStatus, string>;
  sixQ: SixPrompt[];
  lang: Lang;
}) {
  const [title, setTitle] = useState(note.title);
  const [author, setAuthor] = useState(note.author ?? '');
  const [year, setYear] = useState(note.year ?? new Date().getFullYear());
  const [tags, setTags] = useState<string[]>([...(note.tags ?? [])]);
  const [status, setStatus] = useState<NoteStatus>(note.status ?? 'draft');
  const [tagInput, setTagInput] = useState('');
  const [q, setQ] = useState<SixQuestions>(note.sixQuestions ?? EMPTY_Q);
  const [highlights, setHighlights] = useState<string[]>([...(note.highlights ?? [])]);
  const [hlInput, setHlInput] = useState('');
  const [wordCount, setWordCount] = useState(note.wordCount ?? 0);
  const [showVersions, setShowVersions] = useState(false);
  const [savedAt, setSavedAt] = useState<string>(note.updatedAt ?? '');

  const editor = useEditor({
    extensions: [StarterKit],
    content: note.freeform || '',
    immediatelyRender: false,
    onUpdate: ({editor}) => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const ts = new Date().toISOString();
      setWordCount(words);
      setSavedAt(ts);
      onChange({freeform: editor.getHTML(), wordCount: words, updatedAt: ts});
    },
  });

  useEffect(() => {
    function onInsert(event: Event) {
      const key = (event as CustomEvent<SixKey>).detail;
      const prompt = sixQ.find((item) => item.key === key);
      if (!prompt || !editor) return;
      editor.chain().focus().insertContent(`\n\n## ${prompt.label}: ${prompt.prompt}\n`).run();
    }
    window.addEventListener('cr:insert-template', onInsert);
    return () => window.removeEventListener('cr:insert-template', onInsert);
  }, [editor, sixQ]);

  function touch(patch: Partial<ReadingNote>) {
    const ts = new Date().toISOString();
    setSavedAt(ts);
    onChange({...patch, updatedAt: ts});
  }

  function setQField(key: SixKey, value: string) {
    const next = {...q, [key]: value};
    setQ(next);
    touch({sixQuestions: next});
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) return;
    const next = [...tags, tag];
    setTags(next);
    setTagInput('');
    touch({tags: next});
  }

  function addHighlight() {
    const highlight = hlInput.trim();
    if (!highlight) return;
    const next = [highlight, ...highlights];
    setHighlights(next);
    setHlInput('');
    touch({highlights: next});
  }

  function saveSnapshot() {
    if (!editor) return;
    const snap = {
      id: `snap-${Date.now().toString(36)}`,
      savedAt: new Date().toISOString(),
      freeform: editor.getHTML(),
      sixQuestions: q,
      highlights,
      wordCount,
    };
    const existing = note.snapshots ?? [];
    touch({snapshots: [snap, ...existing].slice(0, 20)});
  }

  function restoreSnapshot(snapshot: any) {
    if (!editor) return;
    editor.commands.setContent(snapshot.freeform || '');
    const restoredQuestions = snapshot.sixQuestions ?? q;
    const restoredHighlights = snapshot.highlights ?? highlights;
    const restoredWordCount = snapshot.wordCount ?? 0;
    setQ(restoredQuestions);
    setHighlights(restoredHighlights);
    setWordCount(restoredWordCount);
    touch({
      freeform: snapshot.freeform || '',
      sixQuestions: restoredQuestions,
      highlights: restoredHighlights,
      wordCount: restoredWordCount,
    });
  }

  function buildMarkdown(): string {
    const bodyText = editor?.getText() || stripHtml(note.freeform ?? '');
    return [
      `# ${title}`,
      `${copy.authorLine}: ${author || '-'} · ${year}`,
      `${copy.tagLine}: ${tags.join(', ') || '-'}`,
      '',
      ...sixQ.map((item) => `## ${item.label}\n${q[item.key] ?? ''}`),
      '',
      `## ${copy.highlightsTitle}`,
      ...(highlights.length ? highlights.map((highlight) => `- ${highlight}`) : ['-']),
      '',
      `## ${copy.freeformTitle}`,
      bodyText,
    ].join('\n\n');
  }

  function exportFile(type: 'md' | 'txt') {
    const content = buildMarkdown();
    const blob = new Blob([content], {type: type === 'md' ? 'text/markdown' : 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.slice(0, 30)}.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(buildMarkdown());
    } catch {
      // Clipboard permissions vary by browser.
    }
  }

  const outline = useMemo(() => {
    if (typeof window === 'undefined' || !editor) return [];
    try {
      const html = editor.getHTML();
      return Array.from(html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
        .map((match) => match[1].replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }, [editor, savedAt]);

  const formattedSavedAt = savedAt
    ? new Date(savedAt).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US')
    : copy.unsaved;

  return (
    <div className={styles.editor}>
      <div className={styles.editorHead}>
        <input
          className={styles.titleInput}
          value={title}
          placeholder={copy.titlePlaceholder}
          onChange={(event) => {
            setTitle(event.target.value);
            touch({title: event.target.value});
          }}
        />
        <Select
          value={status}
          onValueChange={(value) => {
            const next = value as NoteStatus;
            setStatus(next);
            touch({status: next});
          }}
        >
          <SelectTrigger className={styles.statusSel}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">{statusLabel.draft}</SelectItem>
            <SelectItem value="in-review">{statusLabel['in-review']}</SelectItem>
            <SelectItem value="final">{statusLabel.final}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div style={{display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: 11, color: '#64748b', marginBottom: 8}}>
        <span><Clock size={10} style={{verticalAlign: -1}} /> {copy.savedAt}: {formattedSavedAt}</span>
        <span style={{marginLeft: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap'}}>
          <Button size="sm" variant="ghost" onClick={copyAll} title={copy.copyAll}><Copy size={11} /> {copy.copyAll}</Button>
          <Button size="sm" variant="ghost" onClick={saveSnapshot} title={copy.saveSnapshot}><ArrowDownToLine size={11} /> {copy.saveSnapshot}</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowVersions(!showVersions)} title={copy.versions}>
            <Clock size={11} /> {copy.versions} ({(note.snapshots ?? []).length})
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportFile('md')}><Download size={11} /> {copy.exportMd}</Button>
          <Button size="sm" variant="outline" onClick={() => exportFile('txt')}>{copy.exportTxt}</Button>
        </span>
      </div>

      <div className={styles.metaRow}>
        <Input
          value={author}
          onChange={(event) => {
            setAuthor(event.target.value);
            touch({author: event.target.value});
          }}
          placeholder={copy.authors}
        />
        <Input
          type="number"
          value={year}
          onChange={(event) => {
            const next = Number(event.target.value) || new Date().getFullYear();
            setYear(next);
            touch({year: next});
          }}
          placeholder={copy.year}
        />
        <div className={styles.tagInput}>
          <Input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder={copy.addTagPlaceholder}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag();
              }
            }}
          />
          <Button size="sm" variant="outline" onClick={addTag}><TagIcon size={11} /> {copy.addTag}</Button>
        </div>
      </div>

      <div className={styles.tagsRow}>
        {visibleTags(tags, lang).map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => {
                const next = tags.filter((item) => item !== tag);
                setTags(next);
                touch({tags: next});
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {showVersions && (note.snapshots ?? []).length > 0 ? (
        <div style={{padding: 10, background: '#fef9c3', border: '1px solid #facc15', borderRadius: 6, marginBottom: 12}}>
          <h4 className={styles.sectionTitle} style={{margin: 0, marginBottom: 6}}><Clock size={11} /> {copy.versions}</h4>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4}}>
            {(note.snapshots ?? []).map((snapshot: any) => (
              <li key={snapshot.id} style={{display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#713f12'}}>
                <span>{new Date(snapshot.savedAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')} · {snapshot.wordCount} {copy.wordSuffix}</span>
                <button type="button" onClick={() => restoreSnapshot(snapshot)} style={{background: 'transparent', border: 0, color: '#1f4ed8', cursor: 'pointer', fontSize: 11.5}}>{copy.restore}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.six}>
        <h3 className={styles.sectionTitle}><BookOpen size={11} /> {copy.sixQuestions}</h3>
        <div className={styles.sixGrid}>
          {sixQ.map((item) => (
            <div key={item.key} className={styles.sixItem}>
              <div className={styles.sixLabel}>{item.label} · {item.prompt}</div>
              <textarea
                className={styles.sixInput}
                rows={3}
                value={q[item.key] ?? ''}
                onChange={(event) => setQField(item.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.hl}>
        <h3 className={styles.sectionTitle}><Quote size={11} /> {copy.highlights}</h3>
        <div className={styles.tagInput}>
          <Input
            value={hlInput}
            onChange={(event) => setHlInput(event.target.value)}
            placeholder={copy.hlPlaceholder}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addHighlight();
              }
            }}
          />
          <Button size="sm" variant="outline" onClick={addHighlight}><Quote size={11} /> {copy.addHighlight}</Button>
        </div>
        <ul className={styles.hlList}>
          {highlights.map((highlight, index) => <li key={`${highlight}-${index}`}>{highlight}</li>)}
        </ul>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 200px', gap: 12, alignItems: 'start'}}>
        <div className={styles.editorBody}>
          <div className={styles.toolbar}>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({level: 2}).run()} className={`${styles.tool} ${editor?.isActive('heading', {level: 2}) ? styles.toolOn : ''}`} title={copy.toolbarH2}><Heading2 size={13} /></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`${styles.tool} ${editor?.isActive('bold') ? styles.toolOn : ''}`} title={copy.toolbarBold}><Bold size={13} /></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`${styles.tool} ${editor?.isActive('italic') ? styles.toolOn : ''}`} title={copy.toolbarItalic}><Italic size={13} /></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`${styles.tool} ${editor?.isActive('bulletList') ? styles.toolOn : ''}`} title={copy.toolbarBullet}><List size={13} /></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`${styles.tool} ${editor?.isActive('orderedList') ? styles.toolOn : ''}`} title={copy.toolbarOrdered}><ListOrdered size={13} /></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`${styles.tool} ${editor?.isActive('blockquote') ? styles.toolOn : ''}`} title={copy.toolbarQuote}><Quote size={13} /></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`${styles.tool} ${editor?.isActive('codeBlock') ? styles.toolOn : ''}`} title={copy.toolbarCode}><Code size={13} /></button>
            <span className={styles.wordCount}>{copy.wordCount}: {wordCount}</span>
          </div>
          <EditorContent editor={editor} className={styles.editorContent} />
        </div>

        <aside style={{border: '1px solid var(--cr-line, #e2e8f0)', borderRadius: 8, padding: 10, background: 'var(--cr-paper-2, #f8fafc)'}}>
          <h4 className={styles.sectionTitle} style={{margin: 0, marginBottom: 8}}><Heading1 size={11} /> {copy.outline}</h4>
          {outline.length === 0 ? (
            <p style={{fontSize: 11, color: '#94a3b8', margin: 0}}>{copy.outlineEmpty}</p>
          ) : (
            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4}}>
              {outline.map((heading, index) => (
                <li key={`${heading}-${index}`} style={{fontSize: 12, padding: '4px 8px', borderLeft: '2px solid var(--cr-accent, #1f4ed8)', color: 'var(--cr-ink-2, #334155)'}}>{heading}</li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
