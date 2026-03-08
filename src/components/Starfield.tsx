"use client";

import { useMemo } from "react";

interface StarfieldProps {
    count?: number;
}

export default function Starfield({ count = 50 }: StarfieldProps) {
    const stars = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            top: `${(((i * 17 + 31) * 7919) % 10000) / 100}%`,
            left: `${(((i * 13 + 47) * 6271) % 10000) / 100}%`,
            w: `${((i * 23 + 11) % 30) / 10 + 1}px`,
            delay: `${((i * 37 + 5) % 30) / 10}s`,
            duration: `${((i * 29 + 3) % 40) / 10 + 2}s`,
        })),
        [count]
    );

    return (
        <div className="starfield">
            {stars.map(s => (
                <div
                    key={s.id}
                    className="star"
                    style={{
                        top: s.top,
                        left: s.left,
                        width: s.w,
                        height: s.w,
                        animationDelay: s.delay,
                        ["--duration" as string]: s.duration,
                    }}
                />
            ))}
        </div>
    );
}
