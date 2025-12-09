import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QuestionCard } from '../../src/components/QuestionCard.jsx';

describe('QuestionCard', () => {
  const mockQuestion = {
    id: 1,
    type: 'KENNIS',
    text: 'Wat is de kleur van de mijter van Sinterklaas?',
    answer: 'Rood'
  };

  const mockPlayer = {
    name: 'Test Speler',
    score: 5
  };

  it('renders question text correctly', () => {
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={null} onFlip={onFlip} />);

    expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
  });

  it('renders question type label', () => {
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={null} onFlip={onFlip} />);

    expect(screen.getByText('KENNIS')).toBeInTheDocument();
  });

  it('renders player info when player is provided', () => {
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={mockPlayer} onFlip={onFlip} />);

    expect(screen.getByText(/Test Speler/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('does not render player info when player is null', () => {
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={null} onFlip={onFlip} />);

    expect(screen.queryByText(/Test Speler/)).not.toBeInTheDocument();
  });

  it('renders flip button with correct text', () => {
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={null} onFlip={onFlip} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/bekijk/i);
  });

  it('calls onFlip when button is clicked', async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={null} onFlip={onFlip} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    const onFlip = vi.fn();
    render(<QuestionCard question={mockQuestion} player={null} onFlip={onFlip} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});
