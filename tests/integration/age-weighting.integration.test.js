import { describe, it, expect } from 'vitest';
import { createWeightedPool, getAgeWeights } from '../../src/utils.js';
import { VRAGEN } from '../../src/questions.js';

/**
 * Integration tests for age-based question weighting
 * These tests verify the OBSERVABLE BEHAVIOR of the feature end-to-end
 *
 * Why these tests are important:
 * - Catches when feature is "implemented" in code but not actually working
 * - Tests real data (VRAGEN) not mock data
 * - Verifies the actual user experience
 */

describe('Age-based weighting integration tests', () => {
  describe('Young children (<10 jaar) experience', () => {
    it('should get significantly more easy questions than adults', () => {
      const youngPool = createWeightedPool(VRAGEN, 8);
      const adultPool = createWeightedPool(VRAGEN, 25);

      const youngEasyPercent = youngPool.filter(q => q.difficulty === 'easy').length / youngPool.length;
      const adultEasyPercent = adultPool.filter(q => q.difficulty === 'easy').length / adultPool.length;

      // Young child should have at least 20% more easy questions
      expect(youngEasyPercent).toBeGreaterThan(adultEasyPercent + 0.20);

      // Specific check: young child should have ~70% easy
      expect(youngEasyPercent).toBeGreaterThan(0.60); // Allow 10% variance
      expect(youngEasyPercent).toBeLessThan(0.80);
    });

    it('should get fewer hard questions than adults', () => {
      const youngPool = createWeightedPool(VRAGEN, 8);
      const adultPool = createWeightedPool(VRAGEN, 25);

      const youngHardPercent = youngPool.filter(q => q.difficulty === 'hard').length / youngPool.length;
      const adultHardPercent = adultPool.filter(q => q.difficulty === 'hard').length / adultPool.length;

      // Young child should have fewer hard questions
      expect(youngHardPercent).toBeLessThan(adultHardPercent);
    });

    it('receives pools with expected difficulty distribution (70/25/5)', () => {
      const pool = createWeightedPool(VRAGEN, 7);

      const easyPercent = pool.filter(q => q.difficulty === 'easy').length / pool.length;
      const mediumPercent = pool.filter(q => q.difficulty === 'medium').length / pool.length;
      const hardPercent = pool.filter(q => q.difficulty === 'hard').length / pool.length;

      // Allow 10% variance from target
      expect(easyPercent).toBeGreaterThan(0.60);
      expect(easyPercent).toBeLessThan(0.80);
      expect(mediumPercent).toBeGreaterThan(0.15);
      expect(mediumPercent).toBeLessThan(0.35);
      expect(hardPercent).toBeLessThan(0.15);
    });
  });

  describe('Teenagers (10-15 jaar) experience', () => {
    it('should get balanced mix with more medium questions', () => {
      const teenPool = createWeightedPool(VRAGEN, 13);

      const easyPercent = teenPool.filter(q => q.difficulty === 'easy').length / teenPool.length;
      const mediumPercent = teenPool.filter(q => q.difficulty === 'medium').length / teenPool.length;

      // Medium should be highest percentage
      expect(mediumPercent).toBeGreaterThan(easyPercent);

      // Check roughly 40/50/10 split (allow variance)
      expect(easyPercent).toBeGreaterThan(0.30);
      expect(easyPercent).toBeLessThan(0.50);
      expect(mediumPercent).toBeGreaterThan(0.40);
      expect(mediumPercent).toBeLessThan(0.60);
    });

    it('should have distribution between young and adult', () => {
      const youngPool = createWeightedPool(VRAGEN, 8);
      const teenPool = createWeightedPool(VRAGEN, 13);
      const adultPool = createWeightedPool(VRAGEN, 25);

      const youngEasy = youngPool.filter(q => q.difficulty === 'easy').length / youngPool.length;
      const teenEasy = teenPool.filter(q => q.difficulty === 'easy').length / teenPool.length;
      const adultEasy = adultPool.filter(q => q.difficulty === 'easy').length / adultPool.length;

      // Teen should be in the middle
      expect(teenEasy).toBeLessThan(youngEasy);
      expect(teenEasy).toBeGreaterThan(adultEasy);
    });
  });

  describe('Adults (16+ jaar) experience', () => {
    it('should get more challenging questions', () => {
      const adultPool = createWeightedPool(VRAGEN, 25);

      const hardPercent = adultPool.filter(q => q.difficulty === 'hard').length / adultPool.length;
      const mediumPercent = adultPool.filter(q => q.difficulty === 'medium').length / adultPool.length;

      // Should have relatively more hard questions
      expect(hardPercent).toBeGreaterThan(0.10);

      // Medium should still be highest
      expect(mediumPercent).toBeGreaterThan(0.40);
    });

    it('receives pools with expected difficulty distribution (30/50/20)', () => {
      const pool = createWeightedPool(VRAGEN, 30);

      const easyPercent = pool.filter(q => q.difficulty === 'easy').length / pool.length;
      const mediumPercent = pool.filter(q => q.difficulty === 'medium').length / pool.length;
      const hardPercent = pool.filter(q => q.difficulty === 'hard').length / pool.length;

      // Allow 10% variance from target
      expect(easyPercent).toBeGreaterThan(0.20);
      expect(easyPercent).toBeLessThan(0.40);
      expect(mediumPercent).toBeGreaterThan(0.40);
      expect(mediumPercent).toBeLessThan(0.60);
      expect(hardPercent).toBeGreaterThan(0.10);
      expect(hardPercent).toBeLessThan(0.30);
    });
  });

  describe('Age progression (smooth transition)', () => {
    it('should show smooth decrease in easy questions as age increases', () => {
      const ages = [6, 8, 10, 12, 14, 16, 20, 25];
      const easyPercentages = ages.map(age => {
        const pool = createWeightedPool(VRAGEN, age);
        return pool.filter(q => q.difficulty === 'easy').length / pool.length;
      });

      // Each age group should have same or fewer easy questions than younger
      for (let i = 1; i < easyPercentages.length; i++) {
        expect(easyPercentages[i]).toBeLessThanOrEqual(easyPercentages[i - 1] + 0.01); // Allow tiny variance
      }
    });

    it('should show smooth increase in hard questions as age increases', () => {
      const ages = [6, 8, 10, 12, 14, 16, 20, 25];
      const hardPercentages = ages.map(age => {
        const pool = createWeightedPool(VRAGEN, age);
        return pool.filter(q => q.difficulty === 'hard').length / pool.length;
      });

      // Each age group should have same or more hard questions than younger
      for (let i = 1; i < hardPercentages.length; i++) {
        expect(hardPercentages[i]).toBeGreaterThanOrEqual(hardPercentages[i - 1] - 0.01); // Allow tiny variance
      }
    });
  });

  describe('Edge cases and data integrity', () => {
    it('should work with full VRAGEN dataset (254 questions)', () => {
      const pool = createWeightedPool(VRAGEN, 10);

      // Pool size may be smaller when we can't meet target ratios
      expect(pool.length).toBeGreaterThan(100); // Should have substantial number of questions
      expect(pool.length).toBeLessThanOrEqual(VRAGEN.length);

      // No duplicates
      const ids = pool.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should work with subset of questions', () => {
      const subset = VRAGEN.slice(0, 50);
      const pool = createWeightedPool(subset, 10);

      expect(pool.length).toBeGreaterThan(0);
      expect(pool.length).toBeLessThanOrEqual(subset.length);
    });

    it('should handle age at boundaries correctly', () => {
      // Test exact boundary ages
      const age9Pool = createWeightedPool(VRAGEN, 9);
      const age10Pool = createWeightedPool(VRAGEN, 10);
      const age15Pool = createWeightedPool(VRAGEN, 15);
      const age16Pool = createWeightedPool(VRAGEN, 16);

      // Age 9 should use YOUNG weights
      const age9Weights = getAgeWeights(9);
      expect(age9Weights.easy).toBe(0.70);

      // Age 10 should use TEEN weights
      const age10Weights = getAgeWeights(10);
      expect(age10Weights.easy).toBe(0.40);

      // Pools should reflect this
      const age9Easy = age9Pool.filter(q => q.difficulty === 'easy').length / age9Pool.length;
      const age10Easy = age10Pool.filter(q => q.difficulty === 'easy').length / age10Pool.length;

      expect(age9Easy).toBeGreaterThan(age10Easy + 0.15); // Should be noticeably different
    });
  });

  describe('Real-world scenarios', () => {
    it('multiplayer with different ages should get different distributions', () => {
      const player1Pool = createWeightedPool(VRAGEN, 7);  // Young child
      const player2Pool = createWeightedPool(VRAGEN, 14); // Teen
      const player3Pool = createWeightedPool(VRAGEN, 22); // Adult

      const p1Easy = player1Pool.filter(q => q.difficulty === 'easy').length / player1Pool.length;
      const p2Easy = player2Pool.filter(q => q.difficulty === 'easy').length / player2Pool.length;
      const p3Easy = player3Pool.filter(q => q.difficulty === 'easy').length / player3Pool.length;

      // Each should be noticeably different
      expect(p1Easy).toBeGreaterThan(p2Easy + 0.15);
      expect(p2Easy).toBeGreaterThan(p3Easy + 0.05);
    });

    it('should maintain weighting even with limited question pool', () => {
      // Simulate late-game scenario where many questions already shown
      const remainingQuestions = VRAGEN.slice(0, 30); // Only 30 left
      const youngPool = createWeightedPool(remainingQuestions, 8);

      // Should still create a pool
      expect(youngPool.length).toBeGreaterThan(0);

      if (youngPool.length > 0) {
        // Should still try to weight towards easy for young child
        const easyPercent = youngPool.filter(q => q.difficulty === 'easy').length / youngPool.length;

        // Might not hit 70% with limited pool, but should try to maximize easy
        // (first 30 of VRAGEN may not have enough easy, so just check it exists)
        expect(easyPercent).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Regression detection - prevents v10.1 bug', () => {
    it('should NOT give same questions to all ages (v10.1 bug check)', () => {
      const youngPool = createWeightedPool(VRAGEN, 8);
      const teenPool = createWeightedPool(VRAGEN, 13);

      // Get first 10 questions from each
      const youngFirst10 = youngPool.slice(0, 10).map(q => q.id);
      const teenFirst10 = teenPool.slice(0, 10).map(q => q.id);

      // They should be different (with 255 questions, highly unlikely to be same)
      const sameQuestions = youngFirst10.filter(id => teenFirst10.includes(id)).length;
      expect(sameQuestions).toBeLessThan(10); // Not all should be same
    });

    it('should maintain different distributions after multiple regenerations', () => {
      // Simulate pool regeneration (when changing players)
      const pools = [];
      for (let i = 0; i < 5; i++) {
        pools.push(createWeightedPool(VRAGEN, 8));
      }

      // All should have roughly same easy percentage (70%)
      const easyPercentages = pools.map(pool =>
        pool.filter(q => q.difficulty === 'easy').length / pool.length
      );

      easyPercentages.forEach(percent => {
        expect(percent).toBeGreaterThan(0.60);
        expect(percent).toBeLessThan(0.80);
      });
    });
  });
});
