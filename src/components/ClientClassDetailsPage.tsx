"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClassActions } from '@/components/ClassActions';
import { SectionContainer } from '@/components/SectionContainer';

interface ClassSection {
  id: string;
  name: string;
  class_id: string;
}

interface ClientClassDetailsPageProps {
  classId: string;
  initialClassName: string;
  initialStudyMaterials: any[];
  initialSections: ClassSection[];
}

export function ClientClassDetailsPage({ classId, initialClassName, initialStudyMaterials, initialSections }: ClientClassDetailsPageProps) {
  const router = useRouter();
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [sections, setSections] = useState<ClassSection[]>(initialSections);
  const [studyMaterialsState, setStudyMaterialsState] = useState<any[]>(initialStudyMaterials); // New state for study materials
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Effect to update studyMaterialsState when initialStudyMaterials prop changes
  useEffect(() => {
    setStudyMaterialsState(initialStudyMaterials);
  }, [initialStudyMaterials]);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!newSectionName || newSectionName.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(newSectionName)) {
      setError('Section name must be alphanumeric and max 25 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newSectionName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create section');
      }

      setSections([...sections, data.section]);
      setNewSectionName('');
      setShowNewSectionForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during section creation.');
    } finally {
      setLoading(false);
    }
  };

  const getSectionContentCounts = (sectionId: string) => {
    const sectionMaterials = studyMaterialsState.filter(material => material.class_section_id === sectionId);
    const fileCount = sectionMaterials.filter(material => material.type === 'file').length;
    const summaryCount = sectionMaterials.filter(material => material.type === 'summary').length;
    const quizCount = sectionMaterials.filter(material => material.type === 'quiz').length;
    return { fileCount, summaryCount, quizCount };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{initialClassName}</h1>
        <div className="flex items-center gap-2">
          <ClassActions classId={classId} initialClassName={initialClassName} />
          <button
            onClick={() => setShowNewSectionForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            New Section
          </button>
        </div>
      </div>

      {showNewSectionForm && (
        <form onSubmit={handleCreateSection} className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Create New Section</h2>
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Enter section name"
            className="w-full p-2 border border-gray-300 rounded mb-3 text-gray-800"
            maxLength={25}
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
              {loading ? 'Creating...' : 'Create Section'}
            </button>
            <button
              type="button"
              onClick={() => { setShowNewSectionForm(false); setNewSectionName(''); setError(null); }}
              disabled={loading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.length > 0 ? (
          sections.map((section) => {
            const { fileCount, summaryCount, quizCount } = getSectionContentCounts(section.id);
            return (
              <SectionContainer
                key={section.id}
                section={section}
              />
            );
          })
        ) : (
          <p className="text-gray-600 col-span-full">No sections created yet. Click "New Section" to add one!</p>
        )}
      </div>

      {/* Unorganized Content - materials without a section */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Unorganized Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studyMaterialsState.filter(material => !material.class_section_id).map((material) => (
          <div key={material.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{material.original_name}</h3>
            <p className="text-gray-600 capitalize">Type: {material.type}</p>
            {/* Add more material details or actions here */}
          </div>
        ))}
        {studyMaterialsState.filter(material => !material.class_section_id).length === 0 && (
          <p className="text-gray-600 col-span-full">All content is organized into sections.</p>
        )}
      </div>
    </div>
  );
}