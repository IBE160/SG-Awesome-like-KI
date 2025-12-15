// src/components/quiz-wizard/QuizWizard.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';
import DocumentSelectionStep, { DocumentSelectionStepHandle } from './DocumentSelectionStep';
import QuizOptionsStep from './QuizOptionsStep';
import GenerationProgressStep from './GenerationProgressStep';

// Define QuizLength and QuestionType here or import from a common type file
type QuizLength = 'short' | 'medium' | 'long';
type QuestionType = 'multiple_choice'; // For now, only multiple choice

interface QuizWizardProps {
  initialDocumentId?: string; // Optional prop for pre-selecting a single document
  onClose: () => void; // Function to call when the wizard is closed/completed
}

const QuizWizard: React.FC<QuizWizardProps> = ({ initialDocumentId, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  // selectedDocumentIds will be managed by the parent via the ref for the first step
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(
    initialDocumentId ? [initialDocumentId] : []
  );
  const documentSelectionRef = useRef<DocumentSelectionStepHandle>(null);
  const [quizOptions, setQuizOptions] = useState<{
    quizLength: QuizLength;
    questionType: QuestionType;
  }>({
    quizLength: 'medium', // Default
    questionType: 'multiple_choice', // Default
  });
  const [showDocumentSelectionError, setShowDocumentSelectionError] = useState(false); // New state for error message

  // States for quiz generation
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generatedContentId, setGeneratedContentId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    if (selectedDocumentIds.length === 0) {
      setGenerationError('No document(s) selected for quiz generation.');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Starting quiz generation...');
    setGeneratedContentId(null);
    setGenerationError(null);

    try {
            // Assuming /api/generate handles multiple document IDs and quiz options
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studyMaterialIds: selectedDocumentIds,
                type: 'quiz', // Always 'quiz' for this wizard
                options: quizOptions,
              }),
            });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate quiz.');
      }

      setGeneratedContentId(data.generatedContentId); // Correctly extract from top-level
      setGenerationStatus('Quiz generated successfully!');
      setCurrentStep(steps.length - 1); // Advance to the new Generation Result step
    } catch (err: any) {
      setGenerationError(err.message || 'An unexpected error occurred during quiz generation.');
      setCurrentStep(steps.length - 1); // Stay on the current step but show error
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    {
      name: 'Document Selection',
      component: (
        <DocumentSelectionStep
          ref={documentSelectionRef} // Pass the ref here
          preselectedDocumentIds={initialDocumentId ? [initialDocumentId] : []} // Pass array
        />
      ),
    },
    {
      name: 'Quiz Options',
      component: (
        <QuizOptionsStep
          onSelectOptions={setQuizOptions}
          initialOptions={quizOptions}
        />
      ),
    },
    {
      name: 'Generate Quiz',
      component: (
        <GenerationProgressStep
          isGenerating={isGenerating}
          status={generationStatus}
          error={generationError}
          generatedContentId={generatedContentId}
          onGenerate={handleGenerateQuiz}
          // Note: selectedDocumentIds might need to be passed down if GenerationProgressStep needs it
        />
      ),
    },
    {
      name: 'Generation Result',
      component: (
        <GenerationProgressStep
          isGenerating={isGenerating}
          status={generationStatus}
          error={generationError}
          generatedContentId={generatedContentId}
          onGenerate={handleGenerateQuiz}
          // Note: selectedDocumentIds might need to be passed down if GenerationProgressStep needs it
        />
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      const currentSelectedIds = documentSelectionRef.current?.getSelectedDocumentIds() || [];
      setSelectedDocumentIds(currentSelectedIds); // Update parent state from ref

      if (currentSelectedIds.length === 0) {
        setShowDocumentSelectionError(true);
        return;
      } else {
        setShowDocumentSelectionError(false);
      }
    }
    if (currentStep === steps.length - 2) { // If it's the 'Generate Quiz' step
      handleGenerateQuiz();
      return;
    }
    if (currentStep < steps.length - 1) { // Only advance if not on the last step
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowDocumentSelectionError(false); // Clear error on back
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 py-8 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Guided Quiz Generation
        </h2>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.name} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white
                  ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                {index + 1}
              </div>
              <p
                className={`text-sm mt-2 ${
                  index <= currentStep ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {step.name}
              </p>
            </div>
          ))}
        </div>

        {/* Current Step Component */}
        <div className="min-h-[200px] flex items-center justify-center border-t border-b py-8 mb-8">
          {steps[currentStep].component}
        </div>

        {/* Navigation Buttons */}
        {showDocumentSelectionError && currentStep === 0 && (
          <p className="text-red-500 text-center mb-4">
            Please select at least one document to proceed.
          </p>
        )}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isGenerating}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isGenerating || (currentStep === 0 && selectedDocumentIds.length === 0) || currentStep === steps.length - 1}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {currentStep === steps.length - 2 ? (isGenerating ? 'Generating...' : 'Generate') : currentStep === steps.length - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizWizard;