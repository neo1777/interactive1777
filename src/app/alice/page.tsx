"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStorageKey } from "@/lib/storage";
import { getAssetPath } from "@/lib/utils";
import Confetti from "@/components/Confetti";
import ExportButton from "@/components/ExportButton";

import { User, Sword, Map, Smile, Image as ImageIcon, Star, Sparkles, LayoutPanelTop, Activity } from "lucide-react";

const MISSIONS = [
    { href: "/missione/personaggi", icon: User, label: "Personaggi", desc: "Eroe, nemici, amici — disegnali tutti!", storageKeys: ["iq_hero_front", "iq_hero", "iq_enemy_easy", "iq_enemies", "iq_friend_0", "iq_friends"], color: "text-purple-400" },
    { href: "/missione/oggetti", icon: Sword, label: "Oggetti", desc: "Spade, pozioni, armature magiche e artefatti", storageKeys: ["iq_item_0", "iq_items"], color: "text-red-400" },
    { href: "/missione/mappa", icon: Map, label: "Mappa", desc: "Disegna il mondo: zone e biomi", storageKeys: ["iq_alice_map_grid", "iq_alice_map_pois"], color: "text-emerald-400" },
    { href: "/missione/emozioni", icon: Smile, label: "Emozioni", desc: "Dai vita ai personaggi con espressioni", storageKeys: ["iq_emo_hero_happy", "iq_emo_npc_happy"], color: "text-yellow-400" },
    { href: "/alice/effetti", icon: Sparkles, label: "Effetti Visivi", desc: "Acqua, nebbia, illuminazione, magia", storageKeys: ["alice_effetti"], color: "text-cyan-400" },
    { href: "/alice/hud", icon: LayoutPanelTop, label: "HUD & Menu", desc: "Progetta l'interfaccia di gioco", storageKeys: ["alice_hud"], color: "text-fuchsia-400" },
    { href: "/alice/stati", icon: Activity, label: "Status Effects", desc: "Veleno, fuoco, gelo: disegna gli stati", storageKeys: ["alice_stati"], color: "text-rose-400" },
];

const EXTRAS = [
    { href: "/galleria", icon: ImageIcon, label: "Galleria", color: "text-blue-400" },
    { href: "/alice/bonus", icon: Star, label: "Sfida Creativa", color: "text-yellow-400" },
];

