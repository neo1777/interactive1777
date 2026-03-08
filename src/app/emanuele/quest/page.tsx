"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const QUEST_TIPS = [
    "Le quest devono avere senso nell'ordine! La quest 2 non può chiedere di andare nel dungeon se il giocatore <strong>non sa ancora dov'è</strong>.",
    "Ogni quest ha un <strong>NPC che la dà</strong> (il saggio, il fabbro...) e una <strong>ricompensa</strong> che motiva il giocatore.",
    "I <strong>5 tipi di quest</strong> (Tutorial, Combat, Fetch, Libera, Boss) coprono tutti i tipi di gameplay classici!",
    "I prerequisiti creano una <strong>catena narrativa</strong>: il giocatore deve completare la quest 1 prima di sbloccare la 2.",
    "Il <strong>dialogo iniziale</strong> è la prima impressione: rendilo interessante e motiva il giocatore a partire!",
];

const QUEST_TYPES = ["Tutorial 📖", "Combat ⚔️", "Fetch 🎒", "Libera 🎯", "Boss 💀"];
const TYPE_COLORS = ["bg-sky-500/20 text-sky-300 border-sky-500/30", "bg-red-500/20 text-red-300 border-red-500/30", "bg-amber-500/20 text-amber-300 border-amber-500/30", "bg-purple-500/20 text-purple-300 border-purple-500/30", "bg-rose-500/20 text-rose-300 border-rose-500/30"];

type QuestData = { name: string; npc: string; objective: string; rewards: string; prerequisites: string; dialogue: string };

const emptyQuest = (): QuestData => ({ name: "", npc: "", objective: "", rewards: "", prerequisites: "", dialogue: "" });

export default function QuestPage() {
    const [quests, setQuests] = useState<QuestData[]>(Array.from({ length: 5 }, emptyQuest));
    const [active, setActive] = useState(0);

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("gd_quests")); if (s) setQuests(JSON.parse(s)); } catch { } }); }, []);

    const save = useCallback((q: QuestData[]) => localStorage.setItem(getStorageKey("gd_quests"), JSON.stringify(q)), []);
    const update = (field: keyof QuestData, val: string) => {
        const nq = [...quests]; nq[active] = { ...nq[active], [field]: val }; setQuests(nq); save(nq);
    };

    const q = quests[active];
    const filled = quests.filter(q => q.name && q.objective).length;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-4 slide-up">
                    <div>
                        <div className="breadcrumb mb-2">
                            <Link href="/">🏠 Home</Link>
                            <span className="separator">›</span>
                            <Link href="/emanuele">Emanuele</Link>
                            <span className="separator">›</span>
                            <span className="text-emerald-400 font-bold">Quest</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">📜 Missione 3</div>
                        <h1 className="text-3xl font-black text-white">Le Quest</h1>
                        <p className="text-emerald-200/60 text-sm mt-1">Scrivi 5 quest che guidano il giocatore dall&apos;inizio alla battaglia finale!</p>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={QUEST_TIPS} emoji="📜" />
                </div>

                {/* Quest chain */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
                    {QUEST_TYPES.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <button onClick={() => setActive(i)}
                                className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${active === i
                                    ? `${TYPE_COLORS[i]} border-current scale-105`
                                    : quests[i].name
                                        ? "bg-white/5 border-white/20 text-white/80"
                                        : "bg-white/5 border-[#3b2d6e] text-purple-400/50"
                                    }`}>
                                <div className="text-[10px] uppercase tracking-wider opacity-70">Quest #{i + 1}</div>
                                <div>{t}</div>
                                {quests[i].name && <div className="text-[10px] mt-1 opacity-60 truncate max-w-[100px]">{quests[i].name}</div>}
                            </button>
                            {i < 4 && <span className="text-purple-500/30 text-2xl flex-shrink-0">→</span>}
                        </div>
                    ))}
                </div>

                <div className="text-center mb-4">
                    <div className="w-full max-w-md mx-auto h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div className="progress-bar-emerald h-full" style={{ width: `${(filled / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-emerald-300/60 mt-1">{filled}/5 quest completate</span>
                </div>

                {/* Quest Form */}
                <div className="quest-card p-6 space-y-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${TYPE_COLORS[active]}`}>
                        {QUEST_TYPES[active]} — Quest #{active + 1}
                    </div>

                    <div>
                        <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Nome della Quest</label>
                        <input className="quest-input mt-1" value={q.name} onChange={e => update("name", e.target.value)} placeholder="es. La Spada Perduta..." />
                    </div>
                    <div>
                        <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Chi dà la quest (NPC)</label>
                        <input className="quest-input mt-1" value={q.npc} onChange={e => update("npc", e.target.value)} placeholder="es. Il Vecchio Saggio..." />
                    </div>
                    <div>
                        <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Cosa deve fare il giocatore</label>
                        <textarea className="quest-input mt-1 min-h-[80px] resize-y" value={q.objective} onChange={e => update("objective", e.target.value)} placeholder="Descrivi l'obiettivo..." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Ricompensa</label>
                            <input className="quest-input mt-1" value={q.rewards} onChange={e => update("rewards", e.target.value)} placeholder="es. 50 XP, Spada di Ferro" />
                        </div>
                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Prerequisiti</label>
                            <input className="quest-input mt-1" value={q.prerequisites} onChange={e => update("prerequisites", e.target.value)} placeholder="es. Completare Quest #1" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Dialogo iniziale dell&apos;NPC</label>
                        <textarea className="quest-input mt-1 min-h-[80px] resize-y" value={q.dialogue} onChange={e => update("dialogue", e.target.value)} placeholder="Cosa dice l'NPC quando assegna la quest..." />
                    </div>
                </div>
            </div>
        </div>
    );
}
