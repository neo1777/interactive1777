"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const MULTIPLAY_TIPS = [
    "Il <strong>Multiplayer</strong> può essere Cooperativo (Co-op) o Competitivo (PvP).",
    "<strong>Asincrono</strong>: giocate insieme ma non nello stesso momento (es. scambiarsi oggetti, lasciare messaggi come in Dark Souls).",
    "<strong>Sincrono</strong>: giocate letteralmente insieme allo stesso tempo (es. battere un boss in due).",
    "L'infrastruttura di rete (Server) cambia completamente il codice di un gioco, decidilo subito all'inizio del progetto!",
];

const MODES = [
    { id: "coop", name: "Co-op Locale", desc: "Due giocatori sullo stesso schermo (split-screen o schermo condiviso).", icon: "🎮🎮" },
    { id: "online_coop", name: "Co-op Online", desc: "Giocatori in LAN o internet alleati per esplorare e sconfiggere nemici.", icon: "🌐🤝" },
    { id: "pvp", name: "PvP Arena", desc: "Sfide 1 contro 1 in arene o tornei.", icon: "⚔️🛡️" },
    { id: "asynchronous", name: "Asincrono", desc: "Messaggi, fantasmi dei pg morti, scambi di risorse al mercato globale.", icon: "👻✉️" },
];

const SOCIAL_FEATURES = [
    { id: "friends", name: "Lista Amici", desc: "Vedi chi è online e invita amici a giocare.", icon: "👥" },
    { id: "leaderboard", name: "Classifica Globale", desc: "Chi ha più punti? Sfida gli altri!", icon: "🏆" },
    { id: "chat", name: "Chat tra Giocatori", desc: "Comunica con altri giocatori in tempo reale.", icon: "💬" },
    { id: "trading", name: "Scambio Oggetti", desc: "Commercia armi, pozioni e risorse con altri.", icon: "🔄" },
    { id: "guilds", name: "Guild / Clan", desc: "Crea o unisciti a gruppi di giocatori.", icon: "🏰" },
];

export default function MultiplayerPage() {
    const [selectedModes, setSelectedModes] = useState<string[]>([]);
    const [serverNote, setServerNote] = useState("");
    const [socialFeatures, setSocialFeatures] = useState<string[]>([]);
    const [socialNote, setSocialNote] = useState("");

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("gd_multiplayer_modes"));
                if (s) setSelectedModes(JSON.parse(s));
                const n = localStorage.getItem(getStorageKey("gd_multiplayer_note"));
                if (n) setServerNote(n);
                const sf = localStorage.getItem(getStorageKey("gd_social_features"));
                if (sf) setSocialFeatures(JSON.parse(sf));
                const sn = localStorage.getItem(getStorageKey("gd_social_note"));
                if (sn) setSocialNote(sn);
            } catch { }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(getStorageKey("gd_multiplayer_modes"), JSON.stringify(selectedModes));
        localStorage.setItem(getStorageKey("gd_multiplayer_note"), serverNote);
        localStorage.setItem(getStorageKey("gd_social_features"), JSON.stringify(socialFeatures));
        localStorage.setItem(getStorageKey("gd_social_note"), socialNote);
        
        // Mark mission as complete
        if (selectedModes.length > 0) {
            localStorage.setItem(getStorageKey("emanuele_multiplayer"), "true");
        }
    }, [selectedModes, serverNote, socialFeatures, socialNote]);

    const toggleMode = (id: string) => {
        if (selectedModes.includes(id)) setSelectedModes(selectedModes.filter(m => m !== id));
        else setSelectedModes([...selectedModes, id]);
    };

    const toggleSocial = (id: string) => {
        if (socialFeatures.includes(id)) setSocialFeatures(socialFeatures.filter(f => f !== id));
        else setSocialFeatures([...socialFeatures, id]);
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
                        <span className="text-emerald-400 font-bold">Multiplayer</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🌐 Missione 8</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">Modalità Multiplayer</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">Scegli come far giocare più persone insieme.</p>
                </div>
                <Link href="/emanuele" className="btn-secondary text-sm shrink-0">⬅ Hub</Link>
            </div>

            <div className="w-full max-w-5xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <DidacticTooltip tips={MULTIPLAY_TIPS} emoji="🌐" />
            </div>

            {/* Multiplayer Modes */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 slide-up" style={{ animationDelay: "0.15s" }}>
                {MODES.map((mode) => (
                    <div 
                        key={mode.id}
                        onClick={() => toggleMode(mode.id)}
                        className={`quest-card p-6 flex items-start gap-4 cursor-pointer transition-all ${selectedModes.includes(mode.id) ? "ring-2 ring-emerald-500 bg-emerald-500/10" : "hover:bg-white/5"}`}
                    >
                        <div className={`text-4xl p-3 rounded-2xl ${selectedModes.includes(mode.id) ? "bg-emerald-500/20" : "bg-black/40"}`}>{mode.icon}</div>
                        <div>
                            <h3 className={`text-xl font-bold mb-1 ${selectedModes.includes(mode.id) ? "text-emerald-300" : "text-white"}`}>{mode.name}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{mode.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Social Features — from v2 doc */}
            <div className="w-full max-w-5xl mt-8 slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-white">👥 Funzioni Social</h2>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SOCIAL_FEATURES.map(f => (
                        <div
                            key={f.id}
                            onClick={() => toggleSocial(f.id)}
                            className={`quest-card p-4 cursor-pointer transition-all flex items-center gap-3 ${socialFeatures.includes(f.id) ? "ring-2 ring-fuchsia-500 bg-fuchsia-500/10" : "hover:bg-white/5"}`}
                        >
                            <span className="text-3xl">{f.icon}</span>
                            <div>
                                <h3 className={`text-sm font-bold ${socialFeatures.includes(f.id) ? "text-fuchsia-300" : "text-white"}`}>{f.name}</h3>
                                <p className="text-white/50 text-xs">{f.desc}</p>
                            </div>
                            {socialFeatures.includes(f.id) && <span className="ml-auto text-fuchsia-400 text-sm">✓</span>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="quest-card p-4">
                        <label className="text-xs text-fuchsia-400 font-bold uppercase tracking-wider block mb-2">Cosa rendere social?</label>
                        <input
                            className="quest-input"
                            placeholder="es. Scambio di risorse, messaggi..."
                            value={socialNote}
                            onChange={e => setSocialNote(e.target.value)}
                        />
                    </div>
                    <div className="quest-card p-4">
                        <label className="text-xs text-fuchsia-400 font-bold uppercase tracking-wider block mb-2">Classifica basata su?</label>
                        <input
                            className="quest-input"
                            placeholder="es. XP totali, boss sconfitti..."
                            value={serverNote}
                            onChange={e => setServerNote(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Server Notes */}
            <div className="w-full max-w-5xl mt-6 slide-up" style={{ animationDelay: "0.25s" }}>
                <div className="quest-card p-6">
                    <h2 className="text-lg font-bold text-emerald-300 mb-2">💻 Quale ruolo ha il server? (Opzionale)</h2>
                    <p className="text-white/50 text-sm mb-4">Se crei un gioco online, il server gestirà i dati: sarà autoritativo (decide lui chi vince lo scontro) o condiviso? Scrivi la tua idea logica di rete.</p>
                    <textarea
                        className="quest-input w-full min-h-[120px] resize-none focus:border-emerald-500/50"
                        placeholder="Es. Il Giocatore 1 fa da Host per farsi aiutare dal Giocatore 2..."
                        value={serverNote}
                        onChange={(e) => setServerNote(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
