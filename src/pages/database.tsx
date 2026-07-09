// Database - 文献库简表:筛选 + 表格 + 跳转 Library / Notes
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {literatureData} from '../data/literatureData';
import {treeData} from '../data/treeData';
import styles from './database.module.css';

const CN = {
  all: "全部",
  chapter: "章节",
  fullLibrary: "完整 Library",
  hint: "当前收录 338 条文献。按章节或关键词快速定位,点行进 Library 看完整筛选 / 批量操作。",
  search: "搜索",
  title: "文献库总表 / Database",
};;

export default function DatabasePage(): React.ReactElement {
  const [chapter, setChapter] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(200);

  const filtered = useMemo(() => {
    let arr = literatureData;
    if (chapter !== 'all') arr = arr.filter((l) => l.chapterId === chapter);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((l) => l.title.toLowerCase().includes(q) || (l.authors ?? '').toLowerCase().includes(q));
    }
    return arr.slice(0, limit);
  }, [chapter, query, limit]);

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div className={styles.filterRow}>
          <Input placeholder={CN.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={chapter} onValueChange={setChapter}>
            <SelectTrigger className={styles.select}><SelectValue placeholder={CN.chapter} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{CN.all}</SelectItem>
              {treeData.map((c) => <SelectItem key={c.id} value={c.id}>{c.id} · {c.titleZh ?? c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Link to="/library"><Button variant="outline">{CN.fullLibrary} →</Button></Link>
          <span className={styles.count}>{filtered.length} 条</span>
        </div>

        <Card>
          <CardContent className={styles.tableWrap}>
            <div className={styles.thead}>
              <div className={styles.cId}>ID</div>
              <div className={styles.cCh}>章节</div>
              <div className={styles.cTitle}>标题</div>
              <div className={styles.cAuth}>作者</div>
              <div className={styles.cYear}>年份</div>
            </div>
            {filtered.map((l) => (
              <Link key={l.id} to={`/library?lit=${l.id}`} className={styles.row}>
                <div className={styles.cId}>{l.id}</div>
                <div className={styles.cCh}>{l.chapterId}</div>
                <div className={styles.cTitle}>{l.title}</div>
                <div className={styles.cAuth}>{l.authors ?? '-'}</div>
                <div className={styles.cYear}>{l.year ?? '-'}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
        {filtered.length >= limit ? (
          <div className={styles.more}>
            <Button onClick={() => setLimit((l) => l + 200)} variant="outline">加载更多</Button>
          </div>
        ) : null}
      </WorkbenchShell>
    </Layout>
  );
}