export default function AlicePage() {
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
                        return !!v && v !== "[]" && v !== "null";
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
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <Confetti show={allDone} />

            <div className="w-full max-w-4xl">
                {/* Dashboard Header */}
                <div className="quest-card overflow-hidden mb-8 slide-up relative min-h-[260px] flex flex-col justify-end p-6 sm:p-8 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                    <Image
                        src={getAssetPath("/assets/art_director_banner.png")}
                        alt="Art Director Hub"
                        fill
                        className="object-cover object-top opacity-30 mix-blend-screen"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--quest-bg)] via-[var(--quest-bg)]/60 to-transparent pointer-events-none" />

                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        {prefix && <ExportButton prefix={prefix} filename="alice_art_director_backup.json" />}
                        <Link href="/" className="btn-secondary text-xs py-1.5 px-3 bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/10 !text-emerald-400 border-emerald-500/20">⬅ Home</Link>
                    </div>

                    <div className="relative z-10 w-full max-w-2xl">
                        <div className="breadcrumb mb-3 text-xs opacity-80">
                            <Link href="/" className="hover:text-white transition-colors">🏠 Home</Link>
                            <span className="separator">›</span>
                            <span className="text-emerald-400 font-bold drop-shadow">Alice</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg tracking-tight mb-2">
                            🎨 Atelier dell&apos;Art Director
                        </h1>
                        <p className="text-emerald-100/80 text-base sm:text-lg drop-shadow font-medium">Dai vita al mondo visivo del gioco!</p>
                    </div>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main Missions) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Progress Bar */}
                        {completed.length > 0 && (
                            <div className="quest-card p-5 slide-up border-emerald-500/20" style={{ animationDelay: "0.1s" }}>
                                <div className="flex justify-between items-center text-sm mb-3">
                                    <span className="text-white font-bold flex items-center gap-2">
                                        <span className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/30">📊</span>
                                        Progresso Missioni
                                    </span>
                                    <span className={`font-bold px-3 py-1 bg-black/40 rounded-full border border-white/5 ${allDone ? "text-emerald-400" : "text-emerald-400/60"}`}>
                                        {doneCount}/{MISSIONS.length} {allDone && "🏆"}
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ${allDone ? "shimmer-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" : ""}`}
                                        style={{ width: `${pct}%` }} />
                                </div>
                                {allDone && <p className="text-center text-emerald-400 text-xs mt-3 font-bold pop-in">✨ Tutte le missioni completate! Sei una vera Art Director!</p>}
                            </div>
                        )}

                        <div className="flex items-center gap-3 slide-up" style={{ animationDelay: "0.15s" }}>
                            <h2 className="text-xl font-bold text-white">Missioni Principali</h2>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        {/* Missions Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {MISSIONS.map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <Link key={m.href} href={m.href}
                                        className={`quest-card p-6 flex flex-col justify-between group hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 relative slide-up min-h-[160px] cursor-pointer rounded-2xl ${completed[i] ? "quest-card-done border-emerald-500/40" : "border-white/5"}`}
                                        style={{ animationDelay: `${0.2 + i * 0.05}s` }}>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`bg-black/40 p-3 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform shadow-inner text-emerald-400`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            {completed[i] ? (
                                                <span className="text-lg bg-emerald-500/20 w-8 h-8 flex items-center justify-center rounded-full border border-emerald-500/30 text-emerald-400">✓</span>
                                            ) : (
                                                <span className="text-xs font-bold text-emerald-300/40 bg-black/60 px-3 py-1.5 rounded-full uppercase tracking-wider group-hover:text-emerald-400 transition-colors border border-white/5">Inizia ➔</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl mb-2 group-hover:text-emerald-300 transition-colors">{m.label}</h3>
                                            <p className="text-emerald-100/40 text-sm leading-relaxed">{m.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column (Sidebar Extras) */}
                    <div className="flex flex-col gap-6">
                        {/* Extras */}
                        <div className="quest-card p-5 slide-up" style={{ animationDelay: "0.4s" }}>
                            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                <span className="bg-yellow-500/20 p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500">🌟</span> Extra
                            </h3>
                            <div className="flex flex-col gap-3">
                                {EXTRAS.map(e => {
                                    const Icon = e.icon;
                                    return (
                                        <Link key={e.href} href={e.href}
                                            className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all group cursor-pointer">
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

                        {/* Game Assets Preview */}
                        <div className="quest-card p-5 slide-up" style={{ animationDelay: "0.45s" }}>
                            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                <span className="text-fuchsia-400">🎨</span> Preview Asset
                            </h3>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                {[
                                    { src: getAssetPath("/assets/hero_face.png"), label: "Eroe" },
                                    { src: getAssetPath("/assets/knight_armor.png"), label: "Armatura" },
                                    { src: getAssetPath("/assets/magic_sword.png"), label: "Spada" }
                                ].map((sketch, i) => (
                                    <div key={sketch.label} className="text-center group">
                                        <div className="w-14 h-14 relative mx-auto mb-2 bg-black/40 rounded-xl border border-white/5 p-1 group-hover:border-fuchsia-500/40 transition-colors shadow-inner">
                                            <Image src={sketch.src} alt={sketch.label} fill className="object-contain" />
                                        </div>
                                        <span className="text-purple-300/50 text-[10px] uppercase font-bold tracking-wider">{sketch.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Workbook Cover Preview */}
                        <a 
                            href={getAssetPath("/docs/alice_art_director_v2.pdf")} 
                            download 
                            className="quest-card overflow-hidden slide-up relative group cursor-pointer block hover:border-fuchsia-500/50 transition-all border-white/5" 
                            style={{ animationDelay: "0.5s" }}
                        >
                            <div className="w-full h-[180px] relative bg-black/80">
                                <Image src={getAssetPath("/assets/art_director_workbook_cover.png")} alt="Manuale dell'Art Director" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--quest-card)] via-transparent to-transparent pointer-events-none" />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-center">
                                <h3 className="text-white font-black text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center tracking-tight">Manuale dell&apos;Art Director</h3>
                                <p className="text-xs text-fuchsia-300 font-bold bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-white/10 backdrop-blur-sm shadow-lg flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse"></span>
                                    Scarica PDF
                                </p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
