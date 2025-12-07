import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: studyMaterials, error: studyMaterialsError } = await supabase
      .from('study_materials')
      .select('id, original_name, class_id, class_section_id')
      .eq('user_id', user.id);

    if (studyMaterialsError) {
      console.error('Error fetching study materials:', studyMaterialsError);
      return NextResponse.json({ error: 'Failed to retrieve study materials.' }, { status: 500 });
    }

    return NextResponse.json({ studyMaterials }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/study-materials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
