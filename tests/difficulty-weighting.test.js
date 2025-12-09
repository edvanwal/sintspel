import { describe, it, expect } from 'vitest';
import { getAgeWeights, createWeightedPool, DIFFICULTY_WEIGHTS } from '../src/utils.js';

describe('getAgeWeights', () => {
  it('returns YOUNG weights for children under 10', () => {
    expect(getAgeWeights(5)).toEqual({ easy: 0.70, medium: 0.25, hard: 0.05 });
    expect(getAgeWeights(9)).toEqual({ easy: 0.70, medium: 0.25, hard: 0.05 });
  });

  it('returns TEEN weights for ages 10-15', () => {
    expect(getAgeWeights(10)).toEqual({ easy: 0.40, medium: 0.50, hard: 0.10 });
    expect(getAgeWeights(13)).toEqual({ easy: 0.40, medium: 0.50, hard: 0.10 });
    expect(getAgeWeights(15)).toEqual({ easy: 0.40, medium: 0.50, hard: 0.10 });
  });

  it('returns ADULT weights for ages 16+', () => {
    expect(getAgeWeights(16)).toEqual({ easy: 0.30, medium: 0.50, hard: 0.20 });
    expect(getAgeWeights(25)).toEqual({ easy: 0.30, medium: 0.50, hard: 0.20 });
    expect(getAgeWeights(100)).toEqual({ easy: 0.30, medium: 0.50, hard: 0.20 });
  });

  it('uses correct threshold values from DIFFICULTY_WEIGHTS', () => {
    expect(DIFFICULTY_WEIGHTS.YOUNG.age).toBe(10);
    expect(DIFFICULTY_WEIGHTS.TEEN.age).toBe(16);
  });
});

