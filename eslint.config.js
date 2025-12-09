import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', '.husky'],
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Audio: 'readonly',

        // Node/Test globals
        process: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        global: 'readonly',
        module: 'readonly',

        // React CDN globals
        React: 'readonly',
        ReactDOM: 'readonly',

        // Framer Motion CDN globals
        Motion: 'readonly',

        // App globals from questions.js
        VRAGEN: 'readonly',

        // App globals from strings.js
        UI_TEKSTEN: 'readonly',

        // App globals from utils.js
        shuffleArray: 'readonly',
        getTypeColor: 'readonly',
        swipeConfidenceThreshold: 'readonly',
        swipePower: 'readonly',
        variants: 'readonly',
        COLORS: 'readonly',
        GAME_CONSTANTS: 'readonly',

        // App globals from sounds.js
        correctSound: 'readonly',
        wrongSound: 'readonly',
        timerSound: 'readonly',
        timeUpSound: 'readonly',
        alarmClockSound: 'readonly',
        playSound: 'readonly',
        startTimerSound: 'readonly',
        stopTimerAndPlayTimeUp: 'readonly',
        playAlarmSound: 'readonly',
        stopAlarmSound: 'readonly',

        // App components (used in JSX)
        FlashCardQuiz: 'writable',
        QuestionCard: 'writable',
        AnswerCard: 'writable',
        PlayerInfo: 'writable',
        QuestionTypeLabel: 'writable',
        QuestionText: 'writable',
        AnswerText: 'writable',
        TimerDisplay: 'writable',
        ScoreDisplay: 'writable',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(React|motion|AnimatePresence|[A-Z].*)', // Ignore React components (PascalCase) and unused React imports
        caughtErrorsIgnorePattern: '^_?error$', // Ignore unused error in catch blocks
      }],
      'no-undef': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
