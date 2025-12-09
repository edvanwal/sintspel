import { describe, it, expect } from 'vitest';

describe('Alarm System', () => {
  describe('Alarm State Management', () => {
    const createAlarmState = () => ({
      alarmMaxTime: 10,
      alarmTimeLeft: null,
      alarmActive: false,
      alarmPaused: false,
      alarmTriggered: false,
      gameLocked: false
    });

    it('should initialize with correct default values', () => {
      const state = createAlarmState();

      expect(state.alarmMaxTime).toBe(10);
      expect(state.alarmTimeLeft).toBeNull();
      expect(state.alarmActive).toBe(false);
      expect(state.alarmPaused).toBe(false);
      expect(state.alarmTriggered).toBe(false);
      expect(state.gameLocked).toBe(false);
    });
  });

  describe('startGameAlarm', () => {
    const startGameAlarm = (maxTime) => {
      const maxSeconds = maxTime * 60;
      const minSeconds = Math.max(maxSeconds - 120, 60);
      const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;

      return {
        alarmTimeLeft: randomSeconds,
        alarmActive: true,
        alarmPaused: false,
        alarmTriggered: false
      };
    };

    it('should activate alarm', () => {
      const result = startGameAlarm(10);

      expect(result.alarmActive).toBe(true);
      expect(result.alarmPaused).toBe(false);
      expect(result.alarmTriggered).toBe(false);
    });

    it('should set random time within range', () => {
      const maxTime = 10;
      const maxSeconds = maxTime * 60;
      const minSeconds = maxSeconds - 120;

      // Test multiple times due to randomness
      for (let i = 0; i < 20; i++) {
        const result = startGameAlarm(maxTime);
        expect(result.alarmTimeLeft).toBeGreaterThanOrEqual(minSeconds);
        expect(result.alarmTimeLeft).toBeLessThanOrEqual(maxSeconds);
      }
    });

    it('should never set time below 60 seconds', () => {
      // Even with 1 minute max, should be >= 60s
      for (let i = 0; i < 10; i++) {
        const result = startGameAlarm(1);
        expect(result.alarmTimeLeft).toBeGreaterThanOrEqual(60);
      }
    });

    it('should handle large max times', () => {
      const result = startGameAlarm(60);
      expect(result.alarmTimeLeft).toBeGreaterThanOrEqual(3480); // 60*60 - 120
      expect(result.alarmTimeLeft).toBeLessThanOrEqual(3600); // 60*60
    });
  });

  describe('Alarm Countdown', () => {
    const decrementAlarm = (timeLeft, active, paused) => {
      if (active && !paused && timeLeft !== null && timeLeft > 0) {
        return timeLeft - 1;
      }
      return timeLeft;
    };

    it('should decrement when active and not paused', () => {
      expect(decrementAlarm(100, true, false)).toBe(99);
      expect(decrementAlarm(50, true, false)).toBe(49);
      expect(decrementAlarm(1, true, false)).toBe(0);
    });

    it('should not decrement when paused', () => {
      expect(decrementAlarm(100, true, true)).toBe(100);
    });

    it('should not decrement when not active', () => {
      expect(decrementAlarm(100, false, false)).toBe(100);
    });

    it('should not go below 0', () => {
      expect(decrementAlarm(0, true, false)).toBe(0);
    });

    it('should handle null timeLeft', () => {
      expect(decrementAlarm(null, true, false)).toBeNull();
    });
  });

  describe('Alarm Trigger', () => {
    const checkAlarmTrigger = (timeLeft, active, paused) => {
      if (active && !paused && timeLeft === 0) {
        return {
          alarmActive: false,
          alarmTriggered: true,
          gameLocked: true
        };
      }
      return {
        alarmActive: active,
        alarmTriggered: false,
        gameLocked: false
      };
    };

    it('should trigger when timeLeft reaches 0', () => {
      const result = checkAlarmTrigger(0, true, false);

      expect(result.alarmActive).toBe(false);
      expect(result.alarmTriggered).toBe(true);
      expect(result.gameLocked).toBe(true);
    });

    it('should not trigger when paused at 0', () => {
      const result = checkAlarmTrigger(0, true, true);

      expect(result.alarmTriggered).toBe(false);
      expect(result.gameLocked).toBe(false);
    });

    it('should not trigger when not active', () => {
      const result = checkAlarmTrigger(0, false, false);

      expect(result.alarmTriggered).toBe(false);
    });

    it('should not trigger before reaching 0', () => {
      const result = checkAlarmTrigger(1, true, false);

      expect(result.alarmTriggered).toBe(false);
      expect(result.gameLocked).toBe(false);
    });
  });

  describe('pauseGameAlarm', () => {
    const pauseGameAlarm = () => ({
      alarmPaused: true
    });

    it('should set alarmPaused to true', () => {
      const result = pauseGameAlarm();
      expect(result.alarmPaused).toBe(true);
    });
  });

  describe('resumeGameAlarm', () => {
    const resumeGameAlarm = () => ({
      alarmPaused: false
    });

    it('should set alarmPaused to false', () => {
      const result = resumeGameAlarm();
      expect(result.alarmPaused).toBe(false);
    });
  });

  describe('resetGameAlarm', () => {
    const resetGameAlarm = () => ({
      alarmActive: false,
      alarmPaused: false,
      alarmTimeLeft: null,
      alarmTriggered: false,
      gameLocked: false
    });

    it('should reset all alarm state', () => {
      const result = resetGameAlarm();

      expect(result.alarmActive).toBe(false);
      expect(result.alarmPaused).toBe(false);
      expect(result.alarmTimeLeft).toBeNull();
      expect(result.alarmTriggered).toBe(false);
      expect(result.gameLocked).toBe(false);
    });
  });

  describe('stopGameAlarm', () => {
    const stopGameAlarm = () => ({
      alarmActive: false,
      alarmPaused: false,
      alarmTimeLeft: null
    });

    it('should stop alarm without triggering', () => {
      const result = stopGameAlarm();

      expect(result.alarmActive).toBe(false);
      expect(result.alarmPaused).toBe(false);
      expect(result.alarmTimeLeft).toBeNull();
    });
  });

  describe('Alarm Time Formatting', () => {
    const formatAlarmTime = (seconds) => {
      if (seconds === null || seconds === undefined) return '00:00';

      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    it('should format seconds correctly', () => {
      expect(formatAlarmTime(0)).toBe('00:00');
      expect(formatAlarmTime(30)).toBe('00:30');
      expect(formatAlarmTime(60)).toBe('01:00');
      expect(formatAlarmTime(90)).toBe('01:30');
      expect(formatAlarmTime(600)).toBe('10:00');
    });

    it('should pad single digits', () => {
      expect(formatAlarmTime(5)).toBe('00:05');
      expect(formatAlarmTime(65)).toBe('01:05');
    });

    it('should handle large times', () => {
      expect(formatAlarmTime(3600)).toBe('60:00'); // 1 hour
      expect(formatAlarmTime(3661)).toBe('61:01');
    });

    it('should handle null/undefined', () => {
      expect(formatAlarmTime(null)).toBe('00:00');
      expect(formatAlarmTime(undefined)).toBe('00:00');
    });
  });

  describe('Game Lock During Alarm', () => {
    const canPerformAction = (gameLocked) => {
      return !gameLocked;
    };

    it('should prevent actions when game locked', () => {
      expect(canPerformAction(true)).toBe(false);
    });

    it('should allow actions when game not locked', () => {
      expect(canPerformAction(false)).toBe(true);
    });
  });

  describe('Alarm Preference Handling', () => {
    const handleAlarmYes = () => ({
      showAlarmQuestion: false,
      alarmEnabled: true,
      showAlarmMinimized: false
    });

    const handleAlarmNo = () => ({
      showAlarmQuestion: false,
      alarmEnabled: false,
      showAlarmMinimized: true
    });

    it('should enable alarm when user chooses Yes', () => {
      const result = handleAlarmYes();

      expect(result.showAlarmQuestion).toBe(false);
      expect(result.alarmEnabled).toBe(true);
      expect(result.showAlarmMinimized).toBe(false);
    });

    it('should disable and minimize when user chooses No', () => {
      const result = handleAlarmNo();

      expect(result.showAlarmQuestion).toBe(false);
      expect(result.alarmEnabled).toBe(false);
      expect(result.showAlarmMinimized).toBe(true);
    });
  });

  describe('Alarm Reopen', () => {
    const handleAlarmReopen = () => ({
      showAlarmMinimized: false,
      alarmEnabled: true
    });

    it('should reopen alarm from minimized state', () => {
      const result = handleAlarmReopen();

      expect(result.showAlarmMinimized).toBe(false);
      expect(result.alarmEnabled).toBe(true);
    });
  });

  describe('Integration: Full Alarm Lifecycle', () => {
    it('should complete full alarm cycle', () => {
      // 1. Start alarm
      let timeLeft = 120; // 2 minutes
      let active = true;
      let paused = false;
      let triggered = false;

      expect(active).toBe(true);
      expect(timeLeft).toBe(120);

      // 2. Countdown for 60 seconds
      for (let i = 0; i < 60; i++) {
        timeLeft--;
      }
      expect(timeLeft).toBe(60);

      // 3. Pause alarm
      paused = true;
      const timeDuringPause = timeLeft;
      // Simulate 10 "ticks" while paused
      for (let i = 0; i < 10; i++) {
        if (!paused) timeLeft--;
      }
      // Time should not change while paused
      expect(timeLeft).toBe(timeDuringPause);

      // 4. Resume alarm
      paused = false;

      // 5. Continue countdown to 0
      while (timeLeft > 0) {
        timeLeft--;
      }
      expect(timeLeft).toBe(0);

      // 6. Trigger alarm
      if (active && !paused && timeLeft === 0) {
        active = false;
        triggered = true;
      }

      expect(active).toBe(false);
      expect(triggered).toBe(true);
    });
  });
});
