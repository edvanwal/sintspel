import { PlayerInfo } from './PlayerInfo.jsx';
import { QuestionTypeLabel } from './QuestionTypeLabel.jsx';
import { QuestionText } from './QuestionText.jsx';
import { UI_TEKSTEN } from '../strings.js';

// Component: Vraag Kaart (Voorkant)
export function QuestionCard({ question, player, onFlip }) {
    return (
        <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-[#D4A574] min-h-[420px] flex flex-col justify-between">
            {player && <PlayerInfo player={player} />}
            <QuestionTypeLabel type={question.type} />
            <QuestionText text={question.text} />
            <div className="text-center">
                <button
                    onClick={onFlip}
                    className="w-full px-8 py-5 md:py-6 bg-[#A0253B] text-white rounded-xl font-bold text-xl md:text-2xl shadow-xl hover:bg-[#8B1538] transition-all transform hover:scale-105"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    aria-label={UI_TEKSTEN.ARIA_BEKIJK_ANTWOORD}
                >
                    {UI_TEKSTEN.BEKIJK_ANTWOORD}
                </button>
            </div>
        </div>
    );
}
