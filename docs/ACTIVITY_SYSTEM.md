# IsoQuest Activity & Mission System

This document describes the gamified didactic framework used in the *Isometric Quest* project to guide and educate users (Alice, Emanuele, and Giuliano) in their respective roles.

## Core Philosophical Principles
- **Gamification**: Every learning step is treated as a "Quest" or "Mission".
- **Visual Feedback**: Use of `XPBadge` and `StepGuide` to show progress.
- **Didactic Layer**: Complex technical concepts are explained via `DidacticTooltip` and `ExamplePanel` with AI-generated visual aids.

---

## UI Components (`src/components/DidacticUI.tsx`)

### 💡 `DidacticTooltip`
Cycles through educational tips.
- **Props**: `tips: string[]`, `emoji?: string`, `interval?: number`.
- **Behavior**: Auto-cycles every 8s (default). Can be dismissed.

### 📖 `ExamplePanel`
A collapsible panel for AI-generated illustrations.
- **Props**: `title: string`, `imageSrc: string`, `imageAlt: string`.
- **Usage**: Use for showing "Ideal results" or "Technical diagrams".

### ⭐ `XPBadge`
Small animated badge for reward feedback.
- **Props**: `xp: number`, `label?: string`.

### 📋 `StepGuide`
A vertical checklist for mission steps.
- **Props**: `steps: { emoji: string; title: string; desc: string; done?: boolean }[]`.

---

## Implemented Missions

### 🧑‍🎨 Mission 1: I Personaggi (Alice)
- **Goal**: Design the hero in 4 directions and create 3 enemy types.
- **Components**: `StepGuide`, `DidacticTooltip`, `MiniCanvas` (multiple).
- **Storage**: `iq_{user}_hero_front`, `iq_{user}_hero_back`, etc.
- **Didactic Focus**: Character silhouettes, isometric perspectives, and scaling enemy difficulty.

### 📦 Mission 2: Gli Oggetti (Alice)
- **Goal**: Create a set of item sprites (potions, swords, keys) with rarity.
- **Components**: `DidacticTooltip`, `ExamplePanel`.
- **Didactic Focus**: Loot design, standard game icons, and inventory management.

### 🗺️ Mission 3: La Mappa (Giuliano)
- **Goal**: Tile-based level design on an isometric grid.
- **Components**: `GridCanvas`, `IsometricToggle`.
- **Didactic Focus**: Tiling, grid systems, and Z-axis depth in 2D games.

---

## Technical Maintenance
- **LocalStorage Cleanup**: To reset progress, clear the `iq_{user}_` prefixed keys.
- **Asset Updates**: AI-generated reference images should be placed in `/public/assets/` and linked via `getAssetPath()`.
