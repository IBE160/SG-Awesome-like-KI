// src/app/unorganized-content/page.tsx
'use client';

import React from 'react';
import { UnorganizedContentList } from '@/components/UnorganizedContentList';

export default function UnorganizedContentPage() {
  return (
    <div className="container mx-auto p-4">
      <UnorganizedContentList />
    </div>
  );
}
