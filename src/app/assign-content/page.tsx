import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ContentAssignmentUI } from '@/components/ContentAssignmentUI';

export default async function AssignContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all study materials for the user that are unassigned
  const { data: studyMaterials, error: materialsError } = await supabase
    .from("study_materials")
    .select("*")
    .eq("user_id", user.id)
    .is("class_id", null)
    .is("class_section_id", null);

  // Fetch all classes for the user
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("*")
    .eq("user_id", user.id);

  if (materialsError || classesError) {
    console.error("Error fetching data for assign content:", materialsError || classesError);
    return <div className="text-center py-8 text-red-600">Error: Failed to load content assignment data.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <ContentAssignmentUI
        initialStudyMaterials={studyMaterials || []}
        initialClasses={classes || []}
      />
    </div>
  );
}
