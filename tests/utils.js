// Pure utility functions extracted from index.html for testing
// These functions are copied from the main app to enable unit testing

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array (original not mutated)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calculate swipe power based on offset and velocity
 * @param {number} offset - Swipe offset in pixels
 * @param {number} velocity - Swipe velocity
 * @returns {number} - Swipe power
 */
export const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

/**
 * Get background color class for question type
 * @param {string} type - Question type
 * @returns {string} - Tailwind CSS classes
 */
export const getTypeColor = (type) => {
  const colors = {
    'Kennis': 'bg-blue-500 text-white',
    'ACTIE': 'bg-red-500 text-white',
    '2025': 'bg-purple-500 text-white',
    'Games': 'bg-green-500 text-white',
    'Raadsel': 'bg-orange-500 text-white',
    'Sport': 'bg-yellow-500 text-gray-900',
    'Films': 'bg-pink-500 text-white',
    'Muziek': 'bg-indigo-500 text-white'
  };
  return colors[type] || 'bg-gray-500 text-white';
};

/**
 * Generate question pool excluding shown questions
 * @param {Array} allQuestions - All available questions
 * @param {Array} shownIds - IDs of questions already shown
 * @returns {Array} - Shuffled pool of unshown questions
 */
export const generateQuestionPool = (allQuestions, shownIds) => {
  const totalQuestions = allQuestions.length;

  // If all questions shown, reset and start over
  if (shownIds.length >= totalQuestions) {
    console.log('🔄 All questions shown! Starting new round.');
    return shuffleArray(allQuestions);
  }

  // Filter unshown questions and shuffle
  const unshownQuestions = allQuestions.filter(q => !shownIds.includes(q.id));
  console.log(`✨ ${unshownQuestions.length} unshown questions available of ${totalQuestions}`);
  return shuffleArray(unshownQuestions);
};

/**
 * Get question for current player (simplified sequential selection)
 * @param {Array} questionPool - Available question pool
 * @param {number} page - Current page/question index
 * @returns {Object|null} - Selected question or null
 */
export const getQuestionForPlayer = (questionPool, page) => {
  if (questionPool.length === 0) return null;

  const questionIndex = Math.abs(page % questionPool.length);
  return questionPool[questionIndex];
};

/**
 * Calculate random alarm time between (max - 2 min) and max
 * @param {number} maxMinutes - Maximum time in minutes
 * @returns {number} - Random time in seconds
 */
export const calculateAlarmTime = (maxMinutes) => {
  const maxSeconds = maxMinutes * 60;
  const minSeconds = Math.max(maxSeconds - 120, 60); // Minimum 2 minutes less, but never below 1 min

  // Random time between min and max
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  return randomSeconds;
};

/**
 * Rotate to next player (circular)
 * @param {number} currentIndex - Current player index
 * @param {number} totalPlayers - Total number of players
 * @returns {number} - Next player index
 */
export const getNextPlayerIndex = (currentIndex, totalPlayers) => {
  if (totalPlayers === 0) return 0;
  return (currentIndex + 1) % totalPlayers;
};

/**
 * Find winner(s) with highest score
 * @param {Array} players - Array of player objects {name, score}
 * @returns {Array} - Array of player names with highest score
 */
export const findHighestScorePlayers = (players) => {
  if (players.length === 0) return [];

  const maxScore = Math.max(...players.map(p => p.score));
  return players.filter(p => p.score === maxScore).map(p => p.name);
};
