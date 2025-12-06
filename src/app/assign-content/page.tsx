// src/app/assign-content/page.tsx
'use client';

import React from 'react';
import { ContentAssignmentUI } from '@/components/ContentAssignmentUI';

export default function AssignContentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <ContentAssignmentUI />
    </div>
  );
}
