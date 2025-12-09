// Component: Timer Display
export function TimerDisplay({ timeLeft }) {
    if (timeLeft === null) return null;

    return (
        <div className="text-center mb-3">
            <div
                className={`inline-block px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-3xl md:text-4xl shadow-2xl border-4 animate-pulse ${
                    timeLeft <= 3 ? 'bg-[#A0253B] text-white border-[#A0253B]' : 'bg-[#6B8E23] text-white border-[#6B8E23]'
                }`}
                aria-live="polite"
                aria-atomic="true"
            >
                ⏰ {timeLeft}
            </div>
        </div>
    );
}
