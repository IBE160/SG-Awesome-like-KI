import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClassSectionManagementUI } from '@/components/ClassSectionManagementUI';
import React from 'react';

export default async function ClassSectionsPage({ params }: { params: { id: string } }) {
  const classId = params.id;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  if (!classId) {
    // Redirect to classes page if classId is missing
    redirect('/classes');
  }

  // Verify class ownership
  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("id, name, user_id")
    .eq("id", classId)
    .eq("user_id", user.id)
    .single();

  if (classError || !cls) {
    console.error("Error fetching class for sections:", classError);
    redirect('/classes'); // Redirect if class not found or unauthorized
  }

  // Fetch sections for the class
  const { data: sections, error: sectionsError } = await supabase
    .from("class_sections")
    .select("*")
    .eq("class_id", classId);

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    return <div className="text-center py-8 text-red-600">Error: Failed to load sections.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Sections for Class: {cls.name}</h1>
      <ClassSectionManagementUI classId={classId} initialSections={sections || []} />
    </div>
  );
}
