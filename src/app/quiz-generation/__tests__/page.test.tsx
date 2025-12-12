import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizGenerationPage from '../page';

// Mock the fetch API
global.fetch = jest.fn();

describe('QuizGenerationPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders the quiz generation form', () => {
    render(<QuizGenerationPage />);
    expect(screen.getByRole('heading', { name: /Generate Quiz/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Document ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quiz Length/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Quiz/i })).toBeInTheDocument();
  });

  it('handles quiz generation successfully', async () => {
    const mockQuizResult = {
      id: 'quiz-123',
      questions: [
        { question: 'Q1', options: ['A', 'B', 'C'], correctAnswer: 'A' },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuizResult,
    });

    render(<QuizGenerationPage />);

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/Document ID/i), { target: { value: 'doc-abc' } });
    fireEvent.change(screen.getByLabelText(/Quiz Length/i), { target: { value: 'short' } });

    // Click generate button
    fireEvent.click(screen.getByRole('button', { name: /Generate Quiz/i }));

    // Check loading state
    expect(screen.getByText('Generating Quiz...')).toBeInTheDocument();
    expect(screen.getByText('Generating quiz, please wait...')).toBeInTheDocument();

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'doc-abc',
          type: 'quiz',
          options: { quizLength: 'short' },
        }),
      });
    });

    // Wait for the quiz result to be displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Generated Quiz/i })).toBeInTheDocument();
      expect(screen.getByText('Q1')).toBeInTheDocument();
      expect(screen.getByText('Correct: A')).toBeInTheDocument();
      expect(screen.queryByText('Generating Quiz...')).not.toBeInTheDocument();
      expect(screen.queryByText('Generating quiz, please wait...')).not.toBeInTheDocument();
    });
  });

  it('handles API error during quiz generation', async () => {
    const errorMessage = 'Failed to fetch from external AI service.';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    render(<QuizGenerationPage />);

    fireEvent.change(screen.getByLabelText(/Document ID/i), { target: { value: 'doc-error' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Quiz/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Generated Quiz')).not.toBeInTheDocument();
    });
  });

  it('handles AI generating a shorter quiz than requested', async () => {
    const mockQuizResult = {
      id: 'quiz-456',
      questions: [
        { question: 'Q1 Short', options: ['X', 'Y'], correctAnswer: 'X' },
      ],
      message: 'Content only supported a shorter quiz.',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuizResult,
    });

    render(<QuizGenerationPage />);

    fireEvent.change(screen.getByLabelText(/Document ID/i), { target: { value: 'doc-short' } });
    fireEvent.change(screen.getByLabelText(/Quiz Length/i), { target: { value: 'long' } }); // Request long, get short

    fireEvent.click(screen.getByRole('button', { name: /Generate Quiz/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      // Check if informative message and quiz are displayed
      expect(screen.getByRole('heading', { name: /Generated Quiz/i })).toBeInTheDocument();
      expect(screen.getByText('Content only supported a shorter quiz.')).toBeInTheDocument();
      expect(screen.getByText('Q1 Short')).toBeInTheDocument();
    });
  });
});
