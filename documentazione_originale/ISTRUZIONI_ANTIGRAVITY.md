# ISTRUZIONI: IntroSlideshow Component
## Progetto: Isometric Quest — interactive1777
### Per: Antigravity | Da: Neo1777 + Claude

---

## 0. CONTESTO E OBIETTIVO

Il sito `https://neo1777.github.io/interactive1777/` è una web app didattica per tre bambini (Alice 8 anni, Emanuele 13 anni, Giuliano 16 anni) che collaborano alla costruzione di un videogioco isometrico RPG chiamato **Isometric Quest**, sviluppato dal padre con Flutter/Flame.

Ogni bambino ha una sezione dedicata con missioni interattive. **Il lavoro da fare** è aggiungere a ciascuna sezione un componente di presentazione introduttiva — una slideshow animata in-page che spiega al bambino:
- Cosa è il progetto nel suo insieme
- Qual è il suo ruolo
- Cosa fanno gli altri
- Quando e come collaborare con gli altri
- Come usare il quaderno/documento

Le presentazioni già esistono come **file PowerPoint** (allegati: `alice_presentazione.pptx`, `emanuele_presentazione.pptx`, `giuliano_presentazione.pptx`). Il contenuto di ogni slide è trascritto in dettaglio nella Sezione 4 di questo documento. Il tuo compito è **ricostruirle come componente React nativo** nel sito esistente, rispettando il tema dark space già presente.

---

## 1. STACK TECNOLOGICO DEL PROGETTO

```
Framework:    Next.js 16 (static export per GitHub Pages)
Language:     TypeScript
Styling:      Tailwind CSS 4 (utility-first, JIT)
Icons:        lucide-react ^0.577.0
React:        19.x
Fonts:        Fira Sans (body) + Fira Code (monomi/headings) — Google Fonts via next/font
Deploy:       GitHub Pages (static, output: "export")
```

**Vincoli critici:**
- `output: "export"` — nessun server-side rendering. Tutto è client-side.
- `basePath: "/interactive1777"` — tutti i percorsi asset devono usare `getAssetPath()` (vedi sotto)
- `trailingSlash: true` — ogni route è una cartella con `index.html`
- **Zero nuove dipendenze npm** — il componente deve usare solo React + Tailwind + lucide-react già presenti

---

## 2. STRUTTURA FILE RILEVANTE

```
src/
├── app/
│   ├── globals.css          ← CSS variables e classi custom (vedi Sezione 3)
│   ├── layout.tsx           ← Root layout con Sidebar + TopNav + AuthProvider
│   ├── page.tsx             ← Home page
│   ├── alice/
│   │   ├── page.tsx         ← Dashboard Alice ← QUI VA L'INTRO (modifica)
│   │   ├── effetti/page.tsx
│   │   ├── hud/page.tsx
│   │   └── stati/page.tsx
│   ├── emanuele/
│   │   ├── page.tsx         ← Dashboard Emanuele ← QUI VA L'INTRO (modifica)
│   │   ├── statistiche/page.tsx
│   │   ├── nemici/page.tsx
│   │   └── ... (9 sottopagine)
│   └── giuliano/
│       ├── page.tsx         ← Dashboard Giuliano ← QUI VA L'INTRO (modifica)
│       ├── mappe/page.tsx
│       ├── sprites/page.tsx
│       └── ... (7 sottopagine)
├── components/
│   ├── IntroSlideshow.tsx   ← NUOVO FILE DA CREARE
│   ├── AuthProvider.tsx
│   ├── DidacticUI.tsx       ← pattern di riferimento per tooltip animati
│   ├── Sidebar.tsx
│   └── ...
└── lib/
    ├── storage.ts           ← getStorageKey(key) per localStorage
    └── utils.ts             ← getAssetPath(path) per asset con basePath
```

---

## 3. TEMA E STILI — REGOLE DI INTEGRAZIONE

### 3.1 CSS Variables disponibili in globals.css

```css
--quest-primary:      #0F172A   /* sfondo sidebar, card primario */
--quest-secondary:    #1E293B   /* sfondo card secondario */
--quest-cta:          #22C55E   /* verde CTA principale */
--quest-bg:           #020617   /* sfondo pagina globale */
--quest-text:         #F8FAFC   /* testo principale */
--quest-purple:       #7c3aed
--quest-purple-light: #a78bfa
--quest-gold:         #f59e0b
--quest-gold-light:   #fde68a
--quest-green:        #10b981
--quest-pink:         #ec4899
--quest-card:         rgba(15, 23, 42, 0.6)   /* glass card background */
--quest-card-border:  rgba(148, 163, 184, 0.1) /* card border */
--quest-glass-blur:   blur(12px)
```

### 3.2 Classi Tailwind personalizzate già definite

```css
.quest-card        /* glass card con hover lift, vedi globals.css */
.glow-text         /* text-shadow viola */
.glow-gold         /* text-shadow dorato */
.glow-teal         /* text-shadow teal */
.glow-emerald      /* text-shadow verde */
.float             /* animazione fluttuante 3s loop */
.bounce-in         /* entrata con bounce */
.slide-up          /* entrata con slide verso l'alto */
.tip-box           /* box per suggerimenti didattici */
.breadcrumb        /* breadcrumb navigation */
.btn-primary       /* bottone CTA verde */
.btn-secondary     /* bottone secondario */
```

### 3.3 Pattern esistente per localStorage

```typescript
import { getStorageKey } from "@/lib/storage";

// Lettura
const value = localStorage.getItem(getStorageKey("my_key"));

// Scrittura
localStorage.setItem(getStorageKey("my_key"), JSON.stringify(data));
```

