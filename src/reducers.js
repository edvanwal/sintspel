// ==========================================
// STATE REDUCERS
// ==========================================
// Centraal state management met useReducer voor complexe state

// Game State Reducer
const gameInitialState = {
    score: 0,
    showTransition: null, // 'wrong' of 'success'
    isFlipped: false,
    timeLeft: null,
    timerActive: false
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'RESET_GAME':
            return gameInitialState;

        case 'INCREMENT_SCORE':
            return { ...state, score: state.score + 1 };

        case 'RESET_SCORE':
            return { ...state, score: 0 };

        case 'SET_TRANSITION':
            return { ...state, showTransition: action.payload };

        case 'FLIP_CARD':
            return { ...state, isFlipped: !state.isFlipped };

        case 'RESET_FLIP':
            return { ...state, isFlipped: false };

        case 'START_TIMER':
            return {
                ...state,
                timeLeft: action.payload,
                timerActive: true
            };

        case 'TICK_TIMER':
            return {
                ...state,
                timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0
            };

        case 'STOP_TIMER':
            return {
                ...state,
                timerActive: false,
                timeLeft: null
            };

        case 'RESET_TIMER':
            return {
                ...state,
                timeLeft: null,
                timerActive: false
            };

        default:
            return state;
    }
};

// Alarm State Reducer
const alarmInitialState = {
    maxTime: 10,
    timeLeft: null,
    active: false,
    paused: false,
    triggered: false,
    gameLocked: false,
    showQuestion: true,
    enabled: false,
    minimized: false
};

const alarmReducer = (state, action) => {
    switch (action.type) {
        case 'SET_MAX_TIME':
            return { ...state, maxTime: action.payload };

        case 'START_ALARM':
            return {
                ...state,
                timeLeft: action.payload,
                active: true,
                paused: false,
                triggered: false
            };

        case 'TICK_ALARM':
            return {
                ...state,
                timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0
            };

        case 'PAUSE_ALARM':
            return { ...state, paused: true };

        case 'RESUME_ALARM':
            return { ...state, paused: false };

        case 'STOP_ALARM':
            return {
                ...state,
                active: false,
                paused: false,
                timeLeft: null
            };

        case 'RESET_ALARM':
            return {
                ...state,
                active: false,
                paused: false,
                timeLeft: null,
                triggered: false,
                gameLocked: false
            };

        case 'TRIGGER_ALARM':
            return {
                ...state,
                active: false,
                triggered: true,
                gameLocked: true
            };

        case 'ENABLE_ALARM':
            return {
                ...state,
                showQuestion: false,
                enabled: true,
                minimized: false
            };

        case 'DISABLE_ALARM':
            return {
                ...state,
                showQuestion: false,
                enabled: false,
                minimized: true
            };

        case 'MINIMIZE_ALARM':
            return { ...state, minimized: true };

        case 'SHOW_ALARM':
            return { ...state, minimized: false, enabled: true };

        default:
            return state;
    }
};

// Export (voor browser compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameReducer,
        gameInitialState,
        alarmReducer,
        alarmInitialState
    };
}
