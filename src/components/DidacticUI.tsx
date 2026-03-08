"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import NextImage from "next/image";

interface DidacticTooltipProps {
    tips: string[];
    emoji?: string;
    interval?: number;
    className?: string;
}

/**
 * Animated tooltip that cycles through educational tips with a bounce-in animation.
 * Gamified: shows a "tip counter" and each tip fades in with a sparkle effect.
 */
export default function DidacticTooltip({ tips, emoji = "💡", interval = 8000, className = "" }: DidacticTooltipProps) {
    const [currentTip, setCurrentTip] = useState(0);
    const [visible, setVisible] = useState(true);
    const [dismissed, setDismissed] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

    useEffect(() => {
        if (dismissed) return;
        timerRef.current = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setCurrentTip(prev => (prev + 1) % tips.length);
                setVisible(true);
            }, 300);
        }, interval);
        return () => clearInterval(timerRef.current);
    }, [tips.length, interval, dismissed]);

    if (dismissed) return null;

    return (
        <div className={`relative group ${className}`}>
            <div className={`tip-box flex items-start gap-3 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
                <span className="text-xl shrink-0 animate-bounce">{emoji}</span>
                <div className="flex-1">
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: tips[currentTip] }} />
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                            {tips.map((_, i) => (
                                <button key={i} onClick={() => { setCurrentTip(i); setVisible(true); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentTip ? "bg-purple-400 w-4" : "bg-white/20 hover:bg-white/40"}`} />
                            ))}
                        </div>
                        <span className="text-[10px] text-purple-400/50 ml-auto">Tip {currentTip + 1}/{tips.length}</span>
                    </div>
                </div>
                <button onClick={() => setDismissed(true)}
                    className="text-purple-300/30 hover:text-purple-300/60 text-xs shrink-0" title="Chiudi suggerimento">✕</button>
            </div>
        </div>
    );
}

interface ExamplePanelProps {
    title: string;
    imageSrc: string;
    imageAlt: string;
    children?: ReactNode;
}

/**
 * Collapsible panel showing an AI-generated example illustration with educational context.
 * Starts collapsed to not overwhelm, with a fun "open" animation.
 */
export function ExamplePanel({ title, imageSrc, imageAlt, children }: ExamplePanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="quest-card overflow-hidden transition-all duration-300">
            <button onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                    <span className={`text-xl transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>📖</span>
                    <span className="text-sm font-bold text-purple-300">{title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold transition-all ${isOpen ? "bg-purple-500/20 text-purple-300" : "bg-yellow-500/20 text-yellow-300 animate-pulse"}`}>
                    {isOpen ? "Nascondi" : "Mostra Esempio"}
                </span>
            </button>
            <div className={`transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-4 pb-4">
                    <div className="relative w-full rounded-xl border border-purple-500/20 bg-black/30 flex justify-center p-2 min-h-[100px]">
                        <NextImage
                            src={imageSrc}
                            alt={imageAlt}
                            width={800}
                            height={400}
                            className="max-w-full max-h-[400px] object-contain rounded drop-shadow-lg"
                        />
                    </div>
                    {children && <div className="mt-3 text-sm text-purple-200 leading-relaxed drop-shadow">{children}</div>}
                </div>
            </div>
        </div>
    );
}

interface XPBadgeProps {
    xp: number;
    label?: string;
}

/**
 * Small animated XP badge that appears when user completes actions.
 */
export function XPBadge({ xp, label = "XP" }: XPBadgeProps) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 pop-in">
            ⭐ +{xp} {label}
        </span>
    );
}

interface StepGuideProps {
    steps: { emoji: string; title: string; desc: string; done?: boolean }[];
}

/**
 * Vertical step-by-step guide showing activity progress like a quest log.
 */
export function StepGuide({ steps }: StepGuideProps) {
    return (
        <div className="quest-card p-4">
            <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span> Passi da seguire
            </h3>
            <div className="space-y-3">
                {steps.map((step, i) => (
                    <div key={i} className={`flex items-start gap-3 transition-all ${step.done ? "opacity-50" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step.done ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"}`}>
                            {step.done ? "✓" : step.emoji}
                        </div>
                        <div>
                            <span className={`text-sm font-bold ${step.done ? "text-emerald-300/60 line-through" : "text-white"}`}>{step.title}</span>
                            <p className="text-xs text-purple-300/40">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
