import { UI_TEKSTEN } from '../strings.js';

// Component: Speler Info Display
export function PlayerInfo({ player, index: _index, isActive: _isActive }) {
    return (
        <div className="text-center mb-2">
            <div className="text-sm md:text-base text-[#8B6F47] font-bold mb-1">{UI_TEKSTEN.BEURT_VAN}</div>
            <div className="inline-block bg-[#A0253B] text-white px-6 py-2 rounded-full font-bold text-xl md:text-2xl shadow-lg">
                👤 {player.name}
            </div>
            <div className="text-xs md:text-sm text-[#8B6F47] mt-1">
                {UI_TEKSTEN.SCORE_LABEL} {player.score} {UI_TEKSTEN.PUNTEN}
            </div>
        </div>
    );
}
