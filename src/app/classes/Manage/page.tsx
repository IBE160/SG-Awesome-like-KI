// src/app/classes/manage/page.tsx
'use client';

import { ClassManagementUI } from '@/components/ClassManagementUI';
import Link from 'next/link';

export default function ManageClassesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/classes">
          <button className="bg-gray-800 text-white px-4 py-2 rounded">
            &larr; Back to Classes
          </button>
        </Link>
      </div>
      <ClassManagementUI />
    </div>
  );
}