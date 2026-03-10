"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const HUD_TIPS = [
    "L'<strong>HUD</strong> (Heads-Up Display) è l'interfaccia che il giocatore vede sempre durante il gioco: mappa, salute, soldi, oggetti.",
    "Progetta l'interfaccia per essere <strong>chiara ma non invadente</strong>, lascia respiro al gioco.",
    "Dove metti la mini-mappa? Dove i punti vita? Trascina gli elementi per creare il tuo layout perfetto.",
    "Pensa anche a dove inserire il <strong>Log delle missioni</strong>, fondamentale nei giochi RPG.",
];

export default function HudPage() {
    const defaultLayout = {
        hp: { top: "5%", left: "5%" },
        minimap: { top: "5%", left: "80%" },
        inventory: { top: "85%", left: "20%" },
        quests: { top: "20%", left: "80%" },
        dialogue: { top: "80%", left: "50%" },
    };

    const [layout, setLayout] = useState<Record<string, { top: string, left: string }>>(defaultLayout);
    const [dragging, setDragging] = useState<string | null>(null);

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("alice_hud_layout"));
                if (s) setLayout(JSON.parse(s));
            } catch { }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(getStorageKey("alice_hud_layout"), JSON.stringify(layout));
        if (Object.keys(layout).length > 0) localStorage.setItem(getStorageKey("alice_hud"), "true");
    }, [layout]);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
        setDragging(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (!id) return;
        
        // Calculate percentages Relative to the drop container
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setLayout(prev => ({
            ...prev,
            [id]: { top: `${Math.max(0, Math.min(90, y))}%`, left: `${Math.max(0, Math.min(90, x))}%` }
        }));
        setDragging(null);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-fuchsia-400 font-bold">HUD & Menu</span>
                    </div>
                    <div className="mission-badge mb-2 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">🖥️ Nuova Missione</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">HUD & Layout</h1>
                    <p className="text-fuchsia-300/60 text-sm mt-1">Trascina gli elementi per progettare l&apos;interfaccia di gioco.</p>
                </div>
                <div className="flex gap-4 items-center shrink-0">
                    <button onClick={() => setLayout(defaultLayout)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:bg-white/10 text-xs font-bold transition-all">Reset Layout</button>
                    <Link href="/alice" className="btn-secondary text-sm">⬅ Alice Hub</Link>
                </div>
            </div>

            <div className="w-full max-w-6xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={HUD_TIPS} emoji="💻" />
            </div>

            <div className="w-full max-w-6xl slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="relative w-full aspect-video bg-[#050510] border-2 border-[#3b2d6e] rounded-3xl overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
                     onDragOver={handleDragOver}
                     onDrop={handleDrop}
                >
                    {/* Fake Background Game Scene */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542840410-3092f99611a3?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center pointer-events-none mix-blend-luminosity" />
                    
                    {/* Elements to Drag */}
                    <div 
                        draggable onDragStart={(e) => handleDragStart(e, "hp")}
                        style={{ ...layout.hp, position: "absolute", transform: dragging==="hp" ? "translate(-50%, -50%) scale(1.1)" : "translate(0, 0)" }}
                        className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded-xl backdrop-blur-md cursor-grab active:cursor-grabbing font-bold flex flex-col shadow-xl"
                    >
                        <span className="text-[10px] text-red-300 uppercase shrink">HP / MP</span>
                        ❤️ 100/100
                    </div>

                    <div 
                        draggable onDragStart={(e) => handleDragStart(e, "minimap")}
                        style={{ ...layout.minimap, position: "absolute", transform: dragging==="minimap" ? "translate(-50%, -50%) scale(1.1)" : "translate(0, 0)" }}
                        className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-100 w-32 h-32 rounded-full backdrop-blur-md cursor-grab active:cursor-grabbing font-bold flex flex-col items-center justify-center shadow-xl"
                    >
                        🗺️ Minimappa
                    </div>

                    <div 
                        draggable onDragStart={(e) => handleDragStart(e, "inventory")}
                        style={{ ...layout.inventory, position: "absolute", transform: dragging==="inventory" ? "translate(-50%, -50%) scale(1.1)" : "translate(0, 0)" }}
                        className="bg-amber-500/20 border border-amber-500/50 text-amber-100 px-6 py-3 rounded-xl backdrop-blur-md cursor-grab active:cursor-grabbing font-bold flex gap-2 shadow-xl"
                    >
                        <div className="w-8 h-8 rounded bg-black/40 border border-amber-500/30 flex items-center justify-center">🗡️</div>
                        <div className="w-8 h-8 rounded bg-black/40 border border-amber-500/30 flex items-center justify-center">🧪</div>
                        <div className="w-8 h-8 rounded bg-black/40 border border-amber-500/30 flex items-center justify-center">🔑</div>
                    </div>

                    <div 
                        draggable onDragStart={(e) => handleDragStart(e, "quests")}
                        style={{ ...layout.quests, position: "absolute", transform: dragging==="quests" ? "translate(-50%, -50%) scale(1.1)" : "translate(0, 0)" }}
                        className="bg-blue-500/20 border border-blue-500/50 text-blue-100 px-4 py-3 rounded-xl backdrop-blur-md cursor-grab active:cursor-grabbing text-sm flex flex-col gap-1 shadow-xl"
                    >
                        <span className="font-bold border-b border-blue-500/30 pb-1 mb-1">📜 Missioni</span>
                        <span className="text-white/70">✓ Trova il fabbro</span>
                        <span className="text-blue-300">○ Sconfiggi i Goblin 0/5</span>
                    </div>

                    <div 
                        draggable onDragStart={(e) => handleDragStart(e, "dialogue")}
                        style={{ ...layout.dialogue, position: "absolute", transform: "translateX(-50%)", top: layout.dialogue.top, left: layout.dialogue.left }}
                        className="bg-purple-900/60 border border-purple-500/50 text-purple-100 px-6 py-4 rounded-xl backdrop-blur-md cursor-grab active:cursor-grabbing text-center shadow-xl w-3/4 max-w-2xl"
                    >
                        &quot;Eroe, abbiamo bisogno del tuo aiuto! I mostri stanno attaccando il villaggio.&quot;
                    </div>

                </div>
            </div>
        </div>
    );
}
