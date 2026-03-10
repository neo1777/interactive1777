import type { Metadata } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import Starfield from "@/components/Starfield";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import FeedbackSystem from "@/components/FeedbackSystem";
import GlobalChat from "@/components/GlobalChat";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
  display: "swap"
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-code",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Isometric Quest — Game Dev Workshop",
  description: "Tre ruoli, un gioco. Alice, Emanuele e Giuliano costruiscono Isometric Quest insieme!",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className="antialiased flex h-screen w-full overflow-hidden bg-[var(--quest-bg)]">
        <Starfield count={55} />

        <Sidebar />

        <main className="flex-1 overflow-y-auto relative z-10 w-full h-full pb-16 md:pb-0 flex flex-col">
          <TopNav />
          <div className="flex-1">
            <AuthProvider>
              {children}
            </AuthProvider>
          </div>
        </main>

        {/* Global UI Elements */}
        <FeedbackSystem />
        <GlobalChat />
      </body>
    </html>
  );
}
