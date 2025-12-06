// src/components/UnorganizedContentList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Assuming this client is for frontend operations
import { useRouter } from 'next/navigation';

interface GeneratedContent {
  id: string;
  type: 'summary' | 'quiz';
  content: any; // Can be summary text or quiz questions
  study_material_id: string;
  study_materials: {
    original_name: string;
  };
}

interface Class {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
}

export const UnorganizedContentList: React.FC = () => {
  const supabase = createClient();
  const router = useRouter();
  const [unorganizedContent, setUnorganizedContent] = useState<GeneratedContent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningContentId, setAssigningContentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Fetch unorganized content
  useEffect(() => {
    const fetchUnorganizedContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/unorganized-content');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch unorganized content');
        }
        const data = await response.json();
        setUnorganizedContent(data.unorganizedContent);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnorganizedContent();
  }, []);

  // Fetch classes for assignment options
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

  // Fetch sections when selectedClassId changes for assignment
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
            setSections([]);
          }
        } catch (error) {
          console.error('Error fetching sections:', error);
          setSections([]);
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [selectedClassId]);

  const handleAssignClick = (contentId: string) => {
    setAssigningContentId(contentId);
    setSelectedClassId(null);
    setSelectedSectionId(null);
  };

  const handleConfirmAssignment = async () => {
    if (!assigningContentId || !selectedClassId) {
      setError('Please select a class for assignment.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/unorganized-content/${assigningContentId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClassId,
          class_section_id: selectedSectionId || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to assign content');
      }

      // Remove assigned content from the list
      setUnorganizedContent(prev => prev.filter(item => item.id !== assigningContentId));
      setAssigningContentId(null);
      alert('Content assigned successfully!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && unorganizedContent.length === 0) {
    return <div className="p-4 text-center">Loading unorganized content...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (unorganizedContent.length === 0) {
    return <div className="p-4 text-center text-gray-600">No unorganized content found.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Unorganized Generated Content</h2>
      <div className="space-y-4">
        {unorganizedContent.map((content) => (
          <div key={content.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-2 capitalize">{content.type}</h3>
            <p className="text-gray-700 mb-2">
              From: <span className="font-medium">{content.study_materials.original_name}</span>
            </p>
            {content.type === 'summary' && (
              <p className="text-gray-600 line-clamp-3">{content.content.text}</p>
            )}
            {content.type === 'quiz' && (
              <p className="text-gray-600">Quiz with {content.content.questions?.length || 0} questions.</p>
            )}

            {assigningContentId === content.id ? (
              <div className="mt-4 p-4 border border-blue-300 rounded-md bg-blue-50">
                <p className="font-semibold mb-2">Assign to:</p>
                <select
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  value={selectedClassId || ''}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value || null);
                    setSelectedSectionId(null);
                  }}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>

                {selectedClassId && (
                  <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3"
                    value={selectedSectionId || ''}
                    onChange={(e) => setSelectedSectionId(e.target.value || null)}
                    disabled={sections.length === 0}
                  >
                    <option value="">Select Section (Optional)</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setAssigningContentId(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAssignment}
                    disabled={!selectedClassId || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Assigning...' : 'Confirm Assign'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleAssignClick(content.id)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Assign
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
