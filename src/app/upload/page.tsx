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

  const handleGeneration = async (type: 'summary' | 'quiz') => {
    if (!uploadedDocumentId) return;

    setIsGenerating(true);
    setGenerationStatus(`Generating ${type}...`);
    try {
      const response = await fetch(`/api/generate/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyMaterialId: uploadedDocumentId }),
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
    setSelectedFile(null);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setGenerationStatus(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedClassId) formData.append('class_id', selectedClassId);
    if (selectedSectionId) formData.append('class_section_id', selectedSectionId);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred during upload.');
      }
      
      setUploadSuccess('File uploaded successfully!');
      setUploadedDocumentId(data.studyMaterialId); // Correctly read studyMaterialId
      setSelectedFile(null);
      setValidationError(null);
      setRetryCount(0);
      setSelectedClassId(null);
      setSelectedSectionId(null);

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

  const resetState = () => {
      setSelectedFile(null);
      setValidationError(null);
      setUploadError(null);
      setUploadSuccess(null);
      setUploadedDocumentId(null);
      setRetryCount(0);
      setGenerationStatus(null);
  }

  // If upload is complete, show the post-upload actions.
  if (uploadedDocumentId) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <PostUploadActionsUI
              documentId={uploadedDocumentId}
              onGenerateSummary={() => handleGeneration('summary')}
              onGenerateQuiz={() => handleGeneration('quiz')}
            />
            {generationStatus && (
                <div className={`mt-4 text-center p-2 rounded ${generationStatus.startsWith('Error:') ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
                    {generationStatus}
                </div>
            )}
            {isGenerating && <p className="mt-4">Please wait...</p>}
            <button onClick={resetState} className="mt-8 text-blue-600 hover:underline">Upload Another File</button>
        </div>
    );
  }

  // Default upload view
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Your Study Material</h1>

        {validationError && <div className="text-red-500 mb-4">{validationError}</div>}
        {uploadError && <div className="text-red-500 mb-4">{uploadError}</div>}
        {uploadSuccess && <div className="text-green-500 mb-4">{uploadSuccess}</div>}

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