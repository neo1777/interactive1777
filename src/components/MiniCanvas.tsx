/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getStroke } from "perfect-freehand";
import { getStorageKey } from "@/lib/storage";
import {
    Trash2, Paintbrush, Eraser, Maximize2, Minimize2,
    Undo2, Redo2, Pencil, Highlighter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = [
    "#ffffff", "#1a1a2e", "#ef4444", "#f97316",
    "#eab308", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#7c3aed", "#0ea5e9", "#14b8a6",
    "#a16207", "#d97706", "#fca5a5", "#fde68a",
];

const BRUSH_OPTS: Record<BrushPreset, Parameters<typeof getStroke>[1]> = {
    pencil: {
        size: 1, thinning: 0.7, smoothing: 0.3, streamline: 0.3,
        easing: (t: number) => t * t,
        start: { taper: 8, easing: (t: number) => t * t, cap: true },
        end: { taper: 8, easing: (t: number) => 1 - (1 - t) * (1 - t), cap: true },
        simulatePressure: false, last: true,
    },
    marker: {
        size: 1, thinning: 0.05, smoothing: 0.6, streamline: 0.5,
        easing: (t: number) => t,
        start: { taper: 2, cap: true },
        end: { taper: 2, cap: true },
        simulatePressure: false, last: true,
    },
    highlighter: {
        size: 1, thinning: 0, smoothing: 0.8, streamline: 0.7,
        easing: (t: number) => t,
        start: { taper: 0, cap: false },
        end: { taper: 0, cap: false },
        simulatePressure: false, last: true,
    },
};

const MAX_HISTORY = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function svgPath(pts: number[][]): string {
    if (pts.length < 2) return "";
    try {
        const d = pts.reduce(
            (acc: (string | number)[], [x0, y0]: number[], i: number, a: number[][]) => {
                const [x1, y1] = a[(i + 1) % a.length];
                acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
                return acc;
            },
            ["M", ...pts[0], "Q"]
        );
        d.push("Z");
        return d.join(" ");
    } catch { return ""; }
}

/**
 * Paint all strokes onto a canvas element.
 * logicalW / logicalH = the coordinate space strokes are stored in.
 * The canvas element should already be positioned/sized by CSS.
 * This function sets canvas.width/height (pixel resolution) from the
 * element's current displayed size × devicePixelRatio.
 */
function paint(
    canvas: HTMLCanvasElement,
    strokes: MiniStroke[],
    logicalW: number,
    logicalH: number,
    grid?: number
) {
    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    if (displayW <= 0 || displayH <= 0) return;

    const physW = Math.round(displayW * dpr);
    const physH = Math.round(displayH * dpr);

    // Only resize backing store if needed (avoid clearing unnecessarily)
    if (canvas.width !== physW || canvas.height !== physH) {
        canvas.width = physW;
        canvas.height = physH;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Map logical → display (+ DPR)
    ctx.setTransform(dpr * displayW / logicalW, 0, 0, dpr * displayH / logicalH, 0, 0);
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Grid
    if (grid) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= logicalW; x += grid) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, logicalH); ctx.stroke();
        }
        for (let y = 0; y <= logicalH; y += grid) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(logicalW, y); ctx.stroke();
        }
        ctx.restore();
    }

    // Strokes
    for (const s of strokes) {
        if (!s?.points || s.points.length < 2) continue;
        const opts = {
            ...BRUSH_OPTS[s.preset ?? "marker"],
            size: s.size,
            simulatePressure: s.points.every(p => (p.pressure ?? 0.5) > 0.49 && (p.pressure ?? 0.5) < 0.51),
        };
        const outline = getStroke(s.points, opts);
        const pathStr = svgPath(outline);
        if (!pathStr) continue;
        ctx.save();
        if (s.eraser) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.globalAlpha = 1;
            ctx.fillStyle = "rgba(0,0,0,1)";
        } else if (s.preset === "highlighter") {
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = (s.opacity ?? 1) * 0.45;
            ctx.fillStyle = s.color;
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = s.opacity ?? 1;
            ctx.fillStyle = s.color;
        }
        try { ctx.fill(new Path2D(pathStr)); } catch { /* bad path, skip */ }
        ctx.restore();
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface MiniCanvasProps {
    storageKey: string;
    label?: string;
    /** Inline preview pixel dimensions */
    width?: number;
    height?: number;
    className?: string;
    /** Multiplier: logical canvas = width×logicalScale × height×logicalScale */
    logicalScale?: number;
    grid?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MiniCanvas({
    storageKey,
    label,
    width = 300,
    height = 300,
    className = "",
    logicalScale = 4,
    grid,
}: MiniCanvasProps) {
    // Canvas refs
    const inlineRef = useRef<HTMLCanvasElement>(null);
    const fullRef = useRef<HTMLCanvasElement>(null);

    // Logical drawing space (4× preview = large drawing area)
    const LOGICAL_W = width * logicalScale;
    const LOGICAL_H = height * logicalScale;

    // State
    const [strokes, setStrokes] = useState<MiniStroke[]>([]);
    const [past, setPast] = useState<MiniStroke[][]>([]);
    const [future, setFuture] = useState<MiniStroke[][]>([]);
    const [current, setCurrent] = useState<MiniStroke | null>(null);

    const [preset, setPreset] = useState<BrushPreset>("marker");
    const [tool, setTool] = useState<"draw" | "eraser">("draw");
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(20);
    const [opacity, setOpacity] = useState(1);

    const [showTools, setShowTools] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // ── Persist ───────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(getStorageKey(storageKey));
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setStrokes(parsed);
            }
        } catch { /* ignore */ }
    }, [storageKey]);

    useEffect(() => {
        try { localStorage.setItem(getStorageKey(storageKey), JSON.stringify(strokes)); }
        catch { /* ignore */ }
    }, [strokes, storageKey]);

    // ── Undo / Redo ───────────────────────────────────────────────────────────
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

    // ── Keyboard ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) { setIsFullscreen(false); setShowTools(false); return; }
            if (!isFullscreen) return;
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isFullscreen, undo, redo]);

    // ── Scroll lock ───────────────────────────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isFullscreen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isFullscreen]);

    // ── Redraw: paint both canvases from strokes state ────────────────────────
    const repaint = useCallback(() => {
        const all = current ? [...strokes, current] : strokes;
        if (inlineRef.current) paint(inlineRef.current, all, LOGICAL_W, LOGICAL_H, grid);
        if (fullRef.current && isFullscreen) paint(fullRef.current, all, LOGICAL_W, LOGICAL_H, grid);
    }, [strokes, current, LOGICAL_W, LOGICAL_H, grid, isFullscreen]);

    useEffect(() => { if (mounted) repaint(); }, [repaint, mounted]);

    // When fullscreen opens, give DOM a tick to size the canvas, then paint
    useEffect(() => {
        if (!isFullscreen) return;
        const id = requestAnimationFrame(() => {
            const all = current ? [...strokes, current] : strokes;
            if (fullRef.current) paint(fullRef.current, all, LOGICAL_W, LOGICAL_H, grid);
        });
        return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFullscreen]);

    // ── Coordinate mapping ────────────────────────────────────────────────────
    // The fullscreen canvas fills the viewport via CSS (inset:0).
    // canvas.getBoundingClientRect() tells us exactly where it is.
    const getPoint = useCallback((e: React.PointerEvent): Point => {
        const c = fullRef.current;
        if (!c) return { x: 0, y: 0, pressure: 0.5 };
        const r = c.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * LOGICAL_W / r.width,
            y: (e.clientY - r.top) * LOGICAL_H / r.height,
            pressure: e.pressure > 0 ? e.pressure : 0.5,
        };
    }, [LOGICAL_W, LOGICAL_H]);

    // ── Pointer handlers ──────────────────────────────────────────────────────
    const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest("button,input")) return;
        e.preventDefault();
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ok */ }
        setCurrent({
            color, size, opacity,
            preset: tool === "eraser" ? "marker" : preset,
            points: [getPoint(e)],
            eraser: tool === "eraser",
        });
    }, [color, size, opacity, tool, preset, getPoint]);

    const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!current) return;
        setCurrent(prev => prev ? { ...prev, points: [...prev.points, getPoint(e)] } : prev);
    }, [current, getPoint]);

    const onUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch { /* ok */ }
        setCurrent(prev => {
            if (prev && prev.points.length > 1) {
                setPast(p => [...p, strokes].slice(-MAX_HISTORY));
                setFuture([]);
                setStrokes(s => [...s, prev]);
            }
            return null;
        });
    }, [strokes]);

    const clearAll = useCallback(() => {
        setPast(p => [...p, strokes].slice(-MAX_HISTORY));
        setFuture([]);
        setStrokes([]);
        setCurrent(null);
        try { localStorage.removeItem(getStorageKey(storageKey)); } catch { /* ok */ }
    }, [strokes, storageKey]);

    const exitFS = useCallback(() => {
        setIsFullscreen(false);
        setShowTools(false);
    }, []);

    // ── Toolbar ───────────────────────────────────────────────────────────────
    const Toolbar = (
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, zIndex: 20 }}
            className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            {/* Row 1: Presets + tools */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 flex-wrap">
                {(["pencil", "marker", "highlighter"] as BrushPreset[]).map(p => {
                    const Icon = { pencil: Pencil, marker: Paintbrush, highlighter: Highlighter }[p];
                    const label = { pencil: "Matita", marker: "Marker", highlighter: "Evid." }[p];
                    const active = preset === p && tool === "draw";
                    const cls = {
                        pencil: "bg-amber-500/30 text-amber-300 border-amber-500/40",
                        marker: "bg-emerald-500/30 text-emerald-300 border-emerald-500/40",
                        highlighter: "bg-yellow-500/30 text-yellow-300 border-yellow-500/40",
                    }[p];
                    return (
                        <button key={p} onClick={() => { setPreset(p); setTool("draw"); }}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${active ? cls : "bg-white/5 text-white/40 hover:bg-white/10 border-transparent"}`}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    );
                })}
                <div className="w-px h-5 bg-white/10 mx-0.5" />
                <button onClick={() => setTool("eraser")}
                    className={`p-1.5 rounded-lg transition-all border ${tool === "eraser" ? "bg-pink-600/40 text-pink-300 border-pink-500/40" : "bg-white/5 text-white/40 hover:bg-white/10 border-transparent"}`}
                    title="Gomma"><Eraser className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-white/10 mx-0.5" />
                <button onClick={undo} disabled={!past.length}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-20 transition-all"
                    title="Annulla (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
                <button onClick={redo} disabled={!future.length}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-20 transition-all"
                    title="Ripeti (Ctrl+Shift+Z)"><Redo2 className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-white/10 mx-0.5" />
                <button onClick={clearAll}
                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all"
                    title="Cancella tutto"><Trash2 className="w-4 h-4" /></button>
            </div>
            {/* Row 2: Colors + sliders */}
            <div className="px-3 py-2 flex flex-wrap gap-2 items-center">
                <div className="flex flex-wrap gap-1 flex-1">
                    {COLORS.map(c => (
                        <button key={c} onClick={() => { setColor(c); if (tool === "eraser") setTool("draw"); }}
                            className="rounded-full transition-all hover:scale-110"
                            style={{
                                width: 20, height: 20, background: c,
                                outline: color === c ? "2px solid white" : "2px solid transparent",
                                outlineOffset: 1,
                                boxShadow: color === c ? "0 0 8px rgba(255,255,255,0.6)" : "none",
                                border: c === "#ffffff" ? "1px solid rgba(255,255,255,0.2)" : "none",
                            }} />
                    ))}
                    <input type="color" value={color}
                        onChange={e => { setColor(e.target.value); if (tool === "eraser") setTool("draw"); }}
                        className="w-5 h-5 rounded-full overflow-hidden p-0 bg-transparent border-0 cursor-pointer"
                        title="Colore personalizzato" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-white/70 shrink-0" style={{ width: Math.max(4, Math.min(18, size * 0.15)), height: Math.max(4, Math.min(18, size * 0.15)) }} />
                        <input type="range" min="4" max="120" value={size}
                            onChange={e => setSize(Number(e.target.value))}
                            className="flex-1 h-1 accent-emerald-400" title={`Dimensione: ${size}`} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/30 w-6 text-right">{Math.round(opacity * 100)}%</span>
                        <input type="range" min="5" max="100" value={Math.round(opacity * 100)}
                            onChange={e => setOpacity(Number(e.target.value) / 100)}
                            className="flex-1 h-1 accent-purple-400" title={`Opacità: ${Math.round(opacity * 100)}%`} />
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Fullscreen portal ─────────────────────────────────────────────────────
    // The outer div covers 100% of the viewport (position:fixed, inset:0).
    // The inner div (drawing surface) also fills it completely (position:absolute, inset:0).
    // The canvas element fills the inner div via CSS (inset:0), so clientWidth/Height
    // reflect the actual viewport size — paint() uses those for the backing store.
    const portal = isFullscreen ? (
        <div
            style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999,
                background: "#0a0820",
            }}
        >
            {/* Drawing surface — fills the entire fixed overlay */}
            <div
                style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    cursor: tool === "eraser" ? "cell" : "crosshair",
                    touchAction: "none",
                }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
            >
                {/* The canvas: CSS inset:0 makes clientWidth/clientHeight = viewport size */}
                <canvas
                    ref={fullRef}
                    style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: "100%", height: "100%",
                        display: "block",
                        pointerEvents: "none",
                    }}
                />

                {/* HUD: exit + tools toggle */}
                <div style={{
                    position: "absolute", top: 12, left: 12, right: 12,
                    zIndex: 10, display: "flex", justifyContent: "space-between",
                    alignItems: "center", pointerEvents: "none",
                }}>
                    <button onClick={exitFS} style={{ pointerEvents: "auto" }}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-black/70 backdrop-blur border border-purple-500/40 text-purple-400 hover:bg-purple-500/20 transition-all shadow-lg text-xs font-bold"
                        title="Esci (ESC)">
                        <Minimize2 className="w-4 h-4" /> Esci
                    </button>
                    <button onClick={() => setShowTools(s => !s)} style={{ pointerEvents: "auto" }}
                        className={`h-9 px-3 rounded-xl backdrop-blur border flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg ${showTools ? "bg-emerald-500/30 border-emerald-500/60 text-emerald-300" : "bg-black/70 border-white/10 text-white/40 hover:bg-white/10"}`}
                        title="Strumenti">
                        <Paintbrush className="w-4 h-4" /> Strumenti
                    </button>
                </div>

                {/* Toolbar */}
                {showTools && Toolbar}
            </div>
        </div>
    ) : null;

    // ── Inline thumbnail ──────────────────────────────────────────────────────
    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {label && (
                <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{label}</span>
            )}

            <div
                className="relative rounded-2xl overflow-hidden border-2 border-[#3b2d6e] hover:border-emerald-500/40 transition-all shadow-2xl group cursor-pointer bg-black/20"
                style={{ width, height }}
                onClick={() => setIsFullscreen(true)}
                title="Clicca per disegnare"
            >
                {/* Inline canvas: CSS sized exactly to width×height */}
                <canvas
                    ref={inlineRef}
                    style={{
                        position: "absolute", inset: 0,
                        width, height,
                        display: "block",
                        pointerEvents: "none",
                    }}
                />
                {/* Hover hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-1">
                        <Maximize2 className="w-6 h-6 text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-300">Disegna</span>
                    </div>
                </div>
            </div>

            {mounted && createPortal(portal, document.body)}
        </div>
    );
}
