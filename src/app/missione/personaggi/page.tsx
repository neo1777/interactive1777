"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip, { ExamplePanel, StepGuide } from "@/components/DidacticUI";

const MiniCanvas = dynamic(() => import("@/components/MiniCanvas"), { ssr: false });

type HeroData = { name: string; powers: string };
type EnemyData = { name: string; strength: number };
type FriendData = { name: string; role: string };

const DIRECTIONS = [
    { key: "front", label: "Davanti", emoji: "⬇️" },
    { key: "back", label: "Di Spalle", emoji: "⬆️" },
    { key: "right", label: "A Destra", emoji: "➡️" },
    { key: "left", label: "A Sinistra", emoji: "⬅️" },
];

const ENEMIES = [
    { key: "easy", label: "Nemico 1 — Facile", hint: "tipo: slime, topolino, folletto...", emoji: "👾", color: "text-green-400" },
    { key: "medium", label: "Nemico 2 — Medio", hint: "tipo: goblin, scheletro, lupo...", emoji: "💀", color: "text-yellow-400" },
    { key: "boss", label: "Nemico 3 — Boss Finale!", hint: "Grande, spaventoso, epico!", emoji: "🐉", color: "text-red-400" },
];

const HERO_TIPS = [
    "Inizia disegnando il tuo eroe <strong>di fronte</strong> — è la vista più importante nel gioco!",
    "Il tuo eroe può essere un <strong>cavaliere</strong>, un <strong>mago</strong>, un <strong>esploratore</strong>... o qualcosa di completamente inventato!",
    "Nei giochi, ogni personaggio ha una <strong>silhouette unica</strong> — prova a renderlo riconoscibile anche da lontano.",
    "I colori sono importanti: l'eroe di solito ha colori <strong>luminosi e caldi</strong> per distinguersi dai nemici.",
    "Non servono dettagli perfetti! Anche i giochi famosi hanno iniziato con disegni <strong>semplici</strong>.",
];

const ENEMY_TIPS = [
    "I nemici facili dovrebbero essere <strong>piccoli e semplici</strong> — aiutano il giocatore a imparare le meccaniche!",
    "La <strong>scala di forza</strong> (1-10) è la base del bilanciamento: determina quanti colpi servono per vincer.",
    "Il <strong>Boss finale</strong> deve essere epico! Rendilo grande, spaventoso e memorabile.",
    "Pensa alla <strong>progressione</strong>: nemico facile → medio → boss. Come nei veri giochi!",
];

const FRIEND_TIPS = [
    "Gli amici del villaggio sono i <strong>PNG</strong> (Personaggi Non Giocanti) — danno missioni e aiutano l'eroe!",
    "Ogni amico ha un <strong>ruolo</strong>: fabbro, maga, cuoco, saggio... Pensa a come aiutano il giocatore.",
    "Nei migliori giochi RPG, gli NPC hanno <strong>personalità uniche</strong> — prova a dare un tratto speciale a ognuno!",
];

