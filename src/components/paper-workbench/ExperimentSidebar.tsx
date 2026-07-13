import React from 'react';
import {BarChart3, CheckCircle2, FlaskConical, XCircle} from 'lucide-react';
import type {CompressionMetricKey, CompressorExperiment, CompressorPaper} from '../../data/compressorPapers';
import {CollapseButton} from './ResizablePaperLayout';
import {EmptyState} from './PaperContent';
import styles from './paperWorkbench.module.css';

type ExperimentTab = 'paper' | 'reproduction' | 'comparison';

const METRICS: Array<{key: CompressionMetricKey; label: string; unit: string}> = [
  {key: 'compressionRatio', label: '压缩比', unit: 'x'},
  {key: 'bitsPerByte', label: 'BPP / BPB', unit: 'bit'},
  {key: 'compressedSize', label: '压缩大小', unit: 'MiB'},
  {key: 'compressionThroughput', label: '压缩速度', unit: 'MB/s'},
  {key: 'decompressionThroughput', label: '解压速度', unit: 'MB/s'},
  {key: 'peakMemory', label: '峰值内存', unit: 'MiB'},
  {key: 'compressionLatency', label: '压缩时延', unit: 'ms'},
  {key: 'decompressionLatency', label: '解压时延', unit: 'ms'},
];

export function ExperimentSidebar({paper, collapsed, onToggleCollapsed}: {paper: CompressorPaper; collapsed: boolean; onToggleCollapsed: () => void}): React.ReactElement {
  const [tab, setTab] = React.useState<ExperimentTab>('paper');
  const availableMetric = paper.metrics.find((metric) => paper.paperExperiments.some((experiment) => experiment.metrics[metric] !== undefined)) ?? paper.metrics[0] ?? 'bitsPerByte';
  const [metric, setMetric] = React.useState<CompressionMetricKey>(availableMetric);

  React.useEffect(() => {
    setTab('paper');
    setMetric(paper.metrics.find((item) => paper.paperExperiments.some((experiment) => experiment.metrics[item] !== undefined)) ?? paper.metrics[0] ?? 'bitsPerByte');
  }, [paper.id]);

  if (collapsed) {
    return <div className={styles.collapsedRail}><CollapseButton side="right" collapsed onClick={onToggleCollapsed} /><FlaskConical size={19} /><span>{paper.reproductionExperiments.length}</span></div>;
  }

  return (
    <div className={styles.experimentSidebar}>
      <header className={styles.sidebarHeader}>
        <div><span>Experiments</span><strong>实验与结果</strong></div>
        <CollapseButton side="right" collapsed={false} onClick={onToggleCollapsed} />
      </header>
      <div className={styles.experimentTabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'paper'} onClick={() => setTab('paper')}>论文结果</button>
        <button type="button" role="tab" aria-selected={tab === 'reproduction'} onClick={() => setTab('reproduction')}>复现结果</button>
        <button type="button" role="tab" aria-selected={tab === 'comparison'} onClick={() => setTab('comparison')}>结果对比</button>
      </div>
      <div className={styles.experimentContent}>
        {tab === 'paper' ? <PaperExperimentView paper={paper} /> : null}
        {tab === 'reproduction' ? <ReproductionExperimentView paper={paper} /> : null}
        {tab === 'comparison' ? <ExperimentComparisonView paper={paper} metric={metric} onMetricChange={setMetric} /> : null}
      </div>
    </div>
  );
}
export function PaperExperimentView({paper}: {paper: CompressorPaper}): React.ReactElement {
  if (paper.paperExperiments.length === 0) return <EmptyState title="暂无论文实验记录" description="尚未从论文中抽取可核验的实验表格。" />;
  return (
    <div className={styles.experimentView}>
      <section className={styles.experimentContext}>
        <h2><BarChart3 size={15} />论文实验口径</h2>
        <dl>
          <div><dt>数据集</dt><dd>{paper.datasets.join('、')}</dd></div>
          <div><dt>对比压缩器</dt><dd>{paper.baselines.join('、')}</dd></div>
          <div><dt>参数/块</dt><dd>{paper.blockSizes.join('、')}</dd></div>
          <div><dt>指标</dt><dd>{paper.metrics.join('、')}</dd></div>
        </dl>
      </section>
      {paper.paperExperiments.map((experiment) => <ExperimentRecord key={experiment.id} experiment={experiment} />)}
    </div>
  );
}

export function ReproductionExperimentView({paper}: {paper: CompressorPaper}): React.ReactElement {
  if (paper.reproductionExperiments.length === 0) {
    return <EmptyState title="尚无复现实验" description="该论文还没有绑定本地实验记录；原型保留空状态，不生成假数据。" />;
  }
  return <div className={styles.experimentView}>{paper.reproductionExperiments.map((experiment) => <ExperimentRecord key={experiment.id} experiment={experiment} reproduction />)}</div>;
}

