type FetchOptions = RequestInit & { query?: Record<string, string | number | undefined> };

const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiFetch = async <T>(path: string, opts: FetchOptions = {}): Promise<T> => {
  const { query, headers, ...rest } = opts;
  const url = new URL(path, base);
  if (query) Object.entries(query).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
  const visitorId = typeof window !== "undefined" ? localStorage.getItem("love_arcade_visitor") : "";
  const res = await fetch(url.toString(), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(visitorId ? { "X-Visitor-Id": visitorId } : {}),
      ...headers
    }
  });
  if (!res.ok) throw new Error((await res.json())?.error?.message || "Request failed");
  return res.json();
};



