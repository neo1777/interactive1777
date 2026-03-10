"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const STATUS_TIPS = [
    "Gli <strong>status effects</strong> cambiano il comportamento dei personaggi durante il combattimento!",
    "Ogni effetto ha una <strong>durata</strong> in turni: finito il tempo, il personaggio torna normale.",
    "Sia <strong>l'eroe</strong> che <strong>i nemici</strong> possono subire gli stessi effetti — è il bilanciamento!",
    "La <strong>cura</strong> è fondamentale: il giocatore deve trovare l'antidoto giusto per ogni effetto.",
    "Nei migliori RPG, gli status effects creano <strong>profondità strategica</strong> — non solo danno extra!",
];

type StatusEffect = {
    emoji: string;
    name: string;
    duration: string;
    target: string;
    numericEffect: string;
    cure: string;
};

const defaultEffects: StatusEffect[] = [
    { emoji: "☠️", name: "Avvelenato", duration: "3 turni", target: "Eroe + nemici", numericEffect: "-5 HP ogni turno", cure: "Antidoto / pozione" },
    { emoji: "🔥", name: "Bruciato", duration: "2 turni", target: "Eroe + nemici", numericEffect: "-10 HP ogni turno", cure: "Acqua / estintore" },
    { emoji: "❄️", name: "Congelato", duration: "1 turno", target: "Eroe + nemici", numericEffect: "Non può muoversi", cure: "Si scioglie da solo" },
    { emoji: "⚡", name: "Paralizzato", duration: "1-2 turni", target: "Eroe + nemici", numericEffect: "-50% velocità", cure: "Erba curativa" },
    { emoji: "✨", name: "Benedetto", duration: "5 turni", target: "Solo eroe", numericEffect: "+20% attacco", cure: "(scade da solo)" },
    { emoji: "🌑", name: "Maledetto", duration: "4 turni", target: "Eroe + nemici", numericEffect: "-20% difesa", cure: "Pozione purificante" },
    { emoji: "💪", name: "Potenziato", duration: "", target: "", numericEffect: "", cure: "" },
    { emoji: "😴", name: "Addormentato", duration: "", target: "", numericEffect: "", cure: "" },
];

const TARGETS = ["Eroe + nemici", "Solo eroe", "Solo nemici"];

