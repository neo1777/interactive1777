"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { getStorageKey } from "@/lib/storage";

/* ─── Interfaces ─── */

export interface SlideContent {
  id: number;
  title: string;
  emoji: string;
  accentColor: string; // Tailwind text color class
  accentBg: string;    // Tailwind bg color class
  accentBorder: string; // Tailwind border color class
  content: React.ReactNode;
}

interface IntroSlideshowProps {
  slides: SlideContent[];
  storageKey: string;
  personName: string;
  personEmoji: string;
  themeColor: "fuchsia" | "blue" | "emerald";
}

/* ─── Components ─── */

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 rounded-xl border bg-slate-900/40 border-slate-700/50 ${className}`}>
    {children}
  </div>
);

const Terminal = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg overflow-hidden border border-emerald-500/30 bg-black/80 font-mono text-xs">
    <div className="bg-emerald-950/40 px-3 py-1 border-b border-emerald-500/20 flex justify-between items-center text-emerald-400/70">
      <span>{title}</span>
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-red-500/50" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <div className="w-2 h-2 rounded-full bg-green-500/50" />
      </div>
    </div>
    <div className="p-3 text-emerald-400 space-y-1">
      {children}
    </div>
  </div>
);

/* ─── Slide Data: ALICE (11 slide) ─── */

export const aliceSlides: SlideContent[] = [
  {
    id: 1,
    title: "ISOMETRIC QUEST 🎨",
    emoji: "🎨",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="space-y-6 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold glow-text">Il Quaderno Magico dell&apos;Art Director</h3>
          <Card className="max-w-md bg-fuchsia-900/20 border-fuchsia-500/20 py-6">
            <p className="text-base leading-relaxed">
              Ciao Alice! Sei l&apos;<strong>Art Director</strong> del nostro team.
              Il tuo compito è trasformare le idee in immagini bellissime.
              Senza i tuoi disegni, il gioco sarebbe solo uno schermo nero!
            </p>
          </Card>
      </div>
    )
  },
  {
    id: 2,
    title: "Cosa stiamo costruendo?",
    emoji: "🎮",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="space-y-4">
        <Card className="flex gap-4 items-center">
          <span className="text-3xl">🕹️</span>
          <p>Un videogioco vero! Si chiama <strong>Isometric Quest</strong>. È un gioco di avventura dove un eroe esplora un mondo magico.</p>
        </Card>
        <Card className="flex gap-4 items-center">
          <span className="text-3xl">🗺️</span>
          <p>Una mappa grande con tre zone: il Villaggio 🏘️, la Foresta 🌲 e il Dungeon 🏔️</p>
        </Card>
        <Card className="flex gap-4 items-center">
          <span className="text-3xl">💻</span>
          <p>Papà scrive il codice con Flutter e Flame, un motore per giochi!</p>
        </Card>
      </div>
    )
  },
  {
    id: 3,
    title: "La Squadra",
    emoji: "👥",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-fuchsia-950/30 border-fuchsia-500/30">
          <p className="font-bold text-fuchsia-400">🎨 Alice</p>
          <p className="text-xs text-slate-300">Art Director: Disegna personaggi, oggetti e mappa.</p>
        </Card>
        <Card className="bg-blue-950/30 border-blue-500/30">
          <p className="font-bold text-blue-400">🎮 Emanuele</p>
          <p className="text-xs text-slate-300">Game Design: Inventa regole, missioni e suoni.</p>
        </Card>
        <Card className="bg-emerald-950/30 border-emerald-500/30">
          <p className="font-bold text-emerald-400">🗺️ Giuliano</p>
          <p className="text-xs text-slate-300">Level Design: Costruisce le mappe e trova i bug.</p>
        </Card>
        <Card className="bg-orange-950/30 border-orange-500/30">
          <p className="font-bold text-orange-400">💻 Papà</p>
          <p className="text-xs text-slate-300">Programmatore: Scrive il codice e fa funzionare tutto.</p>
        </Card>
      </div>
    )
  },
  {
    id: 4,
    title: "Il tuo ruolo: Art Director!",
    emoji: "🎨",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="space-y-4">
        <ul className="space-y-2 list-none">
          <li>✏️ Disegni i personaggi: l'eroe, i nemici, gli amici</li>
          <li>🎁 Crei le icone degli oggetti: spade, pozioni, chiavi</li>
          <li>🗺️ Disegni la mappa del mondo con tutti i colori</li>
          <li>✨ Decidi come appaiono gli effetti magici e la luce</li>
          <li>Meta Progetti come appare il menu e lo schermo</li>
        </ul>
        <div className="p-3 bg-fuchsia-500/20 border border-fuchsia-500/40 rounded-lg text-center font-bold text-fuchsia-100">
           &quot;Senza di te il gioco non esiste! 🌟&quot;
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Cosa fanno gli altri?",
    emoji: "👥",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-tight">
        <Card className="border-blue-500/20">
          <p className="font-bold text-blue-400 mb-1">Emanuele</p>
          <ul className="space-y-1 opacity-80">
            <li>• Decide HP nemici</li>
            <li>• Inventa missioni</li>
            <li>• Scrive dialoghi</li>
            <li>• Registra i suoni!</li>
          </ul>
        </Card>
        <Card className="border-emerald-500/20">
          <p className="font-bold text-emerald-400 mb-1">Giuliano</p>
          <ul className="space-y-1 opacity-80">
            <li>• Costruisce le mappe</li>
            <li>• Crea la Pixel Art</li>
            <li>• Trova i bug</li>
            <li>• Verifica il gioco</li>
          </ul>
        </Card>
        <Card className="border-orange-500/20">
          <p className="font-bold text-orange-400 mb-1">Papà</p>
          <ul className="space-y-1 opacity-80">
            <li>• Scrive il codice</li>
            <li>• Inserisce i disegni</li>
            <li>• Costruisce il motore</li>
            <li>• Pubblica il gioco!</li>
          </ul>
        </Card>
      </div>
    )
  },
  {
    id: 6,
    title: "Quando parlare con Emanuele?",
    emoji: "🗣️",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <Card className="bg-slate-800/20">
          <p className="font-bold text-blue-300">📌 Nemici</p>
          <p>Dì ad Alice quanto è forte: se ha 1000 HP va disegnato grande!</p>
        </Card>
        <Card className="bg-slate-800/20">
          <p className="font-bold text-blue-300">📌 Oggetti</p>
          <p>Lui sa se è raro. Un oggetto leggendario deve sembrare speciale!</p>
        </Card>
        <Card className="bg-slate-800/20">
          <p className="font-bold text-blue-300">📌 Mappa</p>
          <p>Lui controlla che le zone siano giuste per le missioni.</p>
        </Card>
        <Card className="bg-slate-800/20">
          <p className="font-bold text-blue-300">📌 Magia</p>
          <p>Lui ti dice che tipo di potere è: fuoco? Ghiaccio?</p>
        </Card>
      </div>
    )
  },
  {
    id: 7,
    title: "Quando parlare con Giuliano?",
    emoji: "🗣️",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <Card className="bg-slate-800/20">
          <p className="font-bold text-emerald-300">📌 Fine disegno</p>
          <p>Lui lo trasforma in pixel art! Non deve essere perfetto.</p>
        </Card>
        <Card className="bg-slate-800/20">
          <p className="font-bold text-emerald-300">📌 Dimensioni</p>
          <p>Ti spiega lui quanto devono essere grandi i pixel.</p>
        </Card>
        <Card className="bg-slate-800/20">
          <p className="font-bold text-emerald-300">📌 Mappa finita</p>
          <p>Usa il tuo disegno come guida per Tiled nel computer.</p>
        </Card>
        <Card className="bg-slate-800/20">
          <p className="font-bold text-emerald-300">📌 Cose strane</p>
          <p>Se vedi errori nel gioco, segnalali a lui che è il Tester!</p>
        </Card>
      </div>
    )
  },
  {
    id: 8,
    title: "Le tue 6 Missioni!",
    emoji: "🗺️",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
        <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">1. 🦸 I Personaggi</Card>
        <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">2. 🎁 Gli Oggetti</Card>
        <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">3. 🗺️ La Mappa</Card>
        <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">4. ✨ Effetti Visivi</Card>
        <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">5. 🖥️ HUD e Menu</Card>
        <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">6. ⚗️ Status effects</Card>
      </div>
    )
  },
  {
    id: 9,
    title: "Come si usa il quaderno?",
    emoji: "📖",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <ul className="space-y-3 text-sm">
        <li>1. 📖 <strong>Leggi la missione</strong>: c&apos;è spiegato cosa fare.</li>
        <li>2. ✏️ <strong>Disegna!</strong>: usa matite, pennarelli, colori...</li>
        <li>3. 💬 <strong>Parla con il team</strong>: collaborate insieme!</li>
        <li>4. 📸 <strong>Fotografa tutto</strong>: così Giuliano può usarlo.</li>
        <li>5. ✅ <strong>Spunta la checklist</strong>: alla fine di ogni missione.</li>
      </ul>
    )
  },
  {
    id: 10,
    title: "Il risultato finale",
    emoji: "🎉",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="text-center py-4">
        <h4 className="text-xl font-bold mb-4 text-fuchsia-300">I tuoi disegni si muovono nel gioco!</h4>
        <p className="mb-6 opacity-80">
          Quando giocherai a Isometric Quest, vedrai i <strong>tuoi personaggi</strong> muoversi nella <strong>tua mappa</strong> raccogliendo i <strong>tuoi oggetti</strong>.
        </p>
        <div className="inline-block p-4 bg-fuchsia-600/30 rounded-2xl glow-text animate-pulse">
           &quot;Sei la persona più importante del team! 💜&quot;
        </div>
      </div>
    )
  },
  {
    id: 11,
    title: "Sei pronta?",
    emoji: "✨",
    accentColor: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/30",
    accentBorder: "border-fuchsia-500/40",
    content: (
      <div className="space-y-4">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2"><span>1.</span> Prendi matite e pennarelli colorati</li>
          <li className="flex gap-2"><span>2.</span> Apri il quaderno alla Missione 1</li>
          <li className="flex gap-2"><span>3.</span> Parla con Emanuele prima dei nemici</li>
          <li className="flex gap-2"><span>4.</span> Disegna, colora, inventa! ✏️</li>
          <li className="flex gap-2"><span>5.</span> Fotografa ogni disegno finito 📸</li>
        </ul>
        <div className="pt-4 text-center text-fuchsia-400 font-bold italic">
           &quot;Buon lavoro, Art Director! 🎨🌟&quot;
        </div>
      </div>
    )
  }
];

/* ─── Slide Data: EMANUELE (11 slide) ─── */

export const emanueleSlides: SlideContent[] = [
  {
    id: 1,
    title: "ISOMETRIC QUEST",
    emoji: "🎮",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-6 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold glow-text text-blue-300">Game Design Document & Sound Bible</h3>
        <Card className="max-w-md bg-blue-900/20 border-blue-500/20 py-6">
          <p className="text-base leading-relaxed">
            Ciao Emanuele! Il Game Designer è il cervello del gioco. 
            Tu decidi le regole, inventi le storie, progetti i sistemi e registri i suoni.
            Senza un GDD solido, il gioco è caos.
          </p>
        </Card>
      </div>
    )
  },
  {
    id: 2,
    title: "Il Progetto",
    emoji: "📋",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card className="border-blue-500/20">
          <p className="font-bold text-blue-300 mb-2">🕹️ Cosa costruiamo</p>
          <p>RPG isometrico 2D | 3 zone: Villaggio, Foresta, Dungeon | Combattimento, inventario, quest e dialoghi.</p>
        </Card>
        <Card className="border-orange-500/20">
          <p className="font-bold text-orange-400 mb-2">⚙️ Stack Tecnologico</p>
          <p>Flutter 3.5+ | Flame ^1.21 | Tiled (Level Editor) | Firebase (Cloud Save) | Nakama (Server).</p>
        </Card>
      </div>
    )
  },
  {
    id: 3,
    title: "Il Team e i Ruoli",
    emoji: "👥",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-3 text-xs">
        <Card className="border-fuchsia-500/20"><strong>Alice dà:</strong> Disegni personaggi, icone, mappa, colori e visual effects.</Card>
        <Card className="border-emerald-500/20"><strong>Giuliano dà:</strong> Mappe .tmx, Sprite pixel art, Bug report e test.</Card>
        <Card className="border-orange-500/20"><strong>Papà dà:</strong> Codice, nuove feature e feedback tecnico sul GDD.</Card>
      </div>
    )
  },
  {
    id: 4,
    title: "Il tuo ruolo: Game Designer",
    emoji: "🎮",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
        <Card className="bg-slate-800/40"><strong>📊 Balance</strong> Decidi HP, attacco e difesa dei nemici.</Card>
        <Card className="bg-slate-800/40"><strong>📜 Quest</strong> Scrivi le missioni e le ricompense.</Card>
        <Card className="bg-slate-800/40"><strong>💬 Dialoghi</strong> Scrivi ciò che dicono gli NPC.</Card>
        <Card className="bg-slate-800/40"><strong>⚡ Eventi</strong> Definisci cosa succede al game-over.</Card>
        <Card className="bg-slate-800/40"><strong>⚗️ Status</strong> Bilancia i numeri di veleno e fiamme.</Card>
        <Card className="bg-slate-800/40"><strong>🎵 Sound</strong> Registri e curi tutta la Sound Bible.</Card>
      </div>
    )
  },
  {
    id: 5,
    title: "Collaborazione con Alice",
    emoji: "🎨",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-2 text-xs">
        <div className="p-2 bg-blue-500/10 border-l-2 border-blue-500">
          <p className="font-bold">Statistiche Nemici</p>
          <p>Se un nemico ha 1000 HP, Alice deve disegnarlo imponente!</p>
        </div>
        <div className="p-2 bg-blue-500/10 border-l-2 border-blue-500">
          <p className="font-bold">Status Effects</p>
          <p>Tu decidi -5 HP/turno, lei disegna l&apos;aura visiva. Fatelo insieme!</p>
        </div>
        <div className="p-2 bg-blue-500/10 border-l-2 border-blue-500">
          <p className="font-bold">Atmosfera Quest</p>
          <p>Dille se il dungeon è cupo o pieno di lava per i suoi colori.</p>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "Collaborazione con Giuliano",
    emoji: "🗺️",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-2 text-xs">
        <div className="p-2 bg-blue-500/10 border-l-2 border-emerald-500">
          <p className="font-bold">Location Quest</p>
          <p>Giuliano deve confermare che l&apos;obiettivo sia raggiungibile.</p>
        </div>
        <div className="p-2 bg-blue-500/10 border-l-2 border-emerald-500">
          <p className="font-bold">Enemy Spawn</p>
          <p>Lui posiziona i nemici in Tiled dove dici tu (bilanciamento).</p>
        </div>
        <div className="p-2 bg-blue-500/10 border-l-2 border-emerald-500">
          <p className="font-bold">Bug Gameplay</p>
          <p>Lui è il Tester: se un nemico non appare, comunicaglielo.</p>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "I Sistemi da Progettare",
    emoji: "⚙️",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <Card>📊 Stats & Balance</Card>
        <Card>📜 Quest System</Card>
        <Card>💬 Dialogue Tree</Card>
        <Card>⚡ Event Bus</Card>
        <Card>⚗️ Status Effects</Card>
        <Card>💾 Save / Load</Card>
        <Card>🌐 Multiplayer</Card>
        <Card>🎵 Audio Design</Card>
      </div>
    )
  },
  {
    id: 8,
    title: "Il Flusso di Lavoro",
    emoji: "🔄",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-3 text-xs border-l border-blue-500/30 ml-2 pl-4">
        <div><strong className="text-blue-300">1. Leggi il capitolo</strong> - Prima di compilare il GDD.</div>
        <div><strong className="text-blue-300">2. Compila tabelle</strong> - Servono numeri esatti, non &quot;circa&quot;.</div>
        <div><strong className="text-blue-300">3. Confrontati</strong> - Fai vedere tutto ad Alice e Giuliano.</div>
        <div><strong className="text-blue-300">4. Registra i suoni</strong> - Usa il cellulare (&lt; 1 sec, nomi chiari).</div>
        <div><strong className="text-blue-300">5. Test</strong> - Quando papà implementa, prova tu per primo.</div>
      </div>
    )
  },
  {
    id: 9,
    title: "Il GDD nel Mondo Reale",
    emoji: "🌍",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-4 text-[11px]">
        <p className="italic opacity-70">Miyamoto (Mario) e Kojima iniziarono con carta e penna.</p>
        <Card className="bg-orange-500/10 border-orange-500/20">
           <strong>Il bilanciamento è scienza:</strong> Blizzard ha un team intero solo per testare le carte di Hearthstone.
        </Card>
        <p className="font-bold text-blue-300">L&apos;audio è il 50% dell&apos;esperienza emotiva!</p>
      </div>
    )
  },
  {
    id: 10,
    title: "Come usare il documento",
    emoji: "📋",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <ul className="space-y-2 text-xs">
        <li>🔢 <strong>Numeri liquidi:</strong> il bilanciamento si scopre giocando.</li>
        <li>📐 <strong>Sii specifico:</strong> &quot;15% probabilità di veleno&quot; è un GDD.</li>
        <li>🔗 <strong>Coordina:</strong> senti il team prima di aver finito tutto.</li>
        <li>🎵 <strong>Sperimenta:</strong> due dita sul tavolo possono essere un suono.</li>
      </ul>
    )
  },
  {
    id: 11,
    title: "Sei pronto.",
    emoji: "🚀",
    accentColor: "text-blue-400",
    accentBg: "bg-blue-900/30",
    accentBorder: "border-blue-500/40",
    content: (
      <div className="space-y-4">
        <p className="text-xs">Inizia compilando le statistiche base e le prime 5 quest. Registra hit.wav.</p>
        <div className="text-center text-blue-400 font-bold italic border-t border-blue-500/20 pt-4">
           &quot;Il GDD è il manifesto del tuo gioco.&quot;
        </div>
      </div>
    )
  }
];

/* ─── Slide Data: GIULIANO (12 slide) ─── */

export const giulianoSlides: SlideContent[] = [
  {
    id: 1,
    title: "ISOMETRIC QUEST",
    emoji: "🏗️",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-4">
        <Terminal title="LevelDesign.dart">
          <p>{`// Level Designer — Isometric Quest v1.0`}</p>
          <p>import &apos;package:flame/components.dart&apos;;</p>
          <p>import &apos;package:tiled/tiled.dart&apos;;</p>
        </Terminal>
        <p className="text-sm leading-relaxed px-2">
          Ciao Giuliano. Hai il ruolo più tecnico. Costruisci mappe con Tiled, fai Pixel Art e gestisci il QA. 
          Questo è il tuo manuale operativo.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "Tech Stack",
    emoji: "⚙️",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-2 text-[11px]">
        <div className="flex justify-between items-center p-2 border-b border-emerald-500/10">
          <span>Flutter / Dart</span>
          <span className="text-emerald-400/50 italic">Framework</span>
        </div>
        <div className="flex justify-between items-center p-2 border-b border-white text-white font-bold bg-emerald-500/10">
          <span>TILED (IL TUO TOOL)</span>
          <span className="text-emerald-400 italic">.tmx creator</span>
        </div>
        <div className="flex justify-between items-center p-2 border-b border-white text-white font-bold bg-emerald-500/10">
          <span>PISKEL / ASEPRITE</span>
          <span className="text-emerald-400 italic">Pixel Art</span>
        </div>
        <div className="flex justify-between items-center p-2 border-b border-emerald-500/10">
          <span>Firebase + Nakama</span>
          <span className="text-emerald-400/50 italic">Backend</span>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Tiled → Flame",
    emoji: "🏗️",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-4">
        <div className="flex justify-center gap-2 items-center text-[10px] text-emerald-400/70 mb-2">
          <span>Tmx</span> ➜ <span>Yaml</span> ➜ <span>Engine</span> ➜ <span>Screen</span>
        </div>
        <Terminal title="FlameLoader.dart">
          <p>map = await TiledComponent.load(</p>
          <p>&nbsp;&nbsp;&apos;village.tmx&apos;, Vector2(64, 32)</p>
          <p>);</p>
          <p>add(map); // Auto-hitbox layers</p>
        </Terminal>
      </div>
    )
  },
  {
    id: 4,
    title: "Dipendenze del Team",
    emoji: "👥",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-3 text-xs">
        <Card><strong>Alice dà:</strong> Disegni reali e palette colori bioma.</Card>
        <Card><strong>Emanuele dà:</strong> GDD con nemici e spawn points.</Card>
        <Card className="bg-emerald-900/20 border-emerald-500/40">
          <strong>Tu dai:</strong> Mappe .tmx, Spritesheet PNG e Bug report.
        </Card>
      </div>
    )
  },
  {
    id: 5,
    title: "Le tue 3+1 Responsabilità",
    emoji: "🗺️",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] leading-tight">
        <Card className="border-l-4 border-l-emerald-500">
           <strong>Level Design</strong> <br/>8 Layer in Tiled (isometric 64x32).
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
           <strong>Pixel Art</strong> <br/>Converti i disegni di Alice in rombi 64x32.
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
           <strong>QA Testing</strong> <br/> Checklist per ogni feature di papà. Bug Report esatti.
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
           <strong>Performance</strong> <br/> Target 60 FPS. Report sotto soglia.
        </Card>
      </div>
    )
  },
  {
    id: 6,
    title: "Tiled: Parametri critici",
    emoji: "🗺️",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="grid grid-cols-2 gap-3">
        <Terminal title="Setup_TMX">
          <p>Type: Isometric</p>
          <p>W: 64px | H: 32px</p>
          <p>Ratio: 2:1</p>
        </Terminal>
        <Terminal title="Layers">
          <p>1. Ground</p>
          <p>2. Elevation</p>
          <p>3. Collision [OBJ]</p>
        </Terminal>
        <div className="col-span-2 p-2 bg-red-950/40 border border-red-500/40 rounded text-[10px] text-red-200">
          ⚠️ Il layer <strong>collision</strong> è OBBLIGATORIO per non attraversare i muri.
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "Pixel Art Specs",
    emoji: "🎨",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-2 text-[11px]">
        <div className="flex gap-4 items-center border-b border-white/10 pb-1">
          <span className="w-20 font-bold shrink-0">Personaggi</span>
          <p>32x32px | Spritesheet orizzontale</p>
        </div>
        <div className="flex gap-4 items-center border-b border-white/10 pb-1">
          <span className="w-20 font-bold shrink-0">Tiles</span>
          <p>64x32px | <strong>Romboidali</strong> (2:1)</p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-20 font-bold shrink-0">Icone</span>
          <p>16x16px | Scalate dalla UI</p>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "QA: Mentalità Tester",
    emoji: "🐛",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-3">
        <p className="text-xs italic">&quot;Fa&apos; cose che un giocatore normale non farebbe.&quot;</p>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <Card className="border-red-500/30">🔴 Critico: Crash</Card>
          <Card className="border-orange-500/30">🟠 Grave: Feature rotta</Card>
          <Card className="border-yellow-500/30">🟡 Medio: Workaround</Card>
          <Card className="border-emerald-500/30">🟢 Lieve: Cosmetico</Card>
        </div>
      </div>
    )
  },
  {
    id: 9,
    title: "Collaborazioni",
    emoji: "🤝",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-tight">
        <Card className="border-fuchsia-500/20">
           <strong>Con Alice:</strong> Chiedi la palette bioma e mostra i rombi prima di caricarli.
        </Card>
        <Card className="border-blue-500/20">
           <strong>Con Emanuele:</strong> Ti serve la posizione delle quest per gli spawn layers.
        </Card>
      </div>
    )
  },
  {
    id: 10,
    title: "Fasi del Progetto",
    emoji: "📅",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="flex flex-wrap gap-2 text-[10px]">
        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">1. Setup Tools</span>
        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">2. Tileset Base</span>
        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">3. Mappa #1</span>
        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-emerald-300 border-emerald-500/30">4. Animazioni</span>
        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">5. QA Sistematico</span>
        <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">6. Polish</span>
      </div>
    )
  },
  {
    id: 11,
    title: "Generazione Procedurale",
    emoji: "🎲",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-2 text-xs">
        <p>Capitolo 076: algoritmi <strong>BSP</strong> per dividere la mappa in foglie e creare dungeon dinamici.</p>
        <Card className="text-[10px]"><strong>Tu crei i Template:</strong> Boschi fitti, stanze shop, corridoi. Il codice li monta a caso!</Card>
      </div>
    )
  },
  {
    id: 12,
    title: "Roadmap Operativa",
    emoji: "🚀",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    accentBorder: "border-emerald-500/40",
    content: (
      <div className="space-y-4">
        <p className="text-xs">Installa Tiled e Piskel. Chiedi l&apos;eroe ad Alice e le quest a Emanuele. Crea la prima mappa isometrica.</p>
        <div className="text-center text-emerald-400 font-bold italic border-t border-emerald-500/20 pt-4">
           &quot;Un gioco senza mappe solide non esiste.&quot;
        </div>
      </div>
    )
  }
];

