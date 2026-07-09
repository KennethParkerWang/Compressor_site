// Experiments - 6 步实验向导
import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import WorkbenchShell from '../components/workbench/WorkbenchShell';
import {Card, CardContent} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Textarea} from '../components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {baselines as BASELINES, datasets as DATASETS, metrics as METRICS} from '../data/experimentWizard';
import {DATASET_DOMAIN_LABELS, type DatasetDomain} from '../data/datasets';
import {experimentAssets as experimentData} from '../data/experimentData';
import {useTasks} from '../stores/workbench';
import {ChevronLeft, ChevronRight, FlaskConical, ListChecks, Save, Sparkles, CheckCircle2, FileText, Download, Cpu, BarChart3, ClipboardList, Wrench} from 'lucide-react';
import styles from './experiments.module.css';

const CN = {
  baseline: "Baseline",
  blockExplain: "块大小(每个被压缩的最小单元)决定压缩器一次能『看见』多少字节。32K 适合文本,128K 适合大日志,1M 适合图像。",
  blockSize: "块大小",
  cmdHint: "命令模板",
  cmdHint2: "把这些命令复制到本地终端运行,bit-exact 比对参考实现。",
  config: "设置指标",
  configHint: "选数据集、压缩器、块大小、指标,生成命令,记录结果。",
  createTasks: "创建这些任务",
  customExp: "自定义",
  dataset: "数据集",
  datasetStep: "Step 1 选择数据集",
  datasetStepHint: "标准语料 / 你的真实数据。先在熟悉的数据上跑通。",
  expName: "实验名",
  bpbExplain: "BPB (Bits Per Byte):每字节编码用的比特数。理论下界 = 熵;实际值越接近熵,压缩率越高。1.234 表示每字节用 1.234 比特。",
  metricExplain: "bit-exact:压缩后再解压,与原文件按字节比对必须完全一致。无损压缩的硬性要求。有损压缩不需要 bit-exact,但要看 PSNR / SSIM 等。",
  resultExplain: "压缩比 (Ratio) = 1 - 压缩后/原大小。吞吐 (MB/s) 反映速度。比较时要记录参数和硬件。",
  finish: "完成 → 创建任务",
  hint: "配置并运行压缩实验:选数据、选压缩器、设块大小、记录指标、检查 bit-exact,并导出结果表。",
  metric: "评估指标",
  next: "下一步",
  pickBaseline: "选 Baseline",
  pickBaselineHint: "从已知压缩器模板开始,或自定义。",
  pickBlock: "Step 3 选择块大小",
  pickBlockHint: "按数据规模选:32K 适合文本 / 128K 适合通用 / 1M+ 适合大文件。",
  pickCmd: "Step 5 生成命令",
  pickCmdHint: "复制命令到终端运行。bit-exact 验证后再回填结果。",
  pickMetric: "Step 4 选择指标",
  pickMetricHint: "至少跑一个压缩率指标 + 一个吞吐指标;同时记录内存峰值。",
  pre: "准备数据",
  prev: "上一步",
  recordResult: "Step 6 记录结果",
  recordResultHint: "填入实际跑的 BPB / 吞吐 / 压缩比。导出 CSV 留底。",
  report: "整理结果",
  result: "结果",
  resultHint: "完成后填入 BPB / 压缩率 / 速度等结果。",
  run: "跑实验",
  save: "保存草稿",
  split: "拆任务",
  splitHint: "自动拆出数据准备 / 跑实验 / 整理结果 三个任务,可调整后再创建。",
  step: "步",
  step2: "Step 2 选择压缩器",
  step2Hint: "从通用 (zstd / bzip3) 到 PAQ 系列,压缩率递增,速度递减。",
  taskPriority: "默认优先级",
  taskTime: "默认时长(分钟)",
  tips: "Tips",
  title: "实验复现 / Experiments",
};

