// src/components/OrganizedContentView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { StudyMaterialCard } from './StudyMaterialCard'; // Import the new component

type GeneratedContent = {
  id: string;
  type: string;
  content: any; // jsonb type
  created_at?: string; // Add this as it's used in StudyMaterialCard
};

type StudyMaterial = {
  id: string;
  original_name: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  generated_content: GeneratedContent[]; // Assuming generated_content is an array
  created_at: string; // Add this as it's used in StudyMaterialCard
  class_id: string | null; // Add this
  class_section_id: string | null; // Add this
};

interface OrganizedContentViewProps {
  studyMaterials: StudyMaterial[];
  title: string;
  description?: string;
  onMaterialMoved?: () => void; // Callback to notify parent a material was moved
}

export const OrganizedContentView: React.FC<OrganizedContentViewProps> = ({ studyMaterials: initialStudyMaterials, title, description, onMaterialMoved }) => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(initialStudyMaterials);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStudyMaterials(initialStudyMaterials);
  }, [initialStudyMaterials]);

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this entire material and all its generated content?')) {
      return;
    }
    try {
      const response = await fetch(`/api/unorganized/${materialId}`, { // Reusing unorganized API for now
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete material');
      }
      setStudyMaterials(prevMaterials => prevMaterials.filter(material => material.id !== materialId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteGeneratedContent = async (materialId: string, contentId: string) => {
    if (!confirm('Are you sure you want to delete this generated content?')) {
      return;
    }
    try {
      const response = await fetch(`/api/generated-content/${contentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete generated content');
      }
      setStudyMaterials(prevMaterials => prevMaterials.map(material => 
        material.id === materialId
          ? { ...material, generated_content: material.generated_content.filter(content => content.id !== contentId) }
          : material
      ));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleMoveMaterial = async (
    materialId: string,
    targetClassId: string | null,
    targetSectionId: string | null
  ) => {
    try {
      const response = await fetch(`/api/study-materials/${materialId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetClassId, targetSectionId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to move material');
      }

      // If moved, remove from current view
      setStudyMaterials(prevMaterials => prevMaterials.filter(material => material.id !== materialId));
      
      // Notify parent component that a material was moved (e.g., to trigger a refresh)
      if (onMaterialMoved) {
        onMaterialMoved();
      }

    } catch (err) {
      setError((err as Error).message);
      throw err; // Re-throw to allow StudyMaterialCard to catch and display error
    }
  };


  if (!studyMaterials || studyMaterials.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        <p className="text-gray-500">No study materials assigned yet.</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="space-y-6">
        {studyMaterials.map((material) => (
          <StudyMaterialCard
            key={material.id}
            material={material}
            onDeleteMaterial={handleDeleteMaterial}
            onDeleteGeneratedContent={handleDeleteGeneratedContent}
            onMoveMaterial={handleMoveMaterial} // Pass the new handler
          />
        ))}
      </div>
    </div>
  );
};