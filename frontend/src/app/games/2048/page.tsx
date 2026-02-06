"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { getVisitorName } from "@/lib/visitor";

const prizes = [
  "Un sărut dulce",
  "Îmbrățișare lungă",
  "Cafea împreună",
  "Desert preferat",
  "Masaj 15 minute",
  "Plimbare la apus",
  "Episod la alegerea ta",
  "Timp doar noi doi ✨"
];

export default function LoveRoulette() {
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // evită mismatch la hidratare

  const segments = prizes.length;
  const segmentAngle = 360 / segments;

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const targetIndex = Math.floor(Math.random() * segments);
    const extraSpins = 4;
    const newAngle = 360 * extraSpins + targetIndex * segmentAngle + segmentAngle / 2;
    setAngle(prev => prev + newAngle);
    setTimeout(() => {
      const prize = prizes[targetIndex];
      setResult(prize);
      setSpinning(false);
      apiFetch("/scores", {
        method: "POST",
        body: JSON.stringify({ game: "2048", score: 1, meta: { name: getVisitorName(), prize } })
      }).catch(() => {});
    }, 3200);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Love Roulette</h1>
          <p className="text-sm text-white/70">Apasă „Spin” și vezi ce premiu romantic câștigi.</p>
        </div>
        <Link href="/arcade" className="text-sm text-candy hover:underline">← Înapoi la Arcade</Link>
      </div>

      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-white/20 shadow-lg overflow-hidden transition-transform duration-[3200ms] ease-out"
            style={{
              transform: `rotate(${angle}deg)`,
              background: `conic-gradient(${prizes
                .map((_, i) => `${i % 2 ? "#ff6b9f" : "#ffd166"} ${(i * segmentAngle).toFixed(2)}deg ${(i + 1) * segmentAngle}deg`)
                .join(",")})`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/75 text-white rounded-full flex items-center justify-center font-bold">
              Spin
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-candy" />
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className="bg-candy text-black font-semibold px-6 py-3 rounded-full shadow-lg disabled:opacity-60"
        >
          {spinning ? "Se învârte..." : "Spin 🎡"}
        </button>

        {result && (
          <div className="text-lg font-semibold bg-white/10 border border-white/15 px-4 py-3 rounded-xl">
            Premiul tău: {result}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80">
          Premii posibile: {prizes.join(" · ")}
        </div>
      </div>
    </div>
  );
}
