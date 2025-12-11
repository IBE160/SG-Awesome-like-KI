// src/app/sections/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrganizedContentView } from '@/components/OrganizedContentView';

export default function SectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.id as string;

  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string>(''); // Declare sectionName state

  const [showRenameForm, setShowRenameForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId) {
      const fetchSectionContent = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
          const response = await fetch(`/api/sections/${sectionId}/documents`);
          const sectionResponse = await fetch(`/api/sections/${sectionId}`); // Fetch section details

          if (response.ok && sectionResponse.ok) {
            const data = await response.json();
            const sectionData = await sectionResponse.json();
            setStudyMaterials(data.studyMaterials || []);
            setSectionName(sectionData.section.name || `ID: ${sectionId}`); // Set section name
            setNewSectionName(sectionData.section.name || ''); // Initialize rename form with current name
          } else {
            const errorData = await response.json();
            console.error('API Error Response:', errorData); // Log the full errorData
            throw new Error(errorData.error || response.statusText || 'Failed to fetch section content.');
          }
        } catch (err: any) {
          console.error('Error fetching section content:', err);
          setFetchError(err.message || 'An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSectionContent();
    }
  }, [sectionId]);

  const handleRenameSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionLoading(true);

    if (!newSectionName || newSectionName.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(newSectionName)) {
      setActionError('Section name must be alphanumeric and max 25 characters.');
      setActionLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newSectionName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename section');
      }

      setSectionName(data.section.name);
      setShowRenameForm(false);
      router.refresh(); // Revalidate data on the server
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred during rename.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    setActionError(null);
    setActionLoading(true);

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete section');
      }

      router.push(`/classes/${studyMaterials[0]?.class_id || ''}`); // Redirect to class page or classes list
      router.refresh(); // Revalidate data on the server
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred during delete.');
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };


  if (isLoading) {
    return <div className="text-center py-8">Loading section content...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-600">Error: {fetchError}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{sectionName}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRenameForm(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
          >
            Rename Section
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
          >
            Delete Section
          </button>
        </div>
      </div>

      {showRenameForm && (
        <form onSubmit={handleRenameSection} className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Rename Section</h2>
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Enter new section name"
            className="w-full p-2 border border-gray-300 rounded mb-3 text-gray-800"
            maxLength={25}
            disabled={actionLoading}
          />
          {actionError && <p className="text-red-500 text-sm mb-3">{actionError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
              {actionLoading ? 'Renaming...' : 'Rename'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRenameForm(false); setActionError(null); }}
              disabled={actionLoading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showDeleteConfirm && (
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-red-50">
          <h2 className="text-xl font-semibold mb-3 text-red-800">Confirm Delete</h2>
          <p className="mb-3">Are you sure you want to delete the section "{sectionName}"? This action cannot be undone, and all associated content will be unassigned from this section.</p>
          {actionError && <p className="text-red-500 text-sm mb-3">{actionError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSection}
              disabled={actionLoading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            >
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
            <button
              type="button"
              onClick={() => { setShowDeleteConfirm(false); setActionError(null); }}
              disabled={actionLoading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Display study materials and generated content */}
      <OrganizedContentView
        studyMaterials={studyMaterials}
        title={`Content in ${sectionName}`}
        description="Documents and generated content organized within this section."
      />
    </div>
  );
}
