import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuizInterface, QuizData } from '@/app/components/quiz/QuizInterface';

const mockQuizData: QuizData = {
  questions: [
    {
      questionText: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and most populous city of France.',
    },
    {
      questionText: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: 'The sum of 2 and 2 is 4.',
    },
  ],
};

describe('QuizInterface', () => {
  it('renders the first question and its answers', () => {
    render(<QuizInterface quizData={mockQuizData} />);

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('shows immediate feedback for a correct answer', () => {
    render(<QuizInterface quizData={mockQuizData} />);
    
    fireEvent.click(screen.getByText('Paris'));

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText(mockQuizData.questions[0].explanation)).toBeInTheDocument();
  });

  it('shows immediate feedback for an incorrect answer', () => {
    render(<QuizInterface quizData={mockQuizData} />);
    
    fireEvent.click(screen.getByText('London'));

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText(`The correct answer is: ${mockQuizData.questions[0].correctAnswer}.`)).toBeInTheDocument();
  });

  it('proceeds to the next question', () => {
    render(<QuizInterface quizData={mockQuizData} />);
    
    fireEvent.click(screen.getByText('Paris'));
    fireEvent.click(screen.getByText('Next Question'));

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
  });

  it('disables options after an answer is selected', () => {
    render(<QuizInterface quizData={mockQuizData} />);

    const parisButton = screen.getByText('Paris');
    fireEvent.click(parisButton);
    
    expect(parisButton).toBeDisabled();
    expect(screen.getByText('London')).toBeDisabled();
  });

  it('shows the final score at the end of the quiz', () => {
    render(<QuizInterface quizData={mockQuizData} />);
    
    // Question 1
    fireEvent.click(screen.getByText('Paris')); // Correct
    fireEvent.click(screen.getByText('Next Question'));

    // Question 2
    fireEvent.click(screen.getByText('4')); // Correct
    fireEvent.click(screen.getByText('Finish Quiz'));

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('allows retaking the quiz', () => {
    render(<QuizInterface quizData={mockQuizData} />);
    
    // Complete the quiz
    fireEvent.click(screen.getByText('Paris'));
    fireEvent.click(screen.getByText('Next Question'));
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('Finish Quiz'));

    // Retake
    fireEvent.click(screen.getByText('Retake Quiz'));

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });
});
