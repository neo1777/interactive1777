"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, User, ChevronRight, Menu, MessageCircle } from "lucide-react";

export default function TopNav() {
    const pathname = usePathname();

    // Simple breadcrumbs logic
    const pathSegments = pathname.split("/").filter(segment => segment !== "");

    return (
        <header className="sticky top-0 z-40 w-full h-16 bg-[var(--quest-primary)]/40 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 flex items-center justify-between">
            {/* Left Side: Breadcrumbs / Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-400 hover:text-white transition-colors">
                    <Menu className="w-6 h-6" />
                </button>

                <nav className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-widest overflow-hidden">
                    <Link href="/" className="text-white/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                        Home
                    </Link>

                    {pathSegments.map((segment, index) => (
                        <div key={segment} className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-gray-600" />
                            <Link
                                href={`/${pathSegments.slice(0, index + 1).join("/")}`}
                                className={`${index === pathSegments.length - 1 ? "text-emerald-400 font-black" : "text-white/40 hover:text-white"} transition-colors capitalize cursor-pointer`}
                            >
                                {segment.replace(/-/g, " ")}
                            </Link>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right Side: Search & Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden md:flex items-center relative group">
                    <Search className="absolute left-3 w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cerca moduli..."
                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all w-48 lg:w-64"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button 
                        onClick={() => window.dispatchEvent(new CustomEvent("open-isoquest-chat"))}
                        className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-xl transition-all relative group cursor-pointer"
                        title="Chat Supporto"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-[var(--quest-primary)] animate-pulse"></span>
                    </button>

                    <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all relative group cursor-pointer">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[var(--quest-primary)] group-hover:scale-110 transition-transform"></span>
                    </button>

                    <div className="md:hidden w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 overflow-hidden cursor-pointer">
                        <User className="text-emerald-400 w-4 h-4" />
                    </div>
                </div>
            </div>
        </header>
    );
}
