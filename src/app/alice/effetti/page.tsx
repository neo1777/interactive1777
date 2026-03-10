"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const MiniCanvas = dynamic(() => import("@/components/MiniCanvas"), { ssr: false });

const EFFECTS = [
    { key: "water", label: "Acqua", emoji: "💧", hint: "Scintillio sulla superficie, onde, increspature.", color: "text-blue-400" },
    { key: "fog", label: "Nebbia", emoji: "🌫️", hint: "Vapore, nuvole basse, oscurità.", color: "text-gray-400" },
    { key: "light", label: "Illuminazione", emoji: "☀️", hint: "Giorno, notte, tramonto, luce magica.", color: "text-amber-400" },
    { key: "magic", label: "Magia", emoji: "✨", hint: "Esplosioni, scintille, aure di forza.", color: "text-fuchsia-400" },
];

const EFFECT_TIPS = [
    "Gli <strong>Effetti Visivi (VFX)</strong> rendono il gioco vivo! Passare dalla grafica statica a quella dinamica.",
    "L'<strong>Illuminazione</strong> cambia l'atmosfera: il bosco di giorno è sicuro, di notte fa paura.",
    "La <strong>Nebbia</strong> serve per nascondere parti della mappa o per creare tensione in un dungeon.",
    "L'<strong>Acqua</strong> non è solo un colore blu, ma ha riflessi, onde e increspature che si muovono.",
    "I <strong>Particle Effects</strong> (Magia) sono scintille, fuoco ed esplosioni creati da tanti piccoli quadratini luminosi.",
];

export default function EffettiPage() {
    const [notes, setNotes] = useState<{ [key: string]: string }>({
        water: "", fog: "", light: "", magic: ""
    });

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("alice_effetti_notes"));
                if (s) setNotes(JSON.parse(s));
            } catch { }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(getStorageKey("alice_effetti_notes"), JSON.stringify(notes));
        
        // Mark mission as complete if any canvas or note is filled
        if (Object.values(notes).some(n => n.length > 0)) {
            localStorage.setItem(getStorageKey("alice_effetti"), "true");
        }
    }, [notes]);

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-cyan-400 font-bold">Effetti Visivi</span>
                    </div>
                    <div className="mission-badge mb-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">✨ Nuova Missione</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">Effetti Visivi (VFX)</h1>
                    <p className="text-cyan-300/60 text-sm mt-1">Acqua, nebbia, illuminazione, magia: dai vita al mondo!</p>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0">⬅ Alice Hub</Link>
            </div>

            <div className="w-full max-w-6xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={EFFECT_TIPS} emoji="🌟" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 slide-up" style={{ animationDelay: "0.15s" }}>
                {EFFECTS.map((eff) => (
                    <div key={eff.key} className="quest-card p-5 flex gap-6 mt-4">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <h3 className={`text-xl font-bold ${eff.color} flex items-center gap-2`}>{eff.emoji} {eff.label}</h3>
                            <MiniCanvas storageKey={`alice_vfx_${eff.key}`} label="Design" width={180} height={180} />
                        </div>
                        <div className="flex flex-col w-full gap-2 justify-center">
                            <p className="text-white/60 text-sm mb-2">{eff.hint}</p>
                            <label className="text-xs font-bold text-cyan-300/80 uppercase tracking-widest">Come si comporterà nel gioco?</label>
                            <textarea
                                className="quest-input h-full min-h-[100px] resize-none focus:border-cyan-500/50"
                                placeholder={`Descrivi l'animazione o la logica del tuo effetto ${eff.label}...`}
                                value={notes[eff.key]}
                                onChange={(e) => setNotes({ ...notes, [eff.key]: e.target.value })}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
