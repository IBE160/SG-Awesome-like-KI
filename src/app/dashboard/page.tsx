
'use client';

import { useState, useEffect } from 'react';
import SummaryGenerator from "@/components/summary/SummaryGenerator";
import { createClient } from '@/lib/supabase/client';

interface StudyMaterial {
  id: string;
  original_name: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<StudyMaterial[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Handle unauthenticated state, maybe redirect to login or show a message
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const { data, error: dbError } = await supabase
        .from('study_materials')
        .select('id, original_name')
        .eq('user_id', userId);

      if (dbError) {
        setError(dbError.message);
      } else {
        setDocuments(data || []);
        if (data && data.length > 0) {
          setSelectedDocumentId(data[0].id); // Select the first document by default
        }
      }
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl font-bold mb-10">Dashboard</h1>
      
      {loading && <p>Loading documents...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <label htmlFor="document-select" className="block text-lg font-medium text-gray-700 mb-2">
              Select a Document:
            </label>
            <select
              id="document-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDocumentId || ''}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              disabled={documents.length === 0}
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

          {selectedDocumentId ? (
            <SummaryGenerator documentId={selectedDocumentId} />
          ) : (
            <p className="text-gray-500">Please select a document to generate a summary.</p>
          )}
        </div>
      )}
    </main>
  );
}
