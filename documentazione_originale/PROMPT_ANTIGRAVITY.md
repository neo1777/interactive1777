# Prompt per Antigravity

---

Devi aggiungere un componente React a un sito Next.js già esistente.

**Il sito:** `https://neo1777.github.io/interactive1777/` — app didattica per tre bambini (Alice, Emanuele, Giuliano) che costruiscono un RPG isometrico con il padre. Stack: Next.js 16, TypeScript, Tailwind CSS 4, lucide-react, React 19. Deploy statico su GitHub Pages.

**Cosa fare:** Creare un componente `IntroSlideshow.tsx` — una presentazione introduttiva animata, nativa nel sito — da aggiungere alla dashboard di ciascun bambino (`alice/page.tsx`, `emanuele/page.tsx`, `giuliano/page.tsx`).

**File che hai a disposizione:**
- `ISTRUZIONI_ANTIGRAVITY.md` — leggi questo per primo e integralmente. Contiene: architettura del progetto, CSS variables del tema, interfaccia TypeScript del componente, comportamento UX richiesto, e il contenuto esatto di tutte e 34 le slide (11 Alice + 11 Emanuele + 12 Giuliano) con titoli, body, card, callout, snippet di codice e testo dei bottoni finali.
- `alice_presentazione.pptx` / `emanuele_presentazione.pptx` / `giuliano_presentazione.pptx` — usa questi come riferimento visivo per layout, palette colori e proporzioni. Il contenuto testuale esatto è già trascritto nel file .md, non è necessario estrarlo dai PPTX.

**Vincoli principali:**
- Zero nuove dipendenze npm
- Il sito è static export: tutto il persistente va in `localStorage` tramite `getStorageKey()` da `@/lib/utils`, sempre dentro `useEffect`
- Il componente deve integrarsi nel dark space theme esistente usando le classi e CSS variables già presenti
- La slideshow deve essere collassabile, con stato persistito in localStorage (collassata dopo la prima visione completa)

**Deliverable:** 4 file modificati/creati:
1. `src/components/IntroSlideshow.tsx` (nuovo)
2. `src/app/alice/page.tsx` (modifica: aggiungi il componente)
3. `src/app/emanuele/page.tsx` (modifica: aggiungi il componente)
4. `src/app/giuliano/page.tsx` (modifica: aggiungi il componente)

Tutto il dettaglio necessario è nel file `.md`. Leggerlo per intero prima di scrivere una riga di codice.
