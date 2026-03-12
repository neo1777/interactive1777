/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getStroke } from "perfect-freehand";
import { getStorageKey } from "@/lib/storage";
import { Trash2, Paintbrush, Eraser, Move, Maximize2, Minimize2, Undo2, Redo2, Pencil, Highlighter } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Point = { x: number; y: number; pressure?: number };
type BrushPreset = "pencil" | "marker" | "highlighter";

type MiniStroke = {
    color: string;
    size: number;
    opacity: number;
    preset: BrushPreset;
    points: Point[];
    eraser: boolean;
};

// ── Color palette (16 kid-friendly colors incl. skintones) ───────────────────
const COLORS = [
    "#ffffff", "#1a1a2e", "#ef4444", "#f97316",
    "#eab308", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#7c3aed", "#0ea5e9", "#14b8a6",
    "#a16207", "#d97706", "#fca5a5", "#fde68a",
];

// ── Brush preset settings for perfect-freehand ────────────────────────────────
const BRUSH_OPTIONS: Record<BrushPreset, Parameters<typeof getStroke>[1]> = {
    pencil: {
        size: 1, // overridden per stroke
        thinning: 0.7,
        smoothing: 0.3,
        streamline: 0.3,
        easing: (t: number) => t * t,
        start: { taper: 8, easing: (t: number) => t * t, cap: true },
        end: { taper: 8, easing: (t: number) => 1 - (1 - t) * (1 - t), cap: true },
        simulatePressure: false,
        last: true,
    },
    marker: {
        size: 1,
        thinning: 0.05,
        smoothing: 0.6,
        streamline: 0.5,
        easing: (t: number) => t,
        start: { taper: 2, cap: true },
        end: { taper: 2, cap: true },
        simulatePressure: false,
        last: true,
    },
    highlighter: {
        size: 1,
        thinning: 0,
        smoothing: 0.8,
        streamline: 0.7,
        easing: (t: number) => t,
        start: { taper: 0, cap: false },
        end: { taper: 0, cap: false },
        simulatePressure: false,
        last: true,
    },
};

// ── SVG path from perfect-freehand outline ────────────────────────────────────
function svgPath(stroke: number[][]): string {
    if (!stroke.length) return "";
    try {
        const d = stroke.reduce(
            (acc: (string | number)[], [x0, y0]: number[], i: number, arr: number[][]) => {
                const [x1, y1] = arr[(i + 1) % arr.length];
                acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
                return acc;
            },
            ["M", ...stroke[0], "Q"]
        );
        d.push("Z");
        return d.join(" ");
    } catch {
        return "";
    }
}

// ── Draw all strokes onto canvas context ──────────────────────────────────────
function drawStrokes(
    ctx: CanvasRenderingContext2D,
    allStrokes: MiniStroke[],
    w: number,
    h: number,
    grid?: number
) {
    try {
        ctx.clearRect(0, 0, w, h);

        if (grid) {
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
            for (let x = 0; x <= w; x += grid) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y <= h; y += grid) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }
            ctx.restore();
        }

        for (const s of allStrokes) {
            if (!s?.points || s.points.length < 2) continue;

            const opts = {
                ...BRUSH_OPTIONS[s.preset || "marker"],
                size: s.size,
                simulatePressure: s.points.every(p => (p.pressure ?? 0) === 0),
            };

            const outline = getStroke(s.points, opts);
            const pathData = svgPath(outline);
            if (!pathData) continue;

            ctx.save();
            ctx.globalAlpha = s.eraser ? 1 : (s.opacity ?? 1);

            if (s.eraser) {
                ctx.globalCompositeOperation = "destination-out";
                ctx.fillStyle = "rgba(0,0,0,1)";
            } else if (s.preset === "highlighter") {
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = s.color;
                ctx.globalAlpha = (s.opacity ?? 1) * 0.45;
            } else {
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = s.color;
            }

            try {
                ctx.fill(new Path2D(pathData));
            } catch {
                // ignore bad path
            }
            ctx.restore();
        }
    } catch (err) {
        console.error("MiniCanvas draw error:", err);
    }
}

