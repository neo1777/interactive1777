"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { Wrench, Settings2, Layers, Eye, EyeOff, Diamond, Move, ArrowLeft, Info, CheckCircle2, AlertTriangle } from "lucide-react";

const SETUP_TIPS = [
    "⚠️ <strong>CRITICO:</strong> Il rapporto DEVE essere 2:1 (larghezza = doppio dell'altezza). 64×32 è lo standard!",
    "L'orientamento <strong>isometrico</strong> crea l'effetto 3D: i tile sono rombi, non quadrati.",
    "I <strong>layer</strong> funzionano come i livelli di Photoshop: ground sotto, oggetti sopra, collisioni invisibili in cima.",
    "Il layer <strong>collision</strong> è invisibile al giocatore ma blocca il movimento — mettilo su muri e bordi!",
    "Dimensione mappa 30×30 è perfetta per iniziare. Puoi sempre ingrandirla dopo!",
];

const LAYERS = [
    { name: "ground", type: "Tile Layer", desc: "Terreno base: erba, terra, sabbia, acqua", color: "#22c55e" },
    { name: "terrain_detail", type: "Tile Layer", desc: "Variazioni: fiori, sassi, crepe", color: "#84cc16" },
    { name: "buildings", type: "Tile Layer", desc: "Strutture: muri, case, ponti, scale", color: "#f59e0b" },
    { name: "objects", type: "Object Layer", desc: "Oggetti interattivi: forzieri, segni, porte", color: "#3b82f6" },
    { name: "entities", type: "Object Layer", desc: "Spawn points: player, enemy, npc", color: "#a855f7" },
    { name: "collision", type: "Object Layer", desc: "Zone non attraversabili (invisibili)", color: "#ef4444" },
];

type MapConfig = { orientation: string; tileWidth: number; tileHeight: number; mapWidth: number; mapHeight: number };

export default function SetupPage() {
    const [config, setConfig] = useState<MapConfig>({ orientation: "Isometric", tileWidth: 64, tileHeight: 32, mapWidth: 30, mapHeight: 30 });
    const [activeLayers, setActiveLayers] = useState<string[]>(LAYERS.map(l => l.name));

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("ld_config")); if (s) setConfig(JSON.parse(s));
                const l = localStorage.getItem(getStorageKey("ld_layers")); if (l) setActiveLayers(JSON.parse(l));
            } catch { }
        });
    }, []);

    const save = useCallback((c: MapConfig, l: string[]) => {
        localStorage.setItem(getStorageKey("ld_config"), JSON.stringify(c)); localStorage.setItem(getStorageKey("ld_layers"), JSON.stringify(l));
    }, []);

    const updateConfig = (partial: Partial<MapConfig>) => {
        const nc = { ...config, ...partial }; setConfig(nc); save(nc, activeLayers);
    };
    const toggleLayer = (name: string) => {
        const nl = activeLayers.includes(name) ? activeLayers.filter(n => n !== name) : [...activeLayers, name];
        setActiveLayers(nl); save(config, nl);
    };

    const ratioOk = config.tileWidth === config.tileHeight * 2;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-6 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Wrench className="w-3 h-3" />
                            Missione 1
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight leading-none uppercase">Setup Mappa</h1>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Giuliano Hub
                    </Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={SETUP_TIPS} emoji="🔧" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Config */}
                    <div className="quest-card p-6 space-y-4 border-emerald-500/20">
                        <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                            <Settings2 className="text-emerald-400 w-5 h-5" />
                            Parametri Mappa
                        </h2>
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Orientamento</label>
                            <div className="mt-2 flex gap-2">
                                {["Isometric", "Orthogonal"].map(o => (
                                    <button key={o} onClick={() => updateConfig({ orientation: o })}
                                        className={`type-chip ${config.orientation === o ? "active !border-emerald-500/50 !text-emerald-300" : ""}`}>{o === "Isometric" ? "◇" : "□"} {o}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Tile Width (px)</label>
                                <input type="number" className="quest-input mt-1" value={config.tileWidth} onChange={e => updateConfig({ tileWidth: +e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Tile Height (px)</label>
                                <input type="number" className="quest-input mt-1" value={config.tileHeight} onChange={e => updateConfig({ tileHeight: +e.target.value })} />
                            </div>
                        </div>
                        <div className={`text-xs font-black tracking-widest uppercase text-center p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${ratioOk ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            {ratioOk ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 animate-pulse" />}
                            Rapporto {config.tileWidth}:{config.tileHeight} — {ratioOk ? "Corretto (2:1)" : "Deve essere 2:1!"}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Map Width (tiles)</label>
                                <input type="number" className="quest-input mt-1" value={config.mapWidth} onChange={e => updateConfig({ mapWidth: +e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Map Height (tiles)</label>
                                <input type="number" className="quest-input mt-1" value={config.mapHeight} onChange={e => updateConfig({ mapHeight: +e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Isometric Demo */}
                    <div className="quest-card p-6 flex flex-col items-center justify-center border-emerald-500/20">
                        <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wide flex items-center gap-2 text-center">
                            <Diamond className="text-emerald-400 w-5 h-5" />
                            Anteprima Tile Isometrica
                        </h2>
                        <svg viewBox="0 0 200 140" className="w-full max-w-[300px]">
                            {/* 3x3 iso grid demo */}
                            {[0, 1, 2].map(r => [0, 1, 2].map(c => {
                                const x = 100 + (c - r) * 32;
                                const y = 30 + (c + r) * 16;
                                const colors = ["#22c55e", "#16a34a", "#15803d"];
                                return <polygon key={`${r}-${c}`} points={`${x},${y} ${x + 32},${y + 16} ${x},${y + 32} ${x - 32},${y + 16}`}
                                    fill={colors[(r + c) % 3]} stroke="#0f0a1e" strokeWidth={1} opacity={0.8} />;
                            }))}
                            <text x={100} y={125} textAnchor="middle" fill="#a7f3d0" fontSize={10} fontWeight={700}>64×32 — Rapporto 2:1</text>
                        </svg>
                    </div>
                </div>

                {/* Layers */}
                <div className="quest-card p-8 border-emerald-500/20">
                    <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wide flex items-center gap-2">
                        <Layers className="text-emerald-400 w-5 h-5" />
                        Layer della Mappa
                        <span className="text-[10px] text-white/40 ml-auto">(Dal basso verso l&apos;alto)</span>
                    </h2>
                    <div className="space-y-2">
                        {LAYERS.map((layer, i) => (
                            <div key={layer.name} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${activeLayers.includes(layer.name) ? "bg-white/5 border-white/5" : "bg-black/20 border-white/5 opacity-50"}`}>
                                <button onClick={() => toggleLayer(layer.name)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeLayers.includes(layer.name)
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                                        : "bg-white/5 text-white/20 border border-white/5"}`}>
                                    {activeLayers.includes(layer.name) ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                                <div className="w-1.5 h-8 rounded-full" style={{ background: layer.color }} />
                                <div className="flex flex-col flex-1">
                                    <span className="text-white font-black text-sm uppercase tracking-wider">{layer.name}</span>
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{layer.type}</span>
                                </div>
                                <span className="hidden sm:block text-xs text-emerald-300/40 italic font-medium">{layer.desc}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 text-xs flex items-center gap-3 font-medium">
                        <Info className="w-5 h-5 shrink-0" />
                        Il layer &apos;collision&apos; è fondamentale: senza di esso il giocatore cammina attraverso i muri!
                    </div>
                </div>
            </div>
        </div>
    );
}
