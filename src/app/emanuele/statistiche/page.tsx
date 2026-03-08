"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const STAT_TIPS = [
    "Le <strong>stats base</strong> definiscono le capacità del personaggio al livello 1. Bilanciale bene!",
    "Un eroe con <strong>tutto al massimo è noioso</strong> — i migliori giochi hanno eroi con punti di forza E debolezze.",
    "HP = Punti Vita, MP = Punti Magia, ATK = Attacco, DEF = Difesa, VEL = Velocità. Ogni stat cambia il gameplay!",
    "La <strong>tabella di crescita</strong> determina come il personaggio migliora con i livelli — è il cuore del bilanciamento!",
    "Nei giochi RPG famosi, i <strong>test di bilanciamento</strong> durano mesi — ma tu puoi iniziare con valori semplici!",
];

const STATS = ["HP", "MP", "ATK", "DEF", "VEL"] as const;
const STAT_COLORS: Record<string, string> = { HP: "#ef4444", MP: "#3b82f6", ATK: "#f59e0b", DEF: "#10b981", VEL: "#a855f7" };
const STAT_ICONS: Record<string, string> = { HP: "❤️", MP: "💧", ATK: "⚔️", DEF: "🛡️", VEL: "⚡" };
const MAX_STAT = 20;

type LevelRow = { level: number; xp: number; hpBonus: number; atkBonus: number };

const defaultLevels: LevelRow[] = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1, xp: i === 0 ? 0 : (i * 100), hpBonus: i * 5, atkBonus: Math.floor(i * 1.5),
}));

function RadarChart({ stats }: { stats: Record<string, number> }) {
    const cx = 100, cy = 100, r = 75;
    const keys = STATS;
    const n = keys.length;
    const angleStep = (2 * Math.PI) / n;

    const points = keys.map((k, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const ratio = stats[k] / MAX_STAT;
        return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
    });
    const polyPoints = points.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <svg viewBox="0 0 200 200" className="w-full max-w-[260px]">
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1].map(s => (
                <polygon key={s} points={keys.map((_, i) => {
                    const a = i * angleStep - Math.PI / 2;
                    return `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}`;
                }).join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
            ))}
            {/* Axes */}
            {keys.map((_, i) => {
                const a = i * angleStep - Math.PI / 2;
                return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />;
            })}
            {/* Fill */}
            <polygon points={polyPoints} fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth={2} />
            {/* Dots + labels */}
            {keys.map((k, i) => {
                const a = i * angleStep - Math.PI / 2;
                const lx = cx + (r + 16) * Math.cos(a);
                const ly = cy + (r + 16) * Math.sin(a);
                return (<g key={k}>
                    <circle cx={points[i].x} cy={points[i].y} r={3.5} fill={STAT_COLORS[k]} />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={STAT_COLORS[k]} fontSize={9} fontWeight={700}>{k}</text>
                </g>);
            })}
        </svg>
    );
}

export default function StatistichePage() {
    const [stats, setStats] = useState<Record<string, number>>({ HP: 10, MP: 8, ATK: 7, DEF: 6, VEL: 9 });
    const [heroName, setHeroName] = useState("");
    const [levels, setLevels] = useState<LevelRow[]>(defaultLevels);

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("gd_stats")); if (s) setStats(JSON.parse(s));
                const n = localStorage.getItem(getStorageKey("gd_hero_name")); if (n) setHeroName(n);
                const l = localStorage.getItem(getStorageKey("gd_levels")); if (l) setLevels(JSON.parse(l));
            } catch { }
        });
    }, []);

    const save = useCallback((s: Record<string, number>, n: string, l: LevelRow[]) => {
        localStorage.setItem(getStorageKey("gd_stats"), JSON.stringify(s));
        localStorage.setItem(getStorageKey("gd_hero_name"), n);
        localStorage.setItem(getStorageKey("gd_levels"), JSON.stringify(l));
    }, []);

    const setStat = (key: string, val: number) => {
        const ns = { ...stats, [key]: val }; setStats(ns); save(ns, heroName, levels);
    };

    const setName = (n: string) => { setHeroName(n); save(stats, n, levels); };

    const setLevel = (idx: number, field: keyof LevelRow, val: number) => {
        const nl = [...levels]; nl[idx] = { ...nl[idx], [field]: val }; setLevels(nl); save(stats, heroName, nl);
    };

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
                            <span className="text-emerald-400 font-bold">Statistiche</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">📊 Missione 1</div>
                        <h1 className="text-3xl font-black text-white">Statistiche del Giocatore</h1>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={STAT_TIPS} emoji="📊" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Stats Sliders */}
                    <div className="quest-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">🎯 Stats Base (Livello 1)</h2>
                        <div className="mb-4">
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Nome Eroe</label>
                            <input className="quest-input mt-1" value={heroName} onChange={e => setName(e.target.value)} placeholder="Il tuo eroe..." />
                        </div>
                        {STATS.map(k => (
                            <div key={k} className="mb-3">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-bold" style={{ color: STAT_COLORS[k] }}>{STAT_ICONS[k]} {k}</span>
                                    <span className="text-white font-mono font-bold">{stats[k]}/{MAX_STAT}</span>
                                </div>
                                <input type="range" min={1} max={MAX_STAT} value={stats[k]} onChange={e => setStat(k, +e.target.value)}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, ${STAT_COLORS[k]} ${(stats[k] / MAX_STAT) * 100}%, rgba(255,255,255,0.1) ${(stats[k] / MAX_STAT) * 100}%)` }} />
                            </div>
                        ))}
                        <div className="mt-3 text-xs text-emerald-300/60 text-center">Totale punti: <strong className="text-white">{Object.values(stats).reduce((a, b) => a + b, 0)}</strong>/100</div>
                    </div>

                    {/* Radar Chart */}
                    <div className="quest-card p-6 flex flex-col items-center justify-center">
                        <h2 className="text-lg font-bold text-white mb-4">📈 Radar delle Abilità</h2>
                        <RadarChart stats={stats} />
                        {heroName && <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 font-bold text-center">{heroName} — Lv. 1</div>}
                    </div>
                </div>

                {/* XP / Level Table */}
                <div className="quest-card p-6">
                    <h2 className="text-lg font-bold text-white mb-4">📈 Tabella Crescita XP/Livello</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-emerald-400 text-xs uppercase tracking-wider border-b border-emerald-500/20">
                                    <th className="p-2 text-left">Lv</th>
                                    <th className="p-2 text-left">XP Richiesti</th>
                                    <th className="p-2 text-left">Bonus HP</th>
                                    <th className="p-2 text-left">Bonus ATK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {levels.map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-emerald-500/5">
                                        <td className="p-2 text-white font-bold">{row.level}</td>
                                        <td className="p-2"><input type="number" className="quest-input !py-1 !px-2 !w-24" value={row.xp} onChange={e => setLevel(i, "xp", +e.target.value)} /></td>
                                        <td className="p-2"><input type="number" className="quest-input !py-1 !px-2 !w-20" value={row.hpBonus} onChange={e => setLevel(i, "hpBonus", +e.target.value)} /></td>
                                        <td className="p-2"><input type="number" className="quest-input !py-1 !px-2 !w-20" value={row.atkBonus} onChange={e => setLevel(i, "atkBonus", +e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
