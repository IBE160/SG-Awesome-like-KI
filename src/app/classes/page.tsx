// src/app/classes/page.tsx
'use client';

import { ClassManagementUI } from '@/components/ClassManagementUI';
import React from 'react';

export default function ClassesPage() {
  return (
    <div className="container mx-auto p-4">
      <ClassManagementUI />
    </div>
  );
}
