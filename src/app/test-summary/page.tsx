
'use client';

import { useState } from 'react';

export default function SummaryPage() {
  const [documentPath, setDocumentPath] = useState('valid-document.txt');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'summary',
          documentId: documentPath, // Changed from documentPath to documentId
        }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (Array.isArray(data) && data.length > 0 && data[0].content && data[0].content.summary) {
        setSummary(data[0].content.summary);
      } else {
        throw new Error("Invalid response structure from API for summary. Expected data[0].content.summary.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Generate Document Summary</h1>
        
        <div className="space-y-2">
            <label htmlFor="document-path" className="block text-sm font-medium text-gray-700">Document Path</label>
            <input
                id="document-path"
                type="text"
                value={documentPath}
                onChange={(e) => setDocumentPath(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., valid-document.txt"
            />
            <p className="text-xs text-gray-500">Enter 'valid-document.txt' for a successful summary, or 'short-document.txt' for an error case.</p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isLoading || !documentPath}
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>

        {error && (
          <div className="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {summary && (
          <div className="p-4 mt-4 text-sm text-green-700 bg-green-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Generated Summary:</h2>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
