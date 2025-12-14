"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from 'lucide-react';

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuizData = {
  questions: QuizQuestion[];
};

type QuizInterfaceProps = {
  quizData: QuizData;
};

export const QuizInterface = ({ quizData }: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const totalQuestions = quizData.questions.length;
  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleAnswerSelect = (option: string) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (currentQuestionIndex >= totalQuestions) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Your final score is:</p>
          <p className="text-4xl font-bold my-4">{score} / {totalQuestions}</p>
        </CardContent>
        <CardFooter>
            <Button onClick={() => {
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setShowFeedback(false);
            }}>
                Retake Quiz
            </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Question {currentQuestionIndex + 1} of {totalQuestions}</CardTitle>
        <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-6">{currentQuestion.questionText}</p>
        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? (isCorrect ? 'default' : 'destructive') : 'outline'}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
              className="justify-start h-auto py-3"
            >
              {option}
            </Button>
          ))}
        </div>
        {showFeedback && (
          <div className="mt-6">
            {isCorrect ? (
              <Alert variant="default" className="bg-green-100 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Correct!</AlertTitle>
                <AlertDescription>
                  {currentQuestion.explanation}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Incorrect</AlertTitle>
                <AlertDescription>
                  The correct answer is: {currentQuestion.correctAnswer}.
                  <br />
                  {currentQuestion.explanation}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {showFeedback && (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < totalQuestions -1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
