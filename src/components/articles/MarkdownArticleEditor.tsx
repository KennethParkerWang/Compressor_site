import React from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getNodeByKey} from 'lexical';
import {usePublisher} from '@mdxeditor/gurx';
import {
  $isImageNode,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  openEditImageDialog$,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type ImageUploadHandler,
} from '@mdxeditor/editor';
import {Maximize2, Minimize2, Settings2, Trash2} from 'lucide-react';
import '@mdxeditor/editor/style.css';
import {stripImageWidthMarker, withImageWidthMarker} from './ArticleMarkdown';
import styles from './markdownArticleEditor.module.css';

interface ArticleImageToolbarProps {
  nodeKey: string;
  imageSource: string;
  initialImagePath: string | null;
  title: string;
  alt: string;
  width?: number | 'inherit';
  height?: number | 'inherit';
}

function ArticleImageToolbar(props: ArticleImageToolbarProps): React.ReactElement {
  const [editor] = useLexicalComposerContext();
  const openEdit = usePublisher(openEditImageDialog$);
  const full = stripImageWidthMarker(props.title).full;

  const remove = (): void => editor.update(() => { $getNodeByKey(props.nodeKey)?.remove(); });
  const toggleWidth = (): void => editor.update(() => {
    const node = $getNodeByKey(props.nodeKey);
    if ($isImageNode(node)) node.setTitle(withImageWidthMarker(node.getTitle() ?? '', !full));
  });

  return (
    <div className={styles.imageToolbar}>
      <button type="button" title="删除图片" onClick={remove}><Trash2 size={14} /></button>
      <button type="button" title="更换图片、编辑替代文字与图片说明" onClick={() => openEdit({nodeKey: props.nodeKey, initialValues: {src: props.initialImagePath ?? props.imageSource, title: props.title, altText: props.alt, width: typeof props.width === 'number' ? props.width : undefined, height: typeof props.height === 'number' ? props.height : undefined}})}><Settings2 size={14} /></button>
      <button type="button" title={full ? '切换为普通宽度' : '切换为全宽'} onClick={toggleWidth}>{full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
    </div>
  );
}

export default function MarkdownArticleEditor({
  markdown,
  onChange,
  imageUploadHandler,
  onError,
}: {
  markdown: string;
  onChange: (markdown: string) => void;
  imageUploadHandler: ImageUploadHandler;
  onError: (message: string) => void;
}): React.ReactElement {
  const plugins = React.useMemo(() => [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    codeBlockPlugin({defaultCodeBlockLanguage: ''}),
    codeMirrorPlugin({codeBlockLanguages: {'': '纯文本', js: 'JavaScript', ts: 'TypeScript', python: 'Python', bash: 'Shell', json: 'JSON'}}),
    imagePlugin({imageUploadHandler, disableImageResize: true, EditImageToolbar: ArticleImageToolbar}),
    markdownShortcutPlugin(),
    toolbarPlugin({toolbarContents: () => <>
      <UndoRedo /><Separator />
      <BlockTypeSelect /><Separator />
      <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
      <StrikeThroughSupSubToggles options={['Strikethrough']} />
      <CodeToggle /><Separator />
      <ListsToggle options={['bullet', 'number']} />
      <CreateLink /><InsertCodeBlock /><InsertTable /><InsertThematicBreak /><InsertImage />
    </>}),
  ], [imageUploadHandler]);

  return (
    <MDXEditor
      className={styles.editor}
      contentEditableClassName={styles.editorContent}
      markdown={markdown}
      onChange={(value, initialNormalize) => { if (!initialNormalize) onChange(value); }}
      onError={(payload) => onError(payload.error)}
      placeholder="输入文章正文，或将图片拖入、粘贴到当前位置…"
      plugins={plugins}
    />
  );
}
