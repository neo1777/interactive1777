"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { getStorageKey } from "@/lib/storage";
import DidacticTooltip from "@/components/DidacticUI";

const SOUND_TIPS = [
    "I <strong>suoni</strong> sono il 50% dell'esperienza di gioco — anche un gioco pixel art diventa epico con effetti sonori!",
    "Puoi <strong>registrare</strong> suoni con oggetti di casa: battere le mani, versare acqua, aprire porte... è il foley!",
    "Ogni azione nel gioco ha un suono: <strong>passi</strong>, <strong>colpi</strong>, <strong>raccolta oggetti</strong>, <strong>apertura forziere</strong>...",
    "Il segreto dei suoni professionali? <strong>Registra in una stanza silenziosa</strong> e tieni il microfono vicino!",
    "Nei giochi famosi, il suono di <strong>level up</strong> è studiato per dare soddisfazione — rendilo speciale!",
];

const SOUNDS = [
    { key: "step", name: "step.wav", emoji: "👣", how: "Batti due dita sul tavolo, ritmo di passi", when: "Ogni passo del personaggio" },
    { key: "hit", name: "hit.wav", emoji: "💥", how: "Batti le mani una volta, forte e secco", when: "Quando colpisci un nemico" },
    { key: "sword", name: "sword.wav", emoji: "⚔️", how: "Fai 'swoosh' veloce con la bocca", when: "Attacco con spada" },
    { key: "pickup", name: "pickup.wav", emoji: "✨", how: "Fai un 'pop' con le labbra o schiocca le dita", when: "Raccogli un oggetto" },
    { key: "chest", name: "chest_open.wav", emoji: "📦", how: "Apri lentamente una scatola di cartone", when: "Apri un forziere" },
    { key: "explosion", name: "explosion.wav", emoji: "💣", how: "Schiaccia un sacchetto di carta o plastica", when: "Nemico sconfitto / bomba" },
    { key: "click", name: "click.wav", emoji: "🖱️", how: "Premi un interruttore o clicca una penna", when: "Click nei menu" },
    { key: "potion", name: "potion.wav", emoji: "🧪", how: "Versa acqua da un bicchiere a un altro", when: "Bevi una pozione" },
    { key: "door", name: "door.wav", emoji: "🚪", how: "Apri una porta vera (il cigolio è perfetto)", when: "Apri una porta nel gioco" },
    { key: "wind", name: "wind.wav", emoji: "🌬️", how: "Soffia piano nel microfono (tieni distanza!)", when: "Suono ambiente esterno" },
    { key: "coins", name: "coins.wav", emoji: "🪙", how: "Scuoti delle monete in mano", when: "Ricevi oro / compra qualcosa" },
    { key: "levelup", name: "levelup.wav", emoji: "⬆️", how: "Suona una nota acuta (bicchiere o voce)", when: "Il personaggio sale di livello" },
    { key: "game_over", name: "game_over.wav", emoji: "💀", how: "Qualcosa di lento e triste (voce o strumento)", when: "Game over" },
    { key: "quest_done", name: "quest_done.wav", emoji: "🏆", how: "Qualcosa di vittorioso! Batti le mani, suona!", when: "Quest completata" },
    { key: "status_poison", name: "status_poison.wav", emoji: "☠️", how: "Gorgoglio di acqua o suono di bolle", when: "Avvelenamento applicato" },
    { key: "boss_appear", name: "boss_appear.wav", emoji: "🐉", how: "Qualcosa di epico e potente!", when: "Il boss appare" },
    { key: "custom_1", name: "(inventa).wav", emoji: "🎵", how: "Inventa un suono originale!", when: "Quando vuoi tu!" },
    { key: "custom_2", name: "(inventa).wav", emoji: "🎶", how: "Inventa un altro suono originale!", when: "Quando vuoi tu!" },
];

export default function SuoniPage() {
    const [recordings, setRecordings] = useState<Record<string, string>>({});
    const [recording, setRecording] = useState<string | null>(null);
    const [playing, setPlaying] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => { Promise.resolve().then(() => { try { const s = localStorage.getItem(getStorageKey("gd_sounds")); if (s) setRecordings(JSON.parse(s)); } catch { } }); }, []);

    const save = useCallback((r: Record<string, string>) => localStorage.setItem(getStorageKey("gd_sounds"), JSON.stringify(r)), []);

    const startRecording = async (key: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            chunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const nr = { ...recordings, [key]: reader.result as string };
                    setRecordings(nr); save(nr);
                };
                reader.readAsDataURL(blob);
                setRecording(null);
            };
            mr.start();
            mediaRecorderRef.current = mr;
            setRecording(key);
            setTimeout(() => { if (mr.state === "recording") mr.stop(); }, 5000);
        } catch { alert("Non riesco ad accedere al microfono. Controlla i permessi del browser!"); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    };

    const playSound = (key: string) => {
        if (!recordings[key]) return;
        const audio = new Audio(recordings[key]);
        setPlaying(key);
        audio.onended = () => setPlaying(null);
        audio.play();
    };

    const deleteSound = (key: string) => {
        const nr = { ...recordings }; delete nr[key]; setRecordings(nr); save(nr);
    };

    const recorded = Object.keys(recordings).length;

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
                            <span className="text-emerald-400 font-bold">Suoni</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">🎧 Missione 5</div>
                        <h1 className="text-3xl font-black text-white">Sound Design</h1>
                        <p className="text-emerald-200/60 text-sm mt-1">Registra 18 effetti sonori direttamente dal browser!</p>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="mb-4 slide-up" style={{ animationDelay: "0.05s" }}>
                    <DidacticTooltip tips={SOUND_TIPS} emoji="🎧" />
                </div>

                <div className="text-center mb-6">
                    <div className="w-full max-w-md mx-auto h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div className="progress-bar-emerald h-full" style={{ width: `${(recorded / 18) * 100}%` }} />
                    </div>
                    <span className="text-xs text-emerald-300/60 mt-1">{recorded}/18 suoni registrati</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SOUNDS.map(s => {
                        const hasRecording = !!recordings[s.key];
                        const isRecording = recording === s.key;
                        const isPlaying = playing === s.key;

                        return (
                            <div key={s.key} className={`quest-card p-4 transition-all ${hasRecording ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{s.emoji}</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{s.name}</h3>
                                        <p className="text-[10px] text-emerald-300/50">{s.when}</p>
                                    </div>
                                    {hasRecording && <span className="ml-auto text-emerald-400 text-sm">✅</span>}
                                </div>
                                <p className="text-xs text-emerald-300/60 mb-3 italic">&quot;{s.how}&quot;</p>

                                <div className="flex gap-2">
                                    {isRecording ? (
                                        <button onClick={stopRecording}
                                            className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold animate-pulse">
                                            ⏹ Ferma ({5}s max)
                                        </button>
                                    ) : (
                                        <button onClick={() => startRecording(s.key)} disabled={recording !== null}
                                            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-40">
                                            🎙️ Registra
                                        </button>
                                    )}
                                    {hasRecording && (
                                        <>
                                            <button onClick={() => playSound(s.key)}
                                                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${isPlaying
                                                    ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                                                    : "bg-white/5 border-[#3b2d6e] text-purple-300 hover:bg-white/10"}`}>
                                                {isPlaying ? "🔊" : "▶"}
                                            </button>
                                            <button onClick={() => deleteSound(s.key)}
                                                className="px-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/60 text-xs hover:text-red-400">🗑️</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
