'use client';

import React, { useState, useEffect } from 'react';
import { DragAndDropUploadArea } from '@/components/DragAndDropUploadArea';
import { PostUploadActionsUI } from '@/components/PostUploadActionsUI';

const MAX_RETRIES = 3;

export default function UploadPage() {
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
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

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
      const response = await fetch(`/api/generate/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyMaterialId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to generate ${type}`);
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

    setValidationError(null); // Clear any previous validation errors
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadedDocumentId(null); // Clear previous upload success state

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedClassId) formData.append('class_id', selectedClassId);
    if (selectedSectionId) formData.append('class_section_id', selectedSectionId);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.error || 'An unexpected error occurred during upload.');
        console.error('Server Upload Error:', data.error);
        if (response.status === 413) {
            setValidationError('File size exceeds 10MB limit.');
        } else if (data.error?.includes('file type is not supported')) {
            setValidationError(data.error);
        } else if (data.error?.includes('password-protected') || data.error?.includes('corrupted')) {
            setValidationError(data.error);
        }
      } else {
        setUploadSuccess('File uploaded and processed successfully!');
        setUploadedDocumentId(data.documentId); // Assuming the API returns documentId on success
        setSelectedFile(null); // Clear selected file from the upload form
        setValidationError(null);
        setRetryCount(0);
        setSelectedClassId(null); // Reset class/section selection
        setSelectedSectionId(null);
        console.log('Upload Success:', data, 'Document ID:', data.documentId);
      }
    } catch (error) {
      console.error('Upload/Network Error:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setUploadError(`Network error. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => handleUploadDocument(), 2000);
      } else {
        setUploadError('Max retries reached. Please try again manually.');
      }
    } finally {
      setIsUploading(false);
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