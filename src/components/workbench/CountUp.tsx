import React, {useEffect, useRef, useState} from 'react';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * 数字 count-up 动画(纯 React + RAF,无依赖)
 * - 仅在客户端渲染时启动
 * - 尊重 prefers-reduced-motion
 * - 自动等宽数字
 */
export default function CountUp({value, duration = 800, decimals = 0, className, prefix, suffix}: Props): React.ReactElement {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const start = performance.now();
    const from = prev.current;
    const to = value;
    const delta = to - from;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - t, 4);
      const current = from + delta * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prev.current = to;
      }
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();
  return (
    <span className={`cr-count-num ${className ?? ''}`}>
      {prefix ?? ''}{formatted}{suffix ?? ''}
    </span>
  );
}