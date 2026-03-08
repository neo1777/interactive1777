"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const MiniCanvas = dynamic(() => import("@/components/MiniCanvas"), { ssr: false });

const ITEM_TYPES = [
    { id: "arma", label: "⚔️ Arma" },
    { id: "armatura", label: "🛡️ Armatura" },
    { id: "pozione", label: "🧪 Pozione" },
    { id: "chiave", label: "🔑 Chiave" },
    { id: "altro", label: "✨ Altro" },
];

type GameItem = {
    name: string;
    type: string;
    description: string;
    rarity: number;
};

const defaultItems: GameItem[] = Array.from({ length: 8 }, () => ({
    name: "", type: "", description: "", rarity: 0,
}));

const ITEM_TIPS = [
    "Ogni oggetto nel gioco ha <strong>uno scopo preciso</strong>: combattere, proteggersi, curarsi, aprire cose o qualcosa di speciale!",
    "La <strong>rarità</strong> (⭐) determina quanto è difficile trovare l'oggetto — 5 stelle = leggendario!",
    "Nei giochi RPG famosi, gli oggetti seguono una <strong>progressione</strong>: spada di legno → di ferro → magica → leggendaria.",
    "Pensa anche agli <strong>oggetti consumabili</strong>: pozioni, cibo, pergamene... si usano una volta e poi spariscono!",
    "Un buon <strong>sistema di loot</strong> premia il giocatore con oggetti sempre migliori mano a mano che avanza nel gioco.",
];

export default function OggettiPage() {
    const [items, setItems] = useState<GameItem[]>(defaultItems);

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("iq_items")); if (s) setItems(JSON.parse(s)); } catch { } }); }, []);

    useEffect(() => { localStorage.setItem(getStorageKey("iq_items"), JSON.stringify(items)); }, [items]);

    const updateItem = (i: number, field: keyof GameItem, value: string | number) => {
        const copy = [...items];
        copy[i] = { ...copy[i], [field]: value };
        setItems(copy);
    };

    const filledCount = items.filter(it => it.name.length > 0).length;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            {/* Header */}
            <div className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-emerald-400 font-bold">Oggetti</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🎁 Missione 2</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">Gli Oggetti del Gioco</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">L&apos;eroe raccoglie oggetti: spade, pozioni, chiavi, armature, cibo...</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-400 text-sm font-bold">{filledCount}/8</span>
                        <span className="text-emerald-300/50 text-xs">oggetti creati</span>
                    </div>
                    <Link href="/alice" className="btn-secondary text-sm">⬅ Alice Hub</Link>
                </div>
            </div>

            {/* Didactic Tooltip */}
            <div className="w-full max-w-7xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={ITEM_TIPS} emoji="🎒" />
            </div>

            {/* Example Panel */}
            <div className="w-full max-w-7xl mb-4 slide-up" style={{ animationDelay: "0.1s" }}>
                <ExamplePanel title="🗡️ Esempio: gli oggetti base di un gioco RPG"
                    imageSrc="/assets/rpg_items_guide.png"
                    imageAlt="Esempio oggetti RPG — spada, pozione, scudo, chiave, libro, forziere">
                    <p>In un gioco RPG classico, gli oggetti si dividono in categorie: <strong>armi</strong> (per attaccare), <strong>armature</strong> (per difendersi), <strong>pozioni</strong> (per curarsi), <strong>chiavi</strong> (per aprire passaggi), e <strong>oggetti speciali</strong>. Ogni oggetto ha una <strong>rarità</strong> diversa!</p>
                </ExamplePanel>
            </div>

            {/* Items Grid */}
            <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 slide-up" style={{ animationDelay: "0.15s" }}>
                {items.map((item, i) => (
                    <div key={i} className="quest-card p-4 flex flex-col gap-3 hover:border-emerald-500/30 transition-colors">
                        <h3 className="text-sm font-bold text-emerald-400 text-center flex items-center justify-center gap-2">
                            {item.type ? ITEM_TYPES.find(t => t.id === item.type)?.label?.split(" ")[0] : "🎁"} Oggetto #{i + 1}
                            {item.name && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">✓</span>}
                        </h3>

                        <MiniCanvas storageKey={`iq_item_${i}`} width={200} height={180} />

                        <input className="quest-input text-sm" placeholder="Nome dell'oggetto..."
                            value={item.name} onChange={e => updateItem(i, "name", e.target.value)} />

                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {ITEM_TYPES.map(t => (
                                <button key={t.id} onClick={() => updateItem(i, "type", t.id)}
                                    className={`type-chip text-[10px] py-1 px-2 ${item.type === t.id ? "active" : ""}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <input className="quest-input text-sm" placeholder="Cosa fa?"
                            value={item.description} onChange={e => updateItem(i, "description", e.target.value)} />

                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => updateItem(i, "rarity", s)}
                                    className={`text-2xl transition-transform hover:scale-125 ${item.rarity >= s ? "drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "opacity-30"}`}>
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