/* ─── Main Component ─── */

export default function IntroSlideshow({ 
  slides, 
  storageKey, 
  personName, 
  personEmoji, 
  themeColor 
}: IntroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Persistence logic
  useEffect(() => {
    Promise.resolve().then(() => {
      const seen = localStorage.getItem(getStorageKey(storageKey));
      if (seen === null) {
        setIsCollapsed(false);
      }
      setIsReady(true);
    });
  }, [storageKey]);

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const handleFinish = () => {
    localStorage.setItem(getStorageKey(storageKey), "true");
    setIsCollapsed(true);
  };

  const navigate = useCallback((direction: number) => {
    if (isFading) return;
    const nextIndex = currentSlide + direction;
    if (nextIndex >= 0 && nextIndex < slides.length) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentSlide(nextIndex);
        setIsFading(false);
      }, 150);
    }
  }, [currentSlide, slides.length, isFading]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCollapsed) return;
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") setIsCollapsed(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed, navigate]);

  if (!isReady) return null; // Hydration guard

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLast = currentSlide === slides.length - 1;

  // Responsive button label logic
  const toggleLabel = isCollapsed ? `Leggi l'Intro ${personEmoji}` : "Nascondi Intro";
  const themeAccent = themeColor === "fuchsia" ? "fuchsia" : themeColor === "blue" ? "blue" : "emerald";

  return (
    <div className="w-full mb-6">
      {/* Collapse Toggle Button */}
      <button 
        onClick={handleToggle}
        className={`flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider transition-all
          ${isCollapsed ? `text-${themeAccent}-400 hover:text-${themeAccent}-300` : "text-slate-500 hover:text-slate-400"}`}
      >
        <span className={`transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}>
          {isCollapsed ? "▼" : "▲"}
        </span>
        {toggleLabel}
      </button>

      {/* Slideshow Content */}
      <div 
        className={`quest-card overflow-hidden transition-all duration-500 ease-in-out
        ${isCollapsed ? "max-h-0 opacity-0 border-transparent shadow-none" : "max-h-[1200px] opacity-100"}`}
      >
        <div className="flex flex-col h-full bg-slate-950/40">
          
          {/* Header & Progress */}
          <div className="relative pt-6 px-6">
            <div className={`absolute top-0 left-0 h-1 bg-${themeAccent}-500/50 transition-all duration-300`} style={{ width: `${progress}%` }} />
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>[ Slide {currentSlide + 1} di {slides.length} ]</span>
              <button onClick={() => setIsCollapsed(true)} className="hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={`flex-1 p-6 md:p-8 transition-opacity duration-150 ${isFading ? "opacity-0" : "opacity-100"}`}>
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-3xl p-3 rounded-2xl ${slide.accentBg} border ${slide.accentBorder} float`}>
                {slide.emoji}
              </span>
              <h2 className={`text-xl md:text-2xl font-bold font-mono ${slide.accentColor} glow-text`}>
                {slide.title}
              </h2>
            </div>
            
            <div className="min-h-[200px]">
              {slide.content}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(-1)} 
                disabled={currentSlide === 0}
                className={`p-2 rounded-lg border border-slate-700 transition-all disabled:opacity-20 hover:bg-white/5`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5 px-3">
                {slides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setIsFading(true);
                      setTimeout(() => {
                        setCurrentSlide(i);
                        setIsFading(false);
                      }, 150);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all 
                      ${i === currentSlide ? `bg-${themeAccent}-400 w-4` : "bg-slate-700 hover:bg-slate-500"}`}
                  />
                ))}
              </div>

              <button 
                onClick={() => navigate(1)} 
                disabled={isLast}
                className={`p-2 rounded-lg border border-slate-700 transition-all disabled:opacity-20 hover:bg-white/5`}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {isLast ? (
              <button 
                onClick={handleFinish}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                  bg-${themeAccent}-600 hover:bg-${themeAccent}-500 text-white shadow-lg shadow-${themeAccent}-900/20 bounce-in`}
              >
                Ho capito! Inizia le missioni {personEmoji} <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => navigate(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors hidden sm:block"
              >
                Slide Successiva →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
