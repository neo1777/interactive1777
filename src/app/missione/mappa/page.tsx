"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const MAP_TIPS = [
    "Inizia disegnando i <strong>percorsi principali</strong> (terra/sentiero) — poi aggiungi il resto intorno!",
    "Ogni mappa ha bisogno di <strong>varietà</strong>: erba, acqua, foresta, pietre... Non usare un solo terreno!",
    "I <strong>luoghi importanti</strong> (📍) danno vita alla mappa — posiziona villaggio, foresta, dungeon e lago.",
    "Nei veri giochi, i <strong>level designer</strong> disegnano mappe che guidano il giocatore con percorsi naturali.",
    "Metti la <strong>lava</strong> (🔥) nelle zone più pericolose — come vicino al dungeon!",
];

const GRID_SIZE = 20;
const TERRAIN_COLORS: Record<string, { color: string; label: string; emoji: string }> = {
    grass: { color: "#22c55e", label: "Erba / Prato", emoji: "🌿" },
    water: { color: "#3b82f6", label: "Acqua / Fiume", emoji: "💧" },
    dirt: { color: "#92400e", label: "Terra / Sentiero", emoji: "🟫" },
    stone: { color: "#6b7280", label: "Pietra / Mura", emoji: "🪨" },
    forest: { color: "#15803d", label: "Foresta / Alberi", emoji: "🌲" },
    lava: { color: "#ef4444", label: "Lava / Pericolo", emoji: "🔥" },
};

const POI_MARKERS = [
    { id: "village", label: "Villaggio", emoji: "🏘️" },
    { id: "forest_area", label: "Foresta", emoji: "🌳" },
    { id: "dungeon", label: "Dungeon / Grotta", emoji: "🏚️" },
    { id: "lake", label: "Lago / Fiume", emoji: "🌊" },
    { id: "sage", label: "Casa del Saggio", emoji: "🧙" },
];

type POI = { id: string; x: number; y: number };

