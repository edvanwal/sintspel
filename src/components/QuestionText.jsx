// Component: Vraag Tekst met dynamische font size
export function QuestionText({ text }) {
    const fontSize = text.length > 150
        ? 'text-lg md:text-xl'
        : text.length > 100
        ? 'text-xl md:text-2xl'
        : 'text-2xl md:text-3xl';

    return (
        <div className="flex-1 flex items-center justify-center mb-4">
            <h2 className={`font-extrabold text-[#3E2723] text-center select-none leading-tight px-1 ${fontSize}`}>
                {text}
            </h2>
        </div>
    );
}
