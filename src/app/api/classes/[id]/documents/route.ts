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

    const classId = params.id;

    // Verify ownership of the class
    const { data: targetClass, error: classError } = await supabase
      .from('classes')
      .select('id, user_id')
      .eq('id', classId)
      .eq('user_id', user.id)
      .single();

    if (classError || !targetClass) {
      console.error('Error fetching target class or unauthorized:', classError);
      return NextResponse.json({ error: 'Class not found or unauthorized.' }, { status: 404 });
    }

    // Retrieve study materials and their associated generated content for the class
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
      .eq('class_id', classId)
      .eq('user_id', user.id);

    if (studyMaterialsError) {
      console.error('Error fetching study materials for class:', studyMaterialsError);
      return NextResponse.json({ error: 'Failed to retrieve study materials for class.' }, { status: 500 });
    }

    return NextResponse.json({ studyMaterials }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/classes/[id]/documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
