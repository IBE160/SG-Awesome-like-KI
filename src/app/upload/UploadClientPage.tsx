'use client';

import React, { useState, useEffect } from 'react';
import { DragAndDropUploadArea } from '@/components/DragAndDropUploadArea';
import { PostUploadActionsUI } from '@/components/PostUploadActionsUI';
import { User } from '@supabase/supabase-js';

const MAX_RETRIES = 3;

interface ClassItem {
  id: string;
  name: string;
}

interface UploadClientPageProps {
  initialClasses: ClassItem[];
  user: User; // Passed for potential future use, though not directly used in this client component for auth
}

export default function UploadClientPage({ initialClasses, user }: UploadClientPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // New state for generation
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);

  // States for class and section assignment
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClassId) {
      const fetchSections = async () => {
        try {
          const response = await fetch(`/api/classes/${selectedClassId}/sections`);
          if (response.ok) {
            const data = await response.json();
            setSections(data.sections);
          } else {
            setSections([]);
          }
        } catch (error) {
          setSections([]);
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [selectedClassId]);

  const handleGeneration = async (type: 'summary' | 'quiz', studyMaterialId: string) => {
    setIsGenerating(true);
    setGenerationStatus(`Generating ${type}...`);
    try {
      const response = await fetch(`/api/generate`, { // Corrected: Use the static, real endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Corrected: Send 'type' in the body along with the ID
        body: JSON.stringify({ studyMaterialIds: [studyMaterialId], type, options: { quizLength: 'short' } }), // Corrected to send as an array
      });
      const data = await response.json();
      if (!response.ok) {
        // The real API might return errors in a different format, e.g., data.message
        throw new Error(data.error || data.message || `Failed to generate ${type}`);
      }
      setGenerationStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully! You can find it in the "Unorganized" section.`);
    } catch (error) {
      const err = error as Error;
      setGenerationStatus(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setValidationError(null);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadedDocumentId(null);
    setRetryCount(0);
  };

  const handleValidationError = (message: string) => {
    setValidationError(message);
    setSelectedFile(null); // Clear selected file if validation fails
  };


  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setValidationError('Please select a file to upload.');
      return;
    }

    // Reset UI states for a new upload attempt
    setValidationError(null);
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadedDocumentId(null);
    // Let's not reset retry count on manual trigger, only on success.
    // setRetryCount(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedClassId) formData.append('class_id', selectedClassId);
    if (selectedSectionId) formData.append('class_section_id', selectedSectionId);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });

      // Handle server-side errors (e.g., validation, file size)
      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred during upload.';
        
        if (response.status === 413) {
          errorMessage = 'Upload failed: File is too large (max 10MB).';
          setValidationError(errorMessage); // Show specific error in validation section
        } else {
            try {
              const data = await response.json();
              let serverError = data.error || data.message;
              if (serverError) {
                // Append the specific Supabase error if it exists, for better debugging
                if (data.supabaseError) {
                  serverError += ` (Supabase: ${data.supabaseError})`;
                }
                errorMessage = serverError;
                
                // For specific, actionable errors, use the validation slot based on the original message
                const originalError = data.error || data.message || '';
                if (originalError.includes('file type is not supported') || originalError.includes('password-protected') || originalError.includes('corrupted')) {
                    setValidationError(originalError);
                }
              }
            } catch (jsonError) {
              // Fallback if the error response is not JSON
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
              console.error('Failed to parse server error response as JSON:', jsonError);
            }
        }
        setUploadError(errorMessage); // Set the general upload error message
        setIsUploading(false); // Stop loading indicator
        return; // End the function here
      }

      // Handle successful upload
      const data = await response.json();
      setUploadSuccess('File uploaded and processed successfully!');
      setUploadedDocumentId(data.studyMaterialId);
      setSelectedFile(null);
      setValidationError(null);
      setRetryCount(0); // Reset retries on success
      setSelectedClassId(null);
      setSelectedSectionId(null);
      console.log('Upload Success:', data, 'Document ID:', data.studyMaterialId);
      // No need to set isUploading to false, the component will be replaced by PostUploadActionsUI

    } catch (error) { // This block now only catches network/fetch errors
      console.error('Upload/Network Error:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setUploadError(`Network error. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => handleUploadDocument(), 2000); // Retry the upload
        // Do not set isUploading to false here, as a retry is in progress
      } else {
        setUploadError('Max retries reached. A network error occurred. Please try again manually.');
        setIsUploading(false); // Stop loading on final failure
      }
    }
  };



  const handleRetryUpload = () => {
    setUploadError(null);
    handleUploadDocument();
  };

  const handleViewDocument = (docId: string) => {
    console.log(`Placeholder: View document: ${docId}`);
    // Future enhancement: Implement actual navigation to the document view page.
    // For example: router.push(`/documents/${docId}`);
  };

  if (uploadedDocumentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        {isGenerating && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{generationStatus}</span>
          </div>
        )}
        {!isGenerating && generationStatus && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{generationStatus}</span>
          </div>
        )}
        <PostUploadActionsUI
          documentId={uploadedDocumentId}
          onGenerateSummary={(docId) => handleGeneration('summary', docId)}
          onGenerateQuiz={(docId) => handleGeneration('quiz', docId)}
          onViewDocument={handleViewDocument}
        />
      </div>
    );
  }

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
            {retryCount < MAX_RETRIES && ( // Only show retry button if max retries not reached
                <button
                    onClick={handleRetryUpload}
                    className="ml-4 px-3 py-1 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Retry Now
                </button>
            )}
          </div>
        )}

        {uploadSuccess && !uploadedDocumentId && ( // Only show generic success if not transitioning to PostUploadActionsUI
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
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">Assign to Class (Optional)</label>
          <select id="class-select" value={selectedClassId || ''} onChange={(e) => { setSelectedClassId(e.target.value || null); setSelectedSectionId(null); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="">No Class</option>
            {classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}
          </select>
        </div>

        {selectedClassId && (
          <div className="mt-4">
            <label htmlFor="section-select" className="block text-sm font-medium text-gray-700">Assign to Section (Optional)</label>
            <select id="section-select" value={selectedSectionId || ''} onChange={(e) => setSelectedSectionId(e.target.value || null)} disabled={sections.length === 0} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="">No Section</option>
              {sections.map((sec) => (<option key={sec.id} value={sec.id}>{sec.name}</option>))}
            </select>
          </div>
        )}

        <button onClick={handleUploadDocument} disabled={!selectedFile || isUploading} className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
}
