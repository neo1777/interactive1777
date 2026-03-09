"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { Layout, Map as MapIcon, Navigation, CheckCircle2, Circle, ArrowLeft, Paintbrush, MapPin, Trees, Home, Castle, ZoomIn, ZoomOut, Move, Settings2, Trash2 } from "lucide-react";

// Tips
const MAP_BUILD_TIPS = [
    "Usa il <strong>Pan (Spazio + Trascinamento)</strong> o il tasto centrale del mouse per muoverti nella mappa.",
    "Puoi ingrandire o ridurre la mappa con i <strong>Pulsanti Zoom</strong> o la rotellina del mouse.",
    "Prova la vista <strong>Isometrica</strong> per un feel più RPG!",
    "Il <strong>Villaggio</strong> è il punto di partenza — deve avere NPC, negozi e un sentiero chiaro verso l'avventura.",
    "La <strong>Foresta</strong> è la zona di esplorazione — metti nemici, forzieri nascosti e un percorso verso il dungeon."
];

const MAPS = [
    { key: "village", name: "Villaggio", icon: Home, defaultSize: 30, file: "village_01.tmx", checks: ["Player spawn point al centro/basso", "Almeno 3 NPC (saggio, negoziante, guardia)", "Sentiero chiaro verso l'uscita", "Negozio / forziere tutorial", "Collision su muri e bordi"] },
    { key: "forest", name: "Foresta", icon: Trees, defaultSize: 40, file: "forest_01.tmx", checks: ["Ingresso collegato al villaggio", "3-5 enemy spawn points", "Almeno un forziere nascosto", "Sentiero verso il dungeon", "Variazione terreno: alberi, cespugli, radure"] },
    { key: "dungeon", name: "Dungeon", icon: Castle, defaultSize: 25, file: "dungeon_01.tmx", checks: ["Ingresso dalla foresta", "Corridoi stretti e stanze", "1 boss spawn nella stanza finale", "Forzieri con loot prima del boss", "Collision ovunque (muri grotta)"] },
];

const TERRAINS = [
    { id: 0, name: "Erba", color: "#22c55e", char: "grass" },
    { id: 1, name: "Terra", color: "#92400e", char: "dirt" },
    { id: 2, name: "Acqua", color: "#3b82f6", char: "water" },
    { id: 3, name: "Pietra", color: "#6b7280", char: "stone" },
    { id: 4, name: "Foresta", color: "#166534", char: "forest" },
    { id: 5, name: "Lava", color: "#dc2626", char: "lava" },
    { id: 6, name: "Sabbia", color: "#d4a373", char: "sand" },
    { id: 7, name: "Vuoto", color: "#1e1535", char: "void" },
];

// Expanded POIs categorized
const POI_CATEGORIES = {
    "Entità": [
        { id: 100, name: "Player Spawn", emoji: "🦸", type: "player" },
        { id: 101, name: "NPC Saggio", emoji: "🧙", type: "npc" },
        { id: 102, name: "Mercante", emoji: "💰", type: "npc" },
        { id: 103, name: "Guardia", emoji: "💂", type: "npc" },
        { id: 104, name: "Nemico Base", emoji: "👾", type: "enemy" },
        { id: 105, name: "Boss", emoji: "💀", type: "boss" },
    ],
    "Oggetti": [
        { id: 200, name: "Forziere", emoji: "📦", type: "loot" },
        { id: 201, name: "Chiave", emoji: "🔑", type: "key" },
        { id: 202, name: "Pozione", emoji: "🧪", type: "item" },
    ],
    "Strutture": [
        { id: 300, name: "Porta", emoji: "🚪", type: "door" },
        { id: 301, name: "Cartello", emoji: "🪧", type: "sign" },
        { id: 302, name: "Trappola", emoji: "💣", type: "trap" },
    ]
};
const FLAT_POIS = Object.values(POI_CATEGORIES).flat();

type MapData = {
    width: number;
    height: number;
    // We use a sparse object mapping "r,c" to terrain ID representing edits to save Space. Default is 0 (Grass)
    terrainData: Record<string, number>;
    pois: { r: number; c: number; id: number }[];
    checklist: boolean[];
};