export function ExperimentComparisonView({
  paper,
  metric,
  onMetricChange,
}: {
  paper: CompressorPaper;
  metric: CompressionMetricKey;
  onMetricChange: (metric: CompressionMetricKey) => void;
}): React.ReactElement {
  const datasets = Array.from(new Set([...paper.paperExperiments, ...paper.reproductionExperiments].map((item) => item.dataset)));
  const blocks = Array.from(new Set([...paper.paperExperiments, ...paper.reproductionExperiments].map((item) => item.blockSize)));
  const [dataset, setDataset] = React.useState(datasets[0] ?? '');
  const [blockSize, setBlockSize] = React.useState('all');

  React.useEffect(() => {
    setDataset(datasets[0] ?? '');
    setBlockSize('all');
  }, [paper.id]);

  const paperResult = paper.paperExperiments.find((item) => item.dataset === dataset && (blockSize === 'all' || item.blockSize === blockSize));
  const reproduction = paper.reproductionExperiments.find((item) => item.dataset === dataset && (blockSize === 'all' || item.blockSize === blockSize));
  const paperValue = paperResult?.metrics[metric];
  const reproductionValue = reproduction?.metrics[metric];
  const absoluteDifference = paperValue !== undefined && reproductionValue !== undefined ? reproductionValue - paperValue : undefined;
  const relativeDifference = absoluteDifference !== undefined && paperValue ? (absoluteDifference / paperValue) * 100 : undefined;

  return (
    <div className={styles.comparisonView}>
      <div className={styles.comparisonFilters}>
        <label>数据集<select value={dataset} onChange={(event) => setDataset(event.target.value)}>{datasets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>块大小<select value={blockSize} onChange={(event) => setBlockSize(event.target.value)}><option value="all">全部块大小</option>{blocks.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>评价指标<select value={metric} onChange={(event) => onMetricChange(event.target.value as CompressionMetricKey)}>{METRICS.filter((item) => paper.metrics.includes(item.key)).map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
      </div>
      <CompressionMetricChart metric={metric} paperValue={paperValue} reproductionValue={reproductionValue} />
      <div className={styles.comparisonTable}>
        <div><span>论文结果</span><strong>{formatMetric(metric, paperValue)}</strong></div>
        <div><span>复现结果</span><strong>{formatMetric(metric, reproductionValue)}</strong></div>
        <div><span>绝对差值</span><strong>{absoluteDifference === undefined ? '—' : `${absoluteDifference > 0 ? '+' : ''}${absoluteDifference.toFixed(3)}`}</strong></div>
        <div><span>相对差值</span><strong>{relativeDifference === undefined ? '—' : `${relativeDifference > 0 ? '+' : ''}${relativeDifference.toFixed(1)}%`}</strong></div>
      </div>
      <div className={styles.comparisonVerdict} data-comparable={relativeDifference !== undefined}>
        {relativeDifference === undefined ? '当前筛选条件缺少可对齐结果。' : Math.abs(relativeDifference) <= 5 ? '复现结果接近论文记录。' : '差异较大，需要检查版本、参数、硬件和数据预处理。'}
      </div>
    </div>
  );
}

export function CompressionMetricChart({metric, paperValue, reproductionValue}: {metric: CompressionMetricKey; paperValue?: number; reproductionValue?: number}): React.ReactElement {
  const metricMeta = METRICS.find((item) => item.key === metric) ?? METRICS[0];
  const max = Math.max(paperValue ?? 0, reproductionValue ?? 0, 1);
  const paperHeight = paperValue === undefined ? 0 : Math.max(8, (paperValue / max) * 100);
  const reproductionHeight = reproductionValue === undefined ? 0 : Math.max(8, (reproductionValue / max) * 100);
  return (
    <figure className={styles.metricChart}>
      <figcaption><div><span>Metric comparison</span><strong>{metricMeta.label}</strong></div><small>{metricMeta.unit}</small></figcaption>
      <div className={styles.chartPlot}>
        <div><span style={{height: `${paperHeight}%`}} data-series="paper" /><strong>{paperValue ?? '—'}</strong><small>论文</small></div>
        <div><span style={{height: `${reproductionHeight}%`}} data-series="reproduction" /><strong>{reproductionValue ?? '—'}</strong><small>复现</small></div>
      </div>
    </figure>
  );
}

function ExperimentRecord({experiment, reproduction = false}: {experiment: CompressorExperiment; reproduction?: boolean}): React.ReactElement {
  const metricEntries = Object.entries(experiment.metrics) as Array<[CompressionMetricKey, number]>;
  return (
    <section className={styles.experimentRecord}>
      <header><div><span>{reproduction ? 'Reproduction' : 'Paper record'}</span><strong>{experiment.name}</strong></div><em data-status={experiment.status}>{experiment.status}</em></header>
      <dl>
        <div><dt>数据集</dt><dd>{experiment.dataset}</dd></div>
        <div><dt>数据划分</dt><dd>{experiment.split ?? '—'}</dd></div>
        <div><dt>块大小</dt><dd>{experiment.blockSize}</dd></div>
        <div><dt>参数</dt><dd>{experiment.parameters ?? '—'}</dd></div>
        <div><dt>代码版本</dt><dd>{experiment.codeVersion ?? '—'}</dd></div>
        <div><dt>硬件</dt><dd>{experiment.hardware ?? '论文未报告'}</dd></div>
      </dl>
      <div className={styles.metricRows}>{metricEntries.length ? metricEntries.map(([key, value]) => <div key={key}><span>{METRICS.find((item) => item.key === key)?.label ?? key}</span><strong>{formatMetric(key, value)}</strong></div>) : <span className={styles.noMetric}>尚无经过核验的指标值</span>}</div>
      {reproduction ? <div className={styles.verification} data-passed={experiment.verificationPassed}>{experiment.verificationPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}校验{experiment.verificationPassed ? '通过' : '未通过/未执行'}</div> : null}
      {experiment.note ? <p>{experiment.note}</p> : null}
    </section>
  );
}

function formatMetric(key: CompressionMetricKey, value?: number): string {
  if (value === undefined) return '—';
  const unit = METRICS.find((item) => item.key === key)?.unit ?? '';
  return `${value.toLocaleString('zh-CN', {maximumFractionDigits: 3})} ${unit}`.trim();
}
