"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import HeartsOverlay, { Heart } from "@/components/HeartsOverlay";

export default function RouteHearts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [hearts, setHearts] = useState<Heart[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  const fxDisabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const urlDisabled = searchParams?.get("fx") === "0";
    const storedDisabled = localStorage.getItem("fxDisabled") === "1";
    return urlDisabled || storedDisabled;
  }, [searchParams]);

  const makeHearts = (count: number) =>
    Array.from({ length: count }, () => ({
      id: nextIdRef.current++,
      left: Math.random() * 100,
      size: 16 + Math.random() * 18,
      duration: 2 + Math.random(),
      delay: Math.random() * 0.4,
      rotate: Math.random() * 30 - 15
    }));

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const shouldPlay = pathname.startsWith("/games/");
    if (!shouldPlay || reduceMotion || fxDisabled) {
      setHearts([]);
      return;
    }
    setHearts(makeHearts(20));
    timeoutRef.current = setTimeout(() => setHearts([]), 2500);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [pathname, reduceMotion, fxDisabled]);

  return <HeartsOverlay hearts={hearts} />;
}
