"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { Palette, Pencil, Eraser, Trash2, CheckCircle2, Circle, ArrowLeft, Image as ImageIcon, Sparkles } from "lucide-react";

const SPRITE_TIPS = [
    "Ogni sprite è una <strong>immagine piccola</strong> (32×32 pixel) che rappresenta un personaggio o un oggetto nel gioco.",
    "L'<strong>animazione</strong> si crea disegnando più frame dello stesso sprite con piccole variazioni — come un cartone animato!",
    "Usa una <strong>palette limitata</strong> (pochi colori) per uno stile pixel art coerente e professionale.",
    "Il trucco per le <strong>walk animations</strong>: disegna 4 frame (gamba su, centro, gamba giù, centro).",
    "Per il <strong>Boss</strong> puoi usare un sprite più grande (64×64) per farlo sembrare più imponente!",
];

const PALETTE = ["#000000", "#ffffff", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
    "#6b7280", "#92400e", "#065f46", "#1e3a5f", "#fde68a", "#fca5a5", "#86efac", "#93c5fd"];

const SPRITES_LIST = [
    { key: "hero_idle", name: "Eroe — idle", size: 32, frames: 2, desc: "Leggero movimento breathing" },
    { key: "hero_walk_down", name: "Eroe — walk down", size: 32, frames: 4, desc: "Camminata verso il basso" },
    { key: "hero_walk_up", name: "Eroe — walk up", size: 32, frames: 4, desc: "Camminata verso l'alto" },
    { key: "hero_walk_left", name: "Eroe — walk left", size: 32, frames: 4, desc: "Walk right = flip orizzontale" },
    { key: "hero_attack", name: "Eroe — attack", size: 32, frames: 3, desc: "Animazione attacco" },
    { key: "hero_hurt", name: "Eroe — hurt", size: 32, frames: 2, desc: "Quando viene colpito" },
    { key: "hero_death", name: "Eroe — death", size: 32, frames: 3, desc: "Animazione sconfitta" },
    { key: "enemy_easy", name: "Nemico 1 (slime)", size: 32, frames: 2, desc: "Idle con bounce" },
    { key: "enemy_med", name: "Nemico 2 (goblin)", size: 32, frames: 2, desc: "Idle + walk opzionale" },
    { key: "boss", name: "Boss", size: 64, frames: 4, desc: "Più grande degli altri!" },
    { key: "npc_1", name: "NPC 1 (saggio)", size: 32, frames: 2, desc: "Il vecchio saggio del villaggio" },
    { key: "npc_2", name: "NPC 2 (mercante)", size: 32, frames: 2, desc: "Il negoziante" },
    { key: "npc_3", name: "NPC 3 (guardia)", size: 32, frames: 2, desc: "La guardia del villaggio" },
    { key: "tile_grass", name: "Tile erba", size: 32, frames: 1, desc: "Isometrico, rombo 64×32" },
    { key: "tile_dirt", name: "Tile terra", size: 32, frames: 1, desc: "Variazione colore dall'erba" },
    { key: "tile_water", name: "Tile acqua", size: 32, frames: 2, desc: "Animazione onda opzionale" },
    { key: "tile_stone", name: "Tile pietra", size: 32, frames: 1, desc: "Per il dungeon" },
    { key: "items", name: "Oggetti (forziere/pozione)", size: 16, frames: 2, desc: "Piccole icone inventory" },
];

