// Core - 核心论文集:筛选 + 网格 + 加入任务
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {literatureData} from '../data/literatureData';
import {useTasks} from '../stores/workbench';
import {ChevronRight, ExternalLink, Plus, Sparkles} from 'lucide-react';
import styles from './core.module.css';

const CN = {
  addNote: "加入笔记",
  addRead: "加入阅读",
  all: "全部",
  benefit: "读完能获得",
  hint: "从 338 条文献中挑出奠基 / 必读 / 选读 / 扩展,每篇都标注为什么核心 + 读完能获得什么。点行进 Library 看全部。",
  priority: "优先级",
  reason: "为什么核心",
  refs: "关联路线",
  search: "搜索论文",
  title: "核心论文 / Core Papers",
};;

const PRIORITY_COLOR: Record<string, string> = {奠基: '#1d4ed8', 必读: '#b45309', 选读: '#059669', 扩展: '#7c3aed'};

export default function CorePage(): React.ReactElement {
  const {addTask} = useTasks();
  const [priority, setPriority] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let arr = literatureData.filter((l) => l.priority && (l.coreReason || l.readerBenefit));
    if (priority !== 'all') arr = arr.filter((l) => l.priority === priority);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((l) => l.title.toLowerCase().includes(q) || (l.authors ?? '').toLowerCase().includes(q));
    }
    return arr;
  }, [priority, query]);

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <div className={styles.filterRow}>
          <Input placeholder={CN.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className={styles.select}><SelectValue placeholder={CN.priority} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{CN.all}</SelectItem>
              <SelectItem value="奠基">奠基</SelectItem>
              <SelectItem value="必读">必读</SelectItem>
              <SelectItem value="选读">选读</SelectItem>
              <SelectItem value="扩展">扩展</SelectItem>
            </SelectContent>
          </Select>
          <span className={styles.count}>{filtered.length} 篇</span>
        </div>

        <div className={styles.grid}>
          {filtered.map((l) => (
            <Card key={l.id} className={styles.card}>
              <CardContent>
                <header className={styles.cardHead}>
                  <span className={styles.priDot} style={{background: PRIORITY_COLOR[l.priority ?? ''] ?? '#64748b'}}>{l.priority}</span>
                  <span className={styles.cardId}>{l.id}</span>
                </header>
                <h3 className={styles.cardTitle}>{l.title}</h3>
                <div className={styles.cardMeta}>{l.authors ?? '-'} · {l.year ?? '-'}</div>
                {l.coreReason ? <p className={styles.reason}><Sparkles size={11} /> {l.coreReason}</p> : null}
                {l.readerBenefit ? <p className={styles.benefit}>→ {l.readerBenefit}</p> : null}
                <div className={styles.cardFoot}>
                  {l.url ? <a href={l.url} target="_blank" rel="noreferrer" className={styles.linkBtn}><ExternalLink size={12} /> 查看原文</a> : null}
                  <Button size="sm" variant="outline" onClick={() => addTask({title: `读 ${l.title}`, status: 'todo', lane: 'this-week', refs: [{kind: 'paper', refId: l.id, label: l.title}], dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), estimatedMinutes: 120, priority: 'normal'})}><Plus size={11} /> {CN.addRead}</Button>
                  <Button size="sm" onClick={() => addTask({title: `写 ${l.title} 六问`, status: 'todo', lane: 'needs-note', refs: [{kind: 'paper', refId: l.id, label: l.title}], dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), estimatedMinutes: 180, priority: 'normal'})}><Plus size={11} /> {CN.addNote}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </WorkbenchShell>
    </Layout>
  );
}