// src/app/summary-view/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface SummaryViewPageProps {
  params: {
    id: string; // This will be the generated_content ID
  };
}

export default async function SummaryViewPage({ params }: SummaryViewPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();

  const { data: generatedContent, error: contentError } = await supabase
    .from('generated_content')
    .select('content, type') // Select type as well to verify it's a summary
    .eq('id', id)
    .single();

  if (contentError || !generatedContent) {
    console.error('Error fetching generated content:', contentError?.message || 'Content not found');
    notFound();
  }

  // Ensure the fetched content is actually a summary
  if (generatedContent.type !== 'summary' || !generatedContent.content?.summary) {
    console.error('Fetched content is not a valid summary:', generatedContent);
    notFound();
  }

  const summaryText = generatedContent.content.summary;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Summary</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-800 whitespace-pre-wrap">{summaryText}</p>
      </div>
    </div>
  );
}
