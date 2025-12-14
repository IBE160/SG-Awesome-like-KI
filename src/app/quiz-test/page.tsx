"use client";

import { QuizProvider, useQuiz } from "@/lib/context/QuizContext";
import { useEffect } from "react";
import QuizInterface from "@/app/components/quiz/QuizInterface";

const QuizTestPage: React.FC = () => {
  const mockQuizData = {
    questions: [
      {
        questionText: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        correctAnswer: "Paris",
        explanation: "Paris is the capital and most populous city of France.",
      },
      {
        questionText: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Mars",
        explanation: "Mars is often referred to as the Red Planet due to its reddish appearance.",
      },
      {
        questionText: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: "Pacific Ocean",
        explanation: "The Pacific Ocean is the largest and deepest of Earth's five oceanic divisions.",
      },
      {
        questionText: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        correctAnswer: "Leonardo da Vinci",
        explanation: "The Mona Lisa is a half-length portrait painting by Italian artist Leonardo da Vinci.",
      },
    ],
  };

  const QuizContent = () => {
    const { setQuizData } = useQuiz();

    useEffect(() => {
      setQuizData(mockQuizData);
    }, [setQuizData]);

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center my-8">Quiz Test Page</h1>
        <QuizInterface />
      </div>
    );
  };

  return (
    <QuizProvider>
      <QuizContent />
    </QuizProvider>
  );
};

export default QuizTestPage;
