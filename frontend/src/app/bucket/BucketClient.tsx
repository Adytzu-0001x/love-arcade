"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/lib/useToast";

type BucketItem = {
  _id: string;
  text: string;
  done: boolean;
  createdAt: string;
  doneAt?: string | null;
};

const KEY_STORAGE = "loveArcadeBucketKey";
const FILTERS = ["all", "todo", "done"] as const;
type Filter = (typeof FILTERS)[number];

const randomKey = (length = 24) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => chars[b % chars.length]).join("");
  }
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const sortItems = (items: BucketItem[]) =>
  [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

export default function BucketClient() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [listKey, setListKey] = useState("");
  const [items, setItems] = useState<BucketItem[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlKey = params?.get("key") || "";
    const stored = localStorage.getItem(KEY_STORAGE) || "";
    let nextKey = urlKey || stored;
    if (!nextKey) {
      nextKey = randomKey(24);
    }
    if (nextKey && nextKey !== stored) {
      localStorage.setItem(KEY_STORAGE, nextKey);
    }
    if (nextKey && nextKey !== urlKey) {
      const nextParams = new URLSearchParams(params?.toString());
      nextParams.set("key", nextKey);
      router.replace(`/bucket?${nextParams.toString()}`);
    }
    setListKey(nextKey);
  }, [params, router]);

  const shareUrl =
    typeof window !== "undefined" && listKey
      ? `${window.location.origin}/bucket?key=${listKey}`
      : "";

  const fetchItems = async (key: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: BucketItem[] }>("/bucket", { query: { key } });
      setItems(sortItems(data.items));
    } catch (err) {
      toast.push("Nu am putut încărca lista.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listKey) fetchItems(listKey);
  }, [listKey]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(item => {
      if (filter === "todo" && item.done) return false;
      if (filter === "done" && !item.done) return false;
      if (q && !item.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, search]);

  const doneCount = items.filter(i => i.done).length;
  const totalCount = items.length;
  const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const addItem = async () => {
    const trimmed = text.trim();
    if (!trimmed || !listKey) return;
    setText("");
    const tempId = `temp-${Date.now()}`;
    const optimistic: BucketItem = {
      _id: tempId,
      text: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
      doneAt: null
    };
    setItems(prev => sortItems([optimistic, ...prev]));
    try {
      const data = await apiFetch<{ item: BucketItem }>("/bucket", {
        method: "POST",
        body: JSON.stringify({ key: listKey, text: trimmed })
      });
      setItems(prev => sortItems(prev.map(i => (i._id === tempId ? data.item : i))));
    } catch (err) {
      setItems(prev => prev.filter(i => i._id !== tempId));
      toast.push("Nu am putut adăuga itemul.");
    }
  };

  const toggleItem = async (item: BucketItem) => {
    if (!listKey) return;
    const previous = item.done;
    setItems(prev =>
      sortItems(
        prev.map(i =>
          i._id === item._id ? { ...i, done: !previous, doneAt: !previous ? new Date().toISOString() : null } : i
        )
      )
    );
    try {
      const data = await apiFetch<{ item: BucketItem }>(`/bucket/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ key: listKey, done: !previous })
      });
      setItems(prev => sortItems(prev.map(i => (i._id === item._id ? data.item : i))));
    } catch (err) {
      setItems(prev =>
        sortItems(prev.map(i => (i._id === item._id ? { ...i, done: previous, doneAt: item.doneAt } : i)))
      );
      toast.push("Nu am putut actualiza.");
    }
  };

  const deleteItem = async (item: BucketItem) => {
    if (!listKey) return;
    setItems(prev => prev.filter(i => i._id !== item._id));
    try {
      await apiFetch(`/bucket/${item._id}`, { method: "DELETE", query: { key: listKey } });
    } catch (err) {
      setItems(prev => sortItems([...prev, item]));
      toast.push("Nu am putut șterge itemul.");
    }
  };

  const copyKey = async () => {
    if (!listKey) return;
    try {
      await navigator.clipboard.writeText(listKey);
      toast.push("Cheia a fost copiată.");
    } catch (err) {
      toast.push("Nu am putut copia cheia.");
    }
  };

  const shareLink = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Bucket List 💌", url: shareUrl });
        return;
      } catch (err) {
        toast.push("Share anulată.");
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.push("Link copiat.");
    } catch (err) {
      toast.push("Nu am putut copia link-ul.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-3xl font-semibold mb-2">Bucket List 💌</h1>
        <p className="text-sm text-white/70">Lista voastră comună, sincronizată după cheie.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Key: {listKey || "..."}</span>
          <button onClick={copyKey} className="bg-white/10 px-3 py-2 rounded-full text-sm">
            Copiază
          </button>
          <button onClick={shareLink} className="bg-candy text-black px-3 py-2 rounded-full text-sm font-semibold">
            Share link
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Adaugă o dorință..."
            className="flex-1 min-w-[220px] bg-black/20 border border-white/10 rounded-lg px-3 py-2"
          />
          <button onClick={addItem} className="bg-candy text-black px-4 py-2 rounded-lg font-semibold">
            Adaugă
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-white/70">
            Progres: {doneCount} / {totalCount}
          </span>
          <div className="flex-1 min-w-[160px] h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-candy" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center text-sm">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full border ${
                filter === f ? "bg-candy text-black border-candy" : "bg-white/10 border-white/10"
              }`}
            >
              {f === "all" ? "Toate" : f === "todo" ? "De făcut" : "Făcute"}
            </button>
          ))}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută..."
            className="bg-black/20 border border-white/10 rounded-full px-3 py-1 text-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-white/60">Se încarcă...</p>
        ) : (
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-white/60">Nimic aici încă. Adaugă primul item!</p>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item._id}
                  className={`flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg border ${
                    item.done ? "bg-white/5 border-white/10 text-white/60" : "bg-black/20 border-white/10"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleItem(item)}
                      className="accent-candy"
                    />
                    <span className={item.done ? "line-through" : ""}>{item.text}</span>
                  </label>
                  <div className="ml-auto flex items-center gap-2 text-xs text-white/50">
                    {item.done && item.doneAt ? `Făcut pe ${new Date(item.doneAt).toLocaleDateString()}` : null}
                    <button onClick={() => deleteItem(item)} className="text-red-300 text-xs">
                      Șterge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
