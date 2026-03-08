"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const DIALOGUE_TIPS = [
    "Ogni dialogo ha un <strong>obiettivo</strong>: dare informazioni, assegnare una missione, o far progredire la storia.",
    "Usa <strong>speaker diversi</strong> per rendere il dialogo vivo: saggio, eroe, nemico... ognuno ha un tono unico!",
    "I <strong>collegamenti (GoTo)</strong> permettono di creare alberi di dialogo con scelte multiple — come nei giochi veri!",
    "La <strong>simulazione</strong> ti permette di testare il dialogo come lo vedrà il giocatore — usala sempre!",
    "Nei migliori RPG, i dialoghi <strong>rivelano la personalità</strong> dei personaggi — non sono solo informazioni.",
];

type DialogueNode = { id: number; speaker: string; text: string; goTo: string };
type DialogueTree = { title: string; nodes: DialogueNode[] };

const emptyTree = (title: string): DialogueTree => ({ title, nodes: [{ id: 1, speaker: "", text: "", goTo: "" }] });

export default function DialoghiPage() {
    const [trees, setTrees] = useState<DialogueTree[]>([
        emptyTree("Il Vecchio Saggio"),
        emptyTree("Dialogo Libero"),
    ]);
    const [activeTree, setActiveTree] = useState(0);
    const [simulating, setSimulating] = useState(false);
    const [simStep, setSimStep] = useState(0);

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("gd_dialogues")); if (s) setTrees(JSON.parse(s)); } catch { } }); }, []);
    const save = useCallback((t: DialogueTree[]) => localStorage.setItem(getStorageKey("gd_dialogues"), JSON.stringify(t)), []);

    const tree = trees[activeTree];
    const updateNode = (nodeIdx: number, field: keyof DialogueNode, val: string) => {
        const nt = [...trees];
        const nodes = [...nt[activeTree].nodes];
        nodes[nodeIdx] = { ...nodes[nodeIdx], [field]: val };
        nt[activeTree] = { ...nt[activeTree], nodes };
        setTrees(nt); save(nt);
    };
    const addNode = () => {
        const nt = [...trees];
        const nodes = [...nt[activeTree].nodes];
        nodes.push({ id: nodes.length + 1, speaker: "", text: "", goTo: "" });
        nt[activeTree] = { ...nt[activeTree], nodes };
        setTrees(nt); save(nt);
    };
    const removeNode = (idx: number) => {
        if (tree.nodes.length <= 1) return;
        const nt = [...trees];
        nt[activeTree] = { ...nt[activeTree], nodes: nt[activeTree].nodes.filter((_, i) => i !== idx).map((n, i) => ({ ...n, id: i + 1 })) };
        setTrees(nt); save(nt);
    };
    const updateTitle = (val: string) => {
        const nt = [...trees]; nt[activeTree] = { ...nt[activeTree], title: val }; setTrees(nt); save(nt);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4 slide-up">
                    <div>
                        <div className="breadcrumb mb-2">
                            <Link href="/">🏠 Home</Link>
                            <span className="separator">›</span>
                            <Link href="/emanuele">Emanuele</Link>
                            <span className="separator">›</span>
                            <span className="text-emerald-400 font-bold">Dialoghi</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">💬 Missione 4</div>
                        <h1 className="text-3xl font-black text-white">Alberi di Dialogo</h1>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={DIALOGUE_TIPS} emoji="💬" />
                </div>

                {/* Tree tabs */}
                <div className="builder-tabs mb-6">
                    {trees.map((t, i) => (
                        <button key={i} onClick={() => { setActiveTree(i); setSimulating(false); }}
                            className={`builder-tab ${activeTree === i ? "active" : ""}`}>
                            <span>{i === 0 ? "🧙" : "💬"}</span>
                            <span className="tab-label">{t.title || `Dialogo ${i + 1}`}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Editor */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="quest-card p-4">
                            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Titolo Dialogo / NPC</label>
                            <input className="quest-input mt-1" value={tree.title} onChange={e => updateTitle(e.target.value)} placeholder="es. Il Vecchio Saggio" />
                        </div>

                        {tree.nodes.map((node, i) => (
                            <div key={i} className="quest-card p-4 relative group">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">{node.id}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-3 items-start">
                                    <div>
                                        <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Chi parla</label>
                                        <input className="quest-input mt-0.5 !text-sm" value={node.speaker} onChange={e => updateNode(i, "speaker", e.target.value)} placeholder="NPC / Eroe" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Cosa dice</label>
                                        <textarea className="quest-input mt-0.5 !text-sm min-h-[50px] resize-y" value={node.text} onChange={e => updateNode(i, "text", e.target.value)} placeholder="Il testo del dialogo..." />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Va a →</label>
                                        <input className="quest-input mt-0.5 !text-sm" value={node.goTo} onChange={e => updateNode(i, "goTo", e.target.value)} placeholder="Riga #" />
                                    </div>
                                </div>
                                {tree.nodes.length > 1 && (
                                    <button onClick={() => removeNode(i)} className="absolute top-2 right-2 text-red-400/50 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                )}
                            </div>
                        ))}
                        <button onClick={addNode} className="btn-secondary w-full">+ Aggiungi Riga</button>
                    </div>

                    {/* Simulator */}
                    <div className="quest-card p-5 flex flex-col h-fit sticky top-8">
                        <h3 className="text-sm font-bold text-white mb-3">🎭 Anteprima Chat</h3>
                        {!simulating ? (
                            <button onClick={() => { setSimulating(true); setSimStep(0); }} className="btn-primary !text-sm"
                                disabled={!tree.nodes.some(n => n.text)}>▶ Simula Dialogo</button>
                        ) : (
                            <div className="space-y-2">
                                {tree.nodes.slice(0, simStep + 1).map((n, i) => (
                                    <div key={i} className={`p-2.5 rounded-xl text-xs max-w-[95%] ${n.speaker.toLowerCase().includes("eroe") || n.speaker.toLowerCase().includes("player")
                                        ? "bg-emerald-500/20 text-emerald-200 ml-auto"
                                        : "bg-emerald-900/40 text-emerald-100"}`}>
                                        <div className="font-bold text-[10px] uppercase tracking-wider mb-0.5 opacity-60">{n.speaker || "?"}</div>
                                        {n.text || "..."}
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-3">
                                    {simStep < tree.nodes.length - 1 ? (
                                        <button onClick={() => setSimStep(s => s + 1)} className="btn-primary !text-xs !py-1.5 flex-1">Avanti →</button>
                                    ) : (
                                        <div className="text-xs text-emerald-300/50 text-center w-full py-2">— Fine del dialogo —</div>
                                    )}
                                    <button onClick={() => setSimulating(false)} className="btn-secondary !text-xs !py-1.5">✕</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
