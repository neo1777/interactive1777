# Alice Art Director — Isometric Quest

A comprehensive web application designed as an interactive workbook and art-direction tool for capturing sketches and metadata, offering mission-based progression, mini-games, and a personal gallery.

## Features

### 🦸 Alice Hub (Art Director)
- **Interactive Drawing Board**: Advanced canvas with brushes, colors, flood fill, and a smoothing assistant (`perfect-freehand`).
- **Mission Progression**:
  - **Mission 1: I Personaggi**: Design heroes and enemies in 4 directions.
  - **Mission 2: Gli Oggetti**: Create item loot sets with rarity and descriptions.
  - **Mission 3: La Mappa**: Design the overworld with terrain types and POIs.
  - **Mission 4: Le Emozioni**: Sketch character facial expressions and reactions.
- **Gallery**: View and manage all saved sketches and mission progress.

### 🎮 Emanuele Hub (Game Designer)
- **Mechanics Design**: Define rules, stats, and gameplay loops.
- **Enemy Balancing**: Configure HP, ATK, and defense stats for various difficulty levels.
- **Quest System**: Design objectives and rewards for the adventure.

### 🗺️ Giuliano Hub (Level Designer)
- **Map Editor**: Pan & Zoom enabled grid for designing complex levels.
- **Isometric View**: Instant toggle between 2D Top-down and Isometric projections.
- **Sparse Data Storage**: Optimized saving for large-scale world maps.

### 🕹️ Mini-Games
- **Colora le Forme**: Flood-fill coloring game with an optimized BFS algorithm.
- **Unisci i Puntini**: Logic-based connect-the-dots game.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React, Tailwind CSS, Lucide Icons
- **Canvas Math**: `perfect-freehand`
- **Deployment**: GitHub Pages (via GitHub Actions)
- **Data Persistence**: LocalStorage (Persistent across sessions)
- **Multi-user Support**: Character/Role isolated storage keys.

## Development

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is optimized for **GitHub Pages**.
- **Base Path**: `/interactive1777`
- **Asset Handling**: Centralized `getAssetPath` utility for reliable loading on subdirectories.
- **CI/CD**: Automatic build and deploy using GitHub Actions upon pushing to `main`.

## Data Management

The application records all drawing strokes (x, y, pressure) and allow exporting metadata to `.json` for external analysis or reconstruction in AI/ML pipelines.
