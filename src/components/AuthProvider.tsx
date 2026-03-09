"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserRecord {
    username: string;
    email: string;
    passwordHash: string; // btoa(password) — lightweight obfuscation for a local tool
    createdAt: string;
}

interface AuthContextType {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const USERS_KEY = "iq_users_db";
const CURRENT_KEY = "iq_current_user";

function getUsers(): UserRecord[] {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveUsers(users: UserRecord[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(pw: string): string {
    // btoa for lightweight obfuscation — good enough for a local educational tool
    return btoa(unescape(encodeURIComponent(pw)));
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // View: "login" | "register"
    const [view, setView] = useState<"login" | "register">("login");

    // Login form
    const [loginUser, setLoginUser] = useState("");
    const [loginPwd, setLoginPwd] = useState("");
    const [loginError, setLoginError] = useState("");

    // Register form
    const [regUser, setRegUser] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPwd, setRegPwd] = useState("");
    const [regPwd2, setRegPwd2] = useState("");
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");

    // Show/hide password
    const [showPwd, setShowPwd] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CURRENT_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (stored) setUser(stored);
        setMounted(true);
    }, []);

    // -----------------------------------------------------------------------
    // Auth actions
    // -----------------------------------------------------------------------
    const doLogin = () => {
        setLoginError("");
        const u = loginUser.trim().toLowerCase();
        const users = getUsers();
        const record = users.find(r => r.username === u);
        if (!record) {
            setLoginError("Utente non trovato. Registrati prima!");
            return;
        }
        if (record.passwordHash !== hashPassword(loginPwd)) {
            setLoginError("Password errata.");
            return;
        }
        localStorage.setItem(CURRENT_KEY, u);
        setUser(u);
    };

    const doRegister = () => {
        setRegError("");
        setRegSuccess("");
        const u = regUser.trim().toLowerCase();
        if (!u || u.length < 2) { setRegError("Username troppo corto (min 2 caratteri)."); return; }
        if (!validateEmail(regEmail)) { setRegError("Indirizzo email non valido."); return; }
        if (regPwd.length < 4) { setRegError("Password troppo corta (min 4 caratteri)."); return; }
        if (regPwd !== regPwd2) { setRegError("Le password non coincidono."); return; }

        const users = getUsers();
        if (users.find(r => r.username === u)) {
            setRegError("Username già in uso. Scegli un altro nome.");
            return;
        }

        const newUser: UserRecord = {
            username: u,
            email: regEmail.trim().toLowerCase(),
            passwordHash: hashPassword(regPwd),
            createdAt: new Date().toISOString(),
        };
        saveUsers([...users, newUser]);
        setRegSuccess("✅ Account creato! Ora fai login.");
        setView("login");
        setLoginUser(u);
    };

    const logout = () => {
        localStorage.removeItem(CURRENT_KEY);
        setUser(null);
        setLoginUser("");
        setLoginPwd("");
        setLoginError("");
    };

    // Public login (for context consumers — keeps legacy compat)
    const login = (username: string) => {
        localStorage.setItem(CURRENT_KEY, username.trim().toLowerCase());
        setUser(username.trim().toLowerCase());
    };

    // -----------------------------------------------------------------------
    // Render helpers
    // -----------------------------------------------------------------------
    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#0f0a1e] text-white flex items-center justify-center">
                <div className="animate-pulse text-purple-400 text-lg font-mono">Caricamento…</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0f0a1e] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
                {/* Stars bg */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {[
                        [14, 22], [37, 8], [62, 31], [85, 15], [9, 55], [50, 70], [76, 88], [28, 93],
                        [92, 44], [5, 78], [43, 12], [68, 60], [21, 38], [57, 82], [80, 5], [33, 47],
                        [70, 25], [15, 65], [88, 72], [48, 95], [3, 18], [65, 42], [90, 58], [25, 80],
                        [55, 10], [40, 50], [72, 35], [18, 90], [83, 20], [60, 75],
                    ].map(([t, l], i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full opacity-30"
                            style={{ top: `${t}%`, left: `${l}%`, width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px` }}
                        />
                    ))}
                </div>

                <div className="z-10 bg-[#1e1535]/80 backdrop-blur-md p-8 rounded-2xl border-2 border-purple-500/30 shadow-2xl w-full max-w-sm mx-4 text-center">
                    {/* Logo */}
                    <h1 className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] font-mono">
                        ISO<span className="text-emerald-400">QUEST</span>
                    </h1>
                    <p className="text-purple-300/60 text-xs mb-6 tracking-widest uppercase">
                        Game Dev Workshop
                    </p>

                    {/* Tab switcher */}
                    <div className="flex rounded-xl bg-black/40 border border-white/5 p-1 mb-6 gap-1">
                        {(["login", "register"] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => { setView(v); setLoginError(""); setRegError(""); setRegSuccess(""); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === v
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                    : "text-purple-400/60 hover:text-purple-300"
                                    }`}
                            >
                                {v === "login" ? "Accedi" : "Registrati"}
                            </button>
                        ))}
                    </div>

                    {/* ---- LOGIN ---- */}
                    {view === "login" && (
                        <form onSubmit={e => { e.preventDefault(); doLogin(); }} className="space-y-3 text-left">
                            {regSuccess && (
                                <div className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-center font-bold">
                                    {regSuccess}
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Username</label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    placeholder="il-tuo-nome"
                                    value={loginUser}
                                    onChange={e => setLoginUser(e.target.value)}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white placeholder-purple-500/30 focus:outline-none focus:border-pink-500 transition-colors text-sm font-bold"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={loginPwd}
                                        onChange={e => setLoginPwd(e.target.value)}
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white placeholder-purple-500/30 focus:outline-none focus:border-pink-500 transition-colors text-sm font-bold pr-10"
                                    />
                                    <button type="button" tabIndex={-1} onClick={() => setShowPwd(s => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/40 hover:text-purple-300 text-xs">
                                        {showPwd ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>
                            {loginError && (
                                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center">{loginError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={!loginUser.trim() || !loginPwd}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-widest uppercase mt-2"
                            >
                                Accedi
                            </button>
                            <p className="text-center text-purple-400/40 text-[10px] pt-1">
                                Non hai un account?{" "}
                                <button type="button" onClick={() => setView("register")} className="text-pink-400 hover:text-pink-300 font-bold underline underline-offset-2">
                                    Registrati gratis
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ---- REGISTER ---- */}
                    {view === "register" && (
                        <form onSubmit={e => { e.preventDefault(); doRegister(); }} className="space-y-3 text-left">
                            <div>
                                <label className="block text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Username</label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    placeholder="il-tuo-nome"
                                    value={regUser}
                                    onChange={e => setRegUser(e.target.value)}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white placeholder-purple-500/30 focus:outline-none focus:border-pink-500 transition-colors text-sm font-bold"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Email</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="nome@esempio.com"
                                    value={regEmail}
                                    onChange={e => setRegEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white placeholder-purple-500/30 focus:outline-none focus:border-pink-500 transition-colors text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="min. 4 caratteri"
                                        value={regPwd}
                                        onChange={e => setRegPwd(e.target.value)}
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white placeholder-purple-500/30 focus:outline-none focus:border-pink-500 transition-colors text-sm font-bold pr-10"
                                    />
                                    <button type="button" tabIndex={-1} onClick={() => setShowPwd(s => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/40 hover:text-purple-300 text-xs">
                                        {showPwd ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Conferma Password</label>
                                <input
                                    type={showPwd ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="ripeti la password"
                                    value={regPwd2}
                                    onChange={e => setRegPwd2(e.target.value)}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white placeholder-purple-500/30 focus:outline-none focus:border-pink-500 transition-colors text-sm font-bold"
                                />
                            </div>
                            {regError && (
                                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center">{regError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={!regUser.trim() || !regEmail.trim() || !regPwd || !regPwd2}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-widest uppercase mt-2"
                            >
                                Crea Account
                            </button>
                            <p className="text-center text-purple-400/40 text-[10px] pt-1">
                                Hai già un account?{" "}
                                <button type="button" onClick={() => setView("login")} className="text-pink-400 hover:text-pink-300 font-bold underline underline-offset-2">
                                    Accedi
                                </button>
                            </p>
                        </form>
                    )}
                </div>

                <p className="mt-6 text-purple-400/20 text-[9px] font-black uppercase tracking-[0.3em] z-10">
                    I dati sono salvati localmente nel tuo browser
                </p>
            </div>
        );
    }

    // Authenticated layout
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
            <button
                onClick={logout}
                className="fixed bottom-4 right-4 z-50 bg-[#1e1535]/80 backdrop-blur border border-purple-500/30 text-purple-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-black transition-all opacity-40 hover:opacity-100 uppercase tracking-widest"
            >
                Esci ({user})
            </button>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
