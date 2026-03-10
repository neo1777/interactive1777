"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const SAVE_TIPS = [
    "Il sistema di <strong>Salvataggio</strong> è cruciale: perdere ore di gioco fa arrabbiare chiunque!",
    "Puoi salvare <strong>tutto</strong> (posizione, hp, inventario, missioni completate, eventi passati).",
    "<strong>Autosave</strong>: salva da solo a intervalli o dopo eventi chiave (es. batti un boss).",
    "<strong>Save Point</strong>: cristalli o falò dove il giocatore deve fermarsi per salvare (crea tensione in un dungeon!).",
    "Cosa salvare? Immagina un file JSON che contiene tutti i dati del tuo Eroe.",
];

export default function SalvataggioPage() {
    const defaultData = {
        saveType: "Autosave 🔄",
        saveLocations: "Ovunque",
        dataToSave: [
            { key: "hp", label: "Punti Vita", enabled: true },
            { key: "inventory", label: "Inventario", enabled: true },
            { key: "position", label: "Posizione Mappa", enabled: true },
            { key: "quests", label: "Missioni Completate", enabled: true },
            { key: "time", label: "Tempo di Gioco", enabled: false },
            { key: "stats", label: "Statistiche RPG", enabled: true },
        ]
    };

    const [saveSystem, setSaveSystem] = useState(defaultData);

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("gd_salvataggio"));
                if (s) setSaveSystem(JSON.parse(s));
            } catch { }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(getStorageKey("gd_salvataggio"), JSON.stringify(saveSystem));
        
        // Mark mission as complete if they interacted
        localStorage.setItem(getStorageKey("emanuele_salvataggio"), "true");
    }, [saveSystem]);

    const toggleData = (index: number) => {
        const newData = [...saveSystem.dataToSave];
        newData[index].enabled = !newData[index].enabled;
        setSaveSystem({ ...saveSystem, dataToSave: newData });
    };

    const generateJsonPreview = () => {
        const preview: any = {
            "heroName": "Eroe",
            "level": 15,
        };
        saveSystem.dataToSave.forEach(d => {
            if (d.enabled) {
                if (d.key === "hp") preview.hp = 120;
                if (d.key === "inventory") preview.inventory = ["Spada Lunga", "Pozione x5"];
                if (d.key === "position") preview.position = { x: 45, y: 120, map: "Foresta" };
                if (d.key === "quests") preview.quests = ["Tuturial Completato", "Re Trovato"];
                if (d.key === "time") preview.time = "14:32:10";
                if (d.key === "stats") preview.stats = { atk: 45, def: 30 };
            }
        });
        return JSON.stringify(preview, null, 2);
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
                        <span className="text-emerald-400 font-bold">Salvataggio</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">💾 Nuova Missione</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">Sistema di Salvataggio</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">Scegli come e cosa salvare nella tua avventura.</p>
                </div>
                <Link href="/emanuele" className="btn-secondary text-sm shrink-0">⬅ Hub</Link>
            </div>

            <div className="w-full max-w-5xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={SAVE_TIPS} emoji="💾" />
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="flex flex-col gap-6">
                    <div className="quest-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">⚙️ Regole di Salvataggio</h2>
                        
                        <div className="mb-4">
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">Tipo di Salvataggio</label>
                            <div className="flex gap-2">
                                {["Autosave 🔄", "Manuale ✍️", "Entrambi 🔄✍️"].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setSaveSystem({ ...saveSystem, saveType: t })}
                                        className={`type-chip flex-1 ${saveSystem.saveType === t ? "active !border-emerald-500/50 !text-emerald-300" : ""}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">Dove si può salvare?</label>
                            <div className="flex gap-2">
                                {["Ovunque", "Solo nei Save Point", "Fine Livello"].map(l => (
                                    <button 
                                        key={l}
                                        onClick={() => setSaveSystem({ ...saveSystem, saveLocations: l })}
                                        className={`type-chip flex-1 ${saveSystem.saveLocations === l ? "active !border-emerald-500/50 !text-emerald-300" : ""}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="quest-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">📦 Cosa viene salvato?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {saveSystem.dataToSave.map((item, i) => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleData(i)}
                                    className={`px-3 py-2 rounded border text-sm flex items-center gap-2 transition-all text-left
                                        ${item.enabled ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : "bg-black/40 border-white/10 text-white/40 hover:bg-white/5"}
                                    `}
                                >
                                    <div className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border ${item.enabled ? "bg-emerald-500 border-emerald-400" : "border-white/20"}`}>
                                        {item.enabled && <span className="text-black text-[10px] font-bold">✓</span>}
                                    </div>
                                    <span className="truncate">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="quest-card p-6 flex flex-col h-full">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-4">
                        <span className="text-xl">📄</span> File di Salvataggio (Anteprima JSON)
                    </h2>
                    <p className="text-xs text-white/50 mb-4">Questo è il vero codice che il gioco userà per ricordare i progressi del giocatore. Si aggiorna mentre selezioni i dati a sinistra!</p>
                    
                    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex-1 overflow-auto font-mono text-sm shadow-inner relative group">
                        <div className="absolute top-2 right-2 text-xs text-slate-500 font-bold pointer-events-none group-hover:text-emerald-500/50 transition-colors">savegame_01.json</div>
                        <pre className="text-emerald-400">
                            {generateJsonPreview()}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
