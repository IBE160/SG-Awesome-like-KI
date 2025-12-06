'use client';

import React, { useState, useEffect } from 'react';
import { DragAndDropUploadArea } from '@/components/DragAndDropUploadArea';
import { useRouter } from 'next/navigation';
import { PostUploadActionsUI } from '@/components/PostUploadActionsUI'; // Import the new component

const MAX_RETRIES = 3;

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null); // New state for uploaded document ID
  const [retryCount, setRetryCount] = useState<number>(0);

  // States for class and section assignment
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes);
        } else {
          console.error('Failed to fetch classes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  // Fetch sections when selectedClassId changes
  useEffect(() => {
    if (selectedClassId) {
      const fetchSections = async () => {
        try {
          const response = await fetch(`/api/classes/${selectedClassId}/sections`);
          if (response.ok) {
            const data = await response.json();
            setSections(data.sections);
          } else {
            console.error('Failed to fetch sections:', response.statusText);
            setSections([]); // Clear sections on error
          }
        } catch (error) {
          console.error('Error fetching sections:', error);
          setSections([]); // Clear sections on error
        }
      };
      fetchSections();
    } else {
      setSections([]); // Clear sections if no class is selected
    }
  }, [selectedClassId]);

  // Handle generation actions
  const handleGenerateSummary = () => {
    if (uploadedDocumentId) {
      console.log(`Generating summary for document: ${uploadedDocumentId}`);
      // TODO: Implement actual summary generation logic (Epic 4)
    }
  };

  const handleGenerateQuiz = () => {
    if (uploadedDocumentId) {
      console.log(`Generating quiz for document: ${uploadedDocumentId}`);
      // TODO: Implement actual quiz generation logic (Epic 4)
    }
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setValidationError(null);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadedDocumentId(null); // Reset when a new file is selected
    setRetryCount(0);
    console.log('Selected file:', file.name);
  };

  const handleValidationError = (message: string) => {
    setSelectedFile(null);
    setValidationError(message);
    setUploadError(null);
    setUploadSuccess(null);
    setRetryCount(0);
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
    if (selectedClassId) {
      formData.append('class_id', selectedClassId);
    }
    if (selectedSectionId) {
      formData.append('class_section_id', selectedSectionId);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

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
        setUploadedDocumentId(data.uploadedFile.id); // Store the uploaded document ID
        setSelectedFile(null);
        setValidationError(null);
        setRetryCount(0);
        setSelectedClassId(null); // Reset class/section selection
        setSelectedSectionId(null);
        console.log('Upload Success:', data);
      }
    } catch (error) {
      console.error('Network Error:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setUploadError(`Network error or server unreachable. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => handleUploadDocument(), 2000);
      } else {
        setUploadError('Network error. Max retries reached. Please try again later.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryUpload = () => {
    setUploadError(null);
    handleUploadDocument();
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

        {/* Class Assignment */}
        <div className="mt-4 mb-4">
          <label htmlFor="class-select" className="block text-gray-700 text-sm font-bold mb-2">Assign to Class (Optional):</label>
          <select
            id="class-select"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedClassId || ''}
            onChange={(e) => {
              setSelectedClassId(e.target.value || null);
              setSelectedSectionId(null); // Reset section when class changes
            }}
          >
            <option value="">No Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {selectedClassId && (
          <div className="mb-4">
            <label htmlFor="section-select" className="block text-gray-700 text-sm font-bold mb-2">Assign to Section (Optional):</label>
            <select
              id="section-select"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedSectionId || ''}
              onChange={(e) => setSelectedSectionId(e.target.value || null)}
              disabled={sections.length === 0}
            >
              <option value="">No Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
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

      {uploadedDocumentId ? (
        <PostUploadActionsUI
          documentId={uploadedDocumentId}
          onGenerateSummary={handleGenerateSummary}
          onGenerateQuiz={handleGenerateQuiz}
        />
      ) : (
        <>
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

          {/* Class Assignment */}
          <div className="mt-4 mb-4">
            <label htmlFor="class-select" className="block text-gray-700 text-sm font-bold mb-2">Assign to Class (Optional):</label>
            <select
              id="class-select"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedClassId || ''}
              onChange={(e) => {
                setSelectedClassId(e.target.value || null);
                setSelectedSectionId(null); // Reset section when class changes
              }}
            >
              <option value="">No Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {selectedClassId && (
            <div className="mb-4">
              <label htmlFor="section-select" className="block text-gray-700 text-sm font-bold mb-2">Assign to Section (Optional):</label>
              <select
                id="section-select"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedSectionId || ''}
                onChange={(e) => setSelectedSectionId(e.target.value || null)}
                disabled={sections.length === 0}
              >
                <option value="">No Section</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            disabled={!selectedFile || isUploading}
            onClick={handleUploadDocument}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </>
      )}
    </div>
  );
}