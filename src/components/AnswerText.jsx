import { UI_TEKSTEN } from '../strings.js';

// Component: Antwoord Tekst met dynamische font size
export function AnswerText({ answer }) {
    const fontSize = answer.length > 150
        ? 'text-base md:text-lg'
        : answer.length > 100
        ? 'text-lg md:text-xl'
        : answer.length > 60
        ? 'text-xl md:text-2xl'
        : 'text-2xl md:text-3xl';

    return (
        <div className="flex-1 flex items-center justify-center mb-4">
            <div className="text-center p-5 md:p-6 bg-[#F5E6D3] rounded-xl border-3 border-[#D4A574] shadow-inner">
                <p className="text-xs md:text-sm text-[#8B6F47] uppercase tracking-wide mb-2 font-bold">{UI_TEKSTEN.ANTWOORD_LABEL}</p>
                <p className={`text-[#3E2723] font-bold leading-snug ${fontSize}`}>
                    {answer}
                </p>
            </div>
        </div>
    );
}
