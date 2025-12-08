import { describe, it, expect, beforeEach } from 'vitest';

describe('Player Management', () => {
  describe('handleAddPlayer', () => {
    let players;

    beforeEach(() => {
      players = [];
    });

    const addPlayer = (players, name, age) => {
      if (name.trim() && age && parseInt(age) > 0) {
        return [...players, {
          name: name.trim(),
          age: parseInt(age),
          score: 0
        }];
      }
      return players;
    };

    it('should add player with valid name and age', () => {
      const result = addPlayer(players, 'Alice', '12');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Alice',
        age: 12,
        score: 0
      });
    });

    it('should trim player name', () => {
      const result = addPlayer(players, '  Bob  ', '10');

      expect(result[0].name).toBe('Bob');
    });

    it('should reject empty name', () => {
      const result = addPlayer(players, '', '10');
      expect(result).toHaveLength(0);
    });

    it('should reject whitespace-only name', () => {
      const result = addPlayer(players, '   ', '10');
      expect(result).toHaveLength(0);
    });

    it('should reject zero age', () => {
      const result = addPlayer(players, 'Alice', '0');
      expect(result).toHaveLength(0);
    });

    it('should reject negative age', () => {
      const result = addPlayer(players, 'Alice', '-5');
      expect(result).toHaveLength(0);
    });

    it('should reject non-numeric age', () => {
      const result = addPlayer(players, 'Alice', 'abc');
      expect(result).toHaveLength(0);
    });

    it('should initialize score to 0', () => {
      const result = addPlayer(players, 'Alice', '12');
      expect(result[0].score).toBe(0);
    });

    it('should add multiple players', () => {
      let result = addPlayer(players, 'Alice', '12');
      result = addPlayer(result, 'Bob', '10');
      result = addPlayer(result, 'Charlie', '14');

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Charlie');
    });

    it('should handle string age that can be parsed', () => {
      const result = addPlayer(players, 'Alice', '12');
      expect(result[0].age).toBe(12);
      expect(typeof result[0].age).toBe('number');
    });
  });

  describe('handleRemovePlayer', () => {
    const removePlayer = (players, index) => {
      return players.filter((_, i) => i !== index);
    };

    it('should remove player at correct index', () => {
      const players = [
        { name: 'Alice', age: 12, score: 5 },
        { name: 'Bob', age: 10, score: 3 },
        { name: 'Charlie', age: 14, score: 7 }
      ];

      const result = removePlayer(players, 1);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Charlie');
    });

    it('should remove first player', () => {
      const players = [
        { name: 'Alice', age: 12, score: 5 },
        { name: 'Bob', age: 10, score: 3 }
      ];

      const result = removePlayer(players, 0);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });

    it('should remove last player', () => {
      const players = [
        { name: 'Alice', age: 12, score: 5 },
        { name: 'Bob', age: 10, score: 3 }
      ];

      const result = removePlayer(players, 1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('should handle removing from single player array', () => {
      const players = [{ name: 'Alice', age: 12, score: 5 }];
      const result = removePlayer(players, 0);

      expect(result).toHaveLength(0);
    });

    it('should handle invalid index gracefully', () => {
      const players = [
        { name: 'Alice', age: 12, score: 5 },
        { name: 'Bob', age: 10, score: 3 }
      ];

      // Index out of bounds should not crash
      const result = removePlayer(players, 10);
      expect(result).toHaveLength(2); // No change
    });
  });

  describe('Score Tracking', () => {
    const incrementPlayerScore = (players, playerIndex, points = 1) => {
      if (playerIndex < 0 || playerIndex >= players.length) {
        return players;
      }

      const updated = [...players];
      updated[playerIndex] = {
        ...updated[playerIndex],
        score: updated[playerIndex].score + points
      };
      return updated;
    };

    it('should increment player score correctly', () => {
      const players = [
        { name: 'Alice', age: 12, score: 0 },
        { name: 'Bob', age: 10, score: 0 }
      ];

      const result = incrementPlayerScore(players, 0, 1);

      expect(result[0].score).toBe(1);
      expect(result[1].score).toBe(0); // Other player unchanged
    });

    it('should increment score multiple times', () => {
      let players = [{ name: 'Alice', age: 12, score: 0 }];

      players = incrementPlayerScore(players, 0, 1); // 0 → 1
      players = incrementPlayerScore(players, 0, 1); // 1 → 2
      players = incrementPlayerScore(players, 0, 1); // 2 → 3

      expect(players[0].score).toBe(3);
    });

    it('should handle bounds checking for player index', () => {
      const players = [
        { name: 'Alice', age: 12, score: 5 }
      ];

      // Should not crash on out-of-bounds
      const result1 = incrementPlayerScore(players, -1, 1);
      expect(result1[0].score).toBe(5); // Unchanged

      const result2 = incrementPlayerScore(players, 10, 1);
      expect(result2[0].score).toBe(5); // Unchanged
    });

    it('should increment correct player in multi-player game', () => {
      const players = [
        { name: 'Alice', age: 12, score: 2 },
        { name: 'Bob', age: 10, score: 3 },
        { name: 'Charlie', age: 14, score: 1 }
      ];

      const result = incrementPlayerScore(players, 1, 1);

      expect(result[0].score).toBe(2); // Unchanged
      expect(result[1].score).toBe(4); // Incremented
      expect(result[2].score).toBe(1); // Unchanged
    });

    it('should not mutate original players array', () => {
      const players = [{ name: 'Alice', age: 12, score: 0 }];
      const original = JSON.parse(JSON.stringify(players));

      incrementPlayerScore(players, 0, 1);

      expect(players).toEqual(original);
    });
  });

  describe('Player Registration Validation', () => {
    const canStartGame = (players) => {
      return players.length >= 2;
    };

    it('should require at least 2 players to start', () => {
      expect(canStartGame([])).toBe(false);
      expect(canStartGame([{ name: 'Alice', age: 12, score: 0 }])).toBe(false);
    });

    it('should allow game with 2 players', () => {
      const players = [
        { name: 'Alice', age: 12, score: 0 },
        { name: 'Bob', age: 10, score: 0 }
      ];

      expect(canStartGame(players)).toBe(true);
    });

    it('should allow game with many players', () => {
      const players = Array.from({ length: 10 }, (_, i) => ({
        name: `Player${i}`,
        age: 10,
        score: 0
      }));

      expect(canStartGame(players)).toBe(true);
    });
  });

  describe('Player Display Order', () => {
    it('should maintain insertion order', () => {
      const players = [];
      const names = ['Alice', 'Bob', 'Charlie', 'David'];

      let result = players;
      names.forEach((name, i) => {
        result = [...result, { name, age: 10 + i, score: 0 }];
      });

      result.forEach((player, i) => {
        expect(player.name).toBe(names[i]);
      });
    });
  });

  describe('Score Reset', () => {
    const resetAllScores = (players) => {
      return players.map(player => ({
        ...player,
        score: 0
      }));
    };

    it('should reset all player scores to 0', () => {
      const players = [
        { name: 'Alice', age: 12, score: 15 },
        { name: 'Bob', age: 10, score: 8 },
        { name: 'Charlie', age: 14, score: 22 }
      ];

      const result = resetAllScores(players);

      expect(result[0].score).toBe(0);
      expect(result[1].score).toBe(0);
      expect(result[2].score).toBe(0);
    });

    it('should preserve player names and ages', () => {
      const players = [
        { name: 'Alice', age: 12, score: 15 },
        { name: 'Bob', age: 10, score: 8 }
      ];

      const result = resetAllScores(players);

      expect(result[0]).toEqual({ name: 'Alice', age: 12, score: 0 });
      expect(result[1]).toEqual({ name: 'Bob', age: 10, score: 0 });
    });

    it('should handle empty player array', () => {
      const result = resetAllScores([]);
      expect(result).toEqual([]);
    });
  });
});
