// src/app/upload/page.tsx
'use client';

import React, { useState } from 'react';
import { DragAndDropUploadArea } from '@/components/DragAndDropUploadArea';
import { useRouter } from 'next/navigation'; // Import useRouter

const MAX_RETRIES = 3; // Define maximum number of retries

export default function UploadPage() {
  const router = useRouter(); // Initialize useRouter
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0); // New state for retry count

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setValidationError(null); // Clear any previous client-side errors
    setUploadError(null); // Clear any previous server-side errors
    setUploadSuccess(null); // Clear any previous success messages
    setRetryCount(0); // Reset retry count on new file selection
    console.log('Selected file:', file.name);
  };

  const handleValidationError = (message: string) => {
    setSelectedFile(null); // Clear any previously selected file on validation error
    setValidationError(message);
    setUploadError(null);
    setUploadSuccess(null);
    setRetryCount(0); // Reset retry count on validation error
    console.error('Client-side Validation Error:', message);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.error || 'An unexpected error occurred during upload.');
        console.error('Server Upload Error:', data.error);
        // Additional handling for specific server errors if needed
        if (response.status === 413) {
            setValidationError('File size exceeds 10MB limit.');
        } else if (data.error?.includes('file type is not supported')) {
            setValidationError(data.error);
        } else if (data.error?.includes('password-protected') || data.error?.includes('corrupted')) {
            setValidationError(data.error);
        }
        // Increment retry count only for network-related errors (catch block handles actual network errors)
        // For server-side validation/processing errors, we don't retry automatically
      } else {
        setUploadSuccess('File uploaded and processed successfully!');
        setSelectedFile(null); // Clear selected file after successful upload
        setValidationError(null);
        setRetryCount(0); // Reset retry count on successful upload
        // Optionally redirect or show further options to the user
        // router.push('/dashboard');
        console.log('Upload Success:', data);
      }
    } catch (error) {
      console.error('Network Error:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setUploadError(`Network error or server unreachable. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        // Implement a small delay before retrying
        setTimeout(() => handleUploadDocument(), 2000); // Retry after 2 seconds
      } else {
        setUploadError('Network error. Max retries reached. Please try again later.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryUpload = () => {
    setUploadError(null); // Clear previous error message
    handleUploadDocument(); // Re-attempt upload
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

        {uploadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{uploadError}</span>
            {retryCount === MAX_RETRIES && (
                <button
                    onClick={handleRetryUpload}
                    className="ml-4 px-3 py-1 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Retry Now
                </button>
            )}
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{uploadSuccess}</span>
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
          </div>
        )}

        <button
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          disabled={!selectedFile || isUploading}
          onClick={handleUploadDocument}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
}