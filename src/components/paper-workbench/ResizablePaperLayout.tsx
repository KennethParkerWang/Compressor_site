import React from 'react';
import {PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen} from 'lucide-react';
import styles from './paperWorkbench.module.css';

interface ResizablePaperLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onCenterScroll?: (scrollTop: number) => void;
}

type DragSide = 'left' | 'right';

const DEFAULT_WIDTHS = {left: 20, right: 24};

export function ResizablePaperLayout({
  left,
  center,
  right,
  leftCollapsed,
  rightCollapsed,
  onToggleLeft,
  onToggleRight,
  onCenterScroll,
}: ResizablePaperLayoutProps): React.ReactElement {
  const layoutRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{side: DragSide; pointerId: number; startX: number; startValue: number; containerWidth: number} | null>(null);
  const [widths, setWidths] = React.useState(DEFAULT_WIDTHS);
  const widthsRef = React.useRef(DEFAULT_WIDTHS);
  const [dragging, setDragging] = React.useState<DragSide | null>(null);

  React.useEffect(() => {
    const stored = window.localStorage.getItem('cr-paper-prototype-widths');
    if (!stored) return;
    try {
      const value = JSON.parse(stored) as {left?: number; right?: number};
      const next = {
        left: clamp(value.left ?? DEFAULT_WIDTHS.left, 14, 30),
        right: clamp(value.right ?? DEFAULT_WIDTHS.right, 18, 32),
      };
      widthsRef.current = next;
      setWidths(next);
    } catch {
      window.localStorage.removeItem('cr-paper-prototype-widths');
    }
  }, []);

  const startResize = (side: DragSide, event: React.PointerEvent<HTMLDivElement>): void => {
    const bounds = layoutRef.current?.getBoundingClientRect();
    if (!bounds) return;
    dragRef.current = {
      side,
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: widths[side],
      containerWidth: bounds.width,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(side);
  };

  const moveResize = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = ((event.clientX - drag.startX) / drag.containerWidth) * 100;
    const next = drag.side === 'left'
      ? clamp(drag.startValue + delta, 14, 30)
      : clamp(drag.startValue - delta, 18, 32);
    setWidths((current) => {
      const nextWidths = {...current, [drag.side]: next};
      widthsRef.current = nextWidths;
      return nextWidths;
    });
  };

  const endResize = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(null);
    window.localStorage.setItem('cr-paper-prototype-widths', JSON.stringify(widthsRef.current));
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const columns = `${leftCollapsed ? '50px' : `${widths.left}%`} 7px minmax(520px, 1fr) 7px ${rightCollapsed ? '50px' : `${widths.right}%`}`;

  return (
    <div ref={layoutRef} className={styles.resizableLayout} style={{gridTemplateColumns: columns}} data-dragging={dragging ?? undefined}>
      <aside className={styles.terminologyColumn} data-collapsed={leftCollapsed}>{left}</aside>
      <ResizeHandle side="left" disabled={leftCollapsed} active={dragging === 'left'} onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} />
      <main className={styles.paperCenter} data-paper-center onScroll={(event) => onCenterScroll?.(event.currentTarget.scrollTop)}>{center}</main>
      <ResizeHandle side="right" disabled={rightCollapsed} active={dragging === 'right'} onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} />
      <aside className={styles.experimentColumn} data-collapsed={rightCollapsed}>{right}</aside>
      <span className={styles.srOnly} aria-live="polite">{dragging ? `正在调整${dragging === 'left' ? '术语栏' : '实验栏'}宽度` : ''}</span>
    </div>
  );
}

function ResizeHandle({
  side,
  disabled,
  active,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  side: DragSide;
  disabled: boolean;
  active: boolean;
  onPointerDown: (side: DragSide, event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
}): React.ReactElement {
  return (
    <div
      className={styles.resizeHandle}
      data-disabled={disabled}
      data-active={active}
      role="separator"
      aria-orientation="vertical"
      aria-label={`调整${side === 'left' ? '术语栏' : '实验栏'}宽度`}
      onPointerDown={(event) => !disabled && onPointerDown(side, event)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    ><span /></div>
  );
}

export function CollapseButton({side, collapsed, onClick}: {side: DragSide; collapsed: boolean; onClick: () => void}): React.ReactElement {
  const Icon = side === 'left'
    ? (collapsed ? PanelLeftOpen : PanelLeftClose)
    : (collapsed ? PanelRightOpen : PanelRightClose);
  const label = `${collapsed ? '展开' : '收起'}${side === 'left' ? '术语栏' : '实验栏'}`;
  return <button type="button" className={styles.collapseButton} onClick={onClick} title={label} aria-label={label}><Icon size={17} /></button>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
