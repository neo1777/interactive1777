"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { Gauge, Activity, Cpu, MonitorPlay, Settings2, BarChart2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

const PERFORMANCE_TIPS = [
    "I <strong>Draw Calls</strong> indicano quante volte la CPU dice alla GPU di disegnare qualcosa. Tieni questo numero basso aggruppando gli oggetti (batching).",
    "I <strong>Triangoli</strong> sono i poligoni a schermo. Troppi poligoni abbattono il frame rate (FPS).",
    "La <strong>Memoria RAM/VRAM</strong> deve essere gestita: scarica le texture non usate per evitare crash su dispositivi deboli.",
    "Il <strong>Profiling</strong> si fa in fase di test: la 'Profile Mode' mostra questi dati, in 'Play Mode' il giocatore vede solo il gioco pulito.",
    "L'obiettivo di Giuliano come Level Designer è creare mappe belle ma ottimizzate!"
];

type PerformanceStats = {
    fps: number;
    drawCalls: number;
    triangles: number;
    memoryMB: number;
};

export default function PerformancePage() {
    const [mode, setMode] = useState<"Play" | "Profile">("Profile");
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [stats, setStats] = useState<PerformanceStats>({
        fps: 60,
        drawCalls: 120,
        triangles: 45000,
        memoryMB: 150
    });

    // We can simulate an environment with particles/enemies to see the numbers go up
    const [enemies, setEnemies] = useState(0);
    const [particles, setParticles] = useState(0);

    const checkRef = useRef<number | undefined>(undefined);

    const updateSimulation = useCallback(() => {
        setStats(prev => {
            // Base values
            let baseDrawCalls = 120 + enemies * 2 + (particles > 0 ? 1 : 0); // particles might be batched
            let baseTriangles = 45000 + enemies * 800 + particles * 12;
            let baseMem = 150 + enemies * 5 + particles * 0.1;
            let currentFps = 60;

            // Add some jitter
            baseDrawCalls += Math.floor(Math.random() * 5);
            baseTriangles += Math.floor(Math.random() * 50);
            baseMem += Math.random() * 2;

            // Penalize FPS if too high
            if (baseDrawCalls > 500 || baseTriangles > 500000) {
                currentFps = Math.max(15, 60 - Math.floor((baseDrawCalls - 500) / 10) - Math.floor((baseTriangles - 500000) / 10000));
            } else {
                currentFps = 60 - Math.floor(Math.random() * 2);
            }

            return {
                fps: currentFps,
                drawCalls: baseDrawCalls,
                triangles: baseTriangles,
                memoryMB: Number(baseMem.toFixed(1))
            };
        });

        if (simulationRunning) {
            checkRef.current = window.setTimeout(updateSimulation, 500);
        }
    }, [simulationRunning, enemies, particles]);

    useEffect(() => {
        if (simulationRunning) {
            updateSimulation();
        } else if (checkRef.current) {
            clearTimeout(checkRef.current);
        }
        return () => { if (checkRef.current) clearTimeout(checkRef.current); };
    }, [simulationRunning, updateSimulation]);

    const isFpsGood = stats.fps >= 55;
    const isDcGood = stats.drawCalls < 300;
    const isTriGood = stats.triangles < 300000;
    const isMemGood = stats.memoryMB < 512;

    const allGood = isFpsGood && isDcGood && isTriGood && isMemGood;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Gauge className="w-3 h-3" />
                            Missione 5 • Technical Art
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none uppercase font-mono">
                            Ottimizzazione <span className="text-emerald-400">Performance</span>
                        </h1>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Giuliano Hub
                    </Link>
                </div>

                <div className="mb-6 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={PERFORMANCE_TIPS} emoji="⚡" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                    {/* Simulator View */}
                    <div className="flex flex-col gap-6">
                        <div className="quest-card overflow-hidden flex flex-col relative min-h-[400px]">
                            {/* Toggle Mode Toolbar */}
                            <div className="bg-black/40 border-b border-white/5 p-3 flex justify-between items-center z-20">
                                <div className="flex gap-2">
                                    <button onClick={() => setMode("Play")} className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all flex items-center gap-2 ${mode === "Play" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:bg-white/5 hover:text-white/80"}`}>
                                        <MonitorPlay className="w-4 h-4" /> Play
                                    </button>
                                    <button onClick={() => setMode("Profile")} className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all flex items-center gap-2 ${mode === "Profile" ? "bg-blue-500 text-black shadow-lg shadow-blue-500/20" : "text-white/40 hover:bg-white/5 hover:text-white/80"}`}>
                                        <Activity className="w-4 h-4" /> Profile
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-white/50 uppercase tracking-widest cursor-pointer">
                                        Simulazione
                                        <input type="checkbox" className="sr-only" checked={simulationRunning} onChange={e => setSimulationRunning(e.target.checked)} />
                                        <div className={`w-8 h-4 rounded-full transition-colors relative ${simulationRunning ? 'bg-emerald-500' : 'bg-white/20'}`}>
                                            <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${simulationRunning ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* "Game" View */}
                            <div className="flex-1 bg-[#050510] relative overflow-hidden flex items-center justify-center">
                                {/* Synthetic visual for game */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-[#050510] to-[#050510]" />
                                
                                {simulationRunning ? (
                                    <div className="text-center">
                                        <div className="text-6xl animate-pulse mb-4">👾</div>
                                        <div className="text-xs font-mono text-emerald-400/50 uppercase tracking-[0.3em]">Game Loop Running...</div>
                                    </div>
                                ) : (
                                    <div className="text-center opacity-50">
                                        <div className="text-4xl mb-4">⏸️</div>
                                        <div className="text-xs font-mono text-white/40 uppercase tracking-[0.3em]">Paused</div>
                                    </div>
                                )}

                                {/* Profiler Overlay */}
                                {mode === "Profile" && (
                                    <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                                        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2.5 font-mono text-[10px] uppercase tracking-widest min-w-[200px] shadow-2xl">
                                            <div className={`flex justify-between items-center pb-2 mb-2 border-b border-white/10 ${isFpsGood ? 'text-emerald-400' : 'text-red-400'} font-black text-xs`}>
                                                <span className="flex items-center gap-2"><BarChart2 className="w-3 h-3" /> FPS</span>
                                                <span>{stats.fps}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-white/40">Draw Calls</span>
                                                <span className={isDcGood ? 'text-white' : 'text-orange-400'}>{stats.drawCalls}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-white/40">Triangles</span>
                                                <span className={isTriGood ? 'text-white' : 'text-orange-400'}>{(stats.triangles / 1000).toFixed(1)}k</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1 pt-2 mt-1 border-t border-white/10">
                                                <span className="text-white/40 flex items-center gap-1"><Cpu className="w-3 h-3" /> Mem</span>
                                                <span className={isMemGood ? 'text-blue-400' : 'text-red-400'}>{stats.memoryMB} MB</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stress Tester Controls */}
                    <div className="flex flex-col gap-6">
                        <div className="quest-card p-5">
                            <h3 className="text-xs font-black text-emerald-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 font-mono pb-2 border-b border-white/5">
                                <Settings2 className="w-4 h-4" /> Stress Tester
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Nemici a schermo</label>
                                        <span className="text-[10px] font-mono text-emerald-400">{enemies}</span>
                                    </div>
                                    <input type="range" min="0" max="250" value={enemies} onChange={e => {setEnemies(Number(e.target.value)); setSimulationRunning(true);}} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/50 accent-emerald-500" />
                                    <p className="text-[9px] text-white/30 uppercase mt-2 font-mono leading-relaxed">Aumenta costantemente Draw Calls e Triangoli. L&apos;impatto sulla CPU è alto.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Particellari (Magie/Fuoco)</label>
                                        <span className="text-[10px] font-mono text-blue-400">{particles}</span>
                                    </div>
                                    <input type="range" min="0" max="10000" step="100" value={particles} onChange={e => {setParticles(Number(e.target.value)); setSimulationRunning(true);}} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/50 accent-blue-500" />
                                    <p className="text-[9px] text-white/30 uppercase mt-2 font-mono leading-relaxed">Genera molti poligoni, ma usa il batching. Attento al Fill Rate della GPU!</p>
                                </div>
                            </div>

                            {/* V2 Test Scenarios */}
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-blue-400 mb-3 uppercase tracking-[0.2em] font-mono">📋 Scenari di Test v2</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Boss Fight", e: 1, p: 2000, desc: "1 boss + particelle" },
                                        { label: "20+ Nemici", e: 25, p: 500, desc: "Orda di nemici" },
                                        { label: "Mappa Piena", e: 50, p: 3000, desc: "Full-size stress" },
                                        { label: "Menu + UI", e: 0, p: 0, desc: "Solo interfaccia" },
                                    ].map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={() => { setEnemies(preset.e); setParticles(preset.p); setSimulationRunning(true); }}
                                            className="p-2 rounded-lg bg-black/30 border border-white/5 hover:border-blue-500/30 transition-colors text-left"
                                        >
                                            <span className="text-[10px] font-bold text-white block">{preset.label}</span>
                                            <span className="text-[9px] text-white/40">{preset.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`mt-8 p-4 rounded-xl border flex items-start gap-3 transition-colors ${allGood ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {allGood ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-black uppercase tracking-widest font-mono">Status Ottimizzazione</span>
                                    <span className="text-[10px] uppercase font-bold opacity-70">
                                        {allGood ? "I parametri rientrano nei limiti. Gioco fluido." : "Attenzione! Il gioco sta rallentando o usando troppa memoria. Riduci gli elementi a schermo."}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
