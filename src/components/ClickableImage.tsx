"use client";

import React, { useState, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import ImageLightbox from "./ImageLightbox";
import { getAssetPath } from "@/lib/utils";

/**
 * Drop-in replacement for Next.js <Image> that opens a lightbox on click.
 * Wraps the image in a clickable container with cursor-pointer and hover glow.
 * 
 * Usage:
 *   <ClickableImage src={...} alt={...} fill className="object-cover" />
 *   Same props as Next.js Image.
 */
export default function ClickableImage(props: ImageProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        // Resolve the image src for the lightbox
        setOpen(true);
    }, []);

    // Resolve src to a string for the lightbox
    const resolvedSrc = typeof props.src === "string"
        ? props.src
        : typeof props.src === "object" && "src" in props.src
            ? (props.src as { src: string }).src
            : "";

    return (
        <>
            <div
                onClick={handleOpen}
                className="cursor-pointer transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] contents"
                title="Clicca per ingrandire"
            >
                <Image {...props} />
            </div>

            {open && (
                <ImageLightbox
                    src={resolvedSrc}
                    alt={typeof props.alt === "string" ? props.alt : ""}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
