"use client";

import React, { useState, useRef } from "react";
import { MessageSquare, X, Send, Camera, Loader2, Check } from "lucide-react";
import html2canvas from "html2canvas";

import { getSecureKey } from "@/lib/security";

// --- TELEGRAM CONFIG ---
// We use environment variables to keep keys out of the source code.
// On GH Pages (static), these are baked into the build JS.
const TELEGRAM_BOT_TOKEN = getSecureKey(process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN);
const TELEGRAM_CHAT_ID = getSecureKey(process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID);

export default function FeedbackSystem() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"initial" | "form" | "sending" | "success">("initial");
    const [message, setMessage] = useState("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const takeScreenshot = async () => {
        try {
            setStep("sending");
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#020617",
                logging: false,
                ignoreElements: (element) => element.id === "feedback-ui",
            });
            const imgData = canvas.toDataURL("image/jpeg", 0.7);
            setScreenshot(imgData);
            setStep("form");
        } catch (err) {
            console.error("Screenshot failed:", err);
            setError("Impossibile scattare lo screenshot.");
            setStep("form");
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setError(null);
        setMessage("");
        setScreenshot(null);
        takeScreenshot();
    };

    const sendToTelegram = async () => {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            setError("Token Telegram non configurato. Controlla il codice!");
            return;
        }

        setStep("sending");

        try {
            const metadata = `
--- FEEDBACK ---
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Message: ${message}
      `;

            // Convert Base64 to Blob
            const res = await fetch(screenshot!);
            const blob = await res.blob();

            const formData = new FormData();
            formData.append("chat_id", TELEGRAM_CHAT_ID);
            formData.append("photo", blob, "screenshot.jpg");
            formData.append("caption", metadata);

            const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: "POST",
                body: formData,
            });

            if (tgRes.ok) {
                setStep("success");
                setTimeout(() => {
                    setIsOpen(false);
                    setStep("initial");
                }, 2500);
            } else {
                throw new Error("Telegram API error");
            }
        } catch (err) {
            console.error("Telegram send failed:", err);
            setError("Invio fallito. Riprova più tardi.");
            setStep("form");
        }
    };

    return (
        <div id="feedback-ui" className="fixed bottom-6 right-6 z-[9999]">
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="group relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-emerald-300/30"
                    title="Invia feedback"
                >
                    <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute right-full mr-4 px-3 py-1 bg-emerald-900/90 text-emerald-100 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-emerald-500/30">
                        Segnala bug o suggerimenti
                    </span>
                </button>
            )}

            {/* Feedback Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
                    >
                        {/* Header */}
                        <div className="bg-emerald-900/40 p-4 border-b border-emerald-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera size={18} className="text-emerald-400" />
                                <h3 className="font-fira-code font-bold text-emerald-100 uppercase tracking-wider text-sm">
                                    Feedback Visivo
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-emerald-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {step === "sending" && (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
                                    <Loader2 size={48} className="text-emerald-500 animate-spin" />
                                    <p className="text-emerald-200/70 font-fira-sans italic">Elaborazione in corso...</p>
                                </div>
                            )}

                            {step === "success" && (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">
                                        <Check size={40} className="text-emerald-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white tracking-tight">Grazie mille!</h4>
                                    <p className="text-emerald-200/70 text-center">Il tuo feedback è stato inviato via piccione viaggiatore digitale.</p>
                                </div>
                            )}

                            {step === "form" && (
                                <>
                                    {/* Screenshot Preview */}
                                    <div className="relative aspect-video bg-black rounded-lg border border-white/10 overflow-hidden shadow-inner flex items-center justify-center group">
                                        {screenshot ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Loader2 className="animate-spin text-emerald-500" />
                                        )}
                                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-black/80 px-2 py-1 rounded">Cattura istantanea</span>
                                        </div>
                                    </div>

                                    {/* Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-emerald-200/50 uppercase tracking-widest px-1">Messaggio</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Cosa è successo? Qualche consiglio grafico o errore di gioco?"
                                            className="w-full h-32 bg-black/40 border border-emerald-500/20 rounded-xl p-4 text-emerald-100 placeholder:text-emerald-900/60 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none font-fira-sans"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-rose-400 text-xs text-center border border-rose-500/20 bg-rose-500/5 py-2 rounded-lg italic">
                                            {error}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <button
                                        onClick={sendToTelegram}
                                        disabled={!message.trim() || !screenshot}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-emerald-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                                    >
                                        <Send size={18} />
                                        INVIA FEEDBACK
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
