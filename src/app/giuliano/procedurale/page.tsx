"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { Map as MapIcon, RefreshCw, Settings2, Hash, ArrowLeft, Play } from "lucide-react";

const PROCEDURAL_TIPS = [
    "La <strong>Generazione Procedurale</strong> crea mappe o livelli via codice, garantendo una rigiocabilità infinita.",
    "L'algoritmo <strong>Cellular Automata</strong> simula l'evoluzione delle cellule (o rocce) creando caverne organiche perfette per dungeon naturali.",
    "Aumentare l'<strong>Initial Density</strong> crea caverne più strette e separate, ridurlo crea stanze più grandi e connesse.",
    "Gli <strong>Iterations (Passi di pulizia)</strong> smussano i bordi e rimuovono le piccole rocce fluttuanti.",
    "Un Level Designer usa questi strumenti per creare l'ossatura del livello per poi rifinirlo a mano!"
];

type ProcConfig = {
    width: number;
    height: number;
    density: number;
    iterations: number;
};

export default function ProceduralPage() {
    const [config, setConfig] = useState<ProcConfig>({ width: 60, height: 40, density: 45, iterations: 4 });
    const [grid, setGrid] = useState<number[][]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load saved config
    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("ld_procedurale"));
                if (s) setConfig(JSON.parse(s));
            } catch { }
        });
    }, []);

    const CELL_SIZE = 8; // px

    // Cellular Automata functions
    const initializeGrid = () => {
        const newGrid = [];
        for (let y = 0; y < config.height; y++) {
            const row = [];
            for (let x = 0; x < config.width; x++) {
                // Borders are always walls
                if (x === 0 || x === config.width - 1 || y === 0 || y === config.height - 1) {
                    row.push(1); // 1 = wall
                } else {
                    row.push(Math.random() < (config.density / 100) ? 1 : 0); // 0 = empty
                }
            }
            newGrid.push(row);
        }
        return newGrid;
    };

    const getSurroundingWallCount = (gridX: number, gridY: number, currentGrid: number[][]) => {
        let wallCount = 0;
        for (let neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
            for (let neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
                if (neighbourX >= 0 && neighbourX < config.width && neighbourY >= 0 && neighbourY < config.height) {
                    if (neighbourX !== gridX || neighbourY !== gridY) {
                        wallCount += currentGrid[neighbourY][neighbourX];
                    }
                } else {
                    wallCount++; // out of bounds is wall
                }
            }
        }
        return wallCount;
    };

    const runAutomataStep = (currentGrid: number[][]) => {
        const newGrid = [];
        for (let y = 0; y < config.height; y++) {
            const row = [];
            for (let x = 0; x < config.width; x++) {
                const neighbours = getSurroundingWallCount(x, y, currentGrid);
                if (neighbours > 4) row.push(1);
                else if (neighbours < 4) row.push(0);
                else row.push(currentGrid[y][x]);
            }
            newGrid.push(row);
        }
        return newGrid;
    };

    const generateMap = async () => {
        if (isGenerating) return;
        setIsGenerating(true);

        // Step 1: Initial random noise
        let currentGrid = initializeGrid();
        setGrid(currentGrid);
        await new Promise(r => setTimeout(r, 200));

        // Step 2: Smoothing iterations
        for (let i = 0; i < config.iterations; i++) {
            currentGrid = runAutomataStep(currentGrid);
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            setGrid([...currentGrid]); // update state to trigger render
            await new Promise(r => setTimeout(r, 300));
        }

        setIsGenerating(false);

        // Save config to mark this mission as done
        localStorage.setItem(getStorageKey("ld_procedurale"), JSON.stringify(config));
    };

    // Draw grid to canvas
    useEffect(() => {
        if (!canvasRef.current || grid.length === 0) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                if (grid[y] && grid[y][x] === 1) {
                    ctx.fillStyle = "#374151"; // Wall color
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    
                    // Simple top highlight
                    ctx.fillStyle = "#4b5563";
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, 2);
                } else {
                    ctx.fillStyle = "#0f0a1e"; // Floor color (background)
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
    }, [grid, config.width, config.height]);

    // Initial empty run
    useEffect(() => {
        setGrid(initializeGrid().map(row => row.map(() => 0))); // starting empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Hash className="w-3 h-3" />
                            Missione 6 • ProcGen
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none uppercase font-mono">
                            Generazione <span className="text-emerald-400">Procedurale</span>
                        </h1>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Giuliano Hub
                    </Link>
                </div>

                <div className="mb-6 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={PROCEDURAL_TIPS} emoji="🧬" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Controls */}
                    <div className="flex flex-col gap-6">
                        <div className="quest-card p-5">
                            <h3 className="text-xs font-black text-emerald-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 font-mono pb-2 border-b border-white/5">
                                <Settings2 className="w-4 h-4" /> Parametri Cellular Automata
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Dimensione Mappa (Tiles)</label>
                                        <span className="text-[10px] font-mono text-emerald-400">{config.width}x{config.height}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" value={config.width} onChange={e => !isGenerating && setConfig({...config, width: Number(e.target.value)})} className="quest-input w-full text-center" disabled={isGenerating} />
                                        <span className="text-white/20 flex items-center">×</span>
                                        <input type="number" value={config.height} onChange={e => !isGenerating && setConfig({...config, height: Number(e.target.value)})} className="quest-input w-full text-center" disabled={isGenerating} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Densità Iniziale</label>
                                        <span className="text-[10px] font-mono text-blue-400">{config.density}%</span>
                                    </div>
                                    <input type="range" min="30" max="60" value={config.density} onChange={e => !isGenerating && setConfig({...config, density: Number(e.target.value)})} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/50 accent-blue-500" disabled={isGenerating} />
                                    <p className="text-[9px] text-white/30 uppercase mt-2 font-mono leading-relaxed">Percentuale di rocce al momento 0.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Iterazioni Pulizia</label>
                                        <span className="text-[10px] font-mono text-emerald-400">{config.iterations}</span>
                                    </div>
                                    <input type="range" min="1" max="10" value={config.iterations} onChange={e => !isGenerating && setConfig({...config, iterations: Number(e.target.value)})} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/50 accent-emerald-500" disabled={isGenerating} />
                                    <p className="text-[9px] text-white/30 uppercase mt-2 font-mono leading-relaxed">Quante volte applicare le regole di lisciatura.</p>
                                </div>
                            </div>

                            <button 
                                onClick={generateMap} 
                                disabled={isGenerating}
                                className={`w-full mt-8 p-3 rounded-xl border flex justify-center items-center gap-2 font-black uppercase tracking-widest transition-all shadow-xl ${isGenerating ? 'bg-black/40 border-white/5 text-white/20' : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 shadow-emerald-500/20 hover:scale-[1.02]'}`}
                            >
                                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {isGenerating ? "Generazione..." : "Genera Dungeon"}
                            </button>
                        </div>
                    </div>

                    {/* Canvas View */}
                    <div className="quest-card p-2 sm:p-4 flex items-center justify-center bg-[#030308] border-white/5 min-h-[400px] overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                        <div className="absolute top-4 left-4 flex gap-2 z-10">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 border border-white/10 backdrop-blur-md">
                                <div className="w-3 h-3 bg-[#0f0a1e] rounded-[2px] border border-white/20" />
                                <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">Pavimento</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 border border-white/10 backdrop-blur-md">
                                <div className="w-3 h-3 bg-[#374151] rounded-[2px] border border-[#4b5563]" />
                                <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">Muro</span>
                            </div>
                        </div>

                        <div className="overflow-auto custom-scrollbar max-w-full max-h-full rounded-lg border border-white/5">
                            <canvas 
                                ref={canvasRef} 
                                width={config.width * CELL_SIZE} 
                                height={config.height * CELL_SIZE}
                                className="bg-[#0f0a1e]"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>

                        {!isGenerating && grid.every(row => row.every(c => c === 0)) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                <MapIcon className="w-12 h-12 text-white/10 mb-4" />
                                <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em] text-center px-4">Modifica i parametri e clicca<br/> <strong className="text-emerald-400">Genera Dungeon</strong></p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
