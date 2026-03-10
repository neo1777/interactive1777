"use client";

import React, { useRef, useState, useEffect } from "react";
import { getStroke } from "perfect-freehand";

interface DrawingOverlayProps {
  screenshotSrc: string;
  onSave: (editedSrc: string) => void;
  onClear: () => void;
}

const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
};

export default function DrawingOverlay({ screenshotSrc, onSave, onClear }: DrawingOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<number[][][]>([]);
  const [currentLine, setCurrentLine] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Re-draw on the canvas whenever the lines change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all lines using basic canvas rendering instead of SVG to easily merge later
    const drawLine = (line: number[][]) => {
        if (line.length < 2) return;
        
        ctx.beginPath();
        ctx.fillStyle = "#ef4444"; // Red for feedback marks
        
        const stroke = getStroke(line, {
            size: 6,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: false,
        });

        if (stroke.length === 0) return;

        // Convert the points into a canvas path
        ctx.moveTo(stroke[0][0], stroke[0][1]);
        for (let i = 1; i < stroke.length - 1; i++) {
            const [x0, y0] = stroke[i];
            const [x1, y1] = stroke[i + 1];
            ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.closePath();
        ctx.fill();
    };

    lines.forEach(drawLine);
    if (currentLine.length > 0) {
      drawLine(currentLine);
    }
  }, [lines, currentLine]);

  // Handle pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to internal canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setIsDrawing(true);
    setCurrentLine([[x * scaleX, y * scaleY, e.pressure]]);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setCurrentLine((prev) => [...prev, [x * scaleX, y * scaleY, e.pressure]]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    if (currentLine.length > 0) {
      setLines((prev) => [...prev, currentLine]);
      setCurrentLine([]);
    }
  };

  // Merge the background image and the drawings, then export
  const handleDone = () => {
    const bgImg = new Image();
    bgImg.onload = () => {
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = bgImg.width;
        finalCanvas.height = bgImg.height;
        const ctx = finalCanvas.getContext("2d");
        if (!ctx) {
            onSave(screenshotSrc);
            return;
        }

        // Draw screenshot
        ctx.drawImage(bgImg, 0, 0);

        // Draw the ink layer over it (scaling to match original image size)
        if (canvasRef.current) {
            ctx.drawImage(canvasRef.current, 0, 0, bgImg.width, bgImg.height);
        }

        const compositeUrl = finalCanvas.toDataURL("image/jpeg", 0.8);
        onSave(compositeUrl);
    };
    bgImg.src = screenshotSrc;
  };

  const handleClear = () => {
      setLines([]);
      setCurrentLine([]);
      onClear();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md rounded-lg overflow-hidden border border-emerald-500/30">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center p-2 bg-slate-900 border-b border-white/10">
            <span className="text-xs font-bold text-emerald-400 font-fira-code uppercase tracking-wider ml-2">Disegna sull'immagine</span>
            <div className="flex gap-2">
                <button 
                  onClick={handleClear}
                  className="px-3 py-1 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded transition-colors"
                >
                    Pulisci
                </button>
                <button 
                  onClick={handleDone}
                  className="px-3 py-1 text-xs font-bold text-emerald-950 bg-emerald-500 hover:bg-emerald-400 rounded transition-colors"
                >
                    Salva & Scrivi Messaggio
                </button>
            </div>
        </div>

        {/* Drawing Area */}
        <div 
          ref={containerRef}
          className="relative flex-1 bg-black flex items-center justify-center overflow-hidden touch-none"
        >
            {/* Background Image (Responsive) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={screenshotSrc} 
                alt="Original Screenshot" 
                className="absolute object-contain max-w-full max-h-full pointer-events-none opacity-50"
            />
            
            {/* Drawing Canvas overlayed exactly on the image size limits */}
            <canvas
                ref={canvasRef}
                // We use standard 1080p internal resolution to ensure crisp drawing independent of DOM size
                width={1920}
                height={1080}
                className="absolute inset-0 w-full h-full object-contain cursor-crosshair touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />
        </div>

    </div>
  );
}
