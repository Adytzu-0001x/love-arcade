"use client";
import { motion } from "framer-motion";

export type Heart = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
};

type HeartsOverlayProps = {
  hearts: Heart[];
};

export default function HeartsOverlay({ hearts }: HeartsOverlayProps) {
  if (hearts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {hearts.map(heart => (
        <motion.span
          key={heart.id}
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
