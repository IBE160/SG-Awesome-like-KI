// src/app/api/generate/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const supabase = await createClient();
  const { type } = params;

  if (type !== 'summary' && type !== 'quiz') {
    return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studyMaterialId } = await req.json();

    if (!studyMaterialId) {
      return NextResponse.json({ error: 'studyMaterialId is required' }, { status: 400 });
    }

    // Verify user owns the study material
    const { data: material, error: materialError } = await supabase
      .from('study_materials')
      .select('id, original_name')
      .eq('id', studyMaterialId)
      .eq('user_id', user.id)
      .single();

    if (materialError || !material) {
      return NextResponse.json({ error: 'Study material not found or not owned by user' }, { status: 404 });
    }

    // Generate mock content
    const mockContent = `This is a generated ${type} for the document "${material.original_name}". It was created at ${new Date().toISOString()}.`;

    const { data: generatedRecord, error: insertError } = await supabase
      .from('generated_content')
      .insert({
        study_material_id: studyMaterialId,
        user_id: user.id,
        type: type,
        content: mockContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error(`Error generating ${type}:`, insertError);
      return NextResponse.json({ error: `Failed to generate ${type}` }, { status: 500 });
    }

    return NextResponse.json({ message: `${type} generated successfully`, data: generatedRecord }, { status: 201 });

  } catch (err) {
    console.error(`Error in POST /api/generate/${type}:`, err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
