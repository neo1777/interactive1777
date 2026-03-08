"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const ENEMY_DESIGN_TIPS = [
    "Ogni nemico ha stats diverse: <strong>HP alti + DEF alta</strong> = nemico tank, <strong>ATK alto + VEL alta</strong> = nemico rapido!",
    "Il Boss deve essere forte ma <strong>non impossibile</strong>: lascia al giocatore una chance se è al livello giusto!",
    "Le <strong>debolezze</strong> rendono il gioco strategico: se il boss è debole al fuoco, il giocatore deve trovare l'arma giusta.",
    "I <strong>drop (bottino)</strong> motivano il giocatore: sconfiggere un nemico forte deve dare ricompense migliori!",
    "Il <strong>comportamento</strong> cambia lo stile di combattimento: aggressivo attacca subito, difensivo aspetta, fuggitivo scappa!",
];

const WEAKNESSES = ["Fuoco 🔥", "Ghiaccio ❄️", "Luce ✨", "Nessuna 🚫"];
const BEHAVIORS = ["Aggressivo ⚔️", "Difensivo 🛡️", "Fuggitivo 🏃"];
const STAT_KEYS = ["HP", "ATK", "DEF", "VEL"] as const;
const STAT_COLORS: Record<string, string> = { HP: "#ef4444", ATK: "#f59e0b", DEF: "#10b981", VEL: "#a855f7" };

type EnemyData = {
    name: string; type: string; level: number;
    stats: Record<string, number>; drops: string;
    weakness: string; behavior: string;
};

const defaults: EnemyData[] = [
    { name: "", type: "Slime", level: 1, stats: { HP: 5, ATK: 3, DEF: 2, VEL: 4 }, drops: "", weakness: WEAKNESSES[0], behavior: BEHAVIORS[0] },
    { name: "", type: "Goblin", level: 5, stats: { HP: 12, ATK: 8, DEF: 5, VEL: 6 }, drops: "", weakness: WEAKNESSES[1], behavior: BEHAVIORS[0] },
    { name: "", type: "Boss", level: 10, stats: { HP: 50, ATK: 15, DEF: 12, VEL: 3 }, drops: "", weakness: WEAKNESSES[2], behavior: BEHAVIORS[1] },
];

const DIFFICULTY = ["Facile 🟢", "Medio 🟡", "Boss 🔴"];

export default function NemiciPage() {
    const [enemies, setEnemies] = useState<EnemyData[]>(defaults);
    const [activeEnemy, setActiveEnemy] = useState(0);

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("gd_enemies")); if (s) setEnemies(JSON.parse(s)); } catch { } }); }, []);

    const save = useCallback((e: EnemyData[]) => localStorage.setItem(getStorageKey("gd_enemies"), JSON.stringify(e)), []);

    const update = (idx: number, partial: Partial<EnemyData>) => {
        const ne = [...enemies]; ne[idx] = { ...ne[idx], ...partial }; setEnemies(ne); save(ne);
    };
    const updateStat = (idx: number, key: string, val: number) => {
        const ne = [...enemies]; ne[idx] = { ...ne[idx], stats: { ...ne[idx].stats, [key]: val } }; setEnemies(ne); save(ne);
    };

    const e = enemies[activeEnemy];

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-4 slide-up">
                    <div>
                        <div className="breadcrumb mb-2">
                            <Link href="/">🏠 Home</Link>
                            <span className="separator">›</span>
                            <Link href="/emanuele">Emanuele</Link>
                            <span className="separator">›</span>
                            <span className="text-emerald-400 font-bold">Nemici</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">👾 Missione 2</div>
                        <h1 className="text-3xl font-black text-white">Schede dei Nemici</h1>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={ENEMY_DESIGN_TIPS} emoji="👾" />
                </div>

                <div className="mb-6 slide-up" style={{ animationDelay: "0.1s" }}>
                    <ExamplePanel title="👾 Esempio: Guida alla progettazione dei nemici"
                        imageSrc="/assets/enemy_design_guide.png"
                        imageAlt="Guida alla progettazione di nemici RPG">
                        <p>I nemici dovrebbero avere un <strong>design coerente</strong> con il loro ruolo. Un nemico veloce sarà snello, mentre un tank sarà massiccio. Nota come cambiano le <strong>silhouette</strong> e i colori per indicare la pericolosità!</p>
                    </ExamplePanel>
                </div>

                {/* Enemy tabs */}
                <div className="builder-tabs mb-6">
                    {enemies.map((en, i) => (
                        <button key={i} onClick={() => setActiveEnemy(i)}
                            className={`builder-tab ${activeEnemy === i ? "active" : ""}`}>
                            <span>{["🟢", "🟡", "🔴"][i]}</span>
                            <span className="tab-label">{DIFFICULTY[i]}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Info */}
                    <div className="quest-card p-6 space-y-4">
                        <h2 className="text-lg font-bold text-white">📋 Informazioni</h2>
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Nome</label>
                            <input className="quest-input mt-1" value={e.name} onChange={ev => update(activeEnemy, { name: ev.target.value })} placeholder="Nome del nemico..." />
                        </div>
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Tipo</label>
                            <input className="quest-input mt-1" value={e.type} onChange={ev => update(activeEnemy, { type: ev.target.value })} placeholder="es. Slime, Goblin..." />
                        </div>
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Livello</label>
                            <input type="number" className="quest-input mt-1 !w-24" min={1} max={20} value={e.level} onChange={ev => update(activeEnemy, { level: +ev.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Oggetti Drop</label>
                            <input className="quest-input mt-1" value={e.drops} onChange={ev => update(activeEnemy, { drops: ev.target.value })} placeholder="es. 10 oro, pozione piccola..." />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="quest-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">📊 Statistiche</h2>
                        {STAT_KEYS.map(k => (
                            <div key={k} className="mb-3">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-bold" style={{ color: STAT_COLORS[k] }}>{k}</span>
                                    <span className="text-white font-mono font-bold">{e.stats[k]}</span>
                                </div>
                                <input type="range" min={1} max={50} value={e.stats[k]} onChange={ev => updateStat(activeEnemy, k, +ev.target.value)}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, ${STAT_COLORS[k]} ${(e.stats[k] / 50) * 100}%, rgba(255,255,255,0.1) ${(e.stats[k] / 50) * 100}%)` }} />
                            </div>
                        ))}

                        {/* Weakness */}
                        <div className="mt-5">
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">Debolezza</label>
                            <div className="flex flex-wrap gap-2">
                                {WEAKNESSES.map(w => (
                                    <button key={w} onClick={() => update(activeEnemy, { weakness: w })}
                                        className={`type-chip ${e.weakness === w ? "active !border-emerald-500/50 !text-emerald-300" : ""}`}>{w}</button>
                                ))}
                            </div>
                        </div>

                        {/* Behavior */}
                        <div className="mt-4">
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">Comportamento</label>
                            <div className="flex flex-wrap gap-2">
                                {BEHAVIORS.map(b => (
                                    <button key={b} onClick={() => update(activeEnemy, { behavior: b })}
                                        className={`type-chip ${e.behavior === b ? "active !border-emerald-500/50 !text-emerald-300" : ""}`}>{b}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