describe('createWeightedPool', () => {
  const mockQuestions = [
    // 10 easy questions
    { id: 1, difficulty: 'easy', text: 'Easy 1' },
    { id: 2, difficulty: 'easy', text: 'Easy 2' },
    { id: 3, difficulty: 'easy', text: 'Easy 3' },
    { id: 4, difficulty: 'easy', text: 'Easy 4' },
    { id: 5, difficulty: 'easy', text: 'Easy 5' },
    { id: 6, difficulty: 'easy', text: 'Easy 6' },
    { id: 7, difficulty: 'easy', text: 'Easy 7' },
    { id: 8, difficulty: 'easy', text: 'Easy 8' },
    { id: 9, difficulty: 'easy', text: 'Easy 9' },
    { id: 10, difficulty: 'easy', text: 'Easy 10' },
    // 10 medium questions
    { id: 11, difficulty: 'medium', text: 'Medium 1' },
    { id: 12, difficulty: 'medium', text: 'Medium 2' },
    { id: 13, difficulty: 'medium', text: 'Medium 3' },
    { id: 14, difficulty: 'medium', text: 'Medium 4' },
    { id: 15, difficulty: 'medium', text: 'Medium 5' },
    { id: 16, difficulty: 'medium', text: 'Medium 6' },
    { id: 17, difficulty: 'medium', text: 'Medium 7' },
    { id: 18, difficulty: 'medium', text: 'Medium 8' },
    { id: 19, difficulty: 'medium', text: 'Medium 9' },
    { id: 20, difficulty: 'medium', text: 'Medium 10' },
    // 10 hard questions
    { id: 21, difficulty: 'hard', text: 'Hard 1' },
    { id: 22, difficulty: 'hard', text: 'Hard 2' },
    { id: 23, difficulty: 'hard', text: 'Hard 3' },
    { id: 24, difficulty: 'hard', text: 'Hard 4' },
    { id: 25, difficulty: 'hard', text: 'Hard 5' },
    { id: 26, difficulty: 'hard', text: 'Hard 6' },
    { id: 27, difficulty: 'hard', text: 'Hard 7' },
    { id: 28, difficulty: 'hard', text: 'Hard 8' },
    { id: 29, difficulty: 'hard', text: 'Hard 9' },
    { id: 30, difficulty: 'hard', text: 'Hard 10' },
  ];

  it('returns original pool when no age provided', () => {
    const result = createWeightedPool(mockQuestions, null);
    expect(result).toHaveLength(mockQuestions.length);
  });

  it('returns empty array when pool is empty', () => {
    const result = createWeightedPool([], 10);
    expect(result).toEqual([]);
  });

  it('creates weighted pool for young child (70% easy, 25% medium, 5% hard)', () => {
    const result = createWeightedPool(mockQuestions, 8);

    // Count difficulties in result
    const easyCount = result.filter(q => q.difficulty === 'easy').length;
    const mediumCount = result.filter(q => q.difficulty === 'medium').length;
    const hardCount = result.filter(q => q.difficulty === 'hard').length;

    // Should have same total length
    expect(result).toHaveLength(mockQuestions.length);

    // Check ratios (allow for rounding)
    // 70% of 30 = 21, but we only have 10 easy questions
    // So it should take all 10 easy, then fill with others
    expect(easyCount).toBeGreaterThanOrEqual(10);
    expect(mediumCount).toBeGreaterThan(0);
  });

  it('creates weighted pool for teen (40% easy, 50% medium, 10% hard)', () => {
    const result = createWeightedPool(mockQuestions, 13);

    const easyCount = result.filter(q => q.difficulty === 'easy').length;
    const mediumCount = result.filter(q => q.difficulty === 'medium').length;
    const hardCount = result.filter(q => q.difficulty === 'hard').length;

    expect(result).toHaveLength(mockQuestions.length);

    // 40% of 30 = 12, but we only have 10 easy
    // 50% of 30 = 15, but we only have 10 medium
    expect(easyCount).toBeGreaterThanOrEqual(10);
    expect(mediumCount).toBeGreaterThanOrEqual(10);
  });

  it('creates weighted pool for adult (30% easy, 50% medium, 20% hard)', () => {
    const result = createWeightedPool(mockQuestions, 25);

    const easyCount = result.filter(q => q.difficulty === 'easy').length;
    const mediumCount = result.filter(q => q.difficulty === 'medium').length;
    const hardCount = result.filter(q => q.difficulty === 'hard').length;

    expect(result).toHaveLength(mockQuestions.length);

    // 30% of 30 = 9
    // 50% of 30 = 15, but we only have 10 medium
    // 20% of 30 = 6
    expect(easyCount).toBeGreaterThanOrEqual(9);
    expect(mediumCount).toBeGreaterThanOrEqual(10);
    expect(hardCount).toBeGreaterThanOrEqual(6);
  });

  it('includes all questions from original pool', () => {
    const result = createWeightedPool(mockQuestions, 10);

    // Every question from mockQuestions should be in result
    mockQuestions.forEach(question => {
      expect(result.some(q => q.id === question.id)).toBe(true);
    });
  });

  it('does not duplicate questions', () => {
    const result = createWeightedPool(mockQuestions, 10);

    // Check that no question appears twice
    const ids = result.map(q => q.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toHaveLength(uniqueIds.length);
  });

  it('shuffles the weighted pool', () => {
    // Create multiple weighted pools and check they are different
    const result1 = createWeightedPool(mockQuestions, 10);
    const result2 = createWeightedPool(mockQuestions, 10);

    // They should have same questions but likely different order
    // (There's a tiny chance they're the same, but very unlikely with 30 questions)
    const isDifferent = result1.some((q, i) => q.id !== result2[i].id);
    expect(isDifferent).toBe(true);
  });

  it('handles edge case with limited questions of certain difficulty', () => {
    const limitedQuestions = [
      { id: 1, difficulty: 'easy', text: 'Easy 1' },
      { id: 2, difficulty: 'easy', text: 'Easy 2' },
      { id: 3, difficulty: 'medium', text: 'Medium 1' },
      { id: 4, difficulty: 'hard', text: 'Hard 1' },
    ];

    // Young child wants 70% easy, but only 2 easy available out of 4 total
    const result = createWeightedPool(limitedQuestions, 8);

    expect(result).toHaveLength(4);
    // Should include all questions
    expect(result.some(q => q.id === 1)).toBe(true);
    expect(result.some(q => q.id === 2)).toBe(true);
    expect(result.some(q => q.id === 3)).toBe(true);
    expect(result.some(q => q.id === 4)).toBe(true);
  });
});