export default function GiulianoMappePage() {
    const [activeMap, setActiveMap] = useState(0);
    const [maps, setMaps] = useState<MapData[]>(
        MAPS.map(m => ({
            width: m.defaultSize,
            height: m.defaultSize,
            terrainData: {},
            pois: [],
            checklist: Array(m.checks.length).fill(false)
        }))
    );

    // Tools
    const [tool, setTool] = useState<"paint" | "poi" | "pan">("paint");
    const [terrain, setTerrain] = useState(0);
    const [poiId, setPoiId] = useState(100);

    // Viewport
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isIsometric, setIsIsometric] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null);
    const isInteracting = useRef(false); // for drag painting/panning

    useEffect(() => {
        const saved = localStorage.getItem(getStorageKey("ld_maps"));
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrate old array-based grids to sparse objects if needed
                const migrated = parsed.map((m: any, i: number) => {
                    if (Array.isArray(m.grid)) {
                        const newTerrain: Record<string, number> = {};
                        m.grid.forEach((row: number[], r: number) => {
                            row.forEach((cell: number, c: number) => {
                                if (cell !== 0) newTerrain[`${r},${c}`] = cell;
                            });
                        });
                        return { ...m, terrainData: newTerrain, width: MAPS[i].defaultSize, height: MAPS[i].defaultSize, grid: undefined };
                    }
                    if (m.bgDataUrl === undefined) return { ...m, bgDataUrl: null };
                    return m;
                });
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setMaps(migrated);
            } catch (e) { console.error(e); }
        }
    }, []);

    const save = useCallback((m: MapData[]) => localStorage.setItem(getStorageKey("ld_maps"), JSON.stringify(m)), []);

    const currentMap = maps[activeMap];
    const mapDef = MAPS[activeMap];
    const CELL_SIZE = 32;

    const handleCellInteract = (r: number, c: number) => {
        if (tool === "pan") return;

        const nm = [...maps];
        if (tool === "paint") {
            const nt = { ...nm[activeMap].terrainData };
            if (terrain === 0) delete nt[`${r},${c}`]; // 0 is default grass
            else nt[`${r},${c}`] = terrain;
            nm[activeMap] = { ...nm[activeMap], terrainData: nt };
        } else if (tool === "poi") {
            const existingIdx = nm[activeMap].pois.findIndex(p => p.r === r && p.c === c);
            if (existingIdx >= 0) {
                // Remove if clicking same POI, else replace
                if (nm[activeMap].pois[existingIdx].id === poiId) {
                    nm[activeMap].pois.splice(existingIdx, 1);
                } else {
                    nm[activeMap].pois[existingIdx].id = poiId;
                }
            } else {
                nm[activeMap].pois.push({ r, c, id: poiId });
            }
        }
        setMaps(nm);
        save(nm);
    };

    const toggleCheck = (idx: number) => {
        const nm = [...maps];
        nm[activeMap].checklist[idx] = !nm[activeMap].checklist[idx];
        setMaps(nm); save(nm);
    };

    // --- Panning & Zooming logic ---
    const handleViewportPointerDown = (e: React.PointerEvent) => {
        if (e.button === 1 || tool === "pan" || e.button === 2) {
            e.preventDefault();
            isInteracting.current = true;
            viewportRef.current!.dataset.panning = "true";
            viewportRef.current!.setPointerCapture(e.pointerId);
        } else if (e.button === 0) {
            isInteracting.current = true;
        }
    };

    const handleViewportPointerMove = (e: React.PointerEvent) => {
        if (!isInteracting.current) return;
        if (viewportRef.current?.dataset.panning === "true") {
            setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
        }
    };

    const handleViewportPointerUp = (e: React.PointerEvent) => {
        isInteracting.current = false;
        if (viewportRef.current?.dataset.panning === "true") {
            viewportRef.current.dataset.panning = "false";
            viewportRef.current.releasePointerCapture(e.pointerId);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.max(0.2, Math.min(3, z * delta)));
        } else {
            // Pan
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const recenter = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleResizeMap = (w: number, h: number) => {
        if (w < 5 || h < 5 || w > 200 || h > 200) return;
        const nm = [...maps];
        nm[activeMap].width = w;
        nm[activeMap].height = h;
        setMaps(nm);
        save(nm);
    };

    const clearMap = () => {
        if (confirm("Vuoi svuotare la mappa corrente?")) {
            const nm = [...maps];
            nm[activeMap].terrainData = {};
            nm[activeMap].pois = [];
            setMaps(nm);
            save(nm);
        }
    };


    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-7xl">

                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Layout className="w-3 h-3" />
                            Missione 2 • Level Designer
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none uppercase font-mono">
                            LE <span className="text-emerald-400">MAPPE</span>
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

                {/* Map Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 slide-up backdrop-blur-xl bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                    {MAPS.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <button key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all font-mono ${activeMap === i ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`} onClick={() => { setActiveMap(i); recenter(); }}>
                                <Icon className="w-4 h-4" />
                                {m.name}
                            </button>
                        );
                    })}
                </div>

                {/* Main Editor Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                    {/* Map Visuals & Tools */}
                    <div className="flex flex-col gap-4">

                        {/* Editor Toolbar */}
                        <div className="quest-card p-4 flex flex-wrap items-center justify-between gap-4">

                            {/* Tools Toggle */}
                            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                                <button onClick={() => setTool("paint")} className={`p-2 px-3 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${tool === "paint" ? "bg-emerald-600 text-white" : "text-white/50 hover:bg-white/10"}`}>
                                    <Paintbrush className="w-4 h-4" /> Terreno
                                </button>
                                <button onClick={() => setTool("poi")} className={`p-2 px-3 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${tool === "poi" ? "bg-amber-600 text-white" : "text-white/50 hover:bg-white/10"}`}>
                                    <MapPin className="w-4 h-4" /> POI
                                </button>
                                <div className="w-px bg-white/10 mx-1" />
                                <button onClick={() => setTool("pan")} className={`p-2 px-3 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${tool === "pan" ? "bg-blue-600 text-white" : "text-white/50 hover:bg-white/10"}`}>
                                    <Move className="w-4 h-4" /> Muovi
                                </button>
                            </div>

                            {/* Viewport Controls */}
                            <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                                <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="text-emerald-400 hover:text-white transition-colors"><ZoomOut className="w-4 h-4" /></button>
                                <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-emerald-400 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
                                <div className="w-px h-4 bg-white/10" />
                                <button onClick={recenter} className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-white px-2">Centra</button>
                                <div className="w-px h-4 bg-white/10" />
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 group-hover:text-white">ISO</span>
                                    <input type="checkbox" className="sr-only" checked={isIsometric} onChange={e => setIsIsometric(e.target.checked)} />
                                    <div className={`w-8 h-4 rounded-full transition-colors relative ${isIsometric ? 'bg-emerald-500' : 'bg-white/20'}`}>
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isIsometric ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Sub-toolbar (Terrains or POIs) */}
                        <div className="quest-card p-4 overflow-x-auto min-h-[80px] flex items-center">
                            {tool === "paint" ? (
                                <div className="flex gap-2">
                                    {TERRAINS.map(t => (
                                        <button key={t.id} onClick={() => setTerrain(t.id)} className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl transition-all ${terrain === t.id ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-transparent border-2 border-transparent hover:bg-white/5'}`}>
                                            <div className="w-6 h-6 rounded-md shadow-inner" style={{ backgroundColor: t.color }} />
                                            <span className="text-[10px] font-bold text-white/70">{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : tool === "poi" ? (
                                <div className="flex gap-6 pb-2">
                                    {Object.entries(POI_CATEGORIES).map(([cat, pois]) => (
                                        <div key={cat} className="space-y-2 shrink-0">
                                            <h4 className="text-[10px] font-bold text-amber-400/50 uppercase tracking-widest px-2">{cat}</h4>
                                            <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                                {pois.map(p => (
                                                    <button key={p.id} onClick={() => setPoiId(p.id)} className={`flex items-center justify-center w-10 h-10 rounded-lg text-lg transition-all ${poiId === p.id ? 'bg-amber-500/30 border border-amber-500/50 shadow-inner' : 'hover:bg-white/10 border border-transparent'}`} title={p.name}>
                                                        {p.emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full text-center text-sm text-white/40 italic flex items-center justify-center gap-2">
                                    <Move className="w-4 h-4" /> Trascina il mouse per spostare la mappa
                                </div>
                            )}
                        </div>

                        {/* Map Viewport Area */}
                        <div
                            className="w-full aspect-video sm:aspect-[21/9] bg-[#050510] border-2 border-[#3b2d6e] rounded-2xl overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
                            onWheel={handleWheel}
                            style={{ touchAction: 'none' }}
                        >
                            <div
                                ref={viewportRef}
                                className="absolute inset-0 cursor-crosshair touch-none"
                                style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
                                onPointerDown={handleViewportPointerDown}
                                onPointerMove={handleViewportPointerMove}
                                onPointerUp={handleViewportPointerUp}
                                onPointerLeave={handleViewportPointerUp}
                                onContextMenu={e => { e.preventDefault(); }}
                            >
                                {/* The Grid Layer */}
                                <div
                                    className="absolute transform-gpu transform-origin-center transition-transform pointer-events-none"
                                    style={{
                                        top: "50%", left: "50%",
                                        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom}) ${isIsometric ? 'rotateX(60deg) rotateZ(-45deg)' : ''}`,
                                        width: currentMap.width * CELL_SIZE,
                                        height: currentMap.height * CELL_SIZE,
                                        display: "grid",
                                        gridTemplateColumns: `repeat(${currentMap.width}, ${CELL_SIZE}px)`,
                                        gridTemplateRows: `repeat(${currentMap.height}, ${CELL_SIZE}px)`,
                                    }}
                                >
                                    {/* Virtualize or render all? For 50x50 it's 2500 divs. React might be slow, but it's simpler. We'll render all for now as Alice requires max ~40x40 typically. */}
                                    {Array.from({ length: currentMap.height }).map((_, r) => (
                                        Array.from({ length: currentMap.width }).map((_, c) => {
                                            const id = `${r},${c}`;
                                            const terrainId = currentMap.terrainData[id] || 0;
                                            const poiData = currentMap.pois.find(p => p.r === r && p.c === c);
                                            const poiObj = poiData ? FLAT_POIS.find(f => f.id === poiData.id) : null;

                                            return (
                                                <div
                                                    key={id}
                                                    className="border-[0.5px] border-black/10 relative overflow-hidden pointer-events-auto"
                                                    style={{
                                                        backgroundColor: TERRAINS.find(t => t.id === terrainId)?.color || "#000",
                                                    }}
                                                    onPointerDown={e => {
                                                        if (e.button !== 1 && e.button !== 2 && tool !== "pan") {
                                                            e.stopPropagation();
                                                            isInteracting.current = true;
                                                            handleCellInteract(r, c);
                                                        }
                                                    }}
                                                    onPointerEnter={() => {
                                                        if (isInteracting.current && tool !== "pan") {
                                                            handleCellInteract(r, c);
                                                        }
                                                    }}
                                                >
                                                    {isIsometric ? (
                                                        // Soft highlight for iso 3d effect on edges
                                                        <div className="absolute inset-0 shadow-[inset_1px_1px_rgba(255,255,255,0.2),inset_-1px_-1px_rgba(0,0,0,0.2)] pointer-events-none" />
                                                    ) : null}

                                                    {poiObj && (
                                                        <div className="absolute inset-0 flex items-center justify-center text-lg drop-shadow-md pointer-events-none"
                                                            style={{ transform: isIsometric ? 'rotateZ(45deg) rotateX(-60deg) scale(1.5) translateY(-5px)' : 'none' }}>
                                                            {poiObj.emoji}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    ))}
                                </div>
                            </div>

                            {/* Minimap Info overlay */}
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur rounded-lg p-2 px-3 border border-white/10 text-[10px] text-white/50 font-mono tracking-widest pointer-events-none">
                                DIM. {currentMap.width}x{currentMap.height}
                            </div>
                        </div>

                    </div>

                    {/* Right column: Settings & Checklist */}
                    <div className="flex flex-col gap-6">

                        {/* Map Settings */}
                        <div className="quest-card p-5">
                            <h3 className="text-xs font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2 font-mono pb-2 border-b border-white/5">
                                <Settings2 className="w-4 h-4" /> Impostazioni Rete
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 block">Larghezza</label>
                                        <input type="number" min="5" max="100" value={currentMap.width} onChange={e => handleResizeMap(Number(e.target.value), currentMap.height)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-center focus:border-emerald-500 outline-none transition-colors" />
                                    </div>
                                    <div className="text-white/20 pb-2">×</div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 block">Altezza</label>
                                        <input type="number" min="5" max="100" value={currentMap.height} onChange={e => handleResizeMap(currentMap.width, Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-center focus:border-emerald-500 outline-none transition-colors" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/30 text-center uppercase tracking-wider">Limiti: 5-100 tile. Il salvataggio ottimizza i dati vuoti.</p>

                                <button onClick={clearMap} className="w-full p-2 mt-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Svuota Griglia (Vuoto)
                                </button>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="quest-card p-5 sticky top-24">
                            <h3 className="text-[10px] font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2 font-mono pb-2 border-b border-white/5">
                                <CheckCircle2 className="w-4 h-4" /> REQUISITI MAPPA
                            </h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {mapDef.checks.map((ch, i) => (
                                    <button key={i} onClick={() => toggleCheck(i)}
                                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 border ${currentMap.checklist[i]
                                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-100"
                                            : "bg-black/30 border-white/5 text-emerald-100/40 hover:border-white/10"}`}>
                                        <span className={`flex-shrink-0 mt-0.5 ${currentMap.checklist[i] ? "text-emerald-400" : "text-white/10"}`}>
                                            {currentMap.checklist[i] ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                        </span>
                                        <span className="leading-relaxed whitespace-pre-line">{ch}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(currentMap.checklist.filter(Boolean).length / mapDef.checks.length) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{currentMap.checklist.filter(Boolean).length} / {mapDef.checks.length} COMPLETATI</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
