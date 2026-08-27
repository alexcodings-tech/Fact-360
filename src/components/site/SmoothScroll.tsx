import { useEffect } from "react";
import Lenis from "lenis";

/** Lenis-powered smooth scroll. Mount once at the root. */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return null;
}
