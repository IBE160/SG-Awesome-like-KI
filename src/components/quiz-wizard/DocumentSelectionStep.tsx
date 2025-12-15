// src/components/quiz-wizard/DocumentSelectionStep.tsx
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StudyMaterial {
  id: string;
  original_name: string;
}

// Define the interface for the ref handle
export interface DocumentSelectionStepHandle {
  getSelectedDocumentIds: () => string[];
  setSelectedDocumentIdsExternally: (ids: string[]) => void;
}

interface DocumentSelectionStepProps {
  preselectedDocumentIds?: string[];
}

const DocumentSelectionStep = forwardRef<DocumentSelectionStepHandle, DocumentSelectionStepProps>(
  ({ preselectedDocumentIds }, ref) => {
    const [documents, setDocuments] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [localSelectedDocumentIds, setLocalSelectedDocumentIds] = useState<string[]>(preselectedDocumentIds || []);

    useImperativeHandle(ref, () => ({
      getSelectedDocumentIds: () => localSelectedDocumentIds,
      setSelectedDocumentIdsExternally: (ids: string[]) => {
        setLocalSelectedDocumentIds(ids);
      },
    }));

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
        // If preselected documents exist and are valid, use them
        const validPreselected = preselectedDocumentIds?.filter(id => data?.some(doc => doc.id === id)) || [];
        if (validPreselected.length > 0) {
          setLocalSelectedDocumentIds(validPreselected);
          // onDocumentSelect(validPreselected); // Removed from here
        } else {
          // If no valid preselected, or none, ensure initial state reflects no selection
          setLocalSelectedDocumentIds([]);
          // onDocumentSelect([]); // Removed from here
        }
      }
      setLoading(false);
    };

    fetchDocuments();
  }, [preselectedDocumentIds]); // Removed onDocumentSelect from dependency array

  const handleLocalDocumentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setLocalSelectedDocumentIds(selectedOptions);
    // onDocumentSelect(selectedOptions); // Removed from here
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-xl font-medium text-gray-700 mb-4">Select Document(s)</h3>

      {loading && <p className="text-gray-600">Loading documents...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="mb-8">
          <label htmlFor="document-select" className="block text-lg font-medium text-gray-700 mb-2">
            Choose one or more Study Materials:
          </label>
          <select
            id="document-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            multiple // Allow multiple selections
            value={localSelectedDocumentIds}
            onChange={handleLocalDocumentSelect}
            disabled={documents.length === 0}
            size={Math.min(documents.length + 1, 5)} // Adjust size based on number of documents, max 5 visible
          >
            {documents.length === 0 ? (
              <option value="" disabled>No documents available</option>
            ) : (
              documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.original_name}
                </option>
              ))
            )}
          </select>
          {documents.length === 0 && (
            <p className="text-gray-500 mt-2">No study materials uploaded yet. Please upload one first.</p>
          )}
        </div>
      )}
    </div>
  );
}); // Closing parenthesis and semicolon for forwardRef

export default DocumentSelectionStep;