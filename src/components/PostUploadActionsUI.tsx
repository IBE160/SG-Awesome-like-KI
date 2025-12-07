// src/components/PostUploadActionsUI.tsx
'use client';

import React from 'react';

interface PostUploadActionsUIProps {
  documentId: string;
  onGenerateSummary: () => void;
  onGenerateQuiz: () => void;
}

export const PostUploadActionsUI: React.FC<PostUploadActionsUIProps> = ({
  documentId,
  onGenerateSummary,
  onGenerateQuiz,
}) => {
  return (
    <div className="mt-8 p-6 w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Document Uploaded Successfully!</h2>
      <p className="text-center text-gray-600 mb-2">Document ID: <span className="font-mono text-sm bg-gray-100 p-1 rounded">{documentId}</span></p>
      <p className="text-center text-gray-600 mb-6">What would you like to do next?</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onGenerateSummary}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Generate Summary
        </button>
        <button
          onClick={onGenerateQuiz}
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Generate Quiz
        </button>
      </div>
    </div>
  );
};