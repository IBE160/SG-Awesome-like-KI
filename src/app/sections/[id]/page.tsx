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
  const [sectionName, setSectionName] = useState<string>(''); // Declare sectionName state

  useEffect(() => {
    if (sectionId) {
      const fetchSectionContent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/sections/${sectionId}/documents`);
          const sectionResponse = await fetch(`/api/sections/${sectionId}`); // Fetch section details

          if (response.ok && sectionResponse.ok) {
            const data = await response.json();
            const sectionData = await sectionResponse.json();
            setStudyMaterials(data.studyMaterials || []);
            setSectionName(sectionData.section.name || `ID: ${sectionId}`); // Set section name
          } else {
            const errorData = await response.json();
            console.error('API Error Response:', errorData); // Log the full errorData
            throw new Error(errorData.error || response.statusText || 'Failed to fetch section content.');
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
      title={`Content for Section: ${sectionName}`} // Use sectionName here
      description="Documents and generated content organized within this section."
    />
  );
}
