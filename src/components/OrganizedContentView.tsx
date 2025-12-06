// src/components/OrganizedContentView.tsx
'use client';

import React from 'react';

type GeneratedContent = {
  id: string;
  type: string;
  content: any; // jsonb type
};

type StudyMaterial = {
  id: string;
  original_name: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  generated_content: GeneratedContent[]; // Assuming generated_content is an array
};

interface OrganizedContentViewProps {
  studyMaterials: StudyMaterial[];
  title: string;
  description?: string;
}

export const OrganizedContentView: React.FC<OrganizedContentViewProps> = ({ studyMaterials, title, description }) => {
  if (!studyMaterials || studyMaterials.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        <p className="text-gray-500">No study materials assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}

      <div className="space-y-6">
        {studyMaterials.map((material) => (
          <div key={material.id} className="border p-4 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{material.original_name} ({material.file_type})</h3>
            <p className="text-sm text-gray-600 mb-3">Size: {(material.file_size / (1024 * 1024)).toFixed(2)} MB</p>

            {material.extracted_text && (
              <div className="mb-3">
                <h4 className="font-medium text-gray-700">Extracted Text Preview:</h4>
                <p className="text-sm text-gray-800 max-h-24 overflow-y-auto bg-gray-100 p-2 rounded">{material.extracted_text.substring(0, 300)}...</p>
              </div>
            )}

            {material.generated_content && material.generated_content.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Generated Content:</h4>
                <div className="space-y-3">
                  {material.generated_content.map((gc) => (
                    <div key={gc.id} className="bg-white p-3 rounded shadow-sm border border-gray-200">
                      <p className="font-semibold text-gray-800">Type: {gc.type}</p>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-gray-50 p-2 rounded mt-1">
                        {JSON.stringify(gc.content, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(!material.generated_content || material.generated_content.length === 0) && (
              <p className="text-sm text-gray-500 mt-4">No generated content for this document.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};