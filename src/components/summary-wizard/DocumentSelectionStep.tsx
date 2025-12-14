'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StudyMaterial {
  id: string;
  original_name: string;
}

interface DocumentSelectionStepProps {
  onDocumentSelect: (documentId: string | null) => void;
  preselectedDocumentId?: string;
}

const DocumentSelectionStep: React.FC<DocumentSelectionStepProps> = ({ onDocumentSelect, preselectedDocumentId }) => {
  const [documents, setDocuments] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localSelectedDocumentId, setLocalSelectedDocumentId] = useState<string | null>(preselectedDocumentId || null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
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
        if (preselectedDocumentId && data?.some(doc => doc.id === preselectedDocumentId)) {
          setLocalSelectedDocumentId(preselectedDocumentId);
          onDocumentSelect(preselectedDocumentId);
        } else if (data && data.length > 0 && !localSelectedDocumentId) {
          // If no preselected and documents exist, select the first one by default
          setLocalSelectedDocumentId(data[0].id);
          onDocumentSelect(data[0].id);
        } else if (!preselectedDocumentId && !localSelectedDocumentId) {
          onDocumentSelect(null); // No document selected
        }
      }
      setLoading(false);
    };

    fetchDocuments();
  }, [preselectedDocumentId, onDocumentSelect]); // Rerun if preselectedDocumentId changes

  const handleLocalDocumentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value || null;
    setLocalSelectedDocumentId(docId);
    onDocumentSelect(docId);
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-xl font-medium text-gray-700 mb-4">Select Document</h3>

      {loading && <p className="text-gray-600">Loading documents...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="mb-8">
          <label htmlFor="document-select" className="block text-lg font-medium text-gray-700 mb-2">
            Choose a Study Material:
          </label>
          <select
            id="document-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={localSelectedDocumentId || ''}
            onChange={handleLocalDocumentSelect}
            disabled={documents.length === 0}
          >
            {documents.length === 0 ? (
              <option value="">No documents available</option>
            ) : (
              <>
                <option value="">-- Select a document --</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.original_name}
                  </option>
                ))}
              </>
            )}
          </select>
          {documents.length === 0 && (
            <p className="text-gray-500 mt-2">No study materials uploaded yet. Please upload one first.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentSelectionStep;