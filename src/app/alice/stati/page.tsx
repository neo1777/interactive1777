"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const MiniCanvas = dynamic(() => import("@/components/MiniCanvas"), { ssr: false });

const STATUS_EFFECTS = [
    { key: "poison", label: "Veleno", emoji: "☠️", hint: "Verde, bolle, malessere", color: "text-green-400" },
    { key: "burn", label: "Fuoco", emoji: "🔥", hint: "Fiamme rosse/arancioni", color: "text-red-400" },
    { key: "freeze", label: "Gelo", emoji: "❄️", hint: "Ghiaccio azzurro, brividi", color: "text-blue-400" },
    { key: "paralyze", label: "Paralisi", emoji: "⚡", hint: "Scosse gialle, immobilità", color: "text-yellow-400" },
    { key: "bless", label: "Benedizione", emoji: "✨", hint: "Luce dorata, guarigione", color: "text-amber-400" },
    { key: "curse", label: "Maledizione", emoji: "👁️", hint: "Aura viola scuro, paura", color: "text-purple-400" },
    { key: "buff", label: "Potenziamento", emoji: "💪", hint: "Aura rossa ascendente, forza", color: "text-rose-400" },
    { key: "custom", label: "Status Segreto", emoji: "❓", hint: "Inventa un nuovo malus o bonus!", color: "text-emerald-400" },
];

const STATUS_TIPS = [
    "I <strong>Status Effects</strong> (Alterazioni di Stato) cambiano le regole del combattimento: tolgono vita nel tempo o bloccano l'eroe.",
    "L'icona deve essere <strong>piccola ma iper-riconoscibile</strong> perché apparirà sopra la testa del personaggio o vicino alla barra vitale.",
    "Usa <strong>colori molto forti</strong>: Verde per veleno, Rosso/Arancio per fuoco, Azzurro per gelo.",
    "I <strong>Buff</strong> (effetti positivi) e i <strong>Debuff</strong> (effetti negativi) rendono le battaglie più strategiche!",
];

export default function StatiPage() {
    const [names, setNames] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("alice_stati_names"));
                if (s) setNames(JSON.parse(s));
            } catch { }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(getStorageKey("alice_stati_names"), JSON.stringify(names));
        
        // Mark mission as complete if any custom name is filled
        if (Object.keys(names).length > 0) {
            localStorage.setItem(getStorageKey("alice_stati"), "true");
        }
    }, [names]);

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-rose-400 font-bold">Status Effects</span>
                    </div>
                    <div className="mission-badge mb-2 bg-rose-500/20 text-rose-400 border border-rose-500/30">💀 Nuova Missione</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">Status Effects</h1>
                    <p className="text-rose-300/60 text-sm mt-1">Disegna le icone per le alterazioni di stato. Attento al veleno!</p>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0">⬅ Alice Hub</Link>
            </div>

            <div className="w-full max-w-6xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={STATUS_TIPS} emoji="🧪" />
            </div>

            <div className="w-full max-w-6xl mb-6 slide-up" style={{ animationDelay: "0.1s" }}>
                <ExamplePanel title="⚠️ Esempio: le icone degli status"
                    imageSrc="/assets/status_effects_guide.png"
                    imageAlt="Esempio di icone di status: veleno, fuoco, sonno, paralisi">
                    <p>Nei giochi di ruolo come Final Fantasy o Pokémon, le icone degli status raccontano al giocatore cosa sta succedendo al personaggio senza bisogno di testo.</p>
                </ExamplePanel>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 slide-up" style={{ animationDelay: "0.15s" }}>
                {STATUS_EFFECTS.map((status) => (
                    <div key={status.key} className="quest-card p-4 flex flex-col items-center gap-3">
                        <h3 className={`text-sm font-bold ${status.color} flex items-center gap-2 uppercase tracking-wide`}>
                            {status.emoji} {status.label}
                        </h3>
                        <p className="text-[10px] text-white/40 text-center h-8 leading-tight">{status.hint}</p>
                        
                        <MiniCanvas storageKey={`alice_status_${status.key}`} width={120} height={120} />
                        
                        {status.key === "custom" && (
                            <input
                                className="quest-input text-xs text-center mt-2 focus:border-emerald-500/50"
                                placeholder="Nome dello status..."
                                value={names[status.key] || ""}
                                onChange={(e) => setNames({ ...names, [status.key]: e.target.value })}
                            />
                        )}
                        {(status.key === "buff" || status.key === "curse") && (
                            <input
                                className="quest-input text-xs text-center mt-2 focus:border-purple-500/50"
                                placeholder="Es. Forza Rigenerante"
                                value={names[status.key] || ""}
                                onChange={(e) => setNames({ ...names, [status.key]: e.target.value })}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
