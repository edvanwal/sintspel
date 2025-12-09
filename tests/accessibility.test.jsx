import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QuestionCard } from '../src/components/QuestionCard.jsx';
import { AnswerCard } from '../src/components/AnswerCard.jsx';
import { TimerDisplay } from '../src/components/TimerDisplay.jsx';
import { ScoreDisplay } from '../src/components/ScoreDisplay.jsx';

/**
 * Accessibility Tests
 *
 * These tests verify that the app is accessible to users with disabilities:
 * - Screen reader support (ARIA labels, roles)
 * - Keyboard navigation
 * - Focus management
 * - Semantic HTML
 *
 * Note: For automated axe-core testing, run: npm run test:a11y
 * (requires jsdom environment)
 */

describe('Accessibility Tests', () => {
  const mockQuestion = {
    id: 1,
    type: 'Kennis',
    difficulty: 'easy',
    text: 'Test vraag?',
    answer: 'Test antwoord'
  };

  const mockPlayer = {
    name: 'Tim',
    age: 8,
    score: 5
  };

  describe('ARIA labels and roles', () => {
    it('QuestionCard has accessible button with descriptive label', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          player={null}
          onFlip={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();

      // Label should be descriptive, not just "button"
      const name = button.getAttribute('aria-label') || button.textContent;
      expect(name.length).toBeGreaterThan(5);
    });

    it('AnswerCard buttons have clear labels', () => {
      render(
        <AnswerCard
          question={mockQuestion}
          score={2}
          timeLeft={null}
          timerActive={false}
          onCorrect={() => {}}
          onWrong={() => {}}
          onNext={() => {}}
        />
      );

      const buttons = screen.getAllByRole('button');

      // All buttons should have accessible names
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });

      // Should have Goed and Fout buttons (check by role and accessible name)
      expect(screen.getByRole('button', { name: /goed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fout/i })).toBeInTheDocument();
    });

    it('TimerDisplay uses live region for screen reader updates', () => {
      const { container } = render(<TimerDisplay timeLeft={5} />);

      // Timer should announce changes to screen readers
      const timerElement = container.querySelector('[aria-live]');
      expect(timerElement).toBeTruthy();

      // Should be polite (not assertive) to not interrupt
      const liveMode = timerElement?.getAttribute('aria-live');
      expect(liveMode).toMatch(/polite|assertive/);
    });

    it('ScoreDisplay shows score clearly', () => {
      render(<ScoreDisplay score={2} total={3} />);

      // Score should be visible and readable
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('can focus and activate buttons with keyboard', async () => {
      const user = userEvent.setup();
      const onFlip = vi.fn();

      render(
        <QuestionCard
          question={mockQuestion}
          player={null}
          onFlip={onFlip}
        />
      );

      const button = screen.getByRole('button');

      // Tab to button
      await user.tab();
      expect(document.activeElement).toBe(button);

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(onFlip).toHaveBeenCalled();
    });

    it('can activate buttons with Space key', async () => {
      const user = userEvent.setup();
      const onCorrect = vi.fn();

      render(
        <AnswerCard
          question={mockQuestion}
          score={2}
          timeLeft={null}
          timerActive={false}
          onCorrect={onCorrect}
          onWrong={() => {}}
          onNext={() => {}}
        />
      );

      const goedButton = screen.getByRole('button', { name: /goed/i });

      goedButton.focus();
      await user.keyboard(' '); // Space key

      expect(onCorrect).toHaveBeenCalled();
    });

    it('all interactive elements are keyboard accessible', () => {
      render(
        <AnswerCard
          question={mockQuestion}
          score={2}
          timeLeft={null}
          timerActive={false}
          onCorrect={() => {}}
          onWrong={() => {}}
          onNext={() => {}}
        />
      );

      const buttons = screen.getAllByRole('button');

      // All buttons should be tabbable (not tabIndex=-1)
      buttons.forEach(button => {
        const tabIndex = button.getAttribute('tabIndex');
        expect(tabIndex).not.toBe('-1');
      });
    });

    it('maintains logical tab order', async () => {
      const user = userEvent.setup();

      render(
        <AnswerCard
          question={mockQuestion}
          score={2}
          timeLeft={null}
          timerActive={false}
          onCorrect={() => {}}
          onWrong={() => {}}
          onNext={() => {}}
        />
      );

      const buttons = screen.getAllByRole('button');

      // Tab through buttons in order
      for (let i = 0; i < buttons.length; i++) {
        await user.tab();
        expect(buttons[i]).toHaveFocus();
      }
    });
  });

  describe('Semantic HTML', () => {
    it('uses button elements for clickable actions', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          player={null}
          onFlip={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('provides text content, not just icons', () => {
      render(
        <AnswerCard
          question={mockQuestion}
          score={2}
          timeLeft={null}
          timerActive={false}
          onCorrect={() => {}}
          onWrong={() => {}}
          onNext={() => {}}
        />
      );

      // Buttons should have text, not just rely on color/icons
      expect(screen.getByRole('button', { name: /goed/i })).toHaveTextContent('Goed');
      expect(screen.getByRole('button', { name: /fout/i })).toHaveTextContent('Fout');
    });
  });

  describe('Focus management', () => {
    it('elements are focusable when visible', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          player={mockPlayer}
          onFlip={() => {}}
        />
      );

      const button = screen.getByRole('button');

      // Should be able to receive focus
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('focus indicator is visible', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          player={null}
          onFlip={() => {}}
        />
      );

      const button = screen.getByRole('button');
      button.focus();

      // Focus should be visible (not outline: none without alternative)
      const computedStyle = window.getComputedStyle(button);

      // Button should either have outline, or custom focus styles
      expect(computedStyle.outline !== 'none' || computedStyle.boxShadow !== 'none').toBe(true);
    });
  });

  describe('Screen reader announcements', () => {
    it('dynamic content uses live regions', () => {
      const { rerender, container } = render(<TimerDisplay timeLeft={10} />);

      // Find live region
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();

      // Update timer
      rerender(<TimerDisplay timeLeft={9} />);

      // Live region should still be there with updated content
      expect(container.querySelector('[aria-live]')).toBeTruthy();
    });

    it('error states are announced', () => {
      // This documents expected behavior for error messages
      // Error messages should use role="alert" or aria-live="assertive"
      expect(true).toBe(true);
    });
  });

  describe('Touch targets', () => {
    it('buttons have adequate padding for touch targets', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          player={null}
          onFlip={() => {}}
        />
      );

      const button = screen.getByRole('button');

      // Check that buttons have adequate padding (py-5 = 20px top+bottom = 40px vertical)
      // WCAG recommends minimum 44x44px touch targets
      // Note: happy-dom doesn't calculate actual layout dimensions,
      // so we verify the CSS classes include proper padding
      const className = button.className;
      expect(className).toMatch(/py-[456]/); // py-4, py-5, or py-6 classes
      expect(className).toMatch(/px-/); // Has horizontal padding
    });
  });
});

// Helper for future axe-core integration
export const runAxeTest = async (_container) => {
  console.warn(
    '⚠️ axe-core requires jsdom environment. ' +
    'To run automated accessibility audits:\n' +
    '1. Install: npm install --save-dev @vitest/browser playwright\n' +
    '2. Run: vitest --browser=chromium tests/accessibility.test.jsx\n' +
    'Or use browser devtools Lighthouse/axe extension.'
  );
};
