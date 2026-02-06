"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setStoredName } from "@/lib/user";
import { useToast } from "@/lib/useToast";

export default function LoginPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { push } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStoredName(name.trim());
    push(`Bun venit, ${name.trim()}! ❤️`);
    router.push("/arcade");
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Intră în Love Arcade</h1>
      <p className="text-white/70 text-sm">Pune un nume sau alint. Îl ținem minte pe acest device.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none"
          placeholder="Alexandra"
        />
        <button type="submit" className="bg-candy text-black font-semibold px-4 py-2 rounded-lg w-full">
          Continuă
        </button>
      </form>
      <p className="text-xs text-white/60">Nu salvăm conturi pe server; doar pe acest dispozitiv.</p>
    </div>
  );
}
