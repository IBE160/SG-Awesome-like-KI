// src/components/SectionContainer.tsx
import Link from 'next/link';

interface SectionContainerProps {
  section: {
    id: string;
    name: string;
    class_id: string;
  };
  fileCount: number;
  summaryCount: number;
  quizCount: number;
}

export function SectionContainer({ section, fileCount, summaryCount, quizCount }: SectionContainerProps) {
  return (
    <Link href={`/sections/${section.id}`} className="block">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{section.name}</h3>
        <p className="text-gray-600">Files: {fileCount}</p>
        <p className="text-gray-600">Summaries: {summaryCount}</p>
        <p className="text-gray-600">Quizzes: {quizCount}</p>
      </div>
    </Link>
  );
}