export default function SpritesPage() {
    const [activeSprite, setActiveSprite] = useState(0);
    const [color, setColor] = useState("#000000");
    const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [grids, setGrids] = useState<Record<string, string>>({});
    const [animSettings, setAnimSettings] = useState<Record<string, { speed: number; loop: boolean }>>({});
    const gridSize = 32;
    const pixelSize = Math.min(16, Math.floor(400 / gridSize));

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("ld_sprites")); if (s) setGrids(JSON.parse(s)); const a = localStorage.getItem(getStorageKey("ld_sprites_anim")); if (a) setAnimSettings(JSON.parse(a)); } catch { } }); }, []);

    const save = useCallback((g: Record<string, string>) => localStorage.setItem(getStorageKey("ld_sprites"), JSON.stringify(g)), []);
    const saveAnim = useCallback((a: Record<string, { speed: number; loop: boolean }>) => { localStorage.setItem(getStorageKey("ld_sprites_anim"), JSON.stringify(a)); setAnimSettings(a); }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const key = SPRITES_LIST[activeSprite].key;
        if (grids[key]) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = grids[key];
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // draw grid lines
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath(); ctx.moveTo(i * pixelSize, 0); ctx.lineTo(i * pixelSize, gridSize * pixelSize); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i * pixelSize); ctx.lineTo(gridSize * pixelSize, i * pixelSize); ctx.stroke();
            }
        }
    }, [activeSprite, grids, pixelSize]);

    const paintPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;

        if (tool === "eraser") {
            ctx.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
        // Save
        const key = SPRITES_LIST[activeSprite].key;
        const ng = { ...grids, [key]: canvas.toDataURL() };
        setGrids(ng); save(ng);
    };

    const isDown = useRef(false);

    const activeData = SPRITES_LIST[activeSprite];
    const currentAnim = animSettings[activeData.key] || { speed: 8, loop: true };

    const updateAnim = (partial: Partial<{ speed: number; loop: boolean }>) => {
        const newData = { ...currentAnim, ...partial };
        saveAnim({ ...animSettings, [activeData.key]: newData });
    };

    const completed = Object.keys(grids).length;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-6xl">
                <div className="flex justify-between items-center mb-6 slide-up">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-[0.2em] uppercase w-fit shadow-xl">
                            <Palette className="w-3 h-3" />
                            Missione 3
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase font-mono">
                            PIXEL <span className="text-emerald-400">ART</span> SPRITES
                        </h1>
                        <div className="flex items-center gap-2 text-emerald-300/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 font-mono">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            {completed} / {SPRITES_LIST.length} SPRITES SYNCED
                        </div>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Giuliano Hub
                    </Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={SPRITE_TIPS} emoji="🎨" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sprite list */}
                    <div className="quest-card p-6 border-emerald-500/20 max-h-[600px] overflow-y-auto">
                        <h3 className="text-[10px] font-black text-white/40 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 font-mono border-b border-white/5 pb-4">
                            <ImageIcon className="text-emerald-400 w-4 h-4" />
                            REGISTRO SPRITE
                        </h3>
                        <div className="space-y-1">
                            {SPRITES_LIST.map((s, i) => (
                                <button key={s.key} onClick={() => setActiveSprite(i)}
                                    className={`w-full text-left p-4 rounded-xl text-xs transition-all duration-300 flex items-center gap-4 group/item border font-mono ${activeSprite === i
                                        ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)] border-emerald-500/30"
                                        : "hover:bg-white/5 text-white/40 hover:text-white/60 border-white/5"}`}>
                                    <div className="shrink-0 transition-transform group-hover/item:scale-110">
                                        {grids[s.key] ? <CheckCircle2 className={`w-5 h-5 ${activeSprite === i ? "text-black" : "text-emerald-400"}`} /> : <Circle className={`w-5 h-5 ${activeSprite === i ? "text-black/20" : "opacity-20"}`} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className={`font-black tracking-widest uppercase truncate max-w-[150px] text-[10px] ${activeSprite === i ? "text-black" : "text-white"}`}>{s.name}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mt-0.5 ${activeSprite === i ? "text-black/60" : "text-emerald-400/40"}`}>
                                            <span className="opacity-60">{s.size}×{s.size}</span>
                                            <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
                                            <span className="opacity-60">{s.frames} FRM</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="quest-card p-5">
                        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] font-mono">{activeData.name}</h3>
                            <span className="text-[10px] font-bold text-emerald-400/40 border border-emerald-400/10 px-3 py-1 rounded-full font-mono uppercase tracking-widest">{activeData.desc}</span>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-4 mb-8 flex-wrap">
                            <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit shadow-xl">
                                <button onClick={() => setTool("pencil")} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${tool === "pencil" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`} title="Matita">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => setTool("eraser")} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${tool === "eraser" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`} title="Gomma">
                                    <Eraser className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2 flex-wrap ml-2">
                                {PALETTE.map(c => (
                                    <button key={c} onClick={() => { setColor(c); setTool("pencil"); }}
                                        className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer shadow-lg hover:scale-110 ${color === c && tool === "pencil" ? "border-emerald-400 scale-110 shadow-emerald-500/20" : "border-white/5 hover:border-white/20"}`}
                                        style={{ background: c }} />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <canvas ref={canvasRef} width={gridSize * pixelSize} height={gridSize * pixelSize}
                                style={{ cursor: "crosshair", imageRendering: "pixelated", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                                onMouseDown={(e) => { isDown.current = true; paintPixel(e); }}
                                onMouseMove={(e) => { if (isDown.current) paintPixel(e); }}
                                onMouseUp={() => { isDown.current = false; }}
                                onMouseLeave={() => { isDown.current = false; }} />
                        </div>

                        {activeData.frames > 1 && (
                            <div className="mt-6 p-5 border border-white/5 rounded-2xl bg-black/20 flex flex-col gap-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Impostazioni Animazione ({activeData.frames} Frames)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4 block flex justify-between">
                                            <span>Velocità (FPS)</span>
                                            <span className="text-emerald-400">{currentAnim.speed}</span>
                                        </label>
                                        <input type="range" min="1" max="60" value={currentAnim.speed} onChange={(e) => updateAnim({ speed: parseInt(e.target.value) })} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-black focus:outline-none" style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentAnim.speed / 60) * 100}%, rgba(255,255,255,0.1) ${(currentAnim.speed / 60) * 100}%, rgba(255,255,255,0.1) 100%)` }} />
                                    </div>
                                    <div className="flex items-center sm:justify-end">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                                            <input type="checkbox" checked={currentAnim.loop} onChange={(e) => updateAnim({ loop: e.target.checked })} className="accent-emerald-500 w-4 h-4" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Ripeti In Loop</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-2 mt-6">
                            <button onClick={() => {
                                const canvas = canvasRef.current;
                                if (!canvas) return;
                                const ctx = canvas.getContext("2d");
                                if (!ctx) return;
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                const key = SPRITES_LIST[activeSprite].key;
                                const ng = { ...grids }; delete ng[key]; setGrids(ng); save(ng);
                            }} className="btn-secondary text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 py-3 px-6 rounded-2xl border-white/5 hover:border-red-500/50 hover:text-red-400 transition-all duration-300">
                                <Trash2 className="w-4 h-4" />
                                Cancella Sprite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