export default function MappaPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [grid, setGrid] = useState<string[][]>(() =>
        Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("grass"))
    );
    const [selectedTerrain, setSelectedTerrain] = useState("grass");
    const [pois, setPois] = useState<POI[]>([]);
    const [placingPoi, setPlacingPoi] = useState<string | null>(null);
    const [painting, setPainting] = useState(false);

    // Load
    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const g = localStorage.getItem(getStorageKey("iq_map_grid")); if (g) setGrid(JSON.parse(g));
                const p = localStorage.getItem(getStorageKey("iq_map_pois")); if (p) setPois(JSON.parse(p));
            } catch { }
        });
    }, []);

    // Save
    useEffect(() => { localStorage.setItem(getStorageKey("iq_map_grid"), JSON.stringify(grid)); }, [grid]);
    useEffect(() => { localStorage.setItem(getStorageKey("iq_map_pois"), JSON.stringify(pois)); }, [pois]);

    // Draw grid
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const cellW = rect.width / GRID_SIZE;
        const cellH = rect.height / GRID_SIZE;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        // Fill cells
        grid.forEach((row, y) => {
            row.forEach((terrain, x) => {
                ctx.fillStyle = TERRAIN_COLORS[terrain]?.color || "#22c55e";
                ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
                // Grid lines
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
            });
        });

        // Draw POI markers
        pois.forEach(poi => {
            const marker = POI_MARKERS.find(m => m.id === poi.id);
            if (!marker) return;
            const px = poi.x * cellW + cellW / 2;
            const py = poi.y * cellH + cellH / 2;

            // Background circle
            ctx.beginPath();
            ctx.arc(px, py, Math.min(cellW, cellH) * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fill();
            ctx.strokeStyle = "#fde68a";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Emoji
            ctx.font = `${Math.min(cellW, cellH) * 0.7}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(marker.emoji, px, py);
        });
    }, [grid, pois]);

    useEffect(() => { draw(); }, [draw]);

    const getCellFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const cellW = rect.width / GRID_SIZE;
        const cellH = rect.height / GRID_SIZE;
        const x = Math.floor((e.clientX - rect.left) / cellW);
        const y = Math.floor((e.clientY - rect.top) / cellH);
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
        return { x, y };
    };

    const paintCell = (x: number, y: number) => {
        if (placingPoi) {
            // Remove existing marker of same type and place new one
            setPois(prev => [...prev.filter(p => p.id !== placingPoi), { id: placingPoi, x, y }]);
            setPlacingPoi(null);
        } else {
            const copy = grid.map(r => [...r]);
            copy[y][x] = selectedTerrain;
            setGrid(copy);
        }
    };

    const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        (e.target as Element).setPointerCapture(e.pointerId);
        setPainting(true);
        const cell = getCellFromEvent(e);
        if (cell) paintCell(cell.x, cell.y);
    };

    const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!painting || placingPoi) return;
        const cell = getCellFromEvent(e);
        if (cell) paintCell(cell.x, cell.y);
    };

    const handleUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);
        setPainting(false);
    };

    const resetMap = () => {
        setGrid(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("grass")));
        setPois([]);
        localStorage.removeItem(getStorageKey("iq_map_grid"));
        localStorage.removeItem(getStorageKey("iq_map_pois"));
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            {/* Header */}
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-emerald-400 font-bold">Mappa</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🗺️ Missione 3</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">La Mappa del Mondo</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">Disegna la mappa del mondo di Isometric Quest!</p>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0">⬅ Alice Hub</Link>
            </div>

            {/* Didactic Elements */}
            <div className="w-full max-w-6xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={MAP_TIPS} emoji="🗺️" />
            </div>
            <div className="w-full max-w-6xl mb-4 slide-up" style={{ animationDelay: "0.1s" }}>
                <ExamplePanel title="🏝️ Esempio: come costruire una mappa isometrica"
                    imageSrc="/assets/world_map_guide.png"
                    imageAlt="Esempio mappa isometrica con terreni e punti di interesse">
                    <p>Una buona mappa ha <strong>percorsi chiari</strong> (sentieri di terra), <strong>ostacoli naturali</strong> (fiumi, montagne), e <strong>luoghi interessanti</strong> (villaggio, dungeon, foresta). Guarda l&apos;esempio per ispirazione!</p>
                </ExamplePanel>
            </div>

            <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
                {/* Sidebar – Terrain & POI selectors */}
                <div className="lg:w-64 shrink-0 space-y-4">
                    {/* Terrain Legend */}
                    <div className="quest-card p-4 space-y-2">
                        <h3 className="text-sm font-bold text-emerald-300">🎨 Terreni</h3>
                        {Object.entries(TERRAIN_COLORS).map(([key, val]) => (
                            <button key={key} onClick={() => { setSelectedTerrain(key); setPlacingPoi(null); }}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left text-sm ${selectedTerrain === key && !placingPoi ? "bg-emerald-600/30 border border-emerald-400" : "hover:bg-white/5 border border-transparent"}`}>
                                <div className="w-6 h-6 rounded" style={{ backgroundColor: val.color }} />
                                <span className="text-white">{val.emoji} {val.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* POI Markers */}
                    <div className="quest-card p-4 space-y-2">
                        <h3 className="text-sm font-bold text-amber-400">📍 Luoghi Importanti</h3>
                        <p className="text-[10px] text-emerald-400">Clicca per posizionare sulla mappa</p>
                        {POI_MARKERS.map(m => (
                            <button key={m.id} onClick={() => setPlacingPoi(m.id)}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left text-sm ${placingPoi === m.id ? "bg-amber-600/30 border border-amber-400 animate-pulse" : "hover:bg-white/5 border border-transparent"}`}>
                                <span className="text-xl">{m.emoji}</span>
                                <span className="text-white">{m.label}</span>
                                {pois.find(p => p.id === m.id) && <span className="ml-auto text-green-400 text-xs">✓</span>}
                            </button>
                        ))}
                    </div>

                    <button onClick={resetMap} className="w-full p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
                        🗑️ Ricomincia Mappa
                    </button>
                </div>

                {/* Map Canvas */}
                <div className="flex-1">
                    <div className="w-full aspect-square max-w-[600px] mx-auto rounded-2xl overflow-hidden border-2 border-[#3b2d6e] shadow-2xl">
                        <canvas
                            ref={canvasRef}
                            onPointerDown={handleDown}
                            onPointerMove={handleMove}
                            onPointerUp={handleUp}
                            onPointerCancel={handleUp}
                            className="w-full h-full cursor-pointer touch-none block"
                            style={{ imageRendering: "pixelated" }}
                        />
                    </div>
                    {placingPoi && (
                        <p className="text-center text-amber-300 text-sm mt-3 animate-pulse">
                            👆 Tocca la mappa per posizionare: {POI_MARKERS.find(m => m.id === placingPoi)?.emoji} {POI_MARKERS.find(m => m.id === placingPoi)?.label}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
