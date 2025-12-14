// src/components/UnorganizedContentList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface GeneratedContent {
  id: string;
  type: 'summary' | 'quiz';
  // content can be an object { summary: string } or { quiz: Array<any>, message?: string }
  content: { summary?: string; quiz?: any; message?: string };
  created_at: string;
}

interface UnorganizedMaterial {
  id: string;
  original_name: string;
  created_at: string;
  generated_content: GeneratedContent[];
}

export const UnorganizedContentList = () => {
  const [items, setItems] = useState<UnorganizedMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/unorganized');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch unorganized content');
        }
        const { data } = await response.json();
        setItems(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <p>Loading content...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (items.length === 0) return <p>No unorganized content found.</p>;

  return (
    <div className="space-y-6">
      {items.map((material) => (
        <div key={material.id} className="p-4 border rounded-lg bg-white shadow">
          <h3 className="font-bold text-lg text-gray-800">
            From: {material.original_name}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Uploaded on: {new Date(material.created_at).toLocaleDateString()}
          </p>
          <div className="space-y-3 pl-4 border-l-2">
            {material.generated_content.map((content) => (
              <div key={content.id} className="p-3 bg-gray-50 rounded-md">
                <p className="font-semibold capitalize text-gray-700">{content.type}</p>
                {content.type === 'summary' && content.content.summary && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-600 truncate">Summary: {content.content.summary}</p>
                    <Link href={`/summary-view/${content.id}`} passHref>
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mt-2 sm:mt-0">
                        Read Summary
                      </button>
                    </Link>
                  </div>
                )}
                {content.type === 'quiz' && content.content.quiz && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-600">
                      Quiz: {content.content.quiz.length} questions
                      {content.content.message && ` (${content.content.message})`}
                    </p>
                    <Link href={`/quiz-take/${content.id}`} passHref>
                      <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mt-2 sm:mt-0">
                        Start Quiz
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
           <div className="mt-4 text-right">
             <Link href="/assign-content">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  Assign to Class
                </button>
            </Link>
           </div>
        </div>
      ))}
    </div>
  );
};