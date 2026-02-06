const NAME_KEY = "love_arcade_name";
const GREET_KEY = "love_arcade_greeted";

export const getStoredName = () =>
  typeof window !== "undefined" ? localStorage.getItem(NAME_KEY) || "" : "";

export const setStoredName = (name: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name.trim());
  sessionStorage.removeItem(GREET_KEY);
};

export const shouldGreet = () => {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(GREET_KEY)) return false;
  return !!localStorage.getItem(NAME_KEY);
};

export const markGreeted = () => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GREET_KEY, "1");
};