const BLOCK_SIZES = [
  {id: '32k', name: '32 KB', hint: '适合文本 / 小文件', useFor: '源文件、网页、日志'},
  {id: '64k', name: '64 KB', hint: '通用平衡', useFor: '混合语料'},
  {id: '128k', name: '128 KB', hint: '通用较大块', useFor: '备份 / Silesia'},
  {id: '256k', name: '256 KB', hint: '大块减少头开销', useFor: '大文件'},
  {id: '1m', name: '1 MB', hint: '极大块,需内存大', useFor: '科学数组 / 图像'},
];

const DATASET_DOMAINS: Array<DatasetDomain | 'all'> = ['all', 'general', 'text', 'image', 'video', 'audio', 'scientific', 'genomic', 'structured'];

export default function ExperimentsPage(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focusExp = params.get('exp');
  const focusDataset = params.get('dataset');

  const {addTask} = useTasks();
  const [step, setStep] = useState(0);
  const [dataset, setDataset] = useState<string>(DATASETS[0]?.id ?? '');
  const [datasetDomain, setDatasetDomain] = useState<DatasetDomain | 'all'>('all');
  const [baselineId, setBaselineId] = useState<string>(BASELINES[0]?.id ?? '');
  const [block, setBlock] = useState<string>('128k');
  const [metric, setMetric] = useState<string>(METRICS[0]?.id ?? '');
  const [name, setName] = useState(BASELINES[0]?.name ?? '');
  const [bpb, setBpb] = useState('');
  const [speed, setSpeed] = useState('');
  const [ratio, setRatio] = useState('');
  const [bitExact, setBitExact] = useState<'yes' | 'no' | 'pending'>('pending');
  const [notes, setNotes] = useState('');
  const [preMin, setPreMin] = useState(60);
  const [runMin, setRunMin] = useState(180);
  const [reportMin, setReportMin] = useState(90);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  const baseline = useMemo(() => BASELINES.find((b) => b.id === baselineId), [baselineId]);
  const datasetEntry = useMemo(() => DATASETS.find((d) => d.id === dataset), [dataset]);
  const metricEntry = useMemo(() => METRICS.find((m) => m.id === metric), [metric]);

  React.useEffect(() => {
    const e = experimentData.find((x) => x.id === focusExp);
    if (e) setName(e.name);
  }, [focusExp]);

  React.useEffect(() => {
    if (!focusDataset) return;
    const next = DATASETS.find((entry) => entry.id === focusDataset);
    if (next) {
      setDataset(next.id);
      setDatasetDomain(next.category);
    }
  }, [focusDataset]);

  const filteredDatasets = useMemo(
    () => datasetDomain === 'all' ? DATASETS : DATASETS.filter((entry) => entry.category === datasetDomain),
    [datasetDomain],
  );

  function next() { setStep((s) => Math.min(5, s + 1)); }
  function prev() { setStep((s) => Math.max(0, s - 1)); }

  function createAllTasks() {
    const due = new Date(); due.setDate(due.getDate() + 7);
    addTask({title: `[${name}] ${CN.pre} (${datasetEntry?.name ?? dataset})`, status: 'todo', lane: 'needs-experiment', refs: [{kind: 'experiment', refId: baselineId, label: name}], dueDate: due.toISOString().slice(0, 10), estimatedMinutes: preMin, priority});
    addTask({title: `[${name}] ${CN.run} (${datasetEntry?.name ?? dataset}, ${baseline?.name ?? ''}, ${block})`, status: 'todo', lane: 'needs-experiment', refs: [{kind: 'experiment', refId: baselineId, label: name}], dueDate: new Date(due.getTime() + 2 * 86400000).toISOString().slice(0, 10), estimatedMinutes: runMin, priority});
    addTask({title: `[${name}] ${CN.report} (${metricEntry?.name ?? metric}=${bpb || '?'})`, status: 'todo', lane: 'needs-report', refs: [{kind: 'experiment', refId: baselineId, label: name}], dueDate: new Date(due.getTime() + 4 * 86400000).toISOString().slice(0, 10), estimatedMinutes: reportMin, priority});
  }

  const STEPS = [
    {label: CN.datasetStep, icon: <FileText size={14} />},
    {label: CN.step2, icon: <Cpu size={14} />},
    {label: CN.pickBlock, icon: <Wrench size={14} />},
    {label: CN.pickMetric, icon: <BarChart3 size={14} />},
    {label: CN.pickCmd, icon: <ClipboardList size={14} />},
    {label: CN.recordResult, icon: <Download size={14} />},
  ];

  return (
    <Layout title={CN.title} description={CN.hint}>
      <WorkbenchShell pageTitle={CN.title}>

        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} className={`${styles.stepDot} ${i === step ? styles.stepDotOn : ''} ${i < step ? styles.stepDotDone : ''}`}>
              <span className={styles.stepIndex}>{i + 1}</span>
              <span className={styles.stepLabel}>{s.label}</span>
              {s.icon}
              {i < 5 ? <ChevronRight size={14} className={styles.stepArrow} /> : null}
            </div>
          ))}
        </div>

        <Card className={styles.main}>
          <CardContent>
            {/* Step 1: 数据集 */}
            {step === 0 ? (
              <div>
                <h3 className={styles.stepH}>{CN.datasetStep}</h3>
                <p className={styles.stepHint}>{CN.datasetStepHint}</p>
                <div className={styles.domainFilter}>
                  {DATASET_DOMAINS.map((item) => (
                    <button key={item} type="button" className={datasetDomain === item ? styles.domainFilterOn : ''} onClick={() => setDatasetDomain(item)}>
                      {item === 'all' ? '全部' : DATASET_DOMAIN_LABELS[item].label}
                    </button>
                  ))}
                </div>
                <div className={styles.expGrid}>
                  {filteredDatasets.map((d) => (
                    <button key={d.id} type="button"
                      onClick={() => setDataset(d.id)}
                      className={`${styles.expCard} ${dataset === d.id ? styles.expCardOn : ''}`}>
                      <FileText size={18} />
                      <div className={styles.expCardName}>{d.name}</div>
                      <div className={styles.expCardEn}>{d.sizeHint}</div>
                      <div className={styles.expCardHint}>{d.notes ?? d.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Step 2: 压缩器 */}
            {step === 1 ? (
              <div>
                <h3 className={styles.stepH}>{CN.step2}</h3>
                <p className={styles.stepHint}>{CN.step2Hint}</p>
                <div className={styles.expGrid}>
                  {BASELINES.map((b) => (
                    <button key={b.id} type="button"
                      onClick={() => { setBaselineId(b.id); setName(`${b.name} 复现`); }}
                      className={`${styles.expCard} ${baselineId === b.id ? styles.expCardOn : ''}`}>
                      <FlaskConical size={18} />
                      <div className={styles.expCardName}>{b.name}</div>
                      <div className={styles.expCardEn}>{b.family} · 等级 {b.compressionLevel}</div>
                      <div className={styles.expCardHint}>{b.notes}</div>
                      <div style={{display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap'}}>
                        <Badge variant="outline">速度 {b.speedHint}</Badge>
                        <Badge variant="outline">压缩率 {b.ratioHint}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
                <div className={styles.customRow}>
                  <Button variant="outline" onClick={() => { setBaselineId('custom'); setName('自定义实验'); }}><Sparkles size={14} /> {CN.customExp}</Button>
                </div>
              </div>
            ) : null}

            {/* Step 3: 块大小 */}
            {step === 2 ? (
              <div>
                <h3 className={styles.stepH}>{CN.pickBlock}</h3>
                <p className={styles.stepHint}>{CN.pickBlockHint}</p>
                <div style={{marginBottom: 14, padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, fontSize: 13, color: '#713f12'}}>
                  <strong>{CN.blockSize} 解释:</strong> {CN.blockExplain}
                </div>
                <div className={styles.expGrid}>
                  {BLOCK_SIZES.map((b) => (
                    <button key={b.id} type="button"
                      onClick={() => setBlock(b.id)}
                      className={`${styles.expCard} ${block === b.id ? styles.expCardOn : ''}`}>
                      <Wrench size={18} />
                      <div className={styles.expCardName}>{b.name}</div>
                      <div className={styles.expCardEn}>{b.hint}</div>
                      <div className={styles.expCardHint}>{b.useFor}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Step 4: 指标 */}
            {step === 3 ? (
              <div>
                <h3 className={styles.stepH}>{CN.pickMetric}</h3>
                <p className={styles.stepHint}>{CN.pickMetricHint}</p>
                <div className={styles.expGrid}>
                  {METRICS.map((m) => (
                    <button key={m.id} type="button"
                      onClick={() => setMetric(m.id)}
                      className={`${styles.expCard} ${metric === m.id ? styles.expCardOn : ''}`}>
                      <BarChart3 size={18} />
                      <div className={styles.expCardName}>{m.name}</div>
                      <div className={styles.expCardHint}>{m.description}</div>
                      {m.formula ? <code className={styles.expFormula}>{m.formula}</code> : null}
                    </button>
                  ))}
                </div>
                <div style={{marginTop: 14, padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, fontSize: 13, color: '#713f12'}}>
                  <strong>BPB 解释:</strong> {CN.bpbExplain}
                </div>
                <div style={{marginTop: 8, padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, fontSize: 13, color: '#713f12'}}>
                  <strong>bit-exact 解释:</strong> {CN.metricExplain}
                </div>
              </div>
            ) : null}

            {/* Step 5: 生成命令 */}
            {step === 4 ? (
              <div>
                <h3 className={styles.stepH}>{CN.pickCmd}</h3>
                <p className={styles.stepHint}>{CN.pickCmdHint}</p>
                <div style={{display: 'grid', gap: 12}}>
                  <div style={{padding: '14px 16px', background: '#0f172a', color: '#e2e8f0', borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13}}>
                    <div style={{color: '#94a3b8', fontSize: 11, marginBottom: 4}}># 1) 准备数据 (Canterbury / Silesia / 自选)</div>
                    <div>wget -O corpus.tar.gz https://example.com/corpus.tar.gz && tar xf corpus.tar.gz</div>
                    <div style={{color: '#94a3b8', fontSize: 11, marginTop: 10, marginBottom: 4}}># 2) 跑压缩(块大小 {block},指标 {metricEntry?.name ?? metric})</div>
                    <div>{baseline?.examples?.[0] ?? `${baseline?.name ?? 'zstd'} -k --block-size=${block} -r corpus corpus.${baseline?.id ?? 'zst'}`}</div>
                    <div style={{color: '#94a3b8', fontSize: 11, marginTop: 10, marginBottom: 4}}># 3) bit-exact 验证</div>
                    <div>diff -r corpus corpus.dec && echo "bit-exact OK"</div>
                    <div style={{color: '#94a3b8', fontSize: 11, marginTop: 10, marginBottom: 4}}># 4) 记 BPB 与吞吐</div>
                    <div>ls -la corpus.* && time zstd -d corpus.${baseline?.id ?? 'zst'} -o corpus.dec</div>
                  </div>
                  <div style={{fontSize: 13, color: '#64748b'}}>{CN.cmdHint2}</div>
                </div>

                <div className={styles.formGrid} style={{marginTop: 16}}>
                  <label className={styles.formLabel}>{CN.expName}<Input value={name} onChange={(e) => setName(e.target.value)} /></label>
                  <label className={styles.formLabel}>数据集<Input value={datasetEntry?.name ?? '-'} readOnly /></label>
                  <label className={styles.formLabel}>{CN.baseline}<Input value={baseline?.name ?? '-'} readOnly /></label>
                </div>
              </div>
            ) : null}

            {/* Step 6: 记录结果 */}
            {step === 5 ? (
              <div>
                <h3 className={styles.stepH}>{CN.recordResult}</h3>
                <p className={styles.stepHint}>{CN.recordResultHint}</p>
                <div style={{marginBottom: 14, padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, fontSize: 13, color: '#713f12'}}>
                  <strong>结果记录提示:</strong> {CN.resultExplain}
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.formLabel}>BPB<input value={bpb} onChange={(e) => setBpb(e.target.value)} placeholder="例如:1.234" /></label>
                  <label className={styles.formLabel}>Speed (MB/s)<input value={speed} onChange={(e) => setSpeed(e.target.value)} placeholder="例如:120" /></label>
                  <label className={styles.formLabel}>Ratio (%)<input value={ratio} onChange={(e) => setRatio(e.target.value)} placeholder="例如:42.3" /></label>
                  <label className={styles.formLabel}>bit-exact
                    <Select value={bitExact} onValueChange={(v) => setBitExact(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">通过</SelectItem>
                        <SelectItem value="no">未通过</SelectItem>
                        <SelectItem value="pending">待验证</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>

                <label className={styles.formLabel} style={{marginTop: 10, display: 'block'}}>实验备注
                  <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="写了什么、用了什么硬件、踩了什么坑..." />
                </label>

                <h4 style={{marginTop: 18, fontSize: 14, fontWeight: 600}}>结果表模板(可复制)</h4>
                <pre style={{background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 6, fontSize: 12, overflow: 'auto'}}>
{`dataset,compressor,block,metric,BPB,MB/s,Ratio(%),bit-exact,notes
${datasetEntry?.id ?? 'corpus'},${baselineId},${block},${metricEntry?.id ?? metric},${bpb || '?'},${speed || '?'},${ratio || '?'},${bitExact},"${(notes ?? '').slice(0, 80)}"`}
                </pre>

                <h4 style={{marginTop: 18, fontSize: 14, fontWeight: 600}}>{CN.split} · 自动拆任务</h4>
                <p style={{fontSize: 13, color: '#64748b', marginTop: 4}}>{CN.splitHint}</p>
                <div className={styles.formGrid}>
                  <label className={styles.formLabel}>{CN.pre} (min)<Input type="number" value={preMin} onChange={(e) => setPreMin(Number(e.target.value) || 0)} /></label>
                  <label className={styles.formLabel}>{CN.run} (min)<Input type="number" value={runMin} onChange={(e) => setRunMin(Number(e.target.value) || 0)} /></label>
                  <label className={styles.formLabel}>{CN.report} (min)<Input type="number" value={reportMin} onChange={(e) => setReportMin(Number(e.target.value) || 0)} /></label>
                  <label className={styles.formLabel}>{CN.taskPriority}
                    <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">low</SelectItem>
                        <SelectItem value="normal">normal</SelectItem>
                        <SelectItem value="high">high</SelectItem>
                        <SelectItem value="urgent">urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>
                <ul className={styles.preview}>
                  <li><CheckCircle2 size={14} className={styles.okIcon} /> [{name}] {CN.pre} · {preMin}m · 截止 +7d</li>
                  <li><CheckCircle2 size={14} className={styles.okIcon} /> [{name}] {CN.run} · {runMin}m · 截止 +9d</li>
                  <li><CheckCircle2 size={14} className={styles.okIcon} /> [{name}] {CN.report} · {reportMin}m · 截止 +11d</li>
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className={styles.actions}>
          <Button variant="outline" disabled={step === 0} onClick={prev}><ChevronLeft size={14} /> {CN.prev}</Button>
          <div className={styles.spacer} />
          <Button variant="ghost"><Save size={14} /> {CN.save}</Button>
          {step < 5 ? (
            <Button onClick={next}>{CN.next} <ChevronRight size={14} /></Button>
          ) : (
            <Button onClick={createAllTasks}><ListChecks size={14} /> {CN.finish}</Button>
          )}
        </div>
      </WorkbenchShell>
    </Layout>
  );
}
