import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UnorganizedContentList } from '@/components/UnorganizedContentList';

export default async function UnorganizedContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch unorganized content for the user
  const { data: unorganizedContent, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("user_id", user.id)
    .is("class_id", null)
    .is("class_section_id", null);

  if (error) {
    console.error("Error fetching unorganized content:", error);
    return <div className="text-center py-8 text-red-600">Error: Failed to load unorganized content.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <UnorganizedContentList initialUnorganizedContent={unorganizedContent || []} />
    </div>
  );
}
