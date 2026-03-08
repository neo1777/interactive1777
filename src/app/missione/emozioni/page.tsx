"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MiniCanvas = dynamic(() => import("@/components/MiniCanvas"), { ssr: false });
import DidacticTooltip from "@/components/DidacticUI";

const EMOTIONS_TIPS = [
    "Le <strong>espressioni facciali</strong> comunicano subito come si sente il personaggio!",
    "Esagera un po' i tratti: occhi grandi per la sorpresa, sopracciglia basse per la rabbia.",
    "Il colore può aiutare: un po' di rossore sulle guance per la felicità o il freddo!",
    "Pensa a quando queste facce appariranno nel gioco... forse durante un dialogo importante?",
];

const EMOTIONS = [
    { key: "happy", label: "Felice", emoji: "😊" },
    { key: "sad", label: "Triste", emoji: "😢" },
    { key: "angry", label: "Arrabbiato", emoji: "😠" },
    { key: "surprised", label: "Sorpreso", emoji: "😲" },
];

export default function EmozioniPage() {
    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            {/* Header */}
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-emerald-400 font-bold">Emozioni</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">😀 Missione Bonus</div>
                    <h1 className="text-4xl font-black glow-text text-white">Le Emozioni</h1>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0">⬅ Alice Hub</Link>
            </div>

            <div className="w-full max-w-6xl mb-6 slide-up">
                <DidacticTooltip tips={EMOTIONS_TIPS} emoji="😊" />
            </div>

            {/* Hero Emotions */}
            <div className="w-full max-w-6xl space-y-6 mb-12">
                <div className="quest-card p-6">
                    <h2 className="text-xl font-bold text-white mb-1">🦸 Faccia dell&apos;EROE in 4 emozioni</h2>
                    <p className="text-emerald-300 text-sm mb-6">Disegna la faccia del tuo eroe per ogni emozione</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {EMOTIONS.map(em => (
                            <div key={em.key} className="flex flex-col items-center gap-2">
                                <div className="text-3xl">{em.emoji}</div>
                                <MiniCanvas storageKey={`iq_emo_hero_${em.key}`} label={em.label} width={200} height={200} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* NPC Friend Emotions */}
            <div className="w-full max-w-6xl space-y-6">
                <div className="quest-card p-6">
                    <h2 className="text-xl font-bold text-white mb-1">🧝 Faccia di un NPC AMICO in 4 emozioni</h2>
                    <p className="text-emerald-300 text-sm mb-6">Disegna la faccia di un amico del villaggio per ogni emozione</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {EMOTIONS.map(em => (
                            <div key={em.key} className="flex flex-col items-center gap-2">
                                <div className="text-3xl">{em.emoji}</div>
                                <MiniCanvas storageKey={`iq_emo_npc_${em.key}`} label={em.label} width={200} height={200} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final reminder */}
            <div className="w-full max-w-6xl mt-8 quest-card p-6 text-center border-emerald-500/20">
                <div className="text-5xl mb-4">🌟</div>
                <p className="text-lg font-bold text-white">Ricorda!</p>
                <p className="text-emerald-300">Tutto quello che disegni qui finirà <strong className="text-white">DENTRO il videogioco!</strong></p>
                <p className="text-emerald-300">Quando giocherai, vedrai i <strong className="text-emerald-400">TUOI</strong> personaggi muoversi nella <strong className="text-emerald-400">TUA</strong> mappa con i <strong className="text-emerald-400">TUOI</strong> oggetti.</p>
                <p className="text-emerald-200 mt-2 font-bold">Sei la persona più importante del team! ✨</p>
            </div>
        </div>
    );
}
