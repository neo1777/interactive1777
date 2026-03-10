"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";
import { Move, ZoomIn, ZoomOut, Paintbrush, MapPin, Trash2, Settings2 } from "lucide-react";

const MAP_TIPS = [
    "Muovi la mappa usando <strong>Spazio + Drag</strong> (o seleziona il tool Muovi).",
    "Fai <strong>Zoom</strong> con la rotellina per scendere nel dettaglio.",
    "Abilita la vista <strong>ISO</strong> per vedere come apparirebbe in un vero gioco Isometrico 2D!",
    "I <strong>luoghi importanti</strong> (📍) danno vita alla mappa — posiziona villaggio, foresta, dungeon e lago.",
    "Non aver paura di allargare la mappa nelle <strong>Impostazioni</strong>, i giochi moderni sono enormi!"
];

const TERRAIN_COLORS: Record<number, { color: string; label: string; emoji: string }> = {
    0: { color: "#22c55e", label: "Pianura (Erba)", emoji: "🌿" },
    1: { color: "#3b82f6", label: "Lago (Acqua)", emoji: "💧" },
    2: { color: "#92400e", label: "Montagna (Terra)", emoji: "🟫" },
    3: { color: "#6b7280", label: "Rovine (Pietra)", emoji: "🪨" },
    4: { color: "#fcd34d", label: "Deserto (Sabbia)", emoji: "🏜️" },
    5: { color: "#e2e8f0", label: "Tundra (Neve)", emoji: "❄️" },
};

const POI_MARKERS = [
    { id: 1, label: "Villaggio", emoji: "🏘️" },
    { id: 2, label: "Foresta", emoji: "🌳" },
    { id: 3, label: "Dungeon", emoji: "🏚️" },
    { id: 4, label: "Lago", emoji: "🌊" },
    { id: 5, label: "Saggio", emoji: "🧙" },
];

