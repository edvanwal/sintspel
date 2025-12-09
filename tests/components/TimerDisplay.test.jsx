import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from '../../src/components/TimerDisplay.jsx';

describe('TimerDisplay', () => {
  it('renders timer with correct time', () => {
    render(<TimerDisplay timeLeft={10} />);

    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('renders timer with alarm emoji', () => {
    render(<TimerDisplay timeLeft={5} />);

    expect(screen.getByText(/⏰/)).toBeInTheDocument();
  });

  it('applies urgent styling when time is low (3 seconds or less)', () => {
    const { container } = render(<TimerDisplay timeLeft={3} />);

    // Check for red/urgent styling
    const timerDiv = container.querySelector('.bg-\\[\\#A0253B\\]');
    expect(timerDiv).toBeInTheDocument();
  });

  it('applies normal styling when time is above 3 seconds', () => {
    const { container } = render(<TimerDisplay timeLeft={5} />);

    // Check for green/normal styling
    const timerDiv = container.querySelector('.bg-\\[\\#6B8E23\\]');
    expect(timerDiv).toBeInTheDocument();
  });

  it('renders nothing when timeLeft is null', () => {
    const { container } = render(<TimerDisplay timeLeft={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('has animate-pulse class for visual feedback', () => {
    const { container } = render(<TimerDisplay timeLeft={5} />);

    const timerDiv = container.querySelector('.animate-pulse');
    expect(timerDiv).toBeInTheDocument();
  });
});
