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

## Mission Implementation

Missions are defined within each role's dashboard or subpages:

1. **Progress Tracking**:
   - Status is persisted in `localStorage`.
   - Use `getStorageKey("iq_mission_name")` to ensure cross-user isolation.
   - Global progress is recalculated in `src/app/page.tsx` via `getProgressForRole`.

2. **Integration Pattern**:
   ```tsx
   import { StepGuide } from "@/components/DidacticUI";
   
   const steps = [
     { emoji: "✏️", title: "Sketch Hero", desc: "Draw in 4 directions", done: hasSavedHero },
     // ...
   ];
   
   <StepGuide steps={steps} />
   ```

---

## Performance Monitoring Activity
Located in `/giuliano/performance`, this special activity uses a real-time simulator to teach **Technical Art** and **Optimization**.
- **Features**: Stress tester (Enemies/Particles), FPS/DrawCall monitoring, "Play" vs "Profile" modes.
- **Technical Goal**: Demonstrate how asset complexity impacts game stability.

---

## Style Guidelines for Activities
- **Colors**: Match the role (Alice: Fuchsia, Emanuele: Teal/Blue, Giuliano: Emerald/Green).
- **Animations**: Use `animate-bounce` for tooltips and `pop-in` for badges.
- **Emojis**: Encouraged for readability and tone, consistent with the trẻ target audience.
