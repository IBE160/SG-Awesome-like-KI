"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the QuizData interface based on the context file
export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string; // The correct answer text
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  motivationalFeedback?: string; // Add motivational feedback, optional as summary doesn't have it
}

interface QuizContextType {
  quizData: QuizData | null;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  score: number;
  quizCompleted: boolean;
  isCorrect: boolean | null;
  motivationalFeedback: string | undefined; // Add this line
  setQuizData: (data: QuizData) => void;
  handleAnswerSelect: (value: string) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

interface QuizProviderProps {
  children: ReactNode;
  initialQuizData?: QuizData;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children, initialQuizData }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(() => initialQuizData || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const normalizeAnswer = (answer: string | null | undefined) => (answer || '').trim().toLowerCase();
  const isCorrect = currentQuestion ? normalizeAnswer(selectedAnswer) === normalizeAnswer(currentQuestion.correctAnswer) : null;

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
    setShowFeedback(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null && currentQuestion) {
      setShowFeedback(true);

      console.log('--- Debugging Answer Comparison ---');
      console.log('Current Question:', currentQuestion.questionText);
      console.log('Selected Answer (raw):', selectedAnswer);
      console.log('Correct Answer (raw):', currentQuestion.correctAnswer);
      console.log('Options:', currentQuestion.options);
      console.log('Normalized Selected Answer:', normalizeAnswer(selectedAnswer));
      console.log('Normalized Correct Answer:', normalizeAnswer(currentQuestion.correctAnswer));
      console.log('Are they equal (normalized)?', normalizeAnswer(selectedAnswer) === normalizeAnswer(currentQuestion.correctAnswer));
      console.log('--- End Debug ---');

      if (normalizeAnswer(selectedAnswer) === normalizeAnswer(currentQuestion.correctAnswer)) {
        setScore(prevScore => prevScore + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (!quizData) return;

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizCompleted(true);
      // onQuizComplete(score); // This will be handled by the component using the context if needed
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizData(null); // Reset quiz data as well, typically new quiz data will be loaded
  };

  return (
    <QuizContext.Provider
      value={{
        quizData,
        currentQuestionIndex,
        selectedAnswer,
        showFeedback,
        score,
        quizCompleted,
        isCorrect,
        motivationalFeedback: quizData?.motivationalFeedback, // Add this line
        setQuizData,
        handleAnswerSelect,
        handleSubmitAnswer,
        handleNextQuestion,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
