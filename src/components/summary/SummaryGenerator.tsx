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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
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
    <div className="p-4 border rounded-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">AI Summary Generator</h2>
      <p className="mb-4 text-sm text-gray-600">Document ID: {documentId}</p>
      
      <button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Generating...' : 'Generate Summary'}
      </button>

      {isLoading && (
        <div className="mt-4 p-4 text-center">
          <p>Loading summary...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
            <h3 className="font-semibold text-lg mb-2">Generated Summary:</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
}
