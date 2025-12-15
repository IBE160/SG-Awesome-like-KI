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

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this entire material and all its generated content?')) {
      return;
    }
    try {
      const response = await fetch(`/api/unorganized/${materialId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete material');
      }
      setItems(prevItems => prevItems.filter(item => item.id !== materialId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteGeneratedContent = async (materialId: string, contentId: string) => {
    if (!confirm('Are you sure you want to delete this generated content?')) {
      return;
    }
    try {
      const response = await fetch(`/api/generated-content/${contentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete generated content');
      }
      setItems(prevItems => prevItems.map(material => 
        material.id === materialId
          ? { ...material, generated_content: material.generated_content.filter(content => content.id !== contentId) }
          : material
      ));
    } catch (err) {
      setError((err as Error).message);
    }
  };


  if (loading) return <p>Loading content...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (items.length === 0) return <p>No unorganized content found.</p>;

  return (
    <div className="space-y-6">
      {items.map((material) => (
        <div key={material.id} className="p-4 border rounded-lg bg-white shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">
              From: {material.original_name}
            </h3>
            <button
              onClick={() => handleDeleteMaterial(material.id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Delete File
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Uploaded on: {new Date(material.created_at).toLocaleDateString()}
          </p>
          <div className="space-y-3 pl-4 border-l-2">
            {material.generated_content.map((content) => (
              <div key={content.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold capitalize text-gray-700">{content.type}</p>
                  {content.type === 'summary' && content.content.summary && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="text-sm text-gray-600 whitespace-normal break-words">Summary: {content.content.summary}</p>
                      <Link href={`/summary-view/${content.id}`} passHref>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mt-2 sm:mt-0 ml-0 sm:ml-2">
                          Read Summary
                        </button>
                      </Link>
                    </div>
                  )}
                  {content.type === 'quiz' && content.content.quiz && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="text-sm text-gray-600">
                        Quiz: {content.content.quiz.length} questions
                        {content.content.message && ` (${content.content.message})`}
                      </p>
                      <Link href={`/quiz-take/${content.id}`} passHref>
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mt-2 sm:mt-0 ml-0 sm:ml-2">
                          Start Quiz
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteGeneratedContent(material.id, content.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex-shrink-0 ml-4"
                >
                  Delete
                </button>
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