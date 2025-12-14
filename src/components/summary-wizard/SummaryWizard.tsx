'use client';

import React, { useState } from 'react';
import DocumentSelectionStep from './DocumentSelectionStep';
import SummaryOptionsStep from './SummaryOptionsStep';
import GenerationProgressStep from './GenerationProgressStep';

type SummaryFormat = 'paragraph' | 'bullet_points'; // Define SummaryFormat here

interface SummaryWizardProps {
  initialDocumentId?: string; // Optional prop for pre-selecting a document
}

const SummaryWizard: React.FC<SummaryWizardProps> = ({ initialDocumentId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(initialDocumentId || null);
  const [summaryOptions, setSummaryOptions] = useState<{ format: SummaryFormat }>({ format: 'paragraph' });
  
  // States for summary generation
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generatedContentId, setGeneratedContentId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (!selectedDocumentId) {
      setGenerationError('No document selected for summary generation.');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Starting summary generation...');
    setGeneratedContentId(null);
    setGenerationError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyMaterialId: selectedDocumentId,
          type: 'summary', // Always 'summary' for this wizard
          options: { format: summaryOptions.format },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate summary.');
      }

      setGeneratedContentId(data.content.id); // Assuming the API returns the generated content ID
      setGenerationStatus('Summary generated successfully!');
      // TODO: Potentially navigate to the summary view page here
    } catch (err: any) {
      setGenerationError(err.message || 'An unexpected error occurred during summary generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    {
      name: 'Document Selection',
      component: (
        <DocumentSelectionStep
          onDocumentSelect={setSelectedDocumentId}
          preselectedDocumentId={initialDocumentId}
        />
      ),
    },
    {
      name: 'Summary Options',
      component: (
        <SummaryOptionsStep
          onSelectOptions={setSummaryOptions}
          initialFormat={summaryOptions.format}
        />
      ),
    },
    {
      name: 'Generate Summary',
      component: (
        <GenerationProgressStep
          isGenerating={isGenerating}
          status={generationStatus}
          error={generationError}
          generatedContentId={generatedContentId}
          onGenerate={handleGenerateSummary}
          selectedDocumentId={selectedDocumentId} // Pass selectedDocumentId
        />
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 0 && !selectedDocumentId) {
      alert('Please select a document to proceed.');
      return;
    }
    if (currentStep === steps.length - 1) { // If it's the last step, trigger generation
      handleGenerateSummary();
      return; // Prevent advancing the step further
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Guided Summary Generation
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
            disabled={isGenerating || (currentStep === 0 && !selectedDocumentId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {currentStep === steps.length - 1 ? (isGenerating ? 'Generating...' : 'Generate') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryWizard;
