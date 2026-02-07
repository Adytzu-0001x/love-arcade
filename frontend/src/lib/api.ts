type FetchOptions = RequestInit & { query?: Record<string, string | number | undefined> };

const baseEnv = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

const buildUrl = (path: string, query?: Record<string, string | number | undefined>) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(baseEnv + cleanPath);
  if (query) Object.entries(query).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
  return url.toString();
};

export const apiFetch = async <T>(path: string, opts: FetchOptions = {}): Promise<T> => {
  const { query, headers, ...rest } = opts;
  const visitorId = typeof window !== "undefined" ? localStorage.getItem("love_arcade_visitor") : "";
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(visitorId ? { "X-Visitor-Id": visitorId } : {}),
      ...headers
    }
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error?.message || "Request failed");
  return res.json();
};
