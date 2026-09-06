import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import LoginGateModal from "@/components/LoginGateModal";

export const metadata: Metadata = {
  title: "Football Skills Tier List & Voting Web App",
  description: "ระบบจัด Tier List จากการโหวตค่าเฉลี่ย 7 หมวด 36 ข้อย่อย (คะแนนเต็ม 180)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-rose-500 selection:text-white">
        <AuthProvider>
          <LoginGateModal />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 space-y-1">
              <p className="font-semibold text-slate-300">
                ⚽ ระบบจัดอันดับ Tier List ทักษะฟุตบอล (7 หมวด 36 ข้อย่อย)
              </p>
              <p>
                Tier S (136-180) • Tier A (91-135) • Tier B (46-90) • Tier C (0-45)
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
