// src/components/quiz-wizard/QuizOptionsStep.tsx
'use client';

import React from 'react';

type QuizLength = 'short' | 'medium' | 'long';
type QuestionType = 'multiple_choice'; // For now, only multiple choice

interface QuizOptions {
  quizLength: QuizLength;
  questionType: QuestionType;
}

interface QuizOptionsStepProps {
  onSelectOptions: (options: QuizOptions) => void;
  initialOptions: QuizOptions;
}

const QuizOptionsStep: React.FC<QuizOptionsStepProps> = ({ onSelectOptions, initialOptions }) => {
  const handleQuizLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectOptions({ ...initialOptions, quizLength: e.target.value as QuizLength });
  };

  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectOptions({ ...initialOptions, questionType: e.target.value as QuestionType });
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-xl font-medium text-gray-700 mb-4">Configure Quiz Options</h3>

      <div className="mb-8">
        <label className="block text-lg font-medium text-gray-700 mb-2">Quiz Length:</label>
        <div className="flex justify-center space-x-4">
          <div>
            <input
              type="radio"
              id="shortQuiz"
              name="quizLength"
              value="short"
              checked={initialOptions.quizLength === 'short'}
              onChange={handleQuizLengthChange}
              className="mr-2"
            />
            <label htmlFor="shortQuiz">Short (3-5 questions)</label>
          </div>
          <div>
            <input
              type="radio"
              id="mediumQuiz"
              name="quizLength"
              value="medium"
              checked={initialOptions.quizLength === 'medium'}
              onChange={handleQuizLengthChange}
              className="mr-2"
            />
            <label htmlFor="mediumQuiz">Medium (6-8 questions)</label>
          </div>
          <div>
            <input
              type="radio"
              id="longQuiz"
              name="quizLength"
              value="long"
              checked={initialOptions.quizLength === 'long'}
              onChange={handleQuizLengthChange}
              className="mr-2"
            />
            <label htmlFor="longQuiz">Long (9-12 questions)</label>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-lg font-medium text-gray-700 mb-2">Question Type:</label>
        <div className="flex justify-center space-x-4">
          <div>
            <input
              type="radio"
              id="multipleChoice"
              name="questionType"
              value="multiple_choice"
              checked={initialOptions.questionType === 'multiple_choice'}
              onChange={handleQuestionTypeChange}
              className="mr-2"
            />
            <label htmlFor="multipleChoice">Multiple Choice</label>
          </div>
          {/* Other question types can be added here later */}
        </div>
      </div>
    </div>
  );
};

export default QuizOptionsStep;