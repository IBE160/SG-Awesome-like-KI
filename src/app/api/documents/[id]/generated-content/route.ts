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

    const studyMaterialId = params.id;

    // Verify ownership of the study material
    const { data: studyMaterial, error: studyMaterialError } = await supabase
      .from('study_materials')
      .select('id, user_id')
      .eq('id', studyMaterialId)
      .eq('user_id', user.id)
      .single();

    if (studyMaterialError || !studyMaterial) {
      console.error('Error fetching study material or unauthorized:', studyMaterialError);
      return NextResponse.json({ error: 'Study material not found or unauthorized.' }, { status: 404 });
    }

    // Retrieve generated content for the study material
    const { data: generatedContent, error: generatedContentError } = await supabase
      .from('generated_content')
      .select('*')
      .eq('study_material_id', studyMaterialId);

    if (generatedContentError) {
      console.error('Error fetching generated content for study material:', generatedContentError);
      return NextResponse.json({ error: 'Failed to retrieve generated content.' }, { status: 500 });
    }

    return NextResponse.json({ generatedContent }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/documents/[id]/generated-content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
