# Alice Art Director

A comprehensive web application designed as an interactive workbook and art-direction tool for capturing sketches and metadata, offering mini-games, and a personal gallery.

## Features

- **Interactive Drawing Board**: An advanced canvas allowing users to draw with different brushes, colors, and an intelligent smoothing assistant (`perfect-freehand`).
- **Assistants Menu**: Toggle brush smoothing or activate horizontal symmetry mode.
- **Gallery**: Automatically saves thumbnail snapshots and stroke metadata for previously drawn sketches.
- **Mini-Games**: 
  - **Colora le Forme**: An interactive flood-fill (bucket) coloring game utilizing an optimized BFS algorithm.
  - **Unisci i Puntini**: A connect-the-dots logic game.
- **Full Responsiveness**: The entire application is mobile-first and fully responsive. The drawing toolbar dynamically wraps, canvases scale to fit the viewport, and touch events are fully supported on smartphones and tablets.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React, Tailwind CSS
- **Canvas Math**: `perfect-freehand`
- **Data Persistence**: LocalStorage

## Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Exporting Metadata

The main Drawing Board (`/lavagna`) records all drawing strokes (x, y, pressure) array and allows exporting this data directly to a `.json` file by selecting "Esporta Dati". This allows external ML pipelines or AI modules to reconstruct and analyze user actions.