export default function PersonaggiPage() {
    const [tab, setTab] = useState<"hero" | "enemies" | "friends">("hero");

    const [hero, setHero] = useState<HeroData>({ name: "", powers: "" });
    const [enemies, setEnemies] = useState<EnemyData[]>([
        { name: "", strength: 1 }, { name: "", strength: 5 }, { name: "", strength: 10 },
    ]);
    const [friends, setFriends] = useState<FriendData[]>([
        { name: "", role: "" }, { name: "", role: "" }, { name: "", role: "" },
    ]);

    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const h = localStorage.getItem(getStorageKey("iq_hero")); if (h) setHero(JSON.parse(h));
                const e = localStorage.getItem(getStorageKey("iq_enemies")); if (e) setEnemies(JSON.parse(e));
                const f = localStorage.getItem(getStorageKey("iq_friends")); if (f) setFriends(JSON.parse(f));
            } catch { }
        });
    }, []);

    useEffect(() => { localStorage.setItem(getStorageKey("iq_hero"), JSON.stringify(hero)); }, [hero]);
    useEffect(() => { localStorage.setItem(getStorageKey("iq_enemies"), JSON.stringify(enemies)); }, [enemies]);
    useEffect(() => { localStorage.setItem(getStorageKey("iq_friends"), JSON.stringify(friends)); }, [friends]);

    const heroHasDrawing = typeof window !== "undefined" && DIRECTIONS.some(d => localStorage.getItem(getStorageKey(`iq_hero_${d.key}`)));
    const enemiesHaveDrawing = typeof window !== "undefined" && ENEMIES.some(en => localStorage.getItem(getStorageKey(`iq_enemy_${en.key}`)));

    const steps = [
        { emoji: "✏️", title: "Disegna l'eroe in 4 direzioni", desc: "Inizia dal davanti, poi gira!", done: heroHasDrawing },
        { emoji: "📝", title: "Dai un nome e poteri all'eroe", desc: "Pensa a cosa lo rende speciale", done: hero.name.length > 0 },
        { emoji: "👾", title: "Crea 3 nemici con difficoltà crescente", desc: "Facile → Medio → Boss!", done: enemiesHaveDrawing },
        { emoji: "🧝", title: "Inventa 3 amici del villaggio", desc: "Chi aiuterà il tuo eroe?", done: friends.some(f => f.name.length > 0) },
    ];

    const tabs = [
        { id: "hero" as const, label: "🦸 L'Eroe", desc: "Il personaggio principale" },
        { id: "enemies" as const, label: "👾 I Nemici", desc: "Le creature cattive" },
        { id: "friends" as const, label: "🧝 Gli Amici", desc: "NPC del villaggio" },
    ];

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full overflow-x-hidden">
            {/* Header */}
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 slide-up">
                <div className="text-center sm:text-left">
                    <div className="breadcrumb mb-2">
                        <Link href="/">🏠 Home</Link>
                        <span className="separator">›</span>
                        <Link href="/alice">Alice</Link>
                        <span className="separator">›</span>
                        <span className="text-emerald-400 font-bold">Personaggi</span>
                    </div>
                    <div className="mission-badge mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🧑‍🎨 Missione 1</div>
                    <h1 className="text-3xl sm:text-4xl font-black glow-text text-white">I Personaggi</h1>
                    <p className="text-emerald-300/60 text-sm mt-1">Disegna le persone e le creature del mondo di Isometric Quest.</p>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0">⬅ Alice Hub</Link>
            </div>

            {/* Step Guide */}
            <div className="w-full max-w-6xl mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                <StepGuide steps={steps} />
            </div>

            {/* Tab Bar */}
            <div className="w-full max-w-6xl builder-tabs mb-4 slide-up" style={{ animationDelay: "0.1s" }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`builder-tab ${tab === t.id ? "active" : ""}`}>
                        <span>{t.label}</span>
                        <span className="tab-label hidden sm:inline">{t.desc}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="w-full max-w-6xl screen slide-up" style={{ animationDelay: "0.15s" }}>
                {/* ─── HERO TAB ─── */}
                {tab === "hero" && (
                    <div className="space-y-5">
                        <DidacticTooltip tips={HERO_TIPS} emoji="🎨" />

                        <ExamplePanel title="📐 Esempio: come disegnare il tuo eroe in 4 direzioni"
                            imageSrc="/assets/hero_directions_guide.png"
                            imageAlt="Esempio eroe RPG in 4 direzioni">
                            <p>Ogni personaggio in un gioco isometrico viene disegnato da <strong>4 angolazioni</strong>. Inizia dalla vista frontale, poi ruota! Non devono essere identici — basta che si riconoscano.</p>
                        </ExamplePanel>

                        <h2 className="text-xl font-bold text-white">🦸 L&apos;Eroe — Disegnalo in 4 direzioni</h2>
                        <p className="text-emerald-300/60 text-sm">Può essere un cavaliere, un mago, un esploratore... quello che vuoi!</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {DIRECTIONS.map(d => (
                                <div key={d.key} className="quest-card p-3 flex flex-col items-center gap-2">
                                    <span className="text-2xl">{d.emoji}</span>
                                    <MiniCanvas storageKey={`iq_hero_${d.key}`} label={d.label} width={200} height={220} />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-emerald-300 mb-1 block">Come si chiama il tuo eroe?</label>
                                <input className="quest-input focus:border-emerald-500/50" placeholder="Nome dell'eroe..." value={hero.name}
                                    onChange={e => setHero({ ...hero, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-emerald-300 mb-1 block">Che poteri ha?</label>
                                <input className="quest-input focus:border-emerald-500/50" placeholder="Poteri speciali..." value={hero.powers}
                                    onChange={e => setHero({ ...hero, powers: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── ENEMIES TAB ─── */}
                {tab === "enemies" && (
                    <div className="space-y-5">
                        <DidacticTooltip tips={ENEMY_TIPS} emoji="👾" />

                        <ExamplePanel title="⚔️ Esempio: 3 livelli di nemici — dal facile al boss!"
                            imageSrc="/assets/example_enemy_types.png"
                            imageAlt="Esempio nemici RPG con difficoltà crescente">
                            <p>I nemici crescono in <strong>difficoltà</strong>: lo Slime è facile (livello 1), il Goblin è medio (livello 5), il Drago è il Boss (livello 10). Ogni nemico ha statistiche diverse!</p>
                        </ExamplePanel>

                        <h2 className="text-xl font-bold text-white">👾 I Nemici — Disegna almeno 3 creature</h2>
                        <p className="text-emerald-300/60 text-sm">Il primo nemico è facile, l&apos;ultimo è difficilissimo!</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {ENEMIES.map((en, i) => (
                                <div key={en.key} className="quest-card p-4 flex flex-col items-center gap-3">
                                    <h3 className={`text-lg font-bold ${en.color}`}>{en.emoji} {en.label}</h3>
                                    <p className="text-emerald-400/50 text-xs text-center">{en.hint}</p>
                                    <MiniCanvas storageKey={`iq_enemy_${en.key}`} width={220} height={220} />
                                    <input className="quest-input text-sm focus:border-emerald-500/50" placeholder="Nome del nemico..."
                                        value={enemies[i].name}
                                        onChange={e => {
                                            const copy = [...enemies];
                                            copy[i] = { ...copy[i], name: e.target.value };
                                            setEnemies(copy);
                                        }} />
                                    <div>
                                        <label className="text-xs text-emerald-300 font-bold block mb-1 text-center">Quanto è forte? (1-10)</label>
                                        <div className="flex gap-1 justify-center">
                                            {Array.from({ length: 10 }, (_, n) => n + 1).map(n => (
                                                <button key={n} onClick={() => {
                                                    const copy = [...enemies];
                                                    copy[i] = { ...copy[i], strength: n };
                                                    setEnemies(copy);
                                                }}
                                                    className={`strength-btn !border-emerald-500/30 ${enemies[i].strength >= n ? "active !bg-emerald-500 !text-white" : ""}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── FRIENDS TAB ─── */}
                {tab === "friends" && (
                    <div className="space-y-5">
                        <DidacticTooltip tips={FRIEND_TIPS} emoji="🧝" />

                        <h2 className="text-xl font-bold text-white">🧝 Gli Amici — Disegna almeno 3 personaggi del villaggio</h2>
                        <p className="text-emerald-300/60 text-sm">Chi vive nel villaggio? Un fabbro? Una maga? Un cuoco? Inventali!</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="quest-card p-4 flex flex-col items-center gap-3">
                                    <h3 className="text-lg font-bold text-emerald-400">🧝 Amico {i + 1}</h3>
                                    <MiniCanvas storageKey={`iq_friend_${i}`} width={220} height={220} />
                                    <input className="quest-input text-sm" placeholder="Nome..."
                                        value={friends[i].name}
                                        onChange={e => {
                                            const copy = [...friends];
                                            copy[i] = { ...copy[i], name: e.target.value };
                                            setFriends(copy);
                                        }} />
                                    <input className="quest-input text-sm" placeholder="Cosa fa? (fabbro, maga, cuoco...)"
                                        value={friends[i].role}
                                        onChange={e => {
                                            const copy = [...friends];
                                            copy[i] = { ...copy[i], role: e.target.value };
                                            setFriends(copy);
                                        }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