export default function MappaPage() {
    const [gridSize, setGridSize] = useState({ w: 20, h: 20 });
    const [terrainData, setTerrainData] = useState<Record<string, number>>({});
    const [pois, setPois] = useState<{ r: number; c: number; id: number }[]>([]);

    const [tool, setTool] = useState<"paint" | "poi" | "pan">("paint");
    const [selectedTerrain, setSelectedTerrain] = useState(0);
    const [placingPoi, setPlacingPoi] = useState(1);

    // Viewport
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isIsometric, setIsIsometric] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null);
    const isInteracting = useRef(false);

    const CELL_SIZE = 32;

    // Load
    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const g = localStorage.getItem(getStorageKey("iq_alice_map_grid"));
                const p = localStorage.getItem(getStorageKey("iq_alice_map_pois"));
                const dim = localStorage.getItem(getStorageKey("iq_alice_map_dim"));
                if (g) setTerrainData(JSON.parse(g));
                if (p) setPois(JSON.parse(p));
                if (dim) setGridSize(JSON.parse(dim));
            } catch { }
        });
    }, []);

    // Save
    useEffect(() => {
        localStorage.setItem(getStorageKey("iq_alice_map_grid"), JSON.stringify(terrainData));
        localStorage.setItem(getStorageKey("iq_alice_map_pois"), JSON.stringify(pois));
        localStorage.setItem(getStorageKey("iq_alice_map_dim"), JSON.stringify(gridSize));
    }, [terrainData, pois, gridSize]);

    const handleCellInteract = (r: number, c: number) => {
        if (tool === "pan") return;

        if (tool === "paint") {
            setTerrainData(prev => {
                const nt = { ...prev };
                if (selectedTerrain === 0) delete nt[`${r},${c}`];
                else nt[`${r},${c}`] = selectedTerrain;
                return nt;
            });
        } else if (tool === "poi") {
            setPois(prev => {
                const arr = [...prev];
                const existingIdx = arr.findIndex(p => p.r === r && p.c === c);
                if (existingIdx >= 0) {
                    if (arr[existingIdx].id === placingPoi) arr.splice(existingIdx, 1);
                    else arr[existingIdx].id = placingPoi;
                } else {
                    arr.push({ r, c, id: placingPoi });
                }
                return arr;
            });
        }
    };

    // Viewport Panning & Zooming
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
            setZoom(z => Math.max(0.2, Math.min(3, z * (e.deltaY > 0 ? 0.9 : 1.1))));
        } else {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const recenter = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

    const resetMap = () => {
        if (confirm("Sei sicuro di voler pulire la mappa?")) {
            setTerrainData({});
            setPois([]);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            {/* Header */}
            <div className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-emerald-400 font-bold">Mappa</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🗺️ Missione 3</div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-mono uppercase">La <span className="text-emerald-400">Mappa</span> del Mondo</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">L&apos;Overworld principale di Isometric Quest</p>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0">⬅ Alice Hub</Link>
            </div>

            <div className="w-full max-w-7xl mb-6 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={MAP_TIPS} emoji="🗺️" />
            </div>

            <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-6">

                {/* Left/Top Sidebar Tools */}
                <div className="xl:w-[320px] shrink-0 space-y-4">

                    {/* Size Settings */}
                    <div className="quest-card p-5">
                        <h3 className="text-[10px] font-black text-white/40 mb-3 uppercase tracking-widest flex items-center gap-2"><Settings2 className="w-4 h-4" /> Dimensioni</h3>
                        <div className="flex gap-4">
                            <input type="number" min="5" max="100" value={gridSize.w} onChange={e => setGridSize(s => ({ ...s, w: Number(e.target.value) }))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-center focus:border-emerald-500 block" placeholder="W" />
                            <input type="number" min="5" max="100" value={gridSize.h} onChange={e => setGridSize(s => ({ ...s, h: Number(e.target.value) }))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-center focus:border-emerald-500 block" placeholder="H" />
                        </div>
                    </div>

                    {/* Example Box */}
                    <ExamplePanel title="🏞️ Ricorda la varietà!" imageSrc="/assets/world_map_guide.png" imageAlt="Esempio mappa isometrica" />

                    {/* Tool Selection */}
                    <div className="quest-card p-2 flex flex-col gap-2">
                        <button onClick={() => setTool("paint")} className={`p-3 rounded-lg transition-all flex items-center gap-3 text-sm font-bold uppercase tracking-wider ${tool === "paint" ? "bg-emerald-600 text-white" : "text-white/50 hover:bg-white/5"}`}>
                            <Paintbrush className="w-5 h-5" /> Pennello Terreno
                        </button>

                        {tool === "paint" && (
                            <div className="grid grid-cols-2 gap-2 p-2 bg-black/30 rounded-xl mt-1 inner-shadow border border-black/50">
                                {Object.entries(TERRAIN_COLORS).map(([id, t]) => (
                                    <button key={id} onClick={() => setSelectedTerrain(Number(id))} className={`flex items-center gap-2 p-2 rounded-lg transition-all text-left text-xs ${selectedTerrain === Number(id) ? "bg-emerald-600 border border-emerald-400 shadow-xl" : "hover:bg-white/5 border border-transparent"}`}>
                                        <div className="w-5 h-5 rounded" style={{ backgroundColor: t.color }} />
                                        <span className="text-white font-medium">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-white/10 mx-2" />

                        <button onClick={() => setTool("poi")} className={`p-3 rounded-lg transition-all flex items-center gap-3 text-sm font-bold uppercase tracking-wider ${tool === "poi" ? "bg-amber-600 text-white" : "text-white/50 hover:bg-white/5"}`}>
                            <MapPin className="w-5 h-5" /> Inserisci Luogo
                        </button>

                        {tool === "poi" && (
                            <div className="grid grid-cols-1 gap-2 p-2 bg-black/30 rounded-xl mt-1 inner-shadow border border-black/50">
                                {POI_MARKERS.map(m => (
                                    <button key={m.id} onClick={() => setPlacingPoi(m.id)} className={`flex items-center gap-3 p-2 rounded-lg transition-all text-left text-sm ${placingPoi === m.id ? "bg-amber-500/30 border border-amber-500" : "hover:bg-white/5 border border-transparent"}`}>
                                        <span className="text-xl">{m.emoji}</span>
                                        <span className="text-white/90">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-white/10 mx-2" />

                        <button onClick={() => setTool("pan")} className={`p-3 rounded-lg transition-all flex items-center gap-3 text-sm font-bold uppercase tracking-wider ${tool === "pan" ? "bg-blue-600 text-white" : "text-white/50 hover:bg-white/5"}`}>
                            <Move className="w-5 h-5" /> Muovi Mappa
                        </button>
                    </div>

                    <button onClick={resetMap} className="w-full p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider hover:bg-red-500/20 text-sm flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Ricomincia Mappa
                    </button>
                </div>

                {/* Main Editor Viewport */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* Viewport Top Controls */}
                    <div className="flex gap-4 items-center bg-black/40 border border-[#3b2d6e] px-4 py-2 rounded-2xl shadow-xl justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="text-emerald-400 hover:text-white"><ZoomOut className="w-5 h-5" /></button>
                            <span className="text-xs font-mono font-bold w-12 text-center text-white/70">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-emerald-400 hover:text-white"><ZoomIn className="w-5 h-5" /></button>
                            <button onClick={recenter} className="ml-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase text-emerald-400 transition-colors border border-white/5">Centra</button>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">ISOMETRICO</span>
                            <div className={`w-12 h-6 rounded-full transition-colors relative ${isIsometric ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isIsometric ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <input type="checkbox" className="sr-only" checked={isIsometric} onChange={e => setIsIsometric(e.target.checked)} />
                        </label>
                    </div>

                    {/* Canvas Area */}
                    <div
                        className="w-full min-h-[500px] flex-1 bg-[#050510] border-2 border-[#3b2d6e] rounded-3xl overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
                        onWheel={handleWheel}
                    >
                        <div
                            ref={viewportRef}
                            className="absolute inset-0 touch-none flex items-center justify-center"
                            style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
                            onPointerDown={handleViewportPointerDown}
                            onPointerMove={handleViewportPointerMove}
                            onPointerUp={handleViewportPointerUp}
                            onPointerLeave={handleViewportPointerUp}
                            onContextMenu={e => e.preventDefault()}
                        >
                            <div
                                className="transform-gpu transition-transform pointer-events-none"
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) ${isIsometric ? 'rotateX(60deg) rotateZ(-45deg)' : ''}`,
                                    width: gridSize.w * CELL_SIZE,
                                    height: gridSize.h * CELL_SIZE,
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${gridSize.w}, ${CELL_SIZE}px)`,
                                    gridTemplateRows: `repeat(${gridSize.h}, ${CELL_SIZE}px)`,
                                }}
                            >
                                {Array.from({ length: gridSize.h }).map((_, r) => (
                                    Array.from({ length: gridSize.w }).map((_, c) => {
                                        const id = `${r},${c}`;
                                        const terrainId = terrainData[id] || 0;
                                        const poiData = pois.find(p => p.r === r && p.c === c);
                                        const poiObj = poiData ? POI_MARKERS.find(m => m.id === poiData.id) : null;

                                        return (
                                            <div
                                                key={id}
                                                className="border-[0.5px] border-black/10 relative overflow-hidden pointer-events-auto"
                                                style={{ backgroundColor: TERRAIN_COLORS[terrainId]?.color || "#000" }}
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
                                                {isIsometric && <div className="absolute inset-0 shadow-[inset_1px_1px_rgba(255,255,255,0.1),inset_-1px_-1px_rgba(0,0,0,0.2)] pointer-events-none" />}
                                                {poiObj && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-xl drop-shadow-xl pointer-events-none"
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

                        {/* Hint overlay */}
                        {tool === "pan" && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 border border-blue-400 text-white text-xs px-4 py-2 rounded-full font-bold shadow-xl animate-bounce pointer-events-none">
                                Trascinamento Attivo
                            </div>
                        )}
                        {tool === "poi" && placingPoi && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-600/90 backdrop-blur border border-amber-400 text-white text-xs px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 pointer-events-none">
                                {POI_MARKERS.find(m => m.id === placingPoi)?.emoji} Clicca sulla mappa
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
