import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sectionId = params.id;
    console.log('GET /api/sections/[id]/documents - User ID:', user.id);
    console.log('GET /api/sections/[id]/documents - Section ID:', sectionId);

    // Verify ownership of the section (and implicitly the class)
    const { data: targetSection, error: sectionError } = await supabase
      .from('class_sections')
      .select(`
        id,
        class_id,
        classes (
          user_id
        )
      `)
      .eq('id', sectionId)
      .single();

    console.log('GET /api/sections/[id]/documents - Supabase targetSection:', targetSection);
    console.log('GET /api/sections/[id]/documents - Supabase sectionError:', sectionError);

    const isOwner = targetSection?.classes?.user_id === user.id;

    console.log('GET /api/sections/[id]/documents - user.id:', `"${user.id}"`, ' (typeof: ', typeof user.id, ')');
    console.log('GET /api/sections/[id]/documents - targetSection.classes?.user_id:', `"${targetSection?.classes?.user_id}"`, ' (typeof: ', typeof targetSection?.classes?.user_id, ')');
    console.log('GET /api/sections/[id]/documents - isOwner (targetSection.classes?.user_id === user.id):', isOwner);

    if (sectionError || !targetSection || !isOwner) {
      console.error('Error fetching target section or unauthorized (GET /api/sections/[id]/documents):', sectionError);
      return NextResponse.json({ error: sectionError?.message || 'Target section not found or unauthorized.' }, { status: 404 });
    }

    // Retrieve study materials and their associated generated content for the section
    const { data: studyMaterials, error: studyMaterialsError } = await supabase
      .from('study_materials')
      .select(`
        id,
        original_name,
        file_type,
        file_size,
        created_at,
        extracted_text,
        generated_content (
          id,
          type,
          content
        )
      `)
      .eq('class_section_id', sectionId)
      .eq('user_id', user.id);

    if (studyMaterialsError) {
      console.error('Error fetching study materials for section:', studyMaterialsError);
      return NextResponse.json({ error: studyMaterialsError.message || 'Failed to retrieve study materials for section.' }, { status: 500 });
    }

    return NextResponse.json({ studyMaterials }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/sections/[id]/documents:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
