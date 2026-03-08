/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { getStroke } from "perfect-freehand";
import { getStorageKey } from "@/lib/storage";
import { Trash2, Paintbrush, Eraser, Move } from "lucide-react";

type Point = { x: number; y: number; pressure?: number };
type MiniStroke = { color: string; size: number; points: Point[]; eraser: boolean };

const COLORS = ["#ffffff", "#000000", "#ef4444", "#f59e0b", "#eab308", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

function svgPath(stroke: number[][]) {
    if (!stroke.length) return "";
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
}

interface MiniCanvasProps {
    storageKey: string;
    label?: string;
    width?: number;
    height?: number;
    className?: string;
    withZoomPan?: boolean; // New prop to enable zoom/pan
}

export default function MiniCanvas({ storageKey, label, width = 300, height = 300, className = "", withZoomPan = false }: MiniCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [strokes, setStrokes] = useState<MiniStroke[]>([]);
    const [current, setCurrent] = useState<MiniStroke | null>(null);
    const [drawing, setDrawing] = useState(false);

    const [tool, setTool] = useState<"brush" | "eraser" | "pan">("brush");
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(8);
    const [showTools, setShowTools] = useState(false);

    // Zoom/Pan
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // Load saved strokes
    useEffect(() => {
        const saved = localStorage.getItem(getStorageKey(storageKey));
        if (saved) {
            try { setStrokes(JSON.parse(saved)); } catch { }
        }
    }, [storageKey]);

    // Save strokes
    useEffect(() => {
        if (strokes.length > 0) {
            localStorage.setItem(getStorageKey(storageKey), JSON.stringify(strokes));
        }
    }, [strokes, storageKey]);

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0f0a1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.restore();

        const all = current ? [...strokes, current] : strokes;
        all.forEach(s => {
            if (!s.points.length) return;
            const pathData = getStroke(s.points, { size: s.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
            const p = svgPath(pathData);
            ctx.fillStyle = s.eraser ? "#0f0a1e" : s.color;
            ctx.fill(new Path2D(p));
        });
    }, [strokes, current]);

    // Resize & redraw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use a larger virtual canvas if zoom/pan is enabled
        const V_W = withZoomPan ? width * 3 : width;
        const V_H = withZoomPan ? height * 3 : height;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = V_W * dpr;
        canvas.height = V_H * dpr;

        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr); }

        if (withZoomPan && pan.x === 0 && pan.y === 0) {
            setPan({ x: -width, y: -height }); // Center
        }

        redraw();
    }, [width, height, strokes, current, redraw, withZoomPan]);

    const getCoords = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0, pressure: 0.5 };

        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        // Reverse translate and scale
        const rx = (cx - pan.x) / zoom;
        const ry = (cy - pan.y) / zoom;

        return { x: rx, y: ry, pressure: e.pressure > 0 ? e.pressure : 0.5 };
    };

    const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) return;
        (e.target as Element).setPointerCapture(e.pointerId);

        if (tool === "pan" || e.button === 1 || (e.touches && e.touches.length > 1)) {
            containerRef.current!.dataset.panning = "true";
            containerRef.current!.dataset.startX = e.clientX.toString();
            containerRef.current!.dataset.startY = e.clientY.toString();
            containerRef.current!.dataset.startPanX = pan.x.toString();
            containerRef.current!.dataset.startPanY = pan.y.toString();
            return;
        }

        setDrawing(true);
        setCurrent({ color, size, points: [getCoords(e)], eraser: tool === "eraser" });
    };

    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (containerRef.current?.dataset.panning === "true") {
            const startX = parseFloat(containerRef.current.dataset.startX || "0");
            const startY = parseFloat(containerRef.current.dataset.startY || "0");
            const startPanX = parseFloat(containerRef.current.dataset.startPanX || "0");
            const startPanY = parseFloat(containerRef.current.dataset.startPanY || "0");
            setPan({ x: startPanX + (e.clientX - startX), y: startPanY + (e.clientY - startY) });
            return;
        }

        if (!drawing || !current) return;
        if (e.pointerType === "mouse" && e.buttons !== 1) { handleUp(e); return; }
        setCurrent({ ...current, points: [...current.points, getCoords(e)] });
    };

    const handleUp = (e: React.PointerEvent<HTMLDivElement>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);

        if (containerRef.current?.dataset.panning === "true") {
            containerRef.current.dataset.panning = "false";
            return;
        }

        if (!drawing || !current) return;
        setDrawing(false);
        setStrokes(p => [...p, current]);
        setCurrent(null);
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!withZoomPan) return;
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            setZoom(z => Math.max(0.5, Math.min(3, z * (e.deltaY > 0 ? 0.9 : 1.1))));
        } else {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const clearAll = () => {
        setStrokes([]);
        setCurrent(null);
        localStorage.removeItem(getStorageKey(storageKey));
    };

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {label && <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{label}</span>}

            <div
                ref={containerRef}
                className="relative rounded-xl overflow-hidden border-2 border-[#3b2d6e] hover:border-emerald-500/60 transition-colors shadow-xl group touch-none"
                style={{ width, height, cursor: tool === "pan" ? "grab" : "crosshair" }}
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
                onWheel={handleWheel}
            >
                <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", width: withZoomPan ? width * 3 : width, height: withZoomPan ? height * 3 : height, position: "absolute", top: 0, left: 0 }}>
                    <canvas ref={canvasRef} className="block pointer-events-none" />
                </div>

                {/* Floating Tool Toggle */}
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-lg bg-black/60 backdrop-blur text-emerald-400 border border-emerald-500/30 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all hover:bg-emerald-500/20 hover:scale-110"
                >
                    <Paintbrush className="w-4 h-4" />
                </button>

                {/* Tool Palette */}
                {showTools && (
                    <div className="absolute bottom-2 left-2 right-2 z-20 bg-black/80 backdrop-blur-xl p-2 rounded-xl border border-emerald-500/30 flex flex-wrap gap-2 items-center justify-center shadow-2xl">
                        <button onClick={() => setTool("brush")} className={`p-1.5 rounded-lg ${tool === "brush" ? 'bg-emerald-600' : 'bg-white/5 text-white/50'}`}><Paintbrush className="w-4 h-4" /></button>
                        <button onClick={() => setTool("eraser")} className={`p-1.5 rounded-lg ${tool === "eraser" ? 'bg-pink-600' : 'bg-white/5 text-white/50'}`}><Eraser className="w-4 h-4" /></button>
                        {withZoomPan && <button onClick={() => setTool("pan")} className={`p-1.5 rounded-lg ${tool === "pan" ? 'bg-blue-600' : 'bg-white/5 text-white/50'}`}><Move className="w-4 h-4" /></button>}

                        <div className="w-px h-5 bg-white/10 mx-0.5" />

                        <input type="color" value={color} onChange={e => { setColor(e.target.value); setTool("brush"); }} className="w-6 h-6 rounded-full overflow-hidden p-0 bg-transparent border-0 ring-0 appearance-none cursor-pointer" />

                        <div className="w-px h-5 bg-white/10 mx-0.5" />

                        <input type="range" min="2" max="50" value={size} onChange={e => setSize(Number(e.target.value))} className="w-16 h-1 accent-emerald-500" />

                        <div className="w-px h-5 bg-white/10 mx-0.5" />

                        <button onClick={clearAll} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
