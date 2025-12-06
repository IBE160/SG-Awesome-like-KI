// src/components/PostUploadActionsUI.tsx
'use client';

import React from 'react';

interface PostUploadActionsUIProps {
  onGenerateSummary: () => void;
  onGenerateQuiz: () => void;
  documentId: string; // Document ID to pass to generation functions
}

export const PostUploadActionsUI: React.FC<PostUploadActionsUIProps> = ({
  onGenerateSummary,
  onGenerateQuiz,
  documentId,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Document Uploaded Successfully!</h2>
      <p className="text-gray-600 mb-6">What would you like to do next with this document?</p>
      
      <div className="flex space-x-4">
        <button
          onClick={() => onGenerateSummary()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Summary
        </button>
        <button
          onClick={() => onGenerateQuiz()}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Generate Quiz
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-4">Document ID: {documentId}</p>
    </div>
  );
};
