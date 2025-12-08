// ==========================================
// CONSTANTEN EN UTILITY FUNCTIES
// ==========================================

// Colors
const COLORS = {
    primary: '#8B1538',
    primaryDark: '#A0253B',
    background: '#F5E6D3',
    backgroundLight: '#FAF0E6',
    border: '#D4A574',
    borderDark: '#8B6F47',
    text: '#3E2723',
    textMuted: '#8B6F47',
    success: '#6B8E23',
    successDark: '#556B1D',
    white: '#FFFFFF'
};

// Magic Numbers
const GAME_CONSTANTS = {
    SWIPE_THRESHOLD: 10000,
    ALARM_MIN_REDUCTION_SECONDS: 120, // 2 minuten
    ALARM_MIN_THRESHOLD_SECONDS: 60,  // 1 minuut
    ALARM_MAX_MINUTES: 60,
    MIN_PLAYERS: 2,
    MAX_QUESTION_DISPLAY_HEIGHT: 64 // voor overflow-y-auto
};

// Instellingen voor hoe ver je moet swipen
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

// De animatie-regels voor Framer Motion
const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.5,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.5,
    })
};

// Kleuren voor vraagtype labels - Warme Sinterklaas kleuren
const getTypeColor = (type) => {
    switch(type.toUpperCase()) {
        case 'KENNIS': return 'bg-[#8B6F47] text-white'; // Warm bruin
        case 'ACTIE': return 'bg-[#6B8E23] text-white'; // Olijfgroen
        case '2025': return 'bg-[#D4A574] text-gray-900'; // Goud
        case 'LASTIG': return 'bg-[#A0253B] text-white'; // Bordeaux
        case 'EXPERT': return 'bg-[#6B1829] text-white'; // Donker rood
        case 'INSTINKER': return 'bg-[#B8860B] text-white'; // Donker goud
        default: return 'bg-[#8B6F47] text-white'; // Warm bruin
    }
};

// Shuffle functie voor array randomisatie
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
