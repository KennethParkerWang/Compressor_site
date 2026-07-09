// CompressionFlowChart:压缩流程图 (输入 → 建模 → 熵编码 → 比特流)
import React from 'react';

export interface CompressionFlowChartProps {
  highlight?: 'input' | 'model' | 'entropy' | 'output';
  showReverse?: boolean;
}

const STEPS = [
  {id: 'input', label: '原始数据', emoji: '📄', desc: '文本/图像/音频'},
  {id: 'model', label: '概率建模', emoji: '🧠', desc: '预测下一符号概率'},
  {id: 'entropy', label: '熵编码', emoji: '➗', desc: '算术/ANS/Huffman'},
  {id: 'output', label: '比特流', emoji: '📦', desc: '压缩后输出'},
] as const;

const REVERSE = [
  {id: 'output', label: '比特流', emoji: '📦'},
  {id: 'entropy', label: '熵解码', emoji: '➗'},
  {id: 'model', label: '概率模型', emoji: '🧠'},
  {id: 'input', label: '重建数据', emoji: '📄'},
] as const;

export function CompressionFlowChart({highlight, showReverse = false}: CompressionFlowChartProps): React.ReactElement {
  const items = showReverse ? REVERSE : STEPS;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 4,
      alignItems: 'stretch',
      margin: '16px 0',
    }}>
      {items.map((s, i) => (
        <React.Fragment key={s.id}>
          <div style={{
            padding: 14,
            border: `2px solid ${highlight === s.id ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)'}`,
            borderRadius: 10,
            background: highlight === s.id ? 'var(--ifm-color-primary-contrast-background)' : 'var(--ifm-color-emphasis-50)',
            textAlign: 'center',
          }}>
            <div style={{fontSize: 24, marginBottom: 4}}>{s.emoji}</div>
            <div style={{fontWeight: 600, fontSize: 14}}>{s.label}</div>
            {'desc' in s && s.desc && (
              <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)', marginTop: 4}}>{s.desc}</div>
            )}
          </div>
          {i < items.length - 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ifm-color-emphasis-500)',
              fontSize: 18,
              fontWeight: 700,
              padding: '0 8px',
            }}>
              →
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default CompressionFlowChart;