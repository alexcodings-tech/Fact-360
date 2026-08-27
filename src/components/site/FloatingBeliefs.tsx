import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = { t: string; d: string };
type Body = { x: number; y: number; vx: number; vy: number; w: number; h: number };

export function FloatingBeliefs({ items, width = 1280, height = 470 }: { items: Item[]; width?: number; height?: number }) {
  const [floating, setFloating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!floating) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      cardRefs.current.forEach((el) => {
        if (el) el.style.transform = "";
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Fixed card size while floating so cards can move freely without stretching to the grid width.
    const CARD_W = Math.min(240, Math.floor(cw / 3) - 12);
    const CARD_H = 110;

    // Initialize bodies with RANDOM positions distributed across the whole container,
    // not the current grid layout (which would keep them vertically stacked).
    const bodies: Body[] = cardRefs.current.map((_, i) => {
      const w = CARD_W;
      const h = CARD_H;
      const x = Math.random() * Math.max(1, cw - w);
      const y = Math.random() * Math.max(1, ch - h);
      const angle = (i / items.length) * Math.PI * 2 + Math.random() * Math.PI * 2;
      const speed = 0.9 + Math.random() * 0.8;
      return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, w, h };
    });
    bodiesRef.current = bodies;

    // Switch cards to absolute positioning with fixed size
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const b = bodies[i];
      el.style.position = "absolute";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.width = `${b.w}px`;
      el.style.height = `${b.h}px`;
      el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });


    const step = () => {
      const bs = bodiesRef.current;
      // Move
      for (const b of bs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x <= 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.y <= 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.x + b.w >= cw) { b.x = cw - b.w; b.vx = -Math.abs(b.vx); }
        if (b.y + b.h >= ch) { b.y = ch - b.h; b.vy = -Math.abs(b.vy); }
      }
      // Collide (AABB) — simple resolution: separate + swap velocities on axis
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (ox > 0 && oy > 0) {
            if (ox < oy) {
              const push = ox / 2;
              if (a.x < b.x) { a.x -= push; b.x += push; } else { a.x += push; b.x -= push; }
              const t = a.vx; a.vx = b.vx; b.vx = t;
            } else {
              const push = oy / 2;
              if (a.y < b.y) { a.y -= push; b.y += push; } else { a.y += push; b.y -= push; }
              const t = a.vy; a.vy = b.vy; b.vy = t;
            }
          }
        }
      }
      // Apply
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const b = bs[i];
        el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cardRefs.current.forEach((el) => {
        if (!el) return;
        el.style.position = "";
        el.style.left = "";
        el.style.top = "";
        el.style.width = "";
        el.style.height = "";
        el.style.transform = "";
      });
    };

  }, [floating, items.length]);

  return (
    <>
      <div className="flex justify-center mt-4">
        <Button
          size="sm"
          variant={floating ? "secondary" : "default"}
          onClick={() => setFloating((v) => !v)}
          className="gap-2"
        >
          {floating ? <><Pause className="h-4 w-4" /> Pause floating</> : <><Play className="h-4 w-4" /> Float freely</>}
        </Button>
      </div>
      <div
        ref={containerRef}
        className={`relative mt-4 mx-4 ${floating ? "" : "grid grid-cols-2 md:grid-cols-3 gap-4"}`}
        style={{ height: floating ? height - 120 : undefined }}
      >
        {items.map((x, i) => (
          <div
            key={x.t}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-sm hover:shadow-md hover:border-accent/50 transition-shadow"
            style={floating ? { willChange: "transform" } : undefined}
          >
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <div>
                <div className="font-bold text-primary text-sm">{x.t}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{x.d}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
