import { describe, it, expect } from 'vitest';
import {
  shuffleArray,
  swipePower,
  getTypeColor,
  generateQuestionPool,
  getQuestionForPlayer,
  calculateAlarmTime,
  getNextPlayerIndex,
  findHighestScorePlayers
} from './utils.js';

describe('shuffleArray', () => {
  it('should return array with same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);

    expect(result).toEqual(expect.arrayContaining(input));
    input.forEach(item => {
      expect(result).toContain(item);
    });
  });

  it('should not mutate original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);

    expect(input).toEqual(original);
  });

  it('should handle empty array', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('should handle single-element array', () => {
    const input = [42];
    const result = shuffleArray(input);
    expect(result).toEqual([42]);
  });

  it('should produce different shuffles (statistical test)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set();

    // Run shuffle 20 times and collect unique results
    for (let i = 0; i < 20; i++) {
      results.add(JSON.stringify(shuffleArray(input)));
    }

    // With 10 elements, we should get multiple different shuffles
    // (Not guaranteed, but highly likely with proper randomness)
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('swipePower', () => {
  it('should calculate power correctly', () => {
    expect(swipePower(100, 5)).toBe(500);
    expect(swipePower(200, 10)).toBe(2000);
  });

  it('should handle zero velocity', () => {
    expect(swipePower(100, 0)).toBe(0);
  });

  it('should handle negative offset (returns absolute value)', () => {
    expect(swipePower(-100, 5)).toBe(500);
    expect(swipePower(-200, 10)).toBe(2000);
  });

  it('should handle both negative offset and velocity', () => {
    // Math.abs(-100) = 100, then 100 * -5 = -500
    expect(swipePower(-100, -5)).toBe(-500);
  });

  it('should work with swipeConfidenceThreshold comparison', () => {
    const threshold = 10000;
    expect(swipePower(100, 50)).toBeLessThan(threshold);
    expect(swipePower(500, 50)).toBeGreaterThan(threshold);
  });
});

describe('getTypeColor', () => {
  it('should return correct color for Kennis', () => {
    expect(getTypeColor('Kennis')).toBe('bg-blue-500 text-white');
  });

  it('should return correct color for ACTIE', () => {
    expect(getTypeColor('ACTIE')).toBe('bg-red-500 text-white');
  });

  it('should return correct color for all 8 types', () => {
    const types = ['Kennis', 'ACTIE', '2025', 'Games', 'Raadsel', 'Sport', 'Films', 'Muziek'];

    types.forEach(type => {
      const color = getTypeColor(type);
      expect(color).toBeTruthy();
      expect(color).toMatch(/^bg-\w+-\d+/);
    });
  });

  it('should handle unknown type gracefully', () => {
    expect(getTypeColor('UnknownType')).toBe('bg-gray-500 text-white');
  });

  it('should handle empty string', () => {
    expect(getTypeColor('')).toBe('bg-gray-500 text-white');
  });
});

describe('generateQuestionPool', () => {
  const mockQuestions = [
    { id: 1, text: 'Q1', answer: 'A1' },
    { id: 2, text: 'Q2', answer: 'A2' },
    { id: 3, text: 'Q3', answer: 'A3' },
    { id: 4, text: 'Q4', answer: 'A4' },
    { id: 5, text: 'Q5', answer: 'A5' },
  ];

  it('should return all questions shuffled when no questions shown', () => {
    const result = generateQuestionPool(mockQuestions, []);
    expect(result).toHaveLength(5);
    expect(result).toEqual(expect.arrayContaining(mockQuestions));
  });

  it('should filter out shown questions correctly', () => {
    const shownIds = [1, 3];
    const result = generateQuestionPool(mockQuestions, shownIds);

    expect(result).toHaveLength(3);
    expect(result.every(q => ![1, 3].includes(q.id))).toBe(true);
    expect(result.some(q => q.id === 2)).toBe(true);
    expect(result.some(q => q.id === 4)).toBe(true);
    expect(result.some(q => q.id === 5)).toBe(true);
  });

  it('should reset to full pool when all questions shown', () => {
    const shownIds = [1, 2, 3, 4, 5]; // All shown
    const result = generateQuestionPool(mockQuestions, shownIds);

    expect(result).toHaveLength(5);
    expect(result).toEqual(expect.arrayContaining(mockQuestions));
  });

  it('should handle empty shownIds array', () => {
    const result = generateQuestionPool(mockQuestions, []);
    expect(result).toHaveLength(5);
  });

  it('should handle when more IDs than questions exist (corrupted data)', () => {
    const shownIds = [1, 2, 3, 4, 5, 6, 7, 8]; // More than exist
    const result = generateQuestionPool(mockQuestions, shownIds);

    // Should reset and return all questions
    expect(result).toHaveLength(5);
  });

  it('should not return duplicate questions', () => {
    const result = generateQuestionPool(mockQuestions, [1]);
    const ids = result.map(q => q.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });
});

describe('getQuestionForPlayer', () => {
  const mockPool = [
    { id: 1, text: 'Q1' },
    { id: 2, text: 'Q2' },
    { id: 3, text: 'Q3' },
  ];

  it('should return null for empty pool', () => {
    expect(getQuestionForPlayer([], 0)).toBeNull();
  });

  it('should return first question for page 0', () => {
    const result = getQuestionForPlayer(mockPool, 0);
    expect(result).toEqual({ id: 1, text: 'Q1' });
  });

  it('should return correct question for page index', () => {
    expect(getQuestionForPlayer(mockPool, 1)).toEqual({ id: 2, text: 'Q2' });
    expect(getQuestionForPlayer(mockPool, 2)).toEqual({ id: 3, text: 'Q3' });
  });

  it('should wrap around with modulo for large page numbers', () => {
    // page 3 % 3 = 0, so should return first question
    expect(getQuestionForPlayer(mockPool, 3)).toEqual({ id: 1, text: 'Q1' });
    // page 4 % 3 = 1, so should return second question
    expect(getQuestionForPlayer(mockPool, 4)).toEqual({ id: 2, text: 'Q2' });
  });

  it('should handle negative page numbers', () => {
    // Math.abs(-1) % 3 = 1
    const result = getQuestionForPlayer(mockPool, -1);
    expect(result).toBeTruthy();
  });
});

describe('calculateAlarmTime', () => {
  it('should return time in seconds', () => {
    const result = calculateAlarmTime(10);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('should be between (max - 120s) and max', () => {
    const maxMinutes = 10;
    const maxSeconds = maxMinutes * 60; // 600
    const minSeconds = maxSeconds - 120; // 480

    // Test multiple times due to randomness
    for (let i = 0; i < 10; i++) {
      const result = calculateAlarmTime(maxMinutes);
      expect(result).toBeGreaterThanOrEqual(minSeconds);
      expect(result).toBeLessThanOrEqual(maxSeconds);
    }
  });

  it('should never return less than 60 seconds', () => {
    // Even with max time of 1 minute, should never go below 60s
    const result = calculateAlarmTime(1);
    expect(result).toBeGreaterThanOrEqual(60);
  });

  it('should handle large max times', () => {
    const result = calculateAlarmTime(60); // 1 hour
    expect(result).toBeGreaterThanOrEqual(3480); // 60*60 - 120
    expect(result).toBeLessThanOrEqual(3600); // 60*60
  });

  it('should produce varied results (randomness check)', () => {
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      results.add(calculateAlarmTime(10));
    }

    // Should generate multiple different values
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('getNextPlayerIndex', () => {
  it('should rotate to next player', () => {
    expect(getNextPlayerIndex(0, 3)).toBe(1);
    expect(getNextPlayerIndex(1, 3)).toBe(2);
  });

  it('should wrap around to 0 at end', () => {
    expect(getNextPlayerIndex(2, 3)).toBe(0);
    expect(getNextPlayerIndex(4, 5)).toBe(0);
  });

  it('should handle 0 players', () => {
    expect(getNextPlayerIndex(0, 0)).toBe(0);
  });

  it('should handle single player', () => {
    expect(getNextPlayerIndex(0, 1)).toBe(0);
  });

  it('should work for large player counts', () => {
    expect(getNextPlayerIndex(99, 100)).toBe(0);
    expect(getNextPlayerIndex(50, 100)).toBe(51);
  });
});

describe('findHighestScorePlayers', () => {
  it('should find single winner with highest score', () => {
    const players = [
      { name: 'Alice', score: 10 },
      { name: 'Bob', score: 15 },
      { name: 'Charlie', score: 8 },
    ];

    expect(findHighestScorePlayers(players)).toEqual(['Bob']);
  });

  it('should handle multiple players tied for highest score', () => {
    const players = [
      { name: 'Alice', score: 15 },
      { name: 'Bob', score: 15 },
      { name: 'Charlie', score: 8 },
    ];

    const winners = findHighestScorePlayers(players);
    expect(winners).toHaveLength(2);
    expect(winners).toContain('Alice');
    expect(winners).toContain('Bob');
  });

  it('should handle all players with same score', () => {
    const players = [
      { name: 'Alice', score: 10 },
      { name: 'Bob', score: 10 },
      { name: 'Charlie', score: 10 },
    ];

    const winners = findHighestScorePlayers(players);
    expect(winners).toHaveLength(3);
  });

  it('should handle all players with 0 score', () => {
    const players = [
      { name: 'Alice', score: 0 },
      { name: 'Bob', score: 0 },
    ];

    const winners = findHighestScorePlayers(players);
    expect(winners).toHaveLength(2);
  });

  it('should handle empty player array', () => {
    expect(findHighestScorePlayers([])).toEqual([]);
  });

  it('should handle single player', () => {
    const players = [{ name: 'Alice', score: 5 }];
    expect(findHighestScorePlayers(players)).toEqual(['Alice']);
  });

  it('should handle negative scores', () => {
    const players = [
      { name: 'Alice', score: -5 },
      { name: 'Bob', score: 0 },
      { name: 'Charlie', score: -10 },
    ];

    expect(findHighestScorePlayers(players)).toEqual(['Bob']);
  });
});
