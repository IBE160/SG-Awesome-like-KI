// src/components/quiz-wizard/__tests__/QuizOptionsStep.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizOptionsStep from '../QuizOptionsStep';

describe('QuizOptionsStep', () => {
  const mockOnSelectOptions = jest.fn();
  const initialOptions = { quizLength: 'medium', questionType: 'multiple_choice' };

  beforeEach(() => {
    mockOnSelectOptions.mockClear();
  });

  it('renders correctly with initial options selected', () => {
    render(<QuizOptionsStep onSelectOptions={mockOnSelectOptions} initialOptions={initialOptions} />);

    expect(screen.getByLabelText('Medium (6-8 questions)')).toBeChecked();
    expect(screen.getByLabelText('Multiple Choice')).toBeChecked();
  });

  it('calls onSelectOptions when quiz length is changed', () => {
    render(<QuizOptionsStep onSelectOptions={mockOnSelectOptions} initialOptions={initialOptions} />);

    fireEvent.click(screen.getByLabelText('Short (3-5 questions)'));
    expect(mockOnSelectOptions).toHaveBeenCalledWith({ quizLength: 'short', questionType: 'multiple_choice' });
  });

  it('calls onSelectOptions when question type is changed', () => {
    const customInitialOptions = { quizLength: 'short', questionType: 'multiple_choice' };
    render(<QuizOptionsStep onSelectOptions={mockOnSelectOptions} initialOptions={customInitialOptions} />);

    // No other question types implemented yet, so this test might seem redundant
    // but it verifies the handler is called
    fireEvent.click(screen.getByLabelText('Multiple Choice'));
    expect(mockOnSelectOptions).toHaveBeenCalledWith({ quizLength: 'short', questionType: 'multiple_choice' });
  });

  it('reflects changes in initial options prop', () => {
    const { rerender } = render(<QuizOptionsStep onSelectOptions={mockOnSelectOptions} initialOptions={initialOptions} />);
    expect(screen.getByLabelText('Medium (6-8 questions)')).toBeChecked();

    const newOptions = { quizLength: 'long', questionType: 'multiple_choice' };
    rerender(<QuizOptionsStep onSelectOptions={mockOnSelectOptions} initialOptions={newOptions} />);
    expect(screen.getByLabelText('Long (9-12 questions)')).toBeChecked();
    expect(screen.getByLabelText('Medium (6-8 questions)')).not.toBeChecked();
  });
});
