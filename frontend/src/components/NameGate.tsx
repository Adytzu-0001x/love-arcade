"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/useToast";
import { getStoredName, setStoredName } from "@/lib/user";

export default function NameGate() {
  const [name, setName] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    const existing = getStoredName();
    if (existing) {
      setNeedsName(false);
    } else {
      setNeedsName(true);
    }
  }, []);

  const save = () => {
    if (!name.trim()) return;
    setStoredName(name.trim());
    push(`Bun venit, ${name.trim()}! ❤️`);
    setNeedsName(false);
  };

  if (!needsName) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-sm w-full space-y-3">
        <h2 className="text-xl font-semibold text-white">Întâi punem numele tău</h2>
        <p className="text-sm text-white/70">E obligatoriu ca să-ți salvăm scorurile pe acest device.</p>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/15 border border-white/25 rounded-lg px-3 py-2 outline-none"
          placeholder="Alexandra"
        />
        <button onClick={save} className="bg-candy text-black font-semibold px-4 py-2 rounded-lg w-full">
          Intră în Love Arcade
        </button>
        <p className="text-xs text-white/60">Nu cerem cont; numele se salvează doar local.</p>
      </div>
    </div>
  );
}
