"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/arcade", label: "Joculețe" },
  { href: "/messages", label: "Mesaje" },
  { href: "/leaderboard", label: "Clasament" },
  { href: "/profile", label: "Profil" },
  { href: "/login", label: "Logare" }
];

export default function Navbar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="font-semibold text-candy text-lg">Love Arcade</Link>
        <nav className="flex flex-wrap gap-2 text-sm">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-full transition whitespace-nowrap ${
                path === l.href ? "bg-candy text-black" : "hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}



