"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getVisitorId } from "@/lib/visitor";
import { useToast } from "@/lib/useToast";

const categories = [
  { id: "birthday", label: "Zi de naștere" },
  { id: "good_morning", label: "Bună dimineața" },
  { id: "good_luck", label: "Baftă" },
  { id: "compliment", label: "Compliment" },
  { id: "encourage", label: "Încurajare" }
];

const localFallback: Record<string, string[]> = {
  birthday: [
    "La mulți ani, {NAME}! Azi ești lumina mea. 🎂",
    "{NAME}, să-ți fie ziua plină de zâmbete! ✨"
  ],
  good_morning: [
    "Bună dimineața, {NAME}! Cafeaua e mai bună cu tine. ☕️",
    "Să ai o zi dulce ca tine, {NAME}! 🌸"
  ],
  good_luck: [
    "Baftă, {NAME}! Țin pumnii pentru tine. 🤞",
    "{NAME}, ești pregătită. Succes! 🍀"
  ],
  compliment: [
    "{NAME}, zâmbetul tău e preferatul meu. ❤️",
    "Ochii tăi fac orice loc acasă, {NAME}."
  ],
  encourage: [
    "Poți, {NAME}! Sunt cu tine. 💪",
    "Respiră, {NAME}. Pas cu pas. 🌱"
  ]
};

type Favorite = { _id: string; text: string; category: string };

const LOCAL_FAV_KEY = "love_arcade_favorites_local";

export default function MessagesPage() {
  const [name, setName] = useState("Alexandra");
  const [selected, setSelected] = useState("compliment");
  const [current, setCurrent] = useState("");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { push } = useToast();

  useEffect(() => {
    const storedName = localStorage.getItem("love_arcade_name");
    if (storedName) setName(storedName);
    getVisitorId();
    refreshFav();
  }, []);

  const loadLocalFavs = (): Favorite[] => {
    try {
      const raw = localStorage.getItem(LOCAL_FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalFavs = (list: Favorite[]) => {
    localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify(list));
  };

  const refreshFav = () =>
    apiFetch<{ favorites: Favorite[] }>("/favorites")
      .then(r => setFavorites(r.favorites))
      .catch(() => setFavorites(loadLocalFavs()));

  const generate = () =>
    apiFetch<{ message: string }>("/messages/generate", { query: { category: selected, name } })
      .then(r => setCurrent(r.message))
      .catch(() => {
        const fallback = pickLocal(selected, name);
        setCurrent(fallback);
        push("Backend indisponibil, folosesc mesaj local");
      });

  const favorite = () =>
    apiFetch("/favorites", { method: "POST", body: JSON.stringify({ text: current, category: selected }) })
      .then(() => refreshFav())
      .catch(() => {
        // fallback local
        const loc = [...loadLocalFavs(), { _id: crypto.randomUUID(), text: current, category: selected }];
        saveLocalFavs(loc);
        setFavorites(loc);
        push("Salvat local (fallback)");
      });

  const remove = (id: string) =>
    apiFetch(`/favorites/${id}`, { method: "DELETE" })
      .then(() => refreshFav())
      .catch(() => {
        const loc = loadLocalFavs().filter(f => f._id !== id);
        saveLocalFavs(loc);
        setFavorites(loc);
      });

  const pickLocal = (cat: string, nm: string) => {
    const list = localFallback[cat] || ["Mesaj pentru {NAME}"];
    const m = list[Math.floor(Math.random() * list.length)];
    return m.replace("{NAME}", nm || "iubita mea");
  };

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