// ── Component props ───────────────────────────────────────────────────────────
interface MiniCanvasProps {
    storageKey: string;
    label?: string;
    width?: number;
    height?: number;
    className?: string;
    withZoomPan?: boolean;
    grid?: number;
}

const MAX_HISTORY = 50;

export default function MiniCanvas({
    storageKey, label, width = 300, height = 300,
    className = "", withZoomPan = false, grid,
}: MiniCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Drawing state ─────────────────────────────────────────────────────────
    const [strokes, setStrokes] = useState<MiniStroke[]>([]);
    const [past, setPast] = useState<MiniStroke[][]>([]);
    const [future, setFuture] = useState<MiniStroke[][]>([]);
    const [current, setCurrent] = useState<MiniStroke | null>(null);
    const [drawing, setDrawing] = useState(false);

    // ── Tool state ────────────────────────────────────────────────────────────
    const [preset, setPreset] = useState<BrushPreset>("marker");
    const [tool, setTool] = useState<"draw" | "eraser" | "pan">("draw");
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(10);
    const [opacity, setOpacity] = useState(1);
    const [showTools, setShowTools] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // ── Pan/zoom ──────────────────────────────────────────────────────────────
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const panStart = useRef<{ x: number; y: number } | null>(null);

    const canvasW = withZoomPan ? width * 3 : width;
    const canvasH = withZoomPan ? height * 3 : height;

    useEffect(() => { setMounted(true); }, []);

    // ── Load ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(getStorageKey(storageKey));
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setStrokes(parsed);
            }
        } catch (e) { console.error("MiniCanvas load:", e); }
    }, [storageKey]);

    // ── Save ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            localStorage.setItem(getStorageKey(storageKey), JSON.stringify(strokes));
        } catch (e) { console.error("MiniCanvas save:", e); }
    }, [strokes, storageKey]);

    // ── Undo/Redo ─────────────────────────────────────────────────────────────
    const undo = useCallback(() => {
        if (!past.length) return;
        const prev = past[past.length - 1];
        setPast(p => p.slice(0, -1));
        setFuture(f => [strokes, ...f].slice(0, MAX_HISTORY));
        setStrokes(prev);
    }, [past, strokes]);

    const redo = useCallback(() => {
        if (!future.length) return;
        const next = future[0];
        setFuture(f => f.slice(1));
        setPast(p => [...p, strokes].slice(-MAX_HISTORY));
        setStrokes(next);
    }, [future, strokes]);

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) { setIsFullscreen(false); return; }
            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isFullscreen, undo, redo]);

    // ── Body scroll lock in fullscreen ────────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isFullscreen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isFullscreen]);

    // ── Redraw ────────────────────────────────────────────────────────────────
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== canvasW * dpr || canvas.height !== canvasH * dpr) {
            canvas.width = canvasW * dpr;
            canvas.height = canvasH * dpr;
            canvas.style.width = `${canvasW}px`;
            canvas.style.height = `${canvasH}px`;
            ctx.scale(dpr, dpr);
        }
        drawStrokes(ctx, current ? [...strokes, current] : strokes, canvasW, canvasH, grid);
    }, [strokes, current, canvasW, canvasH, grid]);

    useEffect(() => { if (mounted) redraw(); }, [redraw, mounted]);

    // ── Pointer helpers ───────────────────────────────────────────────────────
    const getPoint = (e: React.PointerEvent, el: HTMLElement): Point => {
        const rect = el.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - pan.x) / zoom,
            y: (e.clientY - rect.top - pan.y) / zoom,
            pressure: e.pressure > 0 ? e.pressure : 0.5,
        };
    };

    const handleDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest("button,input")) return;
        const el = e.currentTarget;
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch { /* ok */ }

        if (tool === "pan" && withZoomPan) {
            panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            return;
        }

        const pt = getPoint(e, el);
        setDrawing(true);
        setCurrent({
            color,
            size,
            opacity,
            preset: tool === "eraser" ? "marker" : preset,
            points: [pt],
            eraser: tool === "eraser",
        });
    }, [tool, color, size, opacity, preset, withZoomPan, pan, zoom]);

    const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (tool === "pan" && panStart.current) {
            setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
            return;
        }
        if (!drawing || !e.currentTarget) return;
        const pt = getPoint(e, e.currentTarget);
        setCurrent(prev => prev ? { ...prev, points: [...prev.points, pt] } : prev);
    }, [drawing, tool, zoom, pan]);

    const handleUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch { /* ok */ }
        panStart.current = null;
        if (current && current.points.length > 1) {
            setPast(p => [...p, strokes].slice(-MAX_HISTORY));
            setFuture([]);
            setStrokes(prev => [...prev, current]);
        }
        setCurrent(null);
        setDrawing(false);
    }, [current, strokes]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!withZoomPan) return;
        e.preventDefault();
        setZoom(z => Math.max(0.3, Math.min(5, z - e.deltaY * 0.001)));
    }, [withZoomPan]);

    const clearAll = useCallback(() => {
        setPast(p => [...p, strokes].slice(-MAX_HISTORY));
        setFuture([]);
        setStrokes([]);
        setCurrent(null);
        try { localStorage.removeItem(getStorageKey(storageKey)); } catch { /* ok */ }
    }, [strokes, storageKey]);

    // ── Toolbar ───────────────────────────────────────────────────────────────
    const ToolBar = (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Row 1: Tools + undo/redo */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/5 flex-wrap">
                {/* Brush presets */}
                <button
                    onClick={() => { setPreset("pencil"); setTool("draw"); }}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${preset === "pencil" && tool === "draw" ? "bg-amber-500/30 text-amber-300 border border-amber-500/40" : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"}`}
                    title="Matita (linea fine, con pressione)"
                >
                    <Pencil className="w-3.5 h-3.5" /> Matita
                </button>
                <button
                    onClick={() => { setPreset("marker"); setTool("draw"); }}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${preset === "marker" && tool === "draw" ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"}`}
                    title="Pennarello (linea uniforme)"
                >
                    <Paintbrush className="w-3.5 h-3.5" /> Marker
                </button>
                <button
                    onClick={() => { setPreset("highlighter"); setTool("draw"); }}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${preset === "highlighter" && tool === "draw" ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/40" : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"}`}
                    title="Evidenziatore (semitrasparente)"
                >
                    <Highlighter className="w-3.5 h-3.5" /> Marker
                </button>

                <div className="w-px h-5 bg-white/10 mx-0.5" />

                <button
                    onClick={() => setTool("eraser")}
                    className={`p-1.5 rounded-lg transition-all ${tool === "eraser" ? "bg-pink-600/40 text-pink-300 border border-pink-500/40" : "bg-white/5 text-white/40 hover:bg-white/10 border border-transparent"}`}
                    title="Gomma (E)"
                >
                    <Eraser className="w-4 h-4" />
                </button>

                {withZoomPan && (
                    <button
                        onClick={() => setTool("pan")}
                        className={`p-1.5 rounded-lg transition-all ${tool === "pan" ? "bg-blue-600/40 text-blue-300 border border-blue-500/40" : "bg-white/5 text-white/40 hover:bg-white/10 border border-transparent"}`}
                        title="Sposta (H)"
                    >
                        <Move className="w-4 h-4" />
                    </button>
                )}

                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Undo / Redo */}
                <button
                    onClick={undo}
                    disabled={!past.length}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent"
                    title="Annulla (Ctrl+Z)"
                >
                    <Undo2 className="w-4 h-4" />
                </button>
                <button
                    onClick={redo}
                    disabled={!future.length}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent"
                    title="Ripeti (Ctrl+Shift+Z)"
                >
                    <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-white/10 mx-0.5" />

                <button
                    onClick={clearAll}
                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all border border-transparent"
                    title="Cancella tutto"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Row 2: Colors + size + opacity */}
            <div className="px-3 py-2.5 flex flex-wrap gap-2 items-center">
                {/* Color swatches */}
                <div className="flex flex-wrap gap-1 flex-1">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); if (tool === "eraser") setTool("draw"); }}
                            className="relative rounded-full transition-all hover:scale-110"
                            style={{
                                width: 18, height: 18,
                                background: c,
                                outline: color === c ? `2px solid white` : "2px solid transparent",
                                outlineOffset: 1,
                                boxShadow: color === c ? "0 0 8px rgba(255,255,255,0.6)" : "none",
                                border: c === "#ffffff" ? "1px solid rgba(255,255,255,0.2)" : "none",
                            }}
                            title={c}
                        />
                    ))}
                    <input
                        type="color"
                        value={color}
                        onChange={e => { setColor(e.target.value); if (tool === "eraser") setTool("draw"); }}
                        className="w-[18px] h-[18px] rounded-full overflow-hidden p-0 bg-transparent border-0 cursor-pointer"
                        title="Colore personalizzato"
                    />
                </div>

                <div className="flex flex-col gap-1 min-w-[80px]">
                    {/* Size */}
                    <div className="flex items-center gap-2">
                        {/* preview dot */}
                        <div
                            className="rounded-full bg-white/70 shrink-0"
                            style={{ width: Math.max(4, Math.min(16, size * 0.7)), height: Math.max(4, Math.min(16, size * 0.7)) }}
                        />
                        <input
                            type="range" min="2" max="60" value={size}
                            onChange={e => setSize(Number(e.target.value))}
                            className="flex-1 h-1 accent-emerald-400"
                            title={`Dimensione: ${size}px`}
                        />
                    </div>
                    {/* Opacity (hidden for eraser/highlighter uses its own) */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/30 w-4 text-right">{Math.round(opacity * 100)}%</span>
                        <input
                            type="range" min="5" max="100" value={Math.round(opacity * 100)}
                            onChange={e => setOpacity(Number(e.target.value) / 100)}
                            className="flex-1 h-1 accent-purple-400"
                            title={`Opacità: ${Math.round(opacity * 100)}%`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Canvas wrapper (shared between inline and fullscreen) ─────────────────
    const CanvasWrapper = (
        <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: canvasW,
            height: canvasH,
            position: "absolute",
            top: 0,
            left: 0,
        }} className="pointer-events-none">
            <canvas ref={canvasRef} className="block" />
        </div>
    );

    // ── Fullscreen portal ─────────────────────────────────────────────────────
    const fullscreenContent = isFullscreen ? (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#08051a", display: "flex", flexDirection: "column" }}
            className="font-sans"
        >
            <div
                className="relative flex-1 touch-none overflow-hidden"
                style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
                onWheel={handleWheel}
            >
                <div className="absolute inset-0 overflow-hidden">
                    {CanvasWrapper}
                </div>

                {/* Top bar */}
                <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-start pointer-events-none">
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="w-10 h-10 rounded-xl bg-black/70 backdrop-blur border border-purple-500/40 text-purple-400 flex items-center justify-center hover:bg-purple-500/20 hover:scale-105 transition-all shadow-lg pointer-events-auto"
                        title="Esci (ESC)"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowTools(s => !s)}
                        className={`w-10 h-10 rounded-xl bg-black/70 backdrop-blur border flex items-center justify-center hover:scale-105 transition-all shadow-lg pointer-events-auto ${showTools ? "border-emerald-500/60 text-emerald-400" : "border-white/10 text-white/40"}`}
                        title="Strumenti"
                    >
                        <Paintbrush className="w-5 h-5" />
                    </button>
                </div>

                {showTools && ToolBar}
            </div>
        </div>
    ) : null;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {label && (
                <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{label}</span>
            )}

            <div
                ref={containerRef}
                className="relative rounded-2xl overflow-hidden border-2 border-[#3b2d6e] hover:border-emerald-500/40 transition-all shadow-2xl group touch-none bg-black/20"
                style={{ width, height, cursor: tool === "pan" ? "grab" : "crosshair" }}
                onPointerDown={isFullscreen ? undefined : handleDown}
                onPointerMove={isFullscreen ? undefined : handleMove}
                onPointerUp={isFullscreen ? undefined : handleUp}
                onPointerCancel={isFullscreen ? undefined : handleUp}
                onWheel={isFullscreen ? undefined : handleWheel}
            >
                {!isFullscreen && CanvasWrapper}

                {!isFullscreen && (
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute top-2 left-2 z-20 w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-purple-400 border border-purple-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-500/20 hover:scale-110 shadow-lg"
                        title="Apri a schermo intero per disegnare"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {mounted && isFullscreen && createPortal(fullscreenContent, document.body)}
        </div>
    );
}
