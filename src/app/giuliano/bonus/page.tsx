"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Puzzle, FileQuestion, ArrowLeft, RotateCcw, Trophy, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

/* Isometric puzzle: arrange tiles to form a scene */
const PUZZLE_TILES = ["🌲", "💧", "🏠", "⛰️", "🌾", "🔥", "🏰", "🌊", "🪨"];
const TARGET = [
    ["⛰️", "🌲", "🌲"],
    ["🌲", "🏠", "🌾"],
    ["💧", "🌾", "🏰"],
];

const NAMING_QUIZ = [
    { q: "Come si chiama lo sprite dell'eroe che cammina verso il basso?", options: ["eroe_giu.png", "hero_walk_down.png", "personaggio_basso.bmp", "walk.png"], answer: 1 },
    { q: "Quale formato è corretto per una tile?", options: ["tile erba.jpg", "TILE_GRASS.PNG", "tile_grass.png", "grass tile.gif"], answer: 2 },
    { q: "Come si chiama la mappa del villaggio?", options: ["mappa1.tmx", "village_01.tmx", "villaggio.txt", "map_village.json"], answer: 1 },
    { q: "Qual è la dimensione corretta per una tile isometrica?", options: ["64×64 pixel", "32×32 pixel", "64×32 pixel", "100×50 pixel"], answer: 2 },
    { q: "Dove salvi tutti gli asset del gioco?", options: ["Sul desktop", "Nella cartella assets/", "In Documenti", "Li mandi per email"], answer: 1 },
    { q: "Il rapporto corretto per una tile isometrica è:", options: ["1:1", "3:2", "2:1", "4:3"], answer: 2 },
];

