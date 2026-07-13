import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './articleMarkdown.module.css';

const FULL_WIDTH_MARKER = '||full';

export function stripImageWidthMarker(title?: string | null): {caption: string; full: boolean} {
  const normalized = title ?? '';
  const full = normalized.trimEnd().endsWith(FULL_WIDTH_MARKER);
  return {full, caption: full ? normalized.replace(/\s*\|\|full\s*$/, '') : normalized};
}

export function withImageWidthMarker(title: string, full: boolean): string {
  const clean = stripImageWidthMarker(title).caption.trim();
  return full ? `${clean}${clean ? ' ' : ''}${FULL_WIDTH_MARKER}` : clean;
}

export default function ArticleMarkdown({markdown}: {markdown: string}): React.ReactElement {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({children, ...props}) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
          img: ({src, alt, title}) => {
            const image = stripImageWidthMarker(title);
            return (
              <span className={styles.imageBlock} data-full={image.full}>
                <img src={src} alt={alt ?? ''} />
                {image.caption ? <span className={styles.imageCaption}>{image.caption}</span> : null}
              </span>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
