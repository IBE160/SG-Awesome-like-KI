// src/app/upload/page.tsx
'use client';

import React, { useState } from 'react';
import { DragAndDropUploadArea } from '@/components/DragAndDropUploadArea';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setValidationError(null); // Clear any previous errors
    console.log('Selected file:', file.name);
    // Here you would typically proceed with the actual file upload to the server
    // For now, we just log it.
  };

  const handleValidationError = (message: string) => {
    setSelectedFile(null); // Clear any previously selected file on validation error
    setValidationError(message);
    console.error('Validation Error:', message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Your Study Material</h1>

        {validationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{validationError}</span>
          </div>
        )}

        <DragAndDropUploadArea
          onFileUpload={handleFileUpload}
          onValidationError={handleValidationError}
        />

        {selectedFile && (
          <div className="mt-4 p-4 border rounded-lg bg-blue-50 text-blue-800">
            <p className="font-semibold">File ready for upload:</p>
            <p>Name: {selectedFile.name}</p>
            <p>Type: {selectedFile.type}</p>
            <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            {/* You might add an "Upload" button here to trigger the actual server upload */}
          </div>
        )}

        {/* Placeholder for actual upload button */}
        <button
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          disabled={!selectedFile}
          onClick={() => {
            if (selectedFile) {
              console.log('Initiating server upload for:', selectedFile.name);
              // Implement actual server upload logic here
            }
          }}
        >
          Upload Document
        </button>
      </div>
    </div>
  );
}