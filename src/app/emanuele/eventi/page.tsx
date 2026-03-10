"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel } from "@/components/DidacticUI";

const EVENTS_TIPS = [
    "Gli <strong>Eventi</strong> sono ciò che succede quando il giocatore fa qualcosa. Premere un interruttore apre una porta.",
    "Si dividono in: <strong>Trigger</strong> (la causa, es. 'Se il giocatore entra nella zona') e <strong>Azione</strong> (l'effetto, es. 'Mostra il testo: Attento!').",
    "Pensa a eventi semplici: parlare con un NPC, raccogliere una moneta, far apparire un mostro.",
    "Un gioco senza eventi è solo un paesaggio da guardare. Gli eventi lo rendono interattivo!",
];

const TRIGGER_TYPES = ["Interazione (Tasto A) ⏺️", "Collisione (Ci cammini sopra) 👣", "Tempo (Dopo 5 secondi) ⏱️", "Condizione (Hai la chiave?) 🔑"];
const ACTION_TYPES = ["Mostra Testo 💬", "Cambia Stanza/Mappa 🚪", "Dai Oggetto 🎁", "Appare Nemico 👾", "Suona Effetto Audio 🎵"];

export default function EventiPage() {
    const defaultEvents = [
        { name: "NPC del Villaggio", trigger: TRIGGER_TYPES[0], action: ACTION_TYPES[0], details: "Dice: 'Benvenuto eroe!'" },
        { name: "Trappola Nascosta", trigger: TRIGGER_TYPES[1], action: ACTION_TYPES[3], details: "Spawna 3 Goblin di livello 5" },
        { name: "Porta Chiusa", trigger: TRIGGER_TYPES[3], action: ACTION_TYPES[1], details: "Se hai 'Chiave Ruggine', vai alla Mappa 2" }
    ];

    const [events, setEvents] = useState(defaultEvents);

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("gd_eventi_lista"));
                if (s) setEvents(JSON.parse(s));
            } catch { }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(getStorageKey("gd_eventi_lista"), JSON.stringify(events));
        
        // Mark mission as complete
        localStorage.setItem(getStorageKey("emanuele_eventi"), "true");
    }, [events]);

    const addEvent = () => setEvents([...events, { name: "Nuovo Evento", trigger: TRIGGER_TYPES[0], action: ACTION_TYPES[0], details: "" }]);
    const removeEvent = (index: number) => setEvents(events.filter((_, i) => i !== index));
    const updateEvent = (index: number, key: string, value: string) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [key]: value };
        setEvents(newEvents);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/emanuele">Emanuele</Link>
                        <span className="separator">›</span>
                        <span className="text-emerald-400 font-bold">Eventi di Gioco</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">📜 Nuova Missione</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">Eventi di Gioco</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">Crea cause ed effetti per rendere il mondo vivo.</p>
                </div>
                <Link href="/emanuele" className="btn-secondary text-sm shrink-0">⬅ Hub</Link>
            </div>

            <div className="w-full max-w-5xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={EVENTS_TIPS} emoji="⚙️" />
            </div>

            <div className="w-full max-w-5xl mb-6 slide-up" style={{ animationDelay: "0.1s" }}>
                <button onClick={addEvent} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                    <span className="text-xl">+</span> Aggiungi Nuovo Evento
                </button>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 slide-up" style={{ animationDelay: "0.15s" }}>
                {events.map((ev, i) => (
                    <div key={i} className="quest-card p-5 relative">
                        <button onClick={() => removeEvent(i)} className="absolute top-3 right-3 text-red-400/50 hover:text-red-400 transition-colors">✖</button>
                        
                        <input 
                            className="bg-transparent text-white font-bold text-lg w-full outline-none border-b border-white/10 focus:border-emerald-500/50 pb-1 mb-4 placeholder:text-white/20" 
                            value={ev.name} 
                            onChange={(e) => updateEvent(i, "name", e.target.value)}
                            placeholder="Nome dell'Evento..."
                        />

                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">Quando succede? (Trigger)</label>
                                <select 
                                    className="quest-input w-full appearance-none"
                                    value={ev.trigger}
                                    onChange={(e) => updateEvent(i, "trigger", e.target.value)}
                                >
                                    {TRIGGER_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-center my-[-8px] text-white/20">↓</div>

                            <div>
                                <label className="text-xs text-rose-400 font-bold uppercase tracking-wider block mb-1">Cosa succede? (Azione)</label>
                                <select 
                                    className="quest-input w-full appearance-none border-rose-500/30 focus:border-rose-500/50"
                                    value={ev.action}
                                    onChange={(e) => updateEvent(i, "action", e.target.value)}
                                >
                                    {ACTION_TYPES.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
                                </select>
                            </div>

                            <div className="mt-2">
                                <label className="text-xs text-white/50 font-bold uppercase tracking-wider block mb-1">Dettagli Azione</label>
                                <textarea 
                                    className="quest-input w-full h-20 resize-none text-sm"
                                    placeholder="Es. Il baule si apre e ricevi Spada di Legno..."
                                    value={ev.details}
                                    onChange={(e) => updateEvent(i, "details", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
