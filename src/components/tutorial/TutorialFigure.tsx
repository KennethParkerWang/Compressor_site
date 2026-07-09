// TutorialFigure:教程内嵌图 (SVG / URL)
// 用法: <TutorialFigure id='xxx' caption='链路' svg='<svg>...</svg>' />
import React from 'react';
import {ZoomIn} from 'lucide-react';
import type {TutorialFigure as FigureData} from '../../data/tutorials';
import styles from './tutorial.module.css';

export interface TutorialFigureProps {
  figure: FigureData;
}

export function TutorialFigure({figure}: TutorialFigureProps): React.ReactElement {
  const width = figure.width ?? '100%';
  // 防止恶意 SVG: 仅允许 <svg 开头的字符串且不含 <script
  const safe = figure.src === 'svg' && /^<svg[\s\S]*<\/svg>\s*$/i.test(figure.value)
    && !/<script/i.test(figure.value);

  return (
    <figure id={figure.id} className={styles.figure}>
      <div
        className={styles.figureWrap}
        style={{width}}
        onClick={() => {
          if (figure.src !== 'svg') return;
          if (typeof window === 'undefined') return;
          const w = window.open('', '_blank');
          if (!w) return;
          w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${figure.caption}</title>
            <style>body{margin:0;padding:24px;background:#fff;font-family:sans-serif;color:#111}
            svg{max-width:100%;height:auto;display:block;margin:0 auto;max-height:90vh}</style>
            </head><body>${figure.value}</body></html>`);
          w.document.close();
        }}
        title={figure.src === 'svg' ? '点击放大查看' : undefined}>
        {figure.src === 'svg' ? (
          safe
            ? <div className={styles.figureSvg} dangerouslySetInnerHTML={{__html: figure.value}} />
            : <div className={styles.figureFallback}>⚠️ 无效 SVG 内容</div>
        ) : (
          <img className={styles.figureImg} src={figure.value} alt={figure.alt ?? figure.caption} loading="lazy" />
        )}
        {figure.src === 'svg' && (
          <div className={styles.figureZoomHint}>
            <ZoomIn size={11} /> 放大
          </div>
        )}
      </div>
      <figcaption className={styles.figureCaption}>
        <strong>{figure.caption}</strong>
        {figure.source && <span className={styles.figureSource}> — 来源: {figure.source}</span>}
      </figcaption>
    </figure>
  );
}

export default TutorialFigure;