"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStorageKey } from "@/lib/storage";
import Confetti from "@/components/Confetti";
import ExportButton from "@/components/ExportButton";

import { Settings2, Layers, PencilLine, Bug, Star, Map as MapIcon } from "lucide-react";

const MISSIONS = [
    { href: "/giuliano/setup", icon: Settings2, label: "Setup Mappa", desc: "Configurazione tile, layer e camera", storageKeys: ["ld_setup"], color: "text-emerald-400" },
    { href: "/giuliano/mappe", icon: Layers, label: "Le 3 Mappe", desc: "Villaggio, foresta, dungeon", storageKeys: ["ld_maps"], color: "text-emerald-400" },
    { href: "/giuliano/sprites", icon: PencilLine, label: "Pixel Art", desc: "Sprite sheet con Piskel / Aseprite", storageKeys: ["ld_sprites"], color: "text-emerald-400" },
    { href: "/giuliano/qa", icon: Bug, label: "QA Testing", desc: "Bug report e test checklist", storageKeys: ["ld_bugs", "ld_checks"], color: "text-emerald-400" },
];

const EXTRAS = [
    { href: "/giuliano/bonus", icon: Star, label: "Sfida Isometrica", color: "text-emerald-400" },
];

export default function GiulianoPage() {
    const [completed, setCompleted] = useState<boolean[]>([]);
    const [prefix, setPrefix] = useState("");

    useEffect(() => {
        Promise.resolve().then(() => {
            const user = localStorage.getItem("currentUser") || "";
            setPrefix(`${user}_`);
            const results = MISSIONS.map(m =>
                m.storageKeys.some(k => {
                    try {
                        const v = localStorage.getItem(getStorageKey(k));
                        return !!v && v !== "[]" && v !== "null" && v !== "{}";
                    } catch { return false; }
                })
            );
            setCompleted(results);
        });
    }, []);

    const doneCount = completed.filter(Boolean).length;
    const allDone = doneCount === MISSIONS.length && doneCount > 0;
    const pct = MISSIONS.length > 0 ? Math.round((doneCount / MISSIONS.length) * 100) : 0;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full max-w-7xl mx-auto">
            <Confetti show={allDone} />

            <div className="w-full">
                {/* Dashboard Header */}
                <div className="quest-card overflow-hidden mb-8 slide-up relative min-h-[300px] flex flex-col justify-end p-6 sm:p-10 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl">
                    <Image
                        src="/assets/level_designer_banner.png"
                        alt="Level Design Workshop"
                        fill
                        className="object-cover object-top opacity-35 mix-blend-screen"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--quest-bg)] via-[var(--quest-bg)]/60 to-transparent pointer-events-none" />

                    <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                        {prefix && <ExportButton prefix={prefix} filename="giuliano_level_designer_backup.json" />}
                    </div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="breadcrumb mb-4 text-xs font-semibold opacity-80 flex items-center gap-2">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span className="separator">/</span>
                            <span className="text-emerald-400 drop-shadow">Laboratori</span>
                            <span className="separator">/</span>
                            <span className="text-white drop-shadow">Giuliano</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black text-white drop-shadow-xl tracking-tighter mb-4 flex items-center gap-5 leading-none font-mono">
                            <MapIcon className="w-10 h-10 sm:w-16 sm:h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
                            ISO<span className="text-emerald-400">QUEST</span>: GIULIANO
                        </h1>
                        <p className="text-emerald-100 text-lg sm:text-xl drop-shadow-md font-medium max-w-xl">Costruisci i mondi, disegna le mappe e testa l&apos;esperienza di gioco!</p>
                    </div>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
                    {/* Left Column (Main Missions) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Progress Bar */}
                        {completed.length > 0 && (
                            <div className="quest-card p-6 slide-up rounded-2xl shadow-lg border border-white/5 bg-gradient-to-br from-black/40 to-emerald-900/10" style={{ animationDelay: "0.1s" }}>
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-white font-black flex items-center gap-3 text-lg font-mono">
                                        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                                            <Layers className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        STATUS CANTIERE
                                    </span>
                                    <span className={`font-black px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400 text-xs tracking-widest font-mono`}>
                                        {doneCount}/{MISSIONS.length} {allDone && "COMPLETED"}
                                    </span>
                                </div>
                                <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <div className={`h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out ${allDone ? "shimmer-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" : ""}`}
                                        style={{ width: `${pct}%` }} />
                                </div>
                                {allDone && <p className="text-center text-emerald-400 text-sm mt-4 font-bold pop-in bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">✨ Mondi completati! Sei un vero Level Designer!</p>}
                            </div>
                        )}

                        <div className="flex items-center gap-4 slide-up mt-2" style={{ animationDelay: "0.15s" }}>
                            <h2 className="text-[11px] font-black text-white/40 tracking-[0.4em] uppercase font-mono">Pianificazione Moduli</h2>
                            <div className="h-px bg-white/5 flex-1"></div>
                        </div>

                        {/* Missions Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {MISSIONS.map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <Link key={m.href} href={m.href}
                                        className={`quest-card p-6 flex flex-col justify-between group hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 relative slide-up min-h-[160px] cursor-pointer rounded-2xl ${completed[i] ? "quest-card-done" : ""}`}
                                        style={{ animationDelay: `${0.2 + i * 0.05}s` }}>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`bg-black/40 p-3 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform shadow-inner ${m.color}`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            {completed[i] ? (
                                                <span className="text-lg bg-emerald-500/20 w-8 h-8 flex items-center justify-center rounded-full border border-emerald-500/30 text-emerald-400">✓</span>
                                            ) : (
                                                <span className="text-xs font-bold text-emerald-300/40 bg-black/60 px-3 py-1.5 rounded-full uppercase tracking-wider group-hover:text-emerald-400 transition-colors border border-white/5">Costruisci ➔</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-base mb-1 group-hover:text-emerald-400 transition-colors uppercase tracking-wider font-mono">{m.label}</h3>
                                            <p className="text-white/30 text-[11px] font-medium leading-relaxed uppercase tracking-widest">{m.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column (Sidebar Extras) */}
                    <div className="flex flex-col gap-6">
                        {/* Extras */}
                        <div className="quest-card p-6 slide-up rounded-2xl" style={{ animationDelay: "0.4s" }}>
                            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
                                <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                                    <Star className="text-emerald-400 w-5 h-5" />
                                </div>
                                Sfide Bonus
                            </h3>
                            <div className="flex flex-col gap-3">
                                {EXTRAS.map(e => {
                                    const Icon = e.icon;
                                    return (
                                        <Link key={e.href} href={e.href}
                                            className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer">
                                            <div className={`bg-black/50 w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform shadow-inner ${e.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-white font-bold text-base flex-1">{e.label}</span>
                                            <span className="text-white/20 group-hover:translate-x-1 group-hover:text-white transition-all">➔</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resource Preview */}
                        <div className="quest-card p-6 slide-up rounded-2xl" style={{ animationDelay: "0.45s" }}>
                            <h3 className="text-white font-black text-[10px] tracking-[0.2em] mb-6 flex items-center gap-2 uppercase font-mono">
                                <span className="text-emerald-400 border border-emerald-400/30 rounded p-0.5"><Layers className="w-3 h-3" /></span> Risorse Workshop
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Tileset", icon: Layers },
                                    { label: "Sprites", icon: PencilLine },
                                    { label: "Assets", icon: MapIcon },
                                    { label: "Bugs", icon: Bug }
                                ].map(res => {
                                    const ResIcon = res.icon;
                                    return (
                                        <div key={res.label} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3 group hover:bg-white/10 hover:border-emerald-500/40 transition-all cursor-pointer">
                                            <ResIcon className="w-5 h-5 text-emerald-400/60 group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
                                            <span className="text-white/30 text-[9px] uppercase font-black tracking-widest">{res.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Workbook Cover Preview */}
                        <div className="quest-card overflow-hidden slide-up relative group" style={{ animationDelay: "0.5s" }}>
                            <div className="w-full h-[180px] relative bg-black/80">
                                <Image src="/assets/level_designer_workbook_cover.png" alt="Manuale del Level Designer" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--quest-card)] via-transparent to-transparent pointer-events-none" />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-center">
                                <h3 className="text-white font-black text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center tracking-tight">Manuale Level Designer</h3>
                                <p className="text-xs text-emerald-300 font-bold bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-white/10 backdrop-blur-sm shadow-lg">Documentazione</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
