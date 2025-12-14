'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface GenerationProgressStepProps {
  isGenerating: boolean;
  status: string | null;
  error: string | null;
  generatedContentId: string | null;
  onGenerate: () => void;
  selectedDocumentId: string | null; // Added to trigger generation based on document selection
}

const GenerationProgressStep: React.FC<GenerationProgressStepProps> = ({
  isGenerating,
  status,
  error,
  generatedContentId,
  onGenerate,
  selectedDocumentId,
}) => {
  const router = useRouter();

  useEffect(() => {
    // Trigger generation when this step becomes active and a document is selected
    if (selectedDocumentId && !isGenerating && !generatedContentId && !error) {
      onGenerate();
    }
  }, [selectedDocumentId, isGenerating, generatedContentId, error, onGenerate]);

  const handleViewSummary = () => {
    if (generatedContentId) {
      router.push(`/summary-view/${generatedContentId}`); // Navigate to the summary view page
    }
  };

  return (
    <div className="p-4 text-center">
      {isGenerating && (
        <>
          <h3 className="text-xl font-medium text-blue-600 mb-4">Generating Summary...</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600">{status || 'Please wait...'}</p>
        </>
      )}

      {!isGenerating && error && (
        <>
          <h3 className="text-xl font-medium text-red-600 mb-4">Generation Failed!</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-600">Please go back and try again.</p>
        </>
      )}

      {!isGenerating && !error && generatedContentId && (
        <>
          <h3 className="text-xl font-medium text-green-600 mb-4">Summary Generated Successfully!</h3>
          <p className="text-gray-700 mb-4">{status}</p>
          <button
            onClick={handleViewSummary}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            View Summary
          </button>
        </>
      )}

      {!isGenerating && !error && !generatedContentId && !selectedDocumentId && (
        <>
          <h3 className="text-xl font-medium text-gray-700 mb-4">Ready to Generate</h3>
          <p className="text-gray-600">
            Click &quot;Generate&quot; to create your summary.
          </p>
        </>
      )}
       {!isGenerating && !error && !generatedContentId && selectedDocumentId && (
        <>
          <h3 className="text-xl font-medium text-gray-700 mb-4">Ready to Generate</h3>
          <p className="text-gray-600">
            Click &quot;Generate&quot; to create your summary.
          </p>
        </>
      )}
    </div>
  );
};

export default GenerationProgressStep;