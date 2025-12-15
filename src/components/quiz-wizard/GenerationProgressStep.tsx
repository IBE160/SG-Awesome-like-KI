// src/components/quiz-wizard/GenerationProgressStep.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Assuming Next.js App Router for navigation

interface GenerationProgressStepProps {
  isGenerating: boolean;
  status: string | null;
  error: string | null;
  generatedContentId: string | null;
  onGenerate: () => void; // Function to trigger generation from this step if needed
}

const GenerationProgressStep: React.FC<GenerationProgressStepProps> = ({
  isGenerating,
  status,
  error,
  generatedContentId,
  onGenerate,
}) => {
  const router = useRouter();

  return (
    <div className="p-4 text-center">
      <h3 className="text-xl font-medium text-gray-700 mb-4">Quiz Generation Progress</h3>

      {isGenerating && (
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">{status || 'Generating your quiz...'}</p>
        </div>
      )}

      {error && (
        <div className="text-red-500">
          <p>Error during generation:</p>
          <p>{error}</p>
          <button
            onClick={onGenerate} // Allow retrying generation
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Retry Generation
          </button>
        </div>
      )}

      {!isGenerating && !error && generatedContentId && (
        <div className="text-green-600">
          <p>Quiz generated successfully!</p>
          <p className="text-sm text-gray-500">
            You can view your quiz{' '}
            <a href={`/quiz/${generatedContentId}`} className="text-blue-500 hover:underline">
              here
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default GenerationProgressStep;