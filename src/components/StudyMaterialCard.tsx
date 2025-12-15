'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface GeneratedContent {
  id: string;
  type: 'summary' | 'quiz';
  content: { summary?: string; quiz?: any; message?: string };
  created_at?: string; // Optional, might not be passed from all fetches
}

interface StudyMaterial {
  id: string;
  original_name: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  generated_content: GeneratedContent[];
  created_at: string;
}

interface StudyMaterialCardProps {
  material: StudyMaterial;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  onDeleteGeneratedContent: (materialId: string, contentId: string) => Promise<void>;
  onMoveMaterial: (materialId: string, targetClassId: string | null, targetSectionId: string | null) => Promise<void>; // Add this prop
}

export const StudyMaterialCard: React.FC<StudyMaterialCardProps> = ({
  material,
  onDeleteMaterial,
  onDeleteGeneratedContent,
  onMoveMaterial, // Destructure new prop
}) => {
  const [showMoveModal, setShowMoveModal] = useState(false); // State for modal visibility
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]); // To be fetched
  const [availableSections, setAvailableSections] = useState<any[]>([]); // To be fetched
  const [moveLoading, setMoveLoading] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  // Effect to fetch classes and sections when modal is shown
  useEffect(() => {
    if (showMoveModal) {
      const fetchClassesAndSections = async () => {
        // Fetch classes
        try {
          const classesResponse = await fetch('/api/classes'); // Assuming an API endpoint for all classes
          if (classesResponse.ok) {
            const { classes } = await classesResponse.json(); // Destructure 'classes'
            setAvailableClasses(classes || []);
          } else {
            console.error("Failed to fetch classes");
          }

          // Fetch sections for the first class, or selected class
          // This logic can be refined later. For now, fetch all sections or sections for a default class.
          const sectionsResponse = await fetch('/api/sections'); // Assuming an API endpoint for all sections
          if (sectionsResponse.ok) {
            const { sections } = await sectionsResponse.json(); // Destructure 'sections'
            setAvailableSections(sections || []);
          } else {
            console.error("Failed to fetch sections");
          }

        } catch (error) {
          console.error("Error fetching classes/sections:", error);
        }
      };
      fetchClassesAndSections();
    }
  }, [showMoveModal]);

  const handleMoveConfirm = async () => {
    setMoveLoading(true);
    setMoveError(null);
    try {
      await onMoveMaterial(material.id, selectedClassId, selectedSectionId);
      setShowMoveModal(false);
    } catch (err: any) {
      setMoveError(err.message || 'Failed to move material');
    } finally {
      setMoveLoading(false);
    }
  };


  return (
    <div key={material.id} className="p-4 border rounded-lg bg-white shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">
          From: {material.original_name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMoveModal(true)}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
          >
            Move
          </button>
          <button
            onClick={() => onDeleteMaterial(material.id)}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Delete File
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Uploaded on: {new Date(material.created_at).toLocaleDateString()}
      </p>
      <div className="space-y-3 pl-4 border-l-2">
        {material.generated_content.length > 0 ? (
          material.generated_content.map((content) => (
            <div key={content.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <p className="font-semibold capitalize text-gray-700">{content.type}</p>
                {content.type === 'summary' && content.content.summary && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="text-sm text-gray-600 whitespace-normal break-words">Summary: {content.content.summary}</p>
                    <Link href={`/summary-view/${content.id}`} passHref>
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mt-2 sm:mt-0 ml-0 sm:ml-2">
                        Read Summary
                      </button>
                    </Link>
                  </div>
                )}
                {content.type === 'quiz' && content.content.quiz && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="text-sm text-gray-600">
                      Quiz: {content.content.quiz.length} questions
                      {content.content.message && ` (${content.content.message})`}
                    </p>
                    <Link href={`/quiz-take/${content.id}`} passHref>
                      <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mt-2 sm:mt-0 ml-0 sm:ml-2">
                        Start Quiz
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              <button
                onClick={() => onDeleteGeneratedContent(material.id, content.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex-shrink-0 ml-4"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No generated content for this document.</p>
        )}
      </div>

      {showMoveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-1/3">
            <h3 className="text-xl font-bold mb-4">Move "{material.original_name}"</h3>
            {moveError && <p className="text-red-500 text-sm mb-3">{moveError}</p>}
            <div className="mb-4">
              <label htmlFor="selectClass" className="block text-sm font-medium text-gray-700 mb-1">Move to Class:</label>
              <select
                id="selectClass"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                value={selectedClassId || ''}
                onChange={(e) => {
                  const classId = e.target.value === 'unorganized' ? null : e.target.value;
                  setSelectedClassId(classId);
                  setSelectedSectionId(null); // Reset section when class changes
                }}
              >
                <option value="unorganized">-- Unorganized --</option>
                {availableClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            {selectedClassId && (
              <div className="mb-4">
                <label htmlFor="selectSection" className="block text-sm font-medium text-gray-700 mb-1">Move to Section (Optional):</label>
                <select
                  id="selectSection"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={selectedSectionId || ''}
                  onChange={(e) => setSelectedSectionId(e.target.value === '' ? null : e.target.value)}
                >
                  <option value="">-- No Section --</option>
                  {availableSections
                    .filter(sec => sec.class_id === selectedClassId)
                    .map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowMoveModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                disabled={moveLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleMoveConfirm}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                disabled={moveLoading}
              >
                {moveLoading ? 'Moving...' : 'Move Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};