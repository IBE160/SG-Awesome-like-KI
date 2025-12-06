// src/app/classes/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrganizedContentView } from '@/components/OrganizedContentView';

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.id as string;

  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      const fetchClassContent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/classes/${classId}/documents`);
          if (response.ok) {
            const data = await response.json();
            setStudyMaterials(data.studyMaterials || []);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch class content.');
          }
        } catch (err: any) {
          console.error('Error fetching class content:', err);
          setError(err.message || 'An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchClassContent();
    }
  }, [classId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading class content...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <OrganizedContentView
      studyMaterials={studyMaterials}
      title={`Content for Class: ${classId}`} // You might want to fetch class name for better title
      description="Documents and generated content organized within this class."
    />
  );
}
