import { v4 as uuid } from "uuid";
import { getStoredName } from "./user";

const KEY = "love_arcade_visitor";

export const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(KEY);
  if (stored) return stored;
  const id = uuid();
  localStorage.setItem(KEY, id);
  return id;
};

export const getVisitorName = () => getStoredName();
