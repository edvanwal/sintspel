import { UI_TEKSTEN } from '../strings.js';

// Component: Score Display
export function ScoreDisplay({ score, total = 3 }) {
    return (
        <div className="text-center mb-3">
            <div className="inline-block bg-[#D4A574] text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-2xl md:text-3xl border-4 border-[#D4A574] shadow-lg">
                {UI_TEKSTEN.SCORE_FORMAT(score, total)}
            </div>
        </div>
    );
}
