'use client';

import { useState, useEffect } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import SummaryWizard from "@/components/summary-wizard/SummaryWizard";
import QuizWizard from "@/components/quiz-wizard/QuizWizard";

interface StudyMaterial {
  id: string;
  original_name: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<StudyMaterial[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryWizardOpen, setIsSummaryWizardOpen] = useState<boolean>(false);
  const [isQuizWizardOpen, setIsQuizWizardOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        redirect('/login');
        return;
      }

      const userId = user.id;

      // Fetch study materials for the dropdown
      const { data: fetchedDocuments, error: docsError } = await supabase
        .from('study_materials')
        .select('id, original_name')
        .eq('user_id', userId);

      if (docsError) {
        setError(docsError.message);
      } else {
        setDocuments(fetchedDocuments || []);
        if (fetchedDocuments && fetchedDocuments.length > 0) {
          setSelectedDocumentId(fetchedDocuments[0].id);
        } else {
          setSelectedDocumentId(null);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);
  
  return (
    <div className="container mx-auto p-6">
      {/* Top buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Link href="/upload">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Upload Document
            </button>
          </Link>

          <Link href="/unorganized">
            <button className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">
              Unorganized Content
            </button>
          </Link>
        </div>
      </div>

      {loading && <p>Loading content...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Document Selection and Wizard Buttons */}
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <label htmlFor="document-select" className="block text-lg font-medium text-gray-700 mb-2">
                  Select a Document:
                </label>
                <select
                  id="document-select"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedDocumentId || ''}
                  onChange={(e) => setSelectedDocumentId(e.target.value)}
                  disabled={documents.length === 0 || isSummaryWizardOpen || isQuizWizardOpen}
                >
                  {documents.length === 0 ? (
                    <option value="">No documents available</option>
                  ) : (
                    documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.original_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button
                onClick={() => setIsSummaryWizardOpen(true)}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={!selectedDocumentId || isSummaryWizardOpen || isQuizWizardOpen}
              >
                Generate Summary
              </button>
              <button
                onClick={() => setIsQuizWizardOpen(true)}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!selectedDocumentId || isSummaryWizardOpen || isQuizWizardOpen}
              >
                Generate Quiz
              </button>
            </div>

            {/* Render Wizards */}
            {isSummaryWizardOpen && (
              <SummaryWizard
                key="summary-wizard" // Add key here
                initialDocumentId={selectedDocumentId || undefined}
                onClose={() => setIsSummaryWizardOpen(false)}
              />
            )}
            {isQuizWizardOpen && (
              <QuizWizard
                key="quiz-wizard" // Add key here
                initialDocumentId={selectedDocumentId || undefined}
                onClose={() => setIsQuizWizardOpen(false)}
              />
            )}

            {!isSummaryWizardOpen && !isQuizWizardOpen && !selectedDocumentId && documents.length > 0 && (
                <p className="text-gray-500 mt-4">Please select a document to generate a summary or quiz.</p>
            )}
            {!isSummaryWizardOpen && !isQuizWizardOpen && selectedDocumentId && (
                <p className="text-gray-500 mt-4">Document selected. Choose a generation option above.</p>
            )}
            {!isSummaryWizardOpen && !isQuizWizardOpen && documents.length === 0 && (
                <p className="text-gray-500 mt-4">No documents available. Please upload some first.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}