export default function BonusPage() {
    // Puzzle state
    const [grid, setGrid] = useState<string[][]>(Array.from({ length: 3 }, () => Array(3).fill("")));
    const [inventory, setInventory] = useState([...PUZZLE_TILES]);
    const [selected, setSelected] = useState<string | null>(null);
    const [puzzleSolved, setPuzzleSolved] = useState(false);

    // Quiz state
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    const placeOnGrid = (r: number, c: number) => {
        if (!selected || grid[r][c]) return;
        const ng = grid.map(row => [...row]);
        ng[r][c] = selected;
        setGrid(ng);
        setInventory(prev => { const idx = prev.indexOf(selected); const ni = [...prev]; ni.splice(idx, 1); return ni; });
        setSelected(null);
        // Check solved
        const match = TARGET.every((row, ri) => row.every((cell, ci) => ng[ri][ci] === cell));
        if (match) setPuzzleSolved(true);
    };

    const removeFromGrid = (r: number, c: number) => {
        if (!grid[r][c]) return;
        setInventory(prev => [...prev, grid[r][c]]);
        const ng = grid.map(row => [...row]);
        ng[r][c] = "";
        setGrid(ng);
        setPuzzleSolved(false);
    };

    const answerQuiz = (idx: number) => {
        const correct = idx === NAMING_QUIZ[quizIdx].answer;
        const ns = quizScore + (correct ? 1 : 0);
        setQuizScore(ns);
        if (quizIdx + 1 >= NAMING_QUIZ.length) setQuizDone(true);
        else setQuizIdx(quizIdx + 1);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-8 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            Bonus Content
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight leading-none uppercase font-mono">Sfida <span className="text-emerald-400">Isometrica</span></h1>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Giuliano Hub
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Puzzle */}
                    <div className="quest-card p-8 border-emerald-500/20">
                        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide flex items-center gap-3 font-mono">
                            <Puzzle className="text-emerald-400 w-6 h-6" />
                            Scene Builder
                        </h2>
                        <p className="text-xs text-emerald-100/30 mb-8 border-l-2 border-emerald-500/30 pl-3">Trascina e posiziona le tile per ricreare il paesaggio perfetto.</p>

                        {/* Target */}
                        <div className="mb-3 text-center">
                            <div className="text-xs text-emerald-400/60 mb-1 font-mono uppercase tracking-widest">🎯 Obiettivo</div>
                            <div className="inline-grid grid-cols-3 gap-1 p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
                                {TARGET.flat().map((t, i) => (
                                    <div key={i} className="w-10 h-10 flex items-center justify-center text-xl bg-emerald-500/10 rounded border border-emerald-500/5">{t}</div>
                                ))}
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex justify-center mb-4">
                            <div className="inline-grid grid-cols-3 gap-2">
                                {grid.map((row, r) => row.map((cell, c) => (
                                    <button key={`${r}-${c}`}
                                        onClick={() => cell ? removeFromGrid(r, c) : placeOnGrid(r, c)}
                                        className={`w-16 h-16 rounded-xl border-2 text-2xl flex items-center justify-center transition-all ${cell
                                            ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg"
                                            : selected
                                                ? "border-dashed border-emerald-500/40 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10"
                                                : "border-white/10 bg-white/5"}`}>
                                        {cell || ""}
                                    </button>
                                )))}
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {inventory.map((tile, i) => (
                                <button key={i} onClick={() => setSelected(tile === selected ? null : tile)}
                                    className={`w-12 h-12 rounded-lg border-2 text-xl flex items-center justify-center transition-all ${selected === tile
                                        ? "border-emerald-400 bg-emerald-500/20 scale-110 shadow-lg shadow-emerald-500/20"
                                        : "border-white/10 bg-white/5 hover:border-emerald-500/50"}`}>
                                    {tile}
                                </button>
                            ))}
                        </div>

                        {puzzleSolved && (
                            <div className="mt-4 text-center p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold animate-pulse">
                                🏆 Perfetto! Scena completata!
                            </div>
                        )}
                    </div>

                    {/* Naming Quiz */}
                    <div className="quest-card p-8 border-emerald-500/20">
                        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide flex items-center gap-3 font-mono">
                            <FileQuestion className="text-emerald-400 w-6 h-6" />
                            Naming Master
                        </h2>
                        <p className="text-xs text-emerald-100/30 mb-8 border-l-2 border-emerald-500/30 pl-3">Verifica la tua conoscenza delle naming convention del progetto.</p>

                        {!quizDone ? (
                            <>
                                <div className="text-xs text-emerald-400 mb-1 font-mono uppercase tracking-[0.2em]">Domanda {quizIdx + 1}/{NAMING_QUIZ.length}</div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
                                    <div className="progress-bar h-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${(quizIdx / NAMING_QUIZ.length) * 100}%` }} />
                                </div>
                                <p className="text-white font-bold mb-4 text-sm">{NAMING_QUIZ[quizIdx].q}</p>
                                <div className="space-y-2">
                                    {NAMING_QUIZ[quizIdx].options.map((opt, i) => (
                                        <button key={i} onClick={() => answerQuiz(i)}
                                            className="w-full text-left px-4 py-4 rounded-xl border border-white/10 bg-white/5 text-emerald-50 text-xs font-mono hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all font-mono">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                    {quizScore >= 5 ? <Trophy className="w-12 h-12 text-yellow-500" /> : <Star className="w-12 h-12 text-purple-400" />}
                                </div>
                                <h3 className="text-4xl font-black text-white mb-1 tracking-tighter">{quizScore} / {NAMING_QUIZ.length}</h3>
                                <p className="text-purple-300/40 text-[10px] font-black uppercase tracking-widest mb-8">{quizScore >= 5 ? "Naming Convention Master!" : "Puoi fare di meglio!"}</p>
                                <button onClick={() => { setQuizIdx(0); setQuizScore(0); setQuizDone(false); }} className="btn-secondary px-8 py-3 rounded-2xl border-white/5 hover:border-purple-500/40 hover:text-white transition-all flex items-center gap-2 mx-auto uppercase text-[10px] font-black tracking-widest">
                                    <RotateCcw className="w-4 h-4" />
                                    Riprova Quiz
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
