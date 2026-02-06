"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getVisitorId } from "@/lib/visitor";

const categories = [
  { id: "birthday", label: "Zi de naștere" },
  { id: "good_morning", label: "Bună dimineața" },
  { id: "good_luck", label: "Baftă" },
  { id: "compliment", label: "Compliment" },
  { id: "encourage", label: "Încurajare" }
];

type Favorite = { _id: string; text: string; category: string };

export default function MessagesPage() {
  const [name, setName] = useState("Alexandra");
  const [selected, setSelected] = useState("compliment");
  const [current, setCurrent] = useState("");
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const storedName = localStorage.getItem("love_arcade_name");
    if (storedName) setName(storedName);
    getVisitorId();
    refreshFav();
  }, []);

  const refreshFav = () =>
    apiFetch<{ favorites: Favorite[] }>("/favorites")
      .then(r => setFavorites(r.favorites))
      .catch(() => {});

  const generate = () =>
    apiFetch<{ message: string }>("/messages/generate", { query: { category: selected, name } })
      .then(r => setCurrent(r.message));

  const favorite = () =>
    apiFetch("/favorites", { method: "POST", body: JSON.stringify({ text: current, category: selected }) })
      .then(() => refreshFav());

  const remove = (id: string) =>
    apiFetch(`/favorites/${id}`, { method: "DELETE" }).then(() => refreshFav());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Generator Mesaje</h1>
        <Link href="/arcade" className="text-sm text-candy hover:underline">← Înapoi la Arcade</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`px-3 py-2 rounded-full text-sm ${selected === c.id ? "bg-candy text-black" : "bg-white/10"}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm text-white/70">Numele ei / alint</label>
        <input
          value={name}
          onChange={e => {
            setName(e.target.value);
            localStorage.setItem("love_arcade_name", e.target.value);
          }}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none"
        />
        <button onClick={generate} className="bg-candy text-black px-4 py-2 rounded-lg font-semibold w-fit">
          Generează mesaj
        </button>
        {current && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-medium mb-2">{current}</div>
            <button onClick={favorite} className="text-sm text-candy">❤️ Favorite</button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6">Favorite</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {favorites.map(f => (
          <div key={f._id} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-sm text-white/60 mb-1">{f.category}</div>
            <div className="font-medium">{f.text}</div>
            <button onClick={() => remove(f._id)} className="text-xs text-red-300 mt-2">Șterge</button>
          </div>
        ))}
        {!favorites.length && <p className="text-white/60">N-ai salvat încă mesaje.</p>}
      </div>
    </div>
  );
}
