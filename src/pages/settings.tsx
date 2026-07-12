// Settings - 4 个 tab: API / 外观 / 导入 / 关于本机
import React, {useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {useSettings} from '../stores/workbench';
import {useTasks} from '../stores/workbench';
import {useNotes} from '../stores/workbench';
import {useFeed} from '../stores/workbench';
import {tasksToIcs, downloadIcs} from '../utils/icalUtils';
import {AlertTriangle, Calendar, Check, Download, Eye, KeyRound, Palette, Save, Upload, Zap, Database, Sparkles} from 'lucide-react';
import styles from './settings.module.css';

const CN = {
  about: "关于",
  aboutText: "压缩算法研图 / Compression Research Atlas — 个人压缩算法科研工作台。v3.0 工作台原型。",
  api: "数据源配置",
  apiKeyPh: "API Key(可选, 提高限额)",
  appearance: "外观",
  comfortable: "舒适",
  compact: "紧凑",
  connect: "连接",
  danger: "危险操作",
  density: "密度",
  disconnect: "断开",
  enabled: "启用",
  endpointPh: "自定义 endpoint(可选)",
  export: "导出备份",
  exportHint: "导出所有本地数据为 JSON 文件(Tasks / Notes / Feed / Settings)。",
  feedCount: "候选",
  google: "Google Calendar",
  hint: "管理外部源凭据(API Key 或联系邮箱)、数据源、主题外观、导入导出。凭据仅保存在你的浏览器本地。",
  import: "导入备份",
  importExport: "导入导出",
  importHint: "从 JSON 备份恢复。注意:导入会覆盖现有数据。",
  notEnabled: "未启用",
  notesCount: "笔记",
  reset: "重置",
  resetAll: "重置所有本地数据",
  save: "保存",
  swatch: "预览",
  tabAbout: "关于",
  tabApi: "API 与数据源",
  tabAppearance: "外观",
  tabImport: "导入导出",
  tasksCount: "任务",
  theme: "主题",
  title: "设置 / Settings",};;

function sourceCredentialPlaceholder(id: string): string {
  if (id === 'unpaywall') return 'Unpaywall 联系邮箱(必填)';
  if (id === 'semantic-scholar') return 'Semantic Scholar API Key(可选)';
  if (id === 'github') return 'GitHub Token(可选)';
  return CN.apiKeyPh;
}

export default function SettingsPage(): React.ReactElement {
  const {settings, setDensity, toggleSource, setSourceKey} = useSettings();
  const tasksCount = useTasks((s) => s.tasks.length);
  const notesCount = useNotes((s) => s.notes.length);
  const feedCount = useFeed((s) => s.items.length);
  const fileInput = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function download(filename: string, content: string) {
    const blob = new Blob([content], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportAll() {
    const payload = {
      v: 3,
      ts: new Date().toISOString(),
      settings,
      tasks: useTasks.getState().tasks,
      notes: useNotes.getState().notes,
      feed: useFeed.getState().items,
    };
    download(`cr-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
    setMsg('✓ 已导出');
    setTimeout(() => setMsg(null), 2000);
  }

  function importFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result));
        if (data.settings) useSettings.setState({settings: data.settings});
        if (data.tasks) useTasks.setState({tasks: data.tasks});
        if (data.notes) useNotes.setState({notes: data.notes});
        if (data.feed) useFeed.setState({items: data.feed});
        setMsg('✓ 已导入,数据已恢复');
      } catch (err: any) {
        setMsg('✗ 导入失败:' + (err.message ?? 'JSON 文件无效'));
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm('确认清空所有本地数据?此操作不可恢复。')) return;
    localStorage.clear();
    setMsg('✓ 已重置,刷新页面');
  }

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title} pageHint={CN.hint}>
        <Tabs defaultValue="api">
          <TabsList>
            <TabsTrigger value="api"><KeyRound size={14} /> {CN.tabApi}</TabsTrigger>
            <TabsTrigger value="appearance"><Palette size={14} /> {CN.tabAppearance}</TabsTrigger>
            <TabsTrigger value="import"><Database size={14} /> {CN.tabImport}</TabsTrigger>
            <TabsTrigger value="about"><Sparkles size={14} /> {CN.tabAbout}</TabsTrigger>
          </TabsList>

          <TabsContent value="api">
            <Card className={styles.section}>
              <CardHeader><CardTitle><KeyRound size={16} /> {CN.api}</CardTitle></CardHeader>
              <CardContent>
                <ul className={styles.sourceList}>
                  {Object.values(settings.sources).map((src) => (
                    <li key={src.id} className={styles.sourceRow}>
                      <div className={styles.sourceLeft}>
                        <button type="button" onClick={() => toggleSource(src.id)} className={`${styles.toggle} ${src.enabled ? styles.toggleOn : ''}`}>
                          <span className={styles.toggleThumb} />
                        </button>
                        <div>
                          <div className={styles.sourceName}>{src.id}</div>
                          <div className={styles.sourceHint}>{src.enabled ? CN.enabled : CN.notEnabled}</div>
                        </div>
                      </div>
                      <div className={styles.sourceRight}>
                        <Input placeholder={sourceCredentialPlaceholder(src.id)} value={src.apiKey ?? ''} onChange={(e) => setSourceKey(src.id, e.target.value)} type={src.id === 'unpaywall' ? 'email' : 'password'} className={styles.keyInput} />
                        <Input placeholder={CN.endpointPh} value={src.endpoint ?? ''} onChange={(e) => useSettings.setState((s) => ({settings: {...s.settings, sources: {...s.settings.sources, [src.id]: {...src, endpoint: e.target.value}}}}))} className={styles.endpointInput} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className={styles.section}>
              <CardHeader><CardTitle><Calendar size={16} /> {CN.google}</CardTitle></CardHeader>
              <CardContent>
                <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                  <Button onClick={() => {
                    const tasks = useTasks.getState().tasks;
                    const ics = tasksToIcs(tasks);
                    downloadIcs(`research-tasks-${new Date().toISOString().slice(0,10)}.ics`, ics);
                    setMsg('✓ 已导出 .ics 文件');
                    setTimeout(() => setMsg(null), 3000);
                  }}>
                    <Download size={14} /> 导出 iCal (.ics)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className={styles.section}>
              <CardHeader><CardTitle><Eye size={16} /> {CN.density}</CardTitle></CardHeader>
              <CardContent>
                <div className={styles.densityRow}>
                  <label>{CN.density}</label>
                  <Select value={settings.density} onValueChange={(v) => setDensity(v as any)}>
                    <SelectTrigger className={styles.densitySel}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">{CN.comfortable}</SelectItem>
                      <SelectItem value="compact">{CN.compact}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <div className={styles.dualGrid}>
              <Card className={styles.section}>
                <CardHeader><CardTitle><Upload size={16} /> {CN.export}</CardTitle></CardHeader>
                <CardContent>
                  <p className={styles.hint}>{CN.exportHint}</p>
                  <div className={styles.miniStat}>
                    <span>{CN.tasksCount}: <strong>{tasksCount}</strong></span>
                    <span>{CN.notesCount}: <strong>{notesCount}</strong></span>
                    <span>{CN.feedCount}: <strong>{feedCount}</strong></span>
                                      </div>
                  <Button onClick={exportAll}><Download size={14} /> {CN.export}</Button>
                </CardContent>
              </Card>
              <Card className={styles.section}>
                <CardHeader><CardTitle><Download size={16} /> {CN.import}</CardTitle></CardHeader>
                <CardContent>
                  <p className={styles.hint}>{CN.importHint}</p>
                  <input ref={fileInput} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
                  <Button variant="outline" onClick={() => fileInput.current?.click()}><Upload size={14} /> 选择 JSON 备份</Button>
                </CardContent>
              </Card>
            </div>

            <Card className={`${styles.section} ${styles.danger}`}>
              <CardHeader><CardTitle><AlertTriangle size={16} /> {CN.danger}</CardTitle></CardHeader>
              <CardContent>
                <Button variant="outline" onClick={resetAll}>重置所有本地数据</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card className={styles.section}>
              <CardContent>
                <h3 className={styles.aboutTitle}>{CN.aboutText}</h3>
                <ul className={styles.aboutList}>
                  <li>v3.0 Workbench prototype</li>
                  <li>文献库:338 条压缩算法相关文献(可在 literatureData.ts 持续扩充)</li>
                  <li>页面:Library / Map / Reading Paths / Notes / Tasks / Calendar / Feed / Standards / Experiments / Modules / Settings / Hub / Terms</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {msg ? <div className={styles.toast}>{msg}</div> : null}
      </WorkbenchShell>
    </Layout>
  );
}
