"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { Layout, Map as MapIcon, Navigation, CheckCircle2, Circle, ArrowLeft, Paintbrush, Pin, MapPin, Trees, Home, Castle } from "lucide-react";

const MAP_BUILD_TIPS = [
    "Ogni mappa ha una <strong>checklist</strong> di elementi essenziali — spuntali tutti per una mappa completa!",
    "Il <strong>Villaggio</strong> è il punto di partenza — deve avere NPC, negozi e un sentiero chiaro verso l'avventura.",
    "La <strong>Foresta</strong> è la zona di esplorazione — metti nemici, forzieri nascosti e un percorso verso il dungeon.",
    "Il <strong>Dungeon</strong> è la sfida finale — corridoi stretti, trappole e il boss nella stanza più grande!",
    "Posiziona i <strong>POI</strong> (punti di interesse) con cura: player spawn, NPC, nemici, forzieri e porte.",
];

const MAPS = [
    {
        key: "village", name: "Villaggio", icon: Home, size: 20, file: "village_01.tmx",
        checks: ["Player spawn point al centro/basso", "Almeno 3 NPC (saggio, negoziante, guardia)", "Sentiero chiaro verso l'uscita", "Negozio / forziere tutorial", "Collision su muri e bordi", "Dimensione: 30×30"]
    },
    {
        key: "forest", name: "Foresta", icon: Trees, size: 24, file: "forest_01.tmx",
        checks: ["Ingresso collegato al villaggio", "3-5 enemy spawn points", "Almeno un forziere nascosto", "Sentiero verso il dungeon", "Variazione terreno: alberi, cespugli, radure", "Dimensione: 40×40"]
    },
    {
        key: "dungeon", name: "Dungeon", icon: Castle, size: 16, file: "dungeon_01.tmx",
        checks: ["Ingresso dalla foresta", "Corridoi stretti e stanze", "1 boss spawn nella stanza finale", "Forzieri con loot prima del boss", "Collision ovunque (muri grotta)", "Dimensione: 25×25"]
    },
];

const TERRAINS = [
    { name: "Erba", color: "#22c55e" }, { name: "Terra", color: "#92400e" },
    { name: "Acqua", color: "#3b82f6" }, { name: "Pietra", color: "#6b7280" },
    { name: "Foresta", color: "#166534" }, { name: "Lava", color: "#dc2626" },
    { name: "Sabbia", color: "#d4a373" }, { name: "Vuoto", color: "#1e1535" },
];

const POIS = [
    { name: "Player", emoji: "🦸" }, { name: "NPC", emoji: "🧝" },
    { name: "Enemy", emoji: "👾" }, { name: "Forziere", emoji: "📦" },
    { name: "Porta", emoji: "🚪" }, { name: "Boss", emoji: "💀" },
];

type MapData = { grid: number[][]; pois: { r: number; c: number; type: number }[]; checklist: boolean[] };

function createEmptyMap(size: number, checkCount: number): MapData {
    return { grid: Array.from({ length: size }, () => Array(size).fill(0)), pois: [], checklist: Array(checkCount).fill(false) };
}

