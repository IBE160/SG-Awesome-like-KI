import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieOptions = {
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // @ts-ignore
        cookies: cookies,

      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studyMaterialId = params.id;
    const { class_id, class_section_id } = await req.json();

    // Validate class_id and class_section_id
    if (class_id && typeof class_id !== 'string') {
      return NextResponse.json({ error: 'Invalid class_id.' }, { status: 400 });
    }
    if (class_section_id && typeof class_section_id !== 'string') {
      return NextResponse.json({ error: 'Invalid class_section_id.' }, { status: 400 });
    }
    if (class_id === null && class_section_id !== null) {
      return NextResponse.json({ error: 'Cannot assign to a section without a class.' }, { status: 400 });
    }

    // Verify ownership of the study material
    const { data: existingStudyMaterial, error: studyMaterialError } = await supabase
      .from('study_materials')
      .select('id, user_id')
      .eq('id', studyMaterialId)
      .eq('user_id', user.id)
      .single();

    if (studyMaterialError || !existingStudyMaterial) {
      console.error('Error fetching study material or unauthorized:', studyMaterialError);
      return NextResponse.json({ error: 'Study material not found or unauthorized.' }, { status: 404 });
    }

    // Verify ownership of the target class (if class_id is provided)
    if (class_id) {
      const { data: targetClass, error: classError } = await supabase
        .from('classes')
        .select('id, user_id')
        .eq('id', class_id)
        .eq('user_id', user.id)
        .single();

      if (classError || !targetClass) {
        console.error('Error fetching target class or unauthorized:', classError);
        return NextResponse.json({ error: 'Target class not found or unauthorized.' }, { status: 404 });
      }
    }

    // Verify ownership of the target section (if class_section_id is provided)
    if (class_section_id) {
      const { data: targetSection, error: sectionError } = await supabase
        .from('class_sections')
        .select('id, class_id')
        .eq('id', class_section_id)
        .eq('class_id', class_id) // Ensure section belongs to the specified class
        .single();

      if (sectionError || !targetSection) {
        console.error('Error fetching target section or unauthorized:', sectionError);
        return NextResponse.json({ error: 'Target section not found or unauthorized.' }, { status: 404 });
      }
    }

    // Update the study material with new class_id and class_section_id
    const { data: updatedStudyMaterial, error: updateError } = await supabase
      .from('study_materials')
      .update({
        class_id: class_id,
        class_section_id: class_section_id,
      })
      .eq('id', studyMaterialId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating study material:', updateError);
      return NextResponse.json({ error: 'Failed to assign content.' }, { status: 500 });
    }

    return NextResponse.json({ studyMaterial: updatedStudyMaterial }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/study-materials/[id]/assign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
