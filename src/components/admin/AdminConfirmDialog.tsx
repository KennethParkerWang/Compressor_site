import React from 'react';
import styles from './adminCrud.module.css';

interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AdminConfirmDialog({open, title, description, confirming, onCancel, onConfirm}: AdminConfirmDialogProps): React.ReactElement | null {
  React.useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !confirming) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirming, onCancel, open]);

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !confirming) onCancel();
    }}>
      <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-description">
        <span>CONFIRM ACTION</span>
        <h2 id="admin-confirm-title">{title}</h2>
        <p id="admin-confirm-description">{description}</p>
        <div className={styles.dialogActions}>
          <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={confirming}>取消</button>
          <button className={styles.dangerButton} type="button" onClick={onConfirm} disabled={confirming}>{confirming ? '正在删除...' : '确认删除'}</button>
        </div>
      </section>
    </div>
  );
}
