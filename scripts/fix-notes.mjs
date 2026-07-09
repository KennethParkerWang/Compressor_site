// scripts/fix-notes.mjs - 给 notes.tsx 加 Zotero 笔记面板 + 顶部使用说明
import {readFileSync, writeFileSync} from 'node:fs';

let src = readFileSync('src/pages/notes.tsx', 'utf8');

// 1) 顶部加 zoteroSyncMock import
src = src.replace(
  "import {literatureData} from '../data/literatureData';",
  "import {literatureData} from '../data/literatureData';\nimport {zoteroSyncMock} from '../data/zoteroSyncMock';",
);

// 2) 在 layout 之前增加"使用说明"块
const usageBlock = `<WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div style={{marginBottom: 18, padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, color: '#0c4a6e', fontSize: 13}}>
          <strong>怎么用这一页</strong> · 三栏布局:左 笔记+文献列表 / 中 Tiptap 富文本 + 六问表单 + 引用 / 右 六问模板 + 相关文献 + Zotero 笔记。所有修改自动保存到 localStorage。
        </div>
        <div className={styles.layout}>`;

src = src.replace(
  '<WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>\n        <div className={styles.layout}>',
  usageBlock,
);

// 3) 在右侧 RelatedPaper 后加 Zotero 笔记面板
const zoteroPanel = `<Separator />
            <h3 className={styles.rightTitle}>Zotero 笔记</h3>
            <ZoteroNotesPanel litId={active?.litId ?? ''} />`;

src = src.replace(
  '{active ? <RelatedPaper litId={active.litId} /> : null}',
  `{active ? <RelatedPaper litId={active.litId} /> : null}
            ${zoteroPanel}`,
);

// 4) 在文件末尾添加 ZoteroNotesPanel 组件
const zoteroComponent = `
function ZoteroNotesPanel({litId}: {litId: string}) {
  const matched = zoteroSyncMock.items.find((it) => it.matchedLitId === litId);
  if (!matched) {
    return <p className={styles.empty}>此文献尚未在 Zotero 模拟库中匹配。<br />到 Zotero 页查找 / 关联。</p>;
  }
  const notes = zoteroSyncMock.notes.filter((n) => n.itemKey === matched.key);
  if (notes.length === 0) {
    return <p className={styles.empty}>Zotero 中此条目暂无笔记。</p>;
  }
  return (
    <div className={styles.zoteroNotes}>
      <p className={styles.relMeta}>来自 Zotero · {matched.key} · {notes.length} 条</p>
      <ul>
        {notes.map((n) => (
          <li key={n.key} style={{padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, marginBottom: 6}}>
            <div style={{color: '#64748b', fontSize: 11, marginBottom: 4}}>{new Date(n.updatedAt).toLocaleString()}</div>
            <div>{n.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

src = src + zoteroComponent;

writeFileSync('src/pages/notes.tsx', src, 'utf8');
console.log('OK, len:', src.length);