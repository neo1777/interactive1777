"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";
import { FolderOpen, Trophy, CheckCircle2, Circle, Trash2, Image as ImageIcon, ArrowLeft } from "lucide-react";

const GALLERY_TIPS = [
    "Qui puoi vedere tutto quello che hai disegnato finora!",
    "Il tuo lavoro è salvato nel browser — puoi tornare quando vuoi per finire le missioni.",
    "Hai completato tutte le missioni? Sei una vera Art Director!",
    "Usa la <strong>Lavagna</strong> se vuoi disegnare in totale libertà senza seguire le missioni.",
];

type SavedDrawing = {
    id: string;
    timestamp: string;
    thumbnail: string;
};

type MissionStatus = {
    hero: boolean;
    enemies: boolean;
    friends: boolean;
    items: boolean;
    map: boolean;
    emotions: boolean;
};

function checkMissionStatus(): MissionStatus {
    const has = (k: string) => {
        const v = localStorage.getItem(getStorageKey(k));
        if (!v) return false;
        try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) return parsed.length > 0;
            return true;
        } catch { return false; }
    };

    return {
        hero: has("iq_hero_front") || has("iq_hero"),
        enemies: has("iq_enemy_easy") || has("iq_enemies"),
        friends: has("iq_friend_0") || has("iq_friends"),
        items: has("iq_item_0") || has("iq_items"),
        map: has("iq_map_grid"),
        emotions: has("iq_emo_hero_happy") || has("iq_emo_npc_happy"),
    };
}

export default function GalleriaPage() {
    const [drawings, setDrawings] = useState<SavedDrawing[]>([]);
    const [status, setStatus] = useState<MissionStatus | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(getStorageKey("alice_gallery"));
        if (saved) {
            Promise.resolve().then(() => { try { setDrawings(JSON.parse(saved).reverse()); } catch { } });
        }
        Promise.resolve().then(() => setStatus(checkMissionStatus()));
    }, []);

    const deleteDrawing = (id: string) => {
        if (confirm("Vuoi davvero eliminare questo disegno?")) {
            const updated = drawings.filter(d => d.id !== id);
            setDrawings(updated);
            const saved = localStorage.getItem(getStorageKey("alice_gallery"));
            if (saved) {
                const allStrokes = JSON.parse(saved);
                const newAll = allStrokes.filter((d: any) => d.id !== id);
                localStorage.setItem(getStorageKey("alice_gallery"), JSON.stringify(newAll));
            }
        }
    };

    const missionCards = status ? [
        { label: "L'Eroe", done: status.hero, href: "/missione/personaggi" },
        { label: "I Nemici", done: status.enemies, href: "/missione/personaggi" },
        { label: "Gli Amici", done: status.friends, href: "/missione/personaggi" },
        { label: "Gli Oggetti", done: status.items, href: "/missione/oggetti" },
        { label: "La Mappa", done: status.map, href: "/missione/mappa" },
        { label: "Le Emozioni", done: status.emotions, href: "/missione/emozioni" },
    ] : [];

    const completedCount = missionCards.filter(m => m.done).length;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full">
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-4 mb-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white flex items-center gap-3">
                        <FolderOpen className="text-purple-400" />
                        Galleria Personale
                    </h1>
                </div>
                <Link href="/alice" className="btn-secondary text-sm sm:text-base flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Alice Hub
                </Link>
            </div>

            <div className="w-full max-w-6xl mb-6 slide-up">
                <DidacticTooltip tips={GALLERY_TIPS} emoji="📂" />
            </div>

            {/* Mission Progress */}
            {status && (
                <div className="w-full max-w-6xl mb-8">
                    <div className="quest-card p-6 border-purple-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                <Trophy className="text-yellow-500 w-5 h-5" />
                                PROGRESSO MISSIONI
                            </h2>
                            <span className="text-sm text-purple-300 font-black tracking-widest bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                                {completedCount} / {missionCards.length}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-6 border border-white/5">
                            <div className="progress-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                style={{ width: `${(completedCount / missionCards.length) * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {missionCards.map(m => (
                                <Link key={m.label} href={m.href}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group ${m.done
                                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                        : "bg-white/5 border-white/5 text-purple-300/60 hover:border-purple-500/40 hover:bg-purple-500/10"}`}>
                                    <div className="mb-2 transition-transform group-hover:scale-110">
                                        {m.done ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 opacity-30" />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-center">{m.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Free Drawings */}
            <div className="w-full max-w-6xl">
                <h2 className="text-xl font-bold text-white mb-4">🖍️ Disegni Liberi</h2>

                {drawings.length === 0 ? (
                    <div className="w-full mt-10 text-center text-purple-300">
                        <div className="text-6xl mb-4 opacity-50">🖼️</div>
                        <p className="text-lg">Non hai ancora salvato nessun disegno libero.</p>
                        <Link href="/lavagna" className="mt-6 inline-block btn-primary">Vai alla Lavagna</Link>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {drawings.map((drawing) => (
                            <div key={drawing.id} className="quest-card overflow-hidden group flex flex-col bg-black/40 border-white/5 hover:border-purple-500/40 transition-all duration-300 shadow-2xl rounded-2xl">
                                <div className="relative aspect-[4/3] bg-[#0d0818] border-b border-white/5 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={drawing.thumbnail} alt="Disegno salvato"
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 p-4" />
                                </div>
                                <div className="p-4 flex justify-between items-center bg-black/20">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Data Salvataggio</span>
                                        <span className="text-xs font-bold text-purple-200">
                                            {new Date(drawing.timestamp).toLocaleDateString("it-IT", { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteDrawing(drawing.id)}
                                        className="text-red-400 hover:text-white p-2.5 bg-red-500/10 rounded-xl hover:bg-red-500 transition-all duration-300 flex items-center justify-center group/del"
                                        title="Elimina">
                                        <Trash2 className="w-4 h-4 group-hover/del:scale-110" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