**Sempre wrappare in `Promise.resolve().then(() => { ... })` o `useEffect`** — il localStorage non è disponibile server-side (anche se il sito è statico, Next.js pre-rende in Node).

### 3.4 Utilizzo asset

```typescript
import { getAssetPath } from "@/lib/utils";
// Esempio:
<img src={getAssetPath("/assets/art_director_banner.png")} />
```

### 3.5 Pattern "use client"

**Tutti i file che usano `useState`, `useEffect`, `localStorage` devono avere come prima riga:**
```typescript
"use client";
```

---

## 4. IL COMPONENTE DA CREARE: `IntroSlideshow.tsx`

### 4.1 Posizionamento nel DOM

Il componente va inserito in ciascuna delle tre pagine dashboard (`alice/page.tsx`, `emanuele/page.tsx`, `giuliano/page.tsx`) come **prima sezione** sotto l'header della dashboard, prima del mission grid. Deve essere:

- **Collassabile** — con un bottone "▼ Leggi l'Intro" / "▲ Nascondi Intro"
- **Auto-collassa** dopo la prima volta che l'utente arriva in fondo all'ultima slide (localStorage)
- **Sempre riapribile** — il bottone rimane visibile anche quando collassato

### 4.2 Interfaccia del componente

```typescript
interface SlideContent {
  id: number;
  title: string;
  emoji: string;
  accentColor: string;         // Tailwind color class, es. "text-fuchsia-400"
  accentBg: string;            // Tailwind bg, es. "bg-fuchsia-900/30"
  accentBorder: string;        // Tailwind border, es. "border-fuchsia-500/40"
  content: React.ReactNode;    // JSX del corpo slide
}

interface IntroSlideshowProps {
  slides: SlideContent[];
  storageKey: string;          // es. "alice_intro_seen"
  personName: string;          // es. "Alice"
  personEmoji: string;         // es. "🎨"
  themeColor: string;          // Tailwind class per il colore dominante
}
```

### 4.3 Comportamento UX

1. Al primo accesso: slideshow aperta di default, slide 1 visibile
2. Navigazione: frecce sinistra/destra + punti paginazione cliccabili + swipe (opzionale)
3. All'ultima slide: compare bottone "Ho capito, inizia le missioni! →" che collassa la slideshow e salva su localStorage
4. Accessi successivi: slideshow collassata di default, bottone "Leggi intro →" visibile
5. Progress bar in cima alla slideshow che indica slide X di N
6. Transizione tra slide: fade-out / fade-in (150ms out + 150ms in), o slide laterale

### 4.4 Layout slide

Ogni slide usa questo schema base (adattabile):

```
┌─────────────────────────────────────────────────────────┐
│  [●●●○○○○○○○]  Slide 2 di 11          [X] Chiudi        │  ← progress bar + close
├─────────────────────────────────────────────────────────┤
│                                                         │
│   EMOJI GRANDE (2rem)    TITOLO SLIDE (1.25rem bold)    │
│                                                         │
│   Corpo della slide — testo + cards + icone             │
│   Layout varia per ogni slide (vedi contenuto sotto)    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [◀ Precedente]    ● ● ○ ○ ○ ○ ○ ○ ○    [Successiva ▶] │
└─────────────────────────────────────────────────────────┘
```

---

## 5. CONTENUTO ESATTO DELLE SLIDE — ALICE (11 slide)