export default function StatusEffectsPage() {
    const [effects, setEffects] = useState<StatusEffect[]>(defaultEffects);
    const [activeEffect, setActiveEffect] = useState(0);

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("gd_status_effects"));
                if (s) setEffects(JSON.parse(s));
            } catch { }
        });
    }, []);

    const save = useCallback(
        (e: StatusEffect[]) => localStorage.setItem(getStorageKey("gd_status_effects"), JSON.stringify(e)),
        []
    );

    const update = (field: keyof StatusEffect, val: string) => {
        const ne = [...effects];
        ne[activeEffect] = { ...ne[activeEffect], [field]: val };
        setEffects(ne);
        save(ne);
    };

    const e = effects[activeEffect];
    const filled = effects.filter(ef => ef.name && ef.duration && ef.numericEffect).length;

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
                            <span className="text-emerald-400 font-bold">Status Effects</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">
                            ⚗️ Missione 9
                        </div>
                        <h1 className="text-3xl font-black text-white">Status Effects</h1>
                        <p className="text-emerald-200/60 text-sm mt-1">
                            Definisci gli effetti di stato che colpiscono personaggi e nemici!
                        </p>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={STATUS_TIPS} emoji="⚗️" />
                </div>

                {/* Progress */}
                <div className="text-center mb-6">
                    <div className="w-full max-w-md mx-auto h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="progress-bar-emerald h-full"
                            style={{ width: `${(filled / effects.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-emerald-300/60 mt-1">
                        {filled}/{effects.length} effetti configurati
                    </span>
                </div>

                {/* Effect Tabs */}
                <div className="builder-tabs mb-6 flex-wrap justify-center">
                    {effects.map((ef, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveEffect(i)}
                            className={`builder-tab ${activeEffect === i ? "active" : ""}`}
                        >
                            <span>{ef.emoji}</span>
                            <span className="tab-label">{ef.name || `Effetto ${i + 1}`}</span>
                        </button>
                    ))}
                </div>

                {/* Effect Editor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Info Card */}
                    <div className="quest-card p-6 space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-3xl">{e.emoji}</span> Dettagli Effetto
                        </h2>

                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                Nome Effetto
                            </label>
                            <input
                                className="quest-input mt-1"
                                value={e.name}
                                onChange={ev => update("name", ev.target.value)}
                                placeholder="es. Avvelenato, Bruciato..."
                            />
                        </div>

                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                Durata (turni)
                            </label>
                            <input
                                className="quest-input mt-1"
                                value={e.duration}
                                onChange={ev => update("duration", ev.target.value)}
                                placeholder="es. 3 turni, permanente..."
                            />
                        </div>

                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">
                                Chi può subirlo
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TARGETS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => update("target", t)}
                                        className={`type-chip ${e.target === t ? "active !border-emerald-500/50 !text-emerald-300" : ""}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mechanics Card */}
                    <div className="quest-card p-6 space-y-4">
                        <h2 className="text-lg font-bold text-white">⚙️ Meccaniche</h2>

                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                Effetto sui numeri
                            </label>
                            <input
                                className="quest-input mt-1"
                                value={e.numericEffect}
                                onChange={ev => update("numericEffect", ev.target.value)}
                                placeholder="es. -5 HP ogni turno, +20% attacco..."
                            />
                        </div>

                        <div>
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                Come si cura?
                            </label>
                            <input
                                className="quest-input mt-1"
                                value={e.cure}
                                onChange={ev => update("cure", ev.target.value)}
                                placeholder="es. Antidoto, pozione, si scioglie..."
                            />
                        </div>

                        {/* Visual preview */}
                        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5">
                            <h3 className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-3">
                                📋 Anteprima Scheda
                            </h3>
                            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                                <span className="text-4xl">{e.emoji}</span>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">
                                        {e.name || "—"}
                                    </div>
                                    <div className="text-emerald-300/60 text-xs">
                                        {e.duration || "? turni"} · {e.target || "??"}
                                    </div>
                                    <div className="text-emerald-400 text-xs font-bold mt-1">
                                        {e.numericEffect || "Nessun effetto definito"}
                                    </div>
                                    <div className="text-emerald-300/40 text-xs mt-0.5">
                                        Cura: {e.cure || "—"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Table */}
                <div className="quest-card p-6 mt-6">
                    <h2 className="text-lg font-bold text-white mb-4">📊 Riepilogo Tutti gli Effetti</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-emerald-400/80 text-xs uppercase tracking-wider border-b border-white/5">
                                    <th className="text-left p-2">Effetto</th>
                                    <th className="text-left p-2">Durata</th>
                                    <th className="text-left p-2">Target</th>
                                    <th className="text-left p-2">Effetto</th>
                                    <th className="text-left p-2">Cura</th>
                                </tr>
                            </thead>
                            <tbody>
                                {effects.map((ef, i) => (
                                    <tr
                                        key={i}
                                        className={`border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${activeEffect === i ? "bg-emerald-500/10" : ""}`}
                                        onClick={() => setActiveEffect(i)}
                                    >
                                        <td className="p-2 font-bold text-white">
                                            {ef.emoji} {ef.name || <span className="text-white/30 italic">vuoto</span>}
                                        </td>
                                        <td className="p-2 text-emerald-300/60">{ef.duration || "—"}</td>
                                        <td className="p-2 text-emerald-300/60">{ef.target || "—"}</td>
                                        <td className="p-2 text-emerald-300/60">{ef.numericEffect || "—"}</td>
                                        <td className="p-2 text-emerald-300/60">{ef.cure || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
