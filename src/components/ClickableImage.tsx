"use client";

import React, { useState, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import ImageLightbox from "./ImageLightbox";

/**
 * Drop-in replacement for Next.js <Image> that opens a lightbox on click.
 *
 * Works with both fixed-size and fill-mode images.
 * For fill images, click is handled on the parent container (must be relative/absolute).
 */
export default function ClickableImage(props: ImageProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(true);
    }, []);

    // Resolve src to string for the lightbox
    const resolvedSrc = typeof props.src === "string"
        ? props.src
        : typeof props.src === "object" && "src" in props.src
            ? (props.src as { src: string }).src
            : "";

    return (
        <>
            <Image
                {...props}
                onClick={handleOpen}
                style={{
                    cursor: "zoom-in",
                    ...((props.style as React.CSSProperties) ?? {}),
                }}
                className={`transition-all duration-300 hover:brightness-110 ${props.className ?? ""}`}
                title="Clicca per ingrandire"
            />

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
