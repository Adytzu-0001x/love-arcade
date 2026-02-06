import "./globals.css";
import { ToastProvider } from "@/lib/useToast";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

export const metadata = { title: "Love Arcade", description: "Pentru Alexandra ❤️" };

const NameGate = dynamic(() => import("@/components/NameGate"), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body suppressHydrationWarning>
        <ToastProvider>
          <Navbar />
          <NameGate />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
