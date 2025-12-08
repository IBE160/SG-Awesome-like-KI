'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

// Define the ClassSection type
interface ClassSection {
  id: string;
  name: string;
  class_id: string;
}

interface ClassSectionManagementUIProps {
  classId: string;
  initialSections: ClassSection[]; // Add initialSections prop
}

export const ClassSectionManagementUI: React.FC<ClassSectionManagementUIProps> = ({ classId, initialSections }) => {
  const router = useRouter(); // Initialize useRouter
  const [sections, setSections] = useState<ClassSection[]>(initialSections); // Initialize with initialSections
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [editingSection, setEditingSection] = useState<ClassSection | null>(null);
  const [renamedSectionName, setRenamedSectionName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ClassSection | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // No longer loading initially as data comes from parent

  // No longer fetching sections on component mount, data is passed as prop
  useEffect(() => {
    setSections(initialSections); // Update sections if initialSections prop changes
  }, [initialSections]);

  // Handle creating a new section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newSectionName || newSectionName.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(newSectionName)) {
      setError('Section name must be alphanumeric and max 25 characters.');
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSectionName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create section');
      }
      const data = await response.json();
      // Optimistic update for UI, then refresh to revalidate server state
      setSections([...sections, data.section]);
      setNewSectionName('');
      router.refresh(); // Revalidate data in the Server Component
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Handle renaming a section
  const handleRenameSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!editingSection) return;

    if (!renamedSectionName || renamedSectionName.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(renamedSectionName)) {
      setError('Section name must be alphanumeric and max 25 characters.');
      return;
    }

    try {
      const response = await fetch(`/api/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renamedSectionName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to rename section');
      }
      const data = await response.json();
      setSections(sections.map(s => (s.id === editingSection.id ? data.section : s)));
      setEditingSection(null);
      setRenamedSectionName('');
      router.refresh(); // Revalidate data in the Server Component
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Handle deleting a section
  const handleDeleteSection = async (sectionToDelete: ClassSection) => {
    setError(null);
    try {
      const response = await fetch(`/api/sections/${sectionToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete section');
      }
      setSections(sections.filter(s => s.id !== sectionToDelete.id));
      setShowDeleteConfirm(null);
      router.refresh(); // Revalidate data in the Server Component
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <div>Loading sections...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Sections for Class: {classId}</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Create Section Form */}
      <form onSubmit={handleCreateSection} className="mb-6">
        <input
          type="text"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          placeholder="New section name"
          className="border p-2 mr-2"
          maxLength={25}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Section
        </button>
      </form>

      {/* List of Sections */}
      <ul>
        {sections.map((s) => (
          <li key={s.id} className="mb-2 flex items-center justify-between">
            {editingSection?.id === s.id ? (
              <form onSubmit={handleRenameSection}>
                <input
                  type="text"
                  value={renamedSectionName}
                  onChange={(e) => setRenamedSectionName(e.target.value)}
                  className="border p-2"
                  maxLength={25}
                  required
                />
                <button type="submit" className="bg-green-500 text-white p-2 ml-2 rounded">Save</button>
                <button type="button" onClick={() => setEditingSection(null)} className="bg-gray-500 text-white p-2 ml-2 rounded">Cancel</button>
              </form>
            ) : (
              <>
                <span>{s.name}</span>
                <div>
                  <button
                    onClick={() => { setEditingSection(s); setRenamedSectionName(s.name); }}
                    className="bg-yellow-500 text-white p-2 mr-2 rounded"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(s)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div role="dialog" aria-labelledby="confirm-deletion-title" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 id="confirm-deletion-title" className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete the section "{showDeleteConfirm.name}"? All associated content will be deleted.</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="bg-gray-500 text-white p-2 mr-2 rounded">Cancel</button>
              <button onClick={() => handleDeleteSection(showDeleteConfirm)} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
