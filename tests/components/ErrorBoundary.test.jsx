import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary.jsx';

// Component that throws an error
const ThrowError = ({ shouldThrow = true, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that works fine
const WorkingComponent = () => <div>Working component</div>;

describe('ErrorBoundary', () => {
  // Suppress console.error during tests (ErrorBoundary logs errors)
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Error catching', () => {
    it('catches errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show fallback UI
      expect(screen.getByText(/oeps! er ging iets mis/i)).toBeInTheDocument();
      expect(screen.getByText(/het sinterklaas spel heeft een foutje gemaakt/i)).toBeInTheDocument();
    });

    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      // Should render normal content
      expect(screen.getByText('Working component')).toBeInTheDocument();
      expect(screen.queryByText(/oeps/i)).not.toBeInTheDocument();
    });

    it('catches errors with custom messages', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/oeps/i)).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
          <ThrowError />
        </ErrorBoundary>
      );

      // Even if one child throws, should show error UI
      expect(screen.getByText(/oeps/i)).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('shows error icon and message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('😔')).toBeInTheDocument();
      expect(screen.getByText(/oeps! er ging iets mis/i)).toBeInTheDocument();
    });

    it('shows recovery buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /opnieuw proberen/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /volledig herladen/i })).toBeInTheDocument();
    });

    it('shows help text with troubleshooting tips', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/als het probleem blijft bestaan/i)).toBeInTheDocument();
      expect(screen.getByText(/browser cache te legen/i)).toBeInTheDocument();
    });

    it('shows dev info in development mode', () => {
      // Note: import.meta.env.DEV is true in test environment
      render(
        <ErrorBoundary>
          <ThrowError message="Specific error for dev" />
        </ErrorBoundary>
      );

      // Should show error message in dev mode
      expect(screen.getByText(/development info/i)).toBeInTheDocument();
      expect(screen.getByText(/specific error for dev/i)).toBeInTheDocument();
    });
  });

  describe('Recovery actions', () => {
    it('resets error state when "Opnieuw Proberen" is clicked', async () => {
      const user = userEvent.setup();

      // Track if recovery was attempted
      let shouldRecover = false;

      // Component that throws error unless recovery flag is set
      const ConditionalError = () => {
        if (!shouldRecover) {
          throw new Error('Error before recovery');
        }
        return <div>Recovered successfully</div>;
      };

      // Wrap in a container we can re-render
      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      );

      // Verify error UI is shown
      expect(screen.getByText(/oeps/i)).toBeInTheDocument();
      const resetButton = screen.getByRole('button', { name: /opnieuw proberen/i });

      // Set recovery flag and click reset
      shouldRecover = true;
      await user.click(resetButton);

      // Should show recovered content
      expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
      expect(screen.queryByText(/oeps/i)).not.toBeInTheDocument();
    });

    it('reloads page when "Volledig Herladen" is clicked', async () => {
      const user = userEvent.setup();

      // Mock window.location.reload
      const reloadMock = vi.fn();
      delete window.location;
      window.location = { reload: reloadMock };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /volledig herladen/i });
      await user.click(reloadButton);

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error logging', () => {
    it('logs error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Logged error" />
        </ErrorBoundary>
      );

      // Should have logged to console.error
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('logs component stack', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // console.error should include component stack info
      const calls = consoleErrorSpy.mock.calls.flat();
      const hasComponentStack = calls.some(arg =>
        typeof arg === 'string' && arg.includes('Component stack')
      );
      expect(hasComponentStack).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles errors in nested ErrorBoundaries', () => {
      render(
        <ErrorBoundary>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Inner boundary should catch it
      expect(screen.getByText(/oeps/i)).toBeInTheDocument();
    });

    it('handles async errors gracefully', async () => {
      // Note: ErrorBoundary only catches errors in render, not async
      // This test documents the limitation
      const AsyncError = () => {
        React.useEffect(() => {
          setTimeout(() => {
            // This won't be caught by ErrorBoundary
            // Would need a global error handler
          }, 0);
        }, []);
        return <div>Async component</div>;
      };

      render(
        <ErrorBoundary>
          <AsyncError />
        </ErrorBoundary>
      );

      // Should render normally (ErrorBoundary doesn't catch async errors)
      expect(screen.getByText('Async component')).toBeInTheDocument();
    });
  });
});
