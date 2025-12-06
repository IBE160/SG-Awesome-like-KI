// src/app/classes/[id]/sections/page.tsx
'use client';

import { ClassSectionManagementUI } from '@/components/ClassSectionManagementUI';
import React from 'react';

export default function ClassSectionsPage({ params }: { params: { id: string } }) {
  const classId = params.id;

  if (!classId) {
    return <div className="p-4 text-red-500">Error: Class ID not found in URL.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Class Sections</h1>
      <ClassSectionManagementUI classId={classId} />
    </div>
  );
}
