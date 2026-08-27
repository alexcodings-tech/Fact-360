import { useEffect, useRef } from "react";

export function ParticlesBg({
  className = "",
  color = "rgba(212, 175, 55, 0.55)",
  count = 55,
}: { className?: string; color?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parts: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      const rect = c.getBoundingClientRect();
      w = rect.width; h = rect.height;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const init = () => {
      parts.length = 0;
      for (let i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    };
    const loop = () => {
      g.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        g.beginPath();
        g.fillStyle = color;
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            g.strokeStyle = color.replace(/[\d.]+\)$/, `${(0.25 * (1 - d / 120)).toFixed(3)})`);
            g.lineWidth = 0.6;
            g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    resize(); init(); loop();
    const onResize = () => { resize(); init(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [color, count]);
  return <canvas ref={ref} className={`absolute inset-0 h-full w-full pointer-events-none ${className}`} aria-hidden />;
}
