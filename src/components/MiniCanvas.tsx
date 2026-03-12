/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getStroke } from "perfect-freehand";
import { getStorageKey } from "@/lib/storage";
import { Trash2, Paintbrush, Eraser, Move, Maximize2, Minimize2 } from "lucide-react";

type Point = { x: number; y: number; pressure?: number };
type MiniStroke = { color: string; size: number; points: Point[]; eraser: boolean };

const COLORS = ["#ffffff", "#000000", "#ef4444", "#f59e0b", "#eab308", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

function svgPath(stroke: number[][]) {
    if (!stroke.length) return "";
    try {
        const d = stroke.reduce(
            (acc, [x0, y0], i, arr) => {
                const [x1, y1] = arr[(i + 1) % arr.length];
                acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
                return acc;
            },
            ["M", ...stroke[0], "Q"]
        );
        d.push("Z");
        return d.join(" ");
    } catch (e) {
        return "";
    }
}

function drawStrokes(ctx: CanvasRenderingContext2D, allStrokes: MiniStroke[], w: number, h: number, grid?: number) {
    try {
        ctx.clearRect(0, 0, w, h);
        if (grid) {
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
            for (let x = 0; x <= w; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y <= h; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
            ctx.restore();
        }
        for (const s of allStrokes) {
            if (!s || !s.points || s.points.length < 2) continue;
            const outline = getStroke(s.points, { size: s.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
            const pathData = svgPath(outline);
            if (!pathData) continue;
            ctx.save();
            if (s.eraser) { ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,1)"; }
            else { ctx.fillStyle = s.color || "#ffffff"; }
            
            // Path2D can throw if pathData is somehow invalid
            try {
                const path = new Path2D(pathData);
                ctx.fill(path);
            } catch (pErr) {
                console.warn("MiniCanvas: Path2D error", pErr);
            }
            ctx.restore();
        }
    } catch (err) {
        console.error("MiniCanvas: Draw error", err);
    }
}

interface MiniCanvasProps {
    storageKey: string;
    label?: string;
    width?: number;
    height?: number;
    className?: string;
    withZoomPan?: boolean;
    grid?: number;
}

export default function MiniCanvas({
    storageKey, label, width = 300, height = 300, className = "", withZoomPan = false, grid,
}: MiniCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [strokes, setStrokes] = useState<MiniStroke[]>([]);
    const [current, setCurrent] = useState<MiniStroke | null>(null);
    const [drawing, setDrawing] = useState(false);

    const [tool, setTool] = useState<"brush" | "eraser" | "pan">("brush");
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(8);
    const [showTools, setShowTools] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Zoom/Pan
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const panStart = useRef<{ x: number; y: number } | null>(null);

    const canvasW = withZoomPan ? width * 3 : width;
    const canvasH = withZoomPan ? height * 3 : height;

    // Portal requires client-side mount
    useEffect(() => { setMounted(true); }, []);

    // Load saved
    useEffect(() => {
        try {
            const raw = localStorage.getItem(getStorageKey(storageKey));
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setStrokes(parsed);
            }
        } catch (e) { console.error("MiniCanvas: Load failed", e); }
    }, [storageKey]);

    // Save on change
    useEffect(() => {
        if (!strokes.length && !current) return;
        try {
            const key = getStorageKey(storageKey);
            if (key) localStorage.setItem(key, JSON.stringify(strokes));
        } catch (e) {
            console.error("MiniCanvas: Save failed", e);
        }
    }, [strokes, storageKey]);

    // Redraw logic
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
        if (canvas.width !== canvasW * dpr || canvas.height !== canvasH * dpr) {
            canvas.width = canvasW * dpr;
            canvas.height = canvasH * dpr;
            canvas.style.width = `${canvasW}px`;
            canvas.style.height = `${canvasH}px`;
            ctx.scale(dpr, dpr);
        }
        
        const all = current ? [...strokes, current] : strokes;
        drawStrokes(ctx, all, canvasW, canvasH, grid);
    }, [strokes, current, canvasW, canvasH, grid, isFullscreen]);

    useEffect(() => { 
        if (mounted) redraw(); 
    }, [redraw, mounted]);

    // ESC to exit fullscreen
    useEffect(() => {
        if (!isFullscreen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isFullscreen]);

    // Lock body scroll in fullscreen
    useEffect(() => {
        if (typeof document !== "undefined") {
            document.body.style.overflow = isFullscreen ? "hidden" : "";
        }
        return () => { if (typeof document !== "undefined") document.body.style.overflow = ""; };
    }, [isFullscreen]);

    // Point calculation helper
    const calculatePoint = (e: React.PointerEvent | PointerEvent, el: HTMLElement): Point => {
        const rect = el.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - pan.x) / zoom,
            y: (e.clientY - rect.top - pan.y) / zoom,
            pressure: (e as PointerEvent).pressure ?? 0.5,
        };
    };

    const handleDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;
        
        const target = e.currentTarget;
        if (!target) return;
        
        e.preventDefault();
        try {
            target.setPointerCapture(e.pointerId);
        } catch (err) { /* some browsers fail capture here */ }

        if (tool === "pan" && withZoomPan) {
            panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            return;
        }

        const pt = calculatePoint(e, target);
        setDrawing(true);
        setCurrent({ color, size, points: [pt], eraser: tool === "eraser" });
    }, [tool, color, size, withZoomPan, pan.x, pan.y, zoom]);

    const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (tool === "pan" && panStart.current) {
            setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
            return;
        }
        if (!drawing || !e.currentTarget) return;
        
        const pt = calculatePoint(e, e.currentTarget);
        setCurrent(prev => prev ? { ...prev, points: [...prev.points, pt] } : prev);
    }, [drawing, tool, zoom, pan.x, pan.y]);

    const handleUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err){}
        }
        if (panStart.current) { panStart.current = null; return; }
        if (current && current.points.length > 1) {
            setStrokes(prev => [...prev, current]);
        }
        setCurrent(null);
        setDrawing(false);
    }, [current]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!withZoomPan) return;
        e.preventDefault();
        setZoom(z => Math.max(0.3, Math.min(5, z - e.deltaY * 0.001)));
    }, [withZoomPan]);

    // ── Shared UI Toolbar ───────────────────────────────────────────────
    const ToolBar = (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-black/85 backdrop-blur-xl p-2.5 rounded-xl border border-emerald-500/30 flex flex-wrap gap-2 items-center justify-center shadow-2xl">
            <button onClick={() => { setTool("brush"); setDrawing(false); }} className={`p-1.5 rounded-lg ${tool === "brush" ? "bg-emerald-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} title="Pennello"><Paintbrush className="w-4 h-4" /></button>
            <button onClick={() => { setTool("eraser"); setDrawing(false); }} className={`p-1.5 rounded-lg ${tool === "eraser" ? "bg-pink-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} title="Gomma"><Eraser className="w-4 h-4" /></button>
            {withZoomPan && <button onClick={() => { setTool("pan"); setDrawing(false); }} className={`p-1.5 rounded-lg ${tool === "pan" ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} title="Sposta"><Move className="w-4 h-4" /></button>}
            <div className="w-px h-5 bg-white/10" />
            <div className="relative group/color">
                <input type="color" value={color} onChange={e => { setColor(e.target.value); setTool("brush"); }} className="w-6 h-6 rounded-full overflow-hidden p-0 bg-transparent border-0 appearance-none cursor-pointer" />
            </div>
            <div className="w-px h-5 bg-white/10" />
            <input type="range" min="2" max="50" value={size} onChange={e => setSize(Number(e.target.value))} className="w-16 h-1 accent-emerald-500" />
            <div className="w-px h-5 bg-white/10" />
            <button onClick={() => { setStrokes([]); setCurrent(null); setDrawing(false); }} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors" title="Cancella tutto"><Trash2 className="w-4 h-4" /></button>
        </div>
    );

    // ── Fullscreen Content ──────────────────────────────────────────────
    const fullscreenContent = isFullscreen ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#08051a", display: "flex", flexDirection: "column" }} className="font-sans">
            <div
                className="relative flex-1 touch-none overflow-hidden"
                style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
                onWheel={handleWheel}
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                        transformOrigin: "center center",
                        width: canvasW,
                        height: canvasH,
                        position: "relative"
                    }} className="shadow-2xl border border-white/5 bg-black/20">
                        <canvas ref={canvasRef} className="block w-full h-full" />
                    </div>
                </div>

                <div className="absolute top-4 left-4 z-40 flex gap-2">
                    <button onClick={() => setIsFullscreen(false)} className="w-10 h-10 rounded-xl bg-black/70 backdrop-blur border border-purple-500/40 text-purple-400 flex items-center justify-center hover:bg-purple-500/20 hover:scale-105 transition-all shadow-lg" title="Esci (ESC)"><Minimize2 className="w-5 h-5" /></button>
                </div>

                <div className="absolute top-4 right-4 z-40">
                    <button onClick={() => setShowTools(s => !s)} className={`w-10 h-10 rounded-xl bg-black/70 backdrop-blur border ${showTools ? "border-emerald-500 text-emerald-400" : "border-white/10 text-white/50"} flex items-center justify-center hover:bg-emerald-500/20 hover:scale-105 transition-all shadow-lg`}><Paintbrush className="w-5 h-5" /></button>
                </div>

                {showTools && ToolBar}
            </div>
        </div>
    ) : null;

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {label && <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{label}</span>}

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
                {!isFullscreen && (
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
                )}

                {!isFullscreen && (
                    <>
                        <button onClick={() => setIsFullscreen(true)} className="absolute top-2 left-2 z-20 w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-purple-400 border border-purple-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-500/20 hover:scale-110 shadow-lg" title="Schermo intero"><Maximize2 className="w-4 h-4" /></button>
                        <button onClick={() => setShowTools(s => !s)} className="absolute top-2 right-2 z-20 w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-emerald-400 border border-emerald-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500/20 hover:scale-110 shadow-lg" title="Strumenti"><Paintbrush className="w-4 h-4" /></button>
                        {showTools && ToolBar}
                    </>
                )}
            </div>

            {mounted && isFullscreen && createPortal(fullscreenContent, document.body)}
        </div>
    );
}
