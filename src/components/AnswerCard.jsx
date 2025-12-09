import { ScoreDisplay } from './ScoreDisplay.jsx';
import { TimerDisplay } from './TimerDisplay.jsx';
import { AnswerText } from './AnswerText.jsx';
import { UI_TEKSTEN } from '../strings.js';

// Component: Antwoord Kaart (Achterkant)
export function AnswerCard({ question, score, timeLeft, timerActive, onCorrect, onWrong, onNext, onFlip }) {
    return (
        <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-[#D4A574] min-h-[420px] flex flex-col justify-between">
            <ScoreDisplay score={score} total={3} />
            {timerActive && <TimerDisplay timeLeft={timeLeft} />}
            <AnswerText answer={question.answer} />
            <div className="flex flex-col gap-3">
                <div className="flex gap-4 md:gap-5 justify-center">
                    <button
                        onClick={onWrong}
                        className="flex-1 px-8 py-4 md:py-5 bg-[#A0253B] text-white rounded-xl font-bold text-lg md:text-xl shadow-xl hover:bg-[#8B1538] transition-all transform hover:scale-105"
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        aria-label={UI_TEKSTEN.ARIA_ANTWOORD_FOUT}
                    >
                        {UI_TEKSTEN.FOUT_KNOP}
                    </button>
                    <button
                        onClick={onCorrect}
                        className="flex-1 px-8 py-4 md:py-5 bg-[#6B8E23] text-white rounded-xl font-bold text-lg md:text-xl shadow-xl hover:bg-[#556B1D] transition-all transform hover:scale-105"
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        aria-label={UI_TEKSTEN.ARIA_ANTWOORD_GOED}
                    >
                        {UI_TEKSTEN.GOED_KNOP}
                    </button>
                </div>
                {onFlip && (
                    <button
                        onClick={onFlip}
                        className="w-full px-6 py-3 bg-[#8B6F47] text-white rounded-lg font-bold text-base shadow-lg hover:bg-[#7A5F3C] transition-all"
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        aria-label="Terug naar vraag"
                    >
                        ← Terug naar vraag
                    </button>
                )}
                {onNext && (
                    <button
                        onClick={onNext}
                        className="w-full px-6 py-3 bg-[#8B6F47] text-white rounded-lg font-bold text-base shadow-lg hover:bg-[#7A5F3C] transition-all"
                    >
                        {UI_TEKSTEN.VOLGENDE_SPELER}
                    </button>
                )}
            </div>
        </div>
    );
}
