import React from 'react';

interface ParticleFieldProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
}

const MAX_DPR = 1.75;
const MIN_PARTICLES = 64;
const MAX_PARTICLES = 132;
const LINK_DISTANCE = 128;

export default function ParticleField({className}: ParticleFieldProps): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;

    const ctx = canvas.getContext('2d', {alpha: true});
    if (!ctx) return undefined;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    const mouse = {x: -9999, y: -9999, active: false};
    const colors = {
      accent: '#2563eb',
      cyan: '#0891b2',
      green: '#059669',
      text: '#64748b',
    };

    const readThemeColors = () => {
      const styles = window.getComputedStyle(document.documentElement);
      colors.accent = styles.getPropertyValue('--cr-accent').trim() || colors.accent;
      colors.cyan = styles.getPropertyValue('--cr-cyan').trim() || colors.cyan;
      colors.green = styles.getPropertyValue('--cr-green').trim() || colors.green;
      colors.text = styles.getPropertyValue('--cr-text-muted').trim() || colors.text;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.min(
        MAX_PARTICLES,
        Math.max(MIN_PARTICLES, Math.round((width * height) / 13800)),
      );
      particles = Array.from({length: targetCount}, (_, index) => {
        const existing = particles[index];
        return existing ?? makeParticle(width, height);
      });
    };

    const drawParticle = (particle: Particle, index: number) => {
      const pulse = 0.55 + Math.sin(frame * 0.018 + particle.phase) * 0.18;
      ctx.globalAlpha = 0.16 + pulse * 0.18;
      ctx.fillStyle = index % 5 === 0 ? colors.green : index % 3 === 0 ? colors.cyan : colors.accent;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (mouse.active) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 15000 && distSq > 0.01) {
            const push = (1 - distSq / 15000) * 0.018;
            particle.vx += dx * push;
            particle.vy += dy * push;
          }
        }

        particle.vx *= 0.994;
        particle.vy *= 0.994;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK_DISTANCE) continue;
          ctx.globalAlpha = (1 - distance / LINK_DISTANCE) * 0.12;
          ctx.strokeStyle = (i + j) % 4 === 0 ? colors.cyan : colors.text;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      particles.forEach(drawParticle);
      ctx.restore();
      ctx.globalAlpha = 1;

      raf = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };
    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    readThemeColors();
    resize();
    tick();

    const observer = new MutationObserver(readThemeColors);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-cr-theme', 'data-theme']});
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, {passive: true});
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function makeParticle(width: number, height: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.08 + Math.random() * 0.22;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 1.1 + Math.random() * 1.9,
    phase: Math.random() * Math.PI * 2,
  };
}
