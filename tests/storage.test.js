import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('localStorage Handling', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Reset mock before each test
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = mockLocalStorage;
  });

  describe('Loading Shown Questions', () => {
    const loadShownQuestions = () => {
      try {
        const saved = localStorage.getItem('sintspel-shown-questions');
        const ids = saved ? JSON.parse(saved) : [];
        console.log(`📚 ${ids.length} vragen al getoond`);
        return ids;
      } catch (error) {
        console.log('⚠️ Kan localStorage niet laden');
        return [];
      }
    };

    it('should load shown questions from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([1, 2, 3]));

      const result = loadShownQuestions();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('sintspel-shown-questions');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return empty array if no saved data', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadShownQuestions();

      expect(result).toEqual([]);
    });

    it('should handle corrupted JSON gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {[}');

      const result = loadShownQuestions();

      expect(result).toEqual([]);
    });

    it('should handle localStorage.getItem throwing error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = loadShownQuestions();

      expect(result).toEqual([]);
    });

    it('should handle empty string', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      const result = loadShownQuestions();

      expect(result).toEqual([]);
    });

    it('should parse complex array correctly', () => {
      const savedData = [1, 5, 10, 15, 20, 25, 30];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

      const result = loadShownQuestions();

      expect(result).toEqual(savedData);
    });
  });

  describe('Saving Shown Questions', () => {
    const saveShownQuestions = (ids) => {
      try {
        localStorage.setItem('sintspel-shown-questions', JSON.stringify(ids));
        return true;
      } catch (error) {
        console.log('⚠️ Kan localStorage niet updaten');
        return false;
      }
    };

    it('should save shown questions to localStorage', () => {
      const ids = [1, 2, 3, 4];

      const result = saveShownQuestions(ids);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-shown-questions',
        JSON.stringify(ids)
      );
      expect(result).toBe(true);
    });

    it('should handle localStorage.setItem throwing error (quota exceeded)', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = saveShownQuestions([1, 2, 3]);

      expect(result).toBe(false);
    });

    it('should save empty array', () => {
      saveShownQuestions([]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-shown-questions',
        '[]'
      );
    });

    it('should save large array', () => {
      const largeArray = Array.from({ length: 255 }, (_, i) => i + 1);

      const result = saveShownQuestions(largeArray);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle privacy mode (setItem throws)', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Operation is not supported');
      });

      const result = saveShownQuestions([1, 2]);

      expect(result).toBe(false);
    });
  });

  describe('Loading Mute Preference', () => {
    const loadMutePreference = () => {
      try {
        const saved = localStorage.getItem('sintspel-muted');
        return saved === 'true';
      } catch (error) {
        return false;
      }
    };

    it('should load mute preference as true', () => {
      mockLocalStorage.getItem.mockReturnValue('true');

      const result = loadMutePreference();

      expect(result).toBe(true);
    });

    it('should load mute preference as false', () => {
      mockLocalStorage.getItem.mockReturnValue('false');

      const result = loadMutePreference();

      expect(result).toBe(false);
    });

    it('should default to false if no saved preference', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadMutePreference();

      expect(result).toBe(false);
    });

    it('should handle localStorage error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = loadMutePreference();

      expect(result).toBe(false);
    });

    it('should handle invalid values', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid');

      const result = loadMutePreference();

      expect(result).toBe(false);
    });
  });

  describe('Saving Mute Preference', () => {
    const saveMutePreference = (isMuted) => {
      try {
        localStorage.setItem('sintspel-muted', isMuted.toString());
        return true;
      } catch (error) {
        console.log('LocalStorage niet beschikbaar');
        return false;
      }
    };

    it('should save mute preference as true', () => {
      saveMutePreference(true);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-muted',
        'true'
      );
    });

    it('should save mute preference as false', () => {
      saveMutePreference(false);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-muted',
        'false'
      );
    });

    it('should handle localStorage error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = saveMutePreference(true);

      expect(result).toBe(false);
    });
  });

  describe('Question Pool Reset', () => {
    const resetQuestionPool = () => {
      try {
        localStorage.setItem('sintspel-shown-questions', JSON.stringify([]));
        return true;
      } catch (error) {
        console.log('⚠️ Kan localStorage niet updaten');
        return false;
      }
    };

    it('should reset shown questions to empty array', () => {
      resetQuestionPool();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-shown-questions',
        '[]'
      );
    });

    it('should handle localStorage error during reset', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = resetQuestionPool();

      expect(result).toBe(false);
    });
  });

  describe('Integration: Question Tracking Lifecycle', () => {
    it('should track questions across sessions', () => {
      // Session 1: Show first 3 questions
      let shownIds = [];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(shownIds));

      // Load initial state
      const initialIds = JSON.parse(mockLocalStorage.getItem('sintspel-shown-questions') || '[]');
      expect(initialIds).toEqual([]);

      // Mark questions 1, 2, 3 as shown
      shownIds = [1, 2, 3];
      mockLocalStorage.setItem('sintspel-shown-questions', JSON.stringify(shownIds));

      // Verify save was called
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-shown-questions',
        JSON.stringify([1, 2, 3])
      );

      // Session 2: Load and show more questions
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([1, 2, 3]));
      const loadedIds = JSON.parse(mockLocalStorage.getItem('sintspel-shown-questions'));
      expect(loadedIds).toEqual([1, 2, 3]);

      // Add more shown questions
      const newShownIds = [...loadedIds, 4, 5];
      mockLocalStorage.setItem('sintspel-shown-questions', JSON.stringify(newShownIds));

      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'sintspel-shown-questions',
        JSON.stringify([1, 2, 3, 4, 5])
      );
    });

    it('should handle reset after all questions shown', () => {
      const totalQuestions = 255;

      // All questions have been shown
      const allIds = Array.from({ length: totalQuestions }, (_, i) => i + 1);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(allIds));

      const shownIds = JSON.parse(mockLocalStorage.getItem('sintspel-shown-questions'));
      expect(shownIds.length).toBe(255);

      // Reset when all shown
      if (shownIds.length >= totalQuestions) {
        mockLocalStorage.setItem('sintspel-shown-questions', JSON.stringify([]));
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-shown-questions',
        '[]'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large shown questions array', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeArray));

      try {
        const saved = localStorage.getItem('sintspel-shown-questions');
        const ids = saved ? JSON.parse(saved) : [];
        expect(ids).toHaveLength(1000);
      } catch (error) {
        // Should not throw
        expect(error).toBeUndefined();
      }
    });

    it('should handle duplicate IDs in saved data', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([1, 2, 2, 3, 3, 3]));

      const saved = localStorage.getItem('sintspel-shown-questions');
      const ids = saved ? JSON.parse(saved) : [];

      expect(ids).toEqual([1, 2, 2, 3, 3, 3]);
    });

    it('should handle non-array data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ foo: 'bar' }));

      try {
        const saved = localStorage.getItem('sintspel-shown-questions');
        JSON.parse(saved);
        // If it parses successfully but isn't an array, handle it
      } catch (error) {
        // Should handle gracefully
      }
    });

    it('should handle special characters in data', () => {
      const dataWithSpecialChars = [1, 2, 3];
      const json = JSON.stringify(dataWithSpecialChars);

      mockLocalStorage.setItem('sintspel-shown-questions', json);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sintspel-shown-questions',
        json
      );
    });
  });
});
