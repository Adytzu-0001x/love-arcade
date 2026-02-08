"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type HeartsOverlayProps = {
  burstKey: number;
};

type Heart = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
};

const makeHearts = (count: number): Heart[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 16 + Math.random() * 18,
    duration: 2 + Math.random(),
    delay: Math.random() * 0.4,
    rotate: Math.random() * 30 - 15
  }));

export default function HeartsOverlay({ burstKey }: HeartsOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduceMotion) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [burstKey, reduceMotion]);

  const hearts = useMemo(() => makeHearts(20), [burstKey]);

  if (reduceMotion || !visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {hearts.map(heart => (
        <motion.span
          key={`${burstKey}-${heart.id}`}
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: [0, 1, 0], y: -220, x: 20 }}
          transition={{ duration: heart.duration, delay: heart.delay, ease: "easeOut" }}
          style={{
            left: `${heart.left}%`,
            bottom: "-10px",
            fontSize: `${heart.size}px`,
            position: "absolute",
            transform: `rotate(${heart.rotate}deg)`
          }}
        >
          ❤️
        </motion.span>
      ))}
    </div>
  );
}