**Colore dominante: fuchsia/viola (#ec4899 / #7c3aed)**
**Tono: semplice, affettuoso, emoji ovunque, frasi corte, zero terminologia tecnica**

### Slide 1 — Cover "Ciao Alice!"
- **Titolo:** ISOMETRIC QUEST 🎨
- **Sottotitolo:** Il Quaderno Magico dell'Art Director
- **Corpo:** Card grande rosa con testo: "Stai per diventare l'Art Director di un vero videogioco! Senza i tuoi disegni il gioco non esiste. 🌟"

### Slide 2 — Il Progetto
- **Titolo:** 🎮 Cosa stiamo costruendo insieme?
- **Corpo:** 3 righe con emoji + testo:
  - 🕹️ "Un videogioco vero! Si chiama **Isometric Quest**. È un gioco di avventura dove un eroe esplora un mondo magico, combatte i nemici e completa missioni."
  - 🗺️ "Una mappa grande con tre zone: il Villaggio 🏘️, la Foresta 🌲 e il Dungeon 🏔️"
  - 💻 "Papà scrive il codice con Flutter e Flame, un motore per giochi!"

### Slide 3 — La Squadra
- **Titolo:** 👥 La Squadra di Isometric Quest
- **Corpo:** 4 card colorate in griglia 2×2 (o fila):
  - 🎨 **Alice** / Art Director / "Disegna i personaggi, gli oggetti e la mappa. Decide i colori e lo stile." (rosa)
  - 🎮 **Emanuele** / Game Designer & Sound / "Inventa le regole del gioco, i numeri, le missioni e i suoni!" (blu)
  - 🗺️ **Giuliano** / Level Designer & QA / "Costruisce le mappe, crea i pixel art e trova i bug!" (verde)
  - 💻 **Papà** / Programmatore / "Scrive tutto il codice Dart/Flutter/Flame. Fa funzionare il gioco!" (arancio)

### Slide 4 — Il Tuo Ruolo
- **Titolo:** 🎨 Il tuo ruolo: Art Director!
- **Corpo:** Lista 5 punti con emoji:
  - ✏️ Disegni i personaggi: l'eroe, i nemici, gli amici
  - 🎁 Crei le icone degli oggetti: spade, pozioni, chiavi
  - 🗺️ Disegni la mappa del mondo con tutti i colori
  - ✨ Decidi come appaiono gli effetti magici e la luce
  - 🖥️ Progetti come appare il menu e lo schermo di gioco
- **Callout colorato:** "Senza di te il gioco non esiste! 🌟"

### Slide 5 — Cosa Fanno gli Altri
- **Titolo:** 👥 Cosa fanno gli altri del team?
- **Corpo:** 3 card colorate (Emanuele / Giuliano / Papà) con 4 bullet ciascuna:
  - **Emanuele:** Decide quanta vita ha l'eroe (es. 100 HP) | Inventa le missioni del gioco | Scrive i dialoghi dei personaggi | Registra i suoni con il telefono!
  - **Giuliano:** Costruisce le mappe con un programma speciale (Tiled) | Trasforma i tuoi disegni in pixel art | Gioca al gioco e trova i bug | Verifica che tutto funzioni bene
  - **Papà:** Scrive il codice che fa muovere i personaggi | Mette i tuoi disegni dentro il gioco | Costruisce tutto il resto del motore | Pubblica il gioco sullo store!

### Slide 6 — Quando Parlare con Emanuele
- **Titolo:** 🗣️ Quando parlare con Emanuele?
- **Corpo:** 4 card ognuna con header "📌 [QUANDO]" + spiegazione:
  - 📌 PRIMA di disegnare un nemico → "Emanuele ti dice quanto deve sembrare pericoloso! Se ha 1000 HP è fortissimo, va disegnato grande e spaventoso."
  - 📌 PRIMA di disegnare un oggetto → "Lui sa se l'oggetto è raro o comune. Un oggetto leggendario deve sembrare speciale!"
  - 📌 Hai finito la mappa → "Lui controlla che le zone siano nel posto giusto per le sue missioni."
  - 📌 Inventi un effetto magico → "Lui ti dice che tipo di potere è: fuoco? Ghiaccio? E tu lo disegni nel modo giusto!"

### Slide 7 — Quando Parlare con Giuliano
- **Titolo:** 🗣️ Quando parlare con Giuliano?
- **Corpo:** 4 card simili alla slide 6:
  - 📌 Quando hai finito un disegno → "Lui lo trasforma in pixel art per metterlo nel gioco! Non deve essere perfetto, l'importante è che sia chiaro."
  - 📌 Vuoi capire le dimensioni → "I personaggi sono 32x32 pixel e le tile del terreno sono 64x32. Ti spiega lui cosa significa!"
  - 📌 Hai finito la mappa → "Usa il tuo disegno come guida per costruire le mappe nel computer con Tiled."
  - 📌 Trovi qualcosa di strano nel gioco → "Lui è il QA Tester: se i tuoi disegni sembrano sbagliati nel gioco, è lui che capisce perché!"

### Slide 8 — Le 6 Missioni
- **Titolo:** 🗺️ Le tue 6 Missioni nel quaderno!
- **Corpo:** Griglia 2×3 di card colorate (una per missione):
  1. 🦸 I Personaggi — "Disegna l'eroe in 4 direzioni, i nemici, gli NPC del villaggio"
  2. 🎁 Gli Oggetti — "Disegna le icone di 8+ oggetti: armi, pozioni, chiavi e l'artefatto leggendario!"
  3. 🗺️ La Mappa — "Disegna la mappa del mondo con le 3 zone e i colori di ogni bioma"
  4. ✨ Effetti Visivi — "Decidi come appare l'acqua, la nebbia, il ciclo giorno/notte e i poteri magici!"
  5. 🖥️ HUD e Menu — "Disegna lo schermo di gioco con barre vita, monete e il menu principale"
  6. ⚗️ Status Effects — "Crea l'aspetto di 8 effetti speciali: veleno, fuoco, ghiaccio, benedizione..."

### Slide 9 — Come Usare il Quaderno
- **Titolo:** 📖 Come si usa il quaderno?
- **Corpo:** Lista numerata 5 passi con emoji:
  1. 📖 Leggi la missione — "All'inizio di ogni sezione c'è spiegato cosa fare. Leggi bene prima di iniziare!"
  2. ✏️ Disegna! — "Usa matite colorate, pennarelli, quello che vuoi. Non devono essere perfetti, devono essere TUOI!"
  3. 💬 Parla con il team — "Prima di alcune missioni, chiedi a Emanuele o Giuliano. La collaborazione è parte del lavoro!"
  4. 📸 Fotografa tutto — "Quando hai finito un disegno, fotografalo! Così Giuliano può trasformarlo in pixel art."
  5. ✅ Spunta la checklist — "Alla fine c'è una lista di controllo. Spunta ogni cosa completata!"

### Slide 10 — Il Risultato Finale
- **Titolo:** 🎉 Il risultato finale
- **Corpo:** Testo grande centrato:
  - Titolo: "I tuoi disegni si muovono nel gioco!"
  - Paragrafo: "Quando giocherai a Isometric Quest, vedrai i **tuoi personaggi** muoversi nella **tua mappa** raccogliendo i **tuoi oggetti**."
  - Callout rosa: "Sei la persona più importante del team! 💜"

### Slide 11 — Sei Pronta? (ultima slide)
- **Titolo:** ✨ Sei pronta? ✨
- **Corpo:** Lista 5 passi concreti:
  1. Prendi matite e pennarelli colorati
  2. Apri il quaderno alla Missione 1
  3. Parla con Emanuele prima di disegnare i nemici
  4. Disegna, colora, inventa — senza paura! ✏️
  5. Fotografa ogni disegno finito 📸
- **Bottone finale:** "Ho capito! Inizia le missioni 🎨 →" (cliccare collassa l'intro)
- Footer: "Buon lavoro, Art Director! 🎨🌟"

---

## 6. CONTENUTO ESATTO DELLE SLIDE — EMANUELE (11 slide)

**Colore dominante: blu (#1565C0) con accento arancio (#E65100)**
**Tono: professionale ma accessibile a 13 anni, usa terminologia GDD reale, riferimenti a giochi famosi**

### Slide 1 — Cover
- **Titolo:** ISOMETRIC QUEST
- **Sottotitolo:** Game Design Document & Sound Bible
- **Corpo:** "Ciao Emanuele! Il Game Designer è il cervello del gioco. Tu decidi le regole, inventi le storie, progetti i sistemi e registri i suoni. Senza un GDD solido, il gioco è caos. Con il tuo GDD, diventa un prodotto."

### Slide 2 — Il Progetto
- **Titolo:** 📋 Il Progetto: Isometric Quest
- **Corpo:** Due colonne:
  - **🕹️ Cosa stiamo costruendo:** Un RPG isometrico 2D (come i classici Zelda o Diablo) | L'eroe esplora 3 zone: Villaggio → Foresta → Dungeon | Sistema di combattimento, inventario, quest, dialoghi NPC | Pubblicabile su Android, iOS e browser | Multiplayer online nella versione avanzata
  - **⚙️ Stack tecnologico:** Flutter 3.5+ (framework) | Dart (linguaggio) | Flame ^1.21 (game engine) | Tiled (level editor — Giuliano) | Firebase (cloud save) | Nakama (multiplayer server)

### Slide 3 — Il Team
- **Titolo:** 👥 Il Team e i Ruoli
- **Corpo:** Schema con Emanuele al centro, frecce verso Alice / Giuliano / Papà + card per ogni membro che mostra cosa dà/riceve:
  - **Alice dà:** Disegni personaggi | Icone oggetti | Mappa del mondo | Palette colori | Status effect visivi
  - **Giuliano dà:** Mappe Tiled (.tmx) | Sprite pixel art | Bug report | Performance test
  - **Papà dà:** Codice funzionante | Nuove feature | Feedback tecnico | Review del GDD

### Slide 4 — Il Tuo Ruolo
- **Titolo:** 🎮 Il tuo ruolo: Game Designer
- **Corpo:** 6 card in griglia 2×3:
  - 📊 Game Balance — "Decidi HP, attacco, difesa, velocità. Devi trovare l'equilibrio: né troppo facile né impossibile."
  - 📜 Quest Design — "Scrivi le missioni: obiettivo, ricompensa, storia, ordine. Le quest sono il motore narrativo."
  - 💬 Dialogue Writing — "Scrivi i dialoghi degli NPC con scelte multiple. Un buon dialogo fa venire voglia di parlare con tutti."
  - ⚡ Game Events — "Definisci cosa succede quando: nemico sconfitto, livello salito, boss appare, quest completata."
  - ⚗️ Status Effects — "Bilancia i numeri degli effetti speciali: veleno, ghiaccio, fuoco. Coordinati con Alice per il visual."
  - 🎵 Sound Engineering — "Registra i suoni con il telefono usando oggetti di casa. Poi papà li integra nel gioco."
- **Sidebar testuale:** "Nel mondo reale il Game Designer è quello che, prima ancora che esista una riga di codice, scrive il documento che spiega TUTTO. Miyamoto (Mario), Kojima (Metal Gear), Miyazaki (Dark Souls) iniziarono tutti con carta e penna."

### Slide 5 — Collaborazione con Alice
- **Titolo:** 🎨 Quando collaborare con Alice?
- **Corpo:** 4 card con schema "📌 [QUANDO] → [PERCHÉ]":
  - Prima di assegnare statistiche ai nemici → "Dì ad Alice il livello di pericolosità: un nemico con 1000 HP deve sembrare imponente."
  - Quando definisci i status effects → "Tu scrivi i numeri: avvelenato = -5 HP/turno per 3 turni. Lei disegna l'aura visiva. Fatelo insieme!"
  - Quando scrivi le quest → "Se la quest 3 si svolge nel dungeon, Alice ha bisogno di sapere l'atmosfera: cupa, spaventosa, piena di lava?"
  - Dopo aver scritto i dialoghi → "Alice deve sapere quante espressioni facciali servono per ogni NPC."

### Slide 6 — Collaborazione con Giuliano
- **Titolo:** 🗺️ Quando collaborare con Giuliano?
- **Corpo:** 4 card simili:
  - Prima di finalizzare le quest → "Ogni quest ha una location. Giuliano deve confermare che l'obiettivo sia raggiungibile sulla mappa."
  - Quando progetti il sistema di spawn nemici → "Quanti nemici? Dove? Con quale difficoltà crescente? Giuliano posiziona gli enemy_spawn in Tiled."
  - Quando definisci gli eventi di gioco → "Se un evento richiede una porta che si apre o un tesoro nascosto, Giuliano deve saperlo in anticipo."
  - Quando trovi bug nel gameplay → "Giuliano è il QA Tester. Se un nemico non appare dove dovrebbe, comunicaglielo con precisione."

### Slide 7 — I Sistemi da Progettare
- **Titolo:** ⚙️ I Sistemi che devi Progettare
- **Corpo:** 8 card in griglia 4×2 con riferimento capitoli:
  - 📊 Stats & Balance — "HP, ATK, DEF, SPD, livellamento XP" — Cap 029-033
  - 📜 Quest System — "Tipo, obiettivo, ricompensa, ordine, unlock" — Cap 035
  - 💬 Dialogue Tree — "NPC → scelte → conseguenze → stato gioco" — Cap 036
  - ⚡ Event Bus — "NEMICO_SCONFITTO → XP → quest → suono" — Cap 041
  - ⚗️ Status Effects — "Avvelenato, Bruciato, Congelato + cure" — Cap 040
  - 💾 Save / Load — "Quando, cosa, quanti slot, cloud save" — Cap 037/063
  - 🌐 Multiplayer — "Cooperativo vs. PvP, social, classifica" — Cap 065-068
  - 🎵 Audio Design — "18 SFX + musica per 3 biomi" — Cap 011

### Slide 8 — Flusso di Lavoro
- **Titolo:** 🔄 Il Flusso di Lavoro
- **Corpo:** Timeline verticale 5 passi con numero + titolo + descrizione:
  1. **Leggi il capitolo** — "Prima di compilare ogni sezione del GDD, leggi il relativo capitolo del libro."
  2. **Compila il GDD** — "Riempi le tabelle con valori precisi. 'circa 100' non è un GDD. '100 esatti' lo è."
  3. **Confrontati col team** — "Mostra le decisioni ad Alice (aspetto) e Giuliano (fattibilità mappa)."
  4. **Registra i suoni** — "Con il telefono, in una stanza silenziosa. Ogni SFX < 1 secondo. Dai un nome chiaro: hit.wav, non suono3.wav."
  5. **Test e revisione** — "Quando papà implementa la feature, testala tu per primo."

### Slide 9 — Il GDD nel Mondo Reale
- **Titolo:** 🌍 Il GDD nel Mondo Reale
- **Corpo:** Banner informativo + 4 card fatti reali:
  - 🏆 Game Designer famosi — "Miyamoto (Mario, Zelda), Kojima (Metal Gear), Miyazaki (Dark Souls). Tutti iniziarono con carta e penna."
  - 💡 Il bilanciamento è una scienza — "Blizzard ha un team intero dedicato solo al bilanciamento di Hearthstone. Ogni carta viene testata migliaia di volte."
  - 💬 I dialoghi contano — "The Witcher 3 ha 450.000 parole di dialogo — più di due Harry Potter completi."
  - 🎵 L'audio è il 50% — "Il 47% del ricordo emotivo di un'esperienza ludica è legato al suono, non all'immagine."

### Slide 10 — Come Usare il Documento
- **Titolo:** 📋 Come usare il tuo documento
- **Corpo:** Lista 5 regole pratiche:
  - 🔢 **I numeri si cambiano** — Non c'è un valore 'perfetto' da trovare al primo colpo. Il bilanciamento si scopre giocando.
  - 📐 **Sii specifico** — "La Spada del Tuono causa 45 danni base, con il 15% di probabilità di applicare Paralizzato per 2 turni" è un GDD.
  - 🔗 **Coordina con il team PRIMA** — Non aspettare di aver finito tutto.
  - 🎵 **I suoni: fallo davvero** — "Due dita sul tavolo a ritmo. 0.5 secondi. Funziona."
  - 📝 **Documenta i cambiamenti** — Quando cambi un numero, scrivi il perché in un appunto a margine.

### Slide 11 — Sei Pronto? (ultima slide)
- **Titolo:** 🚀 Sei pronto. Inizia.
- **Corpo:** Lista 6 step concreti numerati:
  1. Leggi il Cap 000 del libro per capire la struttura complessiva del progetto.
  2. Compila la Sezione 1: le statistiche base. Non perfette — compilate.
  3. Parla con Alice: descrivi i tre nemici e il loro livello di pericolosità.
  4. Parla con Giuliano: spiega le 3 zone della mappa e le quest principali.
  5. Compila le quest (#1 tutorial → #6 boss) nell'ordine esatto.
  6. Registra i primi 5 suoni con il telefono. Inizia da hit.wav e pickup.wav.
- **Bottone finale:** "Ho capito! Inizia le missioni 🎮 →"
- **Footer quote:** "Il GDD non è un compito. È il manifesto del tuo gioco."

---

## 7. CONTENUTO ESATTO DELLE SLIDE — GIULIANO (12 slide)

**Colore dominante: verde (#1B5E20 / #43A047) con accento ambra (#FF8F00)**
**Tono: tecnico, diretto, usa terminologia reale (Tiled, layer, .tmx, spritesheet, regression testing)**
**Dettaglio estetico: sfondo scuro quasi nero con accenti verde, stile da IDE/terminale**

### Slide 1 — Cover
- **Titolo:** ISOMETRIC QUEST
- **Sottotitolo:** Level Design & Technical QA Handbook
- **Dettaglio estetico:** Righe di codice Dart/Flutter in background con bassa opacità:
  ```
  // Level Designer — Isometric Quest v1.0
  import 'package:flame/components.dart';
  import 'package:tiled/tiled.dart';
  ```
- **Corpo:** "Ciao Giuliano. Hai il ruolo più tecnico del team. Tre responsabilità: costruire le mappe con Tiled, trasformare i disegni di Alice in pixel art e testare ogni feature non appena papà la implementa. Questo documento è la tua guida operativa."

### Slide 2 — Tech Stack
- **Titolo:** ⚙️ Il Tech Stack: cosa usa papà
- **Intro:** "Capire lo stack tecnologico ti permette di produrre asset compatibili fin da subito."
- **Corpo:** 6 righe in tabella/lista con evidenza sui tool di Giuliano:
  - Flutter 3.5+ → Framework base | gestisce rendering, input, audio, UI
  - Dart 3.5+ → Linguaggio | tipizzazione statica, null safety
  - Flame ^1.21 → Game Engine | FCS (Flame Component System), SpriteAnimationComponent
  - **[TILED - TUO TOOL]** Tiled (esterno) → Level Editor | produce .tmx, parametri ESATTI richiesti
  - **[PISKEL - TUO TOOL]** Piskel / Aseprite → Pixel Art | esporta spritesheet PNG orizzontale
  - Firebase + Nakama → Backend/Multiplayer | cloud save, autenticazione, server online

### Slide 3 — Come Tiled si Connette a Flame
- **Titolo:** 🏗️ Come si connette Tiled a Flame
- **Corpo:** Pipeline visuale (5 frecce):
  `Tiled (.tmx)` → `pubspec.yaml + flutter build` → `flame_tiled` → `Flame FCS (componenti)` → `Schermo del giocatore`
- **Snippet codice** (style terminale/IDE):
  ```dart
  class IsometricQuestGame extends FlameGame {
    late TiledComponent map;
    @override
    Future<void> onLoad() async {
      map = await TiledComponent.load('village_01.tmx', Vector2(64, 32));
      add(map); // Il layer 'collision' crea automaticamente le hitbox
    }
  }
  ```

### Slide 4 — Il Team
- **Titolo:** 👥 Il Team: dipendenze e responsabilità
- **Corpo:** Grafo dipendenze con Giuliano come nodo output:
  - Da **Alice** ricevi: Disegni personaggi 4 direzioni | Palette colori per bioma | Icone oggetti | Descrizione effetti visivi
  - Da **Emanuele** ricevi: GDD con statistiche nemici | Posizione e tipo quest | Lista spawn locations | Decisioni bilanciamento
  - **Tu dai al team:** Mappe .tmx funzionanti | Sprite PNG pronti | Bug report strutturati | FPS e performance report

### Slide 5 — Le Tue 3+1 Responsabilità
- **Titolo:** 🗺️ Le tue 3+1 responsabilità
- **Corpo:** 4 card con accent bar verticale colorata (stile IntelliJ sidebar):
  - 🗺️ **Level Design con Tiled** — "Costruisci le mappe isometriche in .tmx con 8 layer per mappa: ground, terrain_detail, buildings, elevation, objects, entities, collision, water. I parametri 64×32 tile in modalità isometrica non si toccano." → Cap 016, 019, 038
  - 🎨 **Pixel Art con Piskel/Aseprite** — "Prendi i disegni di Alice e convertili in spritesheet PNG a 32×32 (personaggi) o 64×32 (tile isometriche). Le tile isometriche sono rombi: i 4 angoli del rettangolo toccano i bordi." → Cap 007, 008, 023, 024
  - 🐛 **QA Testing sistematico** — "Non 'giocare' al gioco: testarlo. Per ogni feature implementata da papà, esegui la checklist. Documenta ogni bug con: gravità, how-to-reproduce, expected vs actual, screenshot." → Cap 052, 053
  - ⚡ **Performance monitoring** — "Misura gli FPS nei scenari critici. Target: 60 FPS desktop, 30 FPS mobile mid-range. Sotto soglia → bug report immediato." → Cap 054, 073

### Slide 6 — Tiled: Parametri e Layer
- **Titolo:** 🗺️ Tiled: parametri e layer critici
- **Corpo:** Due colonne con stile terminale/console:
  - **Colonna sinistra — Parametri ESATTI (non cambiare):**
    ```
    Orientamento:   Isometric
    Tile Width:     64 px  ← CRITICO
    Tile Height:    32 px  ← CRITICO
    Map Size:       30 × 30 tiles (espandibile)
    Render Order:   Right Down
    Output:         .tmx (default Tiled)
    Rapporto W:H:   2:1 (64÷32 = 2.0)
    ```
  - **Colonna destra — Stack 8 Layer (dal basso verso l'alto):**
    ```
    [1] ground         Tile (layer base)
    [2] terrain_detail Tile
    [3] buildings      Tile
    [4] elevation      Tile
    [5] water          Tile
    [6] objects        Object
    [7] entities       Object
    [8] collision      Object ← invisibile ma obbligatorio
    ```
  - **Box warning rosso:** "⚠️ Il layer 'collision' è OBBLIGATORIO. Senza di esso il personaggio attraversa muri, alberi e acqua. Disegna rettangoli intorno a tutto ciò che non si deve attraversare."

### Slide 7 — Pixel Art: Specifiche Tecniche
- **Titolo:** 🎨 Pixel Art: specifiche tecniche
- **Corpo:** Tabella con 5 righe (highlight verde per i campi critici):
  - Personaggi (eroe, nemici, NPC): 32×32 px | 2-7 frame | Spritesheet orizzontale. Flame usa frameIndex per l'animazione.
  - Boss: 64×64 px | 4+ frame | Stesso logica spritesheet, frame più grandi.
  - Tile isometriche (terreno): 64×32 px | 1 frame | **FORMA ROMBO**, non quadrato. I 4 angoli toccano i 4 bordi del rettangolo.
  - Tile animate (acqua, lava): 64×32 px | 2-3 frame | Stessa dimensione tile, animazione a loop.
  - Icone inventario (oggetti): 16×16 px | 1-2 frame | Le icone vengono scalate dalla UI. Mantieni pixel leggibili.
- **Footer naming convention:** `hero_walk_down.png` | `slime_idle.png` | `tile_grass.png` — niente spazi, niente maiuscole

### Slide 8 — QA Testing
- **Titolo:** 🐛 QA Testing: la mentalità giusta
- **Intro:** "La regola d'oro del QA: fa' cose che un giocatore normale non farebbe. Attacca un muro. Entra nell'acqua. Compra qualcosa con 0 oro. Esci dalla mappa."
- **Corpo:** Due colonne:
  - **Scala Gravità Bug:**
    - 🔴 Critico — Il gioco crasha. Zero workaround. Stop a tutto.
    - 🟠 Grave — Feature principale non funziona.
    - 🟡 Medio — Fastidio rilevante ma workaround esiste.
    - 🟢 Lieve — Problema cosmetico o rarissimo.
  - **Struttura Bug Report:**
    - `#ID` progressivo univoco
    - Gravità 🔴🟠🟡🟢
    - Dove succede (mappa/menu/combat)
    - How to reproduce: 1. 2. 3. (ESATTI)
    - Expected: cosa dovrebbe succedere
    - Actual: cosa succede invece
    - Screenshot se disponibile
    - Capitolo correlato
- **Warning:** "⚠️ Regression testing: ogni volta che papà fa un fix, riprova le feature precedenti. I fix rompono spesso cose che funzionavano."

### Slide 9 — Collaborazione con Alice e Emanuele
- **Titolo:** 🤝 Con chi e quando collaborare
- **Corpo:** Due colonne:
  - **Con Alice:**
    - Prima del pixel art → "Chiedi la palette colori del bioma e le dimensioni concordate."
    - Durante il pixel art → "Mostra sketch intermedi. La tile di erba in forma di rombo va approvata prima che tu crei tutto il set."
    - Dopo la mappa → "Verifica che i colori delle tile corrispondano alla palette di Alice."
    - Trovata un'incongruenza → "Confronta il pixel art con il disegno originale prima di aprire un bug."
  - **Con Emanuele:**
    - Prima di costruire la mappa → "Hai bisogno del GDD con le quest: devi sapere dove mettere gli spawn."
    - Decidendo gli enemy_spawn → "Emanuele ha già bilanciato le statistiche, tu posiziona i nemici in modo che la difficoltà cresca."
    - Trovato un bug di gameplay → "Potrebbe essere una decisione di design, non un bug del codice."
    - Dopo la mappa completata → "Una quest potrebbe essere fisicamente non raggiungibile con il layout scelto."

### Slide 10 — Fasi del Progetto
- **Titolo:** 📅 Le fasi del progetto (in ordine)
- **Corpo:** 6 card in griglia 3×2 (stile Kanban):
  - Fase 1 Setup — "Installa Tiled e Piskel. Leggi i Cap 001-012 del libro. Crea la mappa vuota con parametri corretti." → Cap 001-012
  - Fase 2 Asset base — "Crea il tile set base: erba, terra, pietra, acqua. Pixel art dell'eroe in idle." → Cap 013-016
  - Fase 3 Mappa 1 — "Costruisci village_01.tmx con tutti e 8 i layer. Testa che Flame la carichi senza errori." → Cap 016, 019
  - Fase 4 Animazioni — "Aggiungi walk, attack, idle. Poi foresta e dungeon. Tile animate (acqua)." → Cap 007, 008, 024
  - Fase 5 QA — "Per ogni capitolo implementato, esegui la checklist. Documenta tutti i bug trovati." → Cap 052, 053, 054
  - Fase 6 Polish — "Zona bonus, elevazione, ottimizzazione performance su mobile." → Cap 073, 076

### Slide 11 — Generazione Procedurale (Bonus)
- **Titolo:** 🎲 Bonus: Generazione Procedurale
- **Intro:** "La generazione procedurale (Cap 076) crea mappe automaticamente usando algoritmi. Tu puoi progettare le regole: il computer genera i contenuti. Minecraft, Terraria, Hades la usano."
- **Corpo:** Due colonne:
  - **Algoritmo BSP (Binary Space Partitioning):** 1. Dividi la mappa in 2 parti | 2. Ripeti su ogni parte | 3. In ogni 'foglia' crea una stanza | 4. Collega le stanze con corridoi | 5. Popola con nemici | 6. Risultato: dungeon sempre diverso!
  - **Il tuo contributo:** Room templates (crei stanze tipo in Tiled) | Prefab zones (alcune aree fisse: boss room, shop) | Biome rules (quali tile in quale bioma) | Density control (quanti nemici, quanti bauli)

### Slide 12 — Roadmap Operativa (ultima slide)
- **Titolo:** 🚀 Roadmap operativa: parti da qui
- **Corpo:** Lista 7 step progressivi con numero colorato:
  1. Installa Tiled (mapeditor.org) e verifica che apra correttamente.
  2. Leggi la sezione Layer del manuale. Crea una mappa vuota con i parametri ESATTI: Isometric, 64×32, 30×30.
  3. Chiedi ad Alice i disegni dell'eroe + la palette del villaggio prima di creare qualsiasi tile.
  4. Chiedi a Emanuele il GDD base: posizioni NPC, quest #1, quest #2 e lo spawn point del giocatore.
  5. Costruisci village_01.tmx con 8 layer. Metti tutto il collision layer per primo: è il più critico.
  6. Apri Piskel. Crea hero_idle.png (32×32, 2 frame). È il tuo primo test del workflow spritesheet.
  7. Quando papà carica la mappa, giocaci e apri il bug log. Primo bug report entro 10 minuti dal test.
- **Bottone finale:** "Ho capito! Inizia le missioni 🗺️ →"
- **Footer quote:** "Un gioco senza mappe solide non esiste. Un gioco senza QA è pieno di bug. Il tuo lavoro tiene tutto insieme."

---

## 8. INTEGRAZIONE NELLE PAGINE DASHBOARD

### 8.1 alice/page.tsx — dove inserire il componente

Aggiungere **sopra** la sezione `{/* Dashboard Header */}` esistente, come primo elemento dentro `<div className="w-full max-w-4xl">`:

```tsx
import IntroSlideshow from "@/components/IntroSlideshow";
import { aliceSlides } from "@/components/IntroSlideshow";

// Dentro il return, prima del quest-card header:
<IntroSlideshow
  slides={aliceSlides}
  storageKey="alice_intro_seen"
  personName="Alice"
  personEmoji="🎨"
  themeColor="fuchsia"
/>
```

### 8.2 emanuele/page.tsx — dove inserire

Stessa posizione, prima del `{/* Dashboard Header */}`:

```tsx
import IntroSlideshow from "@/components/IntroSlideshow";
import { emanueleSlides } from "@/components/IntroSlideshow";

<IntroSlideshow
  slides={emanueleSlides}
  storageKey="emanuele_intro_seen"
  personName="Emanuele"
  personEmoji="🎮"
  themeColor="blue"
/>
```

### 8.3 giuliano/page.tsx — dove inserire

```tsx
import IntroSlideshow from "@/components/IntroSlideshow";
import { giulianoSlides } from "@/components/IntroSlideshow";

<IntroSlideshow
  slides={giulianoSlides}
  storageKey="giuliano_intro_seen"
  personName="Giuliano"
  personEmoji="🗺️"
  themeColor="emerald"
/>
```

---

## 9. NOTE TECNICHE IMPORTANTI

### 9.1 Static export e localStorage

Il sito è completamente statico (GitHub Pages). Non esiste un server. **Tutto il persistente va in localStorage**. Il componente deve:

1. NON usare localStorage durante il rendering (SSR di Next anche su static export pre-rende in Node)
2. Leggere localStorage SEMPRE in `useEffect` o `Promise.resolve().then()`
3. Usare `getStorageKey(key)` da `@/lib/storage` per namespace corretto

### 9.2 Navigazione keyboard-friendly

Il sito è usato anche da bambini su mobile e tablet. Il componente slideshow deve:
- Essere navigabile con frecce sinistra/destra della tastiera (`keydown` event)
- Avere bottoni grandi e tap-friendly (min 44px touch target)
- Swipe gesture (opzionale ma gradita): `touchstart`/`touchend` con delta > 50px

### 9.3 Animazioni — rispetta il tema

Usare le animazioni CSS già presenti nel sito (`slide-up`, `bounce-in`) dove possibile. Per la transizione tra slide, una semplice opacity transition con `transition-opacity duration-150` è sufficiente e consistente col resto del sito.

### 9.4 Responsive

Il sito è usato su tutti i device. Il componente deve:
- Su mobile: layout slide a colonna singola, testo più grande
- Su desktop: layout a 2 colonne dove indicato (card grids, team layout)
- Usare le breakpoint Tailwind standard: `sm:`, `md:`, `lg:`

### 9.5 Accessibilità minima

- `aria-label` sui bottoni di navigazione
- `role="region"` sulla slideshow con `aria-label="Introduzione"`
- Non bloccare lo scroll della pagina quando la slideshow è aperta

---

## 10. STRUTTURA FILE SUGGERITA

```
src/components/IntroSlideshow.tsx     ← componente principale + slide data
```

Il file può contenere tutto: il componente React, le interfacce TypeScript, e i dati delle 3 presentazioni (come array di oggetti). Non è necessario spezzare in file multipli dato che il contenuto è self-contained.

Struttura suggerita del file:

```typescript
"use client";
// 1. Imports
// 2. Interface SlideContent
// 3. Interface IntroSlideshowProps  
// 4. export const aliceSlides: SlideContent[]   ← dati Alice
// 5. export const emanueleSlides: SlideContent[] ← dati Emanuele
// 6. export const giulianoSlides: SlideContent[] ← dati Giuliano
// 7. export default function IntroSlideshow(...)  ← componente
```

---

## 11. FILE ALLEGATI DISPONIBILI

I seguenti file sono forniti come riferimento visivo e di contenuto:

- `alice_presentazione.pptx` — 11 slide, colori viola/fuchsia, per Alice 8 anni
- `emanuele_presentazione.pptx` — 11 slide, colori navy/arancio, per Emanuele 13 anni
- `giuliano_presentazione.pptx` — 12 slide, colori verde scuro/ambra, per Giuliano 16 anni

**Nota:** Il contenuto testuale esatto di ogni slide è già trascritto in questo documento (Sezioni 5, 6, 7). I file PPTX servono come riferimento visivo per il layout e i colori — non è necessario convertirli o leggerli programmaticamente.

---

## 12. DELIVERABLE ATTESO

1. **`src/components/IntroSlideshow.tsx`** — nuovo file con il componente completo + dati delle 3 presentazioni
2. **`src/app/alice/page.tsx`** — modificato per includere `<IntroSlideshow>`
3. **`src/app/emanuele/page.tsx`** — modificato per includere `<IntroSlideshow>`
4. **`src/app/giuliano/page.tsx`** — modificato per includere `<IntroSlideshow>`

Nessun'altra modifica al progetto è necessaria. Nessuna nuova dipendenza npm.

---

*Fine documento — versione 1.0*
