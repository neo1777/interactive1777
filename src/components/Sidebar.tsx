"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Paintbrush, Gamepad2, Map, Settings, LogOut, Hexagon, User } from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
    { href: "/", label: "Home", icon: Home, color: "text-purple-400" },
    { href: "/alice", label: "Art Director", icon: Paintbrush, color: "text-fuchsia-400" },
    { href: "/emanuele", label: "Game Design", icon: Gamepad2, color: "text-teal-400" },
    { href: "/giuliano", label: "Level Design", icon: Map, color: "text-emerald-400" },
];

const BOTTOM_ITEMS = [
    { href: "#", label: "Impostazioni", icon: Settings, color: "text-gray-400" },
];

export default function Sidebar() {
    const pathname = usePathname();

    // Determine if a path is active. We check if the current pathname starts with the nav href.
    // Exception for home "/", it must be exact match or we highlight everything.
    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen bg-[var(--quest-primary)]/80 backdrop-blur-2xl border-r border-[var(--quest-card-border)] shadow-2xl z-50 shrink-0">
                {/* Logo Area */}
                <div className="h-24 flex items-center px-8 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:shadow-emerald-500/30 group-hover:scale-105 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Hexagon className="text-white w-7 h-7 relative z-10" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-white text-xl tracking-tighter leading-none font-mono">ISO<span className="text-emerald-400">QUEST</span></span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Laboratory</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-10 px-4 flex flex-col gap-1.5 overflow-y-auto">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 px-4">Moduli di Sviluppo</div>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group border cursor-pointer ${active
                                    ? "bg-white/5 border-white/10 text-white shadow-xl"
                                    : "text-white/40 border-transparent hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {/* Active Indicator Line */}
                                {active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                                )}

                                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? item.color : "group-hover:" + item.color}`} />
                                <span className={`font-black text-[11px] uppercase tracking-widest transition-opacity ${active ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile Area */}
                <div className="p-4 border-t border-white/5 flex flex-col gap-1.5">
                    {BOTTOM_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-white/40 hover:bg-white/5 hover:text-white group cursor-pointer"
                            >
                                <Icon className="w-5 h-5 group-hover:text-white/60 transition-colors" />
                                <span className="font-black text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group/profile cursor-pointer hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 overflow-hidden shrink-0 group-hover/profile:scale-105 transition-transform duration-300">
                            <User className="text-emerald-400 w-5 h-5" />
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-[11px] font-black text-white uppercase tracking-wider truncate">Designer Ospite</span>
                            <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest truncate">Lv. 1 Esploratore</span>
                        </div>
                        <button className="text-white/20 hover:text-red-400 transition-colors ml-auto cursor-pointer p-1">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Bar (visible only on small screens) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f0a1e]/95 backdrop-blur-xl border-t border-purple-500/20 z-50 flex items-center justify-around px-2 pb-safe">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${active ? item.color : "text-gray-500"
                                }`}
                        >
                            {active && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-80" />
                            )}
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
