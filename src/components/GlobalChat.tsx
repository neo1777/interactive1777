"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { getSecureKey } from "@/lib/security";

const TELEGRAM_BOT_TOKEN = getSecureKey(
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "MFNhUGdDb0c1YnhmMkRWel9mVjBWR3EzOFNULVZUVUVFQUE6NzA2OTA4NDM3OA=="
);
const TELEGRAM_CHAT_ID = getSecureKey(
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "NzI3MTg4NDc3"
);

interface ChatMessage {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: number;
    userName?: string;
}

export default function GlobalChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastUpdateIdRef = useRef(0);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load history
    useEffect(() => {
        const stored = localStorage.getItem("isoquest_chat_history");
        if (stored) {
            try {
                setMessages(JSON.parse(stored));
            } catch (e) {}
        }
        const storedUpdateId = localStorage.getItem("isoquest_chat_last_update_id");
        if (storedUpdateId) {
            lastUpdateIdRef.current = parseInt(storedUpdateId, 10);
        }

        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener("open-isoquest-chat", handleOpenChat);

        return () => window.removeEventListener("open-isoquest-chat", handleOpenChat);
    }, []);

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("isoquest_chat_history", JSON.stringify(messages));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Polling
    useEffect(() => {
        if (!isOpen) {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            return;
        }

        const poll = async () => {
            if (!TELEGRAM_BOT_TOKEN) return;
            try {
                // If lastUpdateId is 0, we fetch the very last message just to get the current update_id 
                // without processing it, to prevent the user from receiving ancient chat history.
                const isFirstEverPoll = lastUpdateIdRef.current === 0;
                const offsetQuery = isFirstEverPoll ? "?offset=-1" : `?offset=${lastUpdateIdRef.current + 1}`;
                
                const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates${offsetQuery}`);
                const data = await res.json();
                
                if (data.ok && data.result.length > 0) {
                    const newMessages: ChatMessage[] = [];
                    let newMaxId = lastUpdateIdRef.current;

                    for (const update of data.result) {
                        newMaxId = Math.max(newMaxId, update.update_id);
                        
                        if (!isFirstEverPoll && update.message && update.message.text && update.message.chat.id.toString() === TELEGRAM_CHAT_ID) {
                            // Ignore bot commands
                            if (update.message.text.startsWith('/')) continue;

                            // Limit backfill to 24h
                            const messageDate = update.message.date * 1000;
                            const isOld = Date.now() - messageDate > 1000 * 60 * 60 * 24;

                            if (!isOld) {
                                newMessages.push({
                                    id: `bot_${update.message.message_id}`,
                                    text: update.message.text,
                                    sender: "bot",
                                    timestamp: messageDate
                                });
                            }
                        }
                    }

                    lastUpdateIdRef.current = newMaxId;
                    localStorage.setItem("isoquest_chat_last_update_id", newMaxId.toString());

                    if (newMessages.length > 0) {
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
                            return [...prev, ...uniqueNew];
                        });
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        poll(); // immediate run
        pollingIntervalRef.current = setInterval(poll, 3000); // Poll every 3 seconds

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [isOpen]);

    const sendMessage = async () => {
        if (!inputText.trim() || isSending) return;

        const currentUser = localStorage.getItem("currentUser") || "Ospite";
        const messageText = inputText.trim();
        
        // Optimistic UI
        const tempId = `user_${Date.now()}`;
        const newMsg: ChatMessage = {
            id: tempId,
            text: messageText,
            sender: "user",
            userName: currentUser,
            timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setIsSending(true);

        try {
            const payload = `💬 [CHAT] ${currentUser}:\n${messageText}`;
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: payload
                })
            });
        } catch (err) {
            console.error("Failed to send", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-20 md:bottom-6 left-6 z-[9998] flex items-end">


            {isOpen && (
                <div className="w-[calc(100vw-3rem)] sm:w-96 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300" style={{ height: "450px", maxHeight: "80vh" }}>
                    {/* Header */}
                    <div className="bg-indigo-900/40 p-4 border-b border-indigo-500/20 flex items-center justify-between shadow-md z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                                <Bot size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-fira-code font-bold text-indigo-100 uppercase tracking-wider text-sm leading-tight">
                                    IsoQuest Com
                                </h3>
                                <p className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Telegram Sync
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-indigo-400 hover:text-white transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-indigo-500/20">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                                <MessageCircle size={32} className="text-indigo-400" />
                                <p className="text-xs text-indigo-200">Nessun messaggio.<br/>Scrivi per contattare gli sviluppatori.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                                    {msg.sender === "user" && msg.userName && (
                                        <span className="text-[10px] text-slate-500 mb-1 mr-1">{msg.userName}</span>
                                    )}
                                    <div 
                                        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words whitespace-pre-wrap ${
                                            msg.sender === "user" 
                                            ? "bg-indigo-600 text-white rounded-tr-sm" 
                                            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-slate-600 mt-1 mx-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-900 border-t border-indigo-500/20 shrink-0">
                        <div className="flex items-center gap-2 bg-black/40 border border-indigo-500/20 rounded-xl p-1 pr-2 focus-within:border-indigo-500/50 transition-colors">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Scrivi un messaggio..."
                                className="flex-1 bg-transparent text-sm text-indigo-100 placeholder:text-indigo-900/60 px-3 py-2 w-full focus:outline-none font-fira-sans"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputText.trim() || isSending}
                                className="w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-md"
                            >
                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
