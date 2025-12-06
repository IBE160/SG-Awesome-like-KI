// src/components/ContentAssignmentUI.tsx
'use client';

import React, { useState, useEffect } from 'react';

type StudyMaterial = {
  id: string;
  original_name: string;
  class_id: string | null;
  class_section_id: string | null;
};

type Class = {
  id: string;
  name: string;
};

type Section = {
  id: string;
  name: string;
  class_id: string;
};

export const ContentAssignmentUI: React.FC = () => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [selectedStudyMaterialId, setSelectedStudyMaterialId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch study materials (assuming an API to get all user's study materials)
        // For now, let's assume /api/study-materials provides all user's materials
        const smResponse = await fetch('/api/study-materials');
        if (smResponse.ok) {
          const smData = await smResponse.json();
          setStudyMaterials(smData.studyMaterials || []);
        } else {
          throw new Error(`Failed to fetch study materials: ${smResponse.statusText}`);
        }

        // Fetch classes
        const classResponse = await fetch('/api/classes');
        if (classResponse.ok) {
          const classData = await classResponse.json();
          setClasses(classData.classes || []);
        } else {
          throw new Error(`Failed to fetch classes: ${classResponse.statusText}`);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch sections when selectedClassId changes
  useEffect(() => {
    if (selectedClassId) {
      const fetchSections = async () => {
        try {
          const response = await fetch(`/api/classes/${selectedClassId}/sections`);
          if (response.ok) {
            const data = await response.json();
            setSections(data.sections || []);
          } else {
            console.error('Failed to fetch sections:', response.statusText);
            setSections([]);
          }
        } catch (err: any) {
          console.error('Error fetching sections:', err);
          setSections([]);
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [selectedClassId]);

  // Update selected class/section when selected study material changes
  useEffect(() => {
    if (selectedStudyMaterialId && studyMaterials.length > 0) {
      const material = studyMaterials.find(sm => sm.id === selectedStudyMaterialId);
      if (material) {
        setSelectedClassId(material.class_id);
        setSelectedSectionId(material.class_section_id);
      }
    } else {
      setSelectedClassId(null);
      setSelectedSectionId(null);
    }
  }, [selectedStudyMaterialId, studyMaterials]);


  const handleAssignContent = async () => {
    if (!selectedStudyMaterialId) {
      setError('Please select a document to assign.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/study-materials/${selectedStudyMaterialId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: selectedClassId,
          class_section_id: selectedSectionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign content.');
      }

      setSuccess('Content assigned successfully!');
      // Update the studyMaterials state to reflect the change
      setStudyMaterials(prev => prev.map(sm =>
        sm.id === selectedStudyMaterialId
          ? { ...sm, class_id: selectedClassId, class_section_id: selectedSectionId }
          : sm
      ));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during assignment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !error) {
    return <div className="text-center text-gray-600">Loading assignment options...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Assign/Reassign Content</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="study-material-select" className="block text-gray-700 text-sm font-bold mb-2">Select Document:</label>
        <select
          id="study-material-select"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedStudyMaterialId || ''}
          onChange={(e) => setSelectedStudyMaterialId(e.target.value || null)}
          disabled={studyMaterials.length === 0}
        >
          <option value="">Select a document</option>
          {studyMaterials.map((sm) => (
            <option key={sm.id} value={sm.id}>{sm.original_name}</option>
          ))}
        </select>
        {studyMaterials.length === 0 && !isLoading && !error && (
            <p className="text-sm text-gray-500 mt-2">No documents uploaded yet. Please upload some first.</p>
        )}
      </div>

      {selectedStudyMaterialId && (
        <>
          <div className="mb-4">
            <label htmlFor="class-select" className="block text-gray-700 text-sm font-bold mb-2">Assign to Class (Optional):</label>
            <select
              id="class-select"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedClassId || ''}
              onChange={(e) => {
                setSelectedClassId(e.target.value || null);
                setSelectedSectionId(null);
              }}
            >
              <option value="">No Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            {classes.length === 0 && !isLoading && !error && (
                <p className="text-sm text-gray-500 mt-2">No classes created yet. Please create some first.</p>
            )}
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
              {sections.length === 0 && selectedClassId && !isLoading && !error && (
                <p className="text-sm text-gray-500 mt-2">No sections in this class yet. Please create some first.</p>
              )}
            </div>
          )}

          <button
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            onClick={handleAssignContent}
            disabled={isLoading || !selectedStudyMaterialId}
          >
            {isLoading ? 'Assigning...' : 'Assign Content'}
          </button>
        </>
      )}
    </div>
  );
};
