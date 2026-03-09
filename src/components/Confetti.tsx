"use client";

import { useEffect, useState, useMemo } from "react";

interface ConfettiProps {
    show: boolean;
    duration?: number;
}

const COLORS = ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#fde68a", "#86efac"];

export default function Confetti({ show, duration = 3000 }: ConfettiProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVisible(true);
            const t = setTimeout(() => setVisible(false), duration);
            return () => clearTimeout(t);
        }
    }, [show, duration]);

    const pieces = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: `${((i * 17 + 7) * 6271) % 100}%`,
            color: COLORS[i % COLORS.length],
            delay: `${((i * 31 + 3) % 20) / 10}s`,
            duration: `${((i * 23 + 11) % 15) / 10 + 1.5}s`,
            size: ((i * 13 + 5) % 8) + 4,
            rotation: ((i * 41 + 7) % 360),
            type: i % 3, // 0=square, 1=circle, 2=strip
        })),
        []
    );

    if (!visible) return null;

    return (
        <div className="confetti-container" aria-hidden="true">
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="confetti-piece"
                    style={{
                        left: p.left,
                        backgroundColor: p.color,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        width: p.type === 2 ? p.size / 2 : p.size,
                        height: p.type === 2 ? p.size * 2 : p.size,
                        borderRadius: p.type === 1 ? "50%" : "2px",
                        transform: `rotate(${p.rotation}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
