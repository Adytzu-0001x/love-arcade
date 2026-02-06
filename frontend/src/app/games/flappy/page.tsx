"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/lib/useToast";
import { getVisitorId, getVisitorName } from "@/lib/visitor";
import Link from "next/link";

type Pipe = { x: number; gapY: number; scored?: boolean };

const WIDTH = 320;
const HEIGHT = 480;
const HEART_SIZE = 10;
const PIPE_WIDTH = 55;
const GAP_HALF = 160; // gap total 320 px

export default function FlappyHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const { push } = useToast();
  const scoreRef = useRef(0);
  const runningRef = useRef(false);
  const crashedRef = useRef(false);

  useEffect(() => { getVisitorId(); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    let heartY = HEIGHT / 2;
    let velocity = 0;
    const gravity = 0.28;
    const jump = -6.5;
    let pipes: Pipe[] = [];
    let raf: number | null = null;

    const addPipe = () => {
      const gapY = 180 + Math.random() * 160;
      pipes.push({ x: WIDTH + 220, gapY, scored: false });
    };

    const ensurePipeSpacing = () => {
      const last = pipes[pipes.length - 1];
      if (!last || last.x < WIDTH - 120) addPipe();
    };

    const resetGame = () => {
      heartY = HEIGHT / 2;
      velocity = 0;
      pipes = [];
      crashedRef.current = false;
      scoreRef.current = 0;
      setScore(0);
      addPipe();
      addPipe();
    };

    const drawHeart = (y: number) => {
      ctx.fillStyle = "#ff6b9f";
      ctx.beginPath();
      const x = WIDTH / 2;
      const s = HEART_SIZE;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - s * 1.2, y - s, x - s * 1.4, y + s * 0.6, x, y + s * 1.6);
      ctx.bezierCurveTo(x + s * 1.4, y + s * 0.6, x + s * 1.2, y - s, x, y);
      ctx.closePath();
      ctx.fill();
    };

    const endGame = async () => {
      if (crashedRef.current) return;
      crashedRef.current = true;
      runningRef.current = false;
      push(`Scor: ${scoreRef.current}. Mai încerci?`);
      try {
        await apiFetch("/scores", {
          method: "POST",
          body: JSON.stringify({ game: "flappy", score: scoreRef.current, meta: { name: getVisitorName() } })
        });
      } catch { /* ignore */ }
    };

    const tick = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      if (runningRef.current) {
        velocity += gravity;
        heartY += velocity;

        pipes.forEach(p => (p.x -= 1.8 + scoreRef.current * 0.002));

        pipes.forEach(p => {
          if (!p.scored && p.x + PIPE_WIDTH < WIDTH / 2) {
            p.scored = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        });

        if (pipes[0]?.x < -240) pipes.shift();
        ensurePipeSpacing();
      }

      ctx.fillStyle = "#3ad9ff";
      pipes.forEach(p => {
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY - GAP_HALF);
        ctx.fillRect(p.x, p.gapY + GAP_HALF, PIPE_WIDTH, HEIGHT - p.gapY - GAP_HALF);
      });

      drawHeart(heartY);

      const top = heartY - HEART_SIZE * 0.6;
      const bottom = heartY + HEART_SIZE * 0.6;
      const x = WIDTH / 2;
      for (const p of pipes) {
        if (x > p.x - HEART_SIZE && x < p.x + PIPE_WIDTH) {
          if (top < p.gapY - GAP_HALF || bottom > p.gapY + GAP_HALF) endGame();
        }
      }
      if (bottom > HEIGHT || top < 0) endGame();

      raf = requestAnimationFrame(tick);
    };

    resetGame();
    raf = requestAnimationFrame(tick);

    const flap = () => {
      if (!runningRef.current) runningRef.current = true;
      if (crashedRef.current) return;
      velocity = jump;
    };

    const onKey = (e: KeyboardEvent) => {
      if (["Space", "ArrowUp"].includes(e.code)) {
        e.preventDefault();
        flap();
      }
    };
    const onClick = () => flap();

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onClick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onClick);
    };
  }, []); // run once

  useEffect(() => {
    const milestones: Record<number, string> = {
      5: "Ești pe val! 🚀",
      10: "Inima ta zboară! ❤️",
      20: "Legendă! 🌟",
      30: "Imbatabilă! 👑"
    };
    const msg = milestones[score as keyof typeof milestones];
    if (msg) {
      apiFetch<{ message: string }>("/messages/random", { query: { category: "encourage", name: "Alexandra" } })
        .then(r => push(r.message || msg))
        .catch(() => push(msg));
    }
  }, [score, push]);

  return (
    <div className="space-y-3 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Flappy Heart</h1>
        <Link href="/arcade" className="text-sm text-candy hover:underline">← Înapoi la Arcade</Link>
      </div>
      <p className="text-sm text-white/70">Click/Tap/Space pentru a sări. Jocul pornește la primul tap.</p>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="bg-white/5 rounded-xl border border-white/10 w-full max-w-md"
      />
      <div className="flex items-center gap-3">
        <div className="text-lg">Scor: {score}</div>
        <button onClick={() => window.location.reload()} className="bg-white/10 px-3 py-2 rounded-md text-sm">Restart</button>
      </div>
    </div>
  );
}
