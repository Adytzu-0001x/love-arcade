"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const cards = [
  { title: "Flappy Heart", href: "/games/flappy", desc: "Sari printre coloane" },
  { title: "Tetris Bouquet", href: "/games/tetris", desc: "Construiește buchetul" },
  { title: "Love Roulette", href: "/games/2048", desc: "Învârte și câștigă un premiu" },
  { title: "Mesaje", href: "/messages", desc: "Generează cuvinte pentru ea" },
  { title: "Clasament", href: "/leaderboard", desc: "Vezi scorurile" },
  { title: "Profil", href: "/profile", desc: "Timerul nostru" }
];

export default function Arcade() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
      {cards.map((c, i) => (
        <motion.div
          key={c.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
          <p className="text-sm text-white/70 mb-3">{c.desc}</p>
          <Link href={c.href} className="text-candy hover:underline text-sm">Deschide →</Link>
        </motion.div>
      ))}
    </div>
  );
}
