// src/app/unorganized/page.tsx
import { UnorganizedContentList } from '@/components/UnorganizedContentList';
import Link from 'next/link';

export default function UnorganizedPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Unorganized Content</h1>
        <Link href="/classes">
            <button className="bg-gray-800 text-white px-4 py-2 rounded">
                &larr; Back to Classes
            </button>
        </Link>
      </div>
      <p className="mb-6 text-gray-600">
        This page shows summaries and quizzes generated from documents that have not yet been assigned to a class.
      </p>
      <UnorganizedContentList />
    </div>
  );
}
