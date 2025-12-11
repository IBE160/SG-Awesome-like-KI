'use client';

import { useState } from 'react';

interface SummaryGeneratorProps {
  documentId: string;
}

export default function SummaryGenerator({ documentId }: SummaryGeneratorProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, type: 'summary' }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate summary';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Assuming the summary is in `data.content.summary`
      setSummary(data.content.summary);

    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto mt-8">
      <div className="flex justify-between items-start mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">AI Summary Generator</h2>
            <p className="mt-1 text-sm text-gray-500">Selected Document: {documentId}</p>
        </div>
        <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Generating summary, please wait">
            <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
                <p className="text-lg font-semibold text-gray-700">Generating your summary, please wait<span className="animate-pulse">...</span></p>
                <style jsx>{`
                    .loader {
                        border-top-color: #4f46e5;
                        animation: spinner 1.2s linear infinite;
                    }
                    @keyframes spinner {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <p className="font-bold">An error occurred</p>
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="mt-6 pt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Summary</h3>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
