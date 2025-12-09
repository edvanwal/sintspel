import { getTypeColor } from '../utils.js';

// Component: Vraag Type Label
export function QuestionTypeLabel({ type }) {
    return (
        <div className="text-center mb-4">
            <span className={`inline-block px-8 py-3 rounded-full text-lg md:text-xl font-bold uppercase shadow-lg ${getTypeColor(type)}`}>
                {type}
            </span>
        </div>
    );
}
