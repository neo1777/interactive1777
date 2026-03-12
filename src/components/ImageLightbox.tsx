"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
    src: string;
    alt: string;
    onClose: () => void;
}

/**
 * Fullscreen image overlay with fade-in animation.
 * Closes on ESC, click outside, or X button.
 */
export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const [visible, setVisible] = useState(false);

    // Fade-in on mount
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    // ESC to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all"
                title="Chiudi (ESC)"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                className={`relative z-10 max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-[0_0_80px_rgba(124,58,237,0.15)] transition-transform duration-300 ${visible ? "scale-100" : "scale-95"}`}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            {alt && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/60 text-xs font-mono uppercase tracking-widest bg-black/50 px-4 py-2 rounded-lg backdrop-blur">
                    {alt}
                </div>
            )}
        </div>
    );
}
