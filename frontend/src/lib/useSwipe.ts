"use client";
import { useEffect } from "react";

export const useSwipe = (ref: React.RefObject<HTMLElement>, onDir: (dir: "up"|"down"|"left"|"right") => void) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0, startY = 0;
    const start = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      if (Math.abs(dx) > Math.abs(dy)) onDir(dx > 0 ? "right" : "left");
      else onDir(dy > 0 ? "down" : "up");
    };
    el.addEventListener("touchstart", start);
    el.addEventListener("touchend", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
    };
  }, [ref, onDir]);
};



