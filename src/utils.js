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

// Age-based Difficulty Weights
// Deze bepalen de mix van makkelijke/medium/moeilijke vragen per leeftijdsgroep
const DIFFICULTY_WEIGHTS = {
    // Jonge kinderen krijgen vooral makkelijke vragen
    YOUNG: {
        age: 10,
        weights: { easy: 0.70, medium: 0.25, hard: 0.05 }
    },
    // Tieners krijgen een gebalanceerde mix
    TEEN: {
        age: 16,
        weights: { easy: 0.40, medium: 0.50, hard: 0.10 }
    },
    // Volwassenen krijgen meer uitdaging
    ADULT: {
        weights: { easy: 0.30, medium: 0.50, hard: 0.20 }
    }
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

// Get age-based difficulty weights
const getAgeWeights = (age) => {
    if (age < DIFFICULTY_WEIGHTS.YOUNG.age) {
        return DIFFICULTY_WEIGHTS.YOUNG.weights;
    } else if (age < DIFFICULTY_WEIGHTS.TEEN.age) {
        return DIFFICULTY_WEIGHTS.TEEN.weights;
    } else {
        return DIFFICULTY_WEIGHTS.ADULT.weights;
    }
};

// Genereer weighted question pool op basis van leeftijd
// Dit voorkomt herhalingen doordat de pool 1x wordt gegenereerd per speler
const createWeightedPool = (questionPool, playerAge) => {
    // Als geen leeftijd gegeven, return originele pool
    if (!playerAge) {
        return questionPool;
    }

    // Als pool leeg is, return leeg
    if (questionPool.length === 0) {
        return [];
    }

    // Bepaal weights op basis van leeftijd
    const weights = getAgeWeights(playerAge);

    // Filter pool per difficulty
    const easyQuestions = questionPool.filter(q => q.difficulty === 'easy');
    const mediumQuestions = questionPool.filter(q => q.difficulty === 'medium');
    const hardQuestions = questionPool.filter(q => q.difficulty === 'hard');

    // Bouw gewogen pool met juiste ratio's
    const weightedPool = [];
    const poolSize = questionPool.length;

    // Bereken target aantallen op basis van weights
    const totalWeight = weights.easy + weights.medium + weights.hard;
    const targetEasy = Math.round((weights.easy / totalWeight) * poolSize);
    const targetMedium = Math.round((weights.medium / totalWeight) * poolSize);
    const targetHard = Math.round((weights.hard / totalWeight) * poolSize);

    // Shuffle elke difficulty groep eerst (voor extra randomness)
    const shuffledEasy = shuffleArray(easyQuestions);
    const shuffledMedium = shuffleArray(mediumQuestions);
    const shuffledHard = shuffleArray(hardQuestions);

    // Voeg vragen toe tot target (of tot lijst leeg is)
    for (let i = 0; i < targetEasy && i < shuffledEasy.length; i++) {
        weightedPool.push(shuffledEasy[i]);
    }
    for (let i = 0; i < targetMedium && i < shuffledMedium.length; i++) {
        weightedPool.push(shuffledMedium[i]);
    }
    for (let i = 0; i < targetHard && i < shuffledHard.length; i++) {
        weightedPool.push(shuffledHard[i]);
    }

    // Als weighted pool te klein is (bijv. niet genoeg hard vragen),
    // vul aan met resterende vragen uit originele pool
    if (weightedPool.length < poolSize) {
        const remaining = questionPool.filter(q => !weightedPool.includes(q));
        weightedPool.push(...remaining);
    }

    // Final shuffle van de weighted pool
    return shuffleArray(weightedPool);
};

// ES6 Exports
export {
    COLORS,
    GAME_CONSTANTS,
    DIFFICULTY_WEIGHTS,
    swipeConfidenceThreshold,
    swipePower,
    variants,
    getTypeColor,
    shuffleArray,
    getAgeWeights,
    createWeightedPool
};
