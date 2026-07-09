import React, {useEffect, useState} from 'react';

/**
 * 顶部进度条 — 监听路由变化,自动显示/隐藏
 * 放置在 Docusaurus Root 中
 */
export default function ProgressBar(): React.ReactElement | null {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    function onRouteChangeStart() {
      setState('loading');
      setWidth(20);
    }
    function onRouteChangeEnd() {
      setWidth(85);
      setTimeout(() => {
        setWidth(100);
        setState('done');
        setTimeout(() => {
          setWidth(0);
          setState('idle');
        }, 250);
      }, 180);
    }
    window.addEventListener('cr:route-start', onRouteChangeStart);
    window.addEventListener('cr:route-end', onRouteChangeEnd);
    return () => {
      window.removeEventListener('cr:route-start', onRouteChangeStart);
      window.removeEventListener('cr:route-end', onRouteChangeEnd);
    };
  }, []);

  useEffect(() => {
    if (state !== 'loading') return;
    // 平滑推进到 70%
    let t: number;
    let cur = 20;
    const target = 70;
    const step = () => {
      cur = Math.min(target, cur + (target - cur) * 0.12 + 0.5);
      setWidth(cur);
      if (cur < target) t = requestAnimationFrame(step);
    };
    t = requestAnimationFrame(step);
    return () => cancelAnimationFrame(t);
  }, [state]);

  if (state === 'idle' && width === 0) return null;
  return <div id="cr-progress-bar" style={{width: `${width}%`, opacity: state === 'idle' ? 0 : 1}} />;
}