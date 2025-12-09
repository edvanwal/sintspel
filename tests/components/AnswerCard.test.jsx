import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AnswerCard } from '../../src/components/AnswerCard.jsx';

describe('AnswerCard', () => {
  const mockQuestion = {
    id: 1,
    type: 'KENNIS',
    text: 'Wat is de kleur van de mijter van Sinterklaas?',
    answer: 'Rood'
  };

  const defaultProps = {
    question: mockQuestion,
    score: 2,
    timeLeft: null,
    timerActive: false,
    onCorrect: vi.fn(),
    onWrong: vi.fn(),
    onNext: null,
    onFlip: null
  };

  it('renders answer text correctly', () => {
    render(<AnswerCard {...defaultProps} />);

    expect(screen.getByText(mockQuestion.answer)).toBeInTheDocument();
  });

  it('displays current score', () => {
    render(<AnswerCard {...defaultProps} />);

    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it('renders timer when active', () => {
    render(<AnswerCard {...defaultProps} timeLeft={10} timerActive={true} />);

    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('does not render timer when inactive', () => {
    render(<AnswerCard {...defaultProps} timeLeft={10} timerActive={false} />);

    // Timer should not be visible
    const timerElement = screen.queryByText(/⏰/);
    expect(timerElement).not.toBeInTheDocument();
  });

  it('renders Goed and Fout buttons', () => {
    render(<AnswerCard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /goed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fout/i })).toBeInTheDocument();
  });

  it('calls onCorrect when Goed button is clicked', async () => {
    const user = userEvent.setup();
    const onCorrect = vi.fn();

    render(<AnswerCard {...defaultProps} onCorrect={onCorrect} />);

    const goedButton = screen.getByRole('button', { name: /goed/i });
    await user.click(goedButton);

    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('calls onWrong when Fout button is clicked', async () => {
    const user = userEvent.setup();
    const onWrong = vi.fn();

    render(<AnswerCard {...defaultProps} onWrong={onWrong} />);

    const foutButton = screen.getByRole('button', { name: /fout/i });
    await user.click(foutButton);

    expect(onWrong).toHaveBeenCalledTimes(1);
  });

  it('renders back to question button when onFlip is provided', () => {
    const onFlip = vi.fn();
    render(<AnswerCard {...defaultProps} onFlip={onFlip} />);

    expect(screen.getByRole('button', { name: /terug naar vraag/i })).toBeInTheDocument();
  });

  it('does not render back button when onFlip is not provided', () => {
    render(<AnswerCard {...defaultProps} onFlip={null} />);

    expect(screen.queryByRole('button', { name: /terug naar vraag/i })).not.toBeInTheDocument();
  });

  it('calls onFlip when back button is clicked', async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();

    render(<AnswerCard {...defaultProps} onFlip={onFlip} />);

    const backButton = screen.getByRole('button', { name: /terug naar vraag/i });
    await user.click(backButton);

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('renders next player button when onNext is provided', () => {
    const onNext = vi.fn();
    render(<AnswerCard {...defaultProps} onNext={onNext} />);

    expect(screen.getByRole('button', { name: /volgende speler/i })).toBeInTheDocument();
  });

  it('calls onNext when next player button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<AnswerCard {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByRole('button', { name: /volgende speler/i });
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes on buttons', () => {
    render(<AnswerCard {...defaultProps} />);

    const goedButton = screen.getByRole('button', { name: /goed/i });
    const foutButton = screen.getByRole('button', { name: /fout/i });

    expect(goedButton).toHaveAttribute('aria-label');
    expect(foutButton).toHaveAttribute('aria-label');
  });
});
