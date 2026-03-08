"use client";

import Link from "next/link";
import { useState } from "react";

const QUIZ_QUESTIONS = [
    { q: "Quanto dovrebbe durare un effetto sonoro (SFX)?", options: ["5-10 secondi", "Meno di 1 secondo", "Più di 30 secondi", "Non importa"], answer: 1 },
    { q: "Cosa succede se registri troppo forte (clipping)?", options: ["Il suono migliora", "Il suono gracchia o distorce", "Non cambia niente", "Diventa più basso"], answer: 1 },
    { q: "Perché i suoni ripetitivi (passi, click) devono essere 'neutri'?", options: ["Per risparmiare memoria", "Perché dopo 100 volte diventano fastidiosi se troppo caratteristici", "Perché il gioco è silenzioso", "Non è vero"], answer: 1 },
    { q: "Quanto dura il 'coin sound' di Mario?", options: ["3 secondi", "10 secondi", "0.3 secondi", "1 minuto"], answer: 2 },
    { q: "Cosa devi lasciare all'inizio e alla fine di una registrazione?", options: ["Musica", "Un attimo di silenzio", "Un applauso", "Niente"], answer: 1 },
];

const BALANCE_CHALLENGE = {
    budget: 50,
    stats: ["HP", "MP", "ATK", "DEF", "VEL"],
    opponents: [
        { name: "Slime Veloce", stats: { HP: 8, MP: 0, ATK: 5, DEF: 3, VEL: 15 } },
        { name: "Golem di Pietra", stats: { HP: 25, MP: 0, ATK: 10, DEF: 20, VEL: 2 } },
        { name: "Mago Oscuro", stats: { HP: 12, MP: 20, ATK: 15, DEF: 5, VEL: 8 } },
    ],
};

export default function BonusPage() {
    const [quizState, setQuizState] = useState<{ current: number; score: number; answers: number[]; done: boolean }>({ current: 0, score: 0, answers: [], done: false });
    const [heroStats, setHeroStats] = useState<Record<string, number>>({ HP: 10, MP: 10, ATK: 10, DEF: 10, VEL: 10 });
    const [battleResult, setBattleResult] = useState<string | null>(null);

    const answerQuiz = (idx: number) => {
        const correct = idx === QUIZ_QUESTIONS[quizState.current].answer;
        const newScore = quizState.score + (correct ? 1 : 0);
        const done = quizState.current + 1 >= QUIZ_QUESTIONS.length;
        setQuizState({ current: quizState.current + 1, score: newScore, answers: [...quizState.answers, idx], done });
    };

    const totalPoints = Object.values(heroStats).reduce((a, b) => a + b, 0);
    const remaining = BALANCE_CHALLENGE.budget - totalPoints;

    const simulateBattle = () => {
        if (remaining < 0) { setBattleResult("⚠️ Hai sforato il budget! Riduci le stats."); return; }
        const wins = BALANCE_CHALLENGE.opponents.filter(opp => {
            const myPower = heroStats.ATK * 2 + heroStats.VEL + heroStats.HP;
            const oppPower = opp.stats.ATK * 2 + opp.stats.VEL + opp.stats.HP;
            return myPower >= oppPower * 0.8;
        }).length;
        if (wins === 3) setBattleResult("🏆 Perfetto! Il tuo eroe è bilanciato per vincere tutte le sfide!");
        else if (wins >= 2) setBattleResult(`⚔️ Buono! Vinci ${wins}/3 battaglie. Prova a bilanciare meglio.`);
        else setBattleResult(`💀 Solo ${wins}/3 vittorie. Rivedi la distribuzione delle stats!`);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 tracking-widest uppercase mb-2">⭐ Bonus</div>
                        <h1 className="text-3xl font-black text-white">Sfida Game Designer</h1>
                    </div>
                    <Link href="/emanuele" className="btn-secondary text-sm">⬅ Hub</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quiz */}
                    <div className="quest-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">🎧 Quiz Regole Audio</h2>
                        {!quizState.done ? (
                            <>
                                <div className="text-xs text-emerald-400 mb-1">Domanda {quizState.current + 1}/{QUIZ_QUESTIONS.length}</div>
                                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden mb-4 border border-white/5">
                                    <div className="progress-bar-emerald h-full" style={{ width: `${(quizState.current / QUIZ_QUESTIONS.length) * 100}%` }} />
                                </div>
                                <p className="text-white font-bold mb-4">{QUIZ_QUESTIONS[quizState.current].q}</p>
                                <div className="space-y-2">
                                    {QUIZ_QUESTIONS[quizState.current].options.map((opt, i) => (
                                        <button key={i} onClick={() => answerQuiz(i)}
                                            className="w-full text-left px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-emerald-200 text-sm hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-3">{quizState.score >= 4 ? "🏆" : quizState.score >= 3 ? "⭐" : "📚"}</div>
                                <h3 className="text-2xl font-black text-white">{quizState.score}/{QUIZ_QUESTIONS.length}</h3>
                                <p className="text-emerald-300/60 text-sm mt-1">{quizState.score >= 4 ? "Sei un esperto di Sound Design!" : "Riléggi le regole e riprova!"}</p>
                                <button onClick={() => setQuizState({ current: 0, score: 0, answers: [], done: false })} className="btn-secondary mt-4 text-sm">🔄 Riprova</button>
                            </div>
                        )}
                    </div>

                    {/* Balance Challenge */}
                    <div className="quest-card p-6">
                        <h2 className="text-lg font-bold text-white mb-2">⚖️ Sfida Bilanciamento</h2>
                        <p className="text-xs text-emerald-300/50 mb-4">Hai {BALANCE_CHALLENGE.budget} punti. Distribuiscili per battere tutti e 3 i nemici!</p>

                        {BALANCE_CHALLENGE.stats.map(s => (
                            <div key={s} className="mb-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white font-bold">{s}</span>
                                    <span className="text-emerald-300 font-mono">{heroStats[s]}</span>
                                </div>
                                <input type="range" min={1} max={25} value={heroStats[s]}
                                    onChange={ev => setHeroStats({ ...heroStats, [s]: +ev.target.value })}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, #10b981 ${(heroStats[s] / 25) * 100}%, rgba(255,255,255,0.05) ${(heroStats[s] / 25) * 100}%)` }} />
                            </div>
                        ))}
                        <div className={`text-sm font-bold text-center my-3 ${remaining < 0 ? "text-red-400" : remaining === 0 ? "text-emerald-400" : "text-amber-300"}`}>
                            Punti rimasti: {remaining}
                        </div>

                        <div className="space-y-2 mb-4">
                            {BALANCE_CHALLENGE.opponents.map(opp => (
                                <div key={opp.name} className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 border border-[#3b2d6e] text-xs">
                                    <span className="text-white font-bold">{opp.name}</span>
                                    <span className="text-purple-300/60">HP:{opp.stats.HP} ATK:{opp.stats.ATK} DEF:{opp.stats.DEF} VEL:{opp.stats.VEL}</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={simulateBattle} className="btn-primary w-full !text-sm">⚔️ Simula Battaglia!</button>
                        {battleResult && <div className="mt-3 text-center text-sm text-white bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">{battleResult}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
