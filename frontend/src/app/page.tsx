"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="text-center space-y-8 py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold">
        Love Arcade ❤️
      </motion.h1>
      <p className="text-lg text-white/80">
        O colecție de joculețe, mesaje și amintiri pentru Alexandra. Intră și joacă-te!
      </p>
      <Link href="/arcade" className="inline-block bg-candy text-black font-semibold px-6 py-3 rounded-full shadow-lg">
        Intră în Love Arcade
      </Link>
    </div>
  );
}
