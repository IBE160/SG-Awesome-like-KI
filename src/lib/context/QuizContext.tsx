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
}

interface QuizContextType {
  quizData: QuizData | null;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  score: number;
  quizCompleted: boolean;
  isCorrect: boolean | null;
  setQuizData: (data: QuizData) => void;
  handleAnswerSelect: (value: string) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const isCorrect = currentQuestion ? selectedAnswer === currentQuestion.correctAnswer : null;

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
    setShowFeedback(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null && currentQuestion) {
      setShowFeedback(true);
      if (selectedAnswer === currentQuestion.correctAnswer) {
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
