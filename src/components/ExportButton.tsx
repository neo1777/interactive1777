"use client";

import { useCallback } from "react";

interface ExportButtonProps {
    /** Prefix to filter localStorage keys, e.g. "iq_alice_" */
    prefix: string;
    /** Label to show on the button */
    label?: string;
    /** Filename for the download */
    filename?: string;
    className?: string;
}

export default function ExportButton({
    prefix,
    label = "📥 Scarica i tuoi lavori",
    filename = "isometric_quest_backup.json",
    className = "",
}: ExportButtonProps) {
    const handleExport = useCallback(() => {
        const data: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key) || "null");
                } catch {
                    data[key] = localStorage.getItem(key);
                }
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [prefix, filename]);

    return (
        <button onClick={handleExport} className={`btn-secondary text-sm flex items-center gap-2 ${className}`}>
            {label}
        </button>
    );
}
