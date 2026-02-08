"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HeartsOverlay from "@/components/HeartsOverlay";

export default function RouteHearts() {
  const pathname = usePathname();
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const shouldPlay = pathname.startsWith("/games/") || pathname === "/bucket";
    if (shouldPlay) {
      setBurstKey(prev => prev + 1);
    }
  }, [pathname]);

  if (burstKey === 0) return null;
  return <HeartsOverlay burstKey={burstKey} />;
}
