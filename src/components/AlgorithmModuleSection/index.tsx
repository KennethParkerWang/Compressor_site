import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight, Cpu} from 'lucide-react';
import {algorithmModules, categoryLabels} from '@/src/data/algorithmModules';
import styles from './styles.module.css';

const STATUS_CHIP_CLASS: Record<string, string> = {
  spec: '',
  prototype: '',
  runnable: '',
  verified: 'chipStatusDone',
  production: 'chipStatusDone',
  deferred: 'chipStatusFailed',
};

const STATUS_LABEL: Record<string, string> = {
  spec: 'spec',
  prototype: 'prototype',
  runnable: 'runnable',
  verified: 'verified',
  production: 'production',
  deferred: 'deferred',
};

export default function AlgorithmModuleSection(): React.ReactElement {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>Algorithm Module Board</span>
            <h2 className={styles.title}>算法模块�?· Ch.10</h2>
            <p className={styles.desc}>
              可迁移算法模块化设计草案的实时状�?文件类型识别 �?预处�?�?上下文专�?�?神经预测 �?Mixer �?熵编码后�?�?块级优化�?            </p>
          </div>
          <Link className={styles.viewAll} to="/algorithm-board">
            <Cpu size={14} style={{marginRight: '0.3rem', verticalAlign: 'middle'}} />
            进入模块�?            <ArrowRight size={14} style={{marginLeft: '0.3rem', verticalAlign: 'middle'}} />
          </Link>
        </div>

        <div className={styles.flowRow}>
          {algorithmModules.map((m) => (
            <Link
              key={m.id}
              className={styles.moduleChip}
              to="/algorithm-board"
            >
              <span className={styles.chipId}>{m.id}</span>
              <span className={styles.chipName}>{m.nameZh}</span>
              <span className={styles.chipCat}>{categoryLabels[m.category]}</span>
              <span
                className={`${styles.chipStatus} ${
                  STATUS_CHIP_CLASS[m.status] ? styles[STATUS_CHIP_CLASS[m.status]] : ''
                }`}
              >
                {STATUS_LABEL[m.status]}
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.modulesGrid}>
          {algorithmModules.slice(0, 6).map((m) => (
            <div key={m.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <span className={styles.moduleId}>{m.id}</span>
                <span className={styles.moduleCategory}>{categoryLabels[m.category]}</span>
              </div>
              <div className={styles.moduleName}>{m.nameZh}</div>
              <div className={styles.moduleIo}>
                <div><strong>输入</strong>: {m.inputs.join(' / ')}</div>
                <div><strong>输出</strong>: {m.outputs.join(' / ')}</div>
              </div>
              <div className={styles.moduleFooter}>
                <span className={styles.moduleStatusBadge}>
                  impl · {STATUS_LABEL[m.status]}
                </span>
                <span className={`${styles.riskBadge} ${styles[`risk${m.risk.charAt(0).toUpperCase() + m.risk.slice(1)}`]}`}>
                  risk · {m.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}