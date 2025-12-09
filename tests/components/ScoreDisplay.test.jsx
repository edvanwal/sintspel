import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from '../../src/components/ScoreDisplay.jsx';

describe('ScoreDisplay', () => {
  it('renders score correctly with default total', () => {
    render(<ScoreDisplay score={2} />);

    // Should show "2/3" by default
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('renders score with custom total', () => {
    render(<ScoreDisplay score={5} total={10} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('renders zero score correctly', () => {
    render(<ScoreDisplay score={0} total={3} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('renders maximum score correctly', () => {
    render(<ScoreDisplay score={3} total={3} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('uses correct styling classes', () => {
    const { container } = render(<ScoreDisplay score={2} />);

    // Check for gold/score styling
    const scoreDiv = container.querySelector('.bg-\\[\\#D4A574\\]');
    expect(scoreDiv).toBeInTheDocument();
  });
});
