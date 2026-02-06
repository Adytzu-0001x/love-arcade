"use client";
import { createContext, useContext, useState } from "react";

type Toast = { id: number; text: string };
const ToastCtx = createContext<{ push: (text: string) => void }>({ push: () => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, set] = useState<Toast[]>([]);
  const push = (text: string) => {
    const id = Date.now();
    set(t => [...t, { id, text }]);
    setTimeout(() => set(t => t.filter(x => x.id !== id)), 2500);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className="bg-white/10 text-white px-4 py-2 rounded-lg shadow-lg border border-white/20">
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);



