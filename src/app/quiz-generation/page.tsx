'use client';

import React, { useState, useEffect } from 'react';

type QuizLength = 'short' | 'medium' | 'long';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GeneratedQuiz {
  id: string;
  questions: QuizQuestion[];
  message?: string; // For cases where AI generates shorter quiz
}

interface Document {
  id: string;
  original_name: string;
}

export default function QuizGenerationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentId, setDocumentId] = useState<string>(''); // Default to empty, require selection
  const [quizLength, setQuizLength] = useState<QuizLength>('medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<GeneratedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      setDocumentsError(null);
      try {
        const response = await fetch('/api/study-materials');
        if (!response.ok) {
          throw new Error('Failed to fetch documents.');
        }
        const data = await response.json();
        setDocuments(data.studyMaterials);
        if (data.studyMaterials.length > 0) {
          setDocumentId(data.studyMaterials[0].id); // Pre-select the first document
        }
      } catch (err: any) {
        setDocumentsError(err.message);
      } finally {
        setDocumentsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleGenerateQuiz = async () => {
    const clientRequestId = `client-${Date.now()}`; // Simple client-side request ID
    console.log('Quiz generation initiated', { clientRequestId, documentId, quizLength });

    setIsLoading(true);
    setQuizResult(null);
    setError(null);

    try {
      console.log('Calling /api/generate', { clientRequestId, documentId, quizLength });
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          type: 'quiz',
          options: { quizLength },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to generate quiz.';
        console.error('API call to /api/generate failed', { clientRequestId, status: response.status, errorMessage, errorData });
        throw new Error(errorMessage);
      }

      const data: GeneratedQuiz = await response.json();
      console.log('API call to /api/generate successful', { clientRequestId, data });
      setQuizResult(data);
    } catch (err: any) {
      console.error('Error during quiz generation', { clientRequestId, error: err.message });
      setError(err.message);
    } finally {
      setIsLoading(false);
      console.log('Quiz generation process finished', { clientRequestId });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Quiz</h1>

      <div className="mb-4">
        <label htmlFor="documentSelect" className="block text-sm font-medium text-gray-700">
          Select Document
        </label>
        {documentsLoading ? (
          <p className="mt-1 text-gray-500">Loading documents...</p>
        ) : documentsError ? (
          <p className="mt-1 text-red-500">Error loading documents: {documentsError}</p>
        ) : documents.length === 0 ? (
          <p className="mt-1 text-gray-500">No documents available. Please upload one first.</p>
        ) : (
          <select
            id="documentSelect"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            disabled={isLoading || documentsLoading}
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.original_name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="quizLength" className="block text-sm font-medium text-gray-700">
          Quiz Length
        </label>
        <select
          id="quizLength"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={quizLength}
          onChange={(e) => setQuizLength(e.target.value as QuizLength)}
          disabled={isLoading || documentsLoading}
        >
          <option value="short">Short (5 questions)</option>
          <option value="medium">Medium (10 questions)</option>
          <option value="long">Long (15+ questions)</option>
        </select>
      </div>

      <button
        onClick={handleGenerateQuiz}
        disabled={isLoading || !documentId || documentsLoading}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
      </button>

      {isLoading && (
        <div className="mt-4 p-4 bg-blue-100 rounded-md">
          <p className="text-blue-800">Generating quiz, please wait...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 rounded-md">
          <p className="text-red-800 font-bold">Error:</p>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {quizResult && (
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          <h2 className="text-xl font-bold text-green-800 mb-2">Generated Quiz</h2>
          {quizResult.message && (
            <p className="text-orange-800 bg-orange-50 p-2 rounded-md mb-2">{quizResult.message}</p>
          )}
          {quizResult.questions.length > 0 ? (
            <ul className="list-disc pl-5">
              {quizResult.questions.map((q, index) => (
                <li key={index} className="mb-2">
                  <p className="font-semibold">{q.question}</p>
                  <ul className="list-inside list-alpha ml-4">
                    {q.options.map((option, optIndex) => (
                      <li key={optIndex}>{option}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600">Correct: {q.correctAnswer}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-800">No questions generated for this quiz.</p>
          )}
        </div>
      )}
    </div>
  );
}
