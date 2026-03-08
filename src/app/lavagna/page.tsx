import DrawingBoard from "@/components/DrawingBoard";
import Link from "next/link";
import DidacticTooltip from "@/components/DidacticUI";
import { Paintbrush, ArrowLeft } from "lucide-react";

const LAVAGNA_TIPS = [
    "Qui puoi disegnare quello che vuoi, senza limiti!",
    "Usa la <strong>Lavagna</strong> per fare schizzi veloci o provare nuove idee.",
    "Ricorda di salvare i tuoi capolavori per trovarli nella <strong>Galleria</strong>!",
    "Sperimenta con forme e colori... forse troverai l'ispirazione per un nuovo personaggio!",
];

export default function LavagnaPage() {
    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 relative z-10 w-full">
            <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
                    <h1 className="text-4xl font-black glow-text text-white flex items-center gap-3">
                        <Paintbrush className="text-pink-400 w-10 h-10" />
                        Lavagna Libera
                    </h1>
                </div>
                <Link href="/alice" className="btn-secondary text-sm shrink-0 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Alice Hub
                </Link>
            </div>

            <div className="w-full max-w-6xl mb-6 slide-up">
                <DidacticTooltip tips={LAVAGNA_TIPS} emoji="🖍️" />
            </div>

            <div className="w-full max-w-6xl">
                <DrawingBoard />
            </div>
        </div>
    );
}
