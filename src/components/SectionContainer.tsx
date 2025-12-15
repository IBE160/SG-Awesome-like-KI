// src/components/SectionContainer.tsx
import Link from 'next/link';

interface SectionContainerProps {
  section: {
    id: string;
    name: string;
    class_id: string;
  };
}

export function SectionContainer({ section }: SectionContainerProps) {
  return (
    <Link href={`/sections/${section.id}`} className="block">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{section.name}</h3>
      </div>
    </Link>
  );
}
