/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/purity */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { getStroke } from "perfect-freehand";
import { getStorageKey } from "@/lib/storage";
import { Maximize, Minimize, ZoomIn, ZoomOut, Move, Paintbrush, Eraser, Settings2, Download, Save, Trash2 } from "lucide-react";

type Point = {
    x: number;
    y: number;
    timestamp: number;
    pressure?: number;
};

type Stroke = {
    id: string;
    tool: "pencil" | "eraser" | "fill";
    color: string;
    size: number;
    points: Point[];
    smoothing: boolean;
};

const DEFAULT_COLORS = [
    "#ffffff", "#000000", "#ef4444", "#f59e0b", "#eab308", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"
];
const SIZES = [2, 5, 10, 20, 30, 50];

function getSvgPathFromStroke(stroke: number[][]) {
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

export default function DrawingBoard() {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Tools & State
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<"pencil" | "eraser" | "fill" | "pan">("pencil");
    const [currentColor, setCurrentColor] = useState(DEFAULT_COLORS[0]);
    const [currentSize, setCurrentSize] = useState(SIZES[1]);

    // Storage
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    // Assistants
    const [useSmoothing, setUseSmoothing] = useState(false);
    const [useSymmetry, setUseSymmetry] = useState(false);
    const [showAssistants, setShowAssistants] = useState(false);

    // Viewport State (Zoom & Pan)
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Setup Canvas Resolution
    useEffect(() => {
        const resizeCanvas = () => {
            if (canvasRef.current && wrapperRef.current) {
                // We make the canvas very large to allow panning around a big virtual space
                // Virtual canvas size: 3000x2000
                const VIRTUAL_W = 3000;
                const VIRTUAL_H = 2000;

                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = VIRTUAL_W * dpr;
                canvasRef.current.height = VIRTUAL_H * dpr;

                const ctx = canvasRef.current.getContext("2d");
                if (ctx) {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.scale(dpr, dpr);
                }

                // Center the virtual canvas initially
                if (pan.x === 0 && pan.y === 0) {
                    const rect = wrapperRef.current.getBoundingClientRect();
                    setPan({
                        x: (rect.width - VIRTUAL_W * zoom) / 2,
                        y: (rect.height - VIRTUAL_H * zoom) / 2
                    });
                }

                redrawAll();
            }
        };
        window.addEventListener("resize", resizeCanvas);
        // Delay slightly to ensure layout is done
        setTimeout(resizeCanvas, 50);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    const redrawAll = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dark background matching layout
        ctx.fillStyle = "#0f0a1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid pattern for reference
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width / window.devicePixelRatio; x += 100) {
            ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height / window.devicePixelRatio);
        }
        for (let y = 0; y < canvas.height / window.devicePixelRatio; y += 100) {
            ctx.moveTo(0, y); ctx.lineTo(canvas.width / window.devicePixelRatio, y);
        }
        ctx.stroke();

        ctx.restore();

        // Draw symmetry line
        if (useSymmetry) {
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 / (window.devicePixelRatio || 1), 0);
            ctx.lineTo(canvas.width / 2 / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
            ctx.strokeStyle = "rgba(124, 58, 237, 0.4)";
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
        const canvasLogicWidth = canvas.width / (window.devicePixelRatio || 1);

        allStrokes.forEach((stroke) => {
            if (stroke.points.length === 0) return;

            // Fill tool is handled differently (it's basically a gigantic point that clears to color)
            if (stroke.tool === "fill") {
                const p = stroke.points[0];
                ctx.fillStyle = stroke.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, stroke.size * 50, 0, Math.PI * 2); // fill a large area centered on click
                ctx.fill();
                return;
            }

            let pathData: number[][] = [];
            if (stroke.smoothing) {
                pathData = getStroke(stroke.points, { size: stroke.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
            } else {
                pathData = getStroke(stroke.points, { size: stroke.size, thinning: 0, smoothing: 0, streamline: 0 });
            }

            const pathString = getSvgPathFromStroke(pathData);
            ctx.fillStyle = stroke.tool === "eraser" ? "#0f0a1e" : stroke.color;
            ctx.fill(new Path2D(pathString));

            if (useSymmetry && stroke.tool === "pencil") {
                const mirroredPoints = stroke.points.map(p => ({ ...p, x: canvasLogicWidth - p.x }));
                let mirrorPathData: number[][] = [];
                if (stroke.smoothing) {
                    mirrorPathData = getStroke(mirroredPoints, { size: stroke.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
                } else {
                    mirrorPathData = getStroke(mirroredPoints, { size: stroke.size, thinning: 0, smoothing: 0, streamline: 0 });
                }
                const mirrorPathString = getSvgPathFromStroke(mirrorPathData);
                ctx.fillStyle = stroke.color;
                ctx.fill(new Path2D(mirrorPathString));
            }
        });
    }, [strokes, currentStroke, useSymmetry]);

    useEffect(() => { redrawAll(); }, [redrawAll]);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
                setIsFullscreen(true); // Fallback to CSS fullscreen
            });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Coordinate Math
    const getCoordinates = (e: React.PointerEvent | React.WheelEvent) => {
        if (!wrapperRef.current) return { x: 0, y: 0, pressure: 0.5 };
        const rect = wrapperRef.current.getBoundingClientRect();

        // CSS transform applies scale to the canvas, so real X is (mouseX - panX) / zoom
        const clientX = 'clientX' in e ? e.clientX : 0;
        const clientY = 'clientY' in e ? e.clientY : 0;

        const pointerX = clientX - rect.left;
        const pointerY = clientY - rect.top;

        // Reverse translate and scale
        const realX = (pointerX - pan.x) / zoom;
        const realY = (pointerY - pan.y) / zoom;

        const pressure = 'pressure' in e && e.pressure > 0 ? e.pressure : 0.5;

        return { x: realX, y: realY, pressure };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) return; // Middle click = pan

        (e.target as Element).setPointerCapture(e.pointerId);

        // Pan override with middle click or spacebar (not implemented spacebar yet)
        const nativeEvent = e.nativeEvent as any;
        if (currentTool === "pan" || e.button === 1 || (nativeEvent.touches && nativeEvent.touches.length > 1)) {
            setIsDrawing(false);
            // Handle panning start
            containerRef.current!.dataset.panning = "true";
            containerRef.current!.dataset.startX = e.clientX.toString();
            containerRef.current!.dataset.startY = e.clientY.toString();
            containerRef.current!.dataset.startPanX = pan.x.toString();
            containerRef.current!.dataset.startPanY = pan.y.toString();
            return;
        }

        setIsDrawing(true);
        const coords = getCoordinates(e);

        const newStroke: Stroke = {
            id: Date.now().toString(),
            tool: currentTool,
            color: currentColor,
            size: currentSize,
            points: [{ ...coords, timestamp: Date.now() }],
            smoothing: useSmoothing,
        };
        setCurrentStroke(newStroke);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (containerRef.current?.dataset.panning === "true") {
            const startX = parseFloat(containerRef.current.dataset.startX || "0");
            const startY = parseFloat(containerRef.current.dataset.startY || "0");
            const startPanX = parseFloat(containerRef.current.dataset.startPanX || "0");
            const startPanY = parseFloat(containerRef.current.dataset.startPanY || "0");

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            setPan({ x: startPanX + dx, y: startPanY + dy });
            return;
        }

        if (!isDrawing || !currentStroke) return;

        if (e.pointerType === "mouse" && e.buttons !== 1) {
            handlePointerUp(e);
            return;
        }

        const coords = getCoordinates(e);
        setCurrentStroke({
            ...currentStroke,
            points: [...currentStroke.points, { ...coords, timestamp: Date.now() }],
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);

        if (containerRef.current?.dataset.panning === "true") {
            containerRef.current.dataset.panning = "false";
            return;
        }

        if (!isDrawing || !currentStroke) return;
        setIsDrawing(false);
        setStrokes((prev) => [...prev, currentStroke]);
        setCurrentStroke(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault(); // Stop page scroll

        // Zoom on Ctrl+Wheel or Pinch
        if (e.ctrlKey || e.metaKey) {
            const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.max(0.1, Math.min(5, z * zoomDelta)));
        } else {
            // Pan on regular wheel
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const resetView = () => {
        setZoom(1);
        if (wrapperRef.current && canvasRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            // Assuming 3000x2000 virtual canvas
            setPan({
                x: (rect.width - 3000) / 2,
                y: (rect.height - 2000) / 2
            });
        }
    };

    const exportMetadata = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(strokes));
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = "alice_art_metadata.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const saveToGallery = () => {
        if (!canvasRef.current) return;

        // Create a temporary canvas to save just checking bounds (or whole view)
        // Here we just save the current viewport snapshot for simplicity
        const snapCanvas = document.createElement("canvas");
        const ctx = snapCanvas.getContext("2d");
        if (!ctx || !wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        snapCanvas.width = rect.width;
        snapCanvas.height = rect.height;

        // Draw background
        ctx.fillStyle = "#0f0a1e";
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Draw the main canvas onto the snap canvas with transforms
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(canvasRef.current, 0, 0);

        const thumbnailDataUrl = snapCanvas.toDataURL("image/png");
        const drawingData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            thumbnail: thumbnailDataUrl,
            strokes: strokes
        };

        const existing = localStorage.getItem(getStorageKey("alice_gallery"));
        const gallery = existing ? JSON.parse(existing) : [];
        gallery.push(drawingData);
        localStorage.setItem(getStorageKey("alice_gallery"), JSON.stringify(gallery));
        alert("Disegno salvato in Galleria!");
    };

    const clearCanvas = () => {
        if (confirm("Sei sicuro di voler cancellare tutto?")) {
            setStrokes([]);
            setCurrentStroke(null);
            resetView();
        }
    };

    return (
        <div ref={containerRef} className={`flex flex-col w-full bg-[#0f0a1e] relative text-white ${isFullscreen ? 'fixed inset-0 z-50 h-screen overflow-hidden' : 'h-[80vh] min-h-[500px] rounded-2xl border-2 border-purple-500/30 overflow-hidden shadow-2xl'}`}>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-[#1e1535]/80 backdrop-blur border-b border-[#3b2d6e] z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    {!isFullscreen && (
                        <Link href="/alice" className="text-purple-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
                            ⬅ Esci
                        </Link>
                    )}
                    <span className="text-emerald-400 text-sm font-mono tracking-widest hidden sm:inline-block">IQ CANVAS PRO</span>
                </div>

                {/* Viewport Info */}
                <div className="flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-purple-400 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="text-purple-400 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-white/10" />
                    <button onClick={resetView} className="text-emerald-400 hover:text-white text-xs font-bold uppercase tracking-widest px-2">Centra</button>
                    <div className="w-px h-4 bg-white/10" />
                    <button onClick={toggleFullscreen} className="text-purple-400 hover:text-white">
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Drawing Area Wrapper */}
            <div
                ref={wrapperRef}
                className="w-full h-full relative cursor-crosshair overflow-hidden mt-14 touch-none"
                style={{ cursor: currentTool === "pan" ? "grab" : "crosshair" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: "0 0",
                        width: "3000px",  // Matches virtual width
                        height: "2000px", // Matches virtual height
                        position: "absolute",
                        top: 0,
                        left: 0,
                        willChange: "transform"
                    }}
                >
                    <canvas ref={canvasRef} className="block pointer-events-none" />
                </div>
            </div>

            {/* Bottom Tools Toolbar */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-fit bg-[#1e1535]/95 backdrop-blur-xl p-2 sm:p-3 rounded-2xl border border-[#3b2d6e] shadow-[0_0_40px_rgba(124,58,237,0.2)] flex flex-wrap justify-center items-center gap-2 sm:gap-4 z-40">

                {/* Main Tools */}
                <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                    <button onClick={() => setCurrentTool("pencil")} className={`p-2 rounded-lg transition-all ${currentTool === "pencil" ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "text-white/50 hover:bg-white/10 hover:text-white"}`} title="Matita">
                        <Paintbrush className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentTool("eraser")} className={`p-2 rounded-lg transition-all ${currentTool === "eraser" ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]" : "text-white/50 hover:bg-white/10 hover:text-white"}`} title="Gomma">
                        <Eraser className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentTool("pan")} className={`p-2 rounded-lg transition-all ${currentTool === "pan" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "text-white/50 hover:bg-white/10 hover:text-white"}`} title="Muovi (Pan)">
                        <Move className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                {/* Colors (Custom picker + presets) */}
                <div className="flex gap-1.5 items-center flex-wrap justify-center">
                    <div className="relative group p-1">
                        <input type="color" value={currentColor} onChange={e => { setCurrentColor(e.target.value); setCurrentTool("pencil"); }} className="w-8 h-8 rounded-full border-2 border-white/20 cursor-pointer overflow-hidden p-0 bg-transparent outline-none ring-0 appearance-none shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform" title="Scegli Colore" />
                    </div>
                    {DEFAULT_COLORS.slice(0, 5).map((color) => (
                        <button key={color} onClick={() => { setCurrentColor(color); setCurrentTool("pencil"); }} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-transform border border-white/10 ${currentColor === color && currentTool !== "eraser" && currentTool !== "pan" ? "scale-125 ring-2 ring-white" : "hover:scale-110"}`} style={{ backgroundColor: color }} title={color} />
                    ))}
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                {/* Slider and Size */}
                <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full"></div></div>
                    <input type="range" min="1" max="100" value={currentSize} onChange={e => setCurrentSize(Number(e.target.value))} className="w-20 sm:w-24 accent-purple-500" />
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                </div>

                <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

                {/* AI / Settings */}
                <div className="relative">
                    <button onClick={() => setShowAssistants(!showAssistants)} className={`p-2 rounded-xl transition-all border ${showAssistants ? 'bg-purple-600/30 border-purple-400 text-white' : 'bg-black/40 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`} title="Impostazioni Tratto">
                        <Settings2 className="w-5 h-5" />
                    </button>
                    {showAssistants && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#1e1535] border border-purple-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.3)] min-w-[200px] flex flex-col gap-3 z-50">
                            <h4 className="text-[10px] uppercase text-purple-400 font-bold mb-1 tracking-widest border-b border-purple-500/30 pb-2">Assistenti AI</h4>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium">Ammorbidisci Tratto</span>
                                <input type="checkbox" className="sr-only" checked={useSmoothing} onChange={(e) => setUseSmoothing(e.target.checked)} />
                                <div className={`w-10 h-6 rounded-full transition-colors relative ${useSmoothing ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${useSmoothing ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium">Specchio X</span>
                                <input type="checkbox" className="sr-only" checked={useSymmetry} onChange={(e) => setUseSymmetry(e.target.checked)} />
                                <div className={`w-10 h-6 rounded-full transition-colors relative ${useSymmetry ? 'bg-blue-500' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${useSymmetry ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button onClick={clearCanvas} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors" title="Cancella Tutto">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={exportMetadata} className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-600/30 transition-colors" title="Scarica Json Dati Vettoriali">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={saveToGallery} className="p-2 px-4 rounded-xl bg-emerald-600 text-white font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition-colors text-sm uppercase flex items-center gap-2" title="Salva in Galleria">
                        <Save className="w-4 h-4" /> <span className="hidden sm:inline">Salva</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
