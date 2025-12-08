# Sintspel Test Suite

This directory contains the test infrastructure and test files for the Sinterklaas Quiz Game.

## Setup

### 1. Install Dependencies

First, install the required testing dependencies:

```bash
npm install
```

This will install:
- **Vitest** - Fast unit test framework
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM elements
- **happy-dom** - Lightweight DOM implementation for testing
- **@vitest/ui** - Visual test runner UI
- **@vitest/coverage-v8** - Code coverage reporting

## Running Tests

### Run All Tests (Watch Mode)

```bash
npm test
```

This runs tests in watch mode - tests will re-run when files change.

### Run Tests Once (CI Mode)

```bash
npm run test:run
```

### Run Tests with UI

```bash
npm run test:ui
```

Opens a browser-based UI to view and run tests interactively.

### Run Tests with Coverage

```bash
npm run test:coverage
```

Generates a coverage report showing which code is tested.

## Test Files

### `utils.test.js`
Tests for pure utility functions:
- `shuffleArray()` - Fisher-Yates shuffle algorithm
- `swipePower()` - Swipe gesture calculation
- `getTypeColor()` - Question type color mapping
- `generateQuestionPool()` - Question pool generation with duplicate prevention
- `getQuestionForPlayer()` - Sequential question selection
- `calculateAlarmTime()` - Random alarm time calculation
- `getNextPlayerIndex()` - Circular player rotation
- `findHighestScorePlayers()` - Winner selection logic

**Coverage:** 8 functions, 50+ test cases

### `players.test.js`
Tests for player management:
- Adding/removing players
- Player validation (name, age)
- Score tracking and incrementation
- Player rotation
- Score reset
- Game start validation (minimum 2 players)

**Coverage:** Player CRUD operations, 30+ test cases

### `alarm.test.js`
Tests for game alarm system:
- Alarm initialization and start
- Countdown logic
- Pause/resume functionality
- Alarm trigger when time reaches 0
- Game lock during alarm
- Alarm preferences (enable/disable)
- Time formatting
- Full alarm lifecycle integration

**Coverage:** Complex timing logic, 25+ test cases

### `storage.test.js`
Tests for localStorage persistence:
- Loading shown questions
- Saving shown questions
- Loading/saving mute preference
- Question pool reset
- Error handling (quota exceeded, privacy mode)
- Corrupted data handling
- Full persistence lifecycle

**Coverage:** All localStorage operations, 25+ test cases

## Test Utilities

### `setup.js`
Global test setup file that configures:
- **localStorage mock** - Prevents actual browser storage access
- **Audio mock** - Prevents actual audio playback during tests
- **Console mock** - Reduces noise in test output
- **Auto-cleanup** - Cleans up after each test

### `utils.js`
Extracted pure functions from `index.html` for easier testing. These are the **reference implementations** used by tests.

## Writing New Tests

### Example Test Structure

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from './utils.js';

describe('MyFeature', () => {
  it('should do something correctly', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases', () => {
    expect(myFunction(null)).toBe(defaultValue);
  });
});
```

### Best Practices

1. **Test one thing per test** - Each `it()` should test a single behavior
2. **Use descriptive names** - Test names should explain what's being tested
3. **Arrange-Act-Assert** - Set up data, call function, verify result
4. **Test edge cases** - Empty arrays, null values, boundary conditions
5. **Mock external dependencies** - Use mocks for localStorage, Audio, etc.

## Current Test Coverage

| Area | Test File | Coverage |
|------|-----------|----------|
| Pure Functions | `utils.test.js` | ✅ 100% |
| Player Management | `players.test.js` | ✅ ~90% |
| Alarm System | `alarm.test.js` | ✅ ~85% |
| localStorage | `storage.test.js` | ✅ ~80% |
| React Components | ❌ Not tested yet | 0% |
| Integration | ❌ Not tested yet | 0% |

**Overall: ~75% of critical business logic covered**

## Next Steps

### Priority 1: Component Tests
- Test React component rendering
- Test user interactions (button clicks, form submissions)
- Test state transitions between screens

### Priority 2: Integration Tests
- Full player registration → game → winner flow
- Alarm countdown integration with game state
- localStorage persistence across sessions

### Priority 3: E2E Tests
- Full game playthrough
- Mobile touch interactions
- Audio playback integration

## Troubleshooting

### Tests fail with "localStorage is not defined"
✓ This is mocked in `setup.js` - make sure Vitest is configured correctly

### Tests fail with "Audio is not a constructor"
✓ This is mocked in `setup.js` - check vitest.config.js setupFiles

### Coverage shows 0%
✓ Run `npm run test:coverage` instead of `npm test`

### Tests are slow
✓ Make sure you're using Vitest (not Jest) - it's much faster
✓ Check if you're running in watch mode vs. run-once mode

## CI/CD Integration

To run tests in continuous integration:

```bash
npm run test:run
```

This runs all tests once and exits with appropriate status code.

## Contributing

When adding new functionality to the game:

1. Write tests first (TDD) or immediately after
2. Ensure tests cover happy path + edge cases
3. Run `npm run test:coverage` to verify coverage
4. Aim for >80% coverage on new code
5. Add tests to appropriate file (`utils`, `players`, `alarm`, `storage`)

## Questions?

See the main test recommendations document for:
- Recommended testing strategy
- Areas needing better coverage
- Testing patterns and examples
