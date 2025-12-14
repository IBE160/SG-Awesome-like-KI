"use client";

import { useQuiz } from "../../../lib/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";




  const QuizInterface: React.FC = () => {
  const {
    quizData,
    currentQuestionIndex,
    selectedAnswer,
    showFeedback,
    score,
    quizCompleted,
    isCorrect,
    handleAnswerSelect,
    handleSubmitAnswer,
    handleNextQuestion,
    resetQuiz, // Add resetQuiz here
  } = useQuiz();

  const currentQuestion = quizData?.questions[currentQuestionIndex]; // Moved this line

  if (!quizData || !currentQuestion) {
    return <p className="text-red-500">Error: No quiz data available or current question not found.</p>;
  }



  if (quizCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Quiz Completed!</CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            You scored {score} out of {quizData.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl font-semibold mb-4">Great job!</p>
          {/* Add more detailed results or review options here */}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={resetQuiz}>Retake Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Question {currentQuestionIndex + 1} of {quizData.questions.length}</CardTitle>
        <CardDescription className="text-lg mt-2">{currentQuestion.questionText}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer || undefined} className="grid gap-4">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors
                ${selectedAnswer === option ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:bg-gray-50"}
                ${showFeedback && option === currentQuestion.correctAnswer && "bg-green-100 border-green-500"}
                ${showFeedback && selectedAnswer === option && !isCorrect && "bg-red-100 border-red-500"}
              `}
              onClick={() => handleAnswerSelect(option)}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-lg
            ${isCorrect ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-800"}
          `}>
            <p className="font-semibold">{isCorrect ? "Correct!" : "Incorrect."}</p>
            {!isCorrect && <p className="mt-2">The correct answer was: <span className="font-semibold">{currentQuestion.correctAnswer}</span></p>}
            {currentQuestion.explanation && (
              <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between mt-6">
        <Button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null || showFeedback}
          className="px-6 py-3 text-lg"
        >
          Submit Answer
        </Button>
        <Button
          onClick={handleNextQuestion}
          disabled={!showFeedback}
          className="px-6 py-3 text-lg"
        >
          {currentQuestionIndex < quizData.questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizInterface;