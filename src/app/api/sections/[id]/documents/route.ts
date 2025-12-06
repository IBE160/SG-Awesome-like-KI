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

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
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

    const sectionId = params.id;

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

    if (sectionError || !targetSection || targetSection.classes?.[0]?.user_id !== user.id) {
      console.error('Error fetching target section or unauthorized:', sectionError);
      return NextResponse.json({ error: 'Target section not found or unauthorized.' }, { status: 404 });
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
      return NextResponse.json({ error: 'Failed to retrieve study materials for section.' }, { status: 500 });
    }

    return NextResponse.json({ studyMaterials }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/sections/[id]/documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