export default function MappePage() {
    const [activeMap, setActiveMap] = useState(0);
    const [maps, setMaps] = useState<MapData[]>(MAPS.map(m => createEmptyMap(m.size, m.checks.length)));
    const [tool, setTool] = useState<"paint" | "poi">("paint");
    const [terrain, setTerrain] = useState(0);
    const [poi, setPoi] = useState(0);
    const painting = useRef(false);

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("ld_maps")); if (s) setMaps(JSON.parse(s)); } catch { } }); }, []);

    const save = useCallback((m: MapData[]) => localStorage.setItem(getStorageKey("ld_maps"), JSON.stringify(m)), []);

    const map = maps[activeMap];
    const mapDef = MAPS[activeMap];

    const paintCell = (r: number, c: number) => {
        if (tool === "paint") {
            const nm = [...maps]; const ng = nm[activeMap].grid.map(row => [...row]);
            ng[r][c] = terrain;
            nm[activeMap] = { ...nm[activeMap], grid: ng }; setMaps(nm); save(nm);
        } else {
            const nm = [...maps]; const existing = nm[activeMap].pois.findIndex(p => p.r === r && p.c === c);
            if (existing >= 0) nm[activeMap].pois.splice(existing, 1);
            else nm[activeMap] = { ...nm[activeMap], pois: [...nm[activeMap].pois, { r, c, type: poi }] };
            setMaps(nm); save(nm);
        }
    };

    const toggleCheck = (idx: number) => {
        const nm = [...maps]; const nc = [...nm[activeMap].checklist]; nc[idx] = !nc[idx];
        nm[activeMap] = { ...nm[activeMap], checklist: nc }; setMaps(nm); save(nm);
    };

    const cellSize = Math.min(20, Math.floor(600 / mapDef.size));

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-6xl">
                <div className="flex justify-between items-center mb-6 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Layout className="w-3 h-3" />
                            Missione 2
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase text-center sm:text-left font-mono">
                            LE 3 <span className="text-emerald-400">MAPPE</span>
                        </h1>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Giuliano Hub
                    </Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={MAP_BUILD_TIPS} emoji="🏗️" />
                </div>

                {/* Map tabs */}
                <div className="builder-tabs mb-10 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mx-auto sm:mx-0 shadow-2xl backdrop-blur-xl">
                    {MAPS.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <button key={i} className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer font-mono ${activeMap === i
                                ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                                : "text-white/40 hover:text-white/60"}`} onClick={() => setActiveMap(i)}>
                                <Icon className="w-4 h-4" />
                                {m.name}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                    {/* Map Grid */}
                    <div className="quest-card p-4">
                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                            <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit shadow-xl">
                                <button onClick={() => setTool("paint")} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer font-mono ${tool === "paint" ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white/60"}`}>
                                    <Paintbrush className="w-3.5 h-3.5" />
                                    Terreno
                                </button>
                                <button onClick={() => setTool("poi")} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer font-mono ${tool === "poi" ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white/60"}`}>
                                    <MapPin className="w-3.5 h-3.5" />
                                    POI
                                </button>
                            </div>
                            {tool === "paint" ? (
                                <div className="flex gap-2 flex-wrap ml-2">
                                    {TERRAINS.map((t, i) => (
                                        <button key={i} onClick={() => setTerrain(i)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer shadow-lg hover:scale-110 ${terrain === i ? "border-emerald-400 scale-110 shadow-emerald-500/20" : "border-white/5 hover:border-white/20"}`}
                                            style={{ background: t.color }} title={t.name} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex gap-2 flex-wrap ml-2">
                                    {POIS.map((p, i) => (
                                        <button key={i} onClick={() => setPoi(i)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer font-mono border ${poi === i ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg" : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"}`}>
                                            <span className="text-xs">{p.emoji}</span> {p.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="overflow-auto max-h-[500px] border border-white/5 rounded-lg p-1 bg-black/60 shadow-inner">
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${mapDef.size}, ${cellSize}px)`, gap: "1px" }}
                                onMouseDown={() => { painting.current = true; }} onMouseUp={() => { painting.current = false; }} onMouseLeave={() => { painting.current = false; }}>
                                {map.grid.map((row, r) => row.map((cell, c) => {
                                    const poiHere = map.pois.find(p => p.r === r && p.c === c);
                                    return (
                                        <div key={`${r}-${c}`}
                                            onMouseDown={() => paintCell(r, c)}
                                            onMouseEnter={() => { if (painting.current && tool === "paint") paintCell(r, c); }}
                                            style={{ width: cellSize, height: cellSize, background: TERRAINS[cell]?.color || "#1e1535", cursor: "crosshair", position: "relative", fontSize: cellSize * 0.6 }}
                                            className="flex items-center justify-center select-none">
                                            {poiHere && <span style={{ lineHeight: 1 }}>{POIS[poiHere.type]?.emoji}</span>}
                                        </div>
                                    );
                                }))}
                            </div>
                        </div>
                        <div className="text-xs text-emerald-300/40 text-center mt-2">{mapDef.file} — {mapDef.size}×{mapDef.size} tiles</div>
                    </div>

                    {/* Checklist */}
                    <div className="quest-card p-6 h-fit sticky top-24 border-emerald-500/20">
                        <h3 className="text-[10px] font-black text-white/40 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
                            <CheckCircle2 className="text-emerald-400 w-4 h-4" />
                            CHECKLIST PROGETTAZIONE
                        </h3>
                        <div className="space-y-2">
                            {mapDef.checks.map((ch, i) => (
                                <button key={i} onClick={() => toggleCheck(i)}
                                    className={`w-full text-left flex items-start gap-4 p-4 rounded-xl text-[11px] font-medium transition-all duration-300 border ${map.checklist[i]
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                        : "bg-white/5 border-white/5 text-emerald-100/30 hover:border-white/10"}`}>
                                    <span className={`flex-shrink-0 mt-0.5 ${map.checklist[i] ? "text-emerald-400" : "text-white/10"}`}>
                                        {map.checklist[i] ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    </span>
                                    <span className="leading-relaxed">{ch}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 text-center">
                            <span className="text-xs text-emerald-400 font-bold">{map.checklist.filter(Boolean).length}/{mapDef.checks.length} completati</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
