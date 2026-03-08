"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const QA_TIPS = [
    "Il <strong>QA (Quality Assurance)</strong> è il processo di trovare e documentare i bug prima che li trovi il giocatore!",
    "Un buon <strong>bug report</strong> ha: dove succede, come riprodurlo, cosa dovrebbe fare, e cosa fa invece.",
    "La <strong>severità</strong> indica quanto è grave: critico = il gioco crasha, lieve = un colore sbagliato.",
    "Il <strong>regression testing</strong> è fondamentale: dopo ogni modifica, verifica che le funzionalità precedenti funzionino ancora!",
    "I tester professionisti usano una <strong>checklist</strong> per ogni build — coprire tutti i casi è la chiave!",
];

const SEVERITY = [
    { label: "Critico", emoji: "🔴", color: "bg-red-500/20 text-red-300 border-red-500/30" },
    { label: "Grave", emoji: "🟠", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    { label: "Medio", emoji: "🟡", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { label: "Lieve", emoji: "🟢", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

const TEST_CHECKS = [
    "La nuova feature funziona come descritto nel capitolo?",
    "Le feature precedenti funzionano ancora? (regression test)",
    "Cosa succede se fai qualcosa di 'sbagliato'? (es. attacca un muro)",
    "Il gioco va fluido? (niente lag, stutter, frame drop?)",
    "I suoni si sentono al momento giusto?",
    "Il testo è leggibile e senza errori?",
    "Su mobile: funziona sia in portrait che landscape?",
];

type BugReport = { id: number; severity: number; where: string; steps: string; expected: string; actual: string; timestamp: string };

export default function QAPage() {
    const [bugs, setBugs] = useState<BugReport[]>([]);
    const [checklist, setChecklist] = useState<boolean[]>(Array(TEST_CHECKS.length).fill(false));
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Omit<BugReport, "id" | "timestamp">>({ severity: 2, where: "", steps: "", expected: "", actual: "" });

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const s = localStorage.getItem(getStorageKey("ld_bugs")); if (s) setBugs(JSON.parse(s));
                const c = localStorage.getItem(getStorageKey("ld_checks")); if (c) setChecklist(JSON.parse(c));
            } catch { }
        });
    }, []);

    const saveBugs = useCallback((b: BugReport[]) => localStorage.setItem(getStorageKey("ld_bugs"), JSON.stringify(b)), []);

    const submitBug = () => {
        const newBug: BugReport = { ...form, id: bugs.length + 1, timestamp: new Date().toISOString() };
        const nb = [...bugs, newBug]; setBugs(nb); saveBugs(nb);
        setForm({ severity: 2, where: "", steps: "", expected: "", actual: "" }); setShowForm(false);
    };

    const deleteBug = (id: number) => {
        const nb = bugs.filter(b => b.id !== id); setBugs(nb); saveBugs(nb);
    };

    const toggleCheck = (idx: number) => {
        const nc = [...checklist]; nc[idx] = !nc[idx]; setChecklist(nc);
        localStorage.setItem(getStorageKey("ld_checks"), JSON.stringify(nc));
    };

    const severityCounts = SEVERITY.map((_, i) => bugs.filter(b => b.severity === i).length);

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-4 slide-up">
                    <div>
                        <div className="breadcrumb mb-2">
                            <Link href="/">🏠 Home</Link>
                            <span className="separator">›</span>
                            <Link href="/giuliano">Giuliano</Link>
                            <span className="separator">›</span>
                            <span className="text-emerald-400 font-bold">QA Testing</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">🐛 Missione 4</div>
                        <h1 className="text-3xl font-black text-white">QA Testing</h1>
                        <p className="text-emerald-200/60 text-sm mt-1">Un gioco bello ma pieno di bug è un gioco morto. 💀</p>
                    </div>
                    <Link href="/giuliano" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={QA_TIPS} emoji="🐛" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {SEVERITY.map((s, i) => (
                        <div key={i} className={`quest-card p-4 text-center border ${s.color.split(" ")[2]}`}>
                            <div className="text-2xl">{s.emoji}</div>
                            <div className="text-2xl font-black text-white">{severityCounts[i]}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/50 font-mono mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                    {/* Bug reports */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">📋 Bug Reports ({bugs.length})</h2>
                            <button onClick={() => setShowForm(!showForm)} className="btn-primary !text-sm">{showForm ? "✕ Chiudi" : "➕ Nuovo Bug"}</button>
                        </div>

                        {showForm && (
                            <div className="quest-card p-5 mb-4 space-y-3">
                                <div>
                                    <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">Gravità</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {SEVERITY.map((s, i) => (
                                            <button key={i} onClick={() => setForm({ ...form, severity: i })}
                                                className={`type-chip ${form.severity === i ? "active" : ""}`}>{s.emoji} {s.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Dove succede</label>
                                    <input className="quest-input mt-1" value={form.where} onChange={e => setForm({ ...form, where: e.target.value })} placeholder="mappa, menu, combattimento..." />
                                </div>
                                <div>
                                    <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Come riprodurlo (passi)</label>
                                    <textarea className="quest-input mt-1 min-h-[60px] resize-y" value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} placeholder="1. Vai nella foresta&#10;2. Attacca il muro&#10;3. Il gioco crasha" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Cosa dovrebbe succedere</label>
                                        <textarea className="quest-input mt-1 min-h-[50px] resize-y" value={form.expected} onChange={e => setForm({ ...form, expected: e.target.value })} placeholder="Il colpo rimbalza..." />
                                    </div>
                                    <div>
                                        <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Cosa succede invece</label>
                                        <textarea className="quest-input mt-1 min-h-[50px] resize-y" value={form.actual} onChange={e => setForm({ ...form, actual: e.target.value })} placeholder="Il gioco si blocca..." />
                                    </div>
                                </div>
                                <button onClick={submitBug} disabled={!form.where || !form.steps} className="btn-primary w-full !text-sm">📝 Invia Bug Report</button>
                            </div>
                        )}

                        {bugs.length === 0 ? (
                            <div className="text-center py-12 text-emerald-300/40">
                                <div className="text-5xl mb-3">🐛</div>
                                <p className="font-mono text-[10px] uppercase tracking-widest">Nessun bug segnalato ancora. Testa il gioco e trova i problemi!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[...bugs].reverse().map(bug => (
                                    <div key={bug.id} className="quest-card p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${SEVERITY[bug.severity].color}`}>
                                                    {SEVERITY[bug.severity].emoji} {SEVERITY[bug.severity].label}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/40 font-mono">Bug #{bug.id}</span>
                                            </div>
                                            <button onClick={() => deleteBug(bug.id)} className="text-red-400/40 hover:text-red-400 text-xs">🗑️</button>
                                        </div>
                                        <div className="text-sm text-white font-black uppercase tracking-tight mb-1 font-mono">📍 {bug.where}</div>
                                        <div className="text-xs text-emerald-300/60 whitespace-pre-wrap font-medium">{bug.steps}</div>
                                        {(bug.expected || bug.actual) && (
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                                {bug.expected && <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2"><div className="text-emerald-400 font-bold mb-0.5">✓ Atteso</div>{bug.expected}</div>}
                                                {bug.actual && <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2"><div className="text-red-400 font-bold mb-0.5">✕ Reale</div>{bug.actual}</div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Checklist */}
                    <div className="quest-card p-5 h-fit sticky top-8">
                        <h3 className="text-sm font-bold text-white mb-3">✅ Test per Capitolo</h3>
                        <div className="space-y-2">
                            {TEST_CHECKS.map((ch, i) => (
                                <button key={i} onClick={() => toggleCheck(i)}
                                    className={`w-full text-left flex items-start gap-2 p-2 rounded-lg text-xs transition-all ${checklist[i]
                                        ? "bg-emerald-500/10 text-emerald-300"
                                        : "bg-white/5 text-emerald-100/30 hover:border-white/10"}`}>
                                    <span className="flex-shrink-0 mt-0.5">{checklist[i] ? "✅" : "⬜"}</span>
                                    <span>{ch}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 text-center text-xs text-emerald-400 font-bold">{checklist.filter(Boolean).length}/{TEST_CHECKS.length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
