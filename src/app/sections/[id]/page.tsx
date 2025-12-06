// src/app/sections/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrganizedContentView } from '@/components/OrganizedContentView';

export default function SectionDetailsPage() {
  const params = useParams();
  const sectionId = params.id as string;

  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId) {
      const fetchSectionContent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/sections/${sectionId}/documents`);
          if (response.ok) {
            const data = await response.json();
            setStudyMaterials(data.studyMaterials || []);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch section content.');
          }
        } catch (err: any) {
          console.error('Error fetching section content:', err);
          setError(err.message || 'An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSectionContent();
    }
  }, [sectionId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading section content...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <OrganizedContentView
      studyMaterials={studyMaterials}
      title={`Content for Section: ${sectionId}`} // You might want to fetch section name for better title
      description="Documents and generated content organized within this section."
    />
  );
}
