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

    // Shuffle elke difficulty groep eerst (voor extra randomness)
    const shuffledEasy = shuffleArray(easyQuestions);
    const shuffledMedium = shuffleArray(mediumQuestions);
    const shuffledHard = shuffleArray(hardQuestions);

    // Strategie: Pas weights aan op basis van wat beschikbaar is
    // Voorbeeld: Als je 70% easy wilt maar maar 45% easy beschikbaar is,
    // gebruik dan ALLE easy en schaal de rest naar beneden
    const weightedPool = [];

    // Bereken wat we willen (ideal targets)
    const totalWeight = weights.easy + weights.medium + weights.hard;
    const idealEasyRatio = weights.easy / totalWeight;
    const idealMediumRatio = weights.medium / totalWeight;
    const idealHardRatio = weights.hard / totalWeight;

    // Bereken wat we hebben (available)
    const availableEasyRatio = shuffledEasy.length / questionPool.length;
    const availableMediumRatio = shuffledMedium.length / questionPool.length;
    const availableHardRatio = shuffledHard.length / questionPool.length;

    // Als een category tekort schiet, gebruik alles en schaal anderen
    let finalEasyCount, finalMediumCount, finalHardCount;

    // Check welke category het meest "limiting" is (grootste tekort)
    const easyRatio = shuffledEasy.length > 0 ? idealEasyRatio / availableEasyRatio : 1;
    const mediumRatio = shuffledMedium.length > 0 ? idealMediumRatio / availableMediumRatio : 1;
    const hardRatio = shuffledHard.length > 0 ? idealHardRatio / availableHardRatio : 1;

    const maxRatio = Math.max(easyRatio, mediumRatio, hardRatio);

    if (maxRatio > 1) {
        // We hebben een tekort - schaal naar beneden
        // De limiting factor bepaalt de pool size
        const poolScaleFactor = 1 / maxRatio;

        finalEasyCount = Math.round(idealEasyRatio * questionPool.length * poolScaleFactor);
        finalMediumCount = Math.round(idealMediumRatio * questionPool.length * poolScaleFactor);
        finalHardCount = Math.round(idealHardRatio * questionPool.length * poolScaleFactor);

        // Clamp to available
        finalEasyCount = Math.min(finalEasyCount, shuffledEasy.length);
        finalMediumCount = Math.min(finalMediumCount, shuffledMedium.length);
        finalHardCount = Math.min(finalHardCount, shuffledHard.length);
    } else {
        // Genoeg beschikbaar - gebruik ideal targets
        finalEasyCount = Math.round(idealEasyRatio * questionPool.length);
        finalMediumCount = Math.round(idealMediumRatio * questionPool.length);
        finalHardCount = Math.round(idealHardRatio * questionPool.length);

        // Clamp to available
        finalEasyCount = Math.min(finalEasyCount, shuffledEasy.length);
        finalMediumCount = Math.min(finalMediumCount, shuffledMedium.length);
        finalHardCount = Math.min(finalHardCount, shuffledHard.length);
    }

    // Voeg vragen toe in de berekende aantallen
    for (let i = 0; i < finalEasyCount; i++) {
        weightedPool.push(shuffledEasy[i]);
    }
    for (let i = 0; i < finalMediumCount; i++) {
        weightedPool.push(shuffledMedium[i]);
    }
    for (let i = 0; i < finalHardCount; i++) {
        weightedPool.push(shuffledHard[i]);
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
