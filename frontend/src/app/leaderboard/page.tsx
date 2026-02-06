"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Score = { visitorId: string; score: number; createdAt: string; meta?: { name?: string } };

const games = [
  { id: "flappy", label: "Flappy Heart" },
  { id: "tetris", label: "Tetris Bouquet" },
  { id: "2048", label: "Heart 2048" }
];

export default function Leaderboard() {
  const [game, setGame] = useState("flappy");
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    apiFetch<{ scores: Score[] }>("/leaderboard", { query: { game, limit: 20 } }).then(r => setScores(r.scores));
  }, [game]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clasament</h1>
      <div className="flex gap-2">
        {games.map(g => (
          <button key={g.id} onClick={() => setGame(g.id)}
            className={`px-3 py-2 rounded-full text-sm ${game === g.id ? "bg-candy text-black" : "bg-white/10"}`}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        {scores.map((s, i) => (
          <div key={i} className="flex justify-between py-1 text-sm border-b border-white/5 last:border-0">
            <div>#{i + 1}</div>
            <div>{s.meta?.name ? s.meta.name : `Anon ${s.visitorId.slice(0, 6)}`}</div>
            <div className="font-semibold">{s.score}</div>
          </div>
        ))}
        {!scores.length && <p className="text-white/60">Niciun scor încă.</p>}
      </div>
    </div>
  );
}



