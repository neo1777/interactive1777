"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStorageKey } from "@/lib/storage";

function getProgressForRole(role: "alice" | "emanuele" | "giuliano"): { done: number; total: number } {
  const has = (k: string) => {
    try {
      const v = localStorage.getItem(getStorageKey(k));
      if (!v) return false;
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.some((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          return Object.values(item).some(v => v !== "" && v !== 0 && v !== false && v !== null);
        }
        return item !== "" && item !== null;
      });
      return true;
    } catch { return false; }
  };

  switch (role) {
    case "alice":
      return {
        total: 6,
        done: [
          has("iq_hero_front") || has("iq_hero"),
          has("iq_enemy_easy") || has("iq_enemies"),
          has("iq_friend_0") || has("iq_friends"),
          has("iq_item_0") || has("iq_items"),
          has("iq_map_grid"),
          has("iq_emo_hero_happy") || has("iq_emo_npc_happy"),
        ].filter(Boolean).length,
      };
    case "emanuele":
      return {
        total: 5,
        done: [
          has("iq_stats"),
          has("iq_enemies_gd"),
          has("iq_quests"),
          has("iq_dialogues"),
          has("iq_sounds"),
        ].filter(Boolean).length,
      };
    case "giuliano":
      return {
        total: 4,
        done: [
          has("ld_setup"),
          has("ld_maps"),
          has("ld_sprites"),
          has("ld_bugs"),
        ].filter(Boolean).length,
      };
  }
}

import { Paintbrush, Gamepad2, Map as MapIcon, Trophy, Sparkles } from "lucide-react";

const roles = [
  {
    key: "alice" as const,
    href: "/alice",
    icon: Paintbrush,
    name: "Alice",
    subtitle: "Art Director",
    desc: "Disegna i personaggi, gli oggetti e la mappa del mondo!",
    gradient: "from-fuchsia-600/30 to-purple-700/30",
    border: "border-fuchsia-500/40",
    accent: "text-fuchsia-400",
    barColor: "bg-fuchsia-500",
    hoverGlow: "hover:shadow-fuchsia-500/20",
  },
  {
    key: "emanuele" as const,
    href: "/emanuele",
    icon: Gamepad2,
    name: "Emanuele",
    subtitle: "Game Designer",
    desc: "Progetta le statistiche, i nemici, le quest e i suoni!",
    gradient: "from-teal-600/30 to-cyan-700/30",
    border: "border-teal-500/40",
    accent: "text-teal-400",
    barColor: "bg-teal-500",
    hoverGlow: "hover:shadow-teal-500/20",
  },
  {
    key: "giuliano" as const,
    href: "/giuliano",
    icon: MapIcon,
    name: "Giuliano",
    subtitle: "Level Designer",
    desc: "Costruisci le mappe, le tile e testa il gioco!",
    gradient: "from-emerald-600/30 to-green-700/30",
    border: "border-emerald-500/40",
    accent: "text-emerald-400",
    barColor: "bg-emerald-500",
    hoverGlow: "hover:shadow-emerald-500/20",
  },
];

export default function Home() {
  const [progress, setProgress] = useState<Record<string, { done: number; total: number }>>({});

  useEffect(() => {
    Promise.resolve().then(() => {
      setProgress({
        alice: getProgressForRole("alice"),
        emanuele: getProgressForRole("emanuele"),
        giuliano: getProgressForRole("giuliano"),
      });
    });
  }, []);

  const totalDone = Object.values(progress).reduce((s, p) => s + p.done, 0);
  const totalAll = Object.values(progress).reduce((s, p) => s + p.total, 0);
  const globalPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  return (
    <div className="flex flex-col items-center min-h-full w-full max-w-7xl mx-auto p-4 sm:p-8 relative z-10">

      {/* Hero Section */}
      <div className="w-full mb-8 slide-up">
        <div className="quest-card overflow-hidden relative min-h-[350px] sm:min-h-[450px] flex flex-col justify-end p-6 sm:p-12 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] rounded-2xl">
          <Image
            src="/assets/home_hero_banner.png"
            alt="Isometric Quest — Game Development Workshop"
            fill
            className="object-cover object-center opacity-40 mix-blend-screen scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--quest-bg)] via-[var(--quest-bg)]/40 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black bg-purple-500/20 border border-purple-500/40 text-purple-300 tracking-[0.2em] uppercase mb-6 backdrop-blur-sm shadow-xl">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Workshop Ufficiale
            </div>
            <h1 className="text-5xl sm:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl leading-[0.9] font-mono">
              ISO<span className="text-emerald-400">QUEST</span>
            </h1>
            <p className="text-emerald-100/60 text-lg sm:text-2xl font-medium drop-shadow-lg max-w-lg mb-8 leading-relaxed">
              Il kit creativo professionale per game designers. Scegli il tuo reparto e inizia la produzione.
            </p>

            {/* Quick Stats Widget */}
            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 w-fit shadow-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-1">Status Progetto</span>
                <span className="text-white font-black text-2xl flex items-center gap-2 font-mono">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  {globalPct}%
                </span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">Asset Totali</span>
                <span className="text-white font-black text-2xl font-mono">{totalDone} / {totalAll}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="w-full flex items-center gap-4 mb-10 slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-sm font-black text-white/40 tracking-[0.3em] uppercase font-mono">Reparti di Sviluppo</h2>
        <div className="h-px bg-white/5 flex-1"></div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
        {roles.map((role, i) => {
          const p = progress[role.key];
          const pct = p ? Math.round((p.done / p.total) * 100) : 0;
          const Icon = role.icon;
          return (
            <Link key={role.key} href={role.href}
              className={`quest-card p-8 flex flex-col items-center text-center gap-6 group hover:scale-[1.03] transition-all duration-500 slide-up hover:shadow-2xl ${role.hoverGlow} border-white/5 relative bg-gradient-to-br from-white/5 to-transparent overflow-hidden rounded-3xl min-h-[420px]`}
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}>

              {/* Background Glow Effect */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none ${role.barColor}`} />

              <div className={`w-24 h-24 rounded-3xl bg-black/40 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500 ${role.accent}`}>
                <Icon className="w-12 h-12" />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight leading-none font-mono">{role.name}</h2>
                <div className={`text-[10px] font-black uppercase tracking-[0.3em] py-1.5 px-4 rounded-full bg-white/5 border border-white/5 mx-auto ${role.accent}`}>
                  {role.subtitle}
                </div>
              </div>

              <p className="text-white/30 text-[13px] leading-relaxed max-w-[200px] font-medium">
                {role.desc}
              </p>

              {/* Progress Indicator Card */}
              {p && (
                <div className="w-full mt-auto bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase mb-2">
                    <span className="text-white/40">Progresso Hub</span>
                    <span className={`${pct === 100 ? "text-emerald-400" : "text-white"}`}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.1)] ${role.barColor} ${pct === 100 ? "shimmer-full shadow-emerald-500/40" : ""}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/40 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent slide-up mb-8" style={{ animationDelay: "0.5s" }} />
      <p className="pb-12 text-purple-400/20 text-[10px] font-black uppercase tracking-[0.4em] slide-up" style={{ animationDelay: "0.6s" }}>
        © 2026 Isometric Quest System • Premium Dashboard Interface
      </p>
    </div>
  );
}
