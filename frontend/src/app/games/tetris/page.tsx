"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/lib/useToast";
import { useSwipe } from "@/lib/useSwipe";
import Link from "next/link";

const COLS = 10, ROWS = 20;
type Cell = number | 0;
type Piece = { shape: number[][]; x: number; y: number; color: string };

const SHAPES = [
  [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,1,0],[0,1,1]], [[0,1,1],[1,1,0]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]
];
const colors = ["#ff6b9f","#ffd166","#6be0ff","#c084fc","#a3e635","#f472b6","#f97316"];

export default function Tetris() {
  const [board, setBoard] = useState<Cell[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [piece, setPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [petals, setPetals] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { push } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  useSwipe(containerRef, dir => {
    if (dir === "left") move(-1);
    if (dir === "right") move(1);
    if (dir === "down") drop();
    if (dir === "up") rotate();
  });

  const spawn = () => {
    const i = Math.floor(Math.random() * SHAPES.length);
    setPiece({ shape: SHAPES[i], x: 3, y: 0, color: colors[i] });
    setGameOver(false);
  };

  useEffect(() => { spawn(); }, []);

  // auto drop continuous
  useEffect(() => {
    const id = setInterval(() => drop(true), 650);
    return () => clearInterval(id);
  }, []);

  const collide = (shape: number[][], x: number, y: number) =>
    shape.some((row, dy) =>
      row.some((cell, dx) =>
        cell && (board[y + dy]?.[x + dx] || y + dy >= ROWS || x + dx < 0 || x + dx >= COLS)
      )
    );

  const mergePiece = (p: Piece) => {
    const newB = board.map(r => [...r]);
    p.shape.forEach((row, dy) => row.forEach((cell, dx) => { if (cell) newB[p.y + dy][p.x + dx] = 1; }));
    return newB;
  };

  const clearLines = (b: Cell[][]) => {
    let lines = 0;
    const filtered = b.filter(r => r.some(c => !c));
    lines = ROWS - filtered.length;
    while (filtered.length < ROWS) filtered.unshift(Array(COLS).fill(0));
    if (lines) {
      setScore(s => s + lines * 100);
      setPetals(p => {
        const next = p + Math.floor(lines / 5) + (lines >= 5 ? 1 : 0);
        if (next >= 3) {
          apiFetch<{ message: string }>("/messages/random", { query: { category: "birthday", name: "Alexandra" } })
            .then(r => push(r.message))
            .catch(() => push("Petale magice!"));
        }
        return next;
      });
    }
    setBoard(filtered);
  };

  const drop = (auto = false) => {
    if (!piece || gameOver) return;
    if (!collide(piece.shape, piece.x, piece.y + 1)) {
      setPiece({ ...piece, y: piece.y + 1 });
    } else {
      const newB = mergePiece(piece);
      clearLines(newB);
      spawn();
    }
  };

  const move = (dir: number) => {
    if (!piece || gameOver) return;
    if (!collide(piece.shape, piece.x + dir, piece.y)) setPiece({ ...piece, x: piece.x + dir });
  };

  const rotate = () => {
    if (!piece || gameOver) return;
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(r => r[i]).reverse());
    if (!collide(rotated, piece.x, piece.y)) setPiece({ ...piece, shape: rotated });
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowUp") rotate();
      if (e.key === "ArrowDown") drop();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  useEffect(() => {
    if (!piece) return;
    const b = board.map(r => [...r]);
    piece.shape.forEach((row, dy) => row.forEach((cell, dx) => { if (cell && b[piece.y + dy]) b[piece.y + dy][piece.x + dx] = 2; }));
    setRenderBoard(b);
  }, [piece, board]);

  const [renderBoard, setRenderBoard] = useState(board);

  useEffect(() => {
    if (!piece) return;
    if (collide(piece.shape, piece.x, piece.y)) {
      if (!gameOver) {
        setGameOver(true);
        push(`Game over. Scor ${score}`);
        apiFetch("/scores", { method: "POST", body: JSON.stringify({ game: "tetris", score, meta: { name: getVisitorNameSafe() } }) }).catch(() => {});
      }
    }
  }, [piece]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAndQuit = () => {
    apiFetch("/scores", { method: "POST", body: JSON.stringify({ game: "tetris", score, meta: { name: getVisitorNameSafe() } }) }).catch(() => {});
    restart();
  };

  const restart = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setPetals(0);
    spawn();
  };

  const getVisitorNameSafe = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("love_arcade_name") || "";
  };

  return (
    <div ref={containerRef} className="space-y-3 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Tetris Bouquet</h1>
        <div>Scor: {score}</div>
        <div>Petale: {petals}</div>
      </div>
      <Link href="/arcade" className="text-sm text-candy hover:underline">← Înapoi la Arcade</Link>
      <div className="flex gap-2">
        <button onClick={saveAndQuit} className="bg-candy text-black px-3 py-2 rounded-md text-sm">Salvează scorul</button>
        <button onClick={restart} className="bg-white/10 px-3 py-2 rounded-md text-sm">Restart</button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-2 inline-block">
        <div className="grid grid-cols-10 gap-[1px] bg-black/30">
          {renderBoard.flatMap((row, y) =>
            row.map((c, x) => (
              <div key={`${x}-${y}`} className="w-6 h-6 sm:w-7 sm:h-7" style={{ background: c ? "#ff6b9f" : "rgba(255,255,255,0.04)" }} />
            ))
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-center text-sm">
        <button onClick={() => move(-1)} className="bg-white/10 px-3 py-2 rounded">←</button>
        <button onClick={() => rotate()} className="bg-white/10 px-3 py-2 rounded">↻</button>
        <button onClick={() => move(1)} className="bg-white/10 px-3 py-2 rounded">→</button>
        <button onClick={() => drop()} className="bg-candy text-black px-3 py-2 rounded">↓</button>
      </div>
      <p className="text-sm text-white/70">Swipe sau săgeți pentru control. Piesele cad singure.</p>
    </div>
  );
}
