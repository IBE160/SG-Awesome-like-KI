// src/app/classes/[id]/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrganizedContentView } from '@/components/OrganizedContentView';
import { ClassActions } from '@/components/ClassActions';

export default async function ClassDetailsPage({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const classId = resolvedParams.id as string;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    redirect('/login');
  }

  // Check class ownership
  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("id, user_id, name")
    .eq("id", classId)
    .eq("user_id", user.id)
    .single();

  if (classError || !cls) {
    console.error("Error fetching class details:", classError);
    // Redirect to classes page if class not found or unauthorized
    redirect('/classes');
  }

  const { data: studyMaterials, error: docError } = await supabase
    .from("study_materials")
    .select("*")
    .eq("class_id", classId)
    .eq("user_id", user.id); // Ensure user can only see their own materials

  if (docError) {
    console.error("Error fetching class content:", docError);
    return <div className="text-center py-8 text-red-600">Error: Failed to load class content.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{cls.name}</h1>
        <ClassActions classId={classId} initialClassName={cls.name} />
      </div>
      <OrganizedContentView
        studyMaterials={studyMaterials || []}
        title={`Content for Class: ${cls.name}`}
        description="Documents and generated content organized within this class."
      />
    </div>
  );
}
