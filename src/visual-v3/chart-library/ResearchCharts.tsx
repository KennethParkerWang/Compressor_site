import React, {useMemo} from 'react';
import ReactECharts from 'echarts-for-react';

export function BenchmarkEmptyChart({compact = false}: {compact?: boolean}) {
  const option = useMemo(() => ({
    animationDuration: 500,
    backgroundColor: 'transparent',
    grid: {left: 42, right: 18, top: 32, bottom: 34},
    tooltip: {trigger: 'axis'},
    xAxis: {type: 'category', data: ['gzip', 'xz', 'zstd', 'PAQ8px-1', 'CMIX', 'NNCP'], axisLabel: {color: '#8e9a95'}, axisLine: {lineStyle: {color: '#33433e'}}},
    yAxis: {type: 'value', name: 'BPB', min: 0, max: 8, axisLabel: {color: '#8e9a95'}, nameTextStyle: {color: '#8e9a95'}, splitLine: {lineStyle: {color: '#24332f'}}},
    series: [{type: 'line', data: [null, null, null, null, null, null], connectNulls: false, symbolSize: 8, lineStyle: {color: '#d8f15a'}}],
    graphic: [{type: 'text', left: 'center', top: 'middle', style: {text: '实验结果待录入', fill: '#84918c', font: compact ? '11px monospace' : '13px monospace'}}],
  }), [compact]);
  return <ReactECharts option={option} style={{height: compact ? 220 : 310, width: '100%'}} />;
}

export function ParetoProtocolChart() {
  const option = useMemo(() => ({
    animationDuration: 650,
    grid: {left: 45, right: 20, top: 28, bottom: 38},
    xAxis: {name: '吞吐 MB/s', type: 'log', min: 1, max: 1000, axisLabel: {color: '#56635d'}, splitLine: {lineStyle: {color: '#d6ddd8'}}},
    yAxis: {name: 'BPB', type: 'value', min: 0, max: 8, inverse: true, axisLabel: {color: '#56635d'}, splitLine: {lineStyle: {color: '#d6ddd8'}}},
    series: [{type: 'scatter', data: [], symbolSize: 12}],
    graphic: [{type: 'text', left: 'center', top: 'middle', style: {text: '等待同环境、同数据集的可比结果', fill: '#78837e', font: '12px monospace'}}],
  }), []);
  return <ReactECharts option={option} style={{height: 300}} />;
}
