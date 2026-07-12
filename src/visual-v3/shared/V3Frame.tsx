import React, {useState} from 'react';
import Head from '@docusaurus/Head';
import {CommandPalette} from './CommandPalette';
import type {AreaId} from './types';
import styles from './v3Shared.module.css';

export function V3Frame({area, title, children}: {area: AreaId; title: string; children: React.ReactNode}) {
  const [commandOpen, setCommandOpen] = useState(false);
  return (
    <div className={styles.v3Root} data-area={area}>
      <Head>
        <title>{title} | 无损压缩研究</title>
        <meta name="description" content="无损压缩项目 V3 交互原型" />
        <html className={styles.v3Html} />
      </Head>
      {children}
      <button className={styles.commandTrigger} type="button" onClick={() => setCommandOpen(true)} aria-label="打开全局搜索">
        <span>搜索</span><kbd>Ctrl K</kbd>
      </button>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
