/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { getStroke } from "perfect-freehand";
import { getStorageKey } from "@/lib/storage";

type Point = { x: number; y: number; pressure?: number };
type MiniStroke = { color: string; size: number; points: Point[]; eraser: boolean };

const COLORS = ["#ffffff", "#000000", "#ef4444", "#f59e0b", "#eab308", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const SIZES = [3, 8, 16];

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
}

export default function MiniCanvas({ storageKey, label, width = 300, height = 300, className = "" }: MiniCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [strokes, setStrokes] = useState<MiniStroke[]>([]);
    const [current, setCurrent] = useState<MiniStroke | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(SIZES[1]);
    const [eraser, setEraser] = useState(false);
    const [showTools, setShowTools] = useState(false);

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
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr); }
        redraw();
    }, [width, height, strokes, current, redraw]);

    const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure > 0 ? e.pressure : 0.5 };
    };

    const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        (e.target as Element).setPointerCapture(e.pointerId);
        setDrawing(true);
        setCurrent({ color, size, points: [getCoords(e)], eraser });
    };

    const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing || !current) return;
        if (e.pointerType === "mouse" && e.buttons !== 1) { handleUp(e); return; }
        setCurrent({ ...current, points: [...current.points, getCoords(e)] });
    };

    const handleUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing || !current) return;
        (e.target as Element).releasePointerCapture(e.pointerId);
        setDrawing(false);
        setStrokes(p => [...p, current]);
        setCurrent(null);
    };

    const clearAll = () => {
        setStrokes([]);
        setCurrent(null);
        localStorage.removeItem(getStorageKey(storageKey));
    };

    const getThumbnail = () => canvasRef.current?.toDataURL("image/png") || "";

    return (
        <div ref={containerRef} className={`flex flex-col items-center gap-2 ${className}`}>
            {label && <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">{label}</span>}

            <div
                className="relative rounded-xl overflow-hidden border-2 border-[#3b2d6e] hover:border-purple-500/60 transition-colors shadow-lg group"
                style={{ width, height }}
            >
                <canvas
                    ref={canvasRef}
                    onPointerDown={handleDown}
                    onPointerMove={handleMove}
                    onPointerUp={handleUp}
                    onPointerCancel={handleUp}
                    className="w-full h-full cursor-crosshair touch-none block"
                    style={{ width, height }}
                />

                {}
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="absolute top-1 right-1 z-20 w-7 h-7 rounded-lg bg-[#1e1535]/80 backdrop-blur text-[10px] border border-[#3b2d6e] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                >🎨</button>

                {}
                {showTools && (
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#1e1535]/95 backdrop-blur-lg p-2 border-t border-[#3b2d6e] flex flex-wrap gap-1 items-center justify-center">
                        {}
                        <button onClick={() => setEraser(false)} className={`p-1 rounded text-xs ${!eraser ? 'bg-purple-600' : 'bg-white/5'}`}>✏️</button>
                        <button onClick={() => setEraser(true)} className={`p-1 rounded text-xs ${eraser ? 'bg-pink-600' : 'bg-white/5'}`}>🧽</button>
                        <div className="w-px h-5 bg-[#3b2d6e] mx-0.5" />
                        {COLORS.map(c => (
                            <button key={c} onClick={() => { setColor(c); setEraser(false); }}
                                className={`w-5 h-5 rounded-full border ${color === c && !eraser ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }} />
                        ))}
                        <div className="w-px h-5 bg-[#3b2d6e] mx-0.5" />
                        {SIZES.map(s => (
                            <button key={s} onClick={() => setSize(s)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center ${size === s ? 'bg-purple-600' : 'bg-white/5'}`}>
                                <div className="bg-white rounded-full" style={{ width: Math.max(2, s / 3), height: Math.max(2, s / 3) }} />
                            </button>
                        ))}
                        <div className="w-px h-5 bg-[#3b2d6e] mx-0.5" />
                        <button onClick={clearAll} className="p-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">🗑️</button>
                    </div>
                )}
            </div>
        </div>
    );
